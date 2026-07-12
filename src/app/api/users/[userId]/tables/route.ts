/**
 * GET /api/users/:userId/tables — Table Memories for the profile gallery
 * (?scope=hosted|attended, status='memory' only, visibility-gated).
 *
 * PR 2 DEPENDENCY (graceful degradation, plan §8): the real implementation is
 * `tableDatabaseService.listMemoriesForUser`, a method on a service that only
 * exists on the PR 2 (feat/tables-entity) branch. Until the PR 2 integration
 * rebase lands (see docs/plans/pr4-pr2-integration-followups.md), this route
 * returns 404 in ALL cases — with or without the tables schema — and the
 * TableMemoriesGallery hides itself on 404. The to_regclass probe below keeps
 * the degradation observable in logs once the schema ships.
 */

import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/database";
import { rateLimit } from "@/lib/rateLimit";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  if (!userId || !UUID.test(userId)) {
    return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
  }

  const rl = await rateLimit(request, { window: 60_000, max: 60, bucket: "table-memories" });
  if (!rl.allowed) return rl.response!;

  try {
    const reg = await executeQuery<{ present: boolean }>(
      `SELECT to_regclass('public.tables') IS NOT NULL AS present`,
    );
    if (reg.rows[0]?.present === true) {
      // Schema exists but the service wiring is deferred to the PR 2
      // integration rebase — make that visible to operators.
      console.warn(
        "[users/:userId/tables] tables schema present but listMemoriesForUser wiring pending — see docs/plans/pr4-pr2-integration-followups.md",
      );
    }
  } catch {
    // Probe failure changes nothing — the route degrades to 404 either way.
  }

  return NextResponse.json(
    { success: false, message: "Table memories unavailable" },
    { status: 404 },
  );
}
