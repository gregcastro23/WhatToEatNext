-- ADR-015: cache each chart's deterministic self-normalisation baseline.
--
-- A baseline is valid only for the exact natal geometry hash and the named
-- epoch/algorithm. The version string carries the epoch YEAR
-- (e.g. 'synastry-annual-v2:2027'), so a year rollover is an ordinary cache
-- miss and the baseline re-derives itself — see docs/adr/016. NULL deliberately
-- makes every pre-migration row a cache miss; the next claim recomputes it
-- without destroying history.

ALTER TABLE user_yield_profiles
  ADD COLUMN IF NOT EXISTS synastry_baseline DECIMAL(16, 8),
  ADD COLUMN IF NOT EXISTS baseline_version VARCHAR(64);

COMMENT ON COLUMN user_yield_profiles.synastry_baseline IS
  'Mean natal-to-transit aspect score S-bar(N) over the claim year''s sky, used to self-normalise the untethered daily faucet.';

COMMENT ON COLUMN user_yield_profiles.baseline_version IS
  'Algorithm and epoch-year identifier for synastry_baseline (e.g. synastry-annual-v2:2027). NULL or mismatch is stale and must be recomputed.';

CREATE INDEX IF NOT EXISTS idx_user_yield_profiles_baseline_version
  ON user_yield_profiles (user_id, baseline_version)
  WHERE baseline_version IS NOT NULL;
