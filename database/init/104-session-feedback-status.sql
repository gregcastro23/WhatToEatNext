-- database/init/104-session-feedback-status.sql
-- Closed-loop status triage for contextual micro-feedback (`open` | `resolved` | `dismissed`)
-- so operators can resolve addressed viewer issues out of active alert queues.
--
-- Plain CREATE INDEX IF NOT EXISTS (no CONCURRENTLY): the deploy-time runner
-- wraps each file in a transaction.

ALTER TABLE session_feedback
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open';

ALTER TABLE session_feedback
    ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_session_feedback_open_status
    ON session_feedback (status, at DESC)
    WHERE status = 'open';
