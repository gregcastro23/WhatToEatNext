/**
 * Single Commensal API Route
 * PUT    /api/user/commensals/[commensalId] - Update commensal name / relationship
 * DELETE /api/user/commensals/[commensalId] - Remove commensal
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { userDatabase } from "@/services/userDatabaseService";
import { commensalDatabase } from "@/services/commensalDatabaseService";
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

  // 1. Try legacy JSONB first
  const members = user.profile.groupMembers || [];
  const idx = members.findIndex((m) => m.id === commensalId);
  
  if (idx === -1) {
    // 2. Try the new manual_companion_charts table (if not in legacy)
    const manualCompanions = await commensalDatabase.getManualCompanionsForUser(user.id);
    const manualIdx = manualCompanions.findIndex(m => m.id === commensalId);
    
    if (manualIdx === -1) {
      return NextResponse.json({ success: false, message: "Commensal not found" }, { status: 404 });
    }
    
    // For now, if they are in the table, we'll support updating them there
    // Actually, I haven't implemented updateManualCompanion yet, so I'll just focus on DELETE for now
    // and return 404 for PUT if not in legacy (MVP)
    return NextResponse.json({ success: false, message: "Update for non-legacy companions not yet implemented" }, { status: 501 });
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

  let deletedFromTable = false;
  if (filtered.length === members.length) {
    // Not found in legacy JSONB, try the new table
    deletedFromTable = await commensalDatabase.deleteManualCompanion(commensalId, user.id);
    
    if (!deletedFromTable) {
      return NextResponse.json({ success: false, message: "Commensal not found" }, { status: 404 });
    }
  }

  // Also remove from any dining groups that reference this commensal
  const groups = (user.profile.diningGroups || []).map((g) => ({
    ...g,
    memberIds: g.memberIds.filter((id) => id !== commensalId),
  }));

  try {
    // Save legacy changes (if any) and updated groups
    await userDatabase.updateUserProfile(user.id, { groupMembers: filtered, diningGroups: groups });
    return NextResponse.json({ success: true });
  } catch (error) {
    _logger.error(`[DELETE /api/user/commensals/${commensalId}] Failed to update profile`, error as any);
    return NextResponse.json({ success: false, message: "Failed to remove companion" }, { status: 500 });
  }
}
