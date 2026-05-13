-- Restaurant ordering telemetry and Stripe reconciliation.
-- Captures order intent before Checkout, then updates status from Stripe webhooks.

CREATE TABLE IF NOT EXISTS restaurant_order_intents (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  cuisine_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'unknown',
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_url TEXT NOT NULL,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_connected_account_id TEXT,
  stripe_transfer_id TEXT,
  split_mode TEXT NOT NULL DEFAULT 'external',
  currency TEXT NOT NULL DEFAULT 'usd',
  subtotal_cents INTEGER NOT NULL DEFAULT 0,
  platform_fee_cents INTEGER NOT NULL DEFAULT 0,
  transfer_amount_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'created',
  payment_status TEXT,
  transfer_status TEXT,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_created_at
  ON restaurant_order_intents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_user_created_at
  ON restaurant_order_intents (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_session
  ON restaurant_order_intents (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_restaurant_created_at
  ON restaurant_order_intents (restaurant_id, created_at DESC);
