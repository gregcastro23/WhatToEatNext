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
import { rotateCandidatesByHour } from "@/services/prewarmRotation";
import { alchemize } from "@/services/RealAlchemizeService";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import { findTopIngredientsForElement } from "@/utils/ingredient/ingredientIndex";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";

const CACHE_PREFIX = "agent_recipe:";
const CACHE_TTL_SECONDS = 26 * 60 * 60; // ~26h — outlives the hourly rotating cron
const PA_TIMEOUT_MS = 45_000;
const MIN_CANDIDATE_POOL = 8;
const MAX_CANDIDATE_POOL = 24;
/**
 * Don't start a generation with less than this left. BASIS: PA takes 17.3-20.8 s
 * (`llm_ms`, hourly runs after ASOL #102), so 25 s = the slowest plus ~4 s of
 * transport and parsing. A shorter window usually aborts at the run deadline and
 * pins the recorded duration at the cap ("near time limit"). It was 15 s, the
 * FASTEST ever measured (13.7 s). Yield cost ~3.7%: a model, not a measurement.
 */
const MIN_ATTEMPT_MS = 25_000;
export { rotateCandidatesByHour };
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
  };
}

let warnedMissingSecret = false;

export function resetPrewarmAuthWarning(): void {
  warnedMissingSecret = false;
}

export function getPaAuthHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (secret) {
    headers["Authorization"] = `Bearer ${secret}`;
  } else if (!warnedMissingSecret) {
    warnedMissingSecret = true;
    _logger.warn("[prewarm] INTERNAL_API_SECRET is unset; recipe prewarm request to PA is unauthenticated");
  }
  return headers;
}

type GenerateOutcome = { ok: true } | { ok: false; reason: string };

async function readFailureDetail(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (isRecord(body)) {
      const detail = isRecord(body.detail) ? body.detail : body;
      const msg =
        (typeof detail.message === "string" && detail.message) ||
        (typeof detail.error === "string" && detail.error);
      if (msg) return `HTTP ${res.status}: ${msg.slice(0, 140)}`;
    }
  } catch {
    /* ignore non-JSON upstream error body */
  }
  return `HTTP ${res.status}`;
}

/**
 * One PA generation, bounded end to end: `AbortSignal.timeout` covers the body
 * read as well as the headers, so a slow stream cannot outlive the budget the
 * caller handed us.
 */
async function generateOne(
  row: PrewarmAgentRow,
  timeoutMs: number,
): Promise<GenerateOutcome> {
  const body = buildPaRequestBody(row);
  if (!body) return { ok: false, reason: "missing natal positions" };
  const label = row.name ?? row.id;
  let parsed: unknown;
  try {
    const res = await fetch(`${getServiceUrl("planetaryAgentsApi")}/api/generate-recipe`, {
      method: "POST",
      headers: getPaAuthHeaders(),
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const reason = await readFailureDetail(res);
      _logger.error(`[prewarm] PA returned ${reason} for ${label}`);
      return { ok: false, reason };
    }
    parsed = await res.json();
  } catch (error) {
    const reason = error instanceof Error ? error.message.slice(0, 140) : "request error";
    const summary = error instanceof Error ? `${error.name}: ${reason}` : String(error).slice(0, 140);
    _logger.error(`[prewarm] PA call failed for ${label} (budget ${timeoutMs}ms): ${summary}`);
    return { ok: false, reason };
  }
  const validation = cosmicRecipeSchema.safeParse(parsed);
  if (!validation.success) {
    _logger.error(`[prewarm] PA recipe failed schema for ${label}`);
    return { ok: false, reason: "recipe response failed schema validation" };
  }
  const recipe = validation.data;
  const cached: CachedAgentRecipe = {
    title: recipe.title,
    element: matchElement(recipe.tags.elements[0], matchElement(row.dominant_element, "Fire")),
    cuisine: recipe.cuisine,
    source: "pa",
  };
  await CacheService.set(`${CACHE_PREFIX}${row.id}`, cached, CACHE_TTL_SECONDS);
  return { ok: true };
}

export interface PrewarmResult {
  /** Agents selected for this run. */
  selected: number;
  /** Generations actually started. */
  attempted: number;
  generated: number;
  /** Selected but not started because too little of the budget remained. */
  skippedForBudget: number;
  /** Wall-clock ms of each started generation, in order. */
  attemptsMs: number[];
  /** A generation was still running at the deadline: the run's duration is then the cap, not PA's. */
  deadlineHit: boolean;
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
      ORDER BY c.expires_at ASC NULLS FIRST, u.id ASC
      LIMIT $1`,
    [limit, CACHE_PREFIX],
  );
  return result.rows;
}

/** Rotate candidates deterministically by UTC hour bucket and advance past failures within budget. */
export async function prewarmAgentRecipes(
  limit = 3,
  deadlineMs: number = Date.now() + PA_TIMEOUT_MS,
  onFailure?: (reason: string) => void,
): Promise<PrewarmResult> {
  const candidateLimit = Math.min(Math.max(limit * 4, MIN_CANDIDATE_POOL), MAX_CANDIDATE_POOL);
  const rows = rotateCandidatesByHour(await selectAgents(candidateLimit), Date.now());
  const result: PrewarmResult = { selected: rows.length, attempted: 0, generated: 0, skippedForBudget: 0, attemptsMs: [], deadlineHit: false };
  for (const row of rows) {
    if (result.generated >= limit) break;
    const remaining = deadlineMs - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      result.skippedForBudget = Math.max(0, Math.min(limit - result.generated, rows.length - result.attempted));
      break;
    }
    result.attempted += 1;
    const attemptStartedMs = Date.now();
    try {
      const outcome = await generateOne(row, Math.min(PA_TIMEOUT_MS, remaining));
      if (outcome.ok) result.generated += 1;
      else onFailure?.(outcome.reason);
    } catch (error) {
      _logger.error("[prewarm] generateOne threw:", error);
      onFailure?.(error instanceof Error ? error.message.slice(0, 140) : "unexpected error");
    } finally {
      result.attemptsMs.push(Date.now() - attemptStartedMs);
      if (Date.now() >= deadlineMs) result.deadlineHit = true;
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
