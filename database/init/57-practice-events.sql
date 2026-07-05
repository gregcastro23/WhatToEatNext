-- ==========================================
-- INVISIBLE PRACTICE REWARDS
-- Migration 57: the ledger of "practices" — natural product actions (cooking a
-- recipe, acting on a recommendation, visiting the feed, discovering a surface)
-- that earn small ESMS rewards invisibly. No quest UI reads this; it exists for
-- dedupe, the delight toast, personalization signal, and the (PR2) celestial
-- budget + composite dashboard.
-- Created: July 2026
-- ==========================================

CREATE TABLE IF NOT EXISTS practice_events (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practice_type VARCHAR(40) NOT NULL,      -- cooked_recipe | recommendation_acted | ...
    -- Dedupe scope key: '<target>:<YYYY-MM-DD>' for daily practices,
    -- '<target>' for once-ever practices. The unique constraint IS the dedupe.
    dedupe_key VARCHAR(255) NOT NULL,
    target_id VARCHAR(255),                  -- recipe id, surface key, feed event id…
    token_type VARCHAR(20) NOT NULL CHECK (token_type IN ('Spirit', 'Essence', 'Matter', 'Substance')),
    -- amount 0 = the act was recorded (signal still counts) but the day's cap
    -- was already reached, so no credit was issued.
    amount DECIMAL(12, 4) NOT NULL DEFAULT 0,
    hint TEXT,                               -- the causal line shown in the delight toast
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uniq_practice_dedupe UNIQUE (user_id, practice_type, dedupe_key)
);

COMMENT ON TABLE practice_events IS 'Invisible-reward ledger: one row per recognized natural action. Rewards credit token_transactions with source_type=practice_reward; amount 0 rows are capped-but-recorded signal.';

CREATE INDEX IF NOT EXISTS idx_practice_events_user_day
    ON practice_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_events_type_day
    ON practice_events (practice_type, created_at DESC);
