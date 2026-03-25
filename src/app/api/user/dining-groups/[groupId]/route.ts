/**
 * Single Dining Group API Route
 * PUT    /api/user/dining-groups/[groupId] - Update group name or members
 * DELETE /api/user/dining-groups/[groupId] - Remove dining group
 */

import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PUT /api/user/dining-groups/[groupId] */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.userId;

  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const groups = user.profile.diningGroups || [];
  const idx = groups.findIndex((g) => g.id === groupId);
  if (idx === -1) {
    return NextResponse.json({ success: false, message: "Dining group not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }
  const { name, memberIds } = body;

  // Validate memberIds if provided
  if (memberIds) {
    const knownIds = new Set((user.profile.groupMembers || []).map((m) => m.id));
    const invalid = (memberIds as string[]).filter((id) => !knownIds.has(id));
    if (invalid.length > 0) {
      return NextResponse.json(
        { success: false, message: `Unknown commensal IDs: ${invalid.join(", ")}` },
        { status: 400 },
      );
    }
  }

  groups[idx] = {
    ...groups[idx],
    ...(name ? { name } : {}),
    ...(memberIds ? { memberIds } : {}),
    updatedAt: new Date().toISOString(),
  };

  await userDatabase.updateUserProfile(userId, { diningGroups: groups });

  return NextResponse.json({ success: true, diningGroup: groups[idx] });
}

/** DELETE /api/user/dining-groups/[groupId] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const userId = authResult.user.userId;

  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const groups = user.profile.diningGroups || [];
  const filtered = groups.filter((g) => g.id !== groupId);

  if (filtered.length === groups.length) {
    return NextResponse.json({ success: false, message: "Dining group not found" }, { status: 404 });
  }

  await userDatabase.updateUserProfile(userId, { diningGroups: filtered });
  return NextResponse.json({ success: true });
}
