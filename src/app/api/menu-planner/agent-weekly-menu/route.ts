/**
 * Internal agent weekly menu bridge.
 *
 * Planetary Agents can use this route to persist a completed weekly menu under
 * the corresponding @agentic.alchm.kitchen user and, when requested, publish a
 * compact `weekly_menu` event to the shared feed.
 *
 * Hardened for reliable agent integration:
 * - Scoped publication identity and idempotency via `agentPublicationService`.
 * - Semantic payload fingerprinting.
 * - Strict 28-slot completeness and Sunday UTC midnight enforcement for completed published menus.
 * - Authoritative recipe validation and forged adaptation provenance rejection.
 * - Feed publication confirmation requirement: `success: true` strictly requires confirmed feed when requested.
 * - In-flight 409 retry marker and 409 payload conflict marker.
 *
 * @file src/app/api/menu-planner/agent-weekly-menu/route.ts
 */

import { NextResponse } from "next/server";
import { bearerMatches } from "@/lib/hooks/secureCompare";
import { AgentWeeklyMenuRequestSchema } from "@/lib/validation/apiSchemas";
import { feedDatabase } from "@/services/feedDatabaseService";
import { menuPersistenceService } from "@/services/menuPersistenceService";
import { userDatabase } from "@/services/userDatabaseService";
import { getWeekEndDate } from "@/types/menuPlanner";
import type { GroceryItem, MealSlot } from "@/types/menuPlanner";
import { AgentChartRequiredError } from "@/utils/agentChartInvariant";
import { createLogger } from "@/utils/logger";
import { resolvePublicationDeliveryKey } from "@/lib/publications/deliveryKey";
import { calculateSemanticFingerprint } from "@/lib/publications/semanticFingerprint";
import { agentPublicationService } from "@/services/agentPublicationService";
import type { DetailedPublicationReceipt } from "@/lib/publications/types";
import { validateMenuRecipeReference } from "@/lib/recipes/recipeCatalogValidation";
import type { NextRequest } from "next/server";

const logger = createLogger("agent-weekly-menu");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AGENTIC_EMAIL_DOMAIN = "@agentic.alchm.kitchen";
const MAX_AGENT_EMAIL_LENGTH = 320;
const MAX_TITLE_LENGTH = 120;
const MAX_SUMMARY_LENGTH = 280;
const MAX_FEATURED_MEALS = 6;
const MAX_GROCERY_ITEMS = 500;
const MAX_INVENTORY_ITEMS = 500;

const REQUIRED_MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const;

interface AgentWeeklyMenuBody {
  agentEmail?: unknown;
  agentSlug?: unknown;
  agentDisplayName?: unknown;
  weekStartDate?: unknown;
  meals?: unknown;
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
  deliveryId?: unknown;
  nutritionalTotals?: unknown;
}

interface FeaturedMeal {
  dayOfWeek: number | undefined;
  mealType: string | undefined;
  recipeId: string | undefined;
  recipeName: string;
}

function isAuthorizedInternalRequest(authHeader: string | null): boolean {
  return bearerMatches(authHeader, process.env.INTERNAL_API_SECRET);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMealSlot(value: unknown): value is MealSlot {
  return isRecord(value);
}

function isGroceryItem(value: unknown): value is GroceryItem {
  return isRecord(value);
}

function isRequiredMealType(value: string): value is (typeof REQUIRED_MEAL_TYPES)[number] {
  return value === "breakfast" || value === "lunch" || value === "dinner" || value === "snack";
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

function normalizeWeekStartDateToSundayUtc(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 is Sunday
  if (day !== 0) {
    d.setUTCDate(d.getUTCDate() - day);
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
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
          mealType: asString(item.mealType, 40)?.toLowerCase(),
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
        dayOfWeek: asFiniteNumber(meal.dayOfWeek),
        mealType: asString(meal.mealType, 40)?.toLowerCase(),
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
  deliveryKey?: string | undefined;
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
    idempotencyKey: args.deliveryKey ?? asString(args.body.idempotencyKey, 160),
    source: "planetary_agents",
  };
}

function jsonError(message: string, status: number, details?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...details }, { status });
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
  const parsedStart = parseWeekStart(searchParams.get("weekStartDate"));

  if (!agentEmail) {
    return jsonError(
      `agentEmail or agentSlug must resolve to ${AGENTIC_EMAIL_DOMAIN}`,
      400,
    );
  }
  if (!parsedStart) {
    return jsonError("weekStartDate is required and must be a valid date", 400);
  }

  const weekStartDate = normalizeWeekStartDateToSundayUtc(parsedStart);

  try {
    const user = await userDatabase.ensurePlanetaryAgent(
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
    if (error instanceof AgentChartRequiredError) {
      logger.warn("[agent-weekly-menu GET] refused agent", error.message);
      return jsonError(error.message, 422);
    }
    logger.error("[agent-weekly-menu GET]", error);
    return jsonError("Failed to load agent weekly menu", 500);
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedInternalRequest(request.headers.get("Authorization"))) {
    return jsonError("Unauthorized", 401);
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  // 1. Resolve publication delivery key (handles header-only, body-only, or matching)
  const keyResolution = resolvePublicationDeliveryKey(request.headers, rawBody);
  if (keyResolution.error) {
    return jsonError(keyResolution.error, keyResolution.statusCode ?? 400);
  }
  const { deliveryKey } = keyResolution;

  const parseResult = AgentWeeklyMenuRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return jsonError("Invalid request body", 400);
  }

  const body: AgentWeeklyMenuBody = parseResult.data;

  const agentEmail = normalizeAgentEmail(body);
  const rawWeekStartDate = parseWeekStart(body.weekStartDate);
  const status = (asString(body.status, 40) ?? "draft").toLowerCase();
  const shareToFeed = asBoolean(body.shareToFeed) === true;

  if (!agentEmail) {
    return jsonError(
      `agentEmail or agentSlug must resolve to ${AGENTIC_EMAIL_DOMAIN}`,
      400,
    );
  }
  if (!rawWeekStartDate) {
    return jsonError("weekStartDate is required and must be a valid date", 400);
  }

  // 2. Draft vs Completed Publication Boundary
  if (status === "draft" && shareToFeed) {
    return jsonError("Draft menus cannot be published or shared to feed", 400);
  }

  const meals = Array.isArray(body.meals) ? body.meals.filter(isMealSlot) : [];
  if (meals.length === 0) {
    return jsonError("meals must contain at least one meal slot", 400);
  }

  const groceryList = Array.isArray(body.groceryList)
    ? body.groceryList.filter(isGroceryItem).slice(0, MAX_GROCERY_ITEMS)
    : [];
  const inventory = parseStringArray(body.inventory, MAX_INVENTORY_ITEMS);

  // 3. For completed published menus, enforce full 28-slot schedule, Sunday UTC midnight, and recipe provenance
  const isPublishing = status === "completed" && shareToFeed;
  let weekStartDate = rawWeekStartDate;

  if (isPublishing || status === "completed") {
    // Week start must be on Sunday
    if (rawWeekStartDate.getUTCDay() !== 0) {
      return jsonError("weekStartDate for completed weekly menus must be a Sunday", 400);
    }
    // Normalize to Sunday midnight UTC
    weekStartDate = normalizeWeekStartDateToSundayUtc(rawWeekStartDate);

    // Validate 28 slots (7 days x 4 meals)
    if (meals.length !== 28) {
      return jsonError(
        `Completed weekly menu must contain exactly 28 slots (found ${meals.length})`,
        400,
      );
    }

    const seenSlots = new Set<string>();
    const slotMap = new Map<string, string>(); // key -> recipeId

    for (const meal of meals) {
      // Day validation: integer 0..6
      const day = meal.dayOfWeek;
      if (typeof day !== "number" || !Number.isInteger(day) || day < 0 || day > 6) {
        return jsonError(`Invalid dayOfWeek '${day}': must be an integer between 0 and 6`, 400);
      }

      // Meal type validation
      const type = (meal.mealType ?? "").toLowerCase();
      if (!isRequiredMealType(type)) {
        return jsonError(`Invalid mealType '${meal.mealType}': must be breakfast, lunch, dinner, or snack`, 400);
      }

      const slotKey = `${day}-${type}`;
      if (seenSlots.has(slotKey)) {
        return jsonError(`Duplicate meal slot for day ${day} ${type}`, 400);
      }
      seenSlots.add(slotKey);

      // Servings validation: bounded positive
      const { servings } = meal;
      if (typeof servings !== "number" || !Number.isFinite(servings) || servings <= 0 || servings > 100) {
        return jsonError(`Invalid servings for day ${day} ${type}: must be positive number <= 100`, 400);
      }

      // Recipe validation
      const recipeRef = isRecord(meal.recipe) ? meal.recipe : undefined;
      const recipeCheck = await validateMenuRecipeReference(recipeRef ?? {});
      if (!recipeCheck.valid) {
        return jsonError(recipeCheck.error ?? "Invalid recipe reference", 400);
      }

      const recId = String(recipeRef?.id ?? "").trim();
      slotMap.set(slotKey, recId);
    }

    // Ensure all 28 distinct combinations exist
    for (let d = 0; d < 7; d++) {
      for (const t of REQUIRED_MEAL_TYPES) {
        if (!seenSlots.has(`${d}-${t}`)) {
          return jsonError(`Missing required meal slot: day ${d} ${t}`, 400);
        }
      }
    }

    // Featured meals validation: must reference the recipe assigned to that day/slot
    if (Array.isArray(body.featuredMeals) && body.featuredMeals.length > 0) {
      for (const feat of body.featuredMeals) {
        if (isRecord(feat)) {
          const fDay = asFiniteNumber(feat.dayOfWeek);
          const fType = asString(feat.mealType, 40)?.toLowerCase();
          const fRecipeId = asString(feat.recipeId, 120);

          if (fDay !== undefined && fType && fRecipeId) {
            const assignedRecipeId = slotMap.get(`${fDay}-${fType}`);
            if (assignedRecipeId && assignedRecipeId !== fRecipeId) {
              return jsonError(
                `Featured meal for day ${fDay} ${fType} references recipe '${fRecipeId}', but slot has '${assignedRecipeId}'`,
                400,
              );
            }
          }
        }
      }
    }
  } else {
    // Draft / save-only: normalize start date time to midnight UTC
    weekStartDate = normalizeWeekStartDateToSundayUtc(rawWeekStartDate);
  }

  // 4. Idempotency reservation and replay check
  let publicationId: string | undefined;
  if (deliveryKey) {
    const semanticPayload = {
      agentEmail,
      weekStartDate: weekStartDate.toISOString(),
      status,
      shareToFeed,
      title: asString(body.title) ?? asString(body.menuTitle),
      summary: asString(body.summary) ?? asString(body.description),
      planetaryFocus: asString(body.planetaryFocus),
      dietaryFocus: asString(body.dietaryFocus),
      meals: meals.map((m) => ({
        dayOfWeek: m.dayOfWeek,
        mealType: m.mealType,
        servings: m.servings,
        recipeId: isRecord(m.recipe) ? m.recipe.id : undefined,
      })),
      groceryList: groceryList.map((g) => ({
        ingredient: isRecord(g) ? g.ingredient : undefined,
      })),
    };

    const semanticFingerprint = calculateSemanticFingerprint(semanticPayload);
    const prep = await agentPublicationService.preparePublication({
      principalId: "internal_api_secret",
      deliveryKey,
      operation: "weekly_menu_publish",
      semanticFingerprint,
    });

    if (prep.kind === "in_flight") {
      return NextResponse.json(
        { status: "in_flight", message: "Publication delivery is currently being processed" },
        { status: 409, headers: { "Retry-After": "1" } },
      );
    }

    if (prep.kind === "payload_conflict") {
      return jsonError("PAYLOAD_CONFLICT: Delivery key previously used with different semantic content", 409, {
        code: "PAYLOAD_CONFLICT",
      });
    }

    if (prep.kind === "replayed" && prep.receipt) {
      return NextResponse.json({
        ...prep.receipt,
        deduplicated: true,
      });
    }

    if (prep.kind === "proceed") {
      ({ publicationId } = prep);
    }
  }

  try {
    const user = await userDatabase.ensurePlanetaryAgent(
      agentEmail,
      asString(body.agentDisplayName, MAX_TITLE_LENGTH),
    );

    // Strips model-estimated nutritionalTotals before upsert
    const persisted = await menuPersistenceService.upsertMenu(user.id, {
      weekStartDate,
      meals,
      groceryList,
      inventory,
      weeklyBudget: parseWeeklyBudget(body.weeklyBudget),
    });

    let feedShared = false;
    let feedMetadata: ReturnType<typeof buildFeedMetadata> | null = null;
    let feedEventId: string | undefined;

    if (shareToFeed && status === "completed") {
      feedMetadata = buildFeedMetadata({
        body,
        persistedMenuId: persisted.id,
        weekStartDate,
        meals,
        groceryList,
        deliveryKey: deliveryKey ?? undefined,
      });

      // Attempt feed event creation
      let feedCreated = false;
      if (typeof feedDatabase.publishFeedEvent === "function") {
        const feedResult = await feedDatabase.publishFeedEvent(
          user.id,
          "weekly_menu",
          feedMetadata,
          true,
        );
        feedCreated = feedResult?.feedPublished ?? false;
        feedEventId = feedResult?.eventId;
      } else {
        feedCreated = await feedDatabase.createEvent(
          user.id,
          "weekly_menu",
          feedMetadata,
          true,
        );
        feedEventId = undefined;
      }

      feedShared = feedCreated;

      // RULE: When feed publication was requested, success: true strictly requires confirmed feed!
      if (!feedShared) {
        const failedReceipt: DetailedPublicationReceipt = {
          success: false,
          contractVersion: "1.0",
          deliveryId: deliveryKey ?? undefined,
          operation: "weekly_menu_publish",
          agentEmail,
          userId: user.id,
          menu: { id: persisted.id, weekStartDate: weekStartDate.toISOString() },
          feedPublished: false,
          recipeCommentStatus: "not_requested",
          legacyInteractionStatus: "not_requested",
          outcomes: {
            feed: { status: "failed", error: "Feed event persistence unconfirmed" },
            menu: { status: "persisted", id: persisted.id },
          },
          completedAt: new Date().toISOString(),
        };

        if (publicationId) {
          await agentPublicationService.failPublication(
            publicationId,
            "Feed publication failed after menu persistence",
            failedReceipt,
          );
        }

        return NextResponse.json(
          {
            success: false,
            error: "Menu was persisted but feed publication could not be confirmed",
            agentEmail,
            userId: user.id,
            menu: persisted,
            feedShared: false,
            deliveryId: deliveryKey ?? undefined,
            receipt: failedReceipt,
          },
          { status: 502 },
        );
      }
    }

    const receipt: DetailedPublicationReceipt = {
      success: true,
      contractVersion: "1.0",
      deliveryId: deliveryKey ?? undefined,
      operation: "weekly_menu_publish",
      agentEmail,
      userId: user.id,
      menu: { id: persisted.id, weekStartDate: weekStartDate.toISOString() },
      feedPublished: feedShared,
      recipeCommentStatus: "not_requested",
      legacyInteractionStatus: "not_requested",
      event: feedEventId ? { id: feedEventId } : undefined,
      outcomes: {
        feed: shareToFeed
          ? { status: "published", id: feedEventId }
          : { status: "not_requested" },
        menu: { status: "persisted", id: persisted.id },
      },
      completedAt: new Date().toISOString(),
    };

    if (publicationId) {
      await agentPublicationService.completePublication(publicationId, receipt);
    }

    return NextResponse.json({
      success: true,
      agentEmail,
      userId: user.id,
      menu: persisted,
      feedShared,
      feedMetadata,
      deliveryId: deliveryKey ?? undefined,
      receipt,
    });
  } catch (error) {
    if (error instanceof AgentChartRequiredError) {
      logger.warn("[agent-weekly-menu POST] refused agent", error.message);
      return jsonError(error.message, 422);
    }
    logger.error("[agent-weekly-menu POST]", error);

    if (publicationId) {
      await agentPublicationService.failPublication(
        publicationId,
        error instanceof Error ? error.message : "Internal error",
      );
    }
    return jsonError("Failed to save agent weekly menu", 500);
  }
}
