/**
 * Dining Groups API Route
 * GET  /api/user/dining-groups - List dining groups
 * POST /api/user/dining-groups - Create a new dining group
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
import type { DiningGroup } from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: "Authentication required" },
    { status: 401 },
  );
}

/** GET /api/user/dining-groups */
export async function GET(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn("[GET /api/user/dining-groups] User not found or not authenticated");
    return unauthorizedResponse();
  }

  return NextResponse.json({
    success: true,
    diningGroups: user.profile.diningGroups || [],
  });
}

/** POST /api/user/dining-groups */
export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    _logger.warn("[POST /api/user/dining-groups] User not found or not authenticated");
    return unauthorizedResponse();
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
  const { name, memberIds } = body as { name: string; memberIds: string[] };

  if (!name || !Array.isArray(memberIds)) {
    return NextResponse.json(
      { success: false, message: "name and memberIds array are required" },
      { status: 400 },
    );
  }

  // Validate that all memberIds exist as commensals — in EITHER storage:
  // legacy profile JSONB (groupMembers) or the modern manual_companion_charts
  // table (written by /api/user/commensals and save-group).
  const knownIds = new Set((user.profile.groupMembers || []).map((m) => m.id));
  try {
    const tableCompanions = await commensalDatabase.getManualCompanionsForUser(user.id);
    for (const m of tableCompanions) knownIds.add(m.id);
  } catch (error) {
    _logger.error("[POST /api/user/dining-groups] Manual companions lookup failed", error);
  }
  const invalidIds = memberIds.filter((id) => !knownIds.has(id));
  if (invalidIds.length > 0) {
    return NextResponse.json(
      { success: false, message: `Unknown commensal IDs: ${invalidIds.join(", ")}` },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const newGroup: DiningGroup = {
    id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    memberIds,
    createdAt: now,
    updatedAt: now,
  };

  const existing = user.profile.diningGroups || [];
  try {
    await userDatabase.updateUserProfile(user.id, { diningGroups: [...existing, newGroup] });
    return NextResponse.json({ success: true, diningGroup: newGroup }, { status: 201 });
  } catch (error) {
    _logger.error("[POST /api/user/dining-groups] Failed to update profile", error);
    return NextResponse.json({ success: false, message: "Failed to create dining group" }, { status: 500 });
  }
}
