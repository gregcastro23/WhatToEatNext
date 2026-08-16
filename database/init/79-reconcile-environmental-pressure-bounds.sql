-- Reconcile surface pressure check constraint with SpacetimeDB range.
--
-- Postgres migration 74 bounded surface_pressure_kpa to (45, 115) kPa.
-- 45 kPa rejected high-altitude settlements and extreme terrain (Mt. Everest summit is ~33.7 kPa,
-- high Andean passes / cabins sit below 45 kPa).
-- The defensible terrestrial atmospheric pressure window is 25.0 kPa (below Everest summit ~33.7 kPa)
-- to 110.0 kPa (above highest recorded low-elevation station pressure ~108.9 kPa).
--
-- NOTE: wrapped in a transaction by the migration runner.

ALTER TABLE environmental_observations
  DROP CONSTRAINT IF EXISTS environmental_observations_pressure_range;

ALTER TABLE environmental_observations
  ADD CONSTRAINT environmental_observations_pressure_range
  CHECK (surface_pressure_kpa >= 25.0 AND surface_pressure_kpa <= 110.0);
