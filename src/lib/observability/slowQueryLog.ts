/**
 * Slow query log — bounded in-memory ring + DB-backed persistence
 *
 * Captures Postgres queries whose execution time exceeds a configurable
 * threshold (default 200ms). The existing stdout logger already warns
 * on >1s queries; this ring + the mirrored `slow_query_log_entries`
 * table back the admin observability dashboard and let us spot creeping
 * regressions across cold starts.
 *
 * Persistence uses the raw pool (not executeQuery) to avoid recursion —
 * persisting a slow-query record would otherwise log itself as a slow
 * query and loop. Hydration on first read pulls the last N rows from
 * the DB into the ring.
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
  const entry: SlowQueryEntry = {
    id: nextId++,
    at: new Date().toISOString(),
    ms: Math.round(ms),
    preview: query.length > 200 ? `${query.slice(0, 200)}…` : query,
    rowCount,
  };
  ring.push(entry);
  if (ring.length > RING_SIZE) ring.shift();

  // Skip persistence for self-writes — would loop forever otherwise.
  if (query.toLowerCase().includes("slow_query_log_entries")) return;
  void persistSlowQueryEntry(entry);
}

async function persistSlowQueryEntry(entry: SlowQueryEntry): Promise<void> {
  if (typeof window !== "undefined") return;
  if (!process.env.DATABASE_URL) return;
  try {
    // Raw pool query (bypass executeQuery to avoid re-entry through the
    // slow-query recorder). The pool comes from the leaf rawPool module, so
    // there is no import cycle with connection.ts.
    const { getDatabasePool } = await import("@/lib/database/rawPool");
    await getDatabasePool().query(
      `INSERT INTO slow_query_log_entries (at, ms, preview, row_count)
       VALUES ($1, $2, $3, $4)`,
      [entry.at, entry.ms, entry.preview, entry.rowCount],
    );
  } catch {
    // Observability writes never crash the query path.
  }
}

let hydrationStarted = false;
function ensureHydrated(): void {
  if (hydrationStarted) return;
  hydrationStarted = true;
  if (typeof window !== "undefined") return;
  if (!process.env.DATABASE_URL) return;
  void (async () => {
    try {
      const { getDatabasePool } = await import("@/lib/database/rawPool");
      const result = await getDatabasePool().query<{
        at: Date;
        ms: number;
        preview: string;
        row_count: number | null;
      }>(
        `SELECT at, ms, preview, row_count
         FROM slow_query_log_entries
         ORDER BY at DESC
         LIMIT $1`,
        [RING_SIZE],
      );
      const liveAtSet = new Set(ring.map((r) => r.at));
      const hydrated: SlowQueryEntry[] = result.rows
        .reverse()
        .filter((row) => !liveAtSet.has(new Date(row.at).toISOString()))
        .map((row) => ({
          id: nextId++,
          at: new Date(row.at).toISOString(),
          ms: row.ms,
          preview: row.preview,
          rowCount: row.row_count,
        }));
      const combined = [...hydrated, ...ring].slice(-RING_SIZE);
      ring.length = 0;
      ring.push(...combined);
    } catch {
      // Persistence offline — operate in pure-memory mode.
    }
  })();
}

export function getRecentSlowQueries(limit: number = 50): SlowQueryEntry[] {
  ensureHydrated();
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
  ensureHydrated();
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
