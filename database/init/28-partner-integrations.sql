-- Partner integration fields for Olo-centric restaurant discovery and ordering.

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS olo_restaurant_id TEXT,
  ADD COLUMN IF NOT EXISTS menu_sync_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_menu_sync TIMESTAMPTZ;

ALTER TABLE restaurant_order_intents
  ADD COLUMN IF NOT EXISTS partner_system TEXT,
  ADD COLUMN IF NOT EXISTS partner_order_id TEXT,
  ADD COLUMN IF NOT EXISTS partner_status TEXT;

CREATE INDEX IF NOT EXISTS idx_restaurants_olo_restaurant_id
  ON restaurants (olo_restaurant_id)
  WHERE olo_restaurant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurant_order_intents_partner_order
  ON restaurant_order_intents (partner_system, partner_order_id)
  WHERE partner_system IS NOT NULL AND partner_order_id IS NOT NULL;
