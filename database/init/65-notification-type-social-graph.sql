-- Extend notification_type enum for the social graph (PR 4).
-- Migration 65: adds 'new_follower' so POST /api/follows can emit a bell
-- notification (30-day per-pair dedup lives in the route, not here).
--
-- Only one value by design: follower milestones are ambient/economy territory
-- (no bell spam) and follow-back suggestions are PR 6 discovery.
-- ADD VALUE IF NOT EXISTS is idempotent and must run outside a transaction
-- (mirrors migrations 30/49).
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_follower';
