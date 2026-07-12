/**
 * POST /api/follows — follow a user (idempotent). DELETE — unfollow.
 *
 * The follows ROW is the proof both invisible rewards hang off: the
 * follower's `follow_made` and the followee's `first_follower_gained` are
 * recognized HERE, server-side, keyed to `created === true` (both types are
 * SERVER_ONLY in the practice catalog). Blocked pairs 403 with a generic
 * message; the block check is FAIL-CLOSED (service throws → 500) so a follow
 * can never slip past a block on a transient failure.
 *
 * Notifications: `new_follower` fires only when (a) the insert actually
 * created a row and (b) the same follower hasn't produced one for this
 * followee within 30 days — serial follow/unfollow churn pays one bell per
 * pair per 30 days, max. Agents get no bell and earn no practice.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";
import { followDatabase } from "@/services/followDatabaseService";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import { practiceRewardService } from "@/services/practiceRewardService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readTargetUserId(request: NextRequest): Promise<string | null> {
  let candidate: unknown = null;
  try {
    const body = (await request.json()) as { targetUserId?: unknown };
    candidate = body?.targetUserId;
  } catch {
    // DELETE may carry the target in the query string instead of a body.
  }
  if (typeof candidate !== "string") {
    candidate = new URL(request.url).searchParams.get("targetUserId");
  }
  return typeof candidate === "string" && UUID.test(candidate) ? candidate : null;
}

/**
 * 30-day per-pair bell dedup (pattern: hasDailyInsightToday). Fail-open to
 * "already notified" style suppression is the WRONG direction for a dedup —
 * on error we err on silence (returns true → no duplicate bell spam).
 */
async function recentlyNotified(followeeId: string, followerId: string): Promise<boolean> {
  try {
    const res = await executeQuery(
      `SELECT id FROM notifications
        WHERE user_id = $1 AND type = 'new_follower' AND related_user_id = $2
          AND created_at > now() - interval '30 days'
        LIMIT 1`,
      [followeeId, followerId],
    );
    return (res.rows?.length || 0) > 0;
  } catch (error) {
    console.warn("[follows] new_follower dedup check failed, staying silent:", error);
    return true;
  }
}

/** Display name for the bell message — never an email. */
async function followerDisplayName(followerId: string): Promise<string> {
  try {
    const res = await executeQuery<{ name: string }>(
      `SELECT COALESCE(NULLIF(up.name, ''), NULLIF(u.name, ''), 'An alchemist') AS name
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1::uuid`,
      [followerId],
    );
    return res.rows[0]?.name || "An alchemist";
  } catch {
    return "An alchemist";
  }
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "follows", identifier: userId });
  if (!rl.allowed) return rl.response!;

  const targetUserId = await readTargetUserId(request);
  if (!targetUserId) {
    return NextResponse.json({ success: false, message: "targetUserId is required" }, { status: 400 });
  }

  try {
    const result = await followDatabase.follow(userId, targetUserId);
    if (!result.ok) {
      if (result.reason === "self") {
        return NextResponse.json(
          { success: false, message: "Your own chart already follows you everywhere." },
          { status: 400 },
        );
      }
      if (result.reason === "not_found") {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
      }
      // Blocked either direction — deliberately generic (don't reveal who blocked whom).
      return NextResponse.json({ success: false, message: "Cannot follow this user" }, { status: 403 });
    }

    let reward: { tokenType: string; amount: number; hint: string } | null = null;
    if (result.created) {
      // Follower's thread (once-ever per target, capped daily by the catalog).
      const followerResult = await practiceRewardService.recognize(userId, "follow_made", targetUserId);
      if (followerResult.rewarded && followerResult.tokenType && followerResult.amount && followerResult.hint) {
        reward = { tokenType: followerResult.tokenType, amount: followerResult.amount, hint: followerResult.hint };
      }

      if (!result.followeeIsAgent) {
        // Followee's first witness (once-ever; the practice ledger is the gate,
        // the COUNT just avoids a pointless recognize on every later follow).
        try {
          if (await followDatabase.hasExactlyOneFollower(targetUserId)) {
            await practiceRewardService.recognize(targetUserId, "first_follower_gained");
          }
        } catch (error) {
          console.warn("[follows] first_follower_gained check failed:", error);
        }

        // Bell, deduped per pair per 30 days. Fire-and-forget shape, but we
        // await so tests can assert; failures only warn.
        try {
          if (!(await recentlyNotified(targetUserId, userId))) {
            const name = await followerDisplayName(userId);
            await notificationDatabase.createNotification(
              targetUserId,
              "new_follower",
              "New Follower",
              `${name} now follows your work`,
              { relatedUserId: userId, metadata: { followerUserId: userId } },
            );
          }
        } catch (error) {
          console.warn("[follows] new_follower notification failed:", error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      following: true,
      created: result.created,
      reward,
    });
  } catch (error) {
    // Fail-closed: includes block-check failures — never let a follow through.
    console.error("[follows] POST failed:", error);
    return NextResponse.json({ success: false, message: "Follow failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "follows", identifier: userId });
  if (!rl.allowed) return rl.response!;

  const targetUserId = await readTargetUserId(request);
  if (!targetUserId) {
    return NextResponse.json({ success: false, message: "targetUserId is required" }, { status: 400 });
  }

  try {
    await followDatabase.unfollow(userId, targetUserId);
    // Idempotent: unfollowing a non-edge is still success, following:false.
    return NextResponse.json({ success: true, following: false });
  } catch (error) {
    console.error("[follows] DELETE failed:", error);
    return NextResponse.json({ success: false, message: "Unfollow failed" }, { status: 500 });
  }
}
