/**
 * Community Feed API Route
 * GET /api/feed - Fetch recent community feed events
 */

import { NextResponse } from "next/server";
import { feedDatabase } from "@/services/feedDatabaseService";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const events = await feedDatabase.getRecentEvents(limit, offset);

    return NextResponse.json({
      success: true,
      events
    });
  } catch (error) {
    console.error("Feed fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch feed events." },
      { status: 500 }
    );
  }
}
