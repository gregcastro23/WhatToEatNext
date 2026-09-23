/**
 * Human growth — signups, engagement, retention, activation. Server-only.
 *
 * The users table is overwhelmingly agent accounts, so every number here is
 * HUMANS ONLY (see userGrowthQueries for the definition and the activity
 * union). The sources that make up "active" are returned in
 * `activitySources` so the page can say exactly what the word covers.
 *
 * Each query degrades on its own; `live` is false and `errors` names the
 * failed ones, so a missing number is never shown as a measured zero.
 *
 * @file src/services/admin/userGrowthService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import {
  activityCte,
  ACTIVITY_DAYS,
  COHORT_WEEKS,
  pageViewsAvailable,
  SERIES_DAYS,
  SQL,
  TZ,
  type FunnelRow,
  type MostActiveRow,
  type RecentSignupRow,
} from "@/services/admin/userGrowthQueries";

export interface GrowthPayload {
  generatedAt: string;
  live: boolean;
  errors: string[];
  activitySources: string[];
  population: { humans: number; agents: number };
  engagement: { dau: number; wau: number; mau: number; stickiness: number | null };
  series: Array<{ day: string; signups: number; active: number }>;
  /** retained[k] = share of the cohort active in week k after signup; null = that week has not happened. */
  cohorts: Array<{ week: string; size: number; retained: Array<number | null> }>;
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

type Runner = <T extends Record<string, unknown>>(label: string, sql: string) => Promise<T[] | null>;

function makeRunner(errors: string[]): Runner {
  return async <T extends Record<string, unknown>>(label: string, sql: string): Promise<T[] | null> => {
    try {
      return (await executeQuery<T>(sql)).rows;
    } catch (err) {
      errors.push(`${label}: ${err instanceof Error ? err.message : "query failed"}`);
      _logger.error(`[admin/growth] ${label} failed:`, err);
      return null;
    }
  };
}

function nyDayKeys(days: number, now: Date): string[] {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) keys.push(fmt.format(new Date(now.getTime() - i * 86_400_000)));
  return [...new Set(keys)];
}

interface DayRow {
  day: string;
  n: number;
}

function buildSeries(active: DayRow[] | null, signups: DayRow[] | null, now: Date): GrowthPayload["series"] {
  const activeMap = new Map((active ?? []).map((r) => [r.day, Number(r.n)]));
  const signupMap = new Map((signups ?? []).map((r) => [r.day, Number(r.n)]));
  return nyDayKeys(SERIES_DAYS, now).map((day) => ({
    day,
    signups: signupMap.get(day) ?? 0,
    active: activeMap.get(day) ?? 0,
  }));
}

interface CohortActivityRow {
  week: string;
  k: number;
  active: number;
}

function buildCohorts(
  sizes: Array<{ week: string; size: number }> | null,
  activity: CohortActivityRow[] | null,
  now: Date,
): GrowthPayload["cohorts"] {
  const activeBy = new Map<string, number>();
  for (const row of activity ?? []) activeBy.set(`${row.week}|${Number(row.k)}`, Number(row.active));
  return (sizes ?? [])
    .map((r) => ({ week: r.week, size: Number(r.size) }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .map(({ week, size }) => {
      const elapsed = Math.floor((now.getTime() - new Date(`${week}T12:00:00Z`).getTime()) / (7 * 86_400_000));
      const retained = Array.from({ length: COHORT_WEEKS }, (_, k) =>
        k > elapsed || size === 0 ? null : (activeBy.get(`${week}|${k}`) ?? 0) / size,
      );
      return { week, size, retained };
    });
}

function buildFunnel(f: FunnelRow | undefined): GrowthPayload["funnel"] {
  if (!f) return [];
  return [
    { step: "Signed up", count: Number(f.signed_up), detail: "human accounts, all time" },
    { step: "Onboarded", count: Number(f.onboarded), detail: "birth chart completed" },
    { step: "Activated", count: Number(f.activated), detail: "any interaction or ledger movement beyond the welcome grant" },
    { step: "Returned", count: Number(f.returned), detail: `active again ≥1 day after signup (last ${ACTIVITY_DAYS}d of activity)` },
    { step: "Paying", count: Number(f.premium), detail: "active Stripe-backed subscription" },
  ];
}

const iso = (d: Date | null): string | null => (d ? new Date(d).toISOString() : null);

function mapRecent(rows: RecentSignupRow[] | null): GrowthPayload["recentSignups"] {
  return (rows ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    createdAt: new Date(r.created_at).toISOString(),
    onboarded: r.onboarded === true,
    lastActiveAt: iso(r.last_active),
    events7d: Number(r.events_7d),
  }));
}

function mapMostActive(rows: MostActiveRow[] | null): GrowthPayload["mostActive"] {
  return (rows ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    events30d: Number(r.events),
    lastActiveAt: iso(r.last_active),
  }));
}

function engagementOf(rows: Array<{ dau: number; wau: number; mau: number }> | null): GrowthPayload["engagement"] {
  const [e] = rows ?? [];
  const mau = Number(e?.mau ?? 0);
  const dau = Number(e?.dau ?? 0);
  return { dau, wau: Number(e?.wau ?? 0), mau, stickiness: e && mau > 0 ? dau / mau : null };
}

function activitySources(withPageViews: boolean): string[] {
  const base = ["auth_events (success)", "token_transactions", "user_interactions", "users.last_login_at"];
  return withPageViews ? [...base, "page_views (signed-in)"] : base;
}

export async function getUserGrowth(): Promise<GrowthPayload> {
  const errors: string[] = [];
  const run = makeRunner(errors);
  const withPageViews = await pageViewsAvailable();
  const cte = activityCte(withPageViews);
  const now = new Date();
  const [population, engagement, active, signups, sizes, cohortActivity, funnel, recent, most] = await Promise.all([
    run<{ humans: number; agents: number }>("population", SQL.population()),
    run<{ dau: number; wau: number; mau: number }>("engagement", SQL.engagement(cte)),
    run<DayRow & Record<string, unknown>>("active series", SQL.activeSeries(cte)),
    run<DayRow & Record<string, unknown>>("signup series", SQL.signupSeries()),
    run<{ week: string; size: number }>("cohort sizes", SQL.cohortSizes()),
    run<CohortActivityRow & Record<string, unknown>>("cohort activity", SQL.cohortActivity(cte)),
    run<FunnelRow & Record<string, unknown>>("funnel", SQL.funnel(cte)),
    run<RecentSignupRow & Record<string, unknown>>("recent signups", SQL.recentSignups(cte)),
    run<MostActiveRow & Record<string, unknown>>("most active", SQL.mostActive(cte)),
  ]);
  return {
    generatedAt: now.toISOString(),
    live: errors.length === 0,
    errors,
    activitySources: activitySources(withPageViews),
    population: { humans: Number(population?.[0]?.humans ?? 0), agents: Number(population?.[0]?.agents ?? 0) },
    engagement: engagementOf(engagement),
    series: buildSeries(active, signups, now),
    cohorts: buildCohorts(sizes, cohortActivity, now),
    funnel: buildFunnel(funnel?.[0]),
    recentSignups: mapRecent(recent),
    mostActive: mapMostActive(most),
  };
}
