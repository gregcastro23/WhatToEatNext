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
import { applyLivePricing, getLivePricingContext } from "@/lib/economy/livePricing";
import { subscriptionService } from "@/services/subscriptionService";
import { tokenEconomy } from "@/services/TokenEconomyService";
import type { DayOfWeek } from "@/types/menuPlanner";
import {
  generateDayRecommendations,
  type AstrologicalState,
  type DayRecommendationOptions,
} from "@/utils/menuPlanner/recommendationBridge";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface RetryGrant {
  userId: string;
  expiresAt: number;
}

const RETRY_WINDOW_MS = 5 * 60 * 1000;
const retryGrants = new Map<string, RetryGrant>();

// ── TTL memo cache for generation results ──────────────────────────────
//
// Identical (dayOfWeek, astroState, options) payloads are common on this
// route: users frequently click Generate multiple times in quick succession
// while exploring suggestions. Caching results for a few minutes lets those
// repeat clicks return in <5 ms instead of rerunning the full filter+score
// pipeline.
interface MemoEntry {
  recommendations: unknown;
  expiresAt: number;
}
const MEMO_TTL_MS = 3 * 60 * 1000;
const MEMO_MAX_ENTRIES = 64;
const generationMemo = new Map<string, MemoEntry>();

/**
 * Deterministic JSON serialization. Built-in JSON.stringify is not stable
 * because object key order is not guaranteed. We need a key for the memo
 * cache that is identical across clicks with the same logical payload.
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys
    .map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`)
    .join(",")}}`;
}

function memoKey(
  userId: string,
  dayOfWeek: number,
  astroState: unknown,
  options: unknown,
): string {
  return `${userId}|${dayOfWeek}|${stableStringify({ astroState, options })}`;
}

function lookupMemo(key: string): unknown | null {
  const entry = generationMemo.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    generationMemo.delete(key);
    return null;
  }
  // Refresh insertion order so LRU-style eviction keeps the hottest entries.
  generationMemo.delete(key);
  generationMemo.set(key, entry);
  return entry.recommendations;
}

function storeMemo(key: string, recommendations: unknown): void {
  if (generationMemo.size >= MEMO_MAX_ENTRIES) {
    // Map iteration order is insertion order — drop the oldest entry.
    const oldestKey = generationMemo.keys().next().value;
    if (oldestKey !== undefined) generationMemo.delete(oldestKey);
  }
  generationMemo.set(key, {
    recommendations,
    expiresAt: Date.now() + MEMO_TTL_MS,
  });
}

function cleanupExpiredRetryGrants(now = Date.now()): void {
  for (const [token, grant] of retryGrants.entries()) {
    if (grant.expiresAt <= now) {
      retryGrants.delete(token);
    }
  }
}

function lookupRetryGrant(userId: string, retryToken?: string): RetryGrant | null {
  if (!retryToken) return null;
  cleanupExpiredRetryGrants();
  const grant = retryGrants.get(retryToken);
  if (!grant) return null;
  if (grant.userId !== userId) return null;
  return grant;
}

function deleteRetryGrant(retryToken?: string): void {
  if (!retryToken) return;
  retryGrants.delete(retryToken);
}

function createRetryGrant(
  userId: string,
  existingToken?: string,
  expiresAtOverride?: number,
): { token: string; expiresAt: string } {
  cleanupExpiredRetryGrants();
  const token = existingToken ?? randomUUID();
  const expiresAtMs = expiresAtOverride ?? Date.now() + RETRY_WINDOW_MS;
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

interface GenerateRequestBody {
  dayOfWeek: DayOfWeek;
  astroState: AstrologicalState;
  options?: DayRecommendationOptions;
  retryToken?: string;
}

export async function POST(request: NextRequest) {
  const tStart = Date.now();
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

  // ── Memo cache hit: return immediately without charging tokens ──
  //
  // We key on (userId, dayOfWeek, astroState, options). When the user
  // clicks Generate repeatedly with the same payload, we return the
  // previously computed result. No token charge on a cache hit.
  const cacheKey = memoKey(userId, dayOfWeek, astroState, options);
  const cachedRecommendations = lookupMemo(cacheKey);
  if (cachedRecommendations !== null) {
    const totalMs = Date.now() - tStart;
    return NextResponse.json(
      {
        success: true,
        recommendations: cachedRecommendations,
        charged: false,
        usedRetryWindow: false,
        cached: true,
        emptyResult:
          Array.isArray(cachedRecommendations) &&
          cachedRecommendations.length === 0,
      },
      {
        headers: {
          "Server-Timing": `cache;desc="hit";dur=${totalMs}, total;dur=${totalMs}`,
        },
      },
    );
  }

  const sub = await subscriptionService.getUserSubscription(userId);
  const isPremium = sub?.tier === "premium";

  let charged = false;
  let usedRetryWindow = false;
  let activeRetryGrant: RetryGrant | null = null;

  // Strict server-side per-click consumption for non-premium users.
  if (!isPremium) {
    const reusedGrant = lookupRetryGrant(userId, retryToken);
    if (reusedGrant) {
      usedRetryWindow = true;
      activeRetryGrant = reusedGrant;
    } else {
      // Resolve the item to read base costs, then apply the live pricing
      // multiplier so generation matches the in-shop price experience.
      const item = await tokenEconomy.getShopItem("unlock-basic-recipe");
      if (!item || !item.isActive) {
        return NextResponse.json(
          {
            success: false,
            reason: "item_not_found",
            message: "Recipe generation shop item not configured.",
          },
          { status: 500 },
        );
      }

      const pricing = await getLivePricingContext();
      const liveCost = applyLivePricing(
        {
          spirit: item.costSpirit,
          essence: item.costEssence,
          matter: item.costMatter,
          substance: item.costSubstance,
        },
        pricing.multiplier,
      );

      const purchase = await tokenEconomy.purchaseShopItem(userId, "unlock-basic-recipe", {
        overrideCosts: liveCost,
        descriptionSuffix: `live x${pricing.multiplier.toFixed(2)}`,
      });
      if (!purchase.success) {
        if (purchase.reason === "insufficient_funds") {
          return NextResponse.json(
            {
              success: false,
              reason: "insufficient_tokens",
              message: `Insufficient tokens for recipe generation. Cost: ${liveCost.spirit.toFixed(2)} Spirit + ${liveCost.essence.toFixed(2)} Essence (live x${pricing.multiplier.toFixed(2)}).`,
              liveCost,
              pricing,
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
    const tGen = Date.now();
    const recommendations = await withTimeout(
      generateDayRecommendations(dayOfWeek, astroState, options),
      55_000,
    );
    const genMs = Date.now() - tGen;

    // Success: the retry grant (if any) has delivered a recipe and must be
    // consumed so it cannot be reused to bypass future payments.
    if (usedRetryWindow) {
      deleteRetryGrant(retryToken);
    }

    // Cache the result for the TTL window so repeat clicks are instant.
    storeMemo(cacheKey, recommendations);

    const totalMs = Date.now() - tStart;
    return NextResponse.json(
      {
        success: true,
        recommendations,
        charged,
        usedRetryWindow,
        // Tokens are intentionally charged even when recommendations are empty.
        emptyResult: recommendations.length === 0,
      },
      {
        headers: {
          "Server-Timing": `generate;dur=${genMs}, total;dur=${totalMs}`,
        },
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "GENERATION_TIMEOUT") {
      // Issue or refresh a retry grant so the caller keeps the full
      // 5-minute window even if multiple timeouts occur in a row. For
      // retry-window requests, preserve the original grant's expiration
      // so the timer never extends beyond the original 5-minute budget.
      let retry: { token: string; expiresAt: string } | null = null;
      if (!isPremium) {
        if (activeRetryGrant && retryToken) {
          retry = createRetryGrant(userId, retryToken, activeRetryGrant.expiresAt);
        } else if (charged) {
          retry = createRetryGrant(userId);
        }
      }
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

    // Non-timeout failure: consume the retry grant. Persisting it would let
    // a user keep trying with a fresh payload, which could be abused.
    if (usedRetryWindow) {
      deleteRetryGrant(retryToken);
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

