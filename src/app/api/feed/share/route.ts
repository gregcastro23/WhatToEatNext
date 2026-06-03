import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { feedDatabase } from "@/services/feedDatabaseService";
import { questService } from "@/services/QuestService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shareType, shareName, payload } = body;

    if (!shareType) {
      return NextResponse.json(
        { success: false, message: "shareType is required" },
        { status: 400 }
      );
    }

    let eventType: string;
    let questEvent: string;

    if (shareType === "menu") {
      eventType = "weekly_menu";
      questEvent = "share_menu_feed";
    } else if (shareType === "recipe") {
      eventType = "recipe_generation";
      questEvent = "share_recipe_feed";
    } else if (shareType === "preferences") {
      eventType = "share_preferences_feed";
      questEvent = "share_preferences_feed";
    } else {
      return NextResponse.json(
        { success: false, message: `Invalid shareType: ${shareType}` },
        { status: 400 }
      );
    }

    // Build metadata payload, ensuring shareName is passed
    const metadataPayload = {
      ...(payload || {}),
      shareName: shareName === true,
    };

    // 1. Record the feed event
    const success = await feedDatabase.createEvent(userId, eventType, metadataPayload, true);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to post to feed" },
        { status: 500 }
      );
    }

    // 2. Report the quest event to QuestService
    const completedQuests = await questService.reportEvent(userId, questEvent);

    return NextResponse.json({
      success: true,
      message: "Successfully shared to community feed!",
      completedQuests,
    });
  } catch (error) {
    console.error("Feed share POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
