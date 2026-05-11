/**
 * Community Feed API Route
 * GET /api/feed - Fetch recent community feed events
 */

import { NextResponse } from "next/server";
import { feedDatabase } from "@/services/feedDatabaseService";
import { userDatabase } from "@/services/userDatabaseService";
import { subscriptionService } from "@/services/subscriptionService";

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

export async function POST(request: Request) {
  try {
    // Basic service-to-service auth check
    const authHeader = request.headers.get("Authorization");
    const internalSecret = process.env.INTERNAL_API_SECRET;
    
    if (internalSecret && authHeader !== `Bearer ${internalSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentEmail, eventType, metadataPayload } = body;

    if (!agentEmail || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await userDatabase.getUserByEmail(agentEmail);
    if (!user || !user.isAgent) {
      return NextResponse.json({ error: "Invalid agent email" }, { status: 404 });
    }

    // Ensure agentic users are on the premium tier to allow all interactions
    const sub = await subscriptionService.getUserSubscription(user.id);
    if (!sub || sub.tier !== "premium") {
      console.log(`[Feed API] Auto-upgrading agent ${agentEmail} to premium tier.`);
      await subscriptionService.getOrCreateSubscription(user.id);
      await subscriptionService.updateSubscription(user.id, { 
        tier: "premium", 
        status: "active" 
      });
    }

    const success = await feedDatabase.createEvent(user.id, eventType, metadataPayload || {});

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error("Database insertion failed");
    }

  } catch (error) {
    console.error("[Feed Webhook] Error processing agent event:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}
