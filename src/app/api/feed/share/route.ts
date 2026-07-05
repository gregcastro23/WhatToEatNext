import { NextResponse } from "next/server";
import { getDatabaseUserFromRequest } from "@/lib/auth/validateRequest";
import { buildCookCardIdentity } from "@/lib/feed/cookCard";
import { storeCookPhoto } from "@/lib/feed/cookPhotoStorage";
import { nextLunarTable } from "@/lib/feed/lunarTables";
import { rateLimit } from "@/lib/rateLimit";
import { feedDatabase } from "@/services/feedDatabaseService";
import { questService } from "@/services/QuestService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await getDatabaseUserFromRequest(request);
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const rl = await rateLimit(request, { window: 60_000, max: 10, bucket: "feed-share", identifier: userId });
    if (!rl.allowed) return rl.response!;

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
    let cardExtras: Record<string, unknown> = {};

    if (shareType === "menu") {
      eventType = "weekly_menu";
      questEvent = "share_menu_feed";
    } else if (shareType === "recipe") {
      eventType = "recipe_generation";
      questEvent = "share_recipe_feed";
    } else if (shareType === "preferences") {
      eventType = "share_preferences_feed";
      questEvent = "share_preferences_feed";
    } else if (shareType === "cooked") {
      // Cooked-it dish card: chart-persona identity + transit line, computed
      // once at share time; photo (a data URL from /api/food-lab/upload) is
      // persisted to R2 so the feed row carries a URL, not base64. Posts made
      // while a lunar table is open attach to it automatically.
      eventType = "made_it";
      questEvent = "share_recipe_feed";

      const recipeName = typeof payload?.recipeName === "string" ? payload.recipeName.slice(0, 160) : null;
      if (!recipeName) {
        return NextResponse.json(
          { success: false, message: "payload.recipeName is required for cooked shares" },
          { status: 400 }
        );
      }

      const identity = await buildCookCardIdentity(user.profile?.natalChart ?? null);

      let photoUrl: string | null = null;
      if (typeof payload?.photoDataUrl === "string") {
        photoUrl = await storeCookPhoto(userId, payload.photoDataUrl);
      }

      const table = nextLunarTable();
      cardExtras = {
        card: "cooked",
        persona: identity.persona,
        signature: identity.signature,
        transitLine: identity.transitLine,
        photoUrl,
        tableKey: table?.isOpen ? table.key : null,
      };
    } else {
      return NextResponse.json(
        { success: false, message: `Invalid shareType: ${shareType}` },
        { status: 400 }
      );
    }

    // Build metadata payload, ensuring shareName is passed. Cooked cards are
    // ALWAYS pseudonymous (chart-persona) — shareName stays false so the feed
    // never attaches a real name to a dish post.
    const { photoDataUrl: _dropped, ...safePayload } = (payload || {}) as Record<string, unknown>;
    const metadataPayload = {
      ...safePayload,
      ...cardExtras,
      shareName: shareType === "cooked" ? false : shareName === true,
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
      card: shareType === "cooked" ? cardExtras : undefined,
    });
  } catch (error) {
    console.error("Feed share POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
