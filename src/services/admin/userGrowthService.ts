/**
 * Human growth — signups, engagement, retention, activation. Server-only.
 *
 * The users table is overwhelmingly agent accounts, so every number here is
 * HUMANS ONLY. "Human" is decided by email domain, not `is_agent`: the flag
 * is known to be wrong in both directions (dozens of human-email rows carry
 * is_agent=true), while every provisioned agent has an
 * `@agentic.alchm.kitchen` address.
 *
 * "Active" means the user did something the server recorded, from any of:
 *   auth_events (successful auth), token_transactions (any ledger movement),
 *   user_interactions (recipe views/cooks, diary entries…), page_views with a
 *   signed-in user (migration 86, when present), users.last_login_at.
 * The union is stated in the payload (`activitySources`) so the operator
 * knows what "active" covers.
 *
 * Day/week buckets use America/New_York, matching userInsightsService.
 *
 * @file src/services/admin/userGrowthService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";

const AGENT_DOMAIN = "%@agentic.alchm.kitchen";
const TZ = "America/New_York";
const SERIES_DAYS = 30;
const COHORT_WEEKS = 8;

export interface GrowthPayload {
  generatedAt: string;
  live: boolean;
  errors: string[];
  activitySources: string[];
  population: { humans: number; agents: number };
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    /** DAU / MAU — how many monthly users come back on a given day. */
    stickiness: number | null;
  };
  series: Array<{ day: string; signups: number; active: number }>;
  cohorts: Array<{
    week: string;
    size: number;
    /** retained[k] = share of the cohort active in week k after signup (k=0 is the signup week). */
    retained: Array<number | null>;
  }>;
  funnel: Array<{ step: string; count: number; detail: string }>;
  recentSignups: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    onboarded: boolean;
    lastActiveAt: string | null;
    events7d: number;
  }>;
  mostActive: Array<{ id: string; email: string; name: string | null; events30d: number; lastActiveAt: string | null }>;
}

async function pageViewsAvailable(): Promise<boolean> {
  try {
    const res = await executeQuery<{ present: boolean }>(
      `SELECT to_regclass('public.page_views') IS NOT NULL AS present`,
    );
    return res.rows[0]?.present === true;
  } catch {
    return false;
  }
}

/**
 * CTE text for `humans` and `human_activity` (uid, at) over the last `days` days.
 * Built once per request because the page_views arm depends on migration 86.
 */
function activityCte(days: number, withPageViews: boolean): string {
  const since = `NOW() - INTERVAL '${days} days'`;
  return `
    humans AS (
      SELECT id, id::text AS uid, email, created_at
        FROM users
       WHERE email NOT ILIKE '${AGENT_DOMAIN}'
    ),
    -- Each arm joins humans FIRST: agents write thousands of ledger rows a
    -- day, and the (user_id, created_at) indexes make a per-human probe far
    -- cheaper than scanning the whole window and discarding agent rows.
    human_activity AS (
      SELECT a.user_id AS uid, a.created_at AS at
        FROM humans h JOIN auth_events a ON a.user_id = h.uid
       WHERE a.status = 'success' AND a.created_at >= ${since}
      UNION ALL
      SELECT h.uid, t.created_at
        FROM humans h JOIN token_transactions t ON t.user_id = h.id
       WHERE t.created_at >= ${since}
      UNION ALL
      SELECT h.uid, ui.created_at
        FROM humans h JOIN user_interactions ui ON ui.user_id = h.id
       WHERE ui.created_at >= ${since}
      UNION ALL
      SELECT h.uid, u.last_login_at
        FROM humans h JOIN users u ON u.id = h.id
       WHERE u.last_login_at >= ${since}
      ${
        withPageViews
          ? `UNION ALL
      SELECT h.uid, pv.at
        FROM humans h JOIN page_views pv ON pv.user_id = h.uid
       WHERE NOT pv.is_bot AND pv.at >= ${since}`
          : ""
      }
    )`;
}

function nyDayKeys(days: number, now: Date): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) keys.push(fmt.format(new Date(now.getTime() - i * 86_400_000)));
  return [...new Set(keys)];
}

export async function getUserGrowth(): Promise<GrowthPayload> {
  const errors: string[] = [];
  const withPageViews = await pageViewsAvailable();
  const cte = activityCte(COHORT_WEEKS * 7 + 14, withPageViews);
  const now = new Date();

  async function q<T extends Record<string, unknown>>(label: string, sql: string): Promise<T[] | null> {
    try {
      return (await executeQuery<T>(sql)).rows;
    } catch (err) {
      errors.push(`${label}: ${err instanceof Error ? err.message : "query failed"}`);
      _logger.error(`[admin/growth] ${label} failed:`, err);
      return null;
    }
  }

  const [population, engagement, activeSeries, signupSeries, cohortSizes, cohortActive, funnel, recent, mostActive] =
    await Promise.all([
      q<{ humans: number; agents: number }>(
        "population",
        `SELECT COUNT(*) FILTER (WHERE email NOT ILIKE '${AGENT_DOMAIN}')::int AS humans,
                COUNT(*) FILTER (WHERE email ILIKE '${AGENT_DOMAIN}')::int AS agents
           FROM users`,
      ),
      q<{ dau: number; wau: number; mau: number }>(
        "engagement",
        `WITH ${cte}
         SELECT COUNT(DISTINCT uid) FILTER (WHERE at >= NOW() - INTERVAL '1 day')::int AS dau,
                COUNT(DISTINCT uid) FILTER (WHERE at >= NOW() - INTERVAL '7 days')::int AS wau,
                COUNT(DISTINCT uid) FILTER (WHERE at >= NOW() - INTERVAL '30 days')::int AS mau
           FROM human_activity`,
      ),
      q<{ day: string; n: number }>(
        "active series",
        `WITH ${cte}
         SELECT to_char(date_trunc('day', at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS day,
                COUNT(DISTINCT uid)::int AS n
           FROM human_activity
          WHERE at >= NOW() - INTERVAL '${SERIES_DAYS} days'
          GROUP BY 1`,
      ),
      q<{ day: string; n: number }>(
        "signup series",
        `SELECT to_char(date_trunc('day', created_at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS day,
                COUNT(*)::int AS n
           FROM users
          WHERE email NOT ILIKE '${AGENT_DOMAIN}'
            AND created_at >= NOW() - INTERVAL '${SERIES_DAYS} days'
          GROUP BY 1`,
      ),
      q<{ week: string; size: number }>(
        "cohort sizes",
        `SELECT to_char(date_trunc('week', created_at AT TIME ZONE '${TZ}'), 'YYYY-MM-DD') AS week,
                COUNT(*)::int AS size
           FROM users
          WHERE email NOT ILIKE '${AGENT_DOMAIN}'
            AND created_at >= date_trunc('week', NOW() AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}'
                              - INTERVAL '${COHORT_WEEKS - 1} weeks'
          GROUP BY 1`,
      ),
      q<{ week: string; k: number; active: number }>(
        "cohort activity",
        `WITH ${cte},
         cohort AS (
           SELECT uid, date_trunc('week', created_at AT TIME ZONE '${TZ}') AS wk
             FROM humans
            WHERE created_at >= date_trunc('week', NOW() AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}'
                                - INTERVAL '${COHORT_WEEKS - 1} weeks'
         ),
         act AS (
           SELECT DISTINCT uid, date_trunc('week', at AT TIME ZONE '${TZ}') AS wk FROM human_activity
         )
         SELECT to_char(c.wk, 'YYYY-MM-DD') AS week,
                (EXTRACT(EPOCH FROM (a.wk - c.wk)) / 604800)::int AS k,
                COUNT(DISTINCT c.uid)::int AS active
           FROM cohort c
           JOIN act a ON a.uid = c.uid AND a.wk >= c.wk
          GROUP BY 1, 2`,
      ),
      q<{ signed_up: number; onboarded: number; activated: number; returned: number; premium: number }>(
        "funnel",
        `WITH ${cte},
         firsts AS (
           SELECT h.uid,
                  bool_or(a.at >= h.created_at + INTERVAL '1 day') AS returned
             FROM humans h LEFT JOIN human_activity a ON a.uid = h.uid
            GROUP BY h.uid
         )
         SELECT
           (SELECT COUNT(*) FROM humans)::int AS signed_up,
           (SELECT COUNT(*) FROM humans h JOIN user_profiles up ON up.user_id = h.id
             WHERE up.onboarding_completed = true)::int AS onboarded,
           (SELECT COUNT(*) FROM humans h
             WHERE EXISTS (SELECT 1 FROM user_interactions ui WHERE ui.user_id = h.id)
                OR EXISTS (SELECT 1 FROM token_transactions t
                            WHERE t.user_id = h.id AND t.source_type <> 'signup_grant'))::int AS activated,
           (SELECT COUNT(*) FROM firsts WHERE returned)::int AS returned,
           (SELECT COUNT(*) FROM humans h JOIN user_subscriptions s ON s.user_id = h.id
             WHERE s.status = 'active' AND s.stripe_subscription_id IS NOT NULL)::int AS premium`,
      ),
      q<{
        id: string;
        email: string;
        name: string | null;
        created_at: Date;
        onboarded: boolean | null;
        last_active: Date | null;
        events_7d: number;
      }>(
        "recent signups",
        `WITH ${cte}
         SELECT h.uid AS id, h.email, COALESCE(up.name, u.name) AS name, h.created_at,
                up.onboarding_completed AS onboarded,
                (SELECT MAX(at) FROM human_activity a WHERE a.uid = h.uid) AS last_active,
                (SELECT COUNT(*) FROM human_activity a
                  WHERE a.uid = h.uid AND a.at >= NOW() - INTERVAL '7 days')::int AS events_7d
           FROM humans h
           JOIN users u ON u.id = h.id
           LEFT JOIN user_profiles up ON up.user_id = h.id
          ORDER BY h.created_at DESC
          LIMIT 12`,
      ),
      q<{ id: string; email: string; name: string | null; events: number; last_active: Date | null }>(
        "most active",
        `WITH ${cte}
         SELECT a.uid AS id, u.email, COALESCE(up.name, u.name) AS name,
                COUNT(*)::int AS events, MAX(a.at) AS last_active
           FROM human_activity a
           JOIN users u ON u.id::text = a.uid
           LEFT JOIN user_profiles up ON up.user_id = u.id
          WHERE a.at >= NOW() - INTERVAL '30 days'
          GROUP BY a.uid, u.email, up.name, u.name
          ORDER BY events DESC
          LIMIT 10`,
      ),
    ]);

  const eng = engagement?.[0];
  const activeMap = new Map((activeSeries ?? []).map((r) => [r.day, Number(r.n)]));
  const signupMap = new Map((signupSeries ?? []).map((r) => [r.day, Number(r.n)]));

  const sizeMap = new Map((cohortSizes ?? []).map((r) => [r.week, Number(r.size)]));
  const activeByCohort = new Map<string, Map<number, number>>();
  for (const row of cohortActive ?? []) {
    const m = activeByCohort.get(row.week) ?? new Map<number, number>();
    m.set(Number(row.k), Number(row.active));
    activeByCohort.set(row.week, m);
  }
  const cohorts = [...sizeMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([week, size]) => {
      const elapsedWeeks = Math.floor((now.getTime() - new Date(`${week}T00:00:00`).getTime()) / (7 * 86_400_000));
      const retained: Array<number | null> = [];
      for (let k = 0; k < COHORT_WEEKS; k += 1) {
        // A week that has not happened yet is unknown, not 0%.
        retained.push(k > elapsedWeeks || size === 0 ? null : (activeByCohort.get(week)?.get(k) ?? 0) / size);
      }
      return { week, size, retained };
    });

  const f = funnel?.[0];
  const funnelSteps: GrowthPayload["funnel"] = f
    ? [
        { step: "Signed up", count: Number(f.signed_up), detail: "human accounts, all time" },
        { step: "Onboarded", count: Number(f.onboarded), detail: "birth chart completed" },
        { step: "Activated", count: Number(f.activated), detail: "any interaction or ledger movement beyond the welcome grant" },
        { step: "Returned", count: Number(f.returned), detail: `active again ≥1 day after signup (last ${COHORT_WEEKS * 7 + 14}d of activity)` },
        { step: "Paying", count: Number(f.premium), detail: "active Stripe-backed subscription" },
      ]
    : [];

  const mau = Number(eng?.mau ?? 0);
  return {
    generatedAt: now.toISOString(),
    live: errors.length === 0,
    errors,
    activitySources: [
      "auth_events (success)",
      "token_transactions",
      "user_interactions",
      "users.last_login_at",
      ...(withPageViews ? ["page_views (signed-in)"] : []),
    ],
    population: {
      humans: Number(population?.[0]?.humans ?? 0),
      agents: Number(population?.[0]?.agents ?? 0),
    },
    engagement: {
      dau: Number(eng?.dau ?? 0),
      wau: Number(eng?.wau ?? 0),
      mau,
      stickiness: engagement && mau > 0 ? Number(eng?.dau ?? 0) / mau : null,
    },
    series: nyDayKeys(SERIES_DAYS, now).map((day) => ({
      day,
      signups: signupMap.get(day) ?? 0,
      active: activeMap.get(day) ?? 0,
    })),
    cohorts,
    funnel: funnelSteps,
    recentSignups: (recent ?? []).map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      createdAt: new Date(r.created_at).toISOString(),
      onboarded: r.onboarded === true,
      lastActiveAt: r.last_active ? new Date(r.last_active).toISOString() : null,
      events7d: Number(r.events_7d),
    })),
    mostActive: (mostActive ?? []).map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name,
      events30d: Number(r.events),
      lastActiveAt: r.last_active ? new Date(r.last_active).toISOString() : null,
    })),
  };
}
