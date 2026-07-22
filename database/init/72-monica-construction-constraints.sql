-- database/init/72-monica-construction-constraints.sql
-- §18o STAGE 3 of 3 — make the per-construction split enforceable at the DB
-- boundary, not just documented.
--
-- §18m measured that monica has no fixed scale across body counts, so comparing
-- or averaging two constructions is a category error. `monica_method` (70-) lets
-- a reader TELL them apart; the split columns (71-) give each its own home. What
-- neither provides is a guarantee that a WRITER cannot put them back in the same
-- place. These constraints do.
--
-- ⚠️ Deliberately LAST, and applied only after the data already satisfies them.
-- A constraint added before its data is clean simply rolls the whole transaction
-- back — that happened once in this program (`monica_method_known` rejecting a
-- 'two-body-phase' value and aborting a 469-row migration). Verified 0 violations
-- on all five checks below against live production before this was written.
--
-- ⚠️ `user_profiles` holds HUMANS as well as agents. Every constraint here is
-- satisfied by an all-NULL row, so the 13 human rows (none of which carries a
-- monica) are unaffected.

-- 1. At most ONE construction per row. Two populated columns would mean a row
--    claiming to be two different kinds of object at once.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'monica_one_construction') THEN
    ALTER TABLE user_profiles ADD CONSTRAINT monica_one_construction
      CHECK (
        (monica_single    IS NOT NULL)::int
      + (monica_two_body  IS NOT NULL)::int
      + (monica_full_chart IS NOT NULL)::int <= 1
      );
  END IF;
END $$;

-- 2. `monica_method` must agree with WHICH column is populated. Without this the
--    discriminator can drift from the data it discriminates — and a mis-stamped
--    method is worse than none, because readers trust it.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'monica_method_matches_column') THEN
    ALTER TABLE user_profiles ADD CONSTRAINT monica_method_matches_column
      CHECK (
           (monica_method IS NULL
            AND monica_single     IS NULL
            AND monica_two_body   IS NULL
            AND monica_full_chart IS NULL)
        OR (monica_method = 'single-body' AND monica_single     IS NOT NULL)
        OR (monica_method = 'two-body'    AND monica_two_body   IS NOT NULL)
        OR (monica_method = 'full-chart'  AND monica_full_chart IS NOT NULL)
      );
  END IF;
END $$;

-- 3. `monica_constant` is SINGLE-BODY ONLY (§18o). This is the constraint that
--    actually enforces the ruling: it makes it impossible for a two-body or
--    full-chart value to be written back into the shared column, which is how
--    the incomparable-scales problem would silently return.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'monica_constant_single_body_only') THEN
    ALTER TABLE user_profiles ADD CONSTRAINT monica_constant_single_body_only
      CHECK (monica_constant IS NULL OR monica_method = 'single-body');
  END IF;
END $$;

-- 4. A construction value implies BOTH sects are stored. Every construction
--    computes a diurnal and a nocturnal value; a row with one and not the other
--    means a writer took a shortcut, and the pair is what makes `combined`
--    recomputable rather than a bare number.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'monica_both_sects_present') THEN
    ALTER TABLE user_profiles ADD CONSTRAINT monica_both_sects_present
      CHECK (
        (monica_single IS NULL AND monica_two_body IS NULL AND monica_full_chart IS NULL)
        OR (monica_diurnal IS NOT NULL AND monica_nocturnal IS NOT NULL)
      );
  END IF;
END $$;

-- NOT ENFORCED HERE, deliberately: "monica_constant == monica_single for
-- single-body rows". It holds today (0 violations) but it is a redundancy, not
-- an invariant — `monica_constant` exists for backward compatibility and is
-- expected to be retired once every reader has moved to the typed columns.
-- Pinning it in the schema would make that retirement harder for no safety gain;
-- `scripts/checkAgentMonicaDrift.ts` verifies it instead.
