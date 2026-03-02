/**
 * Dining Groups API Route
 * GET  /api/user/dining-groups - List dining groups
 * POST /api/user/dining-groups - Create a new dining group
 */

import { NextResponse } from "next/server";
import { validateRequest, getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { userDatabase } from "@/services/userDatabaseService";
import type { DiningGroup } from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/user/dining-groups */
export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    diningGroups: user.profile.diningGroups || [],
  });
}

/** POST /api/user/dining-groups */
export async function POST(request: NextRequest) {
  const authResult = await validateRequest(request);
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const { name, memberIds } = body as { name: string; memberIds: string[] };

  if (!name || !Array.isArray(memberIds)) {
    return NextResponse.json(
      { success: false, message: "name and memberIds array are required" },
      { status: 400 },
    );
  }

  const userId = authResult.user.userId;
  const user = await userDatabase.getUserById(userId);
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
  }

  // Validate that all memberIds exist as commensals
  const knownIds = new Set((user.profile.groupMembers || []).map((m) => m.id));
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
  await userDatabase.updateUserProfile(userId, { diningGroups: [...existing, newGroup] });

  return NextResponse.json({ success: true, diningGroup: newGroup }, { status: 201 });
}
