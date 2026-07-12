/**
 * Web-push sender (PR 5) — the thin wrapper over the `web-push` library.
 *
 * Loads the recipient's subscriptions, sends the payload to each (TTL 24h), and
 * prunes dead endpoints inline when the push service replies 404/410 (Gone) —
 * no cron needed. VAPID keys are configured lazily on first use so the module
 * imports cleanly even when push is unconfigured (the kill switch lives in
 * queueWebPush, upstream of here).
 */

import webpush from "web-push";
import { executeQuery } from "@/lib/database";
import { _logger } from "@/lib/logger";

const TTL_SECONDS = 24 * 60 * 60;

let vapidConfigured: boolean | null = null;

/** Configure VAPID once; returns false when keys are absent (caller no-ops). */
function ensureVapid(): boolean {
  if (vapidConfigured !== null) return vapidConfigured;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@alchm.kitchen";
  if (!publicKey || !privateKey) {
    vapidConfigured = false;
    return false;
  }
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
  } catch (error) {
    _logger.warn("[webPush] VAPID configuration failed:", error);
    vapidConfigured = false;
  }
  return vapidConfigured;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface WebPushBody {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

/**
 * Send a payload to every push subscription a recipient has. Returns the number
 * of successful sends. Dead endpoints (404/410) are deleted inline. Never
 * throws — the caller (queueWebPush) is fire-and-forget.
 */
export async function sendPushToUser(recipientId: string, payload: WebPushBody): Promise<number> {
  if (!ensureVapid()) return 0;

  let subs: SubscriptionRow[];
  try {
    const res = await executeQuery<SubscriptionRow>(
      "SELECT id, endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1::uuid",
      [recipientId],
    );
    subs = res.rows;
  } catch (error) {
    _logger.warn("[webPush] failed to load subscriptions:", error);
    return 0;
  }
  if (subs.length === 0) return 0;

  const serialized = JSON.stringify(payload);
  let sent = 0;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          serialized,
          { TTL: TTL_SECONDS },
        );
        sent += 1;
        // Touch last_used_at (best-effort).
        await executeQuery(
          "UPDATE push_subscriptions SET last_used_at = now() WHERE id = $1::uuid",
          [sub.id],
        ).catch(() => {});
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Gone — prune this dead subscription inline (no cron needed).
          await executeQuery("DELETE FROM push_subscriptions WHERE id = $1::uuid", [sub.id]).catch(() => {});
        } else {
          _logger.warn("[webPush] sendNotification failed:", error);
        }
      }
    }),
  );

  return sent;
}
