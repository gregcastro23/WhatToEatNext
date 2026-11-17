/**
 * First-party contextual micro-feedback beacon.
 * POST /api/track/feedback
 *
 * Links a visitor's rating (1-5) and note directly to their active `view_id`
 * and `session_id` so their comment renders inside their expanded Journey
 * Drawer on /admin/traffic alongside device info, dwell time, and action trail.
 *
 * @file src/app/api/track/feedback/route.ts
 */

import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  classifyUserAgent,
  cleanRefTag,
  isTrackablePath,
  normalizePath,
  utcDay,
  visitorHash,
} from "@/lib/analytics/pageViewClassify";
import { auth } from "@/lib/auth/auth";
import { executeQuery } from "@/lib/database/connection";
import { rateLimit } from "@/lib/rateLimit";
import { recordSessionFeedback } from "@/services/admin/trafficAnalyticsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FeedbackBodySchema = z.object({
  viewId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{8,64}$/)
    .optional()
    .nullable(),
  sessionId: z
    .string()
    .regex(/^[A-Za-z0-9_-]{8,64}$/)
    .optional()
    .nullable(),
  path: z.string().min(1).max(2048),
  refTag: z.string().max(200).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  note: z.string().trim().min(2).max(500),
});

const HASH_SECRET = createHash("sha256")
  .update(
    `pageview-visitor:${process.env.PAGEVIEW_HASH_SECRET ?? process.env.AUTH_SECRET ?? randomBytes(32).toString("hex")}`,
  )
  .digest("hex");

function clientIp(request: NextRequest): string {
  const candidates = [
    request.headers.get("x-forwarded-for")?.split(",")[0],
    request.headers.get("x-real-ip"),
  ];
  return candidates.map((c) => c?.trim() ?? "").find((c) => c.length > 0) ?? "unknown";
}

async function sessionUserId(): Promise<string | null> {
  try {
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

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "cross-site rejected" }, { status: 403 });
  }

  const limited = await rateLimit(request, { window: 60_000, max: 15, bucket: "feedback" });
  if (!limited.allowed) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = FeedbackBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const path = normalizePath(parsed.data.path) ?? "/";
  if (!isTrackablePath(path)) {
    return NextResponse.json({ success: true });
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const ua = classifyUserAgent(userAgent);
  if (ua.isBot) {
    return NextResponse.json({ success: true });
  }

  const now = new Date();
  const ok = await recordSessionFeedback({
    viewId: parsed.data.viewId ?? null,
    sessionId: parsed.data.sessionId ?? null,
    visitorHash: visitorHash({
      secret: HASH_SECRET,
      day: utcDay(now),
      ip: clientIp(request),
      userAgent,
    }),
    userId: await sessionUserId(),
    path,
    refTag: cleanRefTag(parsed.data.refTag),
    rating: parsed.data.rating ?? null,
    note: parsed.data.note.trim().slice(0, 500),
  });

  return NextResponse.json({ success: ok });
}
