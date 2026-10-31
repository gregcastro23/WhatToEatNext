-- database/init/96-cuisine-type-fusion.sql
-- Add 'Fusion' to cuisine_type so recipes.cuisine can hold a Fusion recipe.
-- Until now it could not: the authored Fusion recipes exist only in the bundled
-- static catalog, which the recipe list serves beside the live recipes as
-- static-only (see loadCanonicalCatalog). Adding the value stores nothing and
-- changes no reads; it only makes storing one possible.
--
-- IRREVERSIBLE: PostgreSQL cannot drop an enum value. Kept in its own file so it
-- can be left out without touching 95.
--
-- Mirrors 30, 49, 61, 63, 65, 67, 69, 88, 92: ADD VALUE IF NOT EXISTS is
-- idempotent and runs outside a transaction.
--
-- migrate:no-transaction

ALTER TYPE cuisine_type ADD VALUE IF NOT EXISTS 'Fusion';
