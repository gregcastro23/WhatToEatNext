-- Migration 96: Restaurant Favorites, Granular Comments, and Recipe Alchemization Opt-In
-- Supports saving restaurant sanctuaries, granular dish/menu-item comments,
-- and opting in / nominating restaurants to the "Alchemize Our Recipes" program.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Favorite Restaurants
CREATE TABLE IF NOT EXISTS user_favorite_restaurants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  cuisine TEXT,
  source TEXT,
  notes TEXT,
  favorite_dishes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_favorite UNIQUE (user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user
  ON user_favorite_restaurants (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_favorites_restaurant
  ON user_favorite_restaurants (restaurant_id);

-- 2. Restaurant Comments (both general restaurant comments and granular menu item comments)
CREATE TABLE IF NOT EXISTS restaurant_comments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  menu_item_id TEXT,
  dish_name TEXT,
  user_id TEXT,
  user_display_name TEXT NOT NULL DEFAULT 'Alchemist',
  comment TEXT NOT NULL,
  helpful_count INT NOT NULL DEFAULT 0,
  elemental_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurant_comments_rest
  ON restaurant_comments (restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_restaurant_comments_item
  ON restaurant_comments (restaurant_id, menu_item_id, created_at DESC)
  WHERE menu_item_id IS NOT NULL;

-- 3. Restaurant Alchemize Opt-Ins (Owner opt-ins and diner nominations)
CREATE TABLE IF NOT EXISTS restaurant_alchemize_opt_ins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  restaurant_id TEXT NOT NULL,
  restaurant_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'chef', 'diner_nomination')),
  signature_dishes_to_alchemize TEXT[] DEFAULT '{}',
  recipe_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'alchemized')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alchemize_optins_restaurant
  ON restaurant_alchemize_opt_ins (restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_alchemize_optins_status
  ON restaurant_alchemize_opt_ins (status, created_at DESC);

-- 4. Add alchemize_opt_in column to restaurants table and flag partner restaurants
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS alchemize_opt_in BOOLEAN DEFAULT FALSE;

UPDATE restaurants
SET alchemize_opt_in = TRUE
WHERE id IN ('partner_alchm_trattoria', 'partner_sol_taqueria', 'partner_celestial_ramen');
