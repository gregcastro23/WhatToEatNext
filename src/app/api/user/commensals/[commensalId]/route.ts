/**
 * Single Commensal API Route
 * PUT    /api/user/commensals/[commensalId] - Update commensal name / relationship
 * DELETE /api/user/commensals/[commensalId] - Remove commensal
 */

import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** PUT /api/user/commensals/[commensalId] */
export async function PUT(
  request: NextRequest,
  { params }: { params: { commensalId: string } },
) {
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const { commensalId } = params;
  const userId = authResult.user.userId;

  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  const members = user.profile.groupMembers || [];
  const idx = members.findIndex((m) => m.id === commensalId);
  if (idx === -1) {
    return NextResponse.json({ success: false, message: "Commensal not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, relationship } = body;

  const updated = { ...members[idx] };
  if (name) updated.name = name;
  if (relationship) updated.relationship = relationship;

  members[idx] = updated;
  await userDatabase.updateUserProfile(userId, { groupMembers: members });

  return NextResponse.json({ success: true, commensal: updated });
}

/** DELETE /api/user/commensals/[commensalId] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { commensalId: string } },
) {
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const { commensalId } = params;
  const userId = authResult.user.userId;

  const user = await userDatabase.getUserById(userId);
  if (!user) {
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

  await userDatabase.updateUserProfile(userId, { groupMembers: filtered, diningGroups: groups });

  return NextResponse.json({ success: true });
}
