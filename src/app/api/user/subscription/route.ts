/**
 * User Subscription API — GET current subscription status and usage
 *
 * @file src/app/api/user/subscription/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shouldSync = searchParams.get("sync") === "true";

  try {
    // If sync=true requested, we could optionally verify against Stripe here
    // For now, we trust the DB which is kept in sync via webhooks
    if (shouldSync) {
      console.log(`[api/user/subscription] Syncing status for user: ${session.user.id}`);
      // In a real production app, you might call stripe.subscriptions.retrieve() here
      // if you have a stripeSubscriptionId stored.
    }

    const subscription = await subscriptionService.getOrCreateSubscription(
      session.user.id,
    );
    const recipeUsage = await subscriptionService.getUsage(
      session.user.id,
      "recipe_generation",
    );

    return NextResponse.json({
      isPremium: subscription.tier === "premium" && subscription.status === "active",
      tier: subscription.tier,
      expiresAt: subscription.currentPeriodEnd,
      status: subscription.status,
      subscription,
      recipeUsage,
    });
  } catch (error) {
    console.error("[api/user/subscription] Error:", error);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 },
    );
  }
}
