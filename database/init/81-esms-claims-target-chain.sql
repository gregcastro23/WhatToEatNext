-- ==========================================
-- ESMS ON-CHAIN CLAIMS DUAL-RAIL ISOLATION & SCHEMA HARDENING
-- Migration 81: Dual-Rail Ledger Isolation & Schema Hardening
--
-- Widen wallet_address and tx_hash columns to TEXT, add target_chain with CAIP-2 CHECK constraint,
-- add EVM address validation constraint for Base rails, drop permanent column default,
-- partition pending claim unique index per rail, and optimize rail reconcile index.
-- ==========================================

ALTER TABLE esms_onchain_claims
  ALTER COLUMN wallet_address TYPE TEXT,
  ALTER COLUMN tx_hash TYPE TEXT;

ALTER TABLE esms_onchain_claims
  ADD COLUMN IF NOT EXISTS target_chain TEXT NOT NULL DEFAULT 'eip155:84532';

ALTER TABLE esms_onchain_claims
  ALTER COLUMN target_chain DROP DEFAULT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'esms_onchain_claims_target_chain_check'
  ) THEN
    ALTER TABLE esms_onchain_claims
      ADD CONSTRAINT esms_onchain_claims_target_chain_check
      CHECK (target_chain IN ('eip155:8453', 'eip155:84532', 'solana:mainnet-beta', 'solana:devnet'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'esms_onchain_claims_evm_wallet_check'
  ) THEN
    ALTER TABLE esms_onchain_claims
      ADD CONSTRAINT esms_onchain_claims_evm_wallet_check
      CHECK (target_chain NOT LIKE 'eip155:%' OR wallet_address ~ '^0x[0-9a-fA-F]{40}$');
  END IF;
END $$;

DROP INDEX IF EXISTS uniq_esms_onchain_claims_pending;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_esms_onchain_claims_pending_rail
  ON esms_onchain_claims (user_id, target_chain)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_esms_claims_rail_reconcile
  ON esms_onchain_claims (target_chain, status, updated_at, created_at);
