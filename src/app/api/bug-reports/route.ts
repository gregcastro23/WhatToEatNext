/**
 * Bug Reports API Route
 *
 * POST /api/bug-reports
 *   body: { title: string, description: string, pageUrl?: string }
 *
 * Persists the report to `bug_reports` and triggers the "Alchemist's Eye"
 * quest via `questService.reportEvent(userId, 'report_bug')`, awarding
 * 15 Spirit tokens on the first submission (see migration 18).
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { executeQuery } from "@/lib/database";
import { questService } from "@/services/QuestService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface BugReportBody {
  title?: string;
  description?: string;
  pageUrl?: string;
}

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let body: BugReportBody;
  try {
    body = (await request.json()) as BugReportBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const title = body.title?.trim();
  const description = body.description?.trim();
  const pageUrl = body.pageUrl?.trim() || null;
  const userAgent = request.headers.get("user-agent") || null;

  if (!title || title.length < 4) {
    return NextResponse.json(
      { success: false, message: "Title is required (min 4 chars)" },
      { status: 400 },
    );
  }
  if (!description || description.length < 10) {
    return NextResponse.json(
      { success: false, message: "Description is required (min 10 chars)" },
      { status: 400 },
    );
  }

  // Persist the bug report. Fail softly if the DB is unreachable so the
  // quest still fires (matches the codebase's memory-fallback pattern).
  try {
    await executeQuery(
      `INSERT INTO bug_reports (user_id, title, description, page_url, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, title.slice(0, 255), description, pageUrl, userAgent],
    );
  } catch (err) {
    // Log but continue — the quest event is the higher-value side effect.
    console.error("[bug-reports] insert failed:", err);
  }

  // Trigger the "Alchemist's Eye" quest.
  const completed = await questService.reportEvent(userId, "report_bug");

  return NextResponse.json({
    success: true,
    completedQuests: completed,
    message:
      completed.length > 0
        ? "🏆 Bug report received — Spirit tokens awarded."
        : "Bug report received. Thank you, Premium.",
  });
}
