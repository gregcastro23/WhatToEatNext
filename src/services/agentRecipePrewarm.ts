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
const PA_TIMEOUT_MS = 18_000;
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

function planetSignsFromNatal(natalPositions: unknown): Record<string, string> {
  const signs: Record<string, string> = {};
  for (const entry of asArray(natalPositions)) {
    if (!isRecord(entry)) continue;
    const planet = typeof entry.planet === "string" ? entry.planet : undefined;
    const sign = typeof entry.sign === "string" ? entry.sign : undefined;
    if (planet && sign) signs[planet] = sign;
  }
  return signs;
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

async function generateOne(row: PrewarmAgentRow): Promise<boolean> {
  const signs = planetSignsFromNatal(row.natal_positions);
  if (Object.keys(signs).length === 0) return false; // need a chart to ground

  const element = matchElement(row.dominant_element, "Fire");
  const esms = calculateAlchemicalFromPlanets(signs);
  let thermodynamicProperties: unknown;
  try {
    thermodynamicProperties = (
      alchemize(normalizedFromNatal(row.natal_positions)) as { thermodynamicProperties?: unknown }
    )?.thermodynamicProperties;
  } catch {
    thermodynamicProperties = undefined;
  }
  const topIngredients = findTopIngredientsForElement(element, 8).map((i) => i.name);
  const agentName = row.name ?? row.email?.split("@")[0] ?? "a historical alchemist";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PA_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${getServiceUrl("planetaryAgentsApi")}/api/generate-recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `A signature dish from ${agentName}, attuned to their natal chart and today's cosmic energies.`,
        dominantElement: element,
        topIngredients,
        birthData: { name: agentName, natalPositions: asArray(row.natal_positions) },
        dietPreference: "omnivore",
        alchemicalState: esms,
        thermodynamicProperties,
        tier: "premium",
      }),
      signal: controller.signal,
    });
  } catch (error) {
    _logger.warn(`[prewarm] PA fetch failed for ${agentName}:`, error);
    return false;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    _logger.warn(`[prewarm] PA returned ${res.status} for ${agentName}`);
    return false;
  }

  let parsed: unknown;
  try {
    parsed = await res.json();
  } catch {
    return false;
  }
  const validation = cosmicRecipeSchema.safeParse(parsed);
  if (!validation.success) {
    _logger.warn(`[prewarm] PA recipe failed schema for ${agentName}`);
    return false;
  }

  const recipe = validation.data;
  const cached: CachedAgentRecipe = {
    title: recipe.title,
    element: matchElement(recipe.tags.elements[0], element),
    cuisine: recipe.cuisine,
    source: "pa",
  };
  await CacheService.set(`${CACHE_PREFIX}${row.id}`, cached, CACHE_TTL_SECONDS);
  return true;
}

/**
 * Generate + cache PA recipes for a rotating slice of chart-bearing agents
 * (those with the oldest / missing cache first). Sequential to avoid hammering
 * PA's LLM. Per-agent failures are skipped.
 */
export async function prewarmAgentRecipes(
  limit = 3,
): Promise<{ attempted: number; generated: number }> {
  let rows: PrewarmAgentRow[] = [];
  try {
    const result = await executeQuery<PrewarmAgentRow>(
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
    rows = result.rows;
  } catch (error) {
    _logger.error("[prewarm] agent query failed:", error);
    return { attempted: 0, generated: 0 };
  }

  let generated = 0;
  for (const row of rows) {
    try {
      if (await generateOne(row)) generated += 1;
    } catch (error) {
      _logger.warn("[prewarm] generateOne threw:", error);
    }
  }
  return { attempted: rows.length, generated };
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
          cuisine: typeof data.cuisine === "string" ? data.cuisine : undefined,
          source: "pa",
        });
      }
    }
  } catch (error) {
    _logger.warn("[prewarm] cache read failed:", error);
  }
  return map;
}
