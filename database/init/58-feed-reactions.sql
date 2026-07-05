-- ==========================================
-- FEED REACTIONS
-- Migration 58: reactions on community feed events (cooked-it dish cards).
-- One reaction per (event, user); the reaction row is the dedupe anchor for
-- both invisible rewards — the reactor's feed_reaction and the poster's
-- work_resonated practice.
-- Created: July 2026
-- ==========================================

CREATE TABLE IF NOT EXISTS feed_reactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES feed_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind VARCHAR(20) NOT NULL DEFAULT 'spark',    -- spark | fire | water | earth | air
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uniq_feed_reaction UNIQUE (event_id, user_id)
);

COMMENT ON TABLE feed_reactions IS 'One reaction per user per feed event. Insert is the reward anchor: reactor earns feed_reaction, poster earns work_resonated (both practice-ledger deduped).';

CREATE INDEX IF NOT EXISTS idx_feed_reactions_event
    ON feed_reactions (event_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_user
    ON feed_reactions (user_id, created_at DESC);
