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

import { executeQuery } from "@/lib/database/connection";
import { evaluateTriplicateSynastry } from "@/lib/economy/triplicatePricing";
import { alchemicalService } from "@/services/AlchemicalService";
import { feedDatabase } from "@/services/feedDatabaseService";
import { ingredientService } from "@/services/IngredientService";
import { calculateNatalChart } from "@/services/natalChartService";
import { recipeReflectionsService } from "@/services/recipeReflectionsService";
import { recipeService } from "@/services/RecipeService";
import type { TokenType } from "@/types/economy";
import {
  debitForTool,
  resolveCaller,
  type DebitOutcome,
  type ResolvedCaller,
} from "./auth";
import { isToolName, type ToolName } from "./catalog";
import {
  buildEvidenceSnapshot,
  type EvidenceSnapshot,
} from "./evidenceSnapshot";
import {
  correlationIdFor,
  getMcpInvocationContext,
  runMcpInvocation,
  type InvocationOptions,
} from "./execution";
import { recordInvocation } from "./invocationLog";
import { checkMcpRateLimit } from "./rateLimit";
import {
  computeSynastryOverlay,
  getTransitNatalOverlay,
} from "./synastryTools";
import { validateToolArguments } from "./validation";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

function isTokenType(val: unknown): val is TokenType {
  return (
    val === "Spirit" ||
    val === "Essence" ||
    val === "Matter" ||
    val === "Substance"
  );
}

function isDominantElement(
  val: unknown,
): val is "Fire" | "Water" | "Earth" | "Air" {
  return val === "Fire" || val === "Water" || val === "Earth" || val === "Air";
}

export interface ToolResult<T = unknown> {
  ok: boolean;
  data: T | null;
  /** Stable error code for caller-side handling. */
  errorCode?:
    | "INVALID_ARGS"
    | "QUOTA"
    | "INTERNAL"
    | "NOT_FOUND"
    | "RATE_LIMIT"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "UNAVAILABLE"
    | "BUSY"
    | "CANCELLED";
  errorMessage?: string;
  correlationId?: string;
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
  return captureLiveSkyTransits(args, new Date().toISOString());
}

function hasSkyPosition(position: unknown): boolean {
  return typeof position === "string"
    ? Boolean(position.trim())
    : isRecord(position) &&
        typeof position.sign === "string" &&
        Boolean(position.sign.trim());
}

function hasCompleteSky(positions: unknown, elements: unknown): boolean {
  if (!isRecord(positions) || !isRecord(elements)) return false;
  return (
    Object.keys(positions).length > 0 &&
    Object.values(positions).every(hasSkyPosition) &&
    ["Fire", "Water", "Earth", "Air"].every(
      (element) =>
        typeof elements[element] === "number" &&
        Number.isFinite(elements[element]),
    ) &&
    Object.values(elements).every(
      (value) => typeof value === "number" && Number.isFinite(value),
    )
  );
}

function dominantSkyElement(elements: Record<string, number>): string {
  let dominant = "None";
  let maximum = -1;
  for (const [element, value] of Object.entries(elements)) {
    if (value > maximum) {
      maximum = value;
      dominant = element;
    }
  }
  return dominant;
}

async function captureLiveSkyTransits(
  args: TransitsArgs,
  timestamp: string,
): Promise<ToolResult> {
  const lat = typeof args.latitude === "number" ? args.latitude : 40.7498;
  const lon = typeof args.longitude === "number" ? args.longitude : -73.7976;

  const chart = await calculateNatalChart(
    {
      dateTime: timestamp,
      latitude: lat,
      longitude: lon,
      timezone: "UTC",
    },
    getMcpInvocationContext(),
  );

  if (!hasCompleteSky(chart.planetaryPositions, chart.elementalBalance)) {
    return {
      ok: false,
      data: null,
      errorCode: "INTERNAL",
      errorMessage: "Sky calculation returned incomplete evidence",
      summary: { reason: "incomplete-sky-evidence" },
    };
  }

  const dominant = dominantSkyElement(chart.elementalBalance);

  const data = {
    timestamp,
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
      planetCount: Object.keys(chart.planetaryPositions).length,
    },
  };
}

/** Translate raw ingredients into ESMS + thermodynamic metrics. */
export function alchemizeIngredients(args: AlchemizeArgs): Promise<ToolResult> {
  return Promise.resolve().then(() => {
    const inputIngredients = Array.isArray(args.ingredients)
      ? args.ingredients.filter(
          (s): s is string => typeof s === "string" && s.length > 0,
        )
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
      (a): a is typeof a & { esms: NonNullable<typeof a.esms> } =>
        a.esms !== null,
    );
    const aggregateBalances =
      withEsms.length > 0
        ? {
            spirit: Math.round(
              withEsms.reduce((s, a) => s + a.esms.spirit, 0) / withEsms.length,
            ),
            essence: Math.round(
              withEsms.reduce((s, a) => s + a.esms.essence, 0) /
                withEsms.length,
            ),
            matter: Math.round(
              withEsms.reduce((s, a) => s + a.esms.matter, 0) / withEsms.length,
            ),
            substance: Math.round(
              withEsms.reduce((s, a) => s + a.esms.substance, 0) /
                withEsms.length,
            ),
          }
        : null;

    const harmony = alchemicalService.analyzeAlchemicalHarmony(
      analyzed.map((a) => a.elementalProperties),
    );
    const thermo =
      alchemicalService.calculateThermodynamicProperties(averageProps);

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
  const prompt =
    typeof args.prompt === "string" ? args.prompt.toLowerCase() : "";
  const cuisine = typeof args.cuisine === "string" ? args.cuisine : undefined;
  const dietary = Array.isArray(args.dietary) ? args.dietary : undefined;
  const domElem =
    typeof args.dominantElement === "string" ? args.dominantElement : undefined;

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
      const props = r.elementalProperties;
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
    const props = r.elementalProperties;
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
interface ValidatedTriplicateArgs {
  valid: true;
  makerId: string;
  takerId: string;
  giveToken: TokenType;
  wantToken: TokenType;
  giveAmount: number;
  wantAmount: number;
}

interface InvalidTriplicateArgs {
  valid: false;
  errorMessage: string;
  reason: string;
}

const TRIPLICATE_ERRORS = {
  makerId: "Missing or invalid 'makerId' (must be a non-empty string)",
  takerId: "Missing or invalid 'takerId' (must be a non-empty string)",
  makerNatal: "Missing or invalid 'makerNatal' (must be an object or array)",
  takerNatal: "Missing or invalid 'takerNatal' (must be an object or array)",
  giveToken:
    "Invalid 'giveToken' (must be 'Spirit', 'Essence', 'Matter', or 'Substance')",
  wantToken:
    "Invalid 'wantToken' (must be 'Spirit', 'Essence', 'Matter', or 'Substance')",
  giveAmount: "Missing or invalid 'giveAmount' (must be a positive number)",
  wantAmount: "Missing or invalid 'wantAmount' (must be a positive number)",
};

function invalidTriplicate(
  field: keyof typeof TRIPLICATE_ERRORS,
): InvalidTriplicateArgs {
  return {
    valid: false,
    errorMessage: TRIPLICATE_ERRORS[field],
    reason: `invalid-${field}`,
  };
}

function isPositiveAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function validateTriplicateArgs(
  args: TriplicateSynastryArgs,
): ValidatedTriplicateArgs | InvalidTriplicateArgs {
  const {
    makerId,
    takerId,
    makerNatal,
    takerNatal,
    giveToken,
    giveAmount,
    wantToken,
    wantAmount,
  } = args;
  if (typeof makerId !== "string" || !makerId.trim())
    return invalidTriplicate("makerId");
  if (typeof takerId !== "string" || !takerId.trim())
    return invalidTriplicate("takerId");
  if (!isRecord(makerNatal) && !Array.isArray(makerNatal))
    return invalidTriplicate("makerNatal");
  if (!isRecord(takerNatal) && !Array.isArray(takerNatal))
    return invalidTriplicate("takerNatal");
  if (!isTokenType(giveToken)) return invalidTriplicate("giveToken");
  if (!isPositiveAmount(giveAmount)) return invalidTriplicate("giveAmount");
  if (!isTokenType(wantToken)) return invalidTriplicate("wantToken");
  if (!isPositiveAmount(wantAmount)) return invalidTriplicate("wantAmount");
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

  const { makerId, takerId, giveToken, wantToken, giveAmount, wantAmount } =
    check;
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
): Promise<ToolResult<EvidenceSnapshot>> {
  const timestamp = new Date().toISOString();
  const transitsArgs: TransitsArgs = {
    ...(typeof args.latitude === "number" ? { latitude: args.latitude } : {}),
    ...(typeof args.longitude === "number"
      ? { longitude: args.longitude }
      : {}),
  };

  const rawIngredients = args.ingredients;
  const filteredIngredients = Array.isArray(rawIngredients)
    ? rawIngredients.filter(
        (i): i is string => typeof i === "string" && i.trim().length > 0,
      )
    : [];

  const rawDietary = args.dietary;
  const recipeArgs: CosmicRecipeArgs = {
    ...(typeof args.prompt === "string" ? { prompt: args.prompt } : {}),
    ...(typeof args.cuisine === "string" ? { cuisine: args.cuisine } : {}),
    ...(Array.isArray(rawDietary)
      ? {
          dietary: rawDietary.filter((d): d is string => typeof d === "string"),
        }
      : {}),
    ...(isDominantElement(args.dominantElement)
      ? { dominantElement: args.dominantElement }
      : {}),
  };

  const [liveSkyResult, alchemicalResult, cosmicRecipeResult] =
    await Promise.allSettled([
      captureLiveSkyTransits(transitsArgs, timestamp),
      filteredIngredients.length > 0
        ? alchemizeIngredients({ ingredients: filteredIngredients })
        : Promise.resolve(null),
      generateCosmicRecipe(recipeArgs),
    ]);

  const data = buildEvidenceSnapshot(
    timestamp,
    {
      liveSky: liveSkyResult,
      alchemicalScan: alchemicalResult,
      candidateRecipes: cosmicRecipeResult,
    },
    filteredIngredients.length > 0,
  );
  const complete = data.status === "complete";

  return {
    ok: complete,
    data,
    ...(!complete
      ? {
          errorCode: "INTERNAL" as const,
          errorMessage:
            "One or more required evidence sources failed; inspect snapshot provenance",
        }
      : {}),
    summary: {
      snapshotId: data.snapshotId,
      timestamp,
      contentHash: data.contentHash,
      status: data.status,
      hasAlchemicalScan:
        data.provenance.components.alchemicalScan.status === "success",
      liveSkyOk: data.provenance.components.liveSky.status === "success",
      recipesOk:
        data.provenance.components.candidateRecipes.status === "success",
    },
  };
}

interface ReflectionAuthor {
  authorId: string;
  resolvedAgentName: string | null;
  isAgentAuthor: boolean;
}

async function resolveReflectionAuthor(
  agentSlug: unknown,
  caller: ResolvedCaller,
): Promise<ReflectionAuthor | null> {
  if (!caller.userId || !caller.apiKeyId || caller.isSynthetic) return null;
  const slug =
    typeof agentSlug === "string" ? agentSlug.trim().toLowerCase() : null;
  // A key may speak only for its owner. A historical slug is a selector,
  // never authorization to impersonate a different account.
  const result = await executeQuery<{
    id: string;
    name: string | null;
    is_agent: boolean;
  }>(
    `SELECT u.id, COALESCE(up.name, u.name) AS name, u.is_agent
       FROM users u
  LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = $1
        AND ($2::text IS NULL OR (u.is_agent = true AND
          (lower(u.email) = $2 || '@agentic.alchm.kitchen' OR u.id::text = $2)))
      LIMIT 1`,
    [caller.userId, slug],
  );
  const [row] = result.rows;
  if (row?.id !== caller.userId) return null;
  return {
    authorId: row.id,
    resolvedAgentName: row.name,
    isAgentAuthor: row.is_agent === true,
  };
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
  authorizedAuthor?: ReflectionAuthor,
): Promise<ToolResult> {
  const {
    recipeId,
    recipeName,
    reflection,
    agentSlug,
    dominantElement,
    source,
  } = args;

  if (typeof recipeId !== "string" || !recipeId.trim()) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage:
        "Missing or invalid 'recipeId' (must be a non-empty string)",
      summary: { reason: "invalid-recipeId" },
    };
  }

  if (typeof reflection !== "string" || !reflection.trim()) {
    return {
      ok: false,
      data: null,
      errorCode: "INVALID_ARGS",
      errorMessage:
        "Missing or invalid 'reflection' (must be a non-empty string)",
      summary: { reason: "invalid-reflection" },
    };
  }

  const author =
    authorizedAuthor ?? (await resolveReflectionAuthor(agentSlug, caller));

  if (!author) {
    return {
      ok: false,
      data: null,
      errorCode: "FORBIDDEN",
      errorMessage:
        "A reflection must be attributed to the authenticated API key owner",
      summary: { reason: "unresolvable-author" },
    };
  }

  const { authorId, resolvedAgentName, isAgentAuthor } = author;
  const effectiveSource =
    typeof source === "string" && source.trim()
      ? source.trim()
      : "mcp_reflection";

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
  let publicationReceipt: {
    feedPublished: boolean;
    legacyInteractionStatus: string;
    error?: string;
  } = {
    feedPublished: false,
    legacyInteractionStatus: "failed",
  };
  try {
    const receipt = await feedDatabase.publishFeedEvent({
      actorId: authorId,
      eventType: "recipe_review",
      metadataPayload: {
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
      identity: { share: true, explicit: true },
    });
    published = receipt.feedPublished;
    publicationReceipt = {
      feedPublished: receipt.feedPublished,
      legacyInteractionStatus: receipt.legacyInteractionStatus,
      ...(receipt.error ? { error: receipt.error } : {}),
    };
  } catch (err) {
    publicationReceipt.error =
      "Feed publication failed; the reflection was saved";
    process.stderr.write(
      `[mcp/submit_recipe_reflection] feed publication failed: ${String(err)}\n`,
    );
  }

  const data = {
    reflectionId: createdReflection.id,
    recipeId,
    authorId,
    agentSlug: agentSlug ?? null,
    agentName: resolvedAgentName,
    reflection: reflection.trim(),
    published,
    publicationReceipt,
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
      legacyInteractionStatus: publicationReceipt.legacyInteractionStatus,
    },
  };
}

// ─── Dispatch + invocation wrapper ────────────────────────────────────

export type { ToolName } from "./catalog";

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
  reflectionAuthor?: ReflectionAuthor,
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
      return submitRecipeReflection(args, caller, reflectionAuthor);
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

interface ToolInvocationState {
  startedAt: number;
  calledAtIso: string;
  caller: ResolvedCaller;
  tokensDebited: DebitOutcome["amounts"];
}

interface ToolAuthorization {
  author?: ReflectionAuthor;
  failure?: ToolResult;
}

function toolFailure(
  errorCode: NonNullable<ToolResult["errorCode"]>,
  errorMessage: string,
): ToolResult {
  return {
    ok: false,
    data: null,
    errorCode,
    errorMessage,
    summary: { reason: errorCode.toLowerCase() },
  };
}

function createToolInvocationState(): ToolInvocationState {
  return {
    startedAt: performance.now(),
    calledAtIso: new Date().toISOString(),
    caller: {
      userId: null,
      apiKeyId: null,
      caller: "unknown",
      isSynthetic: false,
      rateLimitTier: null,
    },
    tokensDebited: null,
  };
}

function toolInvocationOptions(
  args: Record<string, unknown>,
  options: InvocationOptions,
): InvocationOptions & { correlationId: string } {
  const meta = isRecord(args) && isRecord(args._meta) ? args._meta : {};
  return {
    ...options,
    correlationId: correlationIdFor(
      meta.correlationId ?? meta.requestId ?? options.correlationId,
    ),
    ...(typeof meta.traceId === "string" ? { traceId: meta.traceId } : {}),
    ...(typeof meta.evidenceSnapshotId === "string"
      ? { evidenceSnapshotId: meta.evidenceSnapshotId }
      : {}),
  };
}

function callerPreflightFailure(caller: ResolvedCaller): ToolResult | null {
  if (caller.authError)
    return toolFailure(
      caller.authError === "INVALID_KEY" ? "UNAUTHORIZED" : "UNAVAILABLE",
      "API key authentication failed or is unavailable",
    );
  if (caller.isSynthetic) return null;
  const rl = checkMcpRateLimit({
    apiKeyId: caller.apiKeyId,
    rateLimitTier: caller.rateLimitTier,
  });
  if (rl.allowed) return null;
  const retryAfterSec = Math.ceil(rl.resetMs / 1000);
  return {
    ...toolFailure(
      "RATE_LIMIT",
      `MCP rate limit exceeded: ${rl.limit}/min. Retry in ${retryAfterSec}s.`,
    ),
    summary: { reason: "rate-limited", limit: rl.limit, retryAfterSec },
  };
}

async function authorizeTool(
  name: ToolName,
  args: Record<string, unknown>,
  caller: ResolvedCaller,
): Promise<ToolAuthorization> {
  if (
    name === "compute_synastry_overlay" &&
    args.cacheStrategy === "write" &&
    !caller.isSynthetic
  )
    return {
      failure: toolFailure(
        "FORBIDDEN",
        "Writing shared natal-chart caches requires the internal integration credential",
      ),
    };
  if (name !== "submit_recipe_reflection") return {};
  if (!caller.userId || !caller.apiKeyId || caller.isSynthetic)
    return {
      failure: toolFailure(
        "UNAUTHORIZED",
        "Recipe reflections require an authenticated, non-synthetic API key owner",
      ),
    };
  const author = await resolveReflectionAuthor(args.agentSlug, caller);
  if (!author)
    return {
      failure: toolFailure(
        "FORBIDDEN",
        "The requested reflection author does not belong to this API key",
      ),
    };
  return { author };
}

function paymentFailure(
  name: ToolName,
  caller: ResolvedCaller,
  debit: DebitOutcome,
): ToolResult | null {
  if (debit.reason?.startsWith("insufficient-"))
    return toolFailure("QUOTA", `MCP token quota: ${debit.reason}`);
  const exempt =
    debit.reason === "free-tool" ||
    debit.reason === "synthetic-probe-exempt" ||
    (debit.reason === "anonymous-caller" &&
      !caller.userId &&
      name !== "submit_recipe_reflection");
  if (!debit.applied && !exempt)
    return toolFailure(
      "UNAVAILABLE",
      "The MCP payment could not be settled; the tool was not executed",
    );
  return null;
}

function dispatchAuthorizedTool(
  name: ToolName,
  args: Record<string, unknown>,
  caller: ResolvedCaller,
  author?: ReflectionAuthor,
): Promise<ToolResult> | ToolResult {
  if (name !== "alchemize_ingredients")
    return executeOtherTool(name, args, caller, author);
  // Validated above; narrow without casting unchecked input.
  const { ingredients } = args;
  if (
    !Array.isArray(ingredients) ||
    !ingredients.every((item): item is string => typeof item === "string")
  )
    return toolFailure("INVALID_ARGS", "ingredients[] required");
  return alchemizeIngredients({ ingredients });
}

async function executeReadyTool(
  name: ToolName,
  args: Record<string, unknown>,
  state: ToolInvocationState,
): Promise<ToolResult> {
  const signal = getMcpInvocationContext()?.signal;
  signal?.throwIfAborted();
  const caller = await resolveCaller(args);
  state.caller = caller;
  const context = getMcpInvocationContext();
  if (context)
    context.caller = caller.caller
      .replace(/[^a-zA-Z0-9._:-]/g, "_")
      .slice(0, 64);
  const preflightFailure = callerPreflightFailure(caller);
  if (preflightFailure) return preflightFailure;
  const authorization = await authorizeTool(name, args, caller);
  if (authorization.failure) return authorization.failure;
  signal?.throwIfAborted();
  const debit = await debitForTool(name, caller);
  const unsettled = paymentFailure(name, caller, debit);
  if (unsettled) return unsettled;
  state.tokensDebited = debit.amounts;
  return dispatchAuthorizedTool(name, args, caller, authorization.author);
}

async function runValidatedTool(
  name: string,
  args: Record<string, unknown>,
  options: InvocationOptions,
  state: ToolInvocationState,
): Promise<ToolResult> {
  if (!isToolName(name))
    return toolFailure("NOT_FOUND", `Unknown tool: ${name}`);
  const invalid = validateToolArguments(name, args);
  if (invalid) return toolFailure("INVALID_ARGS", invalid);
  const completed = await runMcpInvocation(options, () =>
    executeReadyTool(name, args, state),
  );
  return (
    completed ??
    toolFailure(
      "BUSY",
      "The MCP server is at its four-call concurrency limit; retry later",
    )
  );
}

function isInvocationCancelled(err: unknown, signal?: AbortSignal): boolean {
  if (signal?.aborted ?? false) return true;
  return (
    err instanceof Error &&
    (err.name === "AbortError" ||
      err.message === "MCP request deadline exceeded")
  );
}

function completeToolInvocation(
  name: string,
  args: Record<string, unknown>,
  state: ToolInvocationState,
  result: ToolResult,
  correlationId: string,
): ToolResult {
  const { caller, tokensDebited, startedAt, calledAtIso } = state;
  result.correlationId = correlationId;
  result.summary = { ...result.summary, correlationId };
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
      tokensDebited,
    },
  );
  return result;
}

/**
 * Single entry point used by both the stdio MCP server and the
 * in-process synthetic probe. Resolves the caller, debits tokens when
 * the tool has a cost, dispatches to the handler, and writes one row to
 * `mcp_invocations`.
 */
export async function invokeTool(
  name: string,
  args: Record<string, unknown>,
  options: InvocationOptions = {},
): Promise<ToolResult> {
  const state = createToolInvocationState();
  const invocationOptions = toolInvocationOptions(args, options);
  let result: ToolResult;
  try {
    result = await runValidatedTool(name, args, invocationOptions, state);
  } catch (err) {
    result = toolFailure(
      isInvocationCancelled(err, options.signal) ? "CANCELLED" : "INTERNAL",
      formatErrorWithCauseChain(err),
    );
  }
  return completeToolInvocation(
    name,
    args,
    state,
    result,
    invocationOptions.correlationId,
  );
}

export type { DebitOutcome };
