/**
 * Alert email template
 *
 * HTML + plain-text email body for operator alerts on system-status
 * transitions. Visual style mirrors the admin-test-email templates so an
 * operator's inbox stays visually coherent.
 *
 * @file src/lib/notifications/alertEmail.ts
 */

import type { FlowStatus } from "@/services/systemStatusService";

export interface AlertEmailPayload {
  title: string;
  message: string;
  component: string;
  previous: FlowStatus;
  current: FlowStatus;
  severity: "info" | "warn" | "error";
  dashboardUrl?: string;
}

const STATUS_LABEL: Record<FlowStatus, string> = {
  OK: "Healthy",
  DEGRADED: "Degraded",
  INCIDENT: "Incident",
  UNKNOWN: "Unknown",
};

const STATUS_COLOR: Record<FlowStatus, string> = {
  OK: "#22c55e",
  DEGRADED: "#f59e0b",
  INCIDENT: "#ef4444",
  UNKNOWN: "#94a3b8",
};

const SEVERITY_BAND: Record<"info" | "warn" | "error", string> = {
  info: "linear-gradient(135deg,#16a34a,#22c55e)",
  warn: "linear-gradient(135deg,#d97706,#f59e0b)",
  error: "linear-gradient(135deg,#dc2626,#ef4444)",
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderAlertEmail(payload: AlertEmailPayload): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `[alchm] ${payload.title}`;

  const currentColor = STATUS_COLOR[payload.current];
  const previousColor = STATUS_COLOR[payload.previous];
  const band = SEVERITY_BAND[payload.severity];

  const dashboardUrl =
    payload.dashboardUrl ?? "https://alchm.kitchen/admin";

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#1e293b;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:${band};padding:24px 28px;color:#fff;">
            <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">
              alchm operator alert
            </div>
            <div style="font-size:22px;font-weight:700;margin-top:6px;">
              ${escape(payload.title)}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
              <tr>
                <td style="padding:12px 14px;background:#0f172a;border-radius:8px;">
                  <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Component</div>
                  <div style="font-size:15px;font-weight:600;margin-top:4px;">${escape(payload.component)}</div>
                </td>
              </tr>
              <tr><td height="10"></td></tr>
              <tr>
                <td style="padding:12px 14px;background:#0f172a;border-radius:8px;">
                  <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Transition</div>
                  <div style="margin-top:6px;">
                    <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${previousColor};color:#fff;font-size:12px;font-weight:600;">${STATUS_LABEL[payload.previous]}</span>
                    <span style="color:#64748b;margin:0 8px;">→</span>
                    <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:${currentColor};color:#fff;font-size:12px;font-weight:600;">${STATUS_LABEL[payload.current]}</span>
                  </div>
                </td>
              </tr>
            </table>
            <div style="font-size:14px;line-height:1.6;color:#cbd5e1;margin-bottom:24px;">
              ${escape(payload.message)}
            </div>
            <a href="${escape(dashboardUrl)}" style="display:inline-block;padding:11px 22px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open Operator Dashboard →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px 24px;border-top:1px solid #334155;font-size:11px;color:#64748b;">
            Automated alert from the alchm operator console. You receive these because <code>AUTH_ADMIN_EMAIL</code> is set to your address.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  const text =
    `[alchm operator alert] ${payload.title}\n\n` +
    `Component:  ${payload.component}\n` +
    `Transition: ${STATUS_LABEL[payload.previous]} -> ${STATUS_LABEL[payload.current]}\n\n` +
    `${payload.message}\n\n` +
    `Dashboard: ${dashboardUrl}\n`;

  return { subject, html, text };
}
