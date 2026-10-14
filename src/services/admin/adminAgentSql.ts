/** Shared shipped SQL for the agent pulse/action readers and PostgreSQL proof. */
export const AGENT_PULSE_ROSTER_SQL =
  "SELECT COUNT(*)::int AS count FROM users WHERE is_agent = true";

export const AGENT_ACTION_METRICS_SQL = `SELECT
         path,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status >= 200 AND status < 400)::int AS successes,
         COUNT(*) FILTER (WHERE status >= 400)::int AS failures,
         COUNT(*) FILTER (WHERE status >= 500)::int AS server_failures,
         (PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms))::int AS p50_ms,
         (PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms))::int AS p95_ms,
         MAX(at) AS last_seen
       FROM request_log_entries
       WHERE at > NOW() - INTERVAL '24 hours'
         AND path = ANY($1::text[])
       GROUP BY path`;
