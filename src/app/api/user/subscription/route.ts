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
import { createLogger } from "@/utils/logger";

const logger = createLogger("user-subscription");

interface AuthUser {
  id?: string;
  role?: string;
  tier?: string;
  [key: string]: unknown;
}

interface AuthSession {
  user?: AuthUser;
  [key: string]: unknown;
}

/** Minimal fallback response so the frontend always has valid data */
function fallbackResponse(tier = "free"): {
  isPremium: boolean;
  tier: string;
  expiresAt: string;
  status: "active";
  subscription: {
    id: string;
    userId: string;
    tier: string;
    status: string;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
    updatedAt: string;
  };
} {
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
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  // Use a controller to abort downstream work if the request is canceled
  const controller = new AbortController();
  const { signal } = controller;

  // Add an 8-second global timeout for this request
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    // 1. Get session with defensive error handling and timeout
    const session = (await Promise.race([
      auth(),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000))
    ]).catch(err => {
      logger.error("Auth failed or timed out:", err);
      return null;
    })) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const shouldSync = searchParams.get("sync") === "true";

    // Use JWT tier as the fallback tier
    const jwtTier = session.user.tier ?? "free";
    // Case-insensitive admin check
    const isAdmin = session.user.role?.toString().toLowerCase() === "admin";
    const _effectiveFallbackTier = isAdmin ? "premium" : jwtTier;

    if (shouldSync) {
      logger.info(`Syncing status for user: ${session.user.id}`);
    }

    // 2. Fetch subscription with timeout/abort signal.
    // (Recipe-usage counter was removed when the monthly cap was retired —
    // the token economy is the throttle, and the client has no use for it.)
    const subscriptionPromise = subscriptionService.getOrCreateSubscription(session.user.id);

    // Race against the signal (aborted by the 8s timeout)
    const subscription = await Promise.race([
      subscriptionPromise,
      new Promise<never>((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Request timed out")));
      })
    ]);

    // In ESMS Token Economy, all authenticated users have active access
    const isPremium = true;
    const tier = "standard";

    return NextResponse.json({
      isPremium,
      tier,
      expiresAt: subscription.currentPeriodEnd,
      status: "active",
      subscription: {
        ...subscription,
        tier: "standard",
        status: "active",
      },
    });
  } catch (error: unknown) {
    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || error.message === "Request timed out");

    if (isTimeout) {
      logger.warn("Request timed out - returning fallback");
    } else {
      logger.error("Error:", error);
    }

    // Fallback logic
    const session = (await auth().catch(() => null)) as AuthSession | null;
    const isAdmin = session?.user?.role?.toString().toLowerCase() === "admin";
    const jwtTier = session?.user?.tier ?? "free";
    const fallbackTier = isAdmin ? "premium" : jwtTier;

    return NextResponse.json(fallbackResponse(fallbackTier));
  } finally {
    clearTimeout(timeoutId);
  }
}
