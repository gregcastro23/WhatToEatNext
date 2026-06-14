/**
 * Stripe Restaurant Ordering Handoff
 *
 * Creates a tracked restaurant order intent. If a concrete order total exists,
 * the route creates a Stripe Checkout Session and prepares Connect split data.
 * If the app only has marketplace/provider links, it records the handoff and
 * returns the external URL instead of pretending there is an order to charge.
 *
 * @file src/app/api/stripe/restaurant-order/route.ts
 */

import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  esmsRestaurantCentsPerToken,
  esmsRestaurantPaymentsEnabled,
  quoteEsmsBasket,
} from "@/lib/payments/restaurantEsms";
import {
  normalizeRestaurantPaymentPreference,
  restaurantCryptoPaymentsEnabled,
  stripePaymentMethodTypes,
} from "@/lib/payments/restaurantPayments";
import type { RestaurantDiscoverySource } from "@/types/yelp";

type SplitMode =
  | "external"
  | "destination_charge"
  | "separate_charges_and_transfers";

interface RestaurantOrderBody {
  cuisineType?: unknown;
  provider?: unknown;
  restaurant?: {
    id?: unknown;
    name?: unknown;
    url?: unknown;
    stripeConnectedAccountId?: unknown;
  };
  order?: {
    amountCents?: unknown;
    currency?: unknown;
    description?: unknown;
    items?: unknown;
    splitMode?: unknown;
    orderType?: unknown;
    customer?: unknown;
    deliveryAddress?: unknown;
    specialInstructions?: unknown;
    preparationTime?: unknown;
    paymentMethod?: unknown;
  };
}

interface NormalizedLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

interface FulfillmentAddress {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

type OrderType = "pickup" | "delivery";

const MAX_METADATA_VALUE_LENGTH = 500;
const MAX_LINE_ITEMS = 50;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function metadataValue(value: string | number): string {
  return String(value).slice(0, MAX_METADATA_VALUE_LENGTH);
}

function orderIdFromRequest(
  request: Request,
  userId: string | null,
): string {
  const key = text(request.headers.get("idempotency-key"));
  if (userId && /^[A-Za-z0-9:_-]{8,120}$/.test(key)) {
    return createHash("sha256")
      .update(`${userId}:${key}`)
      .digest("hex")
      .slice(0, 32);
  }
  return randomUUID();
}

function cents(value: unknown): number | null {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(amount) || amount <= 0) return null;
  return amount;
}

function currency(value: unknown): string {
  const raw = text(value).toLowerCase();
  return /^[a-z]{3}$/.test(raw) ? raw : "usd";
}

function intFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) ? value : fallback;
}

function numberFrom(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeOrderType(value: unknown): OrderType {
  return text(value) === "delivery" ? "delivery" : "pickup";
}

function normalizeCustomerInfo(
  value: unknown,
  fallback: { name?: string | null; email?: string | null },
): CustomerInfo {
  const raw = record(value);
  return {
    name: text(raw?.name) || fallback.name || fallback.email || "Guest",
    phone: text(raw?.phone) || undefined,
    email: text(raw?.email) || fallback.email || undefined,
  };
}

function normalizeAddress(value: unknown): FulfillmentAddress | null {
  const raw = record(value);
  if (!raw) return null;

  const street = text(raw.street ?? raw.address1 ?? raw.line1);
  const city = text(raw.city);
  const postalCode = text(raw.postalCode ?? raw.postal_code ?? raw.zip);
  const country = text(raw.country) || "US";

  if (!street || !city || !postalCode) return null;

  return {
    street,
    city,
    state: text(raw.state) || undefined,
    postalCode,
    country,
    latitude: numberFrom(raw.latitude),
    longitude: numberFrom(raw.longitude),
  };
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

function parseLineItems(items: unknown): NormalizedLineItem[] {
  if (!Array.isArray(items)) return [];

  return items.slice(0, MAX_LINE_ITEMS).flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    const name = text(record.name) || `Item ${index + 1}`;
    const unitPriceCents = cents(record.unitPriceCents);
    const rawQuantity = Number(record.quantity ?? 1);
    const quantity = Number.isInteger(rawQuantity)
      ? Math.min(Math.max(rawQuantity, 1), 99)
      : 1;

    if (!unitPriceCents) return [];

    return [
      {
        id: text(record.id) || `item_${index + 1}`,
        name,
        quantity,
        unitPriceCents,
        totalCents: unitPriceCents * quantity,
      },
    ];
  });
}

function resolveSplitMode(value: unknown, connectedAccountId: string): SplitMode {
  if (!connectedAccountId) return "external";

  const requested = text(value);
  if (
    requested === "destination_charge" ||
    requested === "separate_charges_and_transfers"
  ) {
    return requested;
  }

  const configured = process.env.STRIPE_RESTAURANT_SPLIT_MODE;
  if (
    configured === "destination_charge" ||
    configured === "separate_charges_and_transfers"
  ) {
    return configured;
  }

  return "separate_charges_and_transfers";
}

async function recordOrderIntent(input: {
  id: string;
  userId: string | null;
  cuisineType: string;
  provider: string;
  restaurantId: string;
  restaurantName: string;
  restaurantUrl: string;
  stripeCheckoutSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  stripeConnectedAccountId?: string | null;
  splitMode: SplitMode;
  currency: string;
  subtotalCents: number;
  platformFeeCents: number;
  transferAmountCents: number;
  totalCents: number;
  orderType: OrderType;
  customerInfo: CustomerInfo;
  deliveryAddress?: FulfillmentAddress | null;
  status: string;
  lineItems: NormalizedLineItem[];
  partnerSystem?: string | null;
  partnerOrderId?: string | null;
  partnerStatus?: string | null;
  metadata?: Record<string, unknown>;
  userAgent?: string | null;
}): Promise<boolean> {
  try {
    const { executeQuery } = await import("@/lib/database/connection");
    await executeQuery(
      `INSERT INTO restaurant_order_intents (
         id, user_id, cuisine_type, provider, restaurant_id, restaurant_name,
         restaurant_url, stripe_checkout_session_id, stripe_payment_intent_id,
         stripe_connected_account_id, split_mode, currency, subtotal_cents,
         platform_fee_cents, transfer_amount_cents, total_cents, order_type,
         customer_info, delivery_address, status, line_items, partner_system,
         partner_order_id, partner_status, metadata, user_agent
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
         $11, $12, $13, $14, $15, $16, $17, $18::jsonb, $19::jsonb,
         $20, $21::jsonb, $22, $23, $24, $25::jsonb, $26
       )
       ON CONFLICT (id) DO UPDATE SET
         stripe_checkout_session_id = EXCLUDED.stripe_checkout_session_id,
         stripe_payment_intent_id = EXCLUDED.stripe_payment_intent_id,
         order_type = EXCLUDED.order_type,
         customer_info = EXCLUDED.customer_info,
         delivery_address = EXCLUDED.delivery_address,
         partner_system = COALESCE(EXCLUDED.partner_system, restaurant_order_intents.partner_system),
         partner_order_id = COALESCE(EXCLUDED.partner_order_id, restaurant_order_intents.partner_order_id),
         partner_status = COALESCE(EXCLUDED.partner_status, restaurant_order_intents.partner_status),
         status = EXCLUDED.status,
         metadata = restaurant_order_intents.metadata || EXCLUDED.metadata,
         updated_at = NOW()`,
      [
        input.id,
        input.userId,
        input.cuisineType,
        input.provider,
        input.restaurantId,
        input.restaurantName,
        input.restaurantUrl,
        input.stripeCheckoutSessionId ?? null,
        input.stripePaymentIntentId ?? null,
        input.stripeConnectedAccountId ?? null,
        input.splitMode,
        input.currency,
        input.subtotalCents,
        input.platformFeeCents,
        input.transferAmountCents,
        input.totalCents,
        input.orderType,
        JSON.stringify(input.customerInfo),
        JSON.stringify(input.deliveryAddress ?? null),
        input.status,
        JSON.stringify(input.lineItems),
        input.partnerSystem ?? null,
        input.partnerOrderId ?? null,
        input.partnerStatus ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.userAgent ?? null,
      ],
    );
    return true;
  } catch (error) {
    console.warn(
      "[api/stripe/restaurant-order] Order intent was not persisted:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

async function updateEsmsOrderSettlement(input: {
  orderId: string;
  status: string;
  transferId?: string | null;
  transferStatus: string;
  paymentStatus: string;
  completed?: boolean;
  metadata?: Record<string, unknown>;
}) {
  const { executeQuery } = await import("@/lib/database/connection");
  await executeQuery(
    `UPDATE restaurant_order_intents
     SET status = $2,
         stripe_transfer_id = COALESCE($3, stripe_transfer_id),
         transfer_status = $4,
         payment_status = $5,
         metadata = metadata || $6::jsonb,
         completed_at = CASE WHEN $7 THEN NOW() ELSE completed_at END,
         updated_at = NOW()
     WHERE id = $1`,
    [
      input.orderId,
      input.status,
      input.transferId ?? null,
      input.transferStatus,
      input.paymentStatus,
      JSON.stringify(input.metadata ?? {}),
      input.completed === true,
    ],
  );
}

async function findPartnerRouting(input: {
  restaurantId: string;
  provider: string;
}): Promise<{
  id: string;
  stripeConnectAccountId: string | null;
} | null> {
  try {
    const { executeQuery } = await import("@/lib/database/connection");
    const result = await executeQuery<{
      id: string;
      stripe_connect_account_id: string | null;
    }>(
      `SELECT id, stripe_connect_account_id
       FROM restaurants
       WHERE id = $1
          OR (external_provider = $2 AND external_id = $1)
       ORDER BY updated_at DESC
       LIMIT 1`,
      [input.restaurantId, input.provider || null],
    );
    const row = result.rows[0];
    return row
      ? {
          id: row.id,
          stripeConnectAccountId: row.stripe_connect_account_id,
        }
      : null;
  } catch {
    return null;
  }
}

function externalOrderFallback(input: {
  url: string;
  reason: string;
  orderId: string;
  status?: number;
}) {
  return NextResponse.json(
    {
      mode: "external",
      url: input.url,
      orderId: input.orderId,
      reason: input.reason,
    },
    { status: input.status ?? 200 },
  );
}

export async function POST(request: Request) {
  let body: RestaurantOrderBody;
  try {
    body = (await request.json()) as RestaurantOrderBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const restaurant = body.restaurant ?? {};
  const restaurantId = text(restaurant.id);
  const restaurantName = text(restaurant.name);
  const restaurantUrl = text(restaurant.url);
  const connectedAccountIdFromBody = text(restaurant.stripeConnectedAccountId);
  const cuisineType = text(body.cuisineType) || "Restaurant";
  const provider = text(body.provider) as RestaurantDiscoverySource | "";
  const orderCurrency = currency(body.order?.currency);
  const paymentPreference = normalizeRestaurantPaymentPreference(
    body.order?.paymentMethod,
  );
  const orderDescription = text(body.order?.description);
  const lineItems = parseLineItems(body.order?.items);
  const itemSubtotalCents = lineItems.reduce(
    (sum, item) => sum + item.totalCents,
    0,
  );
  const explicitAmountCents = cents(body.order?.amountCents);
  const subtotalCents = itemSubtotalCents || explicitAmountCents || 0;
  const platformFeeBps = Math.min(
    Math.max(intFromEnv("STRIPE_RESTAURANT_PLATFORM_FEE_BPS", 0), 0),
    10000,
  );
  const platformFeeCents = Math.floor((subtotalCents * platformFeeBps) / 10000);
  const userAgent = request.headers.get("user-agent");
  const session = await auth().catch(() => null);
  const orderId = orderIdFromRequest(request, session?.user?.id ?? null);

  if (!restaurantId || !restaurantName || !restaurantUrl) {
    return NextResponse.json(
      { error: "restaurant.id, restaurant.name, and restaurant.url are required" },
      { status: 400 },
    );
  }

  if (platformFeeCents >= subtotalCents && subtotalCents > 0) {
    return NextResponse.json(
      { error: "Configured restaurant platform fee must be less than the order total" },
      { status: 400 },
    );
  }

  if (paymentPreference === "crypto") {
    if (!restaurantCryptoPaymentsEnabled()) {
      return NextResponse.json(
        {
          error: "USDC checkout is not enabled for this deployment.",
          code: "crypto_payments_unavailable",
        },
        { status: 503 },
      );
    }

    if (orderCurrency !== "usd") {
      return NextResponse.json(
        { error: "Stripe stablecoin checkout requires USD-priced line items." },
        { status: 400 },
      );
    }
  }

  if (paymentPreference === "esms" && !esmsRestaurantPaymentsEnabled()) {
    return NextResponse.json(
      {
        error: "ESMS restaurant payments are not enabled for this deployment.",
        code: "esms_payments_unavailable",
      },
      { status: 503 },
    );
  }

  let parsedRestaurantUrl: URL;
  try {
    parsedRestaurantUrl = new URL(restaurantUrl);
  } catch {
    return NextResponse.json(
      { error: "restaurant.url must be an absolute URL" },
      { status: 400 },
    );
  }

  const partnerRouting = await findPartnerRouting({
    restaurantId,
    provider,
  });
  const connectedAccountId =
    connectedAccountIdFromBody || partnerRouting?.stripeConnectAccountId || null;
  const internalRestaurantId = partnerRouting?.id || restaurantId;
  const partnerSystem = provider || "direct";
  const transferAmountCents = Math.max(subtotalCents - platformFeeCents, 0);
  const resolvedSplitMode = resolveSplitMode(
    body.order?.splitMode,
    connectedAccountId ?? "",
  );
  const splitMode =
    connectedAccountId &&
    (paymentPreference === "crypto" || paymentPreference === "esms")
      ? "separate_charges_and_transfers"
      : resolvedSplitMode;

  const orderType = normalizeOrderType(body.order?.orderType);
  const customerInfo = normalizeCustomerInfo(body.order?.customer, {
    name: session?.user?.name,
    email: session?.user?.email,
  });
  const deliveryAddress = normalizeAddress(body.order?.deliveryAddress);

  if (orderType === "delivery" && !deliveryAddress) {
    return NextResponse.json(
      { error: "order.deliveryAddress is required for delivery orders" },
      { status: 400 },
    );
  }

  const baseIntent = {
    id: orderId,
    userId: session?.user?.id ?? null,
    cuisineType,
    provider: provider || "unknown",
    restaurantId: internalRestaurantId,
    restaurantName,
    restaurantUrl: parsedRestaurantUrl.toString(),
    stripeConnectedAccountId: connectedAccountId || null,
    splitMode,
    currency: orderCurrency,
    subtotalCents,
    platformFeeCents,
    transferAmountCents,
    totalCents: subtotalCents,
    orderType,
    customerInfo,
    deliveryAddress,
    lineItems,
    partnerSystem,
    userAgent,
  };

  const orderPriceId = process.env.STRIPE_RESTAURANT_ORDER_PRICE_ID;
  const hasStripeSecret = Boolean(process.env.STRIPE_SECRET_KEY);

  if (paymentPreference === "esms") {
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Sign in before paying with ESMS." },
        { status: 401 },
      );
    }

    if (!connectedAccountId) {
      return NextResponse.json(
        {
          error: "ESMS payments require a Stripe-connected restaurant partner.",
        },
        { status: 409 },
      );
    }

    if (!subtotalCents || !hasStripeSecret || !process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "ESMS settlement requires a priced order, Stripe, and the persistent ledger.",
        },
        { status: 503 },
      );
    }

    const centsPerToken = esmsRestaurantCentsPerToken();
    const esmsCost = quoteEsmsBasket(subtotalCents, centsPerToken);
    if (!esmsCost) {
      return NextResponse.json(
        { error: "The ESMS restaurant redemption rate is not configured." },
        { status: 503 },
      );
    }

    const intentRecorded = await recordOrderIntent({
      ...baseIntent,
      status: "esms_reserving",
      metadata: {
        paymentPreference,
        esmsCost,
        centsPerToken,
        settlementSource: "platform_stripe_balance",
        specialInstructions: text(body.order?.specialInstructions) || undefined,
        preparationTime: numberFrom(body.order?.preparationTime),
      },
    });
    if (!intentRecorded) {
      return NextResponse.json(
        { error: "Could not persist the ESMS order before settlement." },
        { status: 503 },
      );
    }

    const { reserveEsmsForRestaurantOrder } = await import(
      "@/lib/payments/esmsRestaurantLedger"
    );
    const reservation = await reserveEsmsForRestaurantOrder({
      orderId,
      userId: session.user.id,
      restaurantName,
      cost: esmsCost,
    });

    if (!reservation.reserved) {
      await updateEsmsOrderSettlement({
        orderId,
        status: "payment_failed",
        transferStatus: "not_started",
        paymentStatus: "insufficient_esms",
        metadata: { esmsCost },
      });
      return NextResponse.json(
        {
          error: "Insufficient ESMS balance for this order.",
          code: "insufficient_esms",
          orderId,
          esmsCost,
        },
        { status: 402 },
      );
    }

    const transferGroup = `restaurant_order_${orderId}`;
    try {
      const { getStripe } = await import("@/lib/stripe/stripe");
      const stripe = getStripe();
      const transfer = await stripe.transfers.create(
        {
          amount: transferAmountCents,
          currency: orderCurrency,
          destination: connectedAccountId,
          transfer_group: transferGroup,
          metadata: {
            purpose: "restaurant_order_esms_settlement",
            orderId,
            userId: session.user.id,
            restaurantName: metadataValue(restaurantName),
          },
        },
        { idempotencyKey: `restaurant_order_esms_transfer_${orderId}` },
      );

      await updateEsmsOrderSettlement({
        orderId,
        status: "paid",
        transferId: transfer.id,
        transferStatus: "created",
        paymentStatus: "paid_with_esms",
        completed: true,
        metadata: {
          paymentPreference,
          esmsCost,
          centsPerToken,
          transferGroup,
          remainingBalances: reservation.balances,
        },
      });

      const { triggerOrderFulfillment } = await import("@/lib/orders/fulfillment");
      try {
        await triggerOrderFulfillment(orderId);
      } catch (error) {
        console.error(
          `[api/stripe/restaurant-order] ESMS order fulfillment failed: ${orderId}`,
          error,
        );
      }

      return NextResponse.json({
        mode: "esms",
        orderId,
        status: "paid",
        esmsCost,
        remainingBalances: reservation.balances,
        settlement: {
          currency: orderCurrency,
          transferAmountCents,
          transferId: transfer.id,
        },
      });
    } catch (error) {
      console.error(
        `[api/stripe/restaurant-order] ESMS settlement pending: ${orderId}`,
        error,
      );
      await updateEsmsOrderSettlement({
        orderId,
        status: "settlement_pending",
        transferStatus: "retry_required",
        paymentStatus: "esms_reserved",
        metadata: {
          paymentPreference,
          esmsCost,
          settlementError:
            error instanceof Error ? error.message : "Unknown settlement error",
        },
      });
      return NextResponse.json(
        {
          error:
            "ESMS was reserved, but restaurant settlement is pending. Do not submit the order again.",
          code: "settlement_pending",
          orderId,
        },
        { status: 202 },
      );
    }
  }

  if ((!subtotalCents && !orderPriceId) || !hasStripeSecret) {
    await recordOrderIntent({
      ...baseIntent,
      splitMode: "external",
      status: "external_handoff",
      metadata: {
        reason: !subtotalCents && !orderPriceId
          ? "No order total or fallback Stripe price configured."
          : "STRIPE_SECRET_KEY is not configured.",
        specialInstructions: text(body.order?.specialInstructions) || undefined,
        preparationTime: numberFrom(body.order?.preparationTime),
        paymentPreference,
      },
    });

    return externalOrderFallback({
      url: parsedRestaurantUrl.toString(),
      orderId,
      reason: !subtotalCents && !orderPriceId
        ? "No order total or fallback Stripe price configured."
        : "STRIPE_SECRET_KEY is not configured.",
    });
  }

  try {
    const appUrl = appUrlFrom(request);
    const successUrl = new URL("/restaurants", appUrl);
    successUrl.searchParams.set("cuisine", cuisineType);
    successUrl.searchParams.set("order", "success");
    successUrl.searchParams.set("restaurant", restaurantName);
    successUrl.searchParams.set("order_id", orderId);
    successUrl.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");

    const cancelUrl = new URL("/restaurants", appUrl);
    cancelUrl.searchParams.set("cuisine", cuisineType);
    cancelUrl.searchParams.set("order", "canceled");
    cancelUrl.searchParams.set("restaurant", restaurantName);
    cancelUrl.searchParams.set("order_id", orderId);

    const transferGroup = `restaurant_order_${orderId}`;
    const { getStripe } = await import("@/lib/stripe/stripe");
    const stripe = getStripe();
    if (paymentPreference === "crypto" && connectedAccountId) {
      const connectedAccount = await stripe.accounts.retrieve(connectedAccountId);
      if (connectedAccount.capabilities?.crypto_payments !== "active") {
        await recordOrderIntent({
          ...baseIntent,
          status: "checkout_failed",
          metadata: {
            paymentPreference,
            reason: "Connected account crypto_payments capability is not active.",
          },
        });
        return NextResponse.json(
          {
            error:
              "This restaurant is still completing Stripe crypto payment activation.",
            code: "restaurant_crypto_not_active",
            orderId,
          },
          { status: 409 },
        );
      }
    }
    const commonMetadata = {
      purpose: "restaurant_order",
      source: "cuisine_restaurant_discovery",
      orderId: metadataValue(orderId),
      userId: session?.user?.id ?? "",
      cuisineType: metadataValue(cuisineType),
      provider: metadataValue(provider || "unknown"),
      restaurantId: metadataValue(restaurantId),
      restaurantName: metadataValue(restaurantName),
      restaurantUrl: metadataValue(parsedRestaurantUrl.toString()),
      stripeConnectedAccountId: metadataValue(connectedAccountId ?? ""),
      partnerSystem: metadataValue(partnerSystem),
      splitMode,
      transferGroup,
      platformFeeCents: metadataValue(platformFeeCents),
      transferAmountCents: metadataValue(transferAmountCents),
      orderType,
      paymentPreference,
    };

    const paymentMethodTypes = stripePaymentMethodTypes(paymentPreference);

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        ...(paymentMethodTypes
          ? { payment_method_types: paymentMethodTypes }
          : {}),
        line_items: subtotalCents
          ? (lineItems.length > 0
              ? lineItems.map((item) => ({
                  price_data: {
                    currency: orderCurrency,
                    unit_amount: item.unitPriceCents,
                    product_data: {
                      name: item.name,
                      metadata: { restaurantOrderItemId: metadataValue(item.id) },
                    },
                  },
                  quantity: item.quantity,
                }))
              : [
                  {
                    price_data: {
                      currency: orderCurrency,
                      unit_amount: subtotalCents,
                      product_data: {
                        name: `${restaurantName} order`,
                        description:
                          orderDescription ||
                          `${cuisineType} restaurant order through Alchm Kitchen`,
                      },
                    },
                    quantity: 1,
                  },
                ])
          : [{ price: orderPriceId, quantity: 1 }],
        success_url: successUrl.toString(),
        cancel_url: cancelUrl.toString(),
        customer_email: session?.user?.email ?? undefined,
        client_reference_id: orderId,
        metadata: commonMetadata,
        payment_intent_data: {
          metadata: commonMetadata,
          ...(splitMode === "destination_charge" && connectedAccountId
            ? {
                transfer_data: { destination: connectedAccountId },
                ...(platformFeeCents
                  ? { application_fee_amount: platformFeeCents }
                  : {}),
              }
            : { transfer_group: transferGroup }),
        },
      },
      { idempotencyKey: `restaurant_checkout_${orderId}` },
    );

    await recordOrderIntent({
      ...baseIntent,
      status: "checkout_created",
      stripeCheckoutSessionId: checkoutSession.id,
      stripePaymentIntentId:
        typeof checkoutSession.payment_intent === "string"
          ? checkoutSession.payment_intent
          : checkoutSession.payment_intent?.id ?? null,
      partnerOrderId: null,
      partnerStatus: null,
      metadata: {
        stripeCheckoutUrlCreated: Boolean(checkoutSession.url),
        transferGroup,
        specialInstructions: text(body.order?.specialInstructions) || undefined,
        preparationTime: numberFrom(body.order?.preparationTime),
        paymentPreference,
      },
    });

    if (!checkoutSession.url) {
      return externalOrderFallback({
        url: parsedRestaurantUrl.toString(),
        orderId,
        reason: "Stripe did not return a Checkout URL.",
        status: 502,
      });
    }

    return NextResponse.json({
      mode: "stripe_checkout",
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      orderId,
      splitMode,
      paymentPreference,
      totals: {
        currency: orderCurrency,
        subtotalCents,
        platformFeeCents,
        transferAmountCents,
        totalCents: subtotalCents,
      },
    });
  } catch (error) {
    console.error("[api/stripe/restaurant-order] Error:", error);
    await recordOrderIntent({
      ...baseIntent,
      status: "checkout_failed",
      metadata: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return externalOrderFallback({
      url: parsedRestaurantUrl.toString(),
      orderId,
      reason: "Stripe Checkout could not be created.",
      status: 502,
    });
  }
}
