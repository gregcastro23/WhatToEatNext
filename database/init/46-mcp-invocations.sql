-- database/init/46-mcp-invocations.sql
-- MCP invocation log — one row per tool call into the Alchm MCP server,
-- regardless of caller (synthetic probe, Claude Desktop, Cursor, PA MCP
-- bridge, internal admin tooling).
--
-- Feeds two surfaces:
--   1. agentTelemetryService.getAgentNetworkTelemetry() exposes a live
--      "mcpInvocationRate" so the admin dashboard can see external-LLM
--      traffic alongside in-app feed activity.
--   2. systemStatusService.probeMcp() reads the latest row to check the
--      tool layer hasn't gone silent.
--
-- Per-row footprint is small (≤2KB typical); the daily prune cron
-- (observability-prune) is extended in lockstep to retain 7 days.

CREATE TABLE IF NOT EXISTS mcp_invocations (
    id BIGSERIAL PRIMARY KEY,
    tool_name TEXT NOT NULL,
    called_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    latency_ms INTEGER,
    success BOOLEAN NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    caller TEXT,
    arguments JSONB DEFAULT '{}'::jsonb,
    result_summary JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    tokens_debited JSONB
);

COMMENT ON TABLE mcp_invocations IS
    'One row per Alchm MCP tool call. Drives agent telemetry + system status for the MCP surface.';
COMMENT ON COLUMN mcp_invocations.caller IS
    'Free-form caller identifier — synthetic-probe, claude-desktop, cursor, pa-mcp, etc. Set by the caller via _meta.caller.';
COMMENT ON COLUMN mcp_invocations.tokens_debited IS
    'Per-axis ESMS debit recorded against this call, e.g. {"spirit": 2.5, ...}. NULL when no debit applied.';

-- Latest-per-tool lookups (status panel) and per-tool time-window aggs.
CREATE INDEX IF NOT EXISTS idx_mcp_invocations_tool_called
    ON mcp_invocations (tool_name, called_at DESC);

-- Per-user history (future deep-dive panel).
CREATE INDEX IF NOT EXISTS idx_mcp_invocations_user_called
    ON mcp_invocations (user_id, called_at DESC)
    WHERE user_id IS NOT NULL;

-- "Recent failures across all tools" scan.
CREATE INDEX IF NOT EXISTS idx_mcp_invocations_failures
    ON mcp_invocations (called_at DESC)
    WHERE success = false;

-- Extend the existing observability prune function to cover mcp_invocations
-- so the nightly cron sweeps this table too. Returns an extra column.
--
-- Postgres rejects CREATE OR REPLACE FUNCTION when the OUT parameters
-- change, so drop the old signature first. The cron route tolerates a
-- missing `mcp_invocations_deleted` column for the brief window where
-- the function is dropped but not yet recreated.
DROP FUNCTION IF EXISTS prune_observability_logs(INTEGER);

CREATE OR REPLACE FUNCTION prune_observability_logs(retain_days INTEGER DEFAULT 7)
    RETURNS TABLE (
        request_log_deleted BIGINT,
        slow_query_log_deleted BIGINT,
        mcp_invocations_deleted BIGINT
    ) AS $$
DECLARE
    req_deleted BIGINT;
    slow_deleted BIGINT;
    mcp_deleted BIGINT;
BEGIN
    DELETE FROM request_log_entries WHERE at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS req_deleted = ROW_COUNT;

    DELETE FROM slow_query_log_entries WHERE at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS slow_deleted = ROW_COUNT;

    DELETE FROM mcp_invocations WHERE called_at < NOW() - (retain_days || ' days')::INTERVAL;
    GET DIAGNOSTICS mcp_deleted = ROW_COUNT;

    RETURN QUERY SELECT req_deleted, slow_deleted, mcp_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prune_observability_logs IS
    'Delete observability + mcp_invocations rows older than retain_days (default 7). Returns deleted row counts per table.';

