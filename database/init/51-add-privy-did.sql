-- database/init/51-add-privy-did.sql
-- Add privy_did column to users table for cross-site unification

ALTER TABLE users ADD COLUMN IF NOT EXISTS privy_did VARCHAR(255) UNIQUE;
