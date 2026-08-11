-- Slow-query log: record the pool's state at the moment the query was recorded.
--
-- WHY
-- ---
-- `executeQuery` starts its timer BEFORE `pool.query()`, which does checkout
-- AND execution, so a recorded `ms` conflates two unrelated failure modes:
-- a genuinely slow statement, and a request that never got a connection.
--
-- On 2026-08-11 that ambiguity cost a whole investigation. `slow_query_log_entries`
-- showed durations up to 1,185,182 ms (19.7 minutes) and the obvious reading —
-- "the pool is starving" — was wrong. Every entry over 60s was a fire-and-forget
-- observability write (`void recordInvocation(...)`, `void persistRequestEntry(...)`),
-- 11 of 12 had ZERO other slow queries within ±2 minutes, and Postgres was sitting
-- at 5 backends against a ceiling of 100. Nothing was starving; the wall clock was
-- spanning a suspended serverless instance.
--
-- `waiting` is the column that settles it. node-postgres exposes
-- `pool.waitingCount` — the number of callers queued for a connection. A slow
-- entry recorded with `waiting = 0` cannot be checkout starvation, whatever the
-- duration says. `total`/`idle` give the saturation picture alongside it.
--
-- These are gauges read synchronously off the pool object, not a second timer,
-- so nothing about connection acquisition or release changes. Splitting the
-- timer would have meant replacing `pool.query()` with manual
-- connect/query/release on the hottest path in the app — where a missed release
-- leaks a connection and manufactures the very starvation being measured.
--
-- Nullable with no default: existing rows keep NULL, meaning "recorded before
-- this column existed", which must stay distinguishable from a measured 0.
-- ADD COLUMN without a default is a catalog-only change, so this does not
-- rewrite the table.

ALTER TABLE slow_query_log_entries
  ADD COLUMN IF NOT EXISTS pool_waiting INTEGER,
  ADD COLUMN IF NOT EXISTS pool_total   INTEGER,
  ADD COLUMN IF NOT EXISTS pool_idle    INTEGER;

COMMENT ON COLUMN slow_query_log_entries.pool_waiting IS
  'pg.Pool.waitingCount when the entry was recorded. 0 rules out checkout starvation as the cause of `ms`; NULL means the row predates this column.';
COMMENT ON COLUMN slow_query_log_entries.pool_total IS
  'pg.Pool.totalCount (open connections held by this serverless instance).';
COMMENT ON COLUMN slow_query_log_entries.pool_idle IS
  'pg.Pool.idleCount. total - idle - waiting is roughly the in-flight count.';

-- Find the starved entries, if there ever are any:
--   SELECT at, ms, pool_waiting, pool_total, left(preview,60)
--     FROM slow_query_log_entries
--    WHERE pool_waiting > 0 ORDER BY ms DESC;
