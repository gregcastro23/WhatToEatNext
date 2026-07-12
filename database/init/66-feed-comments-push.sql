-- ==========================================
-- FEED ENGAGEMENT: reactions-everywhere, comments, web push (PR 5)
-- Migration 66: widen the reaction constraint to per-kind, add feed comments +
-- comment reports, and the web-push subscription store.
-- Created: July 2026
--
-- Constraint widening only (§1): every existing feed_reactions row is unique on
-- (event_id, user_id) and therefore already unique on (event_id, user_id, kind),
-- so no backfill / dedupe pass is required. All existing rows are 'spark', so
-- the kind CHECK is safe to add without a scrub.
-- ==========================================

-- ── Reactions: one row per (event, user, KIND), toggleable ──────────────────
ALTER TABLE feed_reactions DROP CONSTRAINT IF EXISTS uniq_feed_reaction;
ALTER TABLE feed_reactions ADD CONSTRAINT uniq_feed_reaction_kind UNIQUE (event_id, user_id, kind);
ALTER TABLE feed_reactions DROP CONSTRAINT IF EXISTS feed_reactions_kind_check;
ALTER TABLE feed_reactions ADD CONSTRAINT feed_reactions_kind_check
  CHECK (kind IN ('spark','fire','water','earth','air'));  -- safe: all existing rows are 'spark'

COMMENT ON CONSTRAINT uniq_feed_reaction_kind ON feed_reactions IS
  'One reaction per (event, user, kind). A dish can be both Fire and Earth; a second tap on an active kind un-reacts (deletes the row). Reward dedupe stays kind-agnostic on eventId — five kinds cannot multiply pay.';

-- ── Comments on feed events (flat threads v1 — no reply_to_id) ───────────────
CREATE TABLE IF NOT EXISTS feed_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES feed_events(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  flagged_count INTEGER NOT NULL DEFAULT 0,
  hidden BOOLEAN NOT NULL DEFAULT false
);

COMMENT ON TABLE feed_comments IS 'Comments attached to feed events (cooked cards / narration rows). Distinct from PR 2 table_comments (which accrete on the table page). Real-identity author display via src/lib/social/identity.ts.';

CREATE INDEX IF NOT EXISTS idx_feed_comments_event
  ON feed_comments (event_id, created_at DESC, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_feed_comments_author
  ON feed_comments (author_id, created_at DESC);

-- ── Comment reports (mirrors PR 3 message_reports shape exactly) ─────────────
CREATE TABLE IF NOT EXISTS feed_comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES feed_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam','harassment','inappropriate','other')),
  detail TEXT CHECK (char_length(detail) <= 1000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed','actioned')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uniq_feed_comment_report UNIQUE (comment_id, reporter_id)
);
CREATE INDEX IF NOT EXISTS idx_feed_comment_reports_status ON feed_comment_reports (status, created_at DESC);

-- ── Web-push subscriptions (§4) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  CONSTRAINT uniq_push_endpoint UNIQUE (endpoint)
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions (user_id);

COMMENT ON TABLE push_subscriptions IS 'Web-push device subscriptions. Endpoint is unique: ON CONFLICT (endpoint) reassigns user_id on device user-switches. Dead rows (404/410 on send) are pruned inline by src/lib/push/webPush.ts.';

-- ── Engagement-notification concurrency backstop (review §3) ────────────────
-- At most ONE unread notification per (recipient, type, event). Without this,
-- two fresh reactions/comments on the same event that race before either
-- commits both INSERT (the UPDATE-first bump sees neither), and later bumps hit
-- both rows so it never self-heals. This partial unique index makes the losing
-- INSERT conflict → ON CONFLICT DO UPDATE bumps instead
-- (notificationDatabase.createOrBumpEventNotification). Every NON-engagement
-- notification has metadata->>'eventId' = NULL, and NULLs are distinct in a
-- unique index, so this never constrains welcome / follower / broadcast rows.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_unread_event_notification
  ON notifications (user_id, type, (metadata->>'eventId'))
  WHERE is_read = false;
