-- database/init/12-fix-schema-health.sql
-- Schema Health & Compatibility Migration
-- Fixes accumulated inconsistencies from migrations 01–11 and dependabot upgrades.
-- Designed to be idempotent: safe to run on both fresh and existing databases.

-- ==========================================
-- 1. ENUM NORMALIZATION
-- Ensure user_role ENUM contains the exact values the application uses.
-- Migration 01 created lowercase values; migration 07 added uppercase ones.
-- The application code inserts 'ADMIN' and 'USER' (uppercase) via ::user_role cast.
-- ==========================================
DO $$
BEGIN
    -- Add canonical uppercase values if they don't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'USER'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'USER';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'ADMIN'
    ) THEN
        ALTER TYPE user_role ADD VALUE 'ADMIN';
    END IF;
END
$$;

-- ==========================================
-- 2. users TABLE — ensure role column exists with correct default
-- ==========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'USER';

-- Update any NULL roles to USER default
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- Backfill from legacy array column if it still exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'roles'
    ) THEN
        UPDATE users
        SET role = CASE
            WHEN 'admin' = ANY(roles) OR 'ADMIN' = ANY(roles::text[]) THEN 'ADMIN'::user_role
            ELSE 'USER'::user_role
        END
        WHERE role IS NULL OR role = 'USER'::user_role;

        -- Drop legacy array column
        ALTER TABLE users DROP COLUMN IF EXISTS roles;
    END IF;
END
$$;

-- ==========================================
-- 3. REBUILD active_users VIEW
-- The original view in 01-schema.sql referenced the dropped 'roles' column.
-- Rebuild it to use the current 'role' column.
-- ==========================================
DROP VIEW IF EXISTS active_users;

CREATE VIEW active_users AS
SELECT
    id,
    email,
    name,
    role,
    created_at,
    last_login_at,
    login_count
FROM users
WHERE is_active = true;

-- ==========================================
-- 4. user_profiles — ensure all columns exist
-- Migration 02 creates this table; this ensures columns added later are present.
-- ==========================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    name        VARCHAR(255),
    birth_data  JSONB DEFAULT '{}',
    natal_chart JSONB DEFAULT '{}',
    dietary_preferences JSONB DEFAULT '{}',
    group_members       JSONB DEFAULT '[]',
    dining_groups       JSONB DEFAULT '[]',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add onboarding columns if missing (for DBs that ran migration 02 before those columns were defined)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Ensure updated_at trigger exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger
        WHERE tgname = 'update_user_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Index for user_id lookups (critical path)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ==========================================
-- 5. user_subscriptions — ensure table & columns exist
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        CREATE TYPE subscription_tier AS ENUM ('free', 'premium');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
            'active', 'past_due', 'canceled', 'trialing', 'incomplete', 'unpaid'
        );
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier                    subscription_tier NOT NULL DEFAULT 'free',
    status                  subscription_status NOT NULL DEFAULT 'active',
    stripe_customer_id      VARCHAR(255),
    stripe_subscription_id  VARCHAR(255) UNIQUE,
    current_period_start    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    current_period_end      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
    cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS usage_records (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature      VARCHAR(100) NOT NULL,
    count        INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end   TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_feature_period UNIQUE (user_id, feature, period_start)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_user_feature ON usage_records(user_id, feature);
CREATE INDEX IF NOT EXISTS idx_usage_period ON usage_records(period_start, period_end);

-- ==========================================
-- 6. EXISTING USERS — auto-provision subscriptions for admin/premium accounts
-- Backfills any users who signed in before the subscription system was deployed.
-- ==========================================
INSERT INTO user_subscriptions (user_id, tier, status, current_period_end)
SELECT
    u.id,
    CASE WHEN u.role IN ('ADMIN', 'admin') THEN 'premium'::subscription_tier ELSE 'free'::subscription_tier END,
    'active',
    NOW() + INTERVAL '10 years'
FROM users u
WHERE u.is_active = true
  AND NOT EXISTS (
      SELECT 1 FROM user_subscriptions s WHERE s.user_id = u.id
  )
ON CONFLICT (user_id) DO NOTHING;

-- Upgrade admin users who somehow got free tier
UPDATE user_subscriptions
SET
    tier = 'premium',
    status = 'active',
    current_period_end = NOW() + INTERVAL '10 years',
    updated_at = NOW()
FROM users u
WHERE user_subscriptions.user_id = u.id
  AND u.role IN ('ADMIN', 'admin')
  AND user_subscriptions.tier != 'premium';

-- ==========================================
-- 7. users TABLE — ensure NextAuth columns exist
-- ==========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- ==========================================
-- 8. NextAuth tables — ensure they exist
-- ==========================================
CREATE TABLE IF NOT EXISTS accounts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId"          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type              VARCHAR(255) NOT NULL,
    provider          VARCHAR(255) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    refresh_token     TEXT,
    access_token      TEXT,
    expires_at        BIGINT,
    token_type        VARCHAR(255),
    scope             VARCHAR(255),
    id_token          TEXT,
    session_state     VARCHAR(255),
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
    "userId"       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires        TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_token (
    identifier VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires    TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (identifier, token)
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id  ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id  ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token    ON sessions("sessionToken");
