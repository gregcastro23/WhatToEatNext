-- database/init/71-monica-per-construction.sql
-- §18o (SYNTHESIS_MODEL.md): the three agent kinds are DIFFERENT OBJECTS, not one
-- quantity at three scales.
--
--   planetary body   one planet at one degree        -> what is this body doing here
--   Moon phase       a Sun-Moon *relationship*       -> what is this angle doing
--   historical agent a whole natal chart             -> what is this chart doing
--
-- 70- added `monica_method` so a reader could TELL them apart. Measurement then
-- showed that is not enough: monica has no fixed scale across body counts
-- (§18m), so a discriminator documents the hazard but does not prevent a reader
-- ranking, averaging or thresholding across populations. Storing them in one
-- column makes that mistake easy and silent.
--
-- MEASURED evidence the populations differ in KIND, not units:
--   IQR/|median|  single-body 6.815   vs   full-chart 0.176
-- a 39x difference in SCALE-FREE spread, which no change of units can explain.
--
-- STAGE 1 of 3 (schema only). Additive and idempotent: new columns are nullable,
-- nothing is moved or dropped here, and no existing reader changes behaviour.
--   stage 2 = backfill/move the data (scripts/backfillMonicaPerConstruction.ts)
--   stage 3 = tighten the constraints, ONCE the data already satisfies them
-- Constraints are deliberately LAST: adding one before its data is clean simply
-- rolls the whole transaction back, which already happened once in this program.

-- Per-construction stores. Each holds the combined (mean-of-sects) value for the
-- construction its name states, and is NULL for every row of another kind.
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monica_single NUMERIC(12,6);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monica_two_body NUMERIC(12,6);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS monica_full_chart NUMERIC(12,6);

COMMENT ON COLUMN user_profiles.monica_single IS
  'Single-body monica (§18c): one planet, sect-resolved ESMS + mass-4 vessel. NULL for other kinds.';
COMMENT ON COLUMN user_profiles.monica_two_body IS
  'Two-body phase monica (§18i): Moon + a Sun derived from the phase angle. NULL for other kinds.';
COMMENT ON COLUMN user_profiles.monica_full_chart IS
  'Full-chart monica (§18n): the whole natal chart through the canonical engine. NULL for other kinds.';

-- `monica_constant` becomes SINGLE-BODY ONLY (§18o ruling). It is NOT dropped:
-- 4750 production rows and several readers depend on it, including cross-repo
-- ones, so it keeps working for the population it will continue to describe.
-- A reader wanting two-body or full-chart must now ask for it by name.
COMMENT ON COLUMN user_profiles.monica_constant IS
  'SINGLE-BODY monica only (§18o). Two-body and full-chart live in their own columns; '
  'they are different constructions on different scales and must never be compared.';
