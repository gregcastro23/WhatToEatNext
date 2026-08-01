-- database/init/57-recipe-nft-content-envelope.sql
-- The exact content envelope the on-chain contentHash commits to, persisted at
-- mint time. The content route serves THIS verbatim for minted recipes.
--
-- Why: the envelope embeds the alchemical fingerprint, which depends on the
-- live ingredient catalog. Recomputing it at serve time meant any catalog edit
-- changed the served bytes out from under the hash in the URL — while the
-- route's Cache-Control said `immutable`. An on-chain commitment must resolve
-- to stored bytes, not to a function of mutable inputs.
--
-- Nullable: rows minted before this migration (none exist — the table is 0
-- rows at migration time) and the featured pre-mint recipe recompute instead.

ALTER TABLE recipe_nft_mints
    ADD COLUMN IF NOT EXISTS content_json JSONB;

COMMENT ON COLUMN recipe_nft_mints.content_json IS
    'The exact content envelope contentHash commits to (schema v2+). Served verbatim by /api/recipes/nft/content/{hash}; never recomputed from the live catalog.';
