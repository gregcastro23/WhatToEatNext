-- Make the daily-yield guard ATOMIC.
--
-- ── The defect ──────────────────────────────────────────────────────────────
--
-- `POST /api/economy/sync-credit` §3b stops the same user being paid daily yield
-- twice in a UTC day. It does it with a SELECT followed later by an INSERT —
-- a check-then-act with nothing between them. Two concurrent requests can both
-- pass the SELECT and both credit.
--
-- Key-based idempotency cannot cover this class. Two producers pay the same
-- economic event under structurally non-colliding namespaces:
--     in-repo cron   DailyYieldService.ts   `daily:agents:<uuid>:<date>`
--     this endpoint  caller-supplied        `agentic:yield:<email>:<date>`
-- Different strings for the same event, so the existing
-- `token_transactions_idempotency_key_key` UNIQUE constraint never fires.
--
-- MEASURED 2026-07-19..21: 120 violating groups/day, ~227 excess tokens/day.
-- It stopped on 2026-07-22 when the semantic guard shipped, and there have been
-- zero since — but that guard holds only because the cron (00:30 UTC) and the
-- external producer happen not to overlap. The route's own comment admits this.
-- Scheduling luck is not a constraint.
--
-- ── Why a generated column and not an index expression ──────────────────────
--
-- The obvious `UNIQUE (..., (created_at AT TIME ZONE 'UTC')::date)` is REJECTED
-- by Postgres: `timezone(text, timestamptz)` is STABLE, not IMMUTABLE, because
-- timezone definitions can change. Index expressions must be IMMUTABLE. A
-- stored generated column computed once at write time sidesteps that.
--
-- ── Why history is left alone ───────────────────────────────────────────────
--
-- 364 historical rows across 42 users would violate this index. They are NOT
-- deleted, and the column is deliberately NULL for them.
--
-- MEASURED before choosing this: for Essence, Matter and Substance the ledger
-- sum currently equals the stored balance EXACTLY (2908.87 / 5018.70 / 2693.64).
-- Deleting 364 rows would remove 688.16 tokens from the ledger while
-- `token_balances` stayed put, destroying that exact correspondence and leaving
-- `userTimelineService` ("earned") and `dashboardPanelsService` ("minted")
-- permanently under-reporting against balances that never moved.
--
-- Postgres allows unlimited NULLs in a unique index, so historical rows with a
-- NULL yield_day simply do not participate. New rows get a real date and ARE
-- constrained. The correctness goal is met in full without an irreversible
-- delete and without rewriting an immutable ledger.

-- ── 1. The day key ──────────────────────────────────────────────────────────
--
-- NULL for every existing row. The application sets it on new daily-yield
-- writes; it stays NULL for every other source_type, which is what keeps
-- multi-per-day sources (Sky Drops, transit attunement) unconstrained.
ALTER TABLE token_transactions
  ADD COLUMN IF NOT EXISTS yield_day date;

COMMENT ON COLUMN token_transactions.yield_day IS
  'UTC day of a daily-yield credit, set by the writer. NULL for every other '
  'source_type and for all rows predating 2026-07-26, which is what lets the '
  'partial unique index below constrain new writes without rewriting history. '
  'Daily yield is once-per-user-per-UTC-day BY DEFINITION — this column makes '
  'the database enforce that definition instead of the application re-checking '
  'it non-atomically.';

-- ── 2. The constraint ───────────────────────────────────────────────────────
--
-- One row per (user, source, token axis, UTC day). `creditMultipleTokens`
-- writes one row PER AXIS, so token_type MUST be in the key — without it a
-- single legitimate credit event (4 rows) would self-conflict.
--
-- NOT `CREATE INDEX CONCURRENTLY`: the migration runner wraps each file in a
-- transaction, and CONCURRENTLY cannot run inside one. The table is small
-- (~5.3k daily-yield rows), so the brief lock is acceptable.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_daily_yield_per_user_day
  ON token_transactions (user_id, source_type, token_type, yield_day)
  WHERE source_type IN ('agents_yield', 'daily_yield')
    AND yield_day IS NOT NULL;

COMMENT ON INDEX uniq_daily_yield_per_user_day IS
  'Atomic backstop for the daily-yield double-credit. The application guard in '
  'sync-credit §3b is a check-then-act and cannot survive concurrency; this '
  'turns the second writer into a unique violation the route already handles '
  'as a 409. Partial on yield_day IS NOT NULL so the 364 historical violating '
  'rows (2026-07-19..22) are untouched — see the header for why they are not '
  'deleted.';
