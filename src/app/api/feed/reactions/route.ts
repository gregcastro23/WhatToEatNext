/**
 * GET /api/feed/reactions?eventIds=a,b,c — per-viewer reaction bootstrap.
 *
 * Returns the kinds the AUTHENTICATED viewer has given on each requested event:
 *   { success, viewerKinds: { [eventId]: string[] } }
 *
 * This endpoint exists because per-viewer reaction state cannot ride the
 * shared-cached GET /api/feed (which is viewer-independent by design). The feed
 * page calls this once per refresh with the visible UUID event ids and threads
 * viewerKinds down into each engagement bar. Anonymous viewers get an empty map.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_EVENT_IDS = 100;

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  // Anonymous → empty map (no per-viewer state, and no work for the DB).
  if (!userId) {
    return NextResponse.json({ success: true, viewerKinds: {} });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "feed-reactions-bootstrap", identifier: userId });
  if (!rl.allowed) return rl.response!;

  const raw = new URL(request.url).searchParams.get("eventIds") ?? "";
  const eventIds = Array.from(
    new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => UUID.test(s)),
    ),
  ).slice(0, MAX_EVENT_IDS);

  if (eventIds.length === 0) {
    return NextResponse.json({ success: true, viewerKinds: {} });
  }

  try {
    const res = await executeQuery<{ event_id: string; kind: string }>(
      `SELECT event_id, kind FROM feed_reactions
        WHERE user_id = $1 AND event_id = ANY($2::uuid[])`,
      [userId, eventIds],
    );
    const viewerKinds: Record<string, string[]> = {};
    for (const row of res.rows) {
      (viewerKinds[row.event_id] ??= []).push(row.kind);
    }
    return NextResponse.json({ success: true, viewerKinds });
  } catch (error) {
    console.error("[feed/reactions] bootstrap failed:", error);
    // Fail-open: an empty map just renders every bar unlit; local cache backfills.
    return NextResponse.json({ success: true, viewerKinds: {} });
  }
}
