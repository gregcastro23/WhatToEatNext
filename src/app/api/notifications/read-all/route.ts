/**
 * Mark All Notifications as Read API Route
 * PUT /api/notifications/read-all - Mark all of user's notifications as read
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const count = await notificationDatabase.markAllAsRead(userId);

  return NextResponse.json({ success: true, count });
}
