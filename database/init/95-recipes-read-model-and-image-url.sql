-- database/init/95-recipes-read-model-and-image-url.sql
-- recipes.read_model (ADR-005) and recipes.image_url exist in production but were
-- added by hand, so a database built from these migrations lacks both. The live
-- catalog query (LocalRecipeService RECIPE_QUERY) selects them, fails on such a
-- database, and silently serves the bundled static recipes instead.
--
-- Idempotent, and lock-free wherever the columns exist: the catalog is checked
-- first, so production, which has them, never takes a lock on `recipes` (an
-- ALTER ... IF NOT EXISTS would, queueing behind any long transaction and
-- blocking every catalog read behind itself; the runner sets no lock_timeout).
-- A fresh database adds them; lock_timeout turns a blocked ALTER into a failed
-- deploy rather than a stalled table.

SET LOCAL lock_timeout = '10s';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'recipes'::regclass AND attname = 'read_model' AND NOT attisdropped
  ) THEN
    ALTER TABLE recipes ADD COLUMN read_model JSONB;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'recipes'::regclass AND attname = 'image_url' AND NOT attisdropped
  ) THEN
    ALTER TABLE recipes ADD COLUMN image_url TEXT;
  END IF;
END
$$;
