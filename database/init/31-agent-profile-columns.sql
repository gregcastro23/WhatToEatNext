-- database/init/31-agent-profile-columns.sql
-- Add agent identity columns to user_profiles so the planetary-agents action
-- engine can persist bios, natal positions, dominant element, and the Monica
-- constant alongside human profiles. The /api/economy/sync-debit endpoint
-- writes these fields whenever an agentic action is reported.

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS natal_positions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS dominant_element VARCHAR(32);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monica_constant NUMERIC(12,6);

-- Index for the public network listing (agents with bios surfaced first)
CREATE INDEX IF NOT EXISTS idx_user_profiles_dominant_element
    ON user_profiles (dominant_element);
