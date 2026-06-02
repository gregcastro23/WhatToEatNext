-- database/init/53-add-wallet-address.sql
-- Privy embedded wallet address (EVM / Base) on the users table.
-- Provisioned when a user connects Privy with embedded wallets enabled; funded
-- via Privy's fiat on-ramp. Non-unique, nullable. Idempotent. Mirrors the PA
-- (planetary_agents) 20260602130000_add_wallet_address migration so the shared
-- Privy app resolves to the same wallet address on both sites.

ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT;
