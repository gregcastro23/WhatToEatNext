-- ADR-009 Phase 1: make the yield-weight cache scale-aware.
--
-- `user_yield_profiles` caches ESMS weights keyed by `natal_chart_hash`, which
-- covers PLANET POSITIONS ONLY. The per-planet weight scale is the cache's other
-- input, and it was invisible to the key: changing the scale left every hash
-- identical, so the cache served pre-change weights indefinitely on a path that
-- scales real token payouts, with no error and no drift alarm.
--
-- Positions alone cannot be the key. This column records which weight scale a
-- cached row was computed under, so BOTH readers can verify it:
--
--   * DailyYieldService.getYieldWeights has the positions and checks hash AND
--     version, recomputing + upserting on either mismatch.
--   * celestial.getNatalWeights reads these rows WITHOUT the positions in hand,
--     so it cannot check a hash. It checks the version and FAILS CLOSED: a row
--     on an unknown scale is treated as absent, which degrades that user to the
--     clamped sky-only multiplier — unpersonalized, never wrong.
--
-- NULL is deliberate for existing rows and is why no data flush is needed. A
-- NULL version matches no current scale, so every pre-migration row becomes
-- invisible to both readers and is recomputed on next use. Dropping the rows
-- would achieve the same end state while destroying the audit trail of what was
-- served before.
--
-- MEASURED 2026-08-01 against production: 64 rows, all with non-zero weights,
-- 58 distinct chart hashes, zero null hashes.

ALTER TABLE user_yield_profiles
  ADD COLUMN IF NOT EXISTS weight_scale_version VARCHAR(32);

COMMENT ON COLUMN user_yield_profiles.weight_scale_version IS
  'Per-planet weight scale the cached weights were computed under (see YIELD_WEIGHT_SCALE_VERSION in DailyYieldService.ts). NULL = pre-ADR-009, treated as stale by every reader.';

-- Partial index: readers always filter on this column, and the NULL rows are the
-- ones we want to stop reading, so they do not belong in the index.
CREATE INDEX IF NOT EXISTS idx_user_yield_profiles_scale_version
  ON user_yield_profiles (user_id, weight_scale_version)
  WHERE weight_scale_version IS NOT NULL;
