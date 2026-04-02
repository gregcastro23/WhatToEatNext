/**
 * Single Commensal API Route
 * PUT    /api/user/commensals/[commensalId] - Update commensal name / relationship
 * DELETE /api/user/commensals/[commensalId] - Remove commensal
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PUT /api/user/commensals/[commensalId] */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ commensalId: string }> },
) {
  const { commensalId } = await params;
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn(`[PUT /api/user/commensals/${commensalId}] User not found or not authenticated`);
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const members = user.profile.groupMembers || [];
  const idx = members.findIndex((m) => m.id === commensalId);
  if (idx === -1) {
    return NextResponse.json({ success: false, message: "Commensal not found" }, { status: 404 });
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
  const { name, relationship } = body as { name?: string; relationship?: string };

  const updated = { ...members[idx] };
  if (name) updated.name = name;
  if (relationship) updated.relationship = relationship as any;

  members[idx] = updated;
  try {
    await userDatabase.updateUserProfile(user.id, { groupMembers: members });
    return NextResponse.json({ success: true, commensal: updated });
  } catch (error) {
    _logger.error(`[PUT /api/user/commensals/${commensalId}] Failed to update profile`, error as any);
    return NextResponse.json({ success: false, message: "Failed to update companion" }, { status: 500 });
  }
}

/** DELETE /api/user/commensals/[commensalId] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commensalId: string }> },
) {
  const { commensalId } = await params;
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn(`[DELETE /api/user/commensals/${commensalId}] User not found or not authenticated`);
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const members = user.profile.groupMembers || [];
  const filtered = members.filter((m) => m.id !== commensalId);

  if (filtered.length === members.length) {
    return NextResponse.json({ success: false, message: "Commensal not found" }, { status: 404 });
  }

  // Also remove from any dining groups that reference this commensal
  const groups = (user.profile.diningGroups || []).map((g) => ({
    ...g,
    memberIds: g.memberIds.filter((id) => id !== commensalId),
  }));

  try {
    await userDatabase.updateUserProfile(user.id, { groupMembers: filtered, diningGroups: groups });
    return NextResponse.json({ success: true });
  } catch (error) {
    _logger.error(`[DELETE /api/user/commensals/${commensalId}] Failed to update profile`, error as any);
    return NextResponse.json({ success: false, message: "Failed to remove companion" }, { status: 500 });
  }
}
