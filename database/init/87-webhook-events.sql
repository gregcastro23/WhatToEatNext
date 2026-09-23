-- database/init/87-webhook-events.sql
-- The inbound webhook event record: one row per provider event, keyed by the
-- provider's own event id, so a redelivery is recognised instead of re-run.
--
-- Identity and payload are written once and never change (enforced by the
-- trigger below). Only the processing lifecycle columns move:
--   processing → processed | ignored | failed ;  failed → processing (retry)
--
-- A 'processing' row whose lock is older than the stale window may be
-- re-claimed by a redelivery (the worker that held it died mid-flight).

CREATE TABLE IF NOT EXISTS webhook_events (
    id BIGSERIAL PRIMARY KEY,
    source TEXT NOT NULL CHECK (source ~ '^[a-z][a-z0-9-]{1,31}$'),
    event_id TEXT NOT NULL CHECK (length(event_id) BETWEEN 1 AND 255),
    event_type TEXT NOT NULL CHECK (length(event_type) BETWEEN 1 AND 128),
    -- The object the event is about (a deployment id, a checkout session id),
    -- so every event for one subject can be read in order.
    subject_id TEXT,
    occurred_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- A curated, size-capped summary — never the raw provider body, which can
    -- carry customer PII (Stripe) or commit metadata (Vercel).
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'processing'
        CHECK (status IN ('processing', 'processed', 'ignored', 'failed')),
    attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 1),
    duplicates INTEGER NOT NULL DEFAULT 0 CHECK (duplicates >= 0),
    last_received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    locked_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    latency_ms INTEGER,
    last_error TEXT,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT webhook_events_source_event_uq UNIQUE (source, event_id)
);

COMMENT ON TABLE webhook_events IS
    'Inbound webhook record (Stripe, Vercel, …). UNIQUE(source, event_id) is the idempotency guard; identity + payload are immutable.';

CREATE INDEX IF NOT EXISTS idx_webhook_events_received
    ON webhook_events (received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source_received
    ON webhook_events (source, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_subject
    ON webhook_events (source, subject_id, received_at DESC)
    WHERE subject_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webhook_events_unfinished
    ON webhook_events (status, last_received_at)
    WHERE status IN ('processing', 'failed');

-- Identity and payload are the record; refuse any UPDATE that rewrites them.
CREATE OR REPLACE FUNCTION webhook_events_guard_identity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.source IS DISTINCT FROM OLD.source
       OR NEW.event_id IS DISTINCT FROM OLD.event_id
       OR NEW.event_type IS DISTINCT FROM OLD.event_type
       OR NEW.subject_id IS DISTINCT FROM OLD.subject_id
       OR NEW.occurred_at IS DISTINCT FROM OLD.occurred_at
       OR NEW.received_at IS DISTINCT FROM OLD.received_at
       OR NEW.payload IS DISTINCT FROM OLD.payload THEN
        RAISE EXCEPTION 'webhook_events identity and payload are immutable (id %)', OLD.id
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_webhook_events_guard_identity ON webhook_events;
CREATE TRIGGER trg_webhook_events_guard_identity
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION webhook_events_guard_identity();
