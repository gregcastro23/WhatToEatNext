-- POS and delivery fulfillment tracking for restaurant orders.

ALTER TABLE restaurant_order_intents
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'pickup',
  ADD COLUMN IF NOT EXISTS customer_info JSONB,
  ADD COLUMN IF NOT EXISTS delivery_address JSONB,
  ADD COLUMN IF NOT EXISTS deliverect_order_id TEXT,
  ADD COLUMN IF NOT EXISTS pos_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivery_provider TEXT,
  ADD COLUMN IF NOT EXISTS delivery_tracking_id TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT,
  ADD COLUMN IF NOT EXISTS delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS estimated_ready_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS fulfillment_attempt_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fulfillment_last_error TEXT;

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS address JSONB,
  ADD COLUMN IF NOT EXISTS deliverect_location_id TEXT;

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_fulfillment
  ON restaurant_order_intents (status, pos_status, delivery_status);

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_deliverect_order
  ON restaurant_order_intents (deliverect_order_id)
  WHERE deliverect_order_id IS NOT NULL;
