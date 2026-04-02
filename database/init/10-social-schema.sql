-- database/init/10-social-schema.sql
-- Social Features: Friendships, Saved Charts, Cosmic Identities
-- Migration for expanding user social data ecosystem

-- ==========================================
-- SAVED CHARTS (decoupled from user_profiles JSONB)
-- ==========================================

CREATE TABLE IF NOT EXISTS saved_charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,                     -- e.g. "Personal", "Career/Mundane"
  chart_type VARCHAR(50) NOT NULL DEFAULT 'manual', -- 'primary' | 'cosmic_identity' | 'manual'
  birth_data JSONB NOT NULL,                        -- BirthData object
  natal_chart JSONB NOT NULL,                       -- NatalChart object
  is_primary BOOLEAN NOT NULL DEFAULT false,        -- true for the user's main birth chart
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enforce at most one primary chart per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_charts_primary
  ON saved_charts (owner_id) WHERE is_primary = true;

CREATE INDEX IF NOT EXISTS idx_saved_charts_owner ON saved_charts (owner_id);
CREATE INDEX IF NOT EXISTS idx_saved_charts_type ON saved_charts (chart_type);

-- Trigger for updated_at
CREATE TRIGGER update_saved_charts_updated_at
  BEFORE UPDATE ON saved_charts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

COMMENT ON TABLE saved_charts IS 'Decoupled birth charts: primary, cosmic identities, and manual companion charts';
COMMENT ON TABLE friendships IS 'Many-to-many friendship relationships between registered users';
COMMENT ON COLUMN saved_charts.chart_type IS 'primary = user main chart, cosmic_identity = alternate persona, manual = companion without account';
COMMENT ON COLUMN friendships.status IS 'pending = awaiting acceptance, accepted = mutual friends, blocked = rejected/blocked';
