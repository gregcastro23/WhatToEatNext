/** Shared shipped SQL for the agent pulse/action readers and PostgreSQL proof. */
export const AGENT_PULSE_ROSTER_SQL =
  "SELECT COUNT(*)::int AS count FROM users WHERE is_agent = true";

/**
 * Per-path request outcomes over 24 h. Every status is in exactly one of
 * `successes` (2xx/3xx), `client_failures`, `refusals` or `server_failures`.
 *
 * `refusals` (402, 409) are documented, EXPECTED outcomes of the agent economy
 * routes, not failures: 402 `insufficient_funds` (the agent cannot pay) and 409
 * `already_applied` (an idempotent replay, or the once-per-UTC-day yield guard).
 * They used to be counted as "Fail (4xx)", which also counted 5xx. MEASURED
 * 2026-11-23: every non-2xx of `/api/economy/sync-debit` over 7 days was a 402
 * (5,346 of 5,346), and 161 of the 170 non-2xx of `/api/economy/sync-credit` were
 * 409; the same miscount was first found 2026-08-14.
 */
export const AGENT_ACTION_METRICS_SQL = `SELECT
         path,
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status >= 200 AND status < 400)::int AS successes,
         COUNT(*) FILTER (WHERE status >= 400 AND status < 500 AND status NOT IN (402, 409))::int AS client_failures,
         COUNT(*) FILTER (WHERE status IN (402, 409))::int AS refusals,
         COUNT(*) FILTER (WHERE status >= 500)::int AS server_failures,
         (PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms))::int AS p50_ms,
         (PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms))::int AS p95_ms,
         MAX(at) AS last_seen
       FROM request_log_entries
       WHERE at > NOW() - INTERVAL '24 hours'
         AND path = ANY($1::text[])
       GROUP BY path`;

/**
 * `active_agents` = distinct agents with at least one feed event in 24 h.
 *
 * It used to count `users.last_login_at`, which only an interactive sign-in
 * writes (`auth.ts`); agents are created without ever signing in, so it was 0
 * even with 946 agent events in the same 24 h. The join and window are the shape
 * `systemStatusService` already runs on every poll (`feed_events` joined to
 * `users` on `actor_id`), which `idx_feed_events_created` serves.
 */
export const AGENT_ROSTER_STATS_SQL = `SELECT
         COUNT(*)::int AS total_agents,
         (
           SELECT COUNT(DISTINCT f.actor_id)::int
             FROM feed_events f
             JOIN users a ON f.actor_id = a.id
            WHERE a.is_agent = true
              AND f.created_at > NOW() - INTERVAL '24 hours'
         ) AS active_agents
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
