/**
 * First-party page-view beacon.
 * POST /api/track/pageview
 *
 * Called by <PageViewTracker /> (root layout) via navigator.sendBeacon on
 * every client navigation. Public by design — visitors are mostly anonymous —
 * so it is rate-limited per IP and accepts only a tiny, validated body.
 *
 * Stored per visit: pathname (no query string), external referrer host, UTM
 * tags, Vercel geo headers, device class, and a daily-rotating visitor hash.
 * NOT stored: the IP, the full user-agent, the query string. A signed-in
 * user is attributed from the server-verified session only — never from the
 * body.
 *
 * Always answers 204 on a well-formed request, even when the insert fails:
 * the caller is a beacon that cannot act on an error, and a failure is logged
 * server-side (and shows on /admin/traffic as a missing-table/error state).
 *
 * @file src/app/api/track/pageview/route.ts
 */

import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  classifyUserAgent,
  cleanUtm,
  externalReferrerHost,
  isTrackablePath,
  normalizePath,
  utcDay,
  visitorHash,
} from "@/lib/analytics/pageViewClassify";
import { executeQuery } from "@/lib/database/connection";
import { rateLimit } from "@/lib/rateLimit";
import { recordPageView } from "@/services/admin/trafficAnalyticsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  path: z.string().min(1).max(2048),
  referrer: z.string().max(2048).optional().nullable(),
  sessionId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{8,64}$/)
    .optional()
    .nullable(),
  utmSource: z.string().max(200).optional().nullable(),
  utmMedium: z.string().max(200).optional().nullable(),
  utmCampaign: z.string().max(200).optional().nullable(),
});

/**
 * The hash key. Derived from AUTH_SECRET so no new secret has to be
 * provisioned; without one (local dev) a per-process random key keeps the
 * hash unlinkable to an IP at the cost of cross-instance de-duplication.
 */
const HASH_SECRET = createHash("sha256")
  .update(`pageview-visitor:${process.env.PAGEVIEW_HASH_SECRET ?? process.env.AUTH_SECRET ?? randomBytes(32).toString("hex")}`)
  .digest("hex");

function clientIp(request: NextRequest): string {
  const candidates = [
    request.headers.get("x-forwarded-for")?.split(",")[0],
    request.headers.get("x-real-ip"),
  ];
  return candidates.map((c) => c?.trim() ?? "").find((c) => c.length > 0) ?? "unknown";
}

function decodedHeader(request: NextRequest, name: string, max: number): string | null {
  const raw = request.headers.get(name);
  if (!raw) return null;
  try {
    const value = decodeURIComponent(raw).trim();
    return value.length > 0 ? value.slice(0, max) : null;
  } catch {
    const trimmed = raw.trim().slice(0, max);
    return trimmed.length > 0 ? trimmed : null;
  }
}

/** Server-verified identity only. Any failure → anonymous, never an error. */
async function sessionUserId(): Promise<string | null> {
  try {
    const { auth } = await import("@/lib/auth/auth");
    const session = await auth();
    const email = session?.user?.email?.trim().toLowerCase();
    if (!email) return null;
    const res = await executeQuery<{ id: string }>(
      `SELECT id::text AS id FROM users WHERE LOWER(email) = $1 LIMIT 1`,
      [email],
      { logQuery: false },
    );
    return res.rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

const NO_CONTENT = (): NextResponse => new NextResponse(null, { status: 204 });

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Another site's page posting here is not a visit to this one. (Absent
  // header is allowed: Safari < 16.4 does not send Sec-Fetch-Site at all.)
  if (request.headers.get("sec-fetch-site") === "cross-site") return NO_CONTENT();

  const limited = await rateLimit(request, { window: 60_000, max: 120, bucket: "pageview" });
  if (!limited.allowed) return new NextResponse(null, { status: 429 });

  const body: unknown = await request.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const path = normalizePath(parsed.data.path);
  if (!path || !isTrackablePath(path)) return NO_CONTENT();

  const userAgent = request.headers.get("user-agent") ?? "";
  const ua = classifyUserAgent(userAgent);
  const now = new Date();

  await recordPageView({
    path,
    referrerHost: externalReferrerHost(parsed.data.referrer, request.headers.get("host")),
    utmSource: cleanUtm(parsed.data.utmSource),
    utmMedium: cleanUtm(parsed.data.utmMedium),
    utmCampaign: cleanUtm(parsed.data.utmCampaign),
    visitorHash: visitorHash({ secret: HASH_SECRET, day: utcDay(now), ip: clientIp(request), userAgent }),
    sessionId: parsed.data.sessionId ?? null,
    // Bots are recorded for the bot count but never attributed to a user.
    userId: ua.isBot ? null : await sessionUserId(),
    country: decodedHeader(request, "x-vercel-ip-country", 8),
    region: decodedHeader(request, "x-vercel-ip-country-region", 50),
    city: decodedHeader(request, "x-vercel-ip-city", 80),
    deviceType: ua.deviceType,
    browser: ua.browser,
    os: ua.os,
    isBot: ua.isBot,
  });

  return NO_CONTENT();
}
