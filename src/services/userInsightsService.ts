/**
 * User Insights Service
 *
 * Aggregates demographic, activity, onboarding, and tier breakdowns for the
 * full user roster so /admin/users can render a single-glance overview.
 *
 * Demographic charts (elements / modalities / sun signs) scope to humans only
 * — agent rows would bias the picture. Headline counts include both.
 */

import { executeQuery } from "@/lib/database";

export interface SignupTrendPoint {
  day: string;
  count: number;
}

export interface SignDistribution {
  sign: string;
  count: number;
}

export interface UserInsightsPayload {
  generatedAt: string;
  totals: {
    all: number;
    humans: number;
    agents: number;
    active: number;
    admins: number;
  };
  signups: {
    last24h: number;
    last7d: number;
    last30d: number;
    trend: SignupTrendPoint[];
  };
  activity: {
    activeIn24h: number;
    activeIn7d: number;
    activeIn30d: number;
    neverLoggedIn: number;
    dormantOver30d: number;
    activeSessions: number;
  };
  onboarding: {
    completed: number;
    pending: number;
    completionRate: number;
    completedLast7d: number;
    medianMinutesToComplete: number | null;
  };
  tiers: {
    free: number;
    premium: number;
    admin: number;
  };
  elements: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    unknown: number;
  };
  modalities: {
    cardinal: number;
    fixed: number;
    mutable: number;
    unknown: number;
  };
  sunSigns: SignDistribution[];
}

interface RollupRow {
  total: number;
  humans: number;
  agents: number;
  active: number;
  admins: number;
  signups_24h: number;
  signups_7d: number;
  signups_30d: number;
  active_24h: number;
  active_7d: number;
  active_30d: number;
  never_logged_in: number;
  dormant_30d: number;
  onboarded: number;
  pending_onboarding: number;
  onboarded_7d: number;
  premium: number;
  free: number;
}

interface CountRow<T extends string> {
  bucket: T | null;
  count: number;
}

interface MedianRow {
  median_minutes: string | null;
}

interface ActiveSessionsRow {
  active_sessions: number;
}

const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export async function getUserInsights(): Promise<UserInsightsPayload> {
  const [
    rollupRes,
    trendRes,
    elementsRes,
    modalitiesRes,
    sunSignsRes,
    medianRes,
    sessionsRes,
  ] = await Promise.all([
    executeQuery<RollupRow>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE COALESCE(u.is_agent, false) = false)::int AS humans,
         COUNT(*) FILTER (WHERE u.is_agent = true)::int AS agents,
         COUNT(*) FILTER (WHERE u.is_active = true)::int AS active,
         COUNT(*) FILTER (WHERE u.role = 'ADMIN')::int AS admins,

         COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '24 hours')::int AS signups_24h,
         COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days')::int AS signups_7d,
         COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '30 days')::int AS signups_30d,

         COUNT(*) FILTER (WHERE u.last_login_at >= NOW() - INTERVAL '24 hours')::int AS active_24h,
         COUNT(*) FILTER (WHERE u.last_login_at >= NOW() - INTERVAL '7 days')::int  AS active_7d,
         COUNT(*) FILTER (WHERE u.last_login_at >= NOW() - INTERVAL '30 days')::int AS active_30d,
         COUNT(*) FILTER (WHERE u.last_login_at IS NULL)::int AS never_logged_in,
         COUNT(*) FILTER (
           WHERE u.last_login_at IS NOT NULL
             AND u.last_login_at < NOW() - INTERVAL '30 days'
         )::int AS dormant_30d,

         COUNT(*) FILTER (WHERE up.onboarding_completed = true)::int AS onboarded,
         COUNT(*) FILTER (WHERE COALESCE(up.onboarding_completed, false) = false)::int AS pending_onboarding,
         COUNT(*) FILTER (WHERE up.onboarding_completed_at >= NOW() - INTERVAL '7 days')::int AS onboarded_7d,

         COUNT(*) FILTER (WHERE s.tier = 'premium' OR u.role = 'ADMIN')::int AS premium,
         COUNT(*) FILTER (WHERE COALESCE(s.tier, 'free') = 'free' AND u.role <> 'ADMIN')::int AS free
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_subscriptions s ON s.user_id = u.id`,
    ),

    executeQuery<{ day: string; count: number }>(
      `SELECT
         to_char(date_trunc('day', u.created_at), 'YYYY-MM-DD') AS day,
         COUNT(*)::int AS count
       FROM users u
       WHERE u.created_at >= NOW() - INTERVAL '14 days'
         AND COALESCE(u.is_agent, false) = false
       GROUP BY date_trunc('day', u.created_at)
       ORDER BY day ASC`,
    ),

    executeQuery<CountRow<string>>(
      `SELECT
         LOWER(COALESCE(up.dominant_element, up.natal_chart->>'dominantElement')) AS bucket,
         COUNT(*)::int AS count
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       WHERE COALESCE(u.is_agent, false) = false
         AND up.onboarding_completed = true
       GROUP BY LOWER(COALESCE(up.dominant_element, up.natal_chart->>'dominantElement'))`,
    ),

    executeQuery<CountRow<string>>(
      `SELECT
         LOWER(up.natal_chart->>'dominantModality') AS bucket,
         COUNT(*)::int AS count
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       WHERE COALESCE(u.is_agent, false) = false
         AND up.onboarding_completed = true
       GROUP BY LOWER(up.natal_chart->>'dominantModality')`,
    ),

    executeQuery<CountRow<string>>(
      `SELECT
         LOWER(up.natal_chart->'planetaryPositions'->'Sun'->>'sign') AS bucket,
         COUNT(*)::int AS count
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       WHERE COALESCE(u.is_agent, false) = false
         AND up.onboarding_completed = true
         AND up.natal_chart->'planetaryPositions'->'Sun'->>'sign' IS NOT NULL
       GROUP BY LOWER(up.natal_chart->'planetaryPositions'->'Sun'->>'sign')`,
    ),

    executeQuery<MedianRow>(
      `SELECT
         PERCENTILE_CONT(0.5) WITHIN GROUP (
           ORDER BY EXTRACT(EPOCH FROM (up.onboarding_completed_at - u.created_at)) / 60.0
         )::text AS median_minutes
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       WHERE up.onboarding_completed = true
         AND up.onboarding_completed_at IS NOT NULL
         AND COALESCE(u.is_agent, false) = false`,
    ),

    executeQuery<ActiveSessionsRow>(
      `SELECT COUNT(*)::int AS active_sessions
       FROM device_sessions
       WHERE revoked_at IS NULL`,
    ),
  ]);

  const rollup = rollupRes.rows[0] ?? emptyRollup();
  const activeSessions = sessionsRes.rows[0]?.active_sessions ?? 0;

  const elements = bucketize(elementsRes.rows, ["fire", "water", "earth", "air"]);
  const modalities = bucketize(modalitiesRes.rows, ["cardinal", "fixed", "mutable"]);

  const sunSignMap = new Map<string, number>();
  for (const sign of ZODIAC_SIGNS) sunSignMap.set(sign, 0);
  for (const row of sunSignsRes.rows) {
    if (!row.bucket) continue;
    const key = row.bucket.toLowerCase();
    if (sunSignMap.has(key)) {
      sunSignMap.set(key, row.count);
    }
  }
  const sunSigns: SignDistribution[] = Array.from(sunSignMap.entries()).map(
    ([sign, count]) => ({
      sign: sign.charAt(0).toUpperCase() + sign.slice(1),
      count,
    }),
  );

  const medianRaw = medianRes.rows[0]?.median_minutes;
  const medianMinutesToComplete =
    medianRaw !== null && medianRaw !== undefined
      ? Math.round(Number.parseFloat(medianRaw))
      : null;

  const completed = rollup.onboarded;
  const pending = rollup.pending_onboarding;
  const totalForRate = completed + pending;

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      all: rollup.total,
      humans: rollup.humans,
      agents: rollup.agents,
      active: rollup.active,
      admins: rollup.admins,
    },
    signups: {
      last24h: rollup.signups_24h,
      last7d: rollup.signups_7d,
      last30d: rollup.signups_30d,
      trend: fillSignupTrend(trendRes.rows),
    },
    activity: {
      activeIn24h: rollup.active_24h,
      activeIn7d: rollup.active_7d,
      activeIn30d: rollup.active_30d,
      neverLoggedIn: rollup.never_logged_in,
      dormantOver30d: rollup.dormant_30d,
      activeSessions,
    },
    onboarding: {
      completed,
      pending,
      completionRate: totalForRate > 0 ? completed / totalForRate : 0,
      completedLast7d: rollup.onboarded_7d,
      medianMinutesToComplete: Number.isFinite(medianMinutesToComplete)
        ? medianMinutesToComplete
        : null,
    },
    tiers: {
      free: rollup.free,
      premium: rollup.premium,
      admin: rollup.admins,
    },
    elements: {
      fire: elements.fire ?? 0,
      water: elements.water ?? 0,
      earth: elements.earth ?? 0,
      air: elements.air ?? 0,
      unknown: elements.__unknown ?? 0,
    },
    modalities: {
      cardinal: modalities.cardinal ?? 0,
      fixed: modalities.fixed ?? 0,
      mutable: modalities.mutable ?? 0,
      unknown: modalities.__unknown ?? 0,
    },
    sunSigns,
  };
}

function bucketize<T extends string>(
  rows: Array<CountRow<string>>,
  known: readonly T[],
): Record<T | "__unknown", number> {
  const out = { __unknown: 0 } as Record<T | "__unknown", number>;
  for (const k of known) out[k] = 0;
  for (const row of rows) {
    const key = (row.bucket ?? "").toLowerCase() as T;
    if (known.includes(key)) {
      out[key] = row.count;
    } else {
      out.__unknown += row.count;
    }
  }
  return out;
}

function fillSignupTrend(
  rows: Array<{ day: string; count: number }>,
): SignupTrendPoint[] {
  const byDay = new Map<string, number>();
  for (const row of rows) byDay.set(row.day, row.count);

  const out: SignupTrendPoint[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const day = d.toISOString().slice(0, 10);
    out.push({ day, count: byDay.get(day) ?? 0 });
  }
  return out;
}

function emptyRollup(): RollupRow {
  return {
    total: 0,
    humans: 0,
    agents: 0,
    active: 0,
    admins: 0,
    signups_24h: 0,
    signups_7d: 0,
    signups_30d: 0,
    active_24h: 0,
    active_7d: 0,
    active_30d: 0,
    never_logged_in: 0,
    dormant_30d: 0,
    onboarded: 0,
    pending_onboarding: 0,
    onboarded_7d: 0,
    premium: 0,
    free: 0,
  };
}
