/**
 * POST /api/recommendations/generate
 *
 * Server-side consume-and-run endpoint for recipe recommendations.
 * Non-premium users are charged per request via `unlock-basic-recipe`.
 * If generation times out after a charge, a 5-minute retry token is issued.
 */

import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import {
  generateDayRecommendations,
  type AstrologicalState,
  type DayRecommendationOptions,
} from "@/utils/menuPlanner/recommendationBridge";
import type { DayOfWeek } from "@/types/menuPlanner";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

type RetryGrant = {
  userId: string;
  expiresAt: number;
};

const RETRY_WINDOW_MS = 5 * 60 * 1000;
const retryGrants = new Map<string, RetryGrant>();

function cleanupExpiredRetryGrants(now = Date.now()): void {
  for (const [token, grant] of retryGrants.entries()) {
    if (grant.expiresAt <= now) {
      retryGrants.delete(token);
    }
  }
}

function consumeRetryGrant(userId: string, retryToken?: string): boolean {
  if (!retryToken) return false;
  cleanupExpiredRetryGrants();
  const grant = retryGrants.get(retryToken);
  if (!grant) return false;
  if (grant.userId !== userId) return false;
  retryGrants.delete(retryToken);
  return true;
}

function createRetryGrant(userId: string): { token: string; expiresAt: string } {
  cleanupExpiredRetryGrants();
  const token = randomUUID();
  const expiresAtMs = Date.now() + RETRY_WINDOW_MS;
  retryGrants.set(token, { userId, expiresAt: expiresAtMs });
  return { token, expiresAt: new Date(expiresAtMs).toISOString() };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("GENERATION_TIMEOUT")), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

type GenerateRequestBody = {
  dayOfWeek: DayOfWeek;
  astroState: AstrologicalState;
  options?: DayRecommendationOptions;
  retryToken?: string;
};

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { dayOfWeek, astroState, options = {}, retryToken } = body;
  if (
    typeof dayOfWeek !== "number" ||
    dayOfWeek < 0 ||
    dayOfWeek > 6 ||
    !astroState ||
    typeof astroState !== "object"
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid request payload" },
      { status: 400 },
    );
  }

  const sub = await subscriptionService.getUserSubscription(userId);
  const isPremium = sub?.tier === "premium";

  let charged = false;
  let usedRetryWindow = false;

  // Strict server-side per-click consumption for non-premium users.
  if (!isPremium) {
    const usedRetryGrant = consumeRetryGrant(userId, retryToken);
    if (usedRetryGrant) {
      usedRetryWindow = true;
    } else {
      const purchase = await tokenEconomy.purchaseShopItem(userId, "unlock-basic-recipe");
      if (!purchase.success) {
        if (purchase.reason === "insufficient_funds") {
          return NextResponse.json(
            {
              success: false,
              reason: "insufficient_tokens",
              message: "Insufficient tokens for recipe generation. Cost: 5 Spirit + 5 Essence.",
            },
            { status: 402 },
          );
        }
        return NextResponse.json(
          {
            success: false,
            reason: purchase.reason,
            message: "Could not complete token purchase for generation.",
          },
          { status: 500 },
        );
      }
      charged = true;
    }
  }

  try {
    // Keep below maxDuration to ensure timeout handling can return retry token.
    const recommendations = await withTimeout(
      generateDayRecommendations(dayOfWeek, astroState, options),
      55_000,
    );

    return NextResponse.json({
      success: true,
      recommendations,
      charged,
      usedRetryWindow,
      // Tokens are intentionally charged even when recommendations are empty.
      emptyResult: recommendations.length === 0,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "GENERATION_TIMEOUT") {
      const retry = !isPremium && charged ? createRetryGrant(userId) : null;
      return NextResponse.json(
        {
          success: false,
          reason: "timeout",
          message: "Generation timed out. Retry within 5 minutes without an extra charge.",
          ...(retry ? { retry } : {}),
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        reason: "generation_failed",
        message: "Recipe generation failed.",
      },
      { status: 500 },
    );
  }
}

