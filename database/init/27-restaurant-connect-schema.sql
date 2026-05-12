-- Restaurant partner records for Stripe Connect onboarding.

CREATE TABLE IF NOT EXISTS restaurants (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  external_provider TEXT,
  external_id TEXT,
  menu_url TEXT,
  stripe_connect_account_id TEXT UNIQUE,
  stripe_account_controller JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarding_status TEXT NOT NULL DEFAULT 'pending',
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  details_submitted BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_owner_user_id
  ON restaurants (owner_user_id)
  WHERE owner_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_external_provider_id
  ON restaurants (external_provider, external_id)
  WHERE external_provider IS NOT NULL AND external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_restaurants_onboarding_status
  ON restaurants (onboarding_status);
