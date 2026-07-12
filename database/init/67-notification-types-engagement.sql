-- Extend notification_type enum for feed engagement (PR 5).
-- Migration 67: adds 'reaction_received' + 'comment_received' so the react and
-- comment routes can emit a deduped bell notification (one unread row per
-- recipient+event+type — see notificationDatabase.createOrBumpEventNotification).
--
-- Only two values by design: flat threads have no reply target, so no
-- 'comment_reply' (add it in the PR that adds threading). ADD VALUE IF NOT
-- EXISTS is idempotent and must run outside a transaction (mirrors 30/49/65).
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'reaction_received';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'comment_received';
