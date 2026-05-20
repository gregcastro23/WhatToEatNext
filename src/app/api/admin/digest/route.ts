/**
 * Admin Auth Digest
 * POST /api/admin/digest
 *
 * Composes a daily/weekly summary from `users`, `auth_events`, and
 * `device_sessions` and emails it to AUTH_ADMIN_EMAIL. Designed to be
 * called from a scheduled job (Railway cron) but also runnable on
 * demand by an admin in the browser for testing.
 *
 * Auth modes:
 *   1. Bearer token = INTERNAL_API_SECRET → trusted cron caller.
 *   2. Admin session → ad-hoc preview/test.
 *
 * Query/body params:
 *   period = "daily" | "weekly"   (default "daily")
 *   dryRun = "true" → returns the payload without emailing
 *
 * @requires Authentication - admin session OR internal bearer
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { getEventCounts } from "@/services/authEventsService";
import emailService from "@/services/emailService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isInternalCaller(authHeader: string | null): boolean {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret || !authHeader) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authHeader);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

interface CountsRow {
  total: number;
  new_24h: number;
  new_7d: number;
  active_24h: number;
  active_7d: number;
  active_sessions: number;
  premium: number;
}

async function buildPayload(period: "daily" | "weekly") {
  const windowMs = period === "weekly" ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const interval = period === "weekly" ? "7 days" : "24 hours";

  const rollup = await executeQuery<CountsRow>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours')::int AS new_24h,
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS new_7d,
       COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '24 hours')::int AS active_24h,
       COUNT(*) FILTER (WHERE last_login_at >= NOW() - INTERVAL '${interval}')::int AS active_7d,
       (SELECT COUNT(*)::int FROM device_sessions WHERE revoked_at IS NULL) AS active_sessions,
       (SELECT COUNT(*)::int FROM user_subscriptions WHERE tier = 'premium' AND status = 'active') AS premium
     FROM users`,
  );

  const events = await getEventCounts(windowMs);

  return {
    period,
    generatedAt: new Date().toISOString(),
    users: rollup.rows[0] ?? {
      total: 0,
      new_24h: 0,
      new_7d: 0,
      active_24h: 0,
      active_7d: 0,
      active_sessions: 0,
      premium: 0,
    },
    authEvents: events,
  };
}

function renderHtml(payload: Awaited<ReturnType<typeof buildPayload>>): string {
  const u = payload.users;
  const e = payload.authEvents;
  const failingTypes = e.byType
    .filter((b) => b.status === "failure")
    .slice(0, 8)
    .map((b) => `<tr><td>${b.type}</td><td style="text-align:right">${b.count}</td></tr>`)
    .join("");

  return `
  <div style="font-family:Manrope,system-ui,sans-serif;max-width:560px;margin:auto;padding:24px;color:#1f1d2b">
    <h1 style="font-size:18px;margin:0 0 6px">Alchm Kitchen — ${payload.period === "weekly" ? "Weekly" : "Daily"} digest</h1>
    <p style="color:#666;font-size:12px;margin:0 0 24px">${payload.generatedAt}</p>

    <h2 style="font-size:14px;margin:16px 0 8px">Users</h2>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <tr><td>Total accounts</td><td style="text-align:right">${u.total}</td></tr>
      <tr><td>New (24h / 7d)</td><td style="text-align:right">${u.new_24h} / ${u.new_7d}</td></tr>
      <tr><td>Signed in (24h / 7d)</td><td style="text-align:right">${u.active_24h} / ${u.active_7d}</td></tr>
      <tr><td>Active sessions</td><td style="text-align:right">${u.active_sessions}</td></tr>
      <tr><td>Premium</td><td style="text-align:right">${u.premium}</td></tr>
    </table>

    <h2 style="font-size:14px;margin:24px 0 8px">Auth events (last ${payload.period === "weekly" ? "7 days" : "24 hours"})</h2>
    <p style="font-size:13px;margin:0 0 8px">
      <strong>${e.successes}</strong> success ·
      <strong style="color:#b00020">${e.failures}</strong> failure ·
      ${e.total} total
    </p>
    ${failingTypes ? `<table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th align="left">Failure type</th><th align="right">Count</th></tr></thead><tbody>${failingTypes}</tbody></table>` : `<p style="font-size:13px;color:#666">No failures in window — quiet skies.</p>`}

    <p style="font-size:11px;color:#888;margin-top:32px">
      Sent by alchm.kitchen · See full metrics at /admin
    </p>
  </div>`;
}

export async function POST(request: NextRequest) {
  try {
    const isInternal = isInternalCaller(request.headers.get("Authorization"));
    if (!isInternal) {
      const authResult = await validateAdminRequest(request);
      if ("error" in authResult) return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") === "weekly" ? "weekly" : "daily";
    const dryRun = searchParams.get("dryRun") === "true";

    const payload = await buildPayload(period);

    const recipient =
      process.env.AUTH_ADMIN_EMAIL ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      "";

    if (dryRun) {
      return NextResponse.json({ success: true, dryRun: true, payload, recipient: recipient || null });
    }

    if (!recipient) {
      return NextResponse.json(
        { success: false, message: "No recipient configured (AUTH_ADMIN_EMAIL)" },
        { status: 503 },
      );
    }

    try {
      emailService.ensureInitialized();
    } catch {
      /* configured below */
    }
    if (!emailService.isConfigured()) {
      return NextResponse.json(
        { success: false, message: "Email service is not configured" },
        { status: 503 },
      );
    }

    const subject = `Alchm Kitchen — ${period === "weekly" ? "Weekly" : "Daily"} digest`;
    const html = renderHtml(payload);
    const text = JSON.stringify(payload, null, 2);
    const sent = await emailService.sendEmail({ to: recipient, subject, html, text });

    return NextResponse.json({
      success: sent !== false,
      delivered: sent !== false,
      recipient,
      payload,
    });
  } catch (error) {
    console.error("[admin/digest] Failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build/send digest" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // GET is dry-run only. POST is the side-effecting variant. This lets
  // an admin click in a browser to preview without accidentally emailing.
  try {
    const isInternal = isInternalCaller(request.headers.get("Authorization"));
    if (!isInternal) {
      const authResult = await validateAdminRequest(request);
      if ("error" in authResult) return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") === "weekly" ? "weekly" : "daily";
    const payload = await buildPayload(period);
    const recipient =
      process.env.AUTH_ADMIN_EMAIL ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      null;
    return NextResponse.json({ success: true, dryRun: true, payload, recipient });
  } catch (error) {
    console.error("[admin/digest] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to build digest preview" },
      { status: 500 },
    );
  }
}
