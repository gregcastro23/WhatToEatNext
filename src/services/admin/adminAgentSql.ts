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

export const AGENT_ROSTER_STATS_SQL = `SELECT
         COUNT(*)::int AS total_agents,
         COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '24 hours')::int AS active_agents
       FROM users
       WHERE is_agent = true`;

export const RECIPE_PIPELINE_OUTCOMES_SQL = `SELECT
         (SELECT COUNT(DISTINCT transaction_group_id)::int
            FROM token_transactions
           WHERE (source_type = 'cosmic_recipe_refund'
               OR idempotency_key LIKE 'cosmic_recipe_refund:%'
               OR description LIKE 'Refund - cosmic recipe%')
             AND created_at > NOW() - INTERVAL '24 hours') AS refunds,
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/generate-cosmic-recipe'
             AND at > NOW() - INTERVAL '24 hours') AS attempts,
         (SELECT COUNT(*)::int
            FROM request_log_entries
           WHERE path = '/api/generate-cosmic-recipe'
             AND status >= 500
             AND at > NOW() - INTERVAL '24 hours') AS final_failures`;
