-- Migration 100: Omnibar Phase 7 — Zero-Result Search Gap Capture
-- Captures anonymous, PII-scrubbed, normalized zero-result search queries
-- (one row per distinct normalized query with hit counter and top filters)
-- so content authors can see unfulfilled recipe/ingredient/technique searches.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS search_zero_result_gaps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  normalized_query TEXT NOT NULL,
  sample_raw_query TEXT NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  top_filters JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved_at TIMESTAMPTZ,
  resolved_entity_slug TEXT,
  CONSTRAINT chk_search_zero_result_gaps_norm_len CHECK (char_length(normalized_query) BETWEEN 3 AND 64)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_search_zero_result_gaps_normalized_query
  ON search_zero_result_gaps (normalized_query);

CREATE INDEX IF NOT EXISTS idx_search_zero_result_gaps_unresolved_hits
  ON search_zero_result_gaps (hit_count DESC, last_seen_at DESC)
  WHERE resolved_at IS NULL;

