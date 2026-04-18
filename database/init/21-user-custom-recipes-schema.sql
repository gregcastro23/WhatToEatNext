-- User-generated / "riffed" recipe variants saved to a personal cookbook.
-- These are standalone payloads (not references to catalog recipes) so users
-- keep their versions even if the source catalog entry is removed or edited.

CREATE TABLE IF NOT EXISTS user_custom_recipes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  cuisine      TEXT,
  source       TEXT,                        -- "generator" | "riff" | "import"
  source_recipe_id TEXT,                    -- optional reference to a seed recipe
  payload      JSONB NOT NULL,              -- full recipe object (ingredients, instructions, nutrition, elementals…)
  notes        TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_custom_recipes_user
  ON user_custom_recipes (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_custom_recipes_source
  ON user_custom_recipes (user_id, source);

CREATE TRIGGER update_user_custom_recipes_updated_at
  BEFORE UPDATE ON user_custom_recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
