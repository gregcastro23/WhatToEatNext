/**
 * Save Group API Route
 *
 * POST /api/commensal/save-group
 * Persists a guest commensal session for an authenticated user. Saves each
 * guest as a manual companion (in `manual_companion_charts`) and registers a
 * `DiningGroup` containing them in `user.profile.diningGroups`.
 *
 * Skips the legacy `groupMembers` JSONB validation used by
 * `/api/user/dining-groups` because new manual companions are stored in the
 * dedicated table, not in the legacy profile blob.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
import type {
  BirthData,
  DiningGroup,
  GroupMember,
  NatalChart,
} from "@/types/natalChart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SaveGuest {
  name: string;
  relationship?: GroupMember["relationship"];
  birthData: BirthData;
  natalChart: NatalChart;
}

function isValidBirthData(b: unknown): b is BirthData {
  if (!b || typeof b !== "object") return false;
  const data = b as Record<string, unknown>;
  return (
    typeof data.dateTime === "string" &&
    typeof data.latitude === "number" &&
    typeof data.longitude === "number"
  );
}

function isValidNatalChart(n: unknown): n is NatalChart {
  if (!n || typeof n !== "object") return false;
  const data = n as Record<string, unknown>;
  return (
    typeof data.dominantElement === "string" &&
    typeof data.elementalBalance === "object" &&
    data.elementalBalance !== null
  );
}

export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
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

  const { groupName, guests } = body as {
    groupName?: string;
    guests?: SaveGuest[];
  };

  if (typeof groupName !== "string" || groupName.trim().length === 0) {
    return NextResponse.json(
      { success: false, message: "groupName is required" },
      { status: 400 },
    );
  }
  if (!Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json(
      { success: false, message: "guests array must not be empty" },
      { status: 400 },
    );
  }

  for (const [i, g] of guests.entries()) {
    if (!g?.name || typeof g.name !== "string") {
      return NextResponse.json(
        { success: false, message: `Guest ${i + 1}: name is required` },
        { status: 400 },
      );
    }
    if (!isValidBirthData(g.birthData)) {
      return NextResponse.json(
        {
          success: false,
          message: `Guest ${i + 1} (${g.name}): birthData incomplete`,
        },
        { status: 400 },
      );
    }
    if (!isValidNatalChart(g.natalChart)) {
      return NextResponse.json(
        {
          success: false,
          message: `Guest ${i + 1} (${g.name}): natalChart incomplete`,
        },
        { status: 400 },
      );
    }
  }

  // Persist companions sequentially so a partial failure halts cleanly with
  // a clear error rather than fanning out partially-succeeded inserts.
  const created: GroupMember[] = [];
  for (const g of guests) {
    const member = await commensalDatabase.createManualCompanion({
      ownerId: user.id,
      name: g.name,
      relationship: g.relationship ?? "friend",
      birthData: g.birthData,
      natalChart: g.natalChart,
    });
    if (!member) {
      _logger.error(
        `[POST /api/commensal/save-group] Failed to save companion '${g.name}' for user ${user.id}`,
      );
      return NextResponse.json(
        {
          success: false,
          message: "Failed to save group companions. Please try again.",
        },
        { status: 500 },
      );
    }
    created.push(member);
  }

  const now = new Date().toISOString();
  const newGroup: DiningGroup = {
    id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: groupName.trim(),
    memberIds: created.map((m) => m.id),
    createdAt: now,
    updatedAt: now,
  };

  const existingGroups = user.profile.diningGroups || [];
  try {
    await userDatabase.updateUserProfile(user.id, {
      diningGroups: [...existingGroups, newGroup],
    });
  } catch (error) {
    _logger.error(
      "[POST /api/commensal/save-group] Failed to update profile",
      error as any,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Companions saved, but group registration failed.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      diningGroup: newGroup,
      memberIds: created.map((m) => m.id),
    },
    { status: 201 },
  );
}
