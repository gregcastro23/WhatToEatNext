-- Migration 95: Restaurant Dish Reviews & Ratings
-- Supports rating specific dishes from restaurants, leaving comments,
-- mood tags, and linking to order intents and food diary.

CREATE TABLE IF NOT EXISTS restaurant_dish_reviews (
  id TEXT PRIMARY KEY,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  dish_name TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
  comment TEXT,
  mood_tags TEXT[] DEFAULT '{}',
  would_eat_again BOOLEAN,
  order_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dish_reviews_restaurant
  ON restaurant_dish_reviews (restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_dish_reviews_user
  ON restaurant_dish_reviews (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Seed partner restaurants so in-app POS ordering is active
INSERT INTO restaurants (
  id, name, external_provider, external_id, menu_url,
  stripe_connect_account_id, onboarding_status, charges_enabled, payouts_enabled, details_submitted
) VALUES
  ('partner_alchm_trattoria', 'Alchm Trattoria & Pizzeria', 'osm', 'partner_alchm_trattoria', '/restaurants/partner_alchm_trattoria/menu', 'acct_alchm_trattoria_test', 'completed', true, true, true),
  ('partner_sol_taqueria', 'Sol & Luna Cantina', 'osm', 'partner_sol_taqueria', '/restaurants/partner_sol_taqueria/menu', 'acct_sol_taqueria_test', 'completed', true, true, true),
  ('partner_celestial_ramen', 'Celestial Ramen House', 'osm', 'partner_celestial_ramen', '/restaurants/partner_celestial_ramen/menu', 'acct_celestial_ramen_test', 'completed', true, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stripe_connect_account_id = EXCLUDED.stripe_connect_account_id,
  onboarding_status = 'completed',
  charges_enabled = true,
  payouts_enabled = true;
