/**
 * GET /api/admin/chat/reports?status=open — list reported chat messages.
 *
 * The moderation queue behind /admin/chat-reports (docs/plans/pr3-messaging-plan.md §4).
 * Backed by chatDatabase.listReports; joins message body + hidden state for the
 * admin view. Admin only.
 *
 * @file src/app/api/admin/chat/reports/route.ts
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { chatDatabase } from "@/services/chatDatabaseService";
import type { MessageReportStatus } from "@/types/chat";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATUSES = new Set<MessageReportStatus>([
  "open",
  "reviewed",
  "dismissed",
  "actioned",
]);

export async function GET(request: NextRequest) {
  const auth = await validateAdminRequest(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const statusRaw = searchParams.get("status");
  const status =
    statusRaw && STATUSES.has(statusRaw as MessageReportStatus)
      ? (statusRaw as MessageReportStatus)
      : undefined;
  const limit = Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50;

  try {
    const reports = await chatDatabase.listReports({ status, limit });
    return NextResponse.json({ success: true, reports });
  } catch (error) {
    console.error("[admin/chat/reports] GET failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load reports" },
      { status: 500 },
    );
  }
}
