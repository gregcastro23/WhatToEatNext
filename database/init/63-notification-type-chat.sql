-- database/init/63-notification-type-chat.sql
-- Extend notification_type enum for messaging (PR 3 of the Tables program).
-- Mirrors migrations 30/49/61: ADD VALUE IF NOT EXISTS is idempotent and must
-- run outside a transaction.
--
-- Note: table chat deliberately has NO notification type — its badge is the
-- /api/chat/unread aggregate, not notification rows. `table_chat_mention`
-- lands here so the enum is ready, but its emitter is deferred until unique
-- handles exist (plan §6).
--
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'dm_message';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'circle_message';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_chat_mention';
