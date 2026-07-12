-- database/init/59-commensalships-unordered-pair.sql
-- Close the reciprocal-request race on commensalships.
--
-- The existing UNIQUE (requester_id, addressee_id) constraint is ORDERED, so
-- concurrent A->B and B->A requests could both insert, leaving two rows for
-- the same companion pair. Application code now auto-accepts a pending
-- reverse-direction request instead of inserting, and this index makes the
-- race impossible at the database level.
--
-- NOTE: plain CREATE UNIQUE INDEX (NOT CONCURRENTLY) — the migration runner
-- wraps each file in a transaction and CONCURRENTLY cannot run inside one.

-- Step 1: dedupe any reciprocal rows that already slipped in. For each
-- unordered pair keep exactly one row — prefer an accepted row over a
-- non-accepted one, then the oldest (created_at, id as final tie-break).
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY LEAST(requester_id, addressee_id),
                        GREATEST(requester_id, addressee_id)
           ORDER BY (status = 'accepted') DESC, created_at ASC, id ASC
         ) AS rn
    FROM commensalships
)
DELETE FROM commensalships
 WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Step 2: enforce uniqueness on the unordered pair.
CREATE UNIQUE INDEX IF NOT EXISTS idx_commensalships_pair
  ON commensalships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id));
