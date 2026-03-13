/**
 * Subscription API — GET current subscription + usage
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
    const recipeUsage = await subscriptionService.getUsage(
      session.user.id,
      "recipe_generation",
    );

    return NextResponse.json({ subscription, recipeUsage });
  } catch (error) {
    console.error("[api/subscription] Error:", error);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 },
    );
  }
}
