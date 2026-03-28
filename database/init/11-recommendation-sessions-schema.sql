-- Shared Recommendation Sessions
-- Premium users can create group recommendation sessions
-- that persist results and can be shared with invited members.

CREATE TABLE IF NOT EXISTS recommendation_sessions (
    id VARCHAR(255) PRIMARY KEY,
    creator_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Group Session',
    member_ids JSONB NOT NULL DEFAULT '[]',
    strategy VARCHAR(50) NOT NULL DEFAULT 'consensus',
    results JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_creator
    ON recommendation_sessions (creator_id);

CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_status
    ON recommendation_sessions (status, expires_at);
