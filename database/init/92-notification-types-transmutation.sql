-- database/init/92-notification-types-transmutation.sql
-- Extend notification_type for the Transmutation Circle (migration 91):
--   transmutation_offer    — someone directed a trade offer at you
--   transmutation_accepted — someone filled the offer you posted
--
-- Mirrors 30, 49, 61, 63, 65, 67, 69, 88: ADD VALUE IF NOT EXISTS is idempotent
-- and MUST run outside a transaction.
--
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'transmutation_offer';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'transmutation_accepted';
