-- database/init/15-commensals-schema.sql
-- Commensal System: Linked Dining Companions and Manual Charts
-- Replaces legacy friendships table with brand-specific commensal ships.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'commensalship_status') THEN
        CREATE TYPE commensalship_status AS ENUM ('pending', 'accepted', 'blocked');
    END IF;
END
$$;

-- Table for user-to-user dining companion links
CREATE TABLE IF NOT EXISTS commensalships (
  id VARCHAR(255) PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status commensalship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate requests and reflect brand naming
  CONSTRAINT commensalships_unique_pair UNIQUE (requester_id, addressee_id),
  CONSTRAINT commensalships_no_self CHECK (requester_id <> addressee_id)
);

-- Table for companions who DO NOT have an alchm.kitchen account
-- (Migrating them out of user_profiles JSONB for better querying)
CREATE TABLE IF NOT EXISTS manual_companion_charts (
  id VARCHAR(255) PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  relationship VARCHAR(50) DEFAULT 'friend',
  birth_data JSONB NOT NULL,
  natal_chart JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_commensalships_requester ON commensalships (requester_id);
CREATE INDEX IF NOT EXISTS idx_commensalships_addressee ON commensalships (addressee_id);
CREATE INDEX IF NOT EXISTS idx_manual_companion_owner ON manual_companion_charts (owner_id);

-- Updated_at trigger for manual_companion_charts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_manual_companion_charts_updated_at'
    ) THEN
        CREATE TRIGGER update_manual_companion_charts_updated_at
            BEFORE UPDATE ON manual_companion_charts
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
