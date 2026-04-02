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
  // Use a controller to abort downstream work if the request is canceled
  const controller = new AbortController();
  const { signal } = controller;

  // Add an 8-second global timeout for this request
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // 1. Get session with defensive error handling and timeout
    const session = await Promise.race([
      auth(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))
    ]).catch(err => {
      console.error("[api/user/subscription] Auth failed or timed out:", err);
      return null;
    }) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shouldSync = searchParams.get("sync") === "true";

    // Use JWT tier as the fallback tier
    const jwtTier = (session.user as Record<string, unknown>).tier as string || "free";
    // Case-insensitive admin check
    const isAdmin = (session.user as Record<string, unknown>).role?.toString().toLowerCase() === "admin";
    const _effectiveFallbackTier = isAdmin ? "premium" : jwtTier;

    if (shouldSync) {
      console.log(`[api/user/subscription] Syncing status for user: ${session.user.id}`);
    }

    // 2. Fetch subscription and usage with timeout/abort signal
    const subscriptionPromise = subscriptionService.getOrCreateSubscription(session.user.id);
    const usagePromise = subscriptionService.getUsage(session.user.id, "recipe_generation");

    // Race against the signal (aborted by the 8s timeout)
    const [subscription, recipeUsage] = await Promise.race([
      Promise.all([subscriptionPromise, usagePromise]),
      new Promise<never>((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Request timed out")));
      })
    ]);

    // Force premium status for admins regardless of DB record
    const isPremium = isAdmin || (subscription.tier === "premium" && subscription.status === "active");
    const tier = isAdmin ? "premium" : subscription.tier;

    return NextResponse.json({
      isPremium,
      tier,
      expiresAt: subscription.currentPeriodEnd,
      status: subscription.status,
      subscription: {
        ...subscription,
        tier // Ensure subscription object reflects admin status
      },
      recipeUsage,
    });
  } catch (error: any) {
    if (error.name === "AbortError" || error.message === "Request timed out") {
      console.warn("[api/user/subscription] Request timed out - returning fallback");
    } else {
      console.error("[api/user/subscription] Error:", error);
    }
    
    // Fallback logic
    const session = await auth().catch(() => null) as any;
    const isAdmin = session?.user?.role?.toString().toLowerCase() === "admin";
    const jwtTier = session?.user?.tier || "free";
    const fallbackTier = isAdmin ? "premium" : jwtTier;
    
    return NextResponse.json(fallbackResponse(fallbackTier));
  } finally {
    clearTimeout(timeoutId);
  }
}
