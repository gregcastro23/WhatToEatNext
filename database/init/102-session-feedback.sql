-- database/init/102-session-feedback.sql
-- Contextual in-app micro-feedback tied to view_id and session_id so user
-- notes and ratings appear directly inside their session journey on
-- /admin/traffic.
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

CREATE TABLE IF NOT EXISTS session_feedback (
    id BIGSERIAL PRIMARY KEY,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    view_id TEXT,
    session_id TEXT,
    visitor_hash TEXT,
    user_id TEXT,
    path TEXT NOT NULL,
    ref_tag TEXT,
    rating SMALLINT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    note TEXT NOT NULL
);

COMMENT ON TABLE session_feedback IS
    'First-party contextual micro-feedback submitted from the site footer or error boundary, linked to page_views via view_id and session_id.';

CREATE INDEX IF NOT EXISTS idx_session_feedback_at
    ON session_feedback (at DESC);

CREATE INDEX IF NOT EXISTS idx_session_feedback_session
    ON session_feedback (session_id, at DESC)
    WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_session_feedback_view
    ON session_feedback (view_id)
    WHERE view_id IS NOT NULL;
