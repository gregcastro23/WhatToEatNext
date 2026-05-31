import { NextResponse } from "next/server";
import { feedDatabase } from "@/services/feedDatabaseService";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const events = await feedDatabase.getEventsByActor(userId, limit, offset);

    return NextResponse.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error("[GET /api/users/:userId/feed] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user feed events." },
      { status: 500 },
    );
  }
}
