/**
 * POST /api/push/preference  {enabled: boolean}
 *
 * Thin toggle for the per-user push opt-out gate (queueWebPush gate 3). Stored
 * at users.preferences->'push'->>'enabled'. Default (no key) is enabled — this
 * only records an explicit off/on. Browser permission remains the real opt-in.
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 20, bucket: "push-preference", identifier: userId });
  if (!rl.allowed) return rl.response!;

  let enabled: boolean;
  try {
    const body = (await request.json()) as { enabled?: unknown };
    enabled = body.enabled === true;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  try {
    // Merge into the existing preferences JSONB, creating the push object if absent.
    await executeQuery(
      `UPDATE users
          SET preferences = jsonb_set(
                COALESCE(preferences, '{}'::jsonb),
                '{push,enabled}',
                to_jsonb($2::boolean),
                true)
        WHERE id = $1::uuid`,
      [userId, enabled],
    );
    return NextResponse.json({ success: true, enabled });
  } catch (error) {
    console.error("[push/preference] failed:", error);
    return NextResponse.json({ success: false, message: "Failed to update preference" }, { status: 500 });
  }
}
