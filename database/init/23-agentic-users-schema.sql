-- database/init/23-agentic-users-schema.sql
-- Add is_agent to users and create feed_events table

-- 1. Add is_agent to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_agent BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Create feed_events table
CREATE TABLE IF NOT EXISTS feed_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    metadata_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_events_actor ON feed_events (actor_id);
CREATE INDEX IF NOT EXISTS idx_feed_events_created ON feed_events (created_at);
CREATE INDEX IF NOT EXISTS idx_feed_events_type ON feed_events (event_type);
