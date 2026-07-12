-- ==========================================
-- SOCIAL GRAPH & IDENTITY (PR 4)
-- Migration 64: asymmetric follow layer + profile identity columns.
-- Two-tier graph: commensalships = the inner circle (mutual, chart-sharing),
-- follows = public reach (one-directional, no consent required).
-- Created: July 2026
-- ==========================================

CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT follows_pkey    PRIMARY KEY (follower_id, followee_id),  -- unique pair
  CONSTRAINT follows_no_self CHECK (follower_id <> followee_id)
);

COMMENT ON TABLE follows IS 'Asymmetric follow edges (public reach). Blocked pairs cannot follow: enforced at write time in followDatabaseService (fail-closed) plus purge-on-block from commensalDatabaseService.blockCommensal — no cross-table trigger by design.';

-- PK serves follower→followee lookups; these serve recency-ordered lists both ways.
CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows (followee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows (follower_id, created_at DESC);

-- Identity & avatar — user_profiles is canonical for profile-facing columns
-- (migrations 31/52 precedent). Rows may not exist for every user: writers
-- upsert ON CONFLICT (user_id), readers treat a NULL row as share_identity=true.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS share_identity BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN user_profiles.avatar_url IS 'User-uploaded avatar (R2 avatars/<userId>/<hash>.<ext>). Read chain everywhere: COALESCE(up.avatar_url, u.image) then client element-sigil fallback.';
COMMENT ON COLUMN user_profiles.share_identity IS 'Per-user identity default for feed posts: false = post anonymously by default. Never de-anonymizes past posts — see src/lib/feed/identity.ts resolver rules.';
