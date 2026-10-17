-- database/init/94-agent-publications-and-recipe-reflections.sql
-- Idempotent agent publications and append-only recipe reflections.
--
-- Supports Planetary Agents (PA) publication receipts, independent idempotency,
-- and append-only recipe reflections without corrupting latest human cooking
-- records in user_recipe_interactions.

CREATE TABLE IF NOT EXISTS agent_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    principal_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    delivery_key TEXT NOT NULL,
    payload_fingerprint TEXT NOT NULL,
    actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('in_flight', 'completed', 'failed')),
    feed_event_id UUID REFERENCES feed_events(id) ON DELETE SET NULL,
    recipe_reflection_id UUID,
    menu_id UUID,
    feed_published BOOLEAN NOT NULL DEFAULT false,
    recipe_comment_status TEXT NOT NULL DEFAULT 'not_requested',
    legacy_interaction_status TEXT NOT NULL DEFAULT 'not_requested',
    receipt_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT,
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uniq_agent_publication_key UNIQUE (principal_id, operation, delivery_key)
);

CREATE INDEX IF NOT EXISTS idx_agent_publications_actor
    ON agent_publications (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_publications_delivery
    ON agent_publications (delivery_key);

CREATE TABLE IF NOT EXISTS recipe_reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    publication_id UUID REFERENCES agent_publications(id) ON DELETE SET NULL,
    feed_event_id UUID REFERENCES feed_events(id) ON DELETE SET NULL,
    delivery_key TEXT,
    source TEXT NOT NULL,
    content_state TEXT NOT NULL DEFAULT 'proposed' CHECK (content_state IN ('proposed', 'verified', 'rejected')),
    review TEXT NOT NULL CHECK (char_length(review) BETWEEN 1 AND 4000),
    score NUMERIC(3, 1),
    is_agent BOOLEAN NOT NULL DEFAULT false,
    instruction_review_required BOOLEAN NOT NULL DEFAULT true,
    provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    hidden BOOLEAN NOT NULL DEFAULT false
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_recipe_reflections_publication
    ON recipe_reflections (publication_id)
    WHERE publication_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_recipe_reflections_recipe_created
    ON recipe_reflections (recipe_id, created_at DESC, id DESC)
    WHERE deleted_at IS NULL AND NOT hidden;

CREATE INDEX IF NOT EXISTS idx_recipe_reflections_author
    ON recipe_reflections (author_id, created_at DESC);

COMMENT ON TABLE agent_publications IS 'Durable publication ledger scoped to principal, operation, and caller delivery key';
COMMENT ON TABLE recipe_reflections IS 'Append-only recipe reflections, alterations, and critiques with proposal provenance';
