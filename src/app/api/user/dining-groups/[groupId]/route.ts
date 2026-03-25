/**
 * Single Dining Group API Route
 * PUT    /api/user/dining-groups/[groupId] - Update group name or members
 * DELETE /api/user/dining-groups/[groupId] - Remove dining group
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";
import { _logger } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PUT /api/user/dining-groups/[groupId] */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn(`[PUT /api/user/dining-groups/${groupId}] User not found or not authenticated`);
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
  const { name, memberIds } = body as { name?: string; memberIds?: string[] };

  // Validate memberIds if provided
  if (memberIds) {
    const knownIds = new Set((user.profile.groupMembers || []).map((m) => m.id));
    const invalid = memberIds.filter((id) => !knownIds.has(id));
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

  try {
    await userDatabase.updateUserProfile(user.id, { diningGroups: groups });
    return NextResponse.json({ success: true, diningGroup: groups[idx] });
  } catch (error) {
    _logger.error(`[PUT /api/user/dining-groups/${groupId}] Failed to update profile`, error as any);
    return NextResponse.json({ success: false, message: "Failed to update dining group" }, { status: 500 });
  }
}

/** DELETE /api/user/dining-groups/[groupId] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) {
  const { groupId } = await params;
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn(`[DELETE /api/user/dining-groups/${groupId}] User not found or not authenticated`);
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const groups = user.profile.diningGroups || [];
  const filtered = groups.filter((g) => g.id !== groupId);

  if (filtered.length === groups.length) {
    return NextResponse.json({ success: false, message: "Dining group not found" }, { status: 404 });
  }

  try {
    await userDatabase.updateUserProfile(user.id, { diningGroups: filtered });
    return NextResponse.json({ success: true });
  } catch (error) {
    _logger.error(`[DELETE /api/user/dining-groups/${groupId}] Failed to update profile`, error as any);
    return NextResponse.json({ success: false, message: "Failed to remove dining group" }, { status: 500 });
  }
}
