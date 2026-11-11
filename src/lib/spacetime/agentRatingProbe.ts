/**
 * Live Critique & SpacetimeDB `asol.agent_rating` Sweep Verification Probe.
 *
 * Audits and reconciles the three-leg historical agent pipeline:
 *   1. WTEN PostgreSQL `feed_events` + `recipe_reflections` critique/adaptation telemetry
 *   2. ASOL Rating Gateway (`GET /api/agents/rating?agentId=<slug>`) ESMS & ephemeris parity
 *   3. SpacetimeDB `asol.agent_rating` Maincloud table sweep state (`synced` | `paused` | `degraded` | `unreachable`)
 *      with automatic circuit breaker fallback to PostgreSQL and availability shift alerting.
 */
import { z } from "zod";
import { executeQuery } from "@/lib/database/connection";
import { getServiceUrlSafe } from "@/lib/serviceUrls";
import {
  getSpacetimeCircuitBreakerSnapshot,
  queryPostgresAgentRatingFallback,
  recordSpacetimeClusterStatus,
  shouldBypassSpacetimeRead,
  transitionSpacetimeCircuitToHalfOpen,
  type PostgresAgentRatingFallbackSummary,
  type SpacetimeCircuitBreakerSnapshot,
} from "./spacetimeCircuitBreaker";

export const CANONICAL_HISTORICAL_AGENT_COUNT = 71;

const AsolRatingSampleSchema = z
  .object({
    key: z.string(),
    provenance: z.string().optional(),
    ovr: z.number().finite().optional(),
    esmsSource: z.string().optional(),
    sky: z.object({ source: z.string().optional() }).optional(),
  })
  .passthrough();

const SpacetimeSqlStatementSchema = z.array(
  z.object({ rows: z.array(z.array(z.union([z.number(), z.string()]))).optional() }).passthrough(),
);

export interface AsolRatingGatewayStatus {
  reachable: boolean;
  statusCode: number | null;
  agentId: string;
  ovr: number | null;
  esmsSource: string | null;
  skySource: string | null;
  provenance: string | null;
  error?: string;
}

export interface SpacetimeAgentRatingSweepStatus {
  database: "asol";
  status: "synced" | "paused" | "degraded" | "unreachable";
  statusCode: number | null;
  publishedCount: number | null;
  expectedHistoricalAgents: number;
  unmatchedCount: number | null;
  detail?: string;
  fallback?: PostgresAgentRatingFallbackSummary;
}

export interface CritiqueReconciliationSummary {
  live: boolean;
  liveCritiques: number;
  degradedCritiques: number;
  curatedCritiques: number;
  savedAdaptations: number;
  distinctHistoricalAgents: number;
  reflectionsMirrored: number;
  lastCritiqueAt: string | null;
}

export interface AgentRatingSyncSweepReport {
  checkedAt: string;
  critiquePipeline: CritiqueReconciliationSummary;
  asolRatingGateway: AsolRatingGatewayStatus;
  spacetimeAgentRating: SpacetimeAgentRatingSweepStatus;
  circuitBreaker: SpacetimeCircuitBreakerSnapshot;
}

export interface AgentRatingProbeOptions {
  sampleAgentId?: string;
  agentsUiBaseUrl?: string;
  spacetimeHttpBaseUrl?: string;
  timeoutMs?: number;
  fetchFn?: typeof fetch;
  respectCircuitCooldown?: boolean;
}

interface CritiqueSummaryRow {
  live_critiques: number | string | null;
  degraded_critiques: number | string | null;
  curated_critiques: number | string | null;
  saved_adaptations: number | string | null;
  distinct_agents: number | string | null;
  reflections_mirrored: number | string | null;
  last_critique_at: Date | string | null;
}

function toCount(val: number | string | null | undefined): number {
  const n = Number(val ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function toHttpSpacetimeBase(rawUri?: string): string {
  const uri = (rawUri ?? process.env.NEXT_PUBLIC_SPACETIME_URI ?? "https://maincloud.spacetimedb.com").trim();
  return uri.replace(/^wss:\/\//i, "https://").replace(/^ws:\/\//i, "http://").replace(/\/+$/, "");
}

/** Query WTEN PostgreSQL for live vs curated critique & adaptation reconciliation counts. */
export async function getCritiqueReconciliationSummary(): Promise<CritiqueReconciliationSummary> {
  try {
    const result = await executeQuery<CritiqueSummaryRow>(
      `SELECT
         COUNT(*) FILTER (WHERE f.event_type = 'recipe_review' AND COALESCE(f.metadata_payload->>'source', '') = 'catalog_critique' AND f.metadata_payload->>'contentState' = 'live')::int AS live_critiques,
         COUNT(*) FILTER (WHERE f.event_type = 'recipe_review' AND COALESCE(f.metadata_payload->>'source', '') = 'catalog_critique' AND f.metadata_payload->>'contentState' IN ('gateway-degraded', 'gateway_degraded'))::int AS degraded_critiques,
         COUNT(*) FILTER (WHERE f.event_type = 'recipe_review' AND COALESCE(f.metadata_payload->>'source', '') IN ('catalog_critique', 'catalog_review') AND COALESCE(f.metadata_payload->>'contentState', 'curated') = 'curated')::int AS curated_critiques,
         COUNT(*) FILTER (WHERE f.event_type = 'recipe_adapted' AND COALESCE(f.metadata_payload->>'source', '') = 'saved-adaptation')::int AS saved_adaptations,
         COUNT(DISTINCT f.actor_id) FILTER (WHERE f.event_type IN ('recipe_review', 'recipe_adapted'))::int AS distinct_agents,
         (SELECT COUNT(*)::int FROM recipe_reflections WHERE source = 'catalog_critique' AND deleted_at IS NULL) AS reflections_mirrored,
         MAX(f.created_at) FILTER (WHERE f.event_type = 'recipe_review') AS last_critique_at
       FROM feed_events f JOIN users u ON u.id = f.actor_id WHERE u.is_agent = true`,
    );
    const [row] = result.rows;
    return {
      live: true,
      liveCritiques: toCount(row?.live_critiques),
      degradedCritiques: toCount(row?.degraded_critiques),
      curatedCritiques: toCount(row?.curated_critiques),
      savedAdaptations: toCount(row?.saved_adaptations),
      distinctHistoricalAgents: toCount(row?.distinct_agents),
      reflectionsMirrored: toCount(row?.reflections_mirrored),
      lastCritiqueAt: row?.last_critique_at ? new Date(row.last_critique_at).toISOString() : null,
    };
  } catch {
    return { live: false, liveCritiques: 0, degradedCritiques: 0, curatedCritiques: 0, savedAdaptations: 0, distinctHistoricalAgents: 0, reflectionsMirrored: 0, lastCritiqueAt: null };
  }
}

/** Probe ASOL `/api/agents/rating` for live database-backed ESMS and ephemeris parity. */
export async function probeAsolAgentRating(options?: AgentRatingProbeOptions): Promise<AsolRatingGatewayStatus> {
  const agentId = options?.sampleAgentId ?? "leonardo-da-vinci";
  const base = (options?.agentsUiBaseUrl ?? getServiceUrlSafe("agentsUi")).replace(/\/+$/, "");
  const fetchFn = options?.fetchFn ?? fetch;
  const timeoutMs = options?.timeoutMs ?? 4_000;
  try {
    const res = await fetchFn(`${base}/api/agents/rating?agentId=${encodeURIComponent(agentId)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      return { reachable: false, statusCode: res.status, agentId, ovr: null, esmsSource: null, skySource: null, provenance: null, error: `HTTP ${res.status}` };
    }
    const parsed = AsolRatingSampleSchema.safeParse(await res.json());
    if (!parsed.success) {
      return { reachable: false, statusCode: res.status, agentId, ovr: null, esmsSource: null, skySource: null, provenance: null, error: "Invalid rating schema" };
    }
    return {
      reachable: true,
      statusCode: res.status,
      agentId: parsed.data.key,
      ovr: parsed.data.ovr ?? null,
      esmsSource: parsed.data.esmsSource ?? null,
      skySource: parsed.data.sky?.source ?? null,
      provenance: parsed.data.provenance ?? null,
    };
  } catch (err) {
    return { reachable: false, statusCode: null, agentId, ovr: null, esmsSource: null, skySource: null, provenance: null, error: err instanceof Error ? err.message : String(err) };
  }
}

async function buildFallbackStatus(params: {
  status: "paused" | "degraded" | "unreachable";
  statusCode: number | null;
  detail: string;
  agentSlug?: string;
}): Promise<SpacetimeAgentRatingSweepStatus> {
  recordSpacetimeClusterStatus({ status: params.status, detail: params.detail });
  const fallback = await queryPostgresAgentRatingFallback(params.agentSlug);
  return {
    database: "asol",
    status: params.status,
    statusCode: params.statusCode,
    publishedCount: null,
    expectedHistoricalAgents: CANONICAL_HISTORICAL_AGENT_COUNT,
    unmatchedCount: null,
    detail: params.detail,
    fallback,
  };
}

async function buildCooldownBypassStatus(agentSlug?: string): Promise<SpacetimeAgentRatingSweepStatus> {
  const snap = getSpacetimeCircuitBreakerSnapshot();
  const fallback = await queryPostgresAgentRatingFallback(agentSlug);
  const cached = snap.lastClusterStatus === "paused" || snap.lastClusterStatus === "degraded" || snap.lastClusterStatus === "unreachable" ? snap.lastClusterStatus : "paused";
  return {
    database: "asol",
    status: cached,
    statusCode: cached === "paused" ? 503 : null,
    publishedCount: null,
    expectedHistoricalAgents: CANONICAL_HISTORICAL_AGENT_COUNT,
    unmatchedCount: null,
    detail: "Circuit breaker open; routing live agent rating reads to PostgreSQL fallback",
    fallback,
  };
}

async function parseSpacetimeCountResponse(
  res: Response,
  agentSlug?: string,
): Promise<SpacetimeAgentRatingSweepStatus> {
  const text = await res.text();
  const slugOpt = agentSlug ? { agentSlug } : {};
  if (res.status === 503 && text.toLowerCase().includes("paused")) {
    return buildFallbackStatus({ status: "paused", statusCode: 503, detail: "SpacetimeDB module asol is currently paused on Maincloud", ...slugOpt });
  }
  if (!res.ok) {
    return buildFallbackStatus({ status: "degraded", statusCode: res.status, detail: text.slice(0, 160) || `HTTP ${res.status}`, ...slugOpt });
  }
  const parsed = SpacetimeSqlStatementSchema.safeParse(JSON.parse(text));
  const rawCount = parsed.success ? parsed.data[0]?.rows?.[0]?.[0] : undefined;
  const count = rawCount !== undefined ? toCount(rawCount) : null;
  if (count === null) {
    return buildFallbackStatus({ status: "degraded", statusCode: res.status, detail: "Invalid SQL row payload from SpacetimeDB asol.agent_rating", ...slugOpt });
  }
  recordSpacetimeClusterStatus({ status: "synced" });
  return {
    database: "asol",
    status: "synced",
    statusCode: res.status,
    publishedCount: count,
    expectedHistoricalAgents: CANONICAL_HISTORICAL_AGENT_COUNT,
    unmatchedCount: Math.max(0, CANONICAL_HISTORICAL_AGENT_COUNT - count),
  };
}

/** Probe SpacetimeDB `asol.agent_rating` table via the HTTP SQL endpoint with circuit-breaker fallback. */
export async function probeSpacetimeAgentRatingTable(options?: AgentRatingProbeOptions): Promise<SpacetimeAgentRatingSweepStatus> {
  if (options?.respectCircuitCooldown === true && shouldBypassSpacetimeRead()) {
    return buildCooldownBypassStatus(options.sampleAgentId);
  }
  const base = toHttpSpacetimeBase(options?.spacetimeHttpBaseUrl);
  const fetchFn = options?.fetchFn ?? fetch;
  const timeoutMs = options?.timeoutMs ?? 4_000;
  try {
    const res = await fetchFn(`${base}/v1/database/asol/sql`, {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "SELECT COUNT(*) AS total FROM agent_rating",
      signal: AbortSignal.timeout(timeoutMs),
    });
    return await parseSpacetimeCountResponse(res, options?.sampleAgentId);
  } catch (err) {
    return buildFallbackStatus({
      status: "unreachable",
      statusCode: null,
      detail: err instanceof Error ? err.message : String(err),
      ...(options?.sampleAgentId ? { agentSlug: options.sampleAgentId } : {}),
    });
  }
}

/** Run full three-leg verification across WTEN critiques, ASOL rating gateway, and SpacetimeDB `asol.agent_rating`. */
export async function verifyAgentRatingSyncSweep(options?: AgentRatingProbeOptions): Promise<AgentRatingSyncSweepReport> {
  const [critiquePipeline, asolRatingGateway, spacetimeAgentRating] = await Promise.all([
    getCritiqueReconciliationSummary(),
    probeAsolAgentRating(options),
    probeSpacetimeAgentRatingTable(options),
  ]);
  return {
    checkedAt: new Date().toISOString(),
    critiquePipeline,
    asolRatingGateway,
    spacetimeAgentRating,
    circuitBreaker: getSpacetimeCircuitBreakerSnapshot(),
  };
}

/**
 * Transition an `open` circuit to `half-open`, immediately probe SpacetimeDB
 * `asol.agent_rating` parity, and close the circuit (`activeReadSource: "spacetimedb"`)
 * if the cluster has recovered.
 */
export async function probeAndRecoverSpacetimeCircuit(
  options?: AgentRatingProbeOptions,
): Promise<AgentRatingSyncSweepReport> {
  transitionSpacetimeCircuitToHalfOpen();
  return verifyAgentRatingSyncSweep({
    ...options,
    respectCircuitCooldown: false,
  });
}
