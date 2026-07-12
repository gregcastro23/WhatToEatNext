-- database/init/68-tables-discovery.sql
-- Discovery layer for the Table entity (PR 6 of the Tables program,
-- docs/plans/pr6-discovery-mobile-plan.md §1).
--
-- Adds OPTIONAL venue coordinates + seat capacity and the two indexes that
-- back GET /api/discover/tables. Investigation confirmed neither `tables`
-- (60-tables-schema.sql) nor `restaurants` (27-restaurant-connect-schema.sql)
-- carries coordinates — best-match coords come from providers at query time —
-- so a migration is genuinely needed for near-me discovery.
--
-- PRIVACY INVARIANT (the plan is emphatic): a HOME table can NEVER be
-- geocoded. This CHECK is defense-in-depth; the app layer also refuses coords
-- when venue_type = 'home', and discovery responses never expose coordinates
-- or venue_address regardless.
--
-- Migration number 68 ASSIGNED (not discovered) per
-- docs/plans/tables-program-sequencing.md Reconciliation 2. Re-verified free
-- against origin/master immediately before this migration's first commit.
-- Runs inside a transaction (the runner's default): all statements here are
-- transactional-safe (no CONCURRENTLY) and the `tables` table is small.

ALTER TABLE tables ADD COLUMN IF NOT EXISTS venue_lat DOUBLE PRECISION;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS venue_lng DOUBLE PRECISION;
ALTER TABLE tables ADD COLUMN IF NOT EXISTS seat_cap SMALLINT
  CHECK (seat_cap IS NULL OR seat_cap BETWEEN 2 AND 24);

-- Home tables never carry coordinates. Constraints have no IF NOT EXISTS, so
-- guard the ADD with a catalog probe (house pattern, mirrors 60's trigger DO
-- blocks).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tables_home_no_coords'
  ) THEN
    ALTER TABLE tables ADD CONSTRAINT tables_home_no_coords
      CHECK (venue_type <> 'home' OR (venue_lat IS NULL AND venue_lng IS NULL));
  END IF;
END $$;

-- Discovery predicate index: the base list filters on visibility + status and
-- orders by scheduled_at. Partial (private tables never surface).
CREATE INDEX IF NOT EXISTS idx_tables_discover
  ON tables (visibility, status, scheduled_at) WHERE visibility IN ('public','commensals');

-- Near-me bounding-box prefilter. Partial (only geocoded, i.e. non-home,
-- tables ever match a geo query).
CREATE INDEX IF NOT EXISTS idx_tables_geo
  ON tables (venue_lat, venue_lng) WHERE venue_lat IS NOT NULL;
