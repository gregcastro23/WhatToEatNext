-- Temporal migration: separate the birth WALL CLOCK from the birth INSTANT.
--
-- `birth_data->>'dateTime'` holds a wall-clock time labelled `Z`. It is produced
-- by `new Date(<datetime-local>).toISOString()`, so "born 14:24 in Brooklyn" is
-- stored as `1991-06-23T14:24:00.000Z` — a string that claims to be a UTC
-- instant and is not one. The true instant is 18:24Z. Every stored natal chart
-- was computed for the wrong sky by exactly the birthplace's UTC offset: four
-- hours of Moon motion (~2.2 deg) and of Ascendant motion (~60 deg, two whole signs).
--
-- The two quantities are NOT interchangeable and the engine needs both:
--
--   * the INSTANT drives the ephemeris — which sky was overhead;
--   * the WALL CLOCK drives sect — `isSectDiurnal` is a 06:00-18:00 window,
--     i.e. a local-clock predicate. MEASURED 2026-08-04: feeding it the true
--     instant instead flips day<->night on 6 of the 8 human rows, which per
--     `isSectDiurnalForBirth`'s own docs swings the profile from ~32/49/9/9 to
--     ~14/16/47/22 and rewrites the archetype. That flip would be manufactured
--     entirely by this migration, not discovered by it.
--
-- Storing only one and deriving the other is what got us here, so both are
-- persisted, alongside the zone and the BASIS on which that zone was decided.
--
-- ── MEASURED 2026-08-04 against production ─────────────────────────────────
--
--   users.profile->'birthData'   60 rows   |  user_profiles.birth_data   4 rows
--
-- Of the 60: 52 are agent placeholders stamped `1900-01-01T12:00:00.000Z`, a
-- sentinel rather than a birth, and are deliberately NOT migrated (their
-- true_utc_instant stays NULL). 8 are human. Of those 8:
--
--   * 2 carry `40.7498, -73.7976` bit-exact — the retired `ignite` route's
--     "Fallback NY" literal. Their birthplace was never geocoded, so no instant
--     can be derived from it. NOT migratable; flagged for re-onboarding.
--   * 2 carry the raw offset `UTC-5` on NY-metro pins, both born inside EDT,
--     where the true offset is -4. Taking the string literally is an hour wrong.
--   * 1 carries `America/New_York` on coordinates 2.82, -60.67 — Boa Vista,
--     Brazil. A valid IANA string on the wrong continent.
--
-- which is why the zone is RULED to come from coordinates, never from the
-- stored string. See `src/utils/astrology/birthTimezone.ts`.
--
-- Every column below is NULLable with no default, deliberately: NULL means
-- "no defensible instant for this row", which is a state 54 of the 60 rows are
-- genuinely in. A default would fabricate an instant for all of them at once.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS birth_local_wall_time TIMESTAMP WITHOUT TIME ZONE,
  ADD COLUMN IF NOT EXISTS birth_true_utc_instant TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS birth_timezone TEXT,
  ADD COLUMN IF NOT EXISTS birth_timezone_basis TEXT,
  ADD COLUMN IF NOT EXISTS birth_instant_migrated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN user_profiles.birth_local_wall_time IS
  'Wall-clock time at the birthplace. WITHOUT TIME ZONE deliberately: it is a clock reading, not an instant, and Postgres must not attach a zone to it. Drives sect (isSectDiurnal is a 06:00-18:00 local window). Equals the legacy birth_data->>''dateTime'' with its bogus Z stripped.';

COMMENT ON COLUMN user_profiles.birth_true_utc_instant IS
  'The absolute instant of birth = local_wall_time interpreted in birth_timezone. Drives the ephemeris query. NULL when no defensible instant exists (agent sentinel, fabricated pin, or unresolvable zone) — never fabricated.';

COMMENT ON COLUMN user_profiles.birth_timezone IS
  'IANA zone name, e.g. America/New_York. Never a raw UTC+-N offset: those cannot express daylight saving and are an hour wrong for any DST birth.';

COMMENT ON COLUMN user_profiles.birth_timezone_basis IS
  'How birth_timezone was decided: DERIVED_FROM_COORDINATES (normal), STORED_IANA_STRING (no usable pin), or ABSENT. Recorded so a zone can never be mistaken for a user statement when it was inferred.';

COMMENT ON COLUMN user_profiles.birth_instant_migrated_at IS
  'When backfillBirthInstant.ts wrote the three columns above. NULL = never migrated, which is distinct from migrated-and-found-unresolvable (that row has this set and true_utc_instant NULL).';

-- The basis is a closed set; anything else means a writer invented a value.
-- NOT VALID would let existing rows skip the check, but there are no existing
-- rows to grandfather (the columns are new), so it is validated immediately.
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_birth_timezone_basis_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_birth_timezone_basis_check
  CHECK (birth_timezone_basis IS NULL
         OR birth_timezone_basis IN ('DERIVED_FROM_COORDINATES', 'STORED_IANA_STRING', 'ABSENT'));

-- A true instant is meaningless without the zone that produced it: the pair is
-- what makes the wall clock recoverable. Reject half-written rows outright.
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_birth_instant_needs_zone_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_birth_instant_needs_zone_check
  CHECK (birth_true_utc_instant IS NULL
         OR (birth_timezone IS NOT NULL AND birth_local_wall_time IS NOT NULL));

-- Readers ask "which profiles still have no defensible birth instant?" — the
-- backfill's own progress query, and the degrade check on the chart path.
CREATE INDEX IF NOT EXISTS idx_user_profiles_birth_instant_missing
  ON user_profiles (user_id)
  WHERE birth_true_utc_instant IS NULL;
