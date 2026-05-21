/**
 * Admin Abuse Detection
 * GET /api/admin/abuse?window=1h
 *
 * Reads from `auth_events` to surface IPs and email addresses that look
 * like brute-force attempts: many failures in a short window, distributed
 * across multiple targets.
 *
 * Cheap and non-blocking — purely a read endpoint. Auto-block is not
 * implemented here; once an admin reviews the results, blocking moves
 * to an explicit decision (e.g. add an IP to an allowlist/blocklist).
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface IpRow {
  ip_hash: string;
  failures: number;
  successes: number;
  emails_targeted: number;
  first_seen: Date;
  last_seen: Date;
}

interface EmailRow {
  email: string | null;
  failures: number;
  ips: number;
  last_seen: Date;
}

const WINDOWS: Record<string, string> = {
  "15m": "15 minutes",
  "1h": "1 hour",
  "6h": "6 hours",
  "24h": "24 hours",
  "7d": "7 days",
};

export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAdminRequest(request);
    if ("error" in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const windowKey = searchParams.get("window") ?? "1h";
    const interval = WINDOWS[windowKey] ?? WINDOWS["1h"];
    const minFailures = Math.max(
      1,
      parseInt(searchParams.get("minFailures") ?? "5", 10) || 5,
    );

    // IPs with concentrated failures — usually scripted brute-force.
    const ipResult = await executeQuery<IpRow>(
      `SELECT
         ip_hash,
         COUNT(*) FILTER (WHERE status = 'failure')::int AS failures,
         COUNT(*) FILTER (WHERE status = 'success')::int AS successes,
         COUNT(DISTINCT email) FILTER (WHERE status = 'failure')::int AS emails_targeted,
         MIN(created_at) AS first_seen,
         MAX(created_at) AS last_seen
       FROM auth_events
       WHERE ip_hash IS NOT NULL
         AND created_at >= NOW() - INTERVAL '${interval}'
       GROUP BY ip_hash
       HAVING COUNT(*) FILTER (WHERE status = 'failure') >= $1
       ORDER BY failures DESC, emails_targeted DESC
       LIMIT 100`,
      [minFailures],
    );

    // Emails repeatedly failing — could be a user typo, but multiple distinct
    // IPs targeting the same email is a credential-stuffing signal.
    const emailResult = await executeQuery<EmailRow>(
      `SELECT
         email,
         COUNT(*)::int AS failures,
         COUNT(DISTINCT ip_hash)::int AS ips,
         MAX(created_at) AS last_seen
       FROM auth_events
       WHERE email IS NOT NULL
         AND status = 'failure'
         AND created_at >= NOW() - INTERVAL '${interval}'
       GROUP BY email
       HAVING COUNT(*) >= $1
       ORDER BY failures DESC
       LIMIT 100`,
      [minFailures],
    );

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      window: windowKey,
      minFailures,
      suspiciousIps: ipResult.rows.map((r) => ({
        ipHash: r.ip_hash,
        failures: r.failures,
        successes: r.successes,
        emailsTargeted: r.emails_targeted,
        firstSeen: r.first_seen,
        lastSeen: r.last_seen,
      })),
      targetedEmails: emailResult.rows.map((r) => ({
        email: r.email,
        failures: r.failures,
        distinctIps: r.ips,
        lastSeen: r.last_seen,
      })),
    });
  } catch (error) {
    console.error("[admin/abuse] Failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute abuse metrics" },
      { status: 500 },
    );
  }
}
