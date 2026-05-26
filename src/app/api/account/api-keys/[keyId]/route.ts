/**
 * DELETE /api/account/api-keys/[keyId] — soft-revoke a key.
 *
 * Sets `api_keys.is_active = false` rather than hard-deleting, so the
 * `mcp_invocations.api_key_id` FK chain (ON DELETE SET NULL) keeps
 * historical telemetry attributable.
 *
 * @file src/app/api/account/api-keys/[keyId]/route.ts
 */

import { NextResponse } from "next/server";
import { revokeApiKey } from "@/lib/api-keys/queries";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const REVOKE_LIMIT = {
  window: 60_000,
  max: 30,
  bucket: "api-keys:revoke",
};

interface Params {
  params: Promise<{ keyId: string }>;
}

async function resolveUserId(request: Request): Promise<string | null> {
  const session = await auth();
  const user = session?.user as { id?: string } | undefined;
  if (user?.id) return user.id;

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const { validateToken } = await import("@/lib/auth/validateRequest");
      const result = await validateToken(authHeader.slice(7));
      if (result.valid && result.user) return result.user.userId;
    } catch {
      /* fall through */
    }
  }
  return null;
}

export async function DELETE(request: Request, { params }: Params) {
  const rl = await rateLimit(request, REVOKE_LIMIT);
  if (!rl.allowed) return rl.response!;

  const userId = await resolveUserId(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { keyId } = await params;
  if (!keyId) {
    return NextResponse.json(
      { success: false, error: "Missing keyId" },
      { status: 400 },
    );
  }

  try {
    const revokedId = await revokeApiKey(userId, keyId);
    if (!revokedId) {
      return NextResponse.json(
        { success: false, error: "Key not found or already revoked" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, revoked: revokedId });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to revoke api key",
        detail: process.env.NODE_ENV === "development" ? String(err) : undefined,
      },
      { status: 500 },
    );
  }
}
