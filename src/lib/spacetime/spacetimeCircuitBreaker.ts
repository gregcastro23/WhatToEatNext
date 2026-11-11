/**
 * SpacetimeDB Reconnection & PostgreSQL Fallback Circuit Breaker.
 *
 * Tracks `asol` SpacetimeDB Maincloud cluster availability (`synced`, `paused`,
 * `degraded`, `unreachable`), opens an automatic circuit breaker when the
 * cluster is paused/unavailable so live agent rating reads route gracefully to
 * PostgreSQL, and records admin telemetry alerts on availability shifts.
 */
import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

export type SpacetimeClusterStatus =
  | "synced"
  | "paused"
  | "degraded"
  | "unreachable"
  | "unknown";

export type SpacetimeCircuitState = "closed" | "open" | "half-open";

export type AgentRatingReadSource = "spacetimedb" | "postgresql_fallback";

export interface SpacetimeAvailabilityShiftAlert {
  id: string;
  previousStatus: SpacetimeClusterStatus;
  nextStatus: Exclude<SpacetimeClusterStatus, "unknown">;
  circuitState: SpacetimeCircuitState;
  activeReadSource: AgentRatingReadSource;
  severity: "warning" | "critical" | "recovered";
  detail: string;
  shiftedAt: string;
}

export interface SpacetimeCircuitBreakerSnapshot {
  state: SpacetimeCircuitState;
  lastClusterStatus: SpacetimeClusterStatus;
  activeReadSource: AgentRatingReadSource;
  consecutiveFailures: number;
  openedAt: string | null;
  cooldownUntil: string | null;
  lastCheckedAt: string | null;
  shiftAlerts: SpacetimeAvailabilityShiftAlert[];
}

export interface PostgresAgentRatingFallbackSummary {
  source: "postgresql_fallback";
  available: boolean;
  agentCount: number;
  ratedCritiqueCount: number;
  averageRating: number | null;
}

interface FallbackAggregateRow {
  agent_count: number | string | null;
  rated_critiques: number | string | null;
  avg_rating: number | string | null;
}

const DEFAULT_COOLDOWN_MS = 60_000;
const MAX_SHIFT_ALERTS = 25;

interface MutableCircuitState {
  state: SpacetimeCircuitState;
  lastClusterStatus: SpacetimeClusterStatus;
  activeReadSource: AgentRatingReadSource;
  consecutiveFailures: number;
  openedAtMs: number | null;
  cooldownUntilMs: number | null;
  lastCheckedAtMs: number | null;
  shiftAlerts: SpacetimeAvailabilityShiftAlert[];
  alertSequence: number;
}

const circuitStore: MutableCircuitState = {
  state: "closed",
  lastClusterStatus: "unknown",
  activeReadSource: "spacetimedb",
  consecutiveFailures: 0,
  openedAtMs: null,
  cooldownUntilMs: null,
  lastCheckedAtMs: null,
  shiftAlerts: [],
  alertSequence: 0,
};

function severityForStatus(
  status: Exclude<SpacetimeClusterStatus, "unknown">,
): "warning" | "critical" | "recovered" {
  if (status === "synced") return "recovered";
  if (status === "paused") return "warning";
  return "critical";
}

function appendAvailabilityShiftAlert(params: {
  previousStatus: SpacetimeClusterStatus;
  nextStatus: Exclude<SpacetimeClusterStatus, "unknown">;
  detail?: string;
  nowMs: number;
}): void {
  circuitStore.alertSequence += 1;
  const detail =
    params.detail ??
    (params.nextStatus === "synced"
      ? "SpacetimeDB cluster recovered; live rating reads restored to SpacetimeDB."
      : `SpacetimeDB cluster ${params.nextStatus}; circuit breaker opened and routing rating reads to PostgreSQL.`);
  const alert: SpacetimeAvailabilityShiftAlert = {
    id: `spacetime-shift-${circuitStore.alertSequence}`,
    previousStatus: params.previousStatus,
    nextStatus: params.nextStatus,
    circuitState: circuitStore.state,
    activeReadSource: circuitStore.activeReadSource,
    severity: severityForStatus(params.nextStatus),
    detail,
    shiftedAt: new Date(params.nowMs).toISOString(),
  };
  circuitStore.shiftAlerts = [
    alert,
    ...circuitStore.shiftAlerts.slice(0, MAX_SHIFT_ALERTS - 1),
  ];
  if (params.nextStatus === "synced") {
    _logger.info(
      `[SpacetimeCircuitBreaker] Cluster availability recovered: ${params.previousStatus} -> ${params.nextStatus}`,
      alert,
    );
  } else {
    _logger.warn(
      `[SpacetimeCircuitBreaker] Cluster availability shift: ${params.previousStatus} -> ${params.nextStatus}`,
      alert,
    );
  }
}

/**
 *Inspect whether the circuit breaker should bypass SpacetimeDB and route
 * directly to PostgreSQL at `nowMs`, transitioning `open -> half-open` once
 * the cooldown window expires.
 */
export function shouldBypassSpacetimeRead(nowMs = Date.now()): boolean {
  if (circuitStore.state === "closed") return false;
  if (circuitStore.state === "open" && circuitStore.cooldownUntilMs !== null && nowMs >= circuitStore.cooldownUntilMs) {
    circuitStore.state = "half-open";
    return false;
  }
  return circuitStore.state === "open";
}

/** Explicitly move an `open` circuit into `half-open` so an admin probe tests SpacetimeDB immediately. */
export function transitionSpacetimeCircuitToHalfOpen(nowMs = Date.now()): SpacetimeCircuitBreakerSnapshot {
  if (circuitStore.state === "open") {
    circuitStore.state = "half-open";
    circuitStore.cooldownUntilMs = nowMs;
  }
  return getSpacetimeCircuitBreakerSnapshot(nowMs);
}

/**
 * Record an observed SpacetimeDB cluster status, update circuit breaker state,
 * and emit an admin telemetry alert when cluster availability shifts.
 */
export function recordSpacetimeClusterStatus(params: {
  status: Exclude<SpacetimeClusterStatus, "unknown">;
  detail?: string;
  cooldownMs?: number;
  nowMs?: number;
}): SpacetimeCircuitBreakerSnapshot {
  const nowMs = params.nowMs ?? Date.now();
  const cooldownMs = params.cooldownMs ?? DEFAULT_COOLDOWN_MS;
  const previousStatus = circuitStore.lastClusterStatus;
  const nextStatus = params.status;

  circuitStore.lastCheckedAtMs = nowMs;
  if (nextStatus === "synced") {
    circuitStore.state = "closed";
    circuitStore.activeReadSource = "spacetimedb";
    circuitStore.consecutiveFailures = 0;
    circuitStore.openedAtMs = null;
    circuitStore.cooldownUntilMs = null;
  } else {
    circuitStore.state = "open";
    circuitStore.activeReadSource = "postgresql_fallback";
    circuitStore.consecutiveFailures += 1;
    circuitStore.openedAtMs ??= nowMs;
    circuitStore.cooldownUntilMs = nowMs + cooldownMs;
  }
  circuitStore.lastClusterStatus = nextStatus;

  if (previousStatus !== nextStatus) {
    appendAvailabilityShiftAlert({
      previousStatus,
      nextStatus,
      ...(params.detail !== undefined ? { detail: params.detail } : {}),
      nowMs,
    });
  }
  return getSpacetimeCircuitBreakerSnapshot(nowMs);
}

/** Return a read-only snapshot of the current circuit breaker and shift alerts. */
export function getSpacetimeCircuitBreakerSnapshot(
  nowMs = Date.now(),
): SpacetimeCircuitBreakerSnapshot {
  if (
    circuitStore.state === "open" &&
    circuitStore.cooldownUntilMs !== null &&
    nowMs >= circuitStore.cooldownUntilMs
  ) {
    circuitStore.state = "half-open";
  }
  return {
    state: circuitStore.state,
    lastClusterStatus: circuitStore.lastClusterStatus,
    activeReadSource: circuitStore.activeReadSource,
    consecutiveFailures: circuitStore.consecutiveFailures,
    openedAt:
      circuitStore.openedAtMs !== null
        ? new Date(circuitStore.openedAtMs).toISOString()
        : null,
    cooldownUntil:
      circuitStore.cooldownUntilMs !== null
        ? new Date(circuitStore.cooldownUntilMs).toISOString()
        : null,
    lastCheckedAt:
      circuitStore.lastCheckedAtMs !== null
        ? new Date(circuitStore.lastCheckedAtMs).toISOString()
        : null,
    shiftAlerts: [...circuitStore.shiftAlerts],
  };
}

/** Reset the circuit breaker store (used by deterministic unit tests). */
export function resetSpacetimeCircuitBreakerForTests(): void {
  circuitStore.state = "closed";
  circuitStore.lastClusterStatus = "unknown";
  circuitStore.activeReadSource = "spacetimedb";
  circuitStore.consecutiveFailures = 0;
  circuitStore.openedAtMs = null;
  circuitStore.cooldownUntilMs = null;
  circuitStore.lastCheckedAtMs = null;
  circuitStore.shiftAlerts = [];
  circuitStore.alertSequence = 0;
}

/**
 * Query PostgreSQL for historical agent rating telemetry when SpacetimeDB
 * `asol.agent_rating` is paused or unreachable.
 */
export async function queryPostgresAgentRatingFallback(
  agentSlug?: string,
): Promise<PostgresAgentRatingFallbackSummary> {
  try {
    const normalizedSlug = agentSlug?.trim().toLowerCase();
    const emailFilter = normalizedSlug
      ? `${normalizedSlug}@agentic.alchm.kitchen`
      : null;
    const result = await executeQuery<FallbackAggregateRow>(
      `SELECT
         COUNT(DISTINCT u.id)::int AS agent_count,
         COUNT(r.id) FILTER (WHERE r.score IS NOT NULL)::int AS rated_critiques,
         AVG(r.score)::float8 AS avg_rating
       FROM users u
       LEFT JOIN recipe_reflections r
         ON r.author_id = u.id AND r.deleted_at IS NULL
      WHERE u.is_agent = true
        AND ($1::text IS NULL OR LOWER(u.email) = $1::text)`,
      [emailFilter],
    );
    const [row] = result.rows;
    const agentCount = Number(row?.agent_count ?? 0);
    const ratedCritiqueCount = Number(row?.rated_critiques ?? 0);
    const rawAvg = row?.avg_rating !== null && row?.avg_rating !== undefined
      ? Number(row.avg_rating)
      : null;
    return {
      source: "postgresql_fallback",
      available: true,
      agentCount: Number.isFinite(agentCount) ? agentCount : 0,
      ratedCritiqueCount: Number.isFinite(ratedCritiqueCount) ? ratedCritiqueCount : 0,
      averageRating: rawAvg !== null && Number.isFinite(rawAvg) ? Number(rawAvg.toFixed(2)) : null,
    };
  } catch {
    return {
      source: "postgresql_fallback",
      available: false,
      agentCount: 0,
      ratedCritiqueCount: 0,
      averageRating: null,
    };
  }
}
