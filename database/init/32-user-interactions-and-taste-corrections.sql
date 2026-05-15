-- database/init/32-user-interactions-and-taste-corrections.sql
-- Server-persisted personalization. Replaces the in-memory user-learning
-- singleton: user_interactions is the canonical event store that drives the
-- Taste Graph on /profile/[userId], and taste_corrections is the explicit
-- override layer where an owner can say "more Italian / never beets."

CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(64) NOT NULL,
    -- recipe_view, recipe_save, recipe_cook, ingredient_select,
    -- cooking_method, planetary_query, food_diary_entry, food_rating
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    context JSONB NOT NULL DEFAULT '{}'::jsonb,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_created
    ON user_interactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_type_created
    ON user_interactions (user_id, interaction_type, created_at DESC);

-- Owner overrides on top of the implicit graph.
-- Shape: { cuisines: { Italian: "love" | "block" }, ingredients: {...},
--          methods: {...}, planets: {...} }
ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS taste_corrections JSONB NOT NULL DEFAULT '{}'::jsonb;
