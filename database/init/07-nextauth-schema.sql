-- database/init/07-nextauth-schema.sql
-- NextAuth (Auth.js v5) Database Schema Migration
-- Designed for raw Postgres

-- 1. Scrub Legacy Privy Fields
ALTER TABLE users DROP COLUMN IF EXISTS privy_id;

-- 2. Setup Custom User Fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS "onboardingComplete" BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "birthDate" DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "birthTime" TIME;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "birthLocation" VARCHAR(255);

-- The 06 script might not have run on this DB. Let's ensure the user_role ENUM exists and has USER/ADMIN.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('ALCHEMIST', 'GRAND_MASTER', 'USER', 'ADMIN');
    ELSE
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'USER') THEN
            ALTER TYPE user_role ADD VALUE 'USER';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'ADMIN') THEN
            ALTER TYPE user_role ADD VALUE 'ADMIN';
        END IF;
    END IF;
END
$$;

-- Add the new 'role' column to the 'users' table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'USER';

-- Change the default role to 'USER'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

-- Migrate existing array 'roles' to the new 'role' ENUM (naive migration: just take the first role or default to USER)
-- Depending on whether the array contains 'admin', we can convert that to 'ADMIN'. Otherwise 'USER'.
UPDATE users SET role = CASE WHEN 'admin' = ANY(roles) THEN 'ADMIN'::user_role ELSE 'USER'::user_role END WHERE role IS NULL;

-- Drop the old 'roles' column
ALTER TABLE users DROP COLUMN IF EXISTS roles;

-- NextAuth relies on specific field names. If the user object has existing ones,
-- we map them or add them.
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
-- NextAuth uses `emailVerified` (camelCase) by default in its Postgres adapter, usually as timestamp.
-- We already have `email_verified` BOOLEAN. NextAuth adapter might expect `emailVerified` as TIMESTAMPTZ.
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP WITH TIME ZONE;


-- 3. NextAuth Postgres Models

-- Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, "providerAccountId")
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "sessionToken" VARCHAR(255) UNIQUE NOT NULL,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Verification Tokens
CREATE TABLE IF NOT EXISTS verification_token (
  identifier VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Indexes for NextAuth
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions("sessionToken");
