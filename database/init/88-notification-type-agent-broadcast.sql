-- database/init/88-notification-type-agent-broadcast.sql
-- Extend notification_type for agent broadcasts initiated by the feed API
-- (src/app/api/feed/route.ts:337).
--
-- Mirrors 30, 49, 61, 63, 65, 67, 69: ADD VALUE IF NOT EXISTS is idempotent
-- and MUST run outside a transaction.
--
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'agent_broadcast';
