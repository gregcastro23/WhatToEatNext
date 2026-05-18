-- Device sessions for cross-subdomain JWT session management.
--
-- Backs the /profile/security UI: each row represents an active sign-in
-- session keyed by (user_id, jti). NextAuth writes a row at jwt-callback
-- time and updates `last_seen_at` on each token refresh. The UI lists
-- these rows for the current user; DELETE /api/auth/sessions/:id revokes
-- one (other devices will see their next refresh fail and re-auth).

CREATE TABLE IF NOT EXISTS device_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  jti TEXT NOT NULL,
  subdomain TEXT NOT NULL DEFAULT 'kitchen.alchm.kitchen',
  device TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  location_city TEXT,
  location_region TEXT,
  location_country TEXT,
  provider TEXT NOT NULL DEFAULT 'google',
  current_for_jti TEXT,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_device_sessions_user_jti
  ON device_sessions (user_id, jti);

CREATE INDEX IF NOT EXISTS idx_device_sessions_user_last_seen
  ON device_sessions (user_id, last_seen_at DESC)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_device_sessions_user_revoked
  ON device_sessions (user_id, revoked_at)
  WHERE revoked_at IS NOT NULL;
