-- database/init/60-tables-schema.sql
-- The Table entity: PR 2 of the Tables program (docs/plans/pr2-table-entity-plan.md).
--
-- A Table is the atomic social unit for a dining occasion — lifecycle
-- planned -> live -> memory (terminal), or planned/live -> cancelled
-- (terminal). Postgres is the authoritative record across the whole
-- lifecycle; SpacetimeDB (spacetime-module/src/live_tables.rs) is an
-- ephemeral, presence-only UX layer for the live phase.
--
-- Migration number ASSIGNED (not discovered) per
-- docs/plans/tables-program-sequencing.md Reconciliation 2: 60 + 61 are
-- reserved for this PR; 62 + 63 for PR 3 (chat). Re-verified free against
-- origin/master immediately before this migration's first commit.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'table_status') THEN
    CREATE TYPE table_status AS ENUM ('planned', 'live', 'memory', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tables (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                VARCHAR(160) NOT NULL,
  description          TEXT,
  scheduled_at         TIMESTAMPTZ NOT NULL,            -- "now" for impromptu tables
  venue_type           VARCHAR(20) NOT NULL DEFAULT 'home' CHECK (venue_type IN ('home','restaurant','other')),
  venue_restaurant_id  TEXT REFERENCES restaurants(id) ON DELETE SET NULL,  -- restaurants.id is TEXT
  venue_name           VARCHAR(200),
  venue_address        TEXT,
  status               table_status NOT NULL DEFAULT 'planned',
  visibility           VARCHAR(20) NOT NULL DEFAULT 'commensals' CHECK (visibility IN ('public','commensals','private')),
  composite_snapshot   JSONB,
  composite_updated_at TIMESTAMPTZ,
  menu                 JSONB NOT NULL DEFAULT '[]',     -- [{name, recipeRef?, course?}]
  memory               JSONB,                           -- frozen artifact, written once at close
  went_live_at         TIMESTAMPTZ,
  closed_at            TIMESTAMPTZ,
  feed_event_id        UUID REFERENCES feed_events(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tables_host   ON tables (host_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables (status, scheduled_at);

CREATE TABLE IF NOT EXISTS table_members (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id                  UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id                   UUID REFERENCES users(id) ON DELETE CASCADE,   -- humans AND agents (is_agent users) — owner directive
  manual_companion_chart_id VARCHAR(255) REFERENCES manual_companion_charts(id) ON DELETE SET NULL,
  role                      VARCHAR(10) NOT NULL DEFAULT 'guest' CHECK (role IN ('host','guest')),
  rsvp_status               VARCHAR(10) NOT NULL DEFAULT 'invited' CHECK (rsvp_status IN ('invited','joined','declined')),
  joined_via                VARCHAR(10) CHECK (joined_via IN ('host','link','qr','invite','search','manual')),
  invited_by                UUID REFERENCES users(id) ON DELETE SET NULL,
  display_name              VARCHAR(120),               -- denormalized; required for manual guests
  rsvp_at                   TIMESTAMPTZ,
  created_at                TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT table_member_one_identity CHECK ((user_id IS NULL) <> (manual_companion_chart_id IS NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_table_member_user   ON table_members (table_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_table_member_manual ON table_members (table_id, manual_companion_chart_id) WHERE manual_companion_chart_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_table_members_user  ON table_members (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_table_members_table ON table_members (table_id);

CREATE TABLE IF NOT EXISTS table_invites (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id    UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  token       VARCHAR(64) NOT NULL UNIQUE,   -- crypto.randomBytes(24).toString('base64url')
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  max_uses    INT NOT NULL DEFAULT 20 CHECK (max_uses BETWEEN 1 AND 100),
  use_count   INT NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_table_invites_table ON table_invites (table_id);

CREATE TABLE IF NOT EXISTS table_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_table_photos_table ON table_photos (table_id, created_at);

CREATE TABLE IF NOT EXISTS table_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body VARCHAR(1000) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_table_comments_table ON table_comments (table_id, created_at);

-- updated_at triggers (house pattern: DO $$ guard, mirrors 15-commensals-schema.sql).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_tables_updated_at'
    ) THEN
        CREATE TRIGGER update_tables_updated_at
            BEFORE UPDATE ON tables
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_table_members_updated_at'
    ) THEN
        CREATE TRIGGER update_table_members_updated_at
            BEFORE UPDATE ON table_members
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- QR is NOT a separate invite kind — one token, two renderings; provenance on
-- the member row (table_members.joined_via) at redemption time.
--
-- dining_groups JSONB (user_profiles.dining_groups) is left legacy/read-only —
-- no backfill (single-owner templates without lifecycle). "Start a Table with
-- this group" is a fast follow, not part of this migration.
