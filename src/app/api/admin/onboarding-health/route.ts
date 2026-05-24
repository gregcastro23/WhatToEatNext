/**
 * Admin Onboarding Health
 * GET /api/admin/onboarding-health
 *
 * Dedicated visibility into the new-user onboarding funnel. Surfaces:
 *   - 24h funnel: signups → birth data → natal chart → completion
 *   - Stuck users (signed up >1h ago, not completed)
 *   - Recent /api/onboarding errors (request log)
 *   - Most-recent completed onboardings
 *   - Skip rate (skipNatal vs full onboarding)
 *
 * Response shape: `OnboardingHealthPayload` from
 * src/services/onboardingHealthService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getOnboardingHealth } from "@/services/onboardingHealthService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 5_000;

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  const payload = await memoize("admin:onboarding-health", CACHE_TTL_MS, () =>
    getOnboardingHealth(),
  );
  return NextResponse.json({ success: true, ...payload });
}
