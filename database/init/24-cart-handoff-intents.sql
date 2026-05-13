-- Lightweight Amazon cart handoff telemetry.
-- Captures purchase intent before the browser submits the sanitized payload to Amazon.

CREATE TABLE IF NOT EXISTS cart_handoff_intents (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  source TEXT NOT NULL DEFAULT 'unknown',
  item_count INTEGER NOT NULL,
  dropped_count INTEGER NOT NULL DEFAULT 0,
  estimated_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  chakra_counts JSONB NOT NULL DEFAULT '{}'::jsonb,
  ingredient_names JSONB NOT NULL DEFAULT '[]'::jsonb,
  asin_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_handoff_intents_created_at
  ON cart_handoff_intents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_handoff_intents_source_created_at
  ON cart_handoff_intents (source, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cart_handoff_intents_user_created_at
  ON cart_handoff_intents (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
