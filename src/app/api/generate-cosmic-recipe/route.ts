/**
 * POST /api/generate-cosmic-recipe
 *
 * Thin proxy in front of planetary_agents' /api/generate-recipe endpoint.
 * WTEN's job here is:
 *   - Auth/demo gate + token-economy debit (personalized live pricing).
 *   - Compute the structured grounding fields PA can't recreate:
 *     dominantElement, indexed topIngredients, ESMS alchemical state,
 *     thermodynamic properties, the user's cuisine selection, and a
 *     prompt enriched with their recent food diary.
 *   - Forward those to PA, which owns the alchemical-chef persona,
 *     JSON-mode toggling, Pydantic schema validation, one retry on
 *     malformed output, and a 60s prompt-hash cache.
 *   - Defensive Zod re-check of PA's response against the canonical
 *     cosmicRecipeSchema so schema drift surfaces at the WTEN edge.
 *
 * History: an earlier version of this route POSTed to PA's /api/chat
 * with a prompt-engineered JSON contract; the version before THAT
 * targeted a /api/generate-recipe endpoint PA never exposed (the source
 * of the hourly synthetic-probe 404s). With PA's first-class endpoint
 * now in place, WTEN simplifies to a proxy.
 */
import { z } from "zod";
import { gateDemoOrAuth } from "@/lib/auth/demoAccess";
import {
  applyPersonalizedPricing,
  getPersonalizedPricingContext,
} from "@/lib/economy/livePricing";
import { withObservability } from "@/lib/observability/withObservability";
import { getServiceUrl } from "@/lib/serviceUrls";
import { foodDiaryService } from "@/services/FoodDiaryService";
import { reportQuestEventBestEffort } from "@/services/questEventReporter";
import { alchemize } from "@/services/RealAlchemizeService";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { getCapitalizedNatalPositions } from "@/utils/astrology/chartDataUtils";
import {
  getAccuratePlanetaryPositions,
  isCurrentSkyDiurnal,
} from "@/utils/astrology/positions";
import {
  getDominantElementFromPositions,
  type ClassicalElement,
} from "@/utils/astrology/signElement";
import {
  getCuisineEntry,
  normalizeCuisineName,
} from "@/utils/cuisine/cuisineIndex";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Deadline for the upstream Planetary Agents call.
 *
 * The fetch below had NO timeout: it was bounded only by `maxDuration`, so a
 * slow PA held a 60s Vercel function open and the platform killed it with no
 * catchable error, no status, and no chance to record anything.
 *
 * [MEASURED 2026-08-19] PA's POST /api/generate-recipe answered 200 in
 * 23.0s / 24.7s / 24.8s / 30.8s across four samples, while PA's /health
 * answered in 0.35s — the cost is the LLM generation, not reachability.
 * 45s sits above that band so a healthy-but-slow generation still completes,
 * and below `maxDuration` so we return an honest 504 instead of being killed.
 */
const PA_TIMEOUT_MS = 45_000;

const birthDataSchema = z
  .object({
    dateTime: z.string().min(1).optional(),
    latitude: z.number().finite().optional(),
    longitude: z.number().finite().optional(),
  })
  .passthrough()
  .optional();

const cosmicRecipeBodySchema = z.object({
  prompt: z.string().trim().max(2000).optional(),
  diet: z.string().trim().max(200).optional(),
  ingredients_main: z.array(z.string().max(80)).max(40).optional(),
  disallowed_ingredients: z.array(z.string().max(80)).max(40).optional(),
  birthData: birthDataSchema,
  preferredCuisine: z.string().trim().max(80).optional(),
});

async function handlePost(request: NextRequest) {
  // Auth'd users → token economy (Spirit/Essence per cosmic recipe) is the throttle.
  // Anonymous → 2 demo cosmic recipes per IP per day, then sign-in nudge.
  const access = await gateDemoOrAuth(request, {
    dailyDemoQuota: 2,
    feature: "cosmic recipe",
  });
  if (access.mode === "denied") return access.blocked;

  const isPremiumUser = false;

  // Auth'd path: token economy is the throttle. Every user gets 1 free daily generation,
  // and subsequent recipe generations spend personalized live ESMS tokens.
  if (access.mode === "auth") {
    const { userId } = access;
    let isFirstGeneration = true;
    let count = 0;

      // Check daily limit table to see if this is their first generation of the day
      try {
        const { executeQuery } = await import("@/lib/database");
        const limitRows = await executeQuery(
          `SELECT recipes_generated FROM user_daily_limits
           WHERE user_id = $1 AND date = CURRENT_DATE`,
          [userId]
        );
        count = limitRows.rows[0]?.recipes_generated ?? 0;
        isFirstGeneration = count === 0;
      } catch (err) {
        console.warn("[generate-cosmic-recipe] Failed to verify daily limit:", err);
      }

      // If they already generated their free daily recipe, charge them using their ESMS token balances
      if (!isFirstGeneration) {
        const item = await tokenEconomy.getShopItem("unlock-cosmic-recipe");
        if (!item?.isActive) {
          return new Response(JSON.stringify({
            error: "shop_item_unavailable",
            message: "Cosmic recipe unlock is not configured.",
          }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Fetch natal chart for per-user pricing. Falls back to global multiplier
        // when the user hasn't onboarded a chart yet.
        const { userDatabase } = await import("@/services/userDatabaseService");
        const dbUser = await userDatabase.getUserById(userId);
        const natalPositions = getCapitalizedNatalPositions(dbUser?.profile?.natalChart);

        const pricing = await getPersonalizedPricingContext(natalPositions);
        const liveCost = applyPersonalizedPricing(
          {
            spirit: item.costSpirit,
            essence: item.costEssence,
            matter: item.costMatter,
            substance: item.costSubstance,
          },
          pricing,
        );

        const purchase = await tokenEconomy.purchaseShopItem(userId, "unlock-cosmic-recipe", {
          overrideCosts: liveCost,
          descriptionSuffix: pricing.personalized
            ? `live x${pricing.multiplier.toFixed(2)} · personalized`
            : `live x${pricing.multiplier.toFixed(2)}`,
        });

        if (!purchase.success && purchase.reason !== "already_owned") {
          // `purchase_failed` means the debit threw server-side (e.g. a DB error
          // inside purchaseShopItem) — NOT that the user is out of tokens. Return
          // 5xx so it surfaces as an incident on the synthetic probe / dashboards
          // instead of masquerading as a billing 402. (Masking a server throw as
          // "insufficient tokens" is exactly what hid the 42702 CTE bug fixed in
          // #446.) Only genuine balance failures get the 402 + upsell copy.
          if (purchase.reason === "purchase_failed") {
            return new Response(JSON.stringify({
              error: "generation_unavailable",
              message: "Recipe generation is temporarily unavailable. Please try again shortly.",
            }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({
            error: "Insufficient tokens",
            message: `You have generated your free recipe for today. Generating another requires ${liveCost.spirit.toFixed(2)} Spirit and ${liveCost.essence.toFixed(2)} Essence. Earn more via the daily Cosmic Yield or complete quests.`,
            liveCost,
            pricing,
            recipesGeneratedToday: count,
          }), {
            status: 402,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

    // Cosmic recipes count toward both the generic "Culinary Explorer" tiers
    // and the one-shot "Cosmic Chef" premium quest.
    await reportQuestEventBestEffort(userId, "generate_recipe");
    await reportQuestEventBestEffort(userId, "generate_premium_recipe");
  }

  // Beyond this point, both auth and demo paths build the same prompt and call
  // the agents network. Demo users skip personalization that requires a userId
  // (food history note) but still see the wow grounding payload.
  const demoMode = access.mode === "demo";
  const userId: string | null = access.mode === "auth" ? access.userId : null;

  const rawBody = await request.json().catch(() => null);
  if (!rawBody || typeof rawBody !== "object") {
    return new Response(
      JSON.stringify({ error: "invalid_request", message: "Request body must be JSON." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const parsed = cosmicRecipeBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "invalid_request",
        message: "Recipe input failed validation.",
        issues: parsed.error.issues.slice(0, 5).map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }
  const {
    prompt,
    diet,
    ingredients_main: ingredientsMain,
    disallowed_ingredients: disallowedIngredients,
    birthData,
    preferredCuisine,
  } = parsed.data;

  // Compute the current sky once. We use it for both the dominant element
  // (a top-level field PA expects) and to derive the alchemical state +
  // thermodynamic properties PA grounds the recipe on.
  const skyDate = new Date();
  const raw = getAccuratePlanetaryPositions(skyDate);
  const dominantElement: ClassicalElement =
    getDominantElementFromPositions(raw);

  // Project-curated grounding: which cuisine the user picked (if any),
  // and which indexed ingredients are strongest in the dominant element
  // right now. PA ingests these as structured context — it does not
  // recompute them.
  const cuisineName = preferredCuisine ? normalizeCuisineName(preferredCuisine) : "";
  const cuisineEntry = cuisineName ? getCuisineEntry(cuisineName) : null;
  const topIngredients = findTopIngredientsForElement(dominantElement, 8).map((i) => i.name);

  // Auth-path personalization: pull the user's recent food diary so PA
  // can steer toward variety. Demo users have no diary to draw from.
  const recentEntries = userId
    ? await foodDiaryService.getEntries(userId, { limit: 10 })
    : [];
  const recentFoods = recentEntries.map((e) => e.foodName).join(", ");

  // Compute Spirit/Essence/Matter/Substance + thermodynamic properties
  // from the current sky. PA wants the raw numeric maps; it builds its
  // own prompt from them.
  const normalizedPositions: Record<
    string,
    { sign: string; degree: number; minute: number; isRetrograde: boolean }
  > = {};
  Object.entries(raw).forEach(([planet, pos]) => {
    const p = pos as {
      sign: unknown;
      degree?: unknown;
      minute?: unknown;
      isRetrograde?: unknown;
    };
    normalizedPositions[planet] = {
      sign: String(p.sign ?? "").toLowerCase(),
      degree: Number(p.degree) || 0,
      minute: Number(p.minute) || 0,
      isRetrograde: Boolean(p.isRetrograde),
    };
  });
  const esms = calculateAlchemicalFromPlanets(
    raw,
    isCurrentSkyDiurnal(skyDate),
  );
  const alchemized = alchemize(normalizedPositions);

  // Augment the user's natural-language prompt with their recent-foods
  // history + their preferred main ingredients so PA's prompt builder
  // forwards them to the model. PA owns the rest of the prompt (persona,
  // JSON contract, schema injection) since the PA-side rebuild.
  const baseUserPrompt =
    prompt || "A nourishing, restorative meal aligned with today's cosmic energies.";
  const preferredIngredientsHint = ingredientsMain?.length
    ? `\nPreferred main ingredients: ${ingredientsMain.join(", ")}.`
    : "";
  const recentFoodsHint = recentFoods
    ? `\nUser recently consumed: ${recentFoods}. Ensure variety or complementary pairings.`
    : "";
  const enrichedPrompt = `${baseUserPrompt}${preferredIngredientsHint}${recentFoodsHint}`;

  // PA backend at api.agents.alchm.kitchen owns recipe generation since
  // the PA-side rebuild: it handles the alchemical-chef persona, prompt
  // construction, provider-native JSON mode, Pydantic validation, one
  // auto-retry on malformed output, and a 60s prompt-hash cache. WTEN
  // forwards the structured grounding fields it has computed and gets
  // back a validated CosmicRecipeResponse.
  const agentBaseUrl = getServiceUrl("planetaryAgentsApi");

  let recipe: z.infer<typeof cosmicRecipeSchema>;
  try {
    const agentResponse = await fetch(`${agentBaseUrl}/api/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Covers the body read as well as the headers: AbortSignal.timeout stays
      // armed until the response is fully consumed, unlike a manual
      // clearTimeout in a finally block.
      signal: AbortSignal.timeout(PA_TIMEOUT_MS),
      body: JSON.stringify({
        prompt: enrichedPrompt,
        dominantElement,
        cuisine: cuisineEntry?.cuisine ?? undefined,
        topIngredients,
        birthData,
        dietPreference: diet || "omnivore",
        alchemicalState: esms,
        thermodynamicProperties: alchemized?.thermodynamicProperties,
        disallowedIngredients: disallowedIngredients ?? undefined,
        userId: userId ?? undefined,
        tier: isPremiumUser ? "premium" : "free",
      }),
    });

    if (!agentResponse.ok) {
      const upstreamBody = (await agentResponse
        .json()
        .catch(() => ({}))) as Record<string, unknown>;
      const upstreamDetail =
        typeof upstreamBody.detail === "string"
          ? upstreamBody.detail
          : typeof upstreamBody.message === "string"
            ? upstreamBody.message
            : null;
      return new Response(
        JSON.stringify({
          error: "Failed to generate recipe via agents network",
          upstreamStatus: agentResponse.status,
          upstreamDetail,
        }),
        {
          // PA's recipe orchestrator returns 502 on retry exhaustion; we
          // forward that as-is. A 404 from PA means the new endpoint
          // isn't deployed yet — surface as 502 so the client gets a
          // uniform "upstream not ready" signal instead of a misleading
          // "not found".
          status: agentResponse.status === 404 ? 502 : agentResponse.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // PA already validates its response against a Pydantic mirror of
    // cosmicRecipeSchema before sending. We do a defensive Zod parse
    // here so any future drift between the two schemas surfaces at the
    // WTEN edge instead of leaking malformed data to the client.
    const parsed = (await agentResponse.json()) as unknown;
    const validation = cosmicRecipeSchema.safeParse(parsed);
    if (!validation.success) {
      console.error(
        "[generate-cosmic-recipe] PA returned recipe that failed local schema check:",
        validation.error.issues.slice(0, 5),
      );
      return new Response(
        JSON.stringify({
          error: "Recipe schema drift between PA and WTEN",
          issues: validation.error.issues
            .slice(0, 5)
            .map((i) => ({ path: i.path.join("."), message: i.message })),
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }
    recipe = validation.data;
  } catch (error) {
    console.error("[generate-cosmic-recipe] Error calling planetary agents API:", error);
    // A deadline breach is an UPSTREAM failure, not a WTEN crash. Reporting it
    // as 504 rather than 500 keeps `serverErrorRate` and the route-health panel
    // pointing at the service that actually owns the latency.
    //
    // NOTE: the ESMS debit above happens BEFORE this call, and this exit —
    // like the existing non-ok exit — returns without refunding it. That
    // "charged but no recipe" hole predates this change; the deadline makes it
    // reachable more often and it needs closing on its own.
    // Name check WITHOUT `instanceof Error`. `AbortSignal.timeout` rejects
    // with a DOMException; Node 22 makes that an Error subclass, but a
    // different realm (jest's node environment, a bundler shim) does not, and
    // there the instanceof silently returns false and every upstream timeout
    // gets misreported as a WTEN 500. `[MEASURED 2026-08-19]` real Node
    // v22.23.1: `instanceof Error` true; jest node env: false. The `.name` is
    // "TimeoutError" in both.
    const timedOut =
      typeof error === "object" &&
      error !== null &&
      (error as { name?: unknown }).name === "TimeoutError";
    return new Response(
      JSON.stringify({
        error: timedOut
          ? "Agents network timed out generating the recipe"
          : "Internal server error contacting agents network",
        ...(timedOut ? { upstreamTimeoutMs: PA_TIMEOUT_MS } : {}),
      }),
      {
        status: timedOut ? 504 : 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Increment recipes_generated count atomically in user_daily_limits for free-tier users
  let updatedCount = 0;
  if (access.mode === "auth") {
    try {
      const sub = await subscriptionService.getUserSubscription(access.userId);
      const isPremium = sub?.tier === "premium";

      if (!isPremium) {
        const { executeQuery } = await import("@/lib/database");
        const updateResult = await executeQuery(
          `INSERT INTO user_daily_limits (user_id, date, recipes_generated)
           VALUES ($1, CURRENT_DATE, 1)
           ON CONFLICT (user_id, date)
           DO UPDATE SET recipes_generated = user_daily_limits.recipes_generated + 1
           RETURNING recipes_generated`,
          [access.userId]
        );
        updatedCount = updateResult.rows[0]?.recipes_generated ?? 1;
      }
    } catch (err) {
      console.warn("[generate-cosmic-recipe] Failed to increment daily limits:", err);
    }
  }

  // Spread the recipe at the top level so the existing client
  // (CosmicRecipeGenerator → data.title / data.short_description / ...)
  // continues to work. The `success: true` sentinel is what the
  // synthetic-cosmic-recipe probe checks at HTTP 200.
  let responseJson: Record<string, unknown> = {
    success: true,
    ...recipe,
    recipesGeneratedToday: updatedCount,
  };

  if (demoMode) {
    responseJson = {
      ...responseJson,
      demo: true,
      demoRemaining: access.mode === "demo" ? access.demoRemaining : undefined,
    };
  }

  return new Response(JSON.stringify(responseJson), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST = withObservability(
  { routeName: "/api/generate-cosmic-recipe" },
  handlePost,
);
