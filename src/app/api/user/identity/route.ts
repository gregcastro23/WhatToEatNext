/**
 * GET/PATCH /api/user/identity — the caller's identity preferences.
 *
 * GET  → { shareIdentity, avatarUrl }  (missing profile row = shared default)
 * PATCH { shareIdentity: boolean } → upserts user_profiles.share_identity.
 *
 * Small and direct (modeled on /api/user/profile/layout) — deliberately NOT
 * bolted onto the heavy Hono-proxied /api/user/profile. Flipping the setting
 * off retroactively conceals DEFAULT-named posts only; explicit per-post
 * opt-ins and legacy events are untouched (see src/lib/feed/identity.ts).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 10, bucket: "identity", identifier: userId });
  if (!rl.allowed) return rl.response!;

  try {
    const res = await executeQuery<{ share_identity: boolean | null; avatar_url: string | null }>(
      `SELECT share_identity, avatar_url FROM user_profiles WHERE user_id = $1::uuid`,
      [userId],
    );
    const row = res.rows[0];
    return NextResponse.json({
      success: true,
      // No row (or pre-migration NULL) = shared by default — mirrors the
      // resolver's rule-5 semantics.
      shareIdentity: row ? row.share_identity !== false : true,
      avatarUrl: row?.avatar_url ?? null,
    });
  } catch (error) {
    console.error("[user/identity] GET failed:", error);
    return NextResponse.json({ success: false, message: "Failed to load identity settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 10, bucket: "identity", identifier: userId });
  if (!rl.allowed) return rl.response!;

  let body: { shareIdentity?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.shareIdentity !== "boolean") {
    return NextResponse.json({ success: false, message: "shareIdentity must be a boolean" }, { status: 400 });
  }

  try {
    await executeQuery(
      `INSERT INTO user_profiles (user_id, share_identity)
       VALUES ($1::uuid, $2)
       ON CONFLICT (user_id) DO UPDATE SET share_identity = EXCLUDED.share_identity`,
      [userId, body.shareIdentity],
    );
    return NextResponse.json({ success: true, shareIdentity: body.shareIdentity });
  } catch (error) {
    console.error("[user/identity] PATCH failed:", error);
    return NextResponse.json({ success: false, message: "Failed to update identity settings" }, { status: 500 });
  }
}
