/**
 * In-memory request log
 *
 * A bounded ring buffer of the most recent HTTP requests handled by this
 * Node process. Built for the admin observability endpoint — not a
 * replacement for proper APM. Three reasons we don't write every request
 * to Postgres:
 *
 *   1. Doubles the DB write load (every API call → an extra INSERT).
 *   2. The data is most useful for ~minutes, not forever.
 *   3. Many requests are auth-failure pings, health checks, prefetches —
 *      cheap signal-to-noise gain by sampling success and full-fidelity
 *      capturing failures.
 *
 * Pair this with the `auth_events` table for durable auth audit, and with
 * Railway's stdout logs for full retention.
 *
 * @file src/lib/observability/requestLog.ts
 */

export interface RequestLogEntry {
  id: number;
  at: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  userId: string | null;
  ipHash: string | null;
}

const RING_SIZE = 500;
const ring: RequestLogEntry[] = [];
let nextId = 1;

export interface RecordOptions {
  method: string;
  path: string;
  status: number;
  latencyMs: number;
  userId?: string | null;
  ipHash?: string | null;
}

export function recordRequest(opts: RecordOptions): void {
  ring.push({
    id: nextId++,
    at: new Date().toISOString(),
    method: opts.method,
    path: opts.path,
    status: opts.status,
    latencyMs: opts.latencyMs,
    userId: opts.userId ?? null,
    ipHash: opts.ipHash ?? null,
  });
  if (ring.length > RING_SIZE) ring.shift();
}

export interface RequestLogQuery {
  limit?: number;
  statusGte?: number;
  pathContains?: string;
}

export function getRecentRequests(q: RequestLogQuery = {}): RequestLogEntry[] {
  const limit = Math.min(Math.max(q.limit ?? 100, 1), RING_SIZE);
  let view = ring.slice().reverse();
  if (typeof q.statusGte === "number") {
    view = view.filter((r) => r.status >= q.statusGte!);
  }
  if (q.pathContains) {
    const needle = q.pathContains.toLowerCase();
    view = view.filter((r) => r.path.toLowerCase().includes(needle));
  }
  return view.slice(0, limit);
}

export interface RequestSummary {
  count: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  topPaths: Array<{ path: string; count: number }>;
}

export function summarizeRecent(windowMs: number = 5 * 60 * 1000): RequestSummary {
  const cutoff = Date.now() - windowMs;
  const recent = ring.filter((r) => new Date(r.at).getTime() >= cutoff);
  const count = recent.length;
  if (count === 0) {
    return { count: 0, p50LatencyMs: 0, p95LatencyMs: 0, p99LatencyMs: 0, errorRate: 0, topPaths: [] };
  }
  const latencies = recent.map((r) => r.latencyMs).sort((a, b) => a - b);
  const pick = (p: number) => latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))];
  const errors = recent.filter((r) => r.status >= 500).length;
  const pathMap = new Map<string, number>();
  for (const r of recent) pathMap.set(r.path, (pathMap.get(r.path) ?? 0) + 1);
  const topPaths = Array.from(pathMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, c]) => ({ path, count: c }));
  return {
    count,
    p50LatencyMs: pick(0.5),
    p95LatencyMs: pick(0.95),
    p99LatencyMs: pick(0.99),
    errorRate: errors / count,
    topPaths,
  };
}

/**
 * Per-path health metrics. Backs the admin "API route health" panel and the
 * per-flow status service (e.g. /api/onboarding gets a separate computation
 * from /api/recipes).
 *
 * Path matching is a substring + prefix scan; paths like `/api/recipes/:id`
 * fall under any of `/api/recipes`, `/api/recipes/`, depending on which the
 * caller passes. Dynamic ids stay in the raw path — we don't normalize.
 */
export interface PathHealth {
  /** Matcher used. Returned verbatim so panels can label the row. */
  pathPrefix: string;
  count: number;
  errors4xx: number;
  errors5xx: number;
  successRate: number;
  errorRate: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  /** Most recent failure (status >= 400) for context. Null when none. */
  lastFailure: RequestLogEntry | null;
  /** Most recent request matching the prefix. Null when no traffic. */
  lastSeen: RequestLogEntry | null;
  /** True when at least one matching request was captured in-window. */
  observed: boolean;
}

/**
 * Compute per-path health over the window. `pathPrefix` matches any request
 * whose path startsWith the prefix — handles dynamic segments without route
 * normalization. Returns a zeroed PathHealth with `observed: false` when no
 * matching traffic appears in-window.
 */
export function summarizePath(
  pathPrefix: string,
  windowMs: number = 5 * 60 * 1000,
): PathHealth {
  const cutoff = Date.now() - windowMs;
  const matching = ring.filter(
    (r) =>
      new Date(r.at).getTime() >= cutoff && r.path.startsWith(pathPrefix),
  );

  const lastSeen = matching.length > 0 ? matching[matching.length - 1] : null;
  const lastFailure =
    matching.filter((r) => r.status >= 400).slice(-1)[0] ?? null;

  if (matching.length === 0) {
    return {
      pathPrefix,
      count: 0,
      errors4xx: 0,
      errors5xx: 0,
      successRate: 1,
      errorRate: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
      lastFailure: null,
      lastSeen: null,
      observed: false,
    };
  }

  const errors4xx = matching.filter(
    (r) => r.status >= 400 && r.status < 500,
  ).length;
  const errors5xx = matching.filter((r) => r.status >= 500).length;
  const errors = errors4xx + errors5xx;
  const latencies = matching.map((r) => r.latencyMs).sort((a, b) => a - b);
  const pick = (p: number) =>
    latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))];

  return {
    pathPrefix,
    count: matching.length,
    errors4xx,
    errors5xx,
    successRate: 1 - errors / matching.length,
    errorRate: errors / matching.length,
    p50LatencyMs: pick(0.5),
    p95LatencyMs: pick(0.95),
    lastFailure,
    lastSeen,
    observed: true,
  };
}

/**
 * Per-path summary for every distinct path seen in-window. Backs the
 * "API route health" admin panel — sorts by request volume descending.
 */
export interface PathSummary {
  path: string;
  count: number;
  errors4xx: number;
  errors5xx: number;
  errorRate: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  lastSeenAt: string;
}

export function summarizeAllPaths(
  windowMs: number = 5 * 60 * 1000,
): PathSummary[] {
  const cutoff = Date.now() - windowMs;
  const recent = ring.filter((r) => new Date(r.at).getTime() >= cutoff);
  const byPath = new Map<string, RequestLogEntry[]>();
  for (const r of recent) {
    const list = byPath.get(r.path);
    if (list) list.push(r);
    else byPath.set(r.path, [r]);
  }
  const out: PathSummary[] = [];
  for (const [path, entries] of byPath.entries()) {
    const errors4xx = entries.filter(
      (r) => r.status >= 400 && r.status < 500,
    ).length;
    const errors5xx = entries.filter((r) => r.status >= 500).length;
    const latencies = entries.map((r) => r.latencyMs).sort((a, b) => a - b);
    const pick = (p: number) =>
      latencies[Math.min(latencies.length - 1, Math.floor(latencies.length * p))];
    out.push({
      path,
      count: entries.length,
      errors4xx,
      errors5xx,
      errorRate: (errors4xx + errors5xx) / entries.length,
      p50LatencyMs: pick(0.5),
      p95LatencyMs: pick(0.95),
      lastSeenAt: entries[entries.length - 1].at,
    });
  }
  return out.sort((a, b) => b.count - a.count);
}
