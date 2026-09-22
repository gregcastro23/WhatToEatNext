/**
 * Code-health snapshot ingest (CI → DB).
 * POST /api/admin/code-health/ingest
 *
 * Called by the `code-health` job in .github/workflows/ci.yml on every push to
 * master with the JSON produced by scripts/codeHealthSnapshot.ts. Upserts one
 * row per (commit, source) into code_health_snapshots.
 *
 * Auth: `Authorization: Bearer <CODE_HEALTH_INGEST_SECRET>` — a dedicated
 * secret held by GitHub Actions and Vercel only. Unset → every call is 401
 * (fail closed), and CI skips the post instead of failing.
 */

import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { _logger } from "@/lib/logger";
import { CodeHealthSnapshotInputSchema, ingestCodeHealthSnapshot } from "@/services/admin/codeHealthIngest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authorized(request: NextRequest): boolean {
  const secret = process.env.CODE_HEALTH_INGEST_SECRET;
  if (!secret) return false;
  const provided = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!authorized(request)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = CodeHealthSnapshotInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Invalid snapshot", issues: parsed.error.issues.slice(0, 10) },
      { status: 400 },
    );
  }

  try {
    await ingestCodeHealthSnapshot(parsed.data);
    return NextResponse.json({ success: true, commitSha: parsed.data.commitSha, source: parsed.data.source });
  } catch (err) {
    _logger.error("[code-health/ingest] insert failed:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "insert failed" },
      { status: 500 },
    );
  }
}
