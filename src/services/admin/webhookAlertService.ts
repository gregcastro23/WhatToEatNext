/**
 * Threshold-based webhook alert dispatcher for reviewer arrivals, route
 * friction/error spikes, and incoming viewer feedback notes.
 *
 * Reads `ADMIN_ALERT_WEBHOOK_URL` from env and stays strictly silent when
 * unset. Formats payloads with both `content` (Discord) and `text` (Slack).
 *
 * @file src/services/admin/webhookAlertService.ts
 */

import type { PageViewInsert } from "@/services/admin/trafficTypes";

const REVIEWER_COOLDOWN_MS = 30 * 60_000;
const FRICTION_WINDOW_MS = 10 * 60_000;
const FRICTION_SPIKE_THRESHOLD = 2;
const FRICTION_COOLDOWN_MS = 15 * 60_000;
const FEEDBACK_COOLDOWN_MS = 60_000;
const MAX_TRACKED_KEYS = 500;

const cooldownByKey = new Map<string, number>();
const recentRouteFriction = new Map<string, number[]>();

export function resetWebhookAlertStateForTests(): void {
  cooldownByKey.clear();
  recentRouteFriction.clear();
}

function pruneOldCooldowns(nowMs: number): void {
  if (cooldownByKey.size <= MAX_TRACKED_KEYS) return;
  for (const [k, ts] of cooldownByKey.entries()) {
    if (nowMs - ts > REVIEWER_COOLDOWN_MS) {
      cooldownByKey.delete(k);
    }
  }
}

export async function notifyTrafficWebhookAlert(input: {
  key: string;
  cooldownMs: number;
  message: string;
  nowMs?: number;
}): Promise<boolean> {
  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;

  const nowMs = input.nowMs ?? Date.now();
  const prev = cooldownByKey.get(input.key);
  if (prev !== undefined && nowMs - prev < input.cooldownMs) {
    return false;
  }

  cooldownByKey.set(input.key, nowMs);
  pruneOldCooldowns(nowMs);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        content: input.message,
        text: input.message,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function evaluatePageViewWebhookAlerts(
  row: PageViewInsert,
  nowMs = Date.now(),
): Promise<boolean> {
  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;
  if (row.isBot || row.path === "/admin" || row.path.startsWith("/admin/")) {
    return false;
  }

  let sent = false;

  if (row.refTag) {
    const sessionKey = row.sessionId ?? row.visitorHash;
    const ok = await notifyTrafficWebhookAlert({
      key: `ref:${row.refTag}:${sessionKey}`,
      cooldownMs: REVIEWER_COOLDOWN_MS,
      message: `[alchm.kitchen] Active reviewer arrival: ref=${row.refTag} on ${row.path} (${row.deviceType})`,
      nowMs,
    });
    if (ok) sent = true;
  }

  const badTags = (row.interactions ?? []).filter(
    (tag) => tag.startsWith("friction:rage_click:") || tag.startsWith("error:"),
  );
  if (badTags.length > 0) {
    const windowCutoff = nowMs - FRICTION_WINDOW_MS;
    const prevEvents = recentRouteFriction.get(row.path) ?? [];
    const activeEvents = prevEvents.filter((ts) => ts >= windowCutoff);
    activeEvents.push(nowMs);
    recentRouteFriction.set(row.path, activeEvents);

    if (activeEvents.length >= FRICTION_SPIKE_THRESHOLD) {
      const ok = await notifyTrafficWebhookAlert({
        key: `spike:${row.path}`,
        cooldownMs: FRICTION_COOLDOWN_MS,
        message: `[alchm.kitchen] Friction spike on ${row.path}: ${activeEvents.length} events in 10m (latest: ${badTags[0]})`,
        nowMs,
      });
      if (ok) sent = true;
    }
  }

  return sent;
}

export async function evaluateFeedbackWebhookAlert(
  input: {
    path: string;
    refTag: string | null;
    sessionId: string | null;
    visitorHash: string;
    rating: number | null;
    note: string;
  },
  nowMs = Date.now(),
): Promise<boolean> {
  const webhookUrl = process.env.ADMIN_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;

  const sessionKey = input.sessionId ?? input.visitorHash;
  const ratingText = input.rating ? ` (${input.rating}/5)` : "";
  const refText = input.refTag ? ` [ref:${input.refTag}]` : "";
  return notifyTrafficWebhookAlert({
    key: `fb:${sessionKey}`,
    cooldownMs: FEEDBACK_COOLDOWN_MS,
    message: `[alchm.kitchen] Viewer feedback${refText} on ${input.path}${ratingText}: "${input.note.slice(0, 120)}"`,
    nowMs,
  });
}
