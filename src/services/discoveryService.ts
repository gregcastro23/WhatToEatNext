/**
 * Discovery service (docs/plans/pr6-discovery-mobile-plan.md §2–3).
 *
 * Two read surfaces:
 *   - `discoverTables` — public/commensals tables a viewer may see, with
 *     compatibility %, near-me haversine, keyset pagination.
 *   - `discoverPeople` — a paginated people + agents directory with follow
 *     state, mutual-commensal counts, and compatibility %.
 *
 * PRIVACY INVARIANTS (the plan is emphatic):
 *   - Home tables NEVER carry coordinates (DB CHECK) and never surface in geo
 *     results; discovery responses never expose venue coordinates or
 *     venue_address, and never a member list.
 *   - The people directory never returns email addresses; display names fall
 *     back to the email local-part only.
 *
 * Compatibility reuses the shared cosine (`elementalCosineHarmony`) over the
 * viewer's elemental balance (loaded ONCE per request) and each row's
 * precomputed balance extracted in SQL — never a per-row full-chart compute.
 * Block enforcement and the commensals-visibility gate mirror
 * `tableDatabaseService.isBlockedPair` / `hasAcceptedCommensalship` in SQL.
 *
 * @file src/services/discoveryService.ts
 */

import { executeQuery } from "@/lib/database/connection";
import { _logger } from "@/lib/logger";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { haversineMeters } from "@/services/restaurantDiscoveryService";
import { elementalCosineHarmony } from "@/utils/elemental/harmony";
import { safeJsonParse } from "@/utils/typeGuards";

// ─── Shared ──────────────────────────────────────────────────────────────

/** Bounded candidate windows for the rail / geo / match paths — the plan caps
 * these so a request never scores an unbounded set (§2). */
const TABLE_CANDIDATE_WINDOW = 60;
const PEOPLE_CANDIDATE_WINDOW = 200;

const ELEMENTS = ["Fire", "Water", "Earth", "Air"] as const;

function clampInt(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value == null || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** jsonb columns come back parsed by the driver, but tolerate a string too. */
function readBalance(value: unknown): Record<string, number> | null {
  const obj = typeof value === "string" ? safeJsonParse<Record<string, number>>(value, null as never) : value;
  if (!obj || typeof obj !== "object") return null;
  const rec = obj as Record<string, unknown>;
  const out: Record<string, number> = {};
  let any = false;
  for (const el of ELEMENTS) {
    const n = rec[el];
    if (typeof n === "number" && Number.isFinite(n)) {
      out[el] = n;
      any = true;
    }
  }
  return any ? out : null;
}

/** round(100 * cosine) or null when either side has no usable balance. */
function compatibilityPct(
  viewerBalance: Record<string, number> | null,
  rowBalance: Record<string, number> | null,
): number | null {
  if (!viewerBalance || !rowBalance) return null;
  return Math.round(100 * elementalCosineHarmony(viewerBalance, rowBalance));
}

/** Positional-parameter builder — pushes a value and returns its `$n` token. */
function makeParams() {
  const values: unknown[] = [];
  return {
    values,
    add(value: unknown): string {
      values.push(value);
      return `$${values.length}`;
    },
  };
}

function encodeCursor(a: string, b: string): string {
  return Buffer.from(`${a}|${b}`, "utf8").toString("base64url");
}

function decodeCursor(cursor: string | undefined): { a: string; b: string } | null {
  if (!cursor) return null;
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const idx = raw.indexOf("|");
    if (idx <= 0) return null;
    return { a: raw.slice(0, idx), b: raw.slice(idx + 1) };
  } catch {
    return null;
  }
}

const iso = (value: unknown): string =>
  value instanceof Date ? value.toISOString() : String(value);

// ─── Tables discovery ───────────────────────────────────────────────────

export type DiscoverTablesSort = "soonest" | "match" | "distance";

export interface DiscoverTablesParams {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  element?: string;
  openSeats?: boolean;
  windowDays?: number;
  q?: string;
  sort?: DiscoverTablesSort;
  cursor?: string;
  limit?: number;
}

export interface DiscoverTableCard {
  id: string;
  title: string;
  scheduledAt: string;
  status: string;
  venue: { type: string; name?: string };
  distanceKm?: number;
  photoUrl?: string;
  host: { id: string; name: string; avatarUrl: string | null; dominantElement: string | null };
  joinedCount: number;
  seatCap: number | null;
  seatsLeft: number | null;
  compatibility: number | null;
  dominantElement: string | null;
}

export interface DiscoverTablesResult {
  tables: DiscoverTableCard[];
  nextCursor: string | null;
}

interface TableRow {
  id: string;
  title: string;
  scheduled_at: unknown;
  status: string;
  venue_type: string;
  venue_name: string | null;
  venue_lat: number | null;
  venue_lng: number | null;
  seat_cap: number | null;
  composite_balance: unknown;
  composite_dominant: string | null;
  host_id: string;
  host_name: string | null;
  host_avatar: string | null;
  host_dominant: string | null;
  joined_count: number | string;
  photo_url: string | null;
}

/**
 * Discover public / commensals tables visible to `viewerId` (null = anon).
 * Anon sees public tables only, with `compatibility: null`.
 */
export async function discoverTables(
  params: DiscoverTablesParams,
  viewerId: string | null,
): Promise<DiscoverTablesResult> {
  const limit = clampInt(params.limit, 20, 1, 40);
  const windowDays = clampInt(params.windowDays, 30, 1, 90);
  const radiusKm = clampInt(params.radiusKm, 25, 1, 100);
  const geo =
    params.lat != null &&
    params.lng != null &&
    Number.isFinite(params.lat) &&
    Number.isFinite(params.lng) &&
    Math.abs(params.lat) <= 90 &&
    Math.abs(params.lng) <= 180;

  // Resolve the effective ordering + pagination mode. Keyset pagination applies
  // ONLY to the non-geo soonest list (the infinite-scroll main list); geo /
  // match / distance run over a bounded candidate window and slice in JS.
  let orderBy: DiscoverTablesSort = "soonest";
  if (params.sort === "match" && viewerId) orderBy = "match";
  else if (params.sort === "distance" && geo) orderBy = "distance";
  const useKeyset = !geo && orderBy === "soonest";

  const p = makeParams();
  const where: string[] = [
    "t.status IN ('planned','live')",
    "t.scheduled_at >= NOW() - INTERVAL '3 hours'",
    `t.scheduled_at <= NOW() + (${p.add(windowDays)}::int * INTERVAL '1 day')`,
  ];

  // Visibility + block + self/member exclusion.
  if (viewerId) {
    const v = p.add(viewerId);
    where.push(
      `(t.visibility = 'public' OR (t.visibility = 'commensals' AND EXISTS (
         SELECT 1 FROM commensalships c
          WHERE c.status = 'accepted'
            AND ((c.requester_id = t.host_id AND c.addressee_id = ${v})
              OR (c.requester_id = ${v} AND c.addressee_id = t.host_id)))))`,
    );
    where.push(
      `NOT EXISTS (SELECT 1 FROM commensalships b
         WHERE b.status = 'blocked'
           AND ((b.requester_id = t.host_id AND b.addressee_id = ${v})
             OR (b.requester_id = ${v} AND b.addressee_id = t.host_id)))`,
    );
    where.push(`t.host_id <> ${v}`);
    where.push(
      `NOT EXISTS (SELECT 1 FROM table_members m2 WHERE m2.table_id = t.id AND m2.user_id = ${v})`,
    );
  } else {
    where.push("t.visibility = 'public'");
  }

  if (params.q && params.q.trim()) {
    const like = `%${params.q.trim()}%`;
    where.push(`(t.title ILIKE ${p.add(like)} OR t.venue_name ILIKE ${p.add(like)})`);
  }
  if (params.element && ELEMENTS.includes(params.element as (typeof ELEMENTS)[number])) {
    where.push(`(t.composite_snapshot->'compositeChart'->>'dominantElement') = ${p.add(params.element)}`);
  }

  if (geo) {
    const lat = params.lat as number;
    const lng = params.lng as number;
    const latDelta = radiusKm / 111.045;
    const cos = Math.max(0.01, Math.cos((lat * Math.PI) / 180));
    const lngDelta = radiusKm / (111.045 * cos);
    where.push(`t.venue_lat BETWEEN ${p.add(lat - latDelta)} AND ${p.add(lat + latDelta)}`);
    where.push(`t.venue_lng BETWEEN ${p.add(lng - lngDelta)} AND ${p.add(lng + lngDelta)}`);
  }

  if (params.openSeats) {
    where.push(
      "((t.seat_cap IS NULL AND jc.joined_count < 24) OR (t.seat_cap IS NOT NULL AND jc.joined_count < t.seat_cap))",
    );
  }

  if (useKeyset) {
    const cur = decodeCursor(params.cursor);
    if (cur) {
      where.push(`(t.scheduled_at, t.id) > (${p.add(cur.a)}::timestamptz, ${p.add(cur.b)}::uuid)`);
    }
  }

  const fetchLimit = useKeyset ? limit + 1 : TABLE_CANDIDATE_WINDOW;
  const sql = `
    SELECT t.id, t.title, t.scheduled_at, t.status, t.venue_type, t.venue_name,
           t.venue_lat, t.venue_lng, t.seat_cap,
           t.composite_snapshot->'compositeChart'->'elementalBalance' AS composite_balance,
           t.composite_snapshot->'compositeChart'->>'dominantElement' AS composite_dominant,
           hu.id AS host_id,
           COALESCE(hup.name, hu.name) AS host_name,
           COALESCE(hup.avatar_url, hu.image) AS host_avatar,
           hup.dominant_element AS host_dominant,
           jc.joined_count AS joined_count,
           (SELECT tp.url FROM table_photos tp WHERE tp.table_id = t.id ORDER BY tp.created_at ASC LIMIT 1) AS photo_url
      FROM tables t
      JOIN users hu ON hu.id = t.host_id
      LEFT JOIN user_profiles hup ON hup.user_id = hu.id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS joined_count
          FROM table_members m WHERE m.table_id = t.id AND m.rsvp_status = 'joined'
      ) jc ON true
     WHERE ${where.join("\n       AND ")}
     ORDER BY t.scheduled_at ASC, t.id ASC
     LIMIT ${p.add(fetchLimit)}`;

  let rows: TableRow[] = [];
  try {
    const result = await executeQuery<TableRow>(sql, p.values);
    rows = result.rows;
  } catch (error) {
    _logger.error("discoverTables query failed:", error);
    return { tables: [], nextCursor: null };
  }

  const viewerBalance = viewerId
    ? ((await commensalDatabase.getUserElementalProfile(viewerId)) as Record<string, number> | null)
    : null;

  const cards: DiscoverTableCard[] = rows.map((row) => {
    const joinedCount = Number(row.joined_count) || 0;
    const seatCap = row.seat_cap == null ? null : Number(row.seat_cap);
    const seatsLeft = seatCap == null ? null : Math.max(0, seatCap - joinedCount);
    // Home venues never expose a name or geo — render as a bare {type:'home'}.
    const isHome = row.venue_type === "home";
    let distanceKm: number | undefined;
    if (geo && row.venue_lat != null && row.venue_lng != null) {
      const meters = haversineMeters(
        params.lat as number,
        params.lng as number,
        Number(row.venue_lat),
        Number(row.venue_lng),
      );
      distanceKm = Math.round((meters / 1000) * 10) / 10;
    }
    return {
      id: String(row.id),
      title: row.title,
      scheduledAt: iso(row.scheduled_at),
      status: row.status,
      venue: isHome ? { type: "home" } : { type: row.venue_type, name: row.venue_name ?? undefined },
      distanceKm,
      photoUrl: row.photo_url ?? undefined,
      host: {
        id: String(row.host_id),
        name: row.host_name || "A host",
        avatarUrl: row.host_avatar ?? null,
        dominantElement: row.host_dominant ?? null,
      },
      joinedCount,
      seatCap,
      seatsLeft,
      compatibility: viewerId ? compatibilityPct(viewerBalance, readBalance(row.composite_balance)) : null,
      dominantElement: row.composite_dominant ?? null,
    };
  });

  // Geo radius filter (exact haversine) — home tables have NULL coords so they
  // can never appear here.
  let filtered = geo ? cards.filter((c) => c.distanceKm != null && c.distanceKm <= radiusKm) : cards;

  if (useKeyset) {
    const hasMore = filtered.length > limit;
    const page = filtered.slice(0, limit);
    const last = page[page.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(last.scheduledAt, last.id) : null;
    return { tables: page, nextCursor };
  }

  if (orderBy === "distance") {
    filtered = [...filtered].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else if (orderBy === "match") {
    filtered = [...filtered].sort((a, b) => {
      const av = a.compatibility ?? -1;
      const bv = b.compatibility ?? -1;
      if (bv !== av) return bv - av;
      return a.scheduledAt.localeCompare(b.scheduledAt);
    });
  }
  return { tables: filtered.slice(0, limit), nextCursor: null };
}

// ─── People discovery ───────────────────────────────────────────────────

export type DiscoverPeopleKind = "all" | "people" | "agents";
export type DiscoverPeopleSort = "recent" | "match";

export interface DiscoverPeopleParams {
  q?: string;
  kind?: DiscoverPeopleKind;
  element?: string;
  sort?: DiscoverPeopleSort;
  cursor?: string;
  limit?: number;
}

export interface DiscoverPersonCard {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  dominantElement: string | null;
  isAgent: boolean;
  compatibility: number | null;
  mutualCommensals: number;
  isCommensal: boolean;
  /** null when the follows table is unavailable (PR 4 not applied). */
  followState: "following" | "not_following" | null;
}

export interface DiscoverPeopleResult {
  people: DiscoverPersonCard[];
  nextCursor: string | null;
}

interface PersonRow {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  dominant_element: string | null;
  balance: unknown;
  is_agent: boolean;
  created_at: unknown;
  viewer_follows: boolean | null;
  is_commensal: boolean | null;
}

/**
 * Whether PR 4's `follows` table exists (it does on master). Probed per request
 * via a catalog lookup — `to_regclass` is a cheap constant-time system-catalog
 * read, and probing each call keeps follow-state degradation truthful in every
 * environment (rather than latching a stale answer for the process lifetime).
 */
async function hasFollowsTable(): Promise<boolean> {
  try {
    const res = await executeQuery<{ reg: string | null }>(
      "SELECT to_regclass('public.follows') AS reg",
    );
    return Boolean(res.rows[0]?.reg);
  } catch {
    return false;
  }
}

/**
 * Paginated people + agents directory. Auth required (the route enforces it).
 * Agents are first-class entries and ignore the discoverable opt-out.
 */
export async function discoverPeople(
  params: DiscoverPeopleParams,
  viewerId: string,
): Promise<DiscoverPeopleResult> {
  const limit = clampInt(params.limit, 24, 1, 48);
  const kind: DiscoverPeopleKind = params.kind ?? "all";
  const sort: DiscoverPeopleSort = params.sort === "match" ? "match" : "recent";
  const useKeyset = sort === "recent";
  const withFollows = await hasFollowsTable();

  const p = makeParams();
  const viewer = p.add(viewerId);
  const where: string[] = [
    "u.is_active = true",
    `u.id <> ${viewer}`,
    `NOT EXISTS (SELECT 1 FROM commensalships b
       WHERE b.status = 'blocked'
         AND ((b.requester_id = u.id AND b.addressee_id = ${viewer})
           OR (b.requester_id = ${viewer} AND b.addressee_id = u.id)))`,
    // Opt-out: humans must be discoverable (default true); agents are content
    // and ignore the opt-out.
    "(COALESCE((u.preferences->>'discoverable')::boolean, true) = true OR COALESCE(u.is_agent, false) = true)",
  ];

  // is_agent is NOT NULL DEFAULT false (migration 23), so a bare comparison is
  // safe and stays textually distinct from the discoverable OR-clause above.
  if (kind === "people") where.push("u.is_agent = false");
  else if (kind === "agents") where.push("u.is_agent = true");

  if (params.q && params.q.trim().length >= 2) {
    const like = `%${params.q.trim()}%`;
    where.push(`(up.name ILIKE ${p.add(like)} OR u.name ILIKE ${p.add(like)})`);
  }
  if (params.element && ELEMENTS.includes(params.element as (typeof ELEMENTS)[number])) {
    where.push(`up.dominant_element = ${p.add(params.element)}`);
  }
  if (sort === "match") {
    // Kindred path scores only rows that carry a balance to compare against.
    where.push("up.natal_chart->'elementalBalance' IS NOT NULL");
  }

  if (useKeyset) {
    const cur = decodeCursor(params.cursor);
    if (cur) {
      where.push(`(u.created_at, u.id) < (${p.add(cur.a)}::timestamptz, ${p.add(cur.b)}::uuid)`);
    }
  }

  const followSelect = withFollows
    ? `EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ${viewer} AND f.followee_id = u.id) AS viewer_follows`
    : "NULL::boolean AS viewer_follows";

  const fetchLimit = useKeyset ? limit + 1 : PEOPLE_CANDIDATE_WINDOW;
  const sql = `
    SELECT u.id,
           COALESCE(up.name, u.name, split_part(u.email, '@', 1)) AS display_name,
           COALESCE(up.avatar_url, u.image) AS avatar_url,
           up.bio,
           up.dominant_element,
           up.natal_chart->'elementalBalance' AS balance,
           COALESCE(u.is_agent, false) AS is_agent,
           u.created_at,
           ${followSelect},
           EXISTS (SELECT 1 FROM commensalships c
             WHERE c.status = 'accepted'
               AND ((c.requester_id = ${viewer} AND c.addressee_id = u.id)
                 OR (c.requester_id = u.id AND c.addressee_id = ${viewer}))) AS is_commensal
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
     WHERE ${where.join("\n       AND ")}
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT ${p.add(fetchLimit)}`;

  let rows: PersonRow[] = [];
  try {
    const result = await executeQuery<PersonRow>(sql, p.values);
    rows = result.rows;
  } catch (error) {
    _logger.error("discoverPeople query failed:", error);
    return { people: [], nextCursor: null };
  }

  const viewerBalance =
    sort === "match"
      ? ((await commensalDatabase.getUserElementalProfile(viewerId)) as Record<string, number> | null)
      : null;
  const mutualCounts = await mutualCommensalCounts(viewerId, rows.map((r) => String(r.id)));

  const cards: DiscoverPersonCard[] = rows.map((row) => ({
    id: String(row.id),
    name: row.display_name || "An alchemist",
    avatarUrl: row.avatar_url ?? null,
    bio: row.bio ?? null,
    dominantElement: row.dominant_element ?? deriveDominant(readBalance(row.balance)),
    isAgent: row.is_agent === true,
    compatibility: sort === "match" ? compatibilityPct(viewerBalance, readBalance(row.balance)) : null,
    mutualCommensals: mutualCounts.get(String(row.id)) ?? 0,
    isCommensal: row.is_commensal === true,
    followState: withFollows ? (row.viewer_follows ? "following" : "not_following") : null,
  }));

  if (useKeyset) {
    const hasMore = cards.length > limit;
    const page = cards.slice(0, limit);
    const last = rows[page.length - 1];
    const nextCursor = hasMore && last ? encodeCursor(iso(last.created_at), String(last.id)) : null;
    return { people: page, nextCursor };
  }

  // match: sort by compatibility desc (unknowns last), stable by recency.
  const sorted = [...cards].sort((a, b) => (b.compatibility ?? -1) - (a.compatibility ?? -1));
  return { people: sorted.slice(0, limit), nextCursor: null };
}

function deriveDominant(balance: Record<string, number> | null): string | null {
  if (!balance) return null;
  let best: string | null = null;
  let bestVal = -Infinity;
  for (const el of ELEMENTS) {
    const v = balance[el] ?? 0;
    if (v > bestVal) {
      bestVal = v;
      best = el;
    }
  }
  return best;
}

/**
 * Mutual-commensal counts for a page of candidates, in ONE batched query:
 * load the viewer's accepted-partner set once, then a single aggregate over
 * the candidates' accepted edges intersected with that set. Never per-row
 * round-trips.
 */
async function mutualCommensalCounts(
  viewerId: string,
  candidateIds: string[],
): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (candidateIds.length === 0) return out;
  try {
    const partnersRes = await executeQuery<{ partner: string }>(
      `SELECT CASE WHEN requester_id = $1::uuid THEN addressee_id ELSE requester_id END AS partner
         FROM commensalships
        WHERE status = 'accepted'
          AND (requester_id = $1::uuid OR addressee_id = $1::uuid)`,
      [viewerId],
    );
    const viewerPartners = partnersRes.rows.map((r) => String(r.partner));
    if (viewerPartners.length === 0) return out;

    const res = await executeQuery<{ candidate: string; mutual: string | number }>(
      `SELECT x.candidate, COUNT(*)::int AS mutual
         FROM (
           SELECT CASE WHEN requester_id = ANY($1::uuid[]) THEN requester_id ELSE addressee_id END AS candidate,
                  CASE WHEN requester_id = ANY($1::uuid[]) THEN addressee_id ELSE requester_id END AS partner
             FROM commensalships
            WHERE status = 'accepted'
              AND (requester_id = ANY($1::uuid[]) OR addressee_id = ANY($1::uuid[]))
         ) x
        WHERE x.partner = ANY($2::uuid[])
        GROUP BY x.candidate`,
      [candidateIds, viewerPartners],
    );
    for (const r of res.rows) out.set(String(r.candidate), Number(r.mutual) || 0);
  } catch (error) {
    _logger.warn("mutualCommensalCounts failed (returning zeros):", error);
  }
  return out;
}
