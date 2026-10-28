-- Migration 98: Favorite Recipes and Ingredient Tracking
-- Allows users to favorite recipes, track specific liked ingredients,
-- and aggregate personal top-tracked ingredient affinities.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_favorite_recipes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  cuisine TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  liked_ingredients TEXT[] NOT NULL DEFAULT '{}',
  elemental_profile JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_favorite_recipe UNIQUE (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_user_fav_recipes_user
  ON user_favorite_recipes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_fav_recipes_recipe
  ON user_favorite_recipes (recipe_id);

CREATE INDEX IF NOT EXISTS idx_user_fav_recipes_ingredients
  ON user_favorite_recipes USING gin (ingredients);

CREATE INDEX IF NOT EXISTS idx_user_fav_recipes_liked
  ON user_favorite_recipes USING gin (liked_ingredients);
