-- ==========================================
-- ESMS ON-CHAIN CLAIMS
-- Migration 56: bridge ledger — off-chain earned ESMS → on-chain soulbound
-- ERC-1155 (EsmsToken.claimMint on Base). One row per claim attempt; claim_id
-- is the bytes32 the contract enforces uniqueness on, so a row can always be
-- reconciled against the chain (claimed(claim_id)) no matter where the flow
-- was interrupted.
-- Created: July 2026
-- ==========================================

CREATE TABLE IF NOT EXISTS esms_onchain_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,           -- recipient at claim time
    claim_id VARCHAR(66) NOT NULL UNIQUE,          -- bytes32 hex; on-chain idempotency key
    spirit DECIMAL(12, 4) NOT NULL DEFAULT 0,
    essence DECIMAL(12, 4) NOT NULL DEFAULT 0,
    matter DECIMAL(12, 4) NOT NULL DEFAULT 0,
    substance DECIMAL(12, 4) NOT NULL DEFAULT 0,
    -- pending: debited off-chain, mint not yet confirmed (retryable — the
    --          contract's claimId uniqueness makes re-mints safe)
    -- minted:  claimMint confirmed on-chain
    -- refunded: mint permanently failed and the debit was re-credited
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'minted', 'refunded')),
    tx_hash VARCHAR(66),
    error TEXT,
    transaction_group_id UUID,                     -- the off-chain debit group
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE esms_onchain_claims IS 'Claim bridge: each row moves a snapshot of off-chain ESMS balance on-chain via EsmsToken.claimMint. claim_id doubles as the contract-level idempotency key.';

-- One in-flight claim per user: a new claim may not start until the previous
-- one is minted or refunded (reconciled on the next request).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_esms_onchain_claims_pending
    ON esms_onchain_claims (user_id) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_esms_onchain_claims_user
    ON esms_onchain_claims (user_id, created_at DESC);
