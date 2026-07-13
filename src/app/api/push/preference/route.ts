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
    // Set the WHOLE push object, not '{push,enabled}': jsonb_set with a nested
    // path is a NO-OP when the 'push' key doesn't already exist (all earlier
    // path elements must be present), which would silently drop an opt-out and
    // leave queueWebPush sending (fail-open consent bug). Writing '{push}' with
    // jsonb_build_object creates it whether or not 'push' existed. Merge (||)
    // preserves any other keys already inside preferences.push.
    await executeQuery(
      `UPDATE users
          SET preferences = jsonb_set(
                COALESCE(preferences, '{}'::jsonb),
                '{push}',
                COALESCE(preferences->'push', '{}'::jsonb) || jsonb_build_object('enabled', $2::boolean),
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
