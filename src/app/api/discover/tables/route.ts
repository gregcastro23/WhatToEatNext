/**
 * GET /api/discover/tables
 *
 * Discover public / commensals tables (docs/plans/pr6-discovery-mobile-plan.md
 * §3). Auth OPTIONAL — anon sees public tables only with `compatibility: null`.
 *
 * Never exposes venue coordinates, venue_address, member lists, or home-venue
 * geo (privacy invariant enforced in discoveryService + the DB CHECK).
 *
 * Query params: lat, lng, radiusKm (default 25, max 100), element, openSeats,
 * windowDays (default 30), q, sort=soonest|match|distance (match auth-only,
 * distance needs lat/lng), cursor, limit (default 20, max 40).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import { discoverTables, type DiscoverTablesSort } from "@/services/discoveryService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Parse a finite float query param; empty/invalid → undefined (never 0). */
function floatParam(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw == null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const SORTS: readonly DiscoverTablesSort[] = ["soonest", "match", "distance"];

export async function GET(request: NextRequest) {
  try {
    const viewerId = await getUserIdFromRequest(request);

    // Authed users are paced per user id (60/min); anon per IP (20/min).
    const rl = viewerId
      ? await rateLimit(request, { window: 60_000, max: 60, bucket: "discover-tables", identifier: viewerId })
      : await rateLimit(request, { window: 60_000, max: 20, bucket: "discover-tables" });
    if (!rl.allowed) return rl.response!;

    const sp = request.nextUrl.searchParams;
    const sortRaw = sp.get("sort");
    const sort: DiscoverTablesSort = SORTS.includes(sortRaw as DiscoverTablesSort)
      ? (sortRaw as DiscoverTablesSort)
      : "soonest";

    const result = await discoverTables(
      {
        lat: floatParam(sp, "lat"),
        lng: floatParam(sp, "lng"),
        radiusKm: floatParam(sp, "radiusKm"),
        element: sp.get("element") ?? undefined,
        openSeats: sp.get("openSeats") === "true" || sp.get("openSeats") === "1",
        windowDays: floatParam(sp, "windowDays"),
        q: sp.get("q") ?? undefined,
        sort,
        cursor: sp.get("cursor") ?? undefined,
        limit: floatParam(sp, "limit"),
      },
      viewerId,
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[GET /api/discover/tables]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load tables", tables: [], nextCursor: null },
      { status: 500 },
    );
  }
}
