-- Admit a fourth zone basis: ATTESTED_REGION_DEFAULT_PIN.
--
-- Migration 76 refused two rows outright. Both carry `40.7498, -73.7976`
-- bit-exact — the retired `ignite` route's "Fallback NY" literal — so their
-- coordinates were a fabrication and no birth instant could be derived from
-- them. That was the right call on the evidence available at the time.
--
-- The operator has since confirmed that both users were in fact born in New
-- York. That changes what is known, but it does NOT promote the pin to a
-- measurement, and the two halves must not be conflated:
--
--   ZONE      — now defensible. Every pin in the New York metro resolves to
--               America/New_York, so the birth INSTANT follows correctly and
--               is no better or worse than any other NYC-born row.
--
--   POSITION  — still a city-level default, NOT the user's birthplace. NYC
--               spans ~0.55 deg of longitude, i.e. ~2.2 minutes of sidereal
--               time, i.e. up to ~0.55 deg of Ascendant. That is invisible
--               except within about half a degree of a sign cusp, where it can
--               move the rising sign outright.
--
-- Hence a distinct basis rather than reusing DERIVED_FROM_COORDINATES. A reader
-- must always be able to tell "we know where they were born" from "we know
-- which region they were born in, and defaulted the rest". Collapsing the two
-- would relabel a default as a measurement, which is the exact failure that
-- produced these rows in the first place.

ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_birth_timezone_basis_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_birth_timezone_basis_check
  CHECK (birth_timezone_basis IS NULL
         OR birth_timezone_basis IN ('DERIVED_FROM_COORDINATES',
                                     'STORED_IANA_STRING',
                                     'ATTESTED_REGION_DEFAULT_PIN',
                                     'ABSENT'));

COMMENT ON COLUMN user_profiles.birth_timezone_basis IS
  'How birth_timezone was decided: DERIVED_FROM_COORDINATES (normal — a real geocoded pin), ATTESTED_REGION_DEFAULT_PIN (region confirmed by the operator, coordinates are a city-level default — the instant is sound, the Ascendant is approximate), STORED_IANA_STRING (no usable pin), or ABSENT. Recorded so an inferred zone can never be mistaken for a user statement.';
