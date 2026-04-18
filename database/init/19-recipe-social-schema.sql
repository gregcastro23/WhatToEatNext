-- database/init/19-recipe-social-schema.sql
-- Recipe social interactions: per-user made-it, rating, review
-- Supports the SocialSection UX and aggregate "community tips" feed.

CREATE TABLE IF NOT EXISTS user_recipe_interactions (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id   TEXT NOT NULL,
  made_it     BOOLEAN NOT NULL DEFAULT false,
  rating      SMALLINT CHECK (rating IS NULL OR (rating BETWEEN 0 AND 5)),
  review      TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_user_recipe_interactions_recipe
  ON user_recipe_interactions (recipe_id);

-- For community tips feed: fast filter on high-rated, non-empty reviews
CREATE INDEX IF NOT EXISTS idx_user_recipe_interactions_tips
  ON user_recipe_interactions (recipe_id, rating DESC)
  WHERE review IS NOT NULL AND length(review) > 0 AND rating >= 4;

CREATE TRIGGER update_user_recipe_interactions_updated_at
  BEFORE UPDATE ON user_recipe_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_recipe_interactions IS 'Per-user recipe engagement: made-it toggle, rating, review';
COMMENT ON COLUMN user_recipe_interactions.recipe_id IS 'String recipe id (recipes live in code, not DB)';
