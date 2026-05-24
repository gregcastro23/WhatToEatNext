/**
 * Request log — bounded in-memory ring + DB-backed persistence
 *
 * A bounded ring buffer of the most recent HTTP requests handled by this
 * Node process backs every admin observability query. Persistence to
 * `request_log_entries` is fire-and-forget so the ring stays the fast
 * read path while cold starts can hydrate from durable storage rather
 * than starting empty.
 *
 * Pair this with the `auth_events` table for durable auth audit, and with
 * Railway's stdout logs for full-detail retention. Retention on the DB
 * table is enforced by `prune_observability_logs()` (7 days by default).
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
  const entry: RequestLogEntry = {
    id: nextId++,
    at: new Date().toISOString(),
    method: opts.method,
    path: opts.path,
    status: opts.status,
    latencyMs: opts.latencyMs,
    userId: opts.userId ?? null,
    ipHash: opts.ipHash ?? null,
  };
  ring.push(entry);
  if (ring.length > RING_SIZE) ring.shift();

  // Fire-and-forget durable mirror. Dynamic import breaks the
  // request-log <-> connection circular dependency.
  void persistRequestEntry(entry);
}

async function persistRequestEntry(entry: RequestLogEntry): Promise<void> {
  if (typeof window !== "undefined") return;
  if (!process.env.DATABASE_URL) return;
  try {
    const { executeQuery } = await import("@/lib/database/connection");
    await executeQuery(
      `INSERT INTO request_log_entries
         (at, method, path, status, latency_ms, user_id, ip_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.at,
        entry.method,
        entry.path,
        entry.status,
        entry.latencyMs,
        entry.userId,
        entry.ipHash,
      ],
    );
  } catch {
    // Observability writes must never crash the request path.
  }
}

// Hydration kicks off on first read after cold start. Fire-and-forget;
// the first read may return an empty/partial ring while it runs, which
// is fine — subsequent polls (admin panel polls every 30s) see the
// populated ring.
let hydrationStarted = false;
function ensureHydrated(): void {
  if (hydrationStarted) return;
  hydrationStarted = true;
  if (typeof window !== "undefined") return;
  if (!process.env.DATABASE_URL) return;
  void (async () => {
    try {
      const { executeQuery } = await import("@/lib/database/connection");
      const result = await executeQuery<{
        at: Date;
        method: string;
        path: string;
        status: number;
        latency_ms: number;
        user_id: string | null;
        ip_hash: string | null;
      }>(
        `SELECT at, method, path, status, latency_ms, user_id, ip_hash
         FROM request_log_entries
         ORDER BY at DESC
         LIMIT $1`,
        [RING_SIZE],
      );
      // Already-buffered live entries take precedence (we don't want to
      // displace newer in-memory entries with older DB ones).
      const liveAtSet = new Set(ring.map((r) => r.at));
      const hydrated: RequestLogEntry[] = result.rows
        .reverse() // ascending so newest ends at ring tail
        .filter((row) => !liveAtSet.has(new Date(row.at).toISOString()))
        .map((row) => ({
          id: nextId++,
          at: new Date(row.at).toISOString(),
          method: row.method,
          path: row.path,
          status: row.status,
          latencyMs: row.latency_ms,
          userId: row.user_id,
          ipHash: row.ip_hash,
        }));
      const combined = [...hydrated, ...ring].slice(-RING_SIZE);
      ring.length = 0;
      ring.push(...combined);
    } catch {
      // Persistence layer offline — keep operating in pure-memory mode.
    }
  })();
}

export interface RequestLogQuery {
  limit?: number;
  statusGte?: number;
  pathContains?: string;
}

export function getRecentRequests(q: RequestLogQuery = {}): RequestLogEntry[] {
  ensureHydrated();
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
  ensureHydrated();
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
  ensureHydrated();
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
  ensureHydrated();
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
