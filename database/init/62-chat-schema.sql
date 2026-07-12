-- database/init/62-chat-schema.sql
-- Messaging: PR 3 of the Tables program (docs/plans/pr3-messaging-plan.md).
--
-- One Postgres data model for all three conversation kinds:
--   'table'  — the live Table discussion (subject_ref = tables.id UUID as
--              text, per docs/plans/tables-program-sequencing.md
--              Reconciliation 1; NOT a Spacetime session id). Postgres is
--              the canonical record and survives close; SpacetimeDB only
--              mirrors table-chat bodies for live delivery.
--   'dm'     — canonicalized 1:1 (dm_user_lo < dm_user_hi); bodies NEVER
--              enter SpacetimeDB (world-readable tables).
--   'circle' — small named group; bodies NEVER enter SpacetimeDB.
--
-- Migration number ASSIGNED (not discovered) per
-- docs/plans/tables-program-sequencing.md Reconciliation 2: 62 + 63 belong
-- to PR 3. Re-verified free against origin/master immediately before this
-- PR's final commit.

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind TEXT NOT NULL CHECK (kind IN ('table','dm','circle')),
  -- tables.id UUID (as text) for 'table', circle id for 'circle', NULL for 'dm'.
  subject_ref TEXT,
  title VARCHAR(255),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  dm_user_lo UUID REFERENCES users(id) ON DELETE CASCADE,   -- DM canonicalization: ordered pair
  dm_user_hi UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversations_dm_pair CHECK ((kind = 'dm') = (dm_user_lo IS NOT NULL AND dm_user_hi IS NOT NULL)),
  CONSTRAINT conversations_dm_order CHECK (kind <> 'dm' OR dm_user_lo < dm_user_hi),
  CONSTRAINT conversations_subject CHECK (kind = 'dm' OR subject_ref IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conversations_dm_pair ON conversations (dm_user_lo, dm_user_hi) WHERE kind = 'dm';
CREATE UNIQUE INDEX IF NOT EXISTS uniq_conversations_subject ON conversations (kind, subject_ref) WHERE kind <> 'dm';

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('host','member')),
  notify_level TEXT NOT NULL DEFAULT 'all' CHECK (notify_level IN ('all','mentions','none')),
  muted_by_host_until TIMESTAMP WITH TIME ZONE,
  last_read_at TIMESTAMP WITH TIME ZONE,
  last_read_message_id UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP WITH TIME ZONE,
  banned BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members (user_id) WHERE left_at IS NULL;

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,   -- agents are users: agent senders supported
  body TEXT NOT NULL CHECK (char_length(body) <= 2000),
  attachments JSONB NOT NULL DEFAULT '[]',      -- [{type:'photo', url}] max 1 in v1
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  client_key VARCHAR(64),                       -- optimistic-send idempotency
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  flagged_count INTEGER NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT false         -- auto-hide at flagged_count >= 3, or admin
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages (conversation_id, created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_messages_client_key ON messages (conversation_id, sender_id, client_key) WHERE client_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id, created_at DESC);

CREATE TABLE IF NOT EXISTS message_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','other')),
  detail TEXT CHECK (char_length(detail) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed','actioned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uniq_message_report UNIQUE (message_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS idx_message_reports_status ON message_reports (status, created_at DESC);

-- Binds app users to Spacetime browser identities (multi-device). Convenience/telemetry ONLY —
-- authorization stays in the module reducers.
CREATE TABLE IF NOT EXISTS user_spacetime_identities (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  identity_hex VARCHAR(66) NOT NULL,
  bound_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, identity_hex)
);
CREATE INDEX IF NOT EXISTS idx_user_spacetime_identity ON user_spacetime_identities (identity_hex);

-- updated_at trigger (house pattern: DO $$ guard, mirrors 60-tables-schema.sql).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversations_updated_at'
    ) THEN
        CREATE TRIGGER update_conversations_updated_at
            BEFORE UPDATE ON conversations
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Retention: canonical messages are kept indefinitely; soft-deleted bodies are
-- retained 30 days for moderation then scrubbed via cron (follow-up); the
-- SpacetimeDB table_chat_message mirror is pruned to the newest 200 rows per
-- table by the send reducer and wholesale on session close. Table
-- conversations auto-archive when the table closes.
