-- Extend notification_type enum for automatic transit "Sky Drop" airdrops.
-- Migration 49: adds 'transit_attunement' so /api/economy/sync-credit can emit
-- a bell notification when a degree-exact transit airdrops ESMS to a user.
--
-- Note: token_transactions.source_type and feed_events.event_type are both
-- unconstrained VARCHAR, so no enum change is needed there — only the
-- notifications.type ENUM (created in migration 13, extended in 30) needs this
-- new value. ADD VALUE IF NOT EXISTS is idempotent and must run outside a
-- transaction (mirrors migration 30).

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'transit_attunement';
