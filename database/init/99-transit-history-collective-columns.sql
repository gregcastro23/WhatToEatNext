-- database/init/99-transit-history-collective-columns.sql
-- transit_history.is_collective and transit_history.participant_count: the two columns that
-- POST /api/rituals/generate-cooking-instruction (backend/alchm_kitchen/main.py) names in the INSERT it
-- makes for every ritual it logs. They were only ever added by hand (backend/scripts/phase7_migration.py,
-- backend/scripts/add_collective_columns.py), never by a migration the deploy-time runner applies, so a
-- database built from database/init lacks them and the INSERT fails with "column ... does not exist".
--
-- Idempotent, and lock-free wherever the columns exist (the pattern of 95): the catalog is checked first,
-- so a database that already has them from either script never takes a lock on transit_history. Those
-- scripts differ (one leaves the columns nullable, the other NOT NULL); an existing column is left as it is.
-- A database that lacks them gets constant defaults, which PostgreSQL adds without rewriting the table.
-- Every row already in such a database was logged before a collective ritual could be recorded, which is
-- what DEFAULT FALSE and DEFAULT 1 (a ritual for one) say. lock_timeout turns a blocked ALTER into a failed
-- deploy rather than a stalled table.

SET LOCAL lock_timeout = '10s';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'transit_history'::regclass AND attname = 'is_collective' AND NOT attisdropped
  ) THEN
    ALTER TABLE transit_history ADD COLUMN is_collective BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_attribute
     WHERE attrelid = 'transit_history'::regclass AND attname = 'participant_count' AND NOT attisdropped
  ) THEN
    ALTER TABLE transit_history ADD COLUMN participant_count INTEGER NOT NULL DEFAULT 1;
  END IF;
END
$$;
