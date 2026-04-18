-- database/init/20-user-meal-plans-schema.sql
-- Cloud-synced meal plan entries for authenticated users.
-- Unauthenticated users keep data in localStorage (alchm:meal-plan:v1).

CREATE TABLE IF NOT EXISTS user_meal_plans (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id    TEXT NOT NULL,
  recipe_name  TEXT,
  date         DATE NOT NULL,
  meal_type    TEXT,
  servings     SMALLINT NOT NULL DEFAULT 1 CHECK (servings BETWEEN 1 AND 99),
  added_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_meal_plans_user_date
  ON user_meal_plans (user_id, date);

CREATE INDEX IF NOT EXISTS idx_user_meal_plans_recipe
  ON user_meal_plans (user_id, recipe_id);

CREATE TRIGGER update_user_meal_plans_updated_at
  BEFORE UPDATE ON user_meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE user_meal_plans IS 'Per-user scheduled meals for the meal planner';
