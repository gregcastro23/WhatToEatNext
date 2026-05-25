-- database/init/10-social-schema.sql
-- Social Features: Friendships, Saved Charts, Cosmic Identities
-- Migration for expanding user social data ecosystem

-- ==========================================
-- SAVED CHARTS
-- Source of truth: this file matches the actual prod schema as of 2026-05-25.
-- The original design (owner_id / label / chart_type / birth_data JSONB /
-- natal_chart JSONB) was superseded by hand-applied DDL that flattened the
-- JSONB into structured columns (user_id / chart_name / birth_date /
-- birth_time / birth_latitude / birth_longitude / timezone_str) and added a
-- unique (user_id, chart_name) constraint. This file has been rewritten to
-- describe the post-evolution shape so a fresh DB build produces the same
-- table prod has today.
-- ==========================================

CREATE TABLE IF NOT EXISTS saved_charts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chart_name      VARCHAR(100) NOT NULL,            -- e.g. "Personal", "Career"
  birth_date      TIMESTAMP WITH TIME ZONE NOT NULL,
  birth_time      VARCHAR(50) NOT NULL,             -- e.g. "12:34:00" (string form)
  birth_latitude  REAL NOT NULL,
  birth_longitude REAL NOT NULL,
  timezone_str    VARCHAR(100) NOT NULL,            -- IANA tz, e.g. "America/New_York"
  is_primary      BOOLEAN NOT NULL,                 -- caller must supply; matches prod (no default)
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_charts_user ON saved_charts (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_chart_name ON saved_charts (user_id, chart_name);

-- ==========================================
-- FRIENDSHIPS (many-to-many between registered users)
-- ==========================================

CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Prevent duplicate friend requests in either direction
  CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id),
  CONSTRAINT friendships_no_self CHECK (requester_id <> addressee_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships (requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships (addressee_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships (status);

-- Composite index for looking up accepted friends for a user
CREATE INDEX IF NOT EXISTS idx_friendships_accepted_requester
  ON friendships (requester_id) WHERE status = 'accepted';
CREATE INDEX IF NOT EXISTS idx_friendships_accepted_addressee
  ON friendships (addressee_id) WHERE status = 'accepted';

-- Trigger for updated_at
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- COMMENTS
-- ==========================================

COMMENT ON TABLE saved_charts IS 'Decoupled birth charts owned per user_id, identified by chart_name (e.g. "Personal", "Career"). is_primary marks the user''s main chart but is not enforced unique.';
COMMENT ON TABLE friendships IS 'Many-to-many friendship relationships between registered users';
COMMENT ON COLUMN friendships.status IS 'pending = awaiting acceptance, accepted = mutual friends, blocked = rejected/blocked';
