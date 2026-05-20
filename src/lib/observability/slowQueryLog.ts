/**
 * Slow query in-memory ring.
 *
 * Captures Postgres queries whose execution time exceeds a configurable
 * threshold (default 200ms). The existing stdout logger already warns on
 * >1s queries, but we want a finer-grained record for the admin
 * observability dashboard and to spot creeping regressions.
 *
 * Stored in-memory only; if scale demands persistence we can flush this
 * to a table later. Process restarts wipe the ring, which is fine for
 * "what's slow right now" use cases.
 *
 * @file src/lib/observability/slowQueryLog.ts
 */

export interface SlowQueryEntry {
  id: number;
  at: string;
  ms: number;
  preview: string;
  rowCount: number | null;
}

const RING_SIZE = 200;
const ring: SlowQueryEntry[] = [];
let nextId = 1;

let threshold = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? "200") || 200;

export function setSlowQueryThresholdMs(ms: number): void {
  if (Number.isFinite(ms) && ms >= 0) {
    threshold = ms;
  }
}

export function getSlowQueryThresholdMs(): number {
  return threshold;
}

export function recordSlowQuery(
  ms: number,
  query: string,
  rowCount: number | null,
): void {
  if (ms < threshold) return;
  ring.push({
    id: nextId++,
    at: new Date().toISOString(),
    ms: Math.round(ms),
    preview: query.length > 200 ? `${query.slice(0, 200)}…` : query,
    rowCount,
  });
  if (ring.length > RING_SIZE) ring.shift();
}

export function getRecentSlowQueries(limit: number = 50): SlowQueryEntry[] {
  const n = Math.min(Math.max(limit, 1), RING_SIZE);
  return ring.slice().reverse().slice(0, n);
}

export interface SlowQuerySummary {
  count: number;
  thresholdMs: number;
  slowestMs: number;
  windowMs: number;
}

export function summarizeSlowQueries(windowMs: number = 5 * 60 * 1000): SlowQuerySummary {
  const cutoff = Date.now() - windowMs;
  const recent = ring.filter((r) => new Date(r.at).getTime() >= cutoff);
  const slowestMs = recent.reduce((m, r) => Math.max(m, r.ms), 0);
  return {
    count: recent.length,
    thresholdMs: threshold,
    slowestMs,
    windowMs,
  };
}
