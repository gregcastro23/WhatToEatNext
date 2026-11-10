-- Migration 101: Phase 45 Follow-Through — Durable Cosmic Generation Operations
-- Tracks (user_id, operation_key) generation operations in PostgreSQL with a
-- 90-second stale-lock recovery threshold, request fingerprint verification,
-- debit/refund transaction references, and cached terminal receipts.

CREATE TABLE IF NOT EXISTS cosmic_generation_operations (
  operation_key TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN (
      'claimed',
      'debited',
      'generating',
      'completed',
      'refund_pending',
      'refunded',
      'failed'
    )
  ),
  request_fingerprint TEXT NOT NULL,
  recipe_id TEXT,
  debit_tx_id TEXT,
  refund_tx_id TEXT,
  error_message TEXT,
  response_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 seconds'),
  CONSTRAINT pk_cosmic_generation_operations PRIMARY KEY (user_id, operation_key)
);

CREATE INDEX IF NOT EXISTS idx_cosmic_gen_ops_status_expires
  ON cosmic_generation_operations (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_cosmic_gen_ops_debit_tx
  ON cosmic_generation_operations (debit_tx_id)
  WHERE debit_tx_id IS NOT NULL;

