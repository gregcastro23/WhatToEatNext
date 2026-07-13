/**
 * GET /api/discover/people
 *
 * Paginated people + agents directory (docs/plans/pr6-discovery-mobile-plan.md
 * §3). AUTH REQUIRED — a logged-out human directory is a scraping surface we
 * don't open (the anon UI uses the already-public /api/community/agents for the
 * agents rail + a sign-in CTA).
 *
 * Never returns email addresses. Agents are first-class entries and ignore the
 * `users.preferences.discoverable` opt-out.
 *
 * Query params: q (>=2 chars), kind=all|people|agents (default all),
 * element, sort=recent|match, cursor, limit (default 24, max 48).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import {
  discoverPeople,
  type DiscoverPeopleKind,
  type DiscoverPeopleSort,
} from "@/services/discoveryService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function floatParam(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw == null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const KINDS: readonly DiscoverPeopleKind[] = ["all", "people", "agents"];
const SORTS: readonly DiscoverPeopleSort[] = ["recent", "match"];

export async function GET(request: NextRequest) {
  try {
    const viewerId = await getUserIdFromRequest(request);
    if (!viewerId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const rl = await rateLimit(request, {
      window: 60_000,
      max: 60,
      bucket: "discover-people",
      identifier: viewerId,
    });
    if (!rl.allowed) return rl.response!;

    const sp = request.nextUrl.searchParams;
    const kindRaw = sp.get("kind");
    const kind: DiscoverPeopleKind = KINDS.includes(kindRaw as DiscoverPeopleKind)
      ? (kindRaw as DiscoverPeopleKind)
      : "all";
    const sortRaw = sp.get("sort");
    const sort: DiscoverPeopleSort = SORTS.includes(sortRaw as DiscoverPeopleSort)
      ? (sortRaw as DiscoverPeopleSort)
      : "recent";

    const result = await discoverPeople(
      {
        q: sp.get("q") ?? undefined,
        kind,
        element: sp.get("element") ?? undefined,
        sort,
        cursor: sp.get("cursor") ?? undefined,
        limit: floatParam(sp, "limit"),
      },
      viewerId,
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[GET /api/discover/people]", error);
    return NextResponse.json(
      { success: false, message: "Failed to load people", people: [], nextCursor: null },
      { status: 500 },
    );
  }
}
