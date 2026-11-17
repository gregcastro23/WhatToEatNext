/**
 * Visits for the admin Live Activity feed — one event per visitor session
 * (not per page view, which would drown every other category), read from
 * page_views (migrations 86 + 100). Server-only.
 *
 * @file src/services/liveActivityVisits.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { isMissingColumn, isMissingRelation } from "@/lib/database/pgErrors";
import type { ActivityEvent } from "@/services/liveActivityService";

interface VisitRow {
  sid: string;
  first_at: Date;
  last_at: Date;
  pages: number;
  duration_ms?: number | null;
  paths?: string[] | null;
  ref_tag?: string | null;
  visitor_hash?: string | null;
  path: string;
  referrer_host: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  browser: string | null;
  os: string | null;
  device_type: string;
  user_id: string | null;
  email: string | null;
  name: string | null;
  is_agent: boolean | null;
}

function fmtDurationShort(ms: number): string {
  if (ms < 1_000) return "";
  const sec = Math.round(ms / 1_000);
  if (sec < 60) return ` · ${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return rem > 0 ? ` · ${min}m ${rem}s` : ` · ${min}m`;
}

function dedupeConsecutive(paths: string[]): string[] {
  const out: string[] = [];
  for (const p of paths) {
    if (out[out.length - 1] !== p) out.push(p);
  }
  return out;
}

function describe(r: VisitRow, totalDurationMs: number, trail: string[]): string {
  const shortId = (r.visitor_hash ?? r.sid).slice(0, 6).toLowerCase();
  const whoTag = r.user_id ? "" : ` (#${shortId})`;
  const where = [r.city, r.region, r.country].filter((p): p is string => p !== null && p !== "").join(", ");
  const from = r.referrer_host ? ` via ${r.referrer_host}` : "";
  const ref = r.ref_tag ? ` [ref:${r.ref_tag}]` : "";
  const trailPreview =
    trail.length > 1
      ? `${trail.slice(0, 3).join(" → ")}${trail.length > 3 ? ` (+${trail.length - 3})` : ""}`
      : r.path;
  const pages = r.pages > 1 ? ` · ${r.pages} pages` : "";
  const dur = fmtDurationShort(totalDurationMs);
  return `Visit${whoTag}${where ? ` from ${where}` : ""} — ${trailPreview}${from}${ref}${pages}${dur}`;
}

function toEvent(r: VisitRow): ActivityEvent {
  const spanMs = Math.max(0, new Date(r.last_at).getTime() - new Date(r.first_at).getTime());
  const totalDurationMs = Math.max(Number(r.duration_ms ?? 0), spanMs);
  const trail = dedupeConsecutive(Array.isArray(r.paths) && r.paths.length > 0 ? r.paths : [r.path]);
  const shortVisitor = (r.visitor_hash ?? r.sid).slice(0, 6).toLowerCase();

  return {
    id: `visit:${r.sid}`,
    at: new Date(r.last_at).toISOString(),
    category: "visit",
    type: r.user_id ? "signed_in_visit" : "anonymous_visit",
    description: describe(r, totalDurationMs, trail),
    status: "info",
    actor:
      r.user_id && r.email
        ? { userId: r.user_id, email: r.email, name: r.name, isAgent: r.is_agent === true }
        : null,
    context: {
      sessionKey: r.sid,
      visitorHash: r.visitor_hash ?? r.sid,
      shortVisitor,
      pages: r.pages,
      paths: trail,
      durationMs: totalDurationMs,
      refTag: r.ref_tag ?? null,
      referrerHost: r.referrer_host,
      location: [r.city, r.region, r.country].filter(Boolean).join(", ") || null,
      firstAt: new Date(r.first_at).toISOString(),
      lastAt: new Date(r.last_at).toISOString(),
      device: [r.browser, r.os].filter(Boolean).join(" on ") || r.device_type,
    },
  };
}

function buildVisitsSql(windowHours: number, limit: number, baseline: boolean): string {
  if (baseline) {
    return `WITH s AS (
         SELECT COALESCE(session_id, visitor_hash) AS sid, MIN(at) AS first_at, MAX(at) AS last_at,
                COUNT(*)::int AS pages, ARRAY_AGG(path ORDER BY at ASC) AS paths
           FROM page_views
          WHERE at > NOW() - INTERVAL '${windowHours} hours' AND NOT is_bot AND path <> '/admin' AND path NOT LIKE '/admin/%'
          GROUP BY 1 ORDER BY MAX(at) DESC LIMIT ${limit})
       SELECT s.sid, s.first_at, s.last_at, s.pages, s.paths,
              f.visitor_hash, f.path, f.referrer_host, f.city, f.region, f.country,
              f.browser, f.os, f.device_type, f.user_id, u.email, COALESCE(up.name, u.name) AS name, u.is_agent
         FROM s
         JOIN LATERAL (SELECT * FROM page_views p WHERE COALESCE(p.session_id, p.visitor_hash) = s.sid AND p.at = s.first_at AND NOT p.is_bot LIMIT 1) f ON true
         LEFT JOIN users u ON u.id::text = f.user_id LEFT JOIN user_profiles up ON up.user_id = u.id
        ORDER BY s.last_at DESC`;
  }
  return `WITH s AS (
       SELECT COALESCE(session_id, visitor_hash) AS sid, MIN(at) AS first_at, MAX(COALESCE(last_seen_at, at)) AS last_at,
              COUNT(*)::int AS pages, SUM(COALESCE(duration_ms, 0))::int AS duration_ms,
              ARRAY_AGG(path ORDER BY at ASC) AS paths, MAX(ref_tag) AS ref_tag
         FROM page_views
        WHERE at > NOW() - INTERVAL '${windowHours} hours' AND NOT is_bot AND path <> '/admin' AND path NOT LIKE '/admin/%'
        GROUP BY 1 ORDER BY MAX(COALESCE(last_seen_at, at)) DESC LIMIT ${limit})
     SELECT s.sid, s.first_at, s.last_at, s.pages, s.duration_ms, s.paths, s.ref_tag,
            f.visitor_hash, f.path, f.referrer_host, f.city, f.region, f.country,
            f.browser, f.os, f.device_type, f.user_id, u.email, COALESCE(up.name, u.name) AS name, u.is_agent
       FROM s
       JOIN LATERAL (SELECT * FROM page_views p WHERE COALESCE(p.session_id, p.visitor_hash) = s.sid AND p.at = s.first_at AND NOT p.is_bot LIMIT 1) f ON true
       LEFT JOIN users u ON u.id::text = f.user_id LEFT JOIN user_profiles up ON up.user_id = u.id
      ORDER BY s.last_at DESC`;
}

/** Missing table (migration 86 not yet applied) → no visits, not a failed feed. */
export async function readVisits(windowHours: number, limit: number): Promise<ActivityEvent[]> {
  try {
    const res = await executeQuery<VisitRow & Record<string, unknown>>(
      buildVisitsSql(windowHours, limit, false),
    ).catch(async (err: unknown) => {
      if (!isMissingColumn(err)) throw err;
      return executeQuery<VisitRow & Record<string, unknown>>(
        buildVisitsSql(windowHours, limit, true),
      );
    });
    return res.rows.map(toEvent);
  } catch (err) {
    if (isMissingRelation(err)) return [];
    throw err;
  }
}
