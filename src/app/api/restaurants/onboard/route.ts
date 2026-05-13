/**
 * Restaurant Stripe Connect onboarding.
 *
 * Creates or reuses a connected account for a restaurant partner and returns a
 * Stripe-hosted onboarding link. Restaurant discovery can continue using
 * Yelp/Foursquare until a restaurant has a linked Connect account.
 *
 * @file src/app/api/restaurants/onboard/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import type { NextRequest } from "next/server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RestaurantOnboardBody {
  restaurantId?: unknown;
  name?: unknown;
  email?: unknown;
  businessType?: unknown;
  externalProvider?: unknown;
  externalId?: unknown;
  menuUrl?: unknown;
}

interface RestaurantRow {
  id: string;
  owner_user_id: string | null;
  name: string;
  email: string | null;
  external_provider: string | null;
  external_id: string | null;
  menu_url: string | null;
  stripe_connect_account_id: string | null;
  onboarding_status: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function appUrlFrom(request: Request): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.AUTH_URL ||
    process.env.VERCEL_URL;

  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }

  return new URL(request.url).origin;
}

function restaurantIdFrom(value: unknown): string {
  const requested = text(value);
  if (requested) return requested;
  return `rest_${crypto.randomUUID()}`;
}

function businessType(value: unknown): Stripe.AccountCreateParams.BusinessType {
  const requested = text(value);
  if (
    requested === "company" ||
    requested === "individual" ||
    requested === "non_profit" ||
    requested === "government_entity"
  ) {
    return requested;
  }
  return "company";
}

async function getRestaurant(id: string): Promise<RestaurantRow | null> {
  const result = await executeQuery<RestaurantRow>(
    `SELECT id, owner_user_id, name, email, external_provider, external_id,
            menu_url, stripe_connect_account_id, onboarding_status,
            charges_enabled, payouts_enabled, details_submitted
     FROM restaurants
     WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

async function upsertRestaurant(input: {
  id: string;
  ownerUserId: string;
  name: string;
  email: string;
  externalProvider?: string | null;
  externalId?: string | null;
  menuUrl?: string | null;
  stripeConnectAccountId: string;
  controller?: Stripe.Account.Controller;
  account: Stripe.Account;
}): Promise<RestaurantRow> {
  const onboardingStatus =
    input.account.charges_enabled && input.account.payouts_enabled
      ? "active"
      : input.account.details_submitted
        ? "submitted"
        : "pending";

  const result = await executeQuery<RestaurantRow>(
    `INSERT INTO restaurants (
       id, owner_user_id, name, email, external_provider, external_id, menu_url,
       stripe_connect_account_id, stripe_account_controller, onboarding_status,
       charges_enabled, payouts_enabled, details_submitted, metadata
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12, $13, $14::jsonb
     )
     ON CONFLICT (id) DO UPDATE SET
       owner_user_id = COALESCE(restaurants.owner_user_id, EXCLUDED.owner_user_id),
       name = EXCLUDED.name,
       email = EXCLUDED.email,
       external_provider = COALESCE(EXCLUDED.external_provider, restaurants.external_provider),
       external_id = COALESCE(EXCLUDED.external_id, restaurants.external_id),
       menu_url = COALESCE(EXCLUDED.menu_url, restaurants.menu_url),
       stripe_connect_account_id = EXCLUDED.stripe_connect_account_id,
       stripe_account_controller = EXCLUDED.stripe_account_controller,
       onboarding_status = EXCLUDED.onboarding_status,
       charges_enabled = EXCLUDED.charges_enabled,
       payouts_enabled = EXCLUDED.payouts_enabled,
       details_submitted = EXCLUDED.details_submitted,
       metadata = restaurants.metadata || EXCLUDED.metadata,
       updated_at = NOW()
     RETURNING id, owner_user_id, name, email, external_provider, external_id,
               menu_url, stripe_connect_account_id, onboarding_status,
               charges_enabled, payouts_enabled, details_submitted`,
    [
      input.id,
      input.ownerUserId,
      input.name,
      input.email,
      input.externalProvider ?? null,
      input.externalId ?? null,
      input.menuUrl ?? null,
      input.stripeConnectAccountId,
      JSON.stringify(input.controller ?? {}),
      onboardingStatus,
      input.account.charges_enabled,
      input.account.payouts_enabled,
      input.account.details_submitted,
      JSON.stringify({
        accountRequirements: input.account.requirements ?? null,
        futureRequirements: input.account.future_requirements ?? null,
      }),
    ],
  );
  return result.rows[0];
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RestaurantOnboardBody;
  try {
    body = (await request.json()) as RestaurantOnboardBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const restaurantId = restaurantIdFrom(body.restaurantId);
  const name = text(body.name);
  const email = text(body.email) || session.user.email;
  const externalProvider = text(body.externalProvider) || null;
  const externalId = text(body.externalId) || null;
  const menuUrl = text(body.menuUrl) || null;

  if (!name) {
    return NextResponse.json(
      { error: "Restaurant name is required" },
      { status: 400 },
    );
  }

  try {
    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();
    const existing = await getRestaurant(restaurantId);

    let account: Stripe.Account;
    if (existing?.stripe_connect_account_id) {
      account = await stripe.accounts.retrieve(existing.stripe_connect_account_id);
    } else {
      const controller: Stripe.AccountCreateParams.Controller = {
        losses: { payments: "application" },
        fees: { payer: "application" },
        requirement_collection: "stripe",
        stripe_dashboard: { type: "express" },
      };

      account = await stripe.accounts.create(
        {
          country: process.env.STRIPE_RESTAURANT_CONNECT_COUNTRY || "US",
          email,
          business_type: businessType(body.businessType),
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          controller,
          metadata: {
            restaurantId,
            ownerUserId: session.user.id,
            source: "alchm_restaurant_onboarding",
          },
        },
        { idempotencyKey: `restaurant_connect_account_${restaurantId}` },
      );
    }

    const restaurant = await upsertRestaurant({
      id: restaurantId,
      ownerUserId: session.user.id,
      name,
      email,
      externalProvider,
      externalId,
      menuUrl,
      stripeConnectAccountId: account.id,
      controller: account.controller,
      account,
    });

    const appUrl = appUrlFrom(request);
    const returnUrl = new URL("/restaurants", appUrl);
    returnUrl.searchParams.set("onboarding", "success");
    returnUrl.searchParams.set("restaurant_id", restaurantId);

    const refreshUrl = new URL("/restaurants", appUrl);
    refreshUrl.searchParams.set("onboarding", "refresh");
    refreshUrl.searchParams.set("restaurant_id", restaurantId);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl.toString(),
      return_url: returnUrl.toString(),
      type: "account_onboarding",
    });

    return NextResponse.json({
      success: true,
      onboardingUrl: accountLink.url,
      accountId: account.id,
      restaurant,
    });
  } catch (error) {
    console.error("[api/restaurants/onboard] Error:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant onboarding link" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");
  if (!restaurantId) {
    return NextResponse.json(
      { error: "restaurantId is required" },
      { status: 400 },
    );
  }

  try {
    const restaurant = await getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    if (
      restaurant.owner_user_id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error("[api/restaurants/onboard] Status error:", error);
    return NextResponse.json(
      { error: "Failed to load restaurant onboarding status" },
      { status: 500 },
    );
  }
}
