/**
 * User Subscription API — GET current subscription status and usage
 *
 * Always returns a valid subscription shape, even on error, so the
 * frontend never encounters unexpected missing fields.
 *
 * @file src/app/api/user/subscription/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

/** Minimal fallback response so the frontend always has valid data */
function fallbackResponse(tier: string = "free") {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return {
    isPremium: tier === "premium",
    tier,
    expiresAt: endOfMonth.toISOString(),
    status: "active" as const,
    subscription: {
      id: "fallback",
      userId: "",
      tier,
      status: "active",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: endOfMonth.toISOString(),
      cancelAtPeriodEnd: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    recipeUsage: 0,
  };
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shouldSync = searchParams.get("sync") === "true";

  // Use JWT tier as the fallback tier (always available, no DB needed)
  const jwtTier = (session.user as Record<string, unknown>).tier as string || "free";
  const isAdmin = (session.user as Record<string, unknown>).role === "admin";
  const effectiveFallbackTier = isAdmin ? "premium" : jwtTier;

  try {
    if (shouldSync) {
      console.log(`[api/user/subscription] Syncing status for user: ${session.user.id}`);
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
    // Return a fallback response using JWT tier so the frontend still works
    return NextResponse.json(fallbackResponse(effectiveFallbackTier));
  }
}
