/**
 * Mark Notification as Read API Route
 * PUT /api/notifications/[id]/read - Mark a single notification as read
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { notificationDatabase } from "@/services/notificationDatabaseService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  const { id } = await params;
  const updated = await notificationDatabase.markAsRead(id, userId);

  if (!updated) {
    return NextResponse.json(
      { success: false, message: "Notification not found or not yours" },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true });
}
