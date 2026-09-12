-- Baseline geometry is independent of the more frequently updated weight row.
-- Never backfill this from natal_chart_hash: old code could have changed that
-- hash without recomputing the baseline. NULL forces a verified recomputation.
ALTER TABLE user_yield_profiles
  ADD COLUMN IF NOT EXISTS baseline_chart_hash VARCHAR(64);

COMMENT ON COLUMN user_yield_profiles.baseline_chart_hash IS
  'Natal geometry hash used to compute synastry_baseline; independent of the weight profile hash. NULL means unverified.';
