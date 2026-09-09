-- Per-claim resonance record for the untethered faucet (ADR-016).
--
-- The band was opened to [3,24] without a shadow-mode period, so this is the
-- substitute: every claim records the inputs that chose its magnitude, making
-- the live distribution observable against the measured predictions instead of
-- reconstructible only from ledger amounts after the fact.
--
-- Deliberately NOT part of the ledger. This is analytics; a write failure here
-- must never block or roll back a payout, so the service writes it best-effort
-- after the credit commits.
--
-- NOTE: wrapped in a transaction by the migration runner.

CREATE TABLE IF NOT EXISTS faucet_claim_resonance (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  claim_date        DATE NOT NULL,
  site              VARCHAR(16) NOT NULL,
  synastry_score    DECIMAL(16, 8) NOT NULL,
  chart_baseline    DECIMAL(16, 8) NOT NULL,
  resonance_ratio   DECIMAL(16, 8) NOT NULL,
  total_esms        DECIMAL(12, 4) NOT NULL,
  -- 'none' | 'min' | 'max': whether the band clamped the total. Claims piling
  -- up on a rail is the first sign the calibration has drifted.
  band_edge         VARCHAR(8) NOT NULL,
  baseline_version  VARCHAR(64) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE faucet_claim_resonance IS
  'Observability for the untethered daily faucet: the synastry inputs behind each claim total. Analytics only — never a ledger source.';

-- One row per user per site per day, matching the claim idempotency key.
CREATE UNIQUE INDEX IF NOT EXISTS idx_faucet_resonance_claim
  ON faucet_claim_resonance (user_id, site, claim_date);

-- The admin panel reads recent days and buckets totals across the band.
CREATE INDEX IF NOT EXISTS idx_faucet_resonance_date
  ON faucet_claim_resonance (claim_date DESC);

/**
 * Retention: 180 days of raw rows — long enough to cover a full band cycle and
 * to check emission pace against the ~4,380 ESMS/user/year target, while
 * staying bounded on a database with a documented connection ceiling.
 */
CREATE OR REPLACE FUNCTION prune_faucet_claim_resonance(retain_days INTEGER DEFAULT 180)
RETURNS TABLE (faucet_resonance_deleted BIGINT) AS $$
DECLARE
  deleted BIGINT;
BEGIN
  DELETE FROM faucet_claim_resonance
   WHERE claim_date < (CURRENT_DATE - make_interval(days => retain_days));
  GET DIAGNOSTICS deleted = ROW_COUNT;
  RETURN QUERY SELECT deleted;
END;
$$ LANGUAGE plpgsql;
