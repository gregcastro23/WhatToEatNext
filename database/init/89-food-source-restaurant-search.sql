-- Migration 89: food diary sources the app logs but the enum rejected.
--
-- [MEASURED 2026-09-28, prod, read-only] food_source held quick, recipe,
-- manual, barcode, favorite and custom. An entry from restaurant discovery
-- ('restaurant') or a food search ('search') failed its insert with
-- "invalid input value for enum food_source". The app's list is
-- src/types/foodSource.ts; scripts/checkFoodDiaryPersistenceSql.mjs checks it
-- against this enum.
--
-- ADD VALUE IF NOT EXISTS is transaction-legal on PG12+ (see migrations 30, 49).

ALTER TYPE food_source ADD VALUE IF NOT EXISTS 'restaurant';
ALTER TYPE food_source ADD VALUE IF NOT EXISTS 'search';
