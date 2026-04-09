CREATE TABLE IF NOT EXISTS weekly_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date TIMESTAMP NOT NULL,
    meals JSONB NOT NULL,
    nutritional_totals JSONB NOT NULL,
    grocery_list JSONB NOT NULL,
    inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
    weekly_budget NUMERIC,
    is_template BOOLEAN DEFAULT false,
    template_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_menus_user_week
  ON weekly_menus(user_id, week_start_date);

CREATE INDEX IF NOT EXISTS idx_weekly_menus_user_templates
  ON weekly_menus(user_id, is_template);
