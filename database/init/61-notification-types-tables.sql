-- database/init/61-notification-types-tables.sql
-- Extend notification_type enum for the Table entity (PR 2 of the Tables
-- program). Mirrors migration 30 (original enum extension) and 49
-- (transit_attunement): ADD VALUE IF NOT EXISTS is idempotent and must run
-- outside a transaction.
--
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_invite';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_rsvp';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_going_live';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_memory_posted';
