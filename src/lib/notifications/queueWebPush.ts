/**
 * queueWebPush — the fire-and-forget seam every push-eligible notification path
 * calls (PR 3 contract). Triple-gated so push ships DARK by default:
 *
 *   1. bail unless WEB_PUSH_ENABLED === "true"           (server kill switch)
 *   2. bail unless payload.type ∈ PUSH_ELIGIBLE_TYPES    (poll-only types excluded)
 *   3. bail if the recipient's users.preferences->push->enabled === "false"
 *      (default enabled — the browser permission is already the opt-in)
 *
 * When all gates pass it loads the recipient's subscriptions and sends (TTL 24h,
 * dead endpoints pruned inline). Fully fire-and-forget: it returns void and
 * swallows every error, so it can never block or fail the response that queued it.
 *
 * If PR 3 merged first with a no-op stub, that stub is replaced by a re-export
 * of this module; if PR 5 merged first, PR 3's notify simply imports this.
 */

import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";
import { sendPushToUser } from "@/lib/push/webPush";

export type PushEligibleType =
  | "table_invite"
  | "table_going_live"
  | "comment_received"
  | "dm_message";

/**
 * The launch push set. reaction_received (too chatty) and agent_broadcast (a
 * mass broadcast must never fan out to devices) are permanently excluded —
 * they stay poll-only. table_invite/table_going_live fire from PR 2's emitters
 * (guarded no-ops until it merges); dm_message from PR 3's CHAT_DMS_ENABLED.
 */
export const PUSH_ELIGIBLE_TYPES: ReadonlySet<string> = new Set<PushEligibleType>([
  "table_invite",
  "table_going_live",
  "comment_received",
  "dm_message",
]);

export interface PushPayload {
  type: string;
  title: string;
  body: string;
  url: string;
  tag?: string;
}

/** True unless the recipient explicitly set preferences.push.enabled = false. */
async function pushAllowedByPref(recipientId: string): Promise<boolean> {
  try {
    const res = await executeQuery<{ disabled: boolean }>(
      `SELECT (preferences->'push'->>'enabled') = 'false' AS disabled
         FROM users WHERE id = $1::uuid`,
      [recipientId],
    );
    return res.rows[0]?.disabled !== true;
  } catch (error) {
    // Fail-open on a pref read error — the browser permission is the real gate.
    _logger.warn("[queueWebPush] pref check failed, defaulting to allowed:", error);
    return true;
  }
}

/**
 * Contracted signature (PR 3): queueWebPush(recipientId, payload). Fire-and-
 * forget — never awaited by callers, never throws.
 */
export function queueWebPush(recipientId: string, payload: PushPayload): void {
  // Gate 1: server kill switch.
  if (process.env.WEB_PUSH_ENABLED !== "true") return;
  // Gate 2: only launch-eligible types buzz a device.
  if (!PUSH_ELIGIBLE_TYPES.has(payload.type)) return;
  if (!recipientId) return;

  void (async () => {
    try {
      // Gate 3: per-user opt-out.
      if (!(await pushAllowedByPref(recipientId))) return;
      await sendPushToUser(recipientId, {
        title: payload.title,
        body: payload.body,
        url: payload.url,
        tag: payload.tag,
      });
    } catch (error) {
      _logger.warn("[queueWebPush] send failed:", error);
    }
  })();
}
