/**
 * Admin Feedback Triage API
 * PATCH /api/admin/feedback
 *
 * Updates `session_feedback.status` (`open` | `resolved` | `dismissed`) and
 * `resolved_at` so operators can close the loop on viewer feedback items.
 *
 * @requires Authentication - Admin role required
 * @file src/app/api/admin/feedback/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { updateSessionFeedbackStatus } from "@/services/admin/trafficAnalyticsService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FeedbackTriageBodySchema = z.object({
  id: z.union([z.number().int().positive(), z.string().regex(/^[0-9]+$/)]).transform(String),
  status: z.enum(["open", "resolved", "dismissed"]),
});

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const body: unknown = await request.json().catch(() => null);
  const parsed = FeedbackTriageBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const updated = await updateSessionFeedbackStatus(parsed.data.id, parsed.data.status);
  if (!updated) {
    return NextResponse.json({ error: "feedback item not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, feedback: updated });
}
