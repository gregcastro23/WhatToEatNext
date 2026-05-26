-- Migration: 45-agent-forge-schema.sql
-- Description: Ground-level schemas and optimized indexes for Agent Forge, bridging agent profiles and token economy.

-- Drop old cart_handoff_intents table to align completely with the new analytics schema requirements
DROP TABLE IF EXISTS cart_handoff_intents CASCADE;

-- 1. cart_handoff_intents: Analytics for the checkout pipeline.
CREATE TABLE cart_handoff_intents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recipe_id TEXT,
    total_asins INTEGER NOT NULL DEFAULT 0,
    alchemical_alignment VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'preflight',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. alchemical_constitutions: Links user_id to our existing stone_profile_id.
CREATE TABLE alchemical_constitutions (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    stone_profile_id UUID,
    spirit_balance INTEGER NOT NULL DEFAULT 0,
    essence_balance INTEGER NOT NULL DEFAULT 0,
    matter_balance INTEGER NOT NULL DEFAULT 0,
    substance_balance INTEGER NOT NULL DEFAULT 0,
    base_archetype VARCHAR(255),
    last_transit_sync TIMESTAMPTZ,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. celestial_pantries: Tracks active Amazon Fresh ASINs tied to tokens.
CREATE TABLE celestial_pantries (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asin VARCHAR(50) NOT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    associated_token VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'stocked',
    added_via_handoff_id UUID REFERENCES cart_handoff_intents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, asin)
);

-- 4. High-performance indexes for Agent Forge queries
CREATE INDEX IF NOT EXISTS idx_pantry_user_status ON celestial_pantries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_handoff_user_date ON cart_handoff_intents(user_id, created_at);

-- 5. Keep updated_at timestamps in sync dynamically
DROP TRIGGER IF EXISTS update_alchemical_constitutions_updated_at ON alchemical_constitutions;
CREATE TRIGGER update_alchemical_constitutions_updated_at 
    BEFORE UPDATE ON alchemical_constitutions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_celestial_pantries_updated_at ON celestial_pantries;
CREATE TRIGGER update_celestial_pantries_updated_at 
    BEFORE UPDATE ON celestial_pantries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
