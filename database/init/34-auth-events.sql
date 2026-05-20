-- Auth events: a structured audit log for everything that happens during
-- sign-in, sign-out, and session management.
--
-- This is the source of truth for "how many login attempts did we have", and
-- it captures both successful and failed flows including: DB lookup failures,
-- JIT user-creation failures, account-link upsert errors, role promotions,
-- explicit sign-outs, session revocations, and OAuth provider errors that
-- surface on the /auth/error page.
--
-- Design notes
--  * `user_id` is nullable because failed sign-ins (provider error, JIT
--    failure) often happen before we can resolve a DB user.
--  * `email` is captured separately for the same reason and lets us
--    correlate failures by identity even when no row was ever created.
--  * `event_type` is a short enum-ish string; we use TEXT + a CHECK so we
--    can extend it without an enum migration (auth-system evolution is
--    typically the *reason* we need this table).
--  * `status` is `success` | `failure` | `info` — `info` covers state
--    transitions like role promotion or session-cookie refresh.
--  * `metadata` JSONB carries event-specific structured data
--    (e.g., `{ "provider": "google", "isNewUser": true }`).
--  * Indexes target the access patterns we actually ship:
--      - per-user history (UI, debugging single account)
--      - per-event-type rollups (counting attempts, failure rates)
--      - recent activity (admin dashboard)

CREATE TABLE IF NOT EXISTS auth_events (
  id             BIGSERIAL PRIMARY KEY,
  user_id        TEXT,
  email          TEXT,
  event_type     TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('success', 'failure', 'info')),
  provider       TEXT,
  ip_hash        TEXT,
  user_agent     TEXT,
  error_code     TEXT,
  error_message  TEXT,
  metadata       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_events_user_created
  ON auth_events (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auth_events_email_created
  ON auth_events (email, created_at DESC)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_auth_events_type_status_created
  ON auth_events (event_type, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_auth_events_created
  ON auth_events (created_at DESC);

-- Optional: partial index to make "find recent failures" instant.
CREATE INDEX IF NOT EXISTS idx_auth_events_failures
  ON auth_events (created_at DESC, event_type)
  WHERE status = 'failure';

COMMENT ON TABLE auth_events IS
  'Structured audit log for sign-in / sign-out / session events. Source of truth for login-attempt analytics. Safe to truncate older rows (this is not the primary data store).';
COMMENT ON COLUMN auth_events.event_type IS
  'Short snake_case identifier. Examples: signin_started, signin_user_lookup_failed, signin_user_created, signin_account_link_failed, signin_complete, signin_provider_error, signout, session_revoked.';
