/**
 * Notifications List API Route
 * GET /api/notifications - List user's notifications
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const unreadOnly = url.searchParams.get("unreadOnly") === "true";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 50);
  const offset = parseInt(url.searchParams.get("offset") || "0", 10);

  const [notifications, unreadCount] = await Promise.all([
    notificationDatabase.getNotificationsForUser(userId, { unreadOnly, limit, offset }),
    notificationDatabase.getUnreadCount(userId),
  ]);

  return NextResponse.json({
    success: true,
    notifications,
    unreadCount,
    total: notifications.length,
  });
}
