/**
 * Slack notifier
 *
 * Posts plain-text alert messages to an incoming-webhook URL configured
 * via `ALERT_SLACK_WEBHOOK_URL`. We use Slack's blocks API for nicer
 * formatting (header + context section), falling back to plain text in
 * the `text` field for accessibility / mobile notifications.
 *
 * Webhook URLs are an implicit secret — we never log the URL itself,
 * only success/failure of the POST.
 *
 * @file src/lib/notifications/slackNotifier.ts
 */

import { _logger } from "@/lib/logger";
import type { FlowStatus } from "@/services/systemStatusService";

export interface SlackAlertPayload {
  title: string;
  message: string;
  component: string;
  previous: FlowStatus;
  current: FlowStatus;
  severity: "info" | "warn" | "error";
}

export interface SlackDispatchResult {
  ok: boolean;
  error?: string;
}

const STATUS_EMOJI: Record<FlowStatus, string> = {
  OK: ":white_check_mark:",
  DEGRADED: ":warning:",
  INCIDENT: ":rotating_light:",
  UNKNOWN: ":grey_question:",
};

const SEVERITY_COLOR: Record<"info" | "warn" | "error", string> = {
  info: "#22c55e",
  warn: "#f59e0b",
  error: "#ef4444",
};

/**
 * Post an alert to the configured Slack webhook. Returns `{ ok: false }`
 * when the webhook URL isn't configured (silent skip — don't make the
 * caller branch on env state).
 */
export async function sendSlackAlert(
  payload: SlackAlertPayload,
): Promise<SlackDispatchResult> {
  const webhookUrl = process.env.ALERT_SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return { ok: false, error: "ALERT_SLACK_WEBHOOK_URL not set" };
  }

  const fromEmoji = STATUS_EMOJI[payload.previous];
  const toEmoji = STATUS_EMOJI[payload.current];
  const fallback =
    `${toEmoji} *${payload.title}*\n` +
    `${payload.component}: ${fromEmoji} ${payload.previous} → ${toEmoji} ${payload.current}\n` +
    `${payload.message}`;

  const body = {
    text: fallback,
    attachments: [
      {
        color: SEVERITY_COLOR[payload.severity],
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${toEmoji} ${payload.title}`,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Component*\n${payload.component}`,
              },
              {
                type: "mrkdwn",
                text: `*Transition*\n${payload.previous} → ${payload.current}`,
              },
            ],
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: payload.message },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `:clock1: ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `HTTP ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    _logger.warn("[slackNotifier] dispatch failed:", message);
    return { ok: false, error: message };
  }
}
