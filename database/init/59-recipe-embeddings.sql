-- ==========================================
-- RECIPE EMBEDDINGS
-- Migration 59: pgvector foundation + semantic search over recipe descriptions.
-- description_embedding holds an OpenAI text-embedding-3-small vector (1536
-- dims) of recipes.description, backfilled by scripts/backfill-recipe-embeddings.ts.
-- HNSW over ivfflat: no `lists` tuning needed and the recipe table (~1k rows)
-- builds it instantly either way.
-- Created: July 2026
-- ==========================================

CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description_embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_recipes_description_embedding
    ON recipes USING hnsw (description_embedding vector_cosine_ops);

COMMENT ON COLUMN recipes.description_embedding IS 'text-embedding-3-small vector of description, NULL until backfilled; queried via <=> cosine distance for semantic recipe search.';
