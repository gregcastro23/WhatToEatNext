/**
 * POST /api/feed/react — spark a feed event (one reaction per user per event).
 *
 * The reaction ROW is the proof both invisible rewards hang off: the reactor's
 * `feed_reaction` and the poster's `work_resonated` are recognized HERE,
 * server-side, keyed to the reaction insert — a bare practice POST can't fake
 * either (both types are SERVER_ONLY in the practice catalog). Self-reactions
 * are rejected; duplicate reactions are quiet no-ops.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";
import { practiceRewardService } from "@/services/practiceRewardService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const KINDS = new Set(["spark", "fire", "water", "earth", "air"]);

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 30, bucket: "feed-react", identifier: userId });
  if (!rl.allowed) return rl.response!;

  let body: { eventId?: unknown; kind?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" && UUID.test(body.eventId) ? body.eventId : null;
  if (!eventId) {
    return NextResponse.json({ success: false, message: "eventId is required" }, { status: 400 });
  }
  const kind = typeof body.kind === "string" && KINDS.has(body.kind) ? body.kind : "spark";

  try {
    const eventRes = await executeQuery<{ actor_id: string }>(
      "SELECT actor_id FROM feed_events WHERE id = $1",
      [eventId],
    );
    const posterId = eventRes.rows[0]?.actor_id;
    if (!posterId) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }
    if (posterId === userId) {
      return NextResponse.json({ success: false, message: "Your own work already knows you made it." }, { status: 400 });
    }

    const ins = await executeQuery<{ id: string }>(
      `INSERT INTO feed_reactions (event_id, user_id, kind)
       VALUES ($1, $2, $3)
       ON CONFLICT ON CONSTRAINT uniq_feed_reaction DO NOTHING
       RETURNING id`,
      [eventId, userId, kind],
    );
    const isNew = ins.rows.length > 0;

    let reward: { tokenType: string; amount: number; hint: string } | null = null;
    if (isNew) {
      // Reactor's spark (once-ever per event, capped daily by the catalog).
      const reactorResult = await practiceRewardService.recognize(userId, "feed_reaction", eventId);
      if (reactorResult.rewarded && reactorResult.tokenType && reactorResult.amount && reactorResult.hint) {
        reward = { tokenType: reactorResult.tokenType, amount: reactorResult.amount, hint: reactorResult.hint };
      }
      // Poster's resonance (once-ever per event: the FIRST spark pays the
      // maker; catalog caps how many works can resonate per day).
      await practiceRewardService.recognize(posterId, "work_resonated", eventId);
    }

    const countRes = await executeQuery<{ n: string }>(
      "SELECT COUNT(*)::int AS n FROM feed_reactions WHERE event_id = $1",
      [eventId],
    );

    return NextResponse.json({
      success: true,
      reacted: true,
      alreadyReacted: !isNew,
      count: Number(countRes.rows[0]?.n ?? 0),
      reward,
    });
  } catch (error) {
    console.error("[feed/react] failed:", error);
    return NextResponse.json({ success: false, message: "Reaction failed" }, { status: 500 });
  }
}
