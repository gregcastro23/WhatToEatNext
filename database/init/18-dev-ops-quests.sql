-- ==========================================
-- DEV-OPS QUESTS + BUG REPORTS
-- Migration 18: "Help Us Build" quest definitions and bug_reports table
-- Created: April 2026 for gamified site development
-- ==========================================

-- ─── Bug Reports Table ───────────────────────────────────────────────
-- Backs the "Alchemist's Eye" quest. Every submitted report awards Spirit
-- tokens via questService.reportEvent('report_bug', ...).

CREATE TABLE IF NOT EXISTS bug_reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    page_url TEXT,
    user_agent TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'triaged', 'in_progress', 'resolved', 'wont_fix')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE bug_reports IS 'User-submitted bug reports from the "Alchemist''s Eye" quest. Each submission awards Spirit tokens.';

CREATE INDEX IF NOT EXISTS idx_bug_reports_user ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created ON bug_reports(created_at DESC);

-- ─── Dev-Ops Quest Definitions ───────────────────────────────────────
-- These quests reward users for helping us build and tune the site.

INSERT INTO quest_definitions (slug, title, description, quest_type, token_reward_type, token_reward_amount, trigger_event, trigger_threshold, sort_order)
VALUES
    (
        'achieve-alchemists-eye',
        'The Alchemist''s Eye',
        'Report a bug you''ve discovered — help us perfect the Sanctum. Reward: 15 Spirit.',
        'achievement',
        'Spirit',
        15,
        'report_bug',
        1,
        30
    ),
    (
        'weekly-recipe-harmonizer',
        'Recipe Harmonizer',
        'Rate 3 recipes you''ve tried so we can tune the alchemical weights. Reward: 20 Essence.',
        'weekly',
        'Essence',
        20,
        'rate_recipe',
        3,
        16
    ),
    (
        'achieve-temporal-anchor',
        'Temporal Anchor',
        'Complete 100% of your profile preferences to anchor your natal signal. Reward: 25 of each token.',
        'achievement',
        'all',
        25,
        'preferences_complete',
        1,
        31
    )
ON CONFLICT (slug) DO NOTHING;
