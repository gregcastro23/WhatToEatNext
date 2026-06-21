-- database/init/55-recipe-nft-mint-schema.sql
-- Recipe-NFT minting: a repeatable shop item that charges the recipe's own
-- ESMS fingerprint (passed as overrideCosts at mint time), plus a ledger of
-- minted recipes that bridges the off-chain debit to the on-chain token.
--
-- The shop item's base costs are 0 because every mint overrides them with the
-- recipe's live quantity-weighted ESMS cost (see src/lib/recipe-nft/cost.ts).
-- It is NOT one-time — a user can mint many recipes.

INSERT INTO shop_items (slug, title, description, category, cost_spirit, cost_essence, cost_matter, cost_substance, is_one_time, is_active, sort_order)
VALUES (
    'recipe-nft-mint',
    'Mint Recipe NFT',
    'Mint a recipe as an on-chain NFT. Cost is the recipe''s own quantity-weighted ESMS fingerprint, priced live by the sky and your chart.',
    'feature',
    0, 0, 0, 0,
    false, true, 60
)
ON CONFLICT (slug) DO NOTHING;

-- Ledger of mint intents/results. content_hash is UNIQUE so the same recipe
-- content can never be minted twice (mirrors the on-chain ContentAlreadyRegistered).
CREATE TABLE IF NOT EXISTS recipe_nft_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id TEXT NOT NULL,
    title TEXT NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'generated', -- generated | scan | seeded | curated

    -- on-chain commitments (computed server-side from the validated recipe)
    content_hash TEXT NOT NULL UNIQUE,
    computation_hash TEXT NOT NULL,
    ingredient_catalog_root TEXT NOT NULL,
    engine_version INTEGER NOT NULL,
    aggregation_mode VARCHAR(40) NOT NULL,
    a_sharp DECIMAL(12, 4) NOT NULL,

    -- economics: the four-coin cost actually debited (post live + chart pricing)
    cost JSONB NOT NULL,
    transaction_group_id UUID, -- the off-chain debit receipt from purchaseShopItem

    -- lifecycle: debited off-chain -> (when enabled) minted on-chain
    status VARCHAR(20) NOT NULL DEFAULT 'pending_chain', -- pending_chain | minting | minted | failed
    chain VARCHAR(20),
    token_id TEXT,
    tx_hash TEXT,
    metadata_uri TEXT,
    -- the validated recipe payload + hero image, so the ERC-721 metadata/content
    -- routes can rebuild the token's JSON for any minted recipe (not just featured).
    recipe_json JSONB,
    image_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    minted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_recipe_nft_mints_user ON recipe_nft_mints(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipe_nft_mints_status ON recipe_nft_mints(status);
