/**
 * Alchm MCP Tool Handlers
 *
 * Pure handler functions extracted from the MCP server entrypoint so
 * they can be exercised in three places:
 *
 *   1. The stdio MCP server (mcp-server/src/index.ts) — production
 *      surface for external LLM clients.
 *   2. The synthetic-mcp cron probe (src/services/syntheticProbeService)
 *      — calls handlers in-process to catch breakage at the alchemy
 *      pipeline layer.
 *   3. Unit tests (mcp-server/src/__tests__/tools.test.ts).
 *
 * Each handler returns a structured `ToolResult` rather than the raw
 * MCP `content[]` envelope — `index.ts` wraps it for the wire, the
 * synthetic probe / tests inspect it directly.
 *
 * @file mcp-server/src/tools.ts
 */

import { randomUUID } from "node:crypto";
import { executeQuery } from "@/lib/database/connection";
import { evaluateTriplicateSynastry } from "@/lib/economy/triplicatePricing";
import { alchemicalService } from "@/services/AlchemicalService";
import { feedDatabase } from "@/services/feedDatabaseService";
import { ingredientService } from "@/services/IngredientService";
import { calculateNatalChart } from "@/services/natalChartService";
import { recipeReflectionsService } from "@/services/recipeReflectionsService";
import { recipeService } from "@/services/RecipeService";
import type { TokenType } from "@/types/economy";
import { debitForTool, resolveCaller, type DebitOutcome, type ResolvedCaller } from "./auth";
import { recordInvocation } from "./invocationLog";
import { checkMcpRateLimit } from "./rateLimit";
import {
  computeSynastryOverlay,
  getTransitNatalOverlay,
} from "./synastryTools";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isTokenType(val: unknown): val is TokenType {
  return val === "Spirit" || val === "Essence" || val === "Matter" || val === "Substance";
}

function isDominantElement(val: unknown): val is "Fire" | "Water" | "Earth" | "Air" {
  return val === "Fire" || val === "Water" || val === "Earth" || val === "Air";
}

export interface ToolResult<T = unknown> {
  ok: boolean;
  data: T | null;
  /** Stable error code for caller-side handling. */
  errorCode?: "INVALID_ARGS" | "QUOTA" | "INTERNAL" | "NOT_FOUND" | "RATE_LIMIT";
  errorMessage?: string;
  /** Small object suitable for persisting in `mcp_invocations.result_summary`. */
  summary: Record<string, unknown>;
}

export interface TransitsArgs {
  latitude?: number;
  longitude?: number;
}

export interface AlchemizeArgs {
  ingredients: string[];
}

export interface CosmicRecipeArgs {
  prompt?: string;
  cuisine?: string;
  dietary?: string[];
  dominantElement?: "Fire" | "Water" | "Earth" | "Air";
}

export interface TriplicateSynastryArgs {
  makerId?: string;
  takerId?: string;
  makerNatal?: unknown;
  takerNatal?: unknown;
  giveToken?: string;
  giveAmount?: number;
  wantToken?: string;
  wantAmount?: number;
  transitTime?: string;
}

export interface EvidenceSnapshotArgs {
  latitude?: number;
  longitude?: number;
  ingredients?: string[];
  prompt?: string;
  cuisine?: string;
  dietary?: string[];
  dominantElement?: "Fire" | "Water" | "Earth" | "Air";
}

export interface SubmitRecipeReflectionArgs {
  recipeId?: string;
  recipeName?: string;
  reflection?: string;
  agentSlug?: string;
  agentName?: string;
  dominantElement?: string;
  source?: string;
}

/** Compute live planetary transits + elemental balance for a coordinate. */
export async function getLiveSkyTransits(
  args: TransitsArgs,
): Promise<ToolResult> {
  const lat = typeof args.latitude === "number" ? args.latitude : 40.7498;
  const lon = typeof args.longitude === "number" ? args.longitude : -73.7976;

  const chart = await calculateNatalChart({
    dateTime: new Date().toISOString(),
    latitude: lat,
    longitude: lon,
    timezone: "UTC",
  });

  let dominant = "None";
  let maxVal = -1;
  for (const [el, val] of Object.entries(chart.elementalBalance)) {
    if (val > maxVal) {
      maxVal = val;
      dominant = el;
    }
  }

  const data = {
    timestamp: new Date().toISOString(),
    coordinates: { latitude: lat, longitude: lon },
    elementalBalance: chart.elementalBalance,
    dominantElement: dominant,
    planetaryPositions: chart.planetaryPositions,
  };

  return {
    ok: true,
    data,
    summary: {
      dominantElement: dominant,
      planetCount: Object.keys(chart.planetaryPositions ?? {}).length,
    },
  };
}

/** Translate raw ingredients into ESMS + thermodynamic metrics. */
export function alchemizeIngredients(
  args: AlchemizeArgs,
): Promise<ToolResult> {
  return Promise.resolve().then(() => {
    const inputIngredients = Array.isArray(args.ingredients)
      ? args.ingredients.filter((s): s is string => typeof s === "string" && s.length > 0)
      : [];
    if (inputIngredients.length === 0) {
      return {
        ok: false,
        data: null,
        errorCode: "INVALID_ARGS",
        errorMessage: "ingredients[] required",
        summary: { reason: "empty-ingredients" },
      };
    }

    const analyzed = inputIngredients.map((name) => {
      const item = ingredientService.getIngredientByName(name);
      const props = item?.elementalProperties ?? {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      };
      // An ingredient is not a chart — it has no planets — so its quantities can
      // only come from its own curated data. They must NEVER be synthesized from
      // its elements: quantities and elements are orthogonal readings (see the
      // header of src/utils/planetaryAlchemyMapping.ts). This previously returned
      // spirit = Fire * 100, i.e. the elemental vector wearing an ESMS label.
      // Only part of the catalog carries curated quantities, so report null
      // rather than inventing a number an LLM client would treat as real.
      const stored = item?.alchemicalProperties;
      return {
        name,
        resolvedName: item?.name ?? "Unknown Alchemical Flora",
        category: item?.category ?? "uncategorized",
        esms: stored
          ? {
              spirit: Math.round(stored.Spirit * 100),
              essence: Math.round(stored.Essence * 100),
              matter: Math.round(stored.Matter * 100),
              substance: Math.round(stored.Substance * 100),
            }
          : null,
        esmsSource: stored ? ("ingredient-data" as const) : null,
        elementalProperties: props,
        planetaryRuler: item?.planetaryRuler ?? "none",
      };
    });

    const averageProps = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    for (const item of analyzed) {
      averageProps.Fire += item.elementalProperties.Fire;
      averageProps.Water += item.elementalProperties.Water;
      averageProps.Earth += item.elementalProperties.Earth;
      averageProps.Air += item.elementalProperties.Air;
    }
    const len = analyzed.length;
    averageProps.Fire /= len;
    averageProps.Water /= len;
    averageProps.Earth /= len;
    averageProps.Air /= len;

    // Aggregate only over ingredients that actually carry quantities.
    const withEsms = analyzed.filter(
      (a): a is typeof a & { esms: NonNullable<typeof a.esms> } => a.esms !== null,
    );
    const aggregateBalances =
      withEsms.length > 0
        ? {
            spirit: Math.round(withEsms.reduce((s, a) => s + a.esms.spirit, 0) / withEsms.length),
            essence: Math.round(withEsms.reduce((s, a) => s + a.esms.essence, 0) / withEsms.length),
            matter: Math.round(withEsms.reduce((s, a) => s + a.esms.matter, 0) / withEsms.length),
            substance: Math.round(withEsms.reduce((s, a) => s + a.esms.substance, 0) / withEsms.length),
          }
        : null;

    const harmony = alchemicalService.analyzeAlchemicalHarmony(
      analyzed.map((a) => a.elementalProperties),
    );
    const thermo = alchemicalService.calculateThermodynamicProperties(averageProps);

    const data = {
      ingredientCount: len,
      ingredients: analyzed,
      // null when no supplied ingredient carries curated quantities. Elements are
      // always present; quantities are not, and are not derivable from elements.
      aggregateBalances,
      esmsCoverage: { withQuantities: withEsms.length, total: len },
      overallHarmony: harmony.overallHarmony,
      dominantElement: harmony.dominantElement,
      thermodynamics: thermo,
      recommendations: harmony.recommendations,
    };

    return {
      ok: true,
      data,
      summary: {
        ingredientCount: len,
        overallHarmony: harmony.overallHarmony,
        dominantElement: harmony.dominantElement,
      },
    };
  });
}

/** Discover cosmos-aligned recipes from the catalog. */
export async function generateCosmicRecipe(
  args: CosmicRecipeArgs,
): Promise<ToolResult> {
  const prompt = typeof args.prompt === "string" ? args.prompt.toLowerCase() : "";
  const cuisine = typeof args.cuisine === "string" ? args.cuisine : undefined;
  const dietary = Array.isArray(args.dietary) ? args.dietary : undefined;
  const domElem = typeof args.dominantElement === "string" ? args.dominantElement : undefined;

  const criteria: Record<string, unknown> = {
    cuisine,
    dietaryRestrictions: dietary,
    limit: 50,
  };

  const rawRecipes = await recipeService.searchRecipes(criteria);
  let filtered = [...rawRecipes];

  if (prompt) {
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(prompt) ||
        (r.description ?? "").toLowerCase().includes(prompt),
    );
  }

  if (domElem) {
    filtered = filtered.filter((r) => {
      const props = r.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
      let maxVal = -1;
      let activeDom = "Fire";
      for (const [el, val] of Object.entries(props)) {
        if (val > maxVal) {
          maxVal = val;
          activeDom = el;
        }
      }
      return activeDom === domElem;
    });
  }

  const finalRecipes = filtered.slice(0, 5).map((r) => {
    const props = r.elementalProperties || { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      cuisine: r.cuisine ?? "Cosmic",
      prepTime: r.timeToMake ?? "30 MIN",
      servings: r.numberOfServings ?? 2,
      // A recipe has no planets, and the Recipe type carries no curated
      // quantities (elementalProperties is its only such reading — see
      // src/types/recipe.ts). This field previously returned spirit = Fire * 100,
      // i.e. the elemental vector relabelled. Quantities are not derivable from
      // elements, so report their absence and surface the real elemental data.
      esms: null,
      esmsSource: null,
      elementalProperties: props,
      isVegetarian: r.isVegetarian,
      isVegan: r.isVegan,
      isGlutenFree: r.isGlutenFree,
      isDairyFree: r.isDairyFree,
      ingredients: r.ingredients.map(
        (ing) =>
          `${ing.amount} ${ing.unit} ${ing.name} ${ing.preparation ? `(${ing.preparation})` : ""}`,
      ),
      instructions: r.instructions,
    };
  });

  const data = {
    totalMatching: filtered.length,
    returnedCount: finalRecipes.length,
    recipes: finalRecipes,
  };

  return {
    ok: true,
    data,
    summary: {
      totalMatching: filtered.length,
      returnedCount: finalRecipes.length,
      filters: {
        prompt: prompt || null,
        cuisine: cuisine ?? null,
        dominantElement: domElem ?? null,
        dietary: dietary ?? null,
      },
    },
  };
}

/**
 * Expose Triplicate Synastry evaluation over MCP.
 * Evaluates natal A + natal B + transit sky harmonic resonance.
 */
function validateTriplicateArgs(args: TriplicateSynastryArgs): {
  valid: true;
  makerId: string;
  takerId: string;
  giveToken: TokenType;
  wantToken: TokenType;
  giveAmount: number;
  wantAmount: number;
} | {
  valid: false;
  errorMessage: string;
  reason: string;
} {
  const { makerId, takerId, makerNatal, takerNatal, giveToken, giveAmount, wantToken, wantAmount } = args;

  if (typeof makerId !== "string" || !makerId.trim()) {
    return { valid: false, errorMessage: "Missing or invalid 'makerId' (must be a non-empty string)", reason: "invalid-makerId" };
  }
  if (typeof takerId !== "string" || !takerId.trim()) {
    return { valid: false, errorMessage: "Missing or invalid 'takerId' (must be a non-empty string)", reason: "invalid-takerId" };
  }
  if (!isRecord(makerNatal) && !Array.isArray(makerNatal)) {
    return { valid: false, errorMessage: "Missing or invalid 'makerNatal' (must be an object or array)", reason: "invalid-makerNatal" };
  }
  if (!isRecord(takerNatal) && !Array.isArray(takerNatal)) {
    return { valid: false, errorMessage: "Missing or invalid 'takerNatal' (must be an object or array)", reason: "invalid-takerNatal" };
  }
  if (!isTokenType(giveToken)) {
    return { valid: false, errorMessage: "Invalid 'giveToken' (must be 'Spirit', 'Essence', 'Matter', or 'Substance')", reason: "invalid-giveToken" };
  }
  if (typeof giveAmount !== "number" || !Number.isFinite(giveAmount) || giveAmount <= 0) {
    return { valid: false, errorMessage: "Missing or invalid 'giveAmount' (must be a positive number)", reason: "invalid-giveAmount" };
  }
  if (!isTokenType(wantToken)) {
    return { valid: false, errorMessage: "Invalid 'wantToken' (must be 'Spirit', 'Essence', 'Matter', or 'Substance')", reason: "invalid-wantToken" };
  }
  if (typeof wantAmount !== "number" || !Number.isFinite(wantAmount) || wantAmount <= 0) {
    return { valid: false, errorMessage: "Missing or invalid 'wantAmount' (must be a positive number)", reason: "invalid-wantAmount" };
  }

  return {
    valid: true,
    makerId,
    takerId,
    giveToken,
    wantToken,
    giveAmount,
    wantAmount,
  };
}

/**
 * Expose Triplicate Synastry evaluation over MCP.
 * Evaluates natal A + natal B + transit sky harmonic resonance.
 */
export function computeTriplicateSynastry(
  args: TriplicateSynastryArgs,
): ToolResult {
  const check = validateTriplicateArgs(args);
  if (!check.valid) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: check.errorMessage,
      summary: { reason: check.reason },
    };
  }

  const { makerId, takerId, giveToken, wantToken, giveAmount, wantAmount } = check;
  const { makerNatal, takerNatal, transitTime } = args;

  let date: Date | undefined;
  if (typeof transitTime === "string") {
    const parsed = new Date(transitTime);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  const evaluation = evaluateTriplicateSynastry({
    makerId,
    takerId,
    makerNatal,
    takerNatal,
    giveToken,
    giveAmount,
    wantToken,
    wantAmount,
    ...(date ? { date } : {}),
  });

  const resonanceBonusPct = Math.round(evaluation.beta * 100);

  const data = {
    qualifies: evaluation.qualifies,
    resonanceBonusPct,
    aspectDescription: evaluation.aspectDescription,
    transitCatalyst: evaluation.transitCatalyst,
    primaryTransitPlanet: evaluation.primaryTransitPlanet,
    aspectType: evaluation.aspectType,
    elementalConcentration: evaluation.elementalConcentration,
    windowKey: evaluation.windowKey,
    makerRebateAmount: evaluation.makerRebateAmount,
    takerRebateAmount: evaluation.takerRebateAmount,
    beta: evaluation.beta,
  };

  return {
    ok: true,
    data,
    summary: {
      qualifies: evaluation.qualifies,
      resonanceBonusPct,
      windowKey: evaluation.windowKey,
    },
  };
}

/**
 * Bundles live sky transits, ingredient scanning, and cosmic recipe candidates
 * into a single JSON-RPC round-trip for external agent deliberation & caching.
 */
export async function createEvidenceSnapshot(
  args: EvidenceSnapshotArgs,
): Promise<ToolResult> {
  const transitsArgs: TransitsArgs = {
    ...(typeof args.latitude === "number" ? { latitude: args.latitude } : {}),
    ...(typeof args.longitude === "number" ? { longitude: args.longitude } : {}),
  };

  const rawIngredients = args.ingredients;
  const filteredIngredients = Array.isArray(rawIngredients)
    ? rawIngredients.filter((i): i is string => typeof i === "string" && i.trim().length > 0)
    : [];

  const rawDietary = args.dietary;
  const recipeArgs: CosmicRecipeArgs = {
    ...(typeof args.prompt === "string" ? { prompt: args.prompt } : {}),
    ...(typeof args.cuisine === "string" ? { cuisine: args.cuisine } : {}),
    ...(Array.isArray(rawDietary)
      ? { dietary: rawDietary.filter((d): d is string => typeof d === "string") }
      : {}),
    ...(isDominantElement(args.dominantElement)
      ? { dominantElement: args.dominantElement }
      : {}),
  };

  const [liveSkyResult, alchemicalResult, cosmicRecipeResult] = await Promise.all([
    getLiveSkyTransits(transitsArgs),
    filteredIngredients.length > 0
      ? alchemizeIngredients({ ingredients: filteredIngredients })
      : Promise.resolve(null),
    generateCosmicRecipe(recipeArgs),
  ]);

  const snapshotId = randomUUID();
  const timestamp = new Date().toISOString();

  const data = {
    snapshotId,
    liveSky: liveSkyResult.data,
    alchemicalScan: alchemicalResult ? alchemicalResult.data : null,
    candidateRecipes: cosmicRecipeResult.data,
    timestamp,
  };

  return {
    ok: true,
    data,
    summary: {
      snapshotId,
      timestamp,
      hasAlchemicalScan: alchemicalResult !== null,
      liveSkyOk: liveSkyResult.ok,
      recipesOk: cosmicRecipeResult.ok,
    },
  };
}

async function resolveReflectionAuthor(
  agentSlug: string | undefined,
  agentName: string | undefined,
  caller: ResolvedCaller,
): Promise<{ authorId: string | null; resolvedAgentName: string | null; isAgentAuthor: boolean }> {
  let authorId = caller.userId;
  let resolvedAgentName = typeof agentName === "string" ? agentName : null;
  let isAgentAuthor = false;

  if (typeof agentSlug === "string" && agentSlug.trim()) {
    const slug = agentSlug.trim().toLowerCase();
    try {
      const agentRes = await executeQuery<{ id: string; name: string | null }>(
        `SELECT u.id, COALESCE(up.name, u.name) AS name
           FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
          WHERE u.is_agent = true AND (lower(u.email) = lower($1) || '@agentic.alchm.kitchen' OR u.id = $1)
          LIMIT 1`,
        [slug],
      );
      const [row] = agentRes.rows;
      if (row) {
        authorId = row.id;
        if (!resolvedAgentName && row.name) {
          resolvedAgentName = row.name;
        }
        isAgentAuthor = true;
      }
    } catch (err) {
      process.stderr.write(`[mcp/submit_recipe_reflection] agent lookup failed: ${String(err)}\n`);
    }
  }

  return { authorId, resolvedAgentName, isAgentAuthor };
}

function formatReflectionTimestamp(createdAt: unknown): string {
  if (typeof createdAt === "string") return createdAt;
  if (createdAt instanceof Date && !Number.isNaN(createdAt.getTime())) {
    return createdAt.toISOString();
  }
  return new Date().toISOString();
}

/**
 * Submits an authentic culinary critique/reflection from an external agent,
 * persisting to recipe_reflections, dual-writing to user_recipe_interactions,
 * and publishing to feed_events.
 */
export async function submitRecipeReflection(
  args: SubmitRecipeReflectionArgs,
  caller: ResolvedCaller,
): Promise<ToolResult> {
  const { recipeId, recipeName, reflection, agentSlug, agentName, dominantElement, source } = args;

  if (typeof recipeId !== "string" || !recipeId.trim()) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: "Missing or invalid 'recipeId' (must be a non-empty string)",
      summary: { reason: "invalid-recipeId" },
    };
  }

  if (typeof reflection !== "string" || !reflection.trim()) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: "Missing or invalid 'reflection' (must be a non-empty string)",
      summary: { reason: "invalid-reflection" },
    };
  }

  const { authorId, resolvedAgentName, isAgentAuthor } = await resolveReflectionAuthor(agentSlug, agentName, caller);

  if (!authorId) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage: "Cannot resolve author: caller is not authenticated and no valid agentSlug was provided",
      summary: { reason: "unresolvable-author" },
    };
  }

  const effectiveSource = typeof source === "string" && source.trim() ? source.trim() : "mcp_reflection";

  // 1. Create durable reflection record
  const createdReflection = await recipeReflectionsService.createReflection({
    recipeId,
    authorId,
    source: effectiveSource,
    contentState: "reviewed",
    review: reflection.trim(),
    isAgent: isAgentAuthor,
    provenance: {
      mcpCaller: caller.caller,
      ...(agentSlug ? { agentSlug } : {}),
      ...(caller.apiKeyId ? { apiKeyId: caller.apiKeyId } : {}),
    },
  });

  // 2. Publish feed event & mirror to user_recipe_interactions
  let published = false;
  try {
    published = await feedDatabase.createEvent(
      authorId,
      "recipe_review",
      {
        recipeId,
        ...(recipeName ? { recipeName } : {}),
        review: reflection.trim(),
        source: effectiveSource,
        ...(agentSlug ? { agentSlug } : {}),
        ...(resolvedAgentName ? { agentName: resolvedAgentName } : {}),
        ...(dominantElement ? { dominantElement } : {}),
        recipeReflectionId: createdReflection.id,
        contentState: "reviewed",
        skipEconomyCharge: true, // 0.4 ESMS already settled via debitForTool
      },
      false,
      { share: true, explicit: true },
    );
  } catch (err) {
    process.stderr.write(`[mcp/submit_recipe_reflection] feed publication failed: ${String(err)}\n`);
  }

  const data = {
    reflectionId: createdReflection.id,
    recipeId,
    authorId,
    agentSlug: agentSlug ?? null,
    agentName: resolvedAgentName,
    reflection: reflection.trim(),
    published,
    timestamp: formatReflectionTimestamp(createdReflection.createdAt),
  };

  return {
    ok: true,
    data,
    summary: {
      reflectionId: createdReflection.id,
      recipeId,
      authorId,
      published,
    },
  };
}

// ─── Dispatch + invocation wrapper ────────────────────────────────────

export type ToolName =
  | "get_live_sky_transits"
  | "alchemize_ingredients"
  | "generate_cosmic_recipe"
  | "compute_synastry_overlay"
  | "get_transit_natal_overlay"
  | "compute_triplicate_synastry"
  | "create_evidence_snapshot"
  | "submit_recipe_reflection";

/**
 * Stringify an error and walk its `cause` chain so the root reason
 * lands in `mcp_invocations.error_message` instead of the outermost
 * wrapper. Bug surfaced when a 401 from a self-fetch was being masked
 * by "Failed to calculate natal chart." Cap the chain at 4 hops to
 * avoid pathological loops.
 */
function formatErrorWithCauseChain(err: unknown): string {
  const parts: string[] = [];
  let cursor: unknown = err;
  for (let hop = 0; hop < 4 && cursor != null; hop++) {
    if (cursor instanceof Error) {
      parts.push(cursor.message);
      cursor = (cursor as { cause?: unknown }).cause;
    } else {
      parts.push(String(cursor));
      break;
    }
  }
  return parts.length > 0 ? parts.join(" ← ") : "unknown";
}

function executeOtherTool(
  name: ToolName,
  args: Record<string, unknown>,
  caller: ResolvedCaller,
): Promise<ToolResult> | ToolResult {
  switch (name) {
    case "get_live_sky_transits":
      return getLiveSkyTransits(args);
    case "generate_cosmic_recipe":
      return generateCosmicRecipe(args);
    case "compute_synastry_overlay":
      return computeSynastryOverlay(args);
    case "get_transit_natal_overlay":
      return getTransitNatalOverlay(args);
    case "compute_triplicate_synastry":
      return computeTriplicateSynastry(args);
    case "create_evidence_snapshot":
      return createEvidenceSnapshot(args);
    case "submit_recipe_reflection":
      return submitRecipeReflection(args, caller);
    default:
      return {
        ok: false,
        data: null,
        errorCode: "NOT_FOUND",
        errorMessage: `Unknown tool: ${name}`,
        summary: { reason: "unknown-tool" },
      };
  }
}

/**
 * Single entry point used by both the stdio MCP server and the
 * in-process synthetic probe. Resolves the caller, debits tokens when
 * the tool has a cost, dispatches to the handler, and writes one row to
 * `mcp_invocations`.
 */
export async function invokeTool(
  name: ToolName,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  // performance.now() gives fractional-ms resolution so warm-cache calls
  // (well under 1ms) become distinguishable instead of all collapsing to
  // the integer floor. calledAtIso is captured in parallel because the
  // perf-mark isn't a wall-clock epoch and can't drive the called_at column.
  const startedAt = performance.now();
  const calledAtIso = new Date().toISOString();
  const caller = await resolveCaller(args);

  let result: ToolResult;
  let tokensDebited: DebitOutcome["amounts"] = null;

  // Per-key sliding-window cap, derived from api_keys.rate_limit_tier.
  // Synthetic-probe traffic is exempt because we don't want a slow
  // burst of cron probes to chew into a user's RPM, and anonymous
  // demo calls share a single bucket so an unauthenticated client
  // can't crowd authed traffic.
  if (!caller.isSynthetic) {
    const rl = checkMcpRateLimit({
      apiKeyId: caller.apiKeyId,
      rateLimitTier: caller.rateLimitTier,
    });
    if (!rl.allowed) {
      const retryAfterSec = Math.ceil(rl.resetMs / 1000);
      const earlyResult: ToolResult = {
        ok: false,
        data: null,
        errorCode: "RATE_LIMIT",
        errorMessage: `MCP rate limit exceeded: ${rl.limit}/min. Retry in ${retryAfterSec}s.`,
        summary: { reason: "rate-limited", limit: rl.limit, retryAfterSec },
      };
      void recordInvocation(
        {
          toolName: name,
          arguments: args,
          caller: caller.caller,
          userId: caller.userId,
          apiKeyId: caller.apiKeyId,
        },
        { startedAt, calledAtIso },
        {
          success: false,
          errorMessage: earlyResult.errorMessage ?? null,
          resultSummary: earlyResult.summary,
          tokensDebited: null,
        },
      );
      return earlyResult;
    }
  }

  try {
    const debit = await debitForTool(name, caller);
    if (debit.reason?.startsWith("insufficient-")) {
      result = {
        ok: false,
        data: null,
        errorCode: "QUOTA",
        errorMessage: `MCP token quota: ${debit.reason}`,
        summary: { reason: debit.reason },
      };
    } else {
      tokensDebited = debit.amounts;
      if (name === "alchemize_ingredients") {
        result = await alchemizeIngredients(args as unknown as AlchemizeArgs);
      } else {
        result = await executeOtherTool(name, args, caller);
      }
    }
  } catch (err) {
    result = {
      ok: false,
      data: null,
      errorCode: "INTERNAL",
      errorMessage: formatErrorWithCauseChain(err),
      summary: { reason: "handler-threw" },
    };
  }

  // Fire-and-forget — don't let logging failures slow the tool down.
  void recordInvocation(
    {
      toolName: name,
      arguments: args,
      caller: caller.caller,
      userId: caller.userId,
      apiKeyId: caller.apiKeyId,
    },
    { startedAt, calledAtIso },
    {
      success: result.ok,
      errorMessage: result.errorMessage ?? null,
      resultSummary: result.summary,
      tokensDebited: tokensDebited ?? null,
    },
  );

  return result;
}

export type { DebitOutcome };
