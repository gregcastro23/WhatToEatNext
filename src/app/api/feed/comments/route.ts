/**
 * GET  /api/feed/comments?eventId&limit=30&before=  — keyset comment list.
 * POST /api/feed/comments  {eventId, body}          — create a comment.
 *
 * Comments are real-identity (resolved server-side through the single
 * resolveDisplayIdentity helper). Blocked pairs are filtered BOTH directions on
 * read, and a comment from someone blocked with the event actor (either way) is
 * refused with a NEUTRAL 403 on write. The comment ROW anchors both invisible
 * rewards (commenter's comment_posted, event actor's work_discussed).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { isBlockedBetween, sanitizeCommentBody } from "@/lib/feed/commentEnforcement";
import { notifyCommentReceived } from "@/lib/notifications/engagementNotify";
import { rateLimit } from "@/lib/rateLimit";
import { feedCommentsDatabase } from "@/services/feedCommentsDatabaseService";
import { practiceRewardService } from "@/services/practiceRewardService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function numberFrom(raw: string | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function GET(request: NextRequest) {
  const viewerId = await getUserIdFromRequest(request); // may be null (anonymous)
  const { searchParams } = new URL(request.url);
  const eventIdRaw = searchParams.get("eventId");
  const eventId = eventIdRaw && UUID.test(eventIdRaw) ? eventIdRaw : null;
  if (!eventId) {
    return NextResponse.json({ success: false, message: "eventId is required" }, { status: 400 });
  }

  const rl = await rateLimit(request, {
    window: 60_000,
    max: 60,
    bucket: "feed-comments-list",
    identifier: viewerId ?? undefined,
  });
  if (!rl.allowed) return rl.response!;

  const limit = Math.min(numberFrom(searchParams.get("limit"), 30), 50);
  const before = searchParams.get("before");

  try {
    const page = await feedCommentsDatabase.listComments(eventId, viewerId, { limit, before });
    return NextResponse.json({ success: true, ...page });
  } catch (error) {
    console.error("[feed/comments] GET failed:", error);
    return NextResponse.json({ success: false, message: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  // Two-tier rate limit: 10/min sustained + a 3-per-10s burst guard.
  const rlMinute = await rateLimit(request, { window: 60_000, max: 10, bucket: "feed-comment-post", identifier: userId });
  if (!rlMinute.allowed) return rlMinute.response!;
  const rlBurst = await rateLimit(request, { window: 10_000, max: 3, bucket: "feed-comment-post-burst", identifier: userId });
  if (!rlBurst.allowed) return rlBurst.response!;

  let body: { eventId?: unknown; body?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" && UUID.test(body.eventId) ? body.eventId : null;
  if (!eventId) {
    return NextResponse.json({ success: false, message: "eventId is required" }, { status: 400 });
  }
  const cleanBody = sanitizeCommentBody(body.body);
  if (!cleanBody) {
    return NextResponse.json({ success: false, message: "A comment must be 1–1000 characters." }, { status: 400 });
  }

  try {
    const actorId = await feedCommentsDatabase.getEventActor(eventId);
    if (!actorId) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    // Refuse if commenter ↔ event actor are blocked either direction. FAIL-CLOSED:
    // isBlockedBetween throws on DB error → the catch below 500s (never allows).
    if (await isBlockedBetween(userId, actorId)) {
      // Neutral message — do not reveal who blocked whom.
      return NextResponse.json({ success: false, message: "Cannot comment on this post" }, { status: 403 });
    }

    const comment = await feedCommentsDatabase.createComment(eventId, userId, cleanBody);
    if (!comment) {
      return NextResponse.json({ success: false, message: "Failed to post comment" }, { status: 500 });
    }

    // Commenter's reward (once-ever per event, kind-agnostic on eventId).
    let reward: { tokenType: string; amount: number; hint: string } | null = null;
    const commenterResult = await practiceRewardService.recognize(userId, "comment_posted", eventId);
    if (commenterResult.rewarded && commenterResult.tokenType && commenterResult.amount && commenterResult.hint) {
      reward = { tokenType: commenterResult.tokenType, amount: commenterResult.amount, hint: commenterResult.hint };
    }

    // Event actor's resonance — skip self (own comment) and agent recipients.
    if (actorId !== userId) {
      try {
        const isAgent = await executeQuery<{ is_agent: boolean }>(
          "SELECT COALESCE(is_agent, false) AS is_agent FROM users WHERE id = $1::uuid",
          [actorId],
        );
        if (isAgent.rows[0]?.is_agent !== true) {
          await practiceRewardService.recognize(actorId, "work_discussed", eventId);
        }
      } catch (error) {
        console.warn("[feed/comments] work_discussed recognize failed:", error);
      }

      // Fire-and-forget bell to the event actor (deduped; self/blocked/agent-safe
      // — the dispatcher re-checks agent + block before writing).
      void notifyCommentReceived({
        eventId,
        actorId: userId,
        recipientId: actorId,
        excerpt: cleanBody.slice(0, 120),
      });
    }

    return NextResponse.json({ success: true, comment, reward });
  } catch (error) {
    console.error("[feed/comments] POST failed:", error);
    return NextResponse.json({ success: false, message: "Failed to post comment" }, { status: 500 });
  }
}
