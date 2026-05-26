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

import { alchemicalService } from "@/services/AlchemicalService";
import { ingredientService } from "@/services/IngredientService";
import { calculateNatalChart } from "@/services/natalChartService";
import { recipeService } from "@/services/RecipeService";
import { debitForTool, resolveCaller, type DebitOutcome } from "./auth";
import { recordInvocation } from "./invocationLog";
import {
  computeSynastryOverlay,
  getTransitNatalOverlay,
} from "./synastryTools";

export interface ToolResult<T = unknown> {
  ok: boolean;
  data: T | null;
  /** Stable error code for caller-side handling. */
  errorCode?: "INVALID_ARGS" | "QUOTA" | "INTERNAL" | "NOT_FOUND";
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
export async function alchemizeIngredients(
  args: AlchemizeArgs,
): Promise<ToolResult> {
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
    const props = item?.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
    return {
      name,
      resolvedName: item?.name || "Unknown Alchemical Flora",
      category: item?.category || "uncategorized",
      esms: {
        spirit: Math.round(props.Fire * 100),
        essence: Math.round(props.Water * 100),
        matter: Math.round(props.Earth * 100),
        substance: Math.round(props.Air * 100),
      },
      elementalProperties: props,
      planetaryRuler: item?.planetaryRuler || "none",
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

  const harmony = alchemicalService.analyzeAlchemicalHarmony(
    analyzed.map((a) => a.elementalProperties),
  );
  const thermo = alchemicalService.calculateThermodynamicProperties(averageProps);

  const data = {
    ingredientCount: len,
    ingredients: analyzed,
    aggregateBalances: {
      spirit: Math.round(averageProps.Fire * 100),
      essence: Math.round(averageProps.Water * 100),
      matter: Math.round(averageProps.Earth * 100),
      substance: Math.round(averageProps.Air * 100),
    },
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
        (r.description || "").toLowerCase().includes(prompt),
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
      cuisine: r.cuisine || "Cosmic",
      prepTime: r.timeToMake || "30 MIN",
      servings: r.numberOfServings || 2,
      esms: {
        spirit: Math.round(props.Fire * 100),
        essence: Math.round(props.Water * 100),
        matter: Math.round(props.Earth * 100),
        substance: Math.round(props.Air * 100),
      },
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
        cuisine: cuisine || null,
        dominantElement: domElem || null,
        dietary: dietary ?? null,
      },
    },
  };
}

// ─── Dispatch + invocation wrapper ────────────────────────────────────

export type ToolName =
  | "get_live_sky_transits"
  | "alchemize_ingredients"
  | "generate_cosmic_recipe"
  | "compute_synastry_overlay"
  | "get_transit_natal_overlay";

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
  const startedAtMs = Date.now();
  const caller = await resolveCaller(args);

  let result: ToolResult;
  let tokensDebited: DebitOutcome["amounts"] = null;

  try {
    const debit = await debitForTool(name, caller);
    if (debit.reason && debit.reason.startsWith("insufficient-")) {
      result = {
        ok: false,
        data: null,
        errorCode: "QUOTA",
        errorMessage: `MCP token quota: ${debit.reason}`,
        summary: { reason: debit.reason },
      };
    } else {
      tokensDebited = debit.amounts;
      if (name === "get_live_sky_transits") {
        result = await getLiveSkyTransits(args);
      } else if (name === "alchemize_ingredients") {
        result = await alchemizeIngredients(args as unknown as AlchemizeArgs);
      } else if (name === "generate_cosmic_recipe") {
        result = await generateCosmicRecipe(args);
      } else if (name === "compute_synastry_overlay") {
        result = await computeSynastryOverlay(args);
      } else if (name === "get_transit_natal_overlay") {
        result = await getTransitNatalOverlay(args);
      } else {
        result = {
          ok: false,
          data: null,
          errorCode: "NOT_FOUND",
          errorMessage: `Unknown tool: ${name}`,
          summary: { reason: "unknown-tool" },
        };
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
    startedAtMs,
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
