/**
 * Internal agent weekly menu bridge.
 *
 * Planetary Agents can use this route to persist a completed weekly menu under
 * the corresponding @agentic.alchm.kitchen user and, when requested, publish a
 * compact `weekly_menu` event to the shared feed.
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { feedDatabase } from "@/services/feedDatabaseService";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { userDatabase } from "@/services/userDatabaseService";
import { getWeekEndDate } from "@/types/menuPlanner";
import type { GroceryItem, MealSlot } from "@/types/menuPlanner";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
const MAX_AGENT_EMAIL_LENGTH = 320;
const MAX_TITLE_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 280;
const MAX_FEATURED_MEALS = 6;
const MAX_GROCERY_ITEMS = 500;
const MAX_INVENTORY_ITEMS = 500;

interface AgentWeeklyMenuBody {
  agentEmail?: unknown;
  agentSlug?: unknown;
  agentDisplayName?: unknown;
  weekStartDate?: unknown;
  meals?: unknown;
  nutritionalTotals?: unknown;
  groceryList?: unknown;
  inventory?: unknown;
  weeklyBudget?: unknown;
  status?: unknown;
  shareToFeed?: unknown;
  title?: unknown;
  menuTitle?: unknown;
  summary?: unknown;
  description?: unknown;
  planetaryFocus?: unknown;
  dietaryFocus?: unknown;
  planetarySignature?: unknown;
  featuredMeals?: unknown;
  idempotencyKey?: unknown;
}

interface FeaturedMeal {
  dayOfWeek: number | undefined;
  mealType: string | undefined;
  recipeId: string | undefined;
  recipeName: string;
}

function isAuthorizedInternalRequest(authHeader: string | null): boolean {
  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret || !authHeader) return false;

  const expected = Buffer.from(`Bearer ${internalSecret}`);
  const received = Buffer.from(authHeader);
  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, maxLength?: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function normalizeAgentEmail(body: AgentWeeklyMenuBody): string | null {
  const rawEmail = asString(body.agentEmail, MAX_AGENT_EMAIL_LENGTH);
  const rawSlug = asString(body.agentSlug, 160);
  const candidate = (rawEmail ?? rawSlug ?? "").toLowerCase().trim();
  if (!candidate) return null;
  const email = candidate.includes("@")
    ? candidate
    : `${candidate}${AGENTIC_EMAIL_DOMAIN}`;
  if (!email.endsWith(AGENTIC_EMAIL_DOMAIN)) return null;
  return email;
}

function parseWeekStart(value: unknown): Date | null {
  const raw = asString(value);
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseWeeklyBudget(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const numeric = asFiniteNumber(value);
  return numeric !== undefined && numeric >= 0 ? numeric : null;
}

function parseStringArray(value: unknown, maxItems: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asString(item, 120))
    .filter((item): item is string => Boolean(item))
    .slice(0, maxItems);
}

function recipeNameFromMeal(meal: unknown): string | undefined {
  if (!isRecord(meal) || !isRecord(meal.recipe)) return undefined;
  return (
    asString(meal.recipe.name, MAX_TITLE_LENGTH) ??
    asString(meal.recipe.title, MAX_TITLE_LENGTH)
  );
}

function recipeIdFromMeal(meal: unknown): string | undefined {
  if (!isRecord(meal) || !isRecord(meal.recipe)) return undefined;
  return asString(meal.recipe.id, 120);
}

function extractFeaturedMeals(
  rawFeaturedMeals: unknown,
  meals: MealSlot[],
): FeaturedMeal[] {
  if (Array.isArray(rawFeaturedMeals)) {
    return rawFeaturedMeals
      .map((item) => {
        if (!isRecord(item)) return null;
        const recipeName = asString(item.recipeName, MAX_TITLE_LENGTH);
        if (!recipeName) return null;
        return {
          dayOfWeek: asFiniteNumber(item.dayOfWeek),
          mealType: asString(item.mealType, 40),
          recipeId: asString(item.recipeId, 120),
          recipeName,
        };
      })
      .filter((item): item is FeaturedMeal => Boolean(item))
      .slice(0, MAX_FEATURED_MEALS);
  }

  return meals
    .map((meal) => {
      const recipeName = recipeNameFromMeal(meal);
      if (!recipeName) return null;
      return {
        dayOfWeek: asFiniteNumber(
          (meal as unknown as Record<string, unknown>).dayOfWeek,
        ),
        mealType: asString(
          (meal as unknown as Record<string, unknown>).mealType,
          40,
        ),
        recipeId: recipeIdFromMeal(meal),
        recipeName,
      };
    })
    .filter((item): item is FeaturedMeal => Boolean(item))
    .slice(0, MAX_FEATURED_MEALS);
}

function buildFeedMetadata(args: {
  body: AgentWeeklyMenuBody;
  persistedMenuId: string;
  weekStartDate: Date;
  meals: MealSlot[];
  groceryList: GroceryItem[];
}) {
  const title =
    asString(args.body.menuTitle, MAX_TITLE_LENGTH) ??
    asString(args.body.title, MAX_TITLE_LENGTH) ??
    "Planetary weekly menu";
  const summary =
    asString(args.body.summary, MAX_SUMMARY_LENGTH) ??
    asString(args.body.description, MAX_SUMMARY_LENGTH);
  const weekEndDate = getWeekEndDate(args.weekStartDate);
  const featuredMeals = extractFeaturedMeals(
    args.body.featuredMeals,
    args.meals,
  );
  const mealCount = args.meals.filter((meal) => Boolean(meal.recipe)).length;
  const recipeIds = new Set(
    args.meals
      .map((meal) => recipeIdFromMeal(meal))
      .filter((id): id is string => Boolean(id)),
  );

  return {
    menuId: args.persistedMenuId,
    eventType: "weekly_menu",
    menuTitle: title,
    title,
    summary,
    weekStartDate: args.weekStartDate.toISOString(),
    weekEndDate: weekEndDate.toISOString(),
    mealCount,
    recipeCount: recipeIds.size,
    groceryItemCount: args.groceryList.length,
    featuredMeals,
    planetaryFocus: asString(args.body.planetaryFocus, 160),
    dietaryFocus: asString(args.body.dietaryFocus, 160),
    planetarySignature: isRecord(args.body.planetarySignature)
      ? args.body.planetarySignature
      : undefined,
    idempotencyKey: asString(args.body.idempotencyKey, 160),
    source: "planetary_agents",
  };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedInternalRequest(request.headers.get("Authorization"))) {
    return jsonError("Unauthorized", 401);
  }

  const { searchParams } = new URL(request.url);
  const agentEmail = normalizeAgentEmail({
    agentEmail: searchParams.get("agentEmail"),
    agentSlug: searchParams.get("agentSlug"),
  });
  const weekStartDate = parseWeekStart(searchParams.get("weekStartDate"));

  if (!agentEmail) {
    return jsonError(
      `agentEmail or agentSlug must resolve to ${AGENTIC_EMAIL_DOMAIN}`,
      400,
    );
  }
  if (!weekStartDate) {
    return jsonError("weekStartDate is required and must be a valid date", 400);
  }

  try {
    const user = await userDatabase.ensureAgent(
      agentEmail,
      searchParams.get("agentDisplayName") ?? undefined,
    );
    const menu = await menuPersistenceService.getMenu(user.id, weekStartDate);
    return NextResponse.json({
      success: true,
      agentEmail,
      userId: user.id,
      menu,
    });
  } catch (error) {
    console.error("[agent-weekly-menu GET]", error);
    return jsonError("Failed to load agent weekly menu", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedInternalRequest(request.headers.get("Authorization"))) {
    return jsonError("Unauthorized", 401);
  }

  let body: AgentWeeklyMenuBody;
  try {
    const json = (await request.json()) as unknown;
    if (!isRecord(json)) {
      return jsonError("Invalid request body", 400);
    }
    body = json;
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const agentEmail = normalizeAgentEmail(body);
  const weekStartDate = parseWeekStart(body.weekStartDate);
  const meals = Array.isArray(body.meals) ? (body.meals as MealSlot[]) : [];
  const groceryList = Array.isArray(body.groceryList)
    ? (body.groceryList as GroceryItem[]).slice(0, MAX_GROCERY_ITEMS)
    : [];
  const inventory = parseStringArray(body.inventory, MAX_INVENTORY_ITEMS);
  const nutritionalTotals = isRecord(body.nutritionalTotals)
    ? body.nutritionalTotals
    : {};
  const status = (asString(body.status, 40) ?? "draft").toLowerCase();
  const shareToFeed = asBoolean(body.shareToFeed) === true;

  if (!agentEmail) {
    return jsonError(
      `agentEmail or agentSlug must resolve to ${AGENTIC_EMAIL_DOMAIN}`,
      400,
    );
  }
  if (!weekStartDate) {
    return jsonError("weekStartDate is required and must be a valid date", 400);
  }
  if (meals.length === 0) {
    return jsonError("meals must contain at least one meal slot", 400);
  }

  try {
    const user = await userDatabase.ensureAgent(
      agentEmail,
      asString(body.agentDisplayName, MAX_TITLE_LENGTH),
    );
    const persisted = await menuPersistenceService.upsertMenu(user.id, {
      weekStartDate,
      meals,
      nutritionalTotals: nutritionalTotals as any,
      groceryList,
      inventory,
      weeklyBudget: parseWeeklyBudget(body.weeklyBudget),
    });

    let feedShared = false;
    let feedMetadata: ReturnType<typeof buildFeedMetadata> | null = null;

    if (shareToFeed && status === "completed") {
      feedMetadata = buildFeedMetadata({
        body,
        persistedMenuId: persisted.id,
        weekStartDate,
        meals,
        groceryList,
      });
      feedShared = await feedDatabase.createEvent(
        user.id,
        "weekly_menu",
        feedMetadata,
        true,
      );
    }

    return NextResponse.json({
      success: true,
      agentEmail,
      userId: user.id,
      menu: persisted,
      feedShared,
      feedMetadata,
    });
  } catch (error) {
    console.error("[agent-weekly-menu POST]", error);
    return jsonError("Failed to save agent weekly menu", 500);
  }
}
