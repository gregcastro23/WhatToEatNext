/**
 * POST /api/feed/react — react to a feed event with an elemental kind
 * (spark | fire | water | earth | air), TOGGLEABLE.
 *
 * One row per (event, user, kind) — the constraint is uniq_feed_reaction_kind
 * (migration 66 widened it from (event,user) so a dish can be both Fire and
 * Earth). Behavior is a per-kind toggle: the first tap INSERTs, a second tap on
 * the same kind DELETEs the viewer's own row.
 *
 * The reaction ROW is the proof both invisible rewards hang off: the reactor's
 * `feed_reaction` and the poster's `work_resonated` are recognized HERE,
 * server-side, on FRESH INSERT ONLY. Both practices dedupe kind-agnostically on
 * eventId (dedupe "ever"), so five kinds on one event still pay the reactor once
 * and the poster once — adding kinds cannot multiply rewards. Un-react never
 * reverses the earned ledger row (append-once); re-reacting pays nothing.
 *
 * Self-reactions are rejected (400).
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

/** Per-kind counts for one event, keyed by kind. Viewer-independent. */
async function kindCounts(eventId: string): Promise<Record<string, number>> {
  const res = await executeQuery<{ kind: string; n: number }>(
    "SELECT kind, COUNT(*)::int AS n FROM feed_reactions WHERE event_id = $1 GROUP BY kind",
    [eventId],
  );
  const out: Record<string, number> = {};
  for (const row of res.rows) out[row.kind] = Number(row.n) || 0;
  return out;
}

/** The kinds this viewer currently has on the event. */
async function viewerKinds(eventId: string, userId: string): Promise<string[]> {
  const res = await executeQuery<{ kind: string }>(
    "SELECT kind FROM feed_reactions WHERE event_id = $1 AND user_id = $2",
    [eventId, userId],
  );
  return res.rows.map((r) => r.kind);
}

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

    // Toggle: try INSERT; if the row already existed (no insert), DELETE it.
    const ins = await executeQuery<{ id: string }>(
      `INSERT INTO feed_reactions (event_id, user_id, kind)
       VALUES ($1, $2, $3)
       ON CONFLICT ON CONSTRAINT uniq_feed_reaction_kind DO NOTHING
       RETURNING id`,
      [eventId, userId, kind],
    );
    const isNew = ins.rows.length > 0;
    let removed = false;

    let reward: { tokenType: string; amount: number; hint: string } | null = null;
    if (isNew) {
      // Reactor's spark (once-ever per event, kind-agnostic; catalog caps daily).
      const reactorResult = await practiceRewardService.recognize(userId, "feed_reaction", eventId);
      if (reactorResult.rewarded && reactorResult.tokenType && reactorResult.amount && reactorResult.hint) {
        reward = { tokenType: reactorResult.tokenType, amount: reactorResult.amount, hint: reactorResult.hint };
      }
      // Poster's resonance (once-ever per event: the FIRST spark pays the maker;
      // catalog caps how many works can resonate per day).
      await practiceRewardService.recognize(posterId, "work_resonated", eventId);
      // (Commit 3 wires notifyReactionReceived here — the poster's deduped bell.)
    } else {
      // No insert landed → the viewer already had this kind: un-react.
      const del = await executeQuery(
        "DELETE FROM feed_reactions WHERE event_id = $1 AND user_id = $2 AND kind = $3",
        [eventId, userId, kind],
      );
      removed = (del.rowCount ?? 0) > 0;
    }

    const [counts, kinds] = await Promise.all([kindCounts(eventId), viewerKinds(eventId, userId)]);
    const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

    return NextResponse.json({
      success: true,
      reacted: isNew,
      removed,
      counts,
      viewerKinds: kinds,
      count: total, // total across kinds, for back-compat callers
      reward,
    });
  } catch (error) {
    console.error("[feed/react] failed:", error);
    return NextResponse.json({ success: false, message: "Reaction failed" }, { status: 500 });
  }
}
