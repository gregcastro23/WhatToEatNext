/**
 * Visits for the admin Live Activity feed — one event per visitor session
 * (not per page view, which would drown every other category), read from
 * page_views (migration 86). Server-only.
 *
 * @file src/services/liveActivityVisits.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { isMissingRelation } from "@/lib/database/pgErrors";
import type { ActivityEvent } from "@/services/liveActivityService";

interface VisitRow {
  sid: string;
  first_at: Date;
  last_at: Date;
  pages: number;
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

function describe(r: VisitRow): string {
  const where = [r.city, r.region, r.country].filter((p): p is string => p !== null && p !== "").join(", ");
  const from = r.referrer_host ? ` via ${r.referrer_host}` : "";
  const pages = r.pages > 1 ? ` · ${r.pages} pages` : "";
  return `Visit${where ? ` from ${where}` : ""} — landed on ${r.path}${from}${pages}`;
}

function toEvent(r: VisitRow): ActivityEvent {
  return {
    id: `visit:${r.sid}`,
    at: new Date(r.first_at).toISOString(),
    category: "visit",
    type: r.user_id ? "signed_in_visit" : "anonymous_visit",
    description: describe(r),
    status: "info",
    actor:
      r.user_id && r.email
        ? { userId: r.user_id, email: r.email, name: r.name, isAgent: r.is_agent === true }
        : null,
    context: {
      pages: r.pages,
      lastAt: new Date(r.last_at).toISOString(),
      device: [r.browser, r.os].filter(Boolean).join(" on ") || r.device_type,
    },
  };
}

/** Missing table (migration 86 not yet applied) → no visits, not a failed feed. */
export async function readVisits(windowHours: number, limit: number): Promise<ActivityEvent[]> {
  try {
    const res = await executeQuery<VisitRow & Record<string, unknown>>(
      `WITH s AS (
         SELECT COALESCE(session_id, visitor_hash) AS sid, MIN(at) AS first_at, MAX(at) AS last_at, COUNT(*)::int AS pages
           FROM page_views
          WHERE at > NOW() - INTERVAL '${windowHours} hours' AND NOT is_bot
          GROUP BY 1 ORDER BY MIN(at) DESC LIMIT ${limit})
       SELECT s.sid, s.first_at, s.last_at, s.pages, f.path, f.referrer_host, f.city, f.region, f.country,
              f.browser, f.os, f.device_type, f.user_id, u.email, COALESCE(up.name, u.name) AS name, u.is_agent
         FROM s
         JOIN LATERAL (SELECT * FROM page_views p
                        WHERE COALESCE(p.session_id, p.visitor_hash) = s.sid AND p.at = s.first_at AND NOT p.is_bot
                        LIMIT 1) f ON true
         LEFT JOIN users u ON u.id::text = f.user_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
        ORDER BY s.first_at DESC`,
    );
    return res.rows.map(toEvent);
  } catch (err) {
    if (isMissingRelation(err)) return [];
    throw err;
  }
}
