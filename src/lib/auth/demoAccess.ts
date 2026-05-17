/**
 * Gate for routes that support BOTH authenticated and "demo" anonymous use.
 *
 * Throttling philosophy (do not change without product sign-off):
 *
 *   - Logged-in users: the personalized token economy (Spirit/Essence/Matter/
 *     Substance, priced against the user's chart vs the current sky) IS the
 *     throttle. The route should NOT also impose a per-minute rate cap — if
 *     they can afford it, they can run it.
 *
 *   - Anonymous users: get a small daily IP-based "demo budget" so visitors
 *     can sample the site before signing in. Once exhausted, return a 401
 *     with a friendly sign-in nudge rather than a 429.
 *
 * The route body should branch on `mode`:
 *
 *   - "auth" → run the normal logged-in path (token debit, usage tracking,
 *     subscription checks, etc.)
 *   - "demo" → skip all per-user economy / usage / quest hooks; just run the
 *     core generation so the visitor can see the wow factor.
 *
 * @file src/lib/auth/demoAccess.ts
 */

import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth/validateRequest";
import { rateLimit } from "@/lib/rateLimit";
import type { NextRequest } from "next/server";

export interface DemoAccessOptions {
  /** Free demo uses per IP per 24h for this feature. Keep small (1-5). */
  dailyDemoQuota: number;
  /** Short feature label used in the bucket key and the sign-in nudge. */
  feature: string;
}

export type DemoAccessResult =
  | { mode: "auth"; userId: string; blocked?: undefined }
  | { mode: "demo"; userId: null; demoRemaining: number; blocked?: undefined }
  | { mode: "denied"; userId: null; blocked: NextResponse };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function gateDemoOrAuth(
  request: NextRequest,
  options: DemoAccessOptions,
): Promise<DemoAccessResult> {
  const userId = await getUserIdFromRequest(request);
  if (userId) {
    return { mode: "auth", userId };
  }

  const rl = await rateLimit(request, {
    window: ONE_DAY_MS,
    max: options.dailyDemoQuota,
    bucket: `demo:${options.feature}`,
  });

  if (rl.allowed) {
    return { mode: "demo", userId: null, demoRemaining: rl.remaining };
  }

  // Demo budget exhausted — convert the rate-limit 429 into a friendlier 401
  // that nudges the visitor toward sign-in, since the rest of the site is
  // gated by the token economy rather than a per-day quota.
  return {
    mode: "denied",
    userId: null,
    blocked: NextResponse.json(
      {
        error: "sign_in_required",
        message:
          `You've used your free ${options.feature} demos for today. ` +
          `Sign in to keep going — logged-in users are billed in cosmic tokens ` +
          `(Spirit / Essence / Matter / Substance) based on your chart, not capped per day.`,
        feature: options.feature,
        retryAfterSeconds: Math.ceil(rl.resetMs / 1000),
      },
      { status: 401 },
    ),
  };
}
