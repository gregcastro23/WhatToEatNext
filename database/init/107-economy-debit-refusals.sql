-- database/init/107-economy-debit-refusals.sql
-- Why POST /api/economy/sync-debit answered 402: one counter row per (UTC hour, reason).
--
-- WHY THIS EXISTS
-- The 402 was measured on 2026-11-23 as 5,346 of 6,752 calls in seven days (79%), and
-- request_log_entries could not say why: it stores the status, never the reason, and has no
-- user id for this route. The route knows which of five things refused the debit; this table
-- keeps that answer and nothing else.
--
-- WHAT IT HOLDS (aggregates only: no user id, no email, no amounts per call)
--   refusals             calls refused for this reason in this hour
--   empty_basket         of those, how many came from a payer holding nothing on all four axes
--                        (separates "empty" from "slightly short" without needing prices)
--   shortfall_value_sum  total uncovered value, in tokens at index 1.0, over the refusals that
--                        had a plan to measure it (only 'insufficient_value' computes one)
--   shortfall_value_n    how many refusals contributed to that sum (the divisor for a mean)
--
-- VOLUME: at most 24 hours x 5 reasons = 120 rows a day (about 44k a year). No pruning job.
-- COVERAGE: counting starts when the writer deploys. An hour before the first row is
-- unmeasured, not zero: readers must report MIN(hour) beside any total.

CREATE TABLE IF NOT EXISTS economy_debit_refusals (
    hour TIMESTAMPTZ NOT NULL
        -- Whole UTC hours only, so two writers can never open two buckets for one hour.
        CHECK (hour = date_trunc('hour', hour AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'),
    -- Keep in lockstep with DEBIT_REFUSAL_REASONS in src/services/debitRefusalService.ts
    -- (a test compares the two lists).
    reason TEXT NOT NULL
        CHECK (reason IN ('insufficient_value', 'rates_unavailable', 'no_balance', 'auto_swap_off', 'lost_race')),
    refusals INTEGER NOT NULL DEFAULT 0 CHECK (refusals >= 0),
    empty_basket INTEGER NOT NULL DEFAULT 0 CHECK (empty_basket >= 0 AND empty_basket <= refusals),
    shortfall_value_sum NUMERIC NOT NULL DEFAULT 0 CHECK (shortfall_value_sum >= 0),
    shortfall_value_n INTEGER NOT NULL DEFAULT 0 CHECK (shortfall_value_n >= 0 AND shortfall_value_n <= refusals),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (hour, reason)
);

COMMENT ON TABLE economy_debit_refusals IS
    'sync-debit 402 refusals counted per UTC hour and reason. Aggregates only. Hours before MIN(hour) are unmeasured, not zero.';
