/**
 * Save Group API Route
 *
 * POST /api/commensal/save-group
 * Persists a guest commensal session for an authenticated user. Saves each
 * guest as a manual companion (in `manual_companion_charts`) and registers a
 * `DiningGroup` containing them in the user's profile.
 *
 * Skips the legacy `groupMembers` JSONB validation used by
 * `/api/user/dining-groups` because new manual companions are stored in the
 * dedicated table, not in the legacy profile blob.
 */

import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { _logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";
import { CommensalSaveGroupRequestSchema } from "@/lib/validation/apiSchemas";
import { commensalDatabase } from "@/services/commensalDatabaseService";
import type {
  DiningGroup,
  GroupMember,
} from "@/types/natalChart";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Authenticated, but each guest is a natal-chart-sized JSONB insert — cap the
// write volume per user.
const SAVE_GROUP_LIMIT = {
  window: 60_000,
  max: 10,
  bucket: "commensal-save-group",
} as const;

export async function POST(request: NextRequest) {
  const user = await getDatabaseUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const rl = await rateLimit(request, {
    ...SAVE_GROUP_LIMIT,
    identifier: user.id,
  });
  if (!rl.allowed) return rl.response!;

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  const parsed = CommensalSaveGroupRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    const [firstIssue] = parsed.error.issues;
    return NextResponse.json(
      { success: false, message: firstIssue?.message ?? "Invalid request body" },
      { status: 400 },
    );
  }

  const { groupName, guests } = parsed.data;

  // Persist companions AND register the group atomically. Everything runs on
  // ONE transaction client — the companion inserts and the dining-group
  // profile dual-write below — so a failure anywhere rolls the entire write
  // back. No other pooled connections are acquired inside the transaction
  // (hold-and-acquire under concurrency would starve the small pool).
  const existingGroups = user.profile.diningGroups ?? [];
  let newGroup: DiningGroup | null = null;

  const created: GroupMember[] | null =
    await commensalDatabase.createManualCompanionsAtomic(
      user.id,
      guests.map((g) => ({
        name: g.name,
        relationship: g.relationship ?? "friend",
        birthData: g.birthData,
        natalChart: g.natalChart,
      })),
      async (members, client) => {
        const now = new Date().toISOString();
        const group: DiningGroup = {
          id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: groupName.trim(),
          memberIds: members.map((m) => m.id),
          createdAt: now,
          updatedAt: now,
        };

        // Dual-write the profile the same way updateUserProfile does — but on
        // the transaction client so it commits/rolls back with the companion
        // inserts. user_profiles columns are canonical; users.profile JSONB is
        // kept in lockstep. (No user re-read: the route already loaded it.)
        const updatedProfile = {
          ...user.profile,
          diningGroups: [...existingGroups, group],
          userId: user.id,
        };
        updatedProfile.onboardingComplete =
          updatedProfile.onboardingComplete ??
          !!(updatedProfile.birthData && updatedProfile.natalChart);
        const onboardingComplete = updatedProfile.onboardingComplete === true;

        await client.query(
          `UPDATE users SET profile = $2, preferences = $3, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1::uuid`,
          [
            user.id,
            JSON.stringify(updatedProfile),
            JSON.stringify(updatedProfile.preferences ?? {}),
          ],
        );
        await client.query(
          `INSERT INTO user_profiles (user_id, name, birth_data, natal_chart, group_members, dining_groups, onboarding_completed)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id) DO UPDATE SET
             name = EXCLUDED.name,
             birth_data = EXCLUDED.birth_data,
             natal_chart = EXCLUDED.natal_chart,
             group_members = EXCLUDED.group_members,
             dining_groups = EXCLUDED.dining_groups,
             onboarding_completed = EXCLUDED.onboarding_completed,
             onboarding_completed_at = CASE WHEN EXCLUDED.onboarding_completed AND NOT COALESCE(user_profiles.onboarding_completed, false) THEN CURRENT_TIMESTAMP ELSE user_profiles.onboarding_completed_at END,
             updated_at = CURRENT_TIMESTAMP`,
          [
            user.id,
            updatedProfile.name ?? "",
            JSON.stringify(updatedProfile.birthData ?? {}),
            JSON.stringify(updatedProfile.natalChart ?? {}),
            JSON.stringify(updatedProfile.groupMembers ?? []),
            JSON.stringify(updatedProfile.diningGroups || []),
            onboardingComplete,
          ],
        );

        newGroup = group;
      },
    );

  if (!created || !newGroup) {
    _logger.error(
      `[POST /api/commensal/save-group] Atomic save failed for user ${user.id} — rolled back`,
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save the group. Nothing was saved — please try again.",
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
