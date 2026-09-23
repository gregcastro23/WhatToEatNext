/**
 * SQL behind /admin/growth. Server-only. HUMANS ONLY: a human is any account
 * whose email is not on the provisioned-agent domain (`is_agent` is wrong in
 * both directions, so it is not used).
 *
 * "Activity" is the union of auth_events (success), token_transactions,
 * user_interactions, users.last_login_at, and — once migration 86 exists —
 * signed-in page_views. Each arm joins `humans` FIRST so the
 * (user_id, created_at) indexes probe a handful of humans instead of
 * scanning thousands of agent ledger rows.
 *
 * @file src/services/admin/userGrowthQueries.ts
 */

import { executeQuery } from "@/lib/database/connection";

export const AGENT_DOMAIN = "%@agentic.alchm.kitchen";
export const TZ = "America/New_York";
export const SERIES_DAYS = 30;
export const COHORT_WEEKS = 8;
/** Activity window: every cohort week plus two weeks of margin. */
export const ACTIVITY_DAYS = COHORT_WEEKS * 7 + 14;

export async function pageViewsAvailable(): Promise<boolean> {
  try {
    const res = await executeQuery<{ present: boolean }>(`SELECT to_regclass('public.page_views') IS NOT NULL AS present`);
    return res.rows[0]?.present === true;
  } catch {
    return false;
  }
}

/** `humans` and `human_activity(uid, at)` CTEs for a WITH clause. */
export function activityCte(withPageViews: boolean): string {
  const since = `NOW() - INTERVAL '${ACTIVITY_DAYS} days'`;
  const pageViewArm = withPageViews
    ? `UNION ALL
      SELECT h.uid, pv.at FROM humans h JOIN page_views pv ON pv.user_id = h.uid
       WHERE NOT pv.is_bot AND pv.at >= ${since}`
    : "";
  return `
    humans AS (
      SELECT id, id::text AS uid, email, created_at FROM users WHERE email NOT ILIKE '${AGENT_DOMAIN}'
    ),
    human_activity AS (
      SELECT a.user_id AS uid, a.created_at AS at FROM humans h JOIN auth_events a ON a.user_id = h.uid
       WHERE a.status = 'success' AND a.created_at >= ${since}
      UNION ALL
      SELECT h.uid, t.created_at FROM humans h JOIN token_transactions t ON t.user_id = h.id
       WHERE t.created_at >= ${since}
      UNION ALL
      SELECT h.uid, ui.created_at FROM humans h JOIN user_interactions ui ON ui.user_id = h.id
       WHERE ui.created_at >= ${since}
      UNION ALL
      SELECT h.uid, u.last_login_at FROM humans h JOIN users u ON u.id = h.id
       WHERE u.last_login_at >= ${since}
      ${pageViewArm}
    )`;
}

const COHORT_START = `date_trunc('week', NOW() AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}' - INTERVAL '${COHORT_WEEKS - 1} weeks'`;

type NoCte = () => string;
type WithCte = (cte: string) => string;

interface GrowthSql {
  population: NoCte;
  engagement: WithCte;
  activeSeries: WithCte;
  signupSeries: NoCte;
  cohortSizes: NoCte;
  cohortActivity: WithCte;
  funnel: WithCte;
  recentSignups: WithCte;
  mostActive: WithCte;
}

export const SQL: GrowthSql = {
  population: () => `SELECT COUNT(*) FILTER (WHERE email NOT ILIKE '${AGENT_DOMAIN}')::int AS humans,
                            COUNT(*) FILTER (WHERE email ILIKE '${AGENT_DOMAIN}')::int AS agents
                       FROM users`,
  engagement: (cte: string) => `WITH ${cte}
    SELECT COUNT(DISTINCT uid) FILTER (WHERE at >= NOW() - INTERVAL '1 day')::int AS dau,
           COUNT(DISTINCT uid) FILTER (WHERE at >= NOW() - INTERVAL '7 days')::int AS wau,
           COUNT(DISTINCT uid) FILTER (WHERE at >= NOW() - INTERVAL '30 days')::int AS mau
      FROM human_activity`,
  activeSeries: (cte: string) => `WITH ${cte}
    SELECT to_char(date_trunc('day', at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS day, COUNT(DISTINCT uid)::int AS n
      FROM human_activity WHERE at >= NOW() - INTERVAL '${SERIES_DAYS} days' GROUP BY 1`,
  signupSeries: () => `SELECT to_char(date_trunc('day', created_at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS day,
                              COUNT(*)::int AS n
                         FROM users
                        WHERE email NOT ILIKE '${AGENT_DOMAIN}' AND created_at >= NOW() - INTERVAL '${SERIES_DAYS} days'
                        GROUP BY 1`,
  cohortSizes: () => `SELECT to_char(date_trunc('week', created_at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS week,
                             COUNT(*)::int AS size
                        FROM users
                       WHERE email NOT ILIKE '${AGENT_DOMAIN}' AND created_at >= ${COHORT_START}
                       GROUP BY 1`,
  cohortActivity: (cte: string) => `WITH ${cte},
    cohort AS (SELECT uid, date_trunc('week', created_at AT TIME ZONE '${TZ}') AS wk FROM humans
                WHERE created_at >= ${COHORT_START}),
    act AS (SELECT DISTINCT uid, date_trunc('week', at AT TIME ZONE '${TZ}') AS wk FROM human_activity)
    SELECT to_char(c.wk, 'YYYY-MM-DD') AS week, (EXTRACT(EPOCH FROM (a.wk - c.wk)) / 604800)::int AS k,
           COUNT(DISTINCT c.uid)::int AS active
      FROM cohort c JOIN act a ON a.uid = c.uid AND a.wk >= c.wk
     GROUP BY 1, 2`,
  funnel: (cte: string) => `WITH ${cte},
    firsts AS (SELECT h.uid, bool_or(a.at >= h.created_at + INTERVAL '1 day') AS returned
                 FROM humans h LEFT JOIN human_activity a ON a.uid = h.uid GROUP BY h.uid)
    SELECT (SELECT COUNT(*) FROM humans)::int AS signed_up,
           (SELECT COUNT(*) FROM humans h JOIN user_profiles up ON up.user_id = h.id
             WHERE up.onboarding_completed = true)::int AS onboarded,
           (SELECT COUNT(*) FROM humans h
             WHERE EXISTS (SELECT 1 FROM user_interactions ui WHERE ui.user_id = h.id)
                OR EXISTS (SELECT 1 FROM token_transactions t
                            WHERE t.user_id = h.id AND t.source_type <> 'signup_grant'))::int AS activated,
           (SELECT COUNT(*) FROM firsts WHERE returned)::int AS returned,
           (SELECT COUNT(*) FROM humans h JOIN user_subscriptions s ON s.user_id = h.id
             WHERE s.status = 'active' AND s.stripe_subscription_id IS NOT NULL)::int AS premium`,
  recentSignups: (cte: string) => `WITH ${cte}
    SELECT h.uid AS id, h.email, COALESCE(up.name, u.name) AS name, h.created_at,
           up.onboarding_completed AS onboarded,
           (SELECT MAX(at) FROM human_activity a WHERE a.uid = h.uid) AS last_active,
           (SELECT COUNT(*) FROM human_activity a WHERE a.uid = h.uid AND a.at >= NOW() - INTERVAL '7 days')::int AS events_7d
      FROM humans h JOIN users u ON u.id = h.id LEFT JOIN user_profiles up ON up.user_id = h.id
     ORDER BY h.created_at DESC LIMIT 12`,
  mostActive: (cte: string) => `WITH ${cte}
    SELECT a.uid AS id, u.email, COALESCE(up.name, u.name) AS name, COUNT(*)::int AS events, MAX(a.at) AS last_active
      FROM human_activity a JOIN users u ON u.id::text = a.uid LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE a.at >= NOW() - INTERVAL '30 days'
     GROUP BY a.uid, u.email, up.name, u.name ORDER BY events DESC LIMIT 10`,
};

export interface FunnelRow {
  signed_up: number;
  onboarded: number;
  activated: number;
  returned: number;
  premium: number;
}

export interface RecentSignupRow {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
  onboarded: boolean | null;
  last_active: Date | null;
  events_7d: number;
}

export interface MostActiveRow {
  id: string;
  email: string;
  name: string | null;
  events: number;
  last_active: Date | null;
}
