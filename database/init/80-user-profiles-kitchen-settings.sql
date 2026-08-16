-- Durable kitchen settings & physical environmental parameters.
--
-- SpacetimeDB rows (environmental_observation) are ephemeral by contract.
-- When a cooking session resolves and physical parameters must persist
-- (saved kitchen elevation, station pressure, adjusted recipe core times),
-- they are flushed durably to PostgreSQL in user_profiles.
--
-- NOTE: wrapped in a transaction by the migration runner.

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS kitchen_elevation_m NUMERIC(7,2),
  ADD COLUMN IF NOT EXISTS kitchen_elevation_basis VARCHAR(16),
  ADD COLUMN IF NOT EXISTS kitchen_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_kitchen_elevation_basis_check'
  ) THEN
    ALTER TABLE user_profiles
      ADD CONSTRAINT user_profiles_kitchen_elevation_basis_check
      CHECK (kitchen_elevation_basis IS NULL OR kitchen_elevation_basis IN ('MEASURED', 'DERIVED', 'COMPUTED', 'ABSENT'));
  END IF;
END $$;
