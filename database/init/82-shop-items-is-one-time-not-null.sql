-- ============================================================================
-- Migration 82: Enforce NOT NULL on shop_items.is_one_time with TRUE backfill
-- ============================================================================
--
-- Backfill any existing NULL is_one_time rows to true (the intended table default)
-- and enforce NOT NULL to ensure one-time vs repeatable entitlement guards
-- operate safely across all query paths.

UPDATE shop_items
SET is_one_time = true
WHERE is_one_time IS NULL;

ALTER TABLE shop_items
  ALTER COLUMN is_one_time SET DEFAULT true,
  ALTER COLUMN is_one_time SET NOT NULL;
