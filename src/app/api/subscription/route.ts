/**
 * Subscription API — GET current subscription
 *
 * @file src/app/api/subscription/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const subscription = await subscriptionService.getOrCreateSubscription(
      session.user.id,
    );
    return NextResponse.json({ subscription });
  } catch (error) {
    console.error("[api/subscription] Error:", error);
    // Return a minimal fallback so the frontend always has valid data
    const jwtTier = (session.user as Record<string, unknown>).tier as string || "free";
    return NextResponse.json({
      subscription: { tier: jwtTier, status: "active" },
    });
  }
}
