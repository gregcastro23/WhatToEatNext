-- database/init/69-notification-type-table-join-request.sql
-- Extend notification_type for the discovery "ask to join" flow (PR 6 of the
-- Tables program). A discoverer of a public table can request an invite; the
-- host receives a `table_join_request` notification with an Invite action.
--
-- Mirrors 49 (transit_attunement) and 61 (table_* types): ADD VALUE IF NOT
-- EXISTS is idempotent and MUST run outside a transaction.
--
-- Migration number 69 ASSIGNED per docs/plans/tables-program-sequencing.md
-- Reconciliation 2. Re-verified free against origin/master immediately before
-- this migration's first commit.
--
-- migrate:no-transaction

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'table_join_request';
