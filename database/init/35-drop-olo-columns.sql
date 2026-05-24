-- Drop dead Olo columns and index from restaurants.
--
-- The Olo scaffold (src/services/oloService.ts and src/app/api/restaurants/
-- [restaurantId]/menu/route.ts) was removed in favor of Deliverect for
-- POS/menu integration and Yelp/Foursquare/Google Places (orchestrated by
-- restaurantDiscoveryService) for discovery. No remaining code reads or
-- writes olo_restaurant_id, menu_sync_enabled, or last_menu_sync.
--
-- restaurant_order_intents.partner_system / partner_order_id / partner_status
-- are intentionally KEPT — they are partner-agnostic and Deliverect (or any
-- future integration) populates them. Only the Olo-specific fields go.
--
-- Idempotent: safe to re-run.

DROP INDEX IF EXISTS idx_restaurants_olo_restaurant_id;

ALTER TABLE restaurants
  DROP COLUMN IF EXISTS olo_restaurant_id,
  DROP COLUMN IF EXISTS menu_sync_enabled,
  DROP COLUMN IF EXISTS last_menu_sync;
