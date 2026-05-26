-- Migration: 44-user-daily-limits.sql
-- Create table to track daily recipe generation counts for freemium limits.

CREATE TABLE IF NOT EXISTS user_daily_limits (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    recipes_generated INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, date)
);

-- Index for fast daily query lookups
CREATE INDEX IF NOT EXISTS idx_user_daily_limits_lookup ON user_daily_limits(user_id, date);

-- Apply trigger to keep updated_at in sync
DROP TRIGGER IF EXISTS update_user_daily_limits_updated_at ON user_daily_limits;
CREATE TRIGGER update_user_daily_limits_updated_at 
    BEFORE UPDATE ON user_daily_limits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
