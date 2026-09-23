/**
 * Prewarm full PA-LLM recipes for historical agents into `calculation_cache`.
 *
 * The PA recipe pipeline (LLM, ~tens of seconds) can't run per-agent on a live
 * feed load, so a cron calls PA directly (server-to-server — no user token
 * economy) for a rotating slice of chart-bearing agents, grounded on each
 * agent's natal chart, and caches the result. The feed then reads the cache and
 * prefers the real PA recipe, falling back to the live alchemically-grounded
 * recipe (historicalAgentFeedService) for agents not yet warmed.
 *
 * Calls the existing alchemical utilities (additive) + PA; modifies no formula
 * logic.
 */

import { CacheService, executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { getServiceUrl } from "@/lib/serviceUrls";
import { alchemize } from "@/services/RealAlchemizeService";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

const CACHE_PREFIX = "agent_recipe:";
const CACHE_TTL_SECONDS = 26 * 60 * 60; // ~26h — outlives the hourly rotating cron
const PA_TIMEOUT_MS = 45_000;
/**
 * Don't start a generation with less than this left: the fastest real PA
 * generation measured was 13.7s (/api/generate-cosmic-recipe, 2026-08-19),
 * so a shorter window can only abort.
 */
const MIN_ATTEMPT_MS = 15_000;
const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;
type FeedElementLocal = (typeof ELEMENTS)[number];

export interface CachedAgentRecipe {
  title: string;
  element: FeedElementLocal;
  cuisine?: string;
  source: "pa";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  let candidate = value;
  if (typeof candidate === "string") {
    try {
      candidate = JSON.parse(candidate);
    } catch {
      return [];
    }
  }
  return Array.isArray(candidate) ? candidate : [];
}

function matchElement(value: unknown, fallback: FeedElementLocal): FeedElementLocal {
  const s = typeof value === "string" ? value.toLowerCase() : "";
  return ELEMENTS.find((e) => e.toLowerCase() === s) ?? fallback;
}

function normalizedFromNatal(
  natalPositions: unknown,
): Record<string, { sign: string; degree: number; minute: number; isRetrograde: boolean }> {
  const out: Record<string, { sign: string; degree: number; minute: number; isRetrograde: boolean }> = {};
  for (const entry of asArray(natalPositions)) {
    if (!isRecord(entry)) continue;
    const planet = typeof entry.planet === "string" ? entry.planet : undefined;
    const sign = typeof entry.sign === "string" ? entry.sign.toLowerCase() : undefined;
    if (planet && sign) {
      out[planet] = {
        sign,
        degree: typeof entry.degree === "number" ? entry.degree : 0,
        minute: 0,
        isRetrograde: false,
      };
    }
  }
  return out;
}

interface PrewarmAgentRow {
  id: string;
  email: string | null;
  name: string | null;
  dominant_element: string | null;
  natal_positions: unknown;
}

function buildPaRequestBody(row: PrewarmAgentRow): Record<string, unknown> | null {
  const positions = normalizedFromNatal(row.natal_positions);
  if (Object.keys(positions).length === 0) return null; // need a chart to ground

  const element = matchElement(row.dominant_element, "Fire");
  let thermodynamicProperties: unknown;
  try {
    ({ thermodynamicProperties } = alchemize(positions));
  } catch {
    thermodynamicProperties = undefined;
  }
  const agentName = row.name ?? row.email?.split("@")[0] ?? "a historical alchemist";
  return {
    prompt: `A signature dish from ${agentName}, attuned to their natal chart and today's cosmic energies.`,
    dominantElement: element,
    topIngredients: findTopIngredientsForElement(element, 8).map((i) => i.name),
    birthData: { name: agentName, natalPositions: asArray(row.natal_positions) },
    dietPreference: "omnivore",
    alchemicalState: calculateAlchemicalFromPlanets(positions),
    thermodynamicProperties,
    tier: "premium",
  };
}

/**
 * One PA generation, bounded end to end: `AbortSignal.timeout` covers the body
 * read as well as the headers, so a slow stream cannot outlive the budget the
 * caller handed us.
 */
async function generateOne(row: PrewarmAgentRow, timeoutMs: number): Promise<boolean> {
  const body = buildPaRequestBody(row);
  if (!body) return false;
  const label = row.name ?? row.id;
  let parsed: unknown;
  try {
    const res = await fetch(`${getServiceUrl("planetaryAgentsApi")}/api/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      _logger.error(`[prewarm] PA returned ${res.status} for ${label}`);
      return false;
    }
    parsed = await res.json();
  } catch (error) {
    _logger.error(`[prewarm] PA call failed for ${label} (budget ${timeoutMs}ms):`, error);
    return false;
  }
  const validation = cosmicRecipeSchema.safeParse(parsed);
  if (!validation.success) {
    _logger.error(`[prewarm] PA recipe failed schema for ${label}`);
    return false;
  }
  const recipe = validation.data;
  const cached: CachedAgentRecipe = {
    title: recipe.title,
    element: matchElement(recipe.tags.elements[0], matchElement(row.dominant_element, "Fire")),
    cuisine: recipe.cuisine,
    source: "pa",
  };
  await CacheService.set(`${CACHE_PREFIX}${row.id}`, cached, CACHE_TTL_SECONDS);
  return true;
}

export interface PrewarmResult {
  /** Agents selected for this run. */
  selected: number;
  /** Generations actually started. */
  attempted: number;
  generated: number;
  /** Selected but not started because too little of the budget remained. */
  skippedForBudget: number;
}

async function selectAgents(limit: number): Promise<PrewarmAgentRow[]> {
  const result = await executeQuery<PrewarmAgentRow & Record<string, unknown>>(
    `SELECT u.id, u.email, up.name, up.dominant_element, up.natal_positions
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN calculation_cache c ON c.cache_key = $2 || u.id::text
      WHERE COALESCE(u.is_agent, false) = true
        AND COALESCE(u.is_active, true) = true
        AND up.natal_positions IS NOT NULL
        AND up.natal_positions::text NOT IN ('[]', 'null', '{}')
      ORDER BY c.expires_at ASC NULLS FIRST
      LIMIT $1`,
    [limit, CACHE_PREFIX],
  );
  return result.rows;
}

/**
 * Generate + cache PA recipes for a rotating slice of chart-bearing agents
 * (oldest / missing cache first). Sequential to avoid hammering PA's LLM.
 *
 * Deadline-aware: PA generations measure 12-34s each, so three at the old
 * fixed 45s timeout could need 135s inside a 60s function, and Vercel killed
 * this cron mid-flight 15 times, taking its heartbeat with it. Each call now
 * gets at most the time left before `deadlineMs`, and no call starts with
 * less than MIN_ATTEMPT_MS left.
 *
 * Throws when the agent query fails, so the cron records a real failure
 * instead of a "success" that generated nothing.
 */
export async function prewarmAgentRecipes(
  limit = 3,
  deadlineMs: number = Date.now() + PA_TIMEOUT_MS,
): Promise<PrewarmResult> {
  const rows = await selectAgents(limit);
  const result: PrewarmResult = { selected: rows.length, attempted: 0, generated: 0, skippedForBudget: 0 };
  for (const row of rows) {
    const remaining = deadlineMs - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      result.skippedForBudget = rows.length - result.attempted;
      break;
    }
    result.attempted += 1;
    try {
      if (await generateOne(row, Math.min(PA_TIMEOUT_MS, remaining))) result.generated += 1;
    } catch (error) {
      _logger.error("[prewarm] generateOne threw:", error);
    }
  }
  return result;
}

/** Batch-read cached PA recipes for the given agent ids. */
export async function getCachedAgentRecipes(
  agentIds: string[],
): Promise<Map<string, CachedAgentRecipe>> {
  const map = new Map<string, CachedAgentRecipe>();
  if (agentIds.length === 0) return map;
  try {
    const keys = agentIds.map((id) => `${CACHE_PREFIX}${id}`);
    const res = await executeQuery<{ cache_key: string; result_data: unknown }>(
      `SELECT cache_key, result_data
         FROM calculation_cache
        WHERE cache_key = ANY($1::text[]) AND expires_at > CURRENT_TIMESTAMP`,
      [keys],
    );
    for (const row of res.rows) {
      const id = row.cache_key.slice(CACHE_PREFIX.length);
      const data = row.result_data;
      if (isRecord(data) && typeof data.title === "string") {
        map.set(id, {
          title: data.title,
          element: matchElement(data.element, "Fire"),
          ...(typeof data.cuisine === "string" ? { cuisine: data.cuisine } : {}),
          source: "pa",
        });
      }
    }
  } catch (error) {
    _logger.warn("[prewarm] cache read failed:", error);
  }
  return map;
}
