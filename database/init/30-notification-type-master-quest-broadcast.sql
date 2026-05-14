-- Extend notification_type enum to support quest reward broadcasts.
-- Migration 30: adds master_quest_broadcast (and backfills quest_completed
-- if it was never persisted from earlier code-side additions).

ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'quest_completed';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'master_quest_broadcast';
