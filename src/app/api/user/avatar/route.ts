/**
 * POST /api/user/avatar — upload the caller's avatar (data-URL body, same
 * pipeline as /api/food-lab/upload → share). DELETE — clear it.
 *
 * The avatar lives at user_profiles.avatar_url (migration 64); the old R2
 * object is deleted best-effort when the key changes (deleteAvatarObject
 * only ever deletes under the caller's own avatars/<userId>/ prefix). The
 * FIRST-ever avatar set is the row transition `visage_revealed` hangs off
 * (SERVER_ONLY practice — the ever-dedupe in the practice ledger makes
 * repeat calls silent).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import {
  avatarStorageConfigured,
  deleteAvatarObject,
  storeAvatar,
} from "@/lib/profile/avatarStorage";
import { rateLimit } from "@/lib/rateLimit";
import { practiceRewardService } from "@/services/practiceRewardService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function currentAvatarUrl(userId: string): Promise<string | null> {
  const res = await executeQuery<{ avatar_url: string | null }>(
    `SELECT avatar_url FROM user_profiles WHERE user_id = $1::uuid`,
    [userId],
  );
  return res.rows[0]?.avatar_url ?? null;
}

async function writeAvatarUrl(userId: string, avatarUrl: string | null): Promise<void> {
  await executeQuery(
    `INSERT INTO user_profiles (user_id, avatar_url)
     VALUES ($1::uuid, $2)
     ON CONFLICT (user_id) DO UPDATE SET avatar_url = EXCLUDED.avatar_url`,
    [userId, avatarUrl],
  );
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 5 * 60_000, max: 5, bucket: "avatar", identifier: userId });
  if (!rl.allowed) return rl.response!;

  if (!avatarStorageConfigured()) {
    return NextResponse.json(
      { success: false, message: "Avatar storage is not configured" },
      { status: 503 },
    );
  }

  let body: { photoDataUrl?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }
  if (typeof body.photoDataUrl !== "string") {
    return NextResponse.json({ success: false, message: "photoDataUrl is required" }, { status: 400 });
  }

  try {
    const avatarUrl = await storeAvatar(userId, body.photoDataUrl);
    if (!avatarUrl) {
      return NextResponse.json(
        { success: false, message: "Image must be a jpeg/png/webp data URL under 5MB" },
        { status: 422 },
      );
    }

    const previous = await currentAvatarUrl(userId);
    await writeAvatarUrl(userId, avatarUrl);

    // Replaced a different object → clear the old one (own-prefix guarded).
    if (previous && previous !== avatarUrl) {
      void deleteAvatarObject(userId, previous);
    }

    // First-ever visage: the ever-dedupe in the ledger keeps this once-only.
    let reward: { tokenType: string; amount: number; hint: string } | null = null;
    const result = await practiceRewardService.recognize(userId, "visage_revealed");
    if (result.rewarded && result.tokenType && result.amount && result.hint) {
      reward = { tokenType: result.tokenType, amount: result.amount, hint: result.hint };
    }

    return NextResponse.json({ success: true, avatarUrl, reward });
  } catch (error) {
    console.error("[user/avatar] POST failed:", error);
    return NextResponse.json({ success: false, message: "Avatar upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const rl = await rateLimit(request, { window: 5 * 60_000, max: 5, bucket: "avatar", identifier: userId });
  if (!rl.allowed) return rl.response!;

  try {
    const previous = await currentAvatarUrl(userId);
    await writeAvatarUrl(userId, null);
    if (previous) {
      void deleteAvatarObject(userId, previous);
    }
    return NextResponse.json({ success: true, avatarUrl: null });
  } catch (error) {
    console.error("[user/avatar] DELETE failed:", error);
    return NextResponse.json({ success: false, message: "Avatar removal failed" }, { status: 500 });
  }
}
