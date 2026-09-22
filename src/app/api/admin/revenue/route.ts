/**
 * Admin Revenue (Stripe, live)
 * GET /api/admin/revenue
 *
 * Balance, MRR from real subscription prices, 30-day charges, checkout funnel
 * by purpose, recent events awaiting webhook delivery, and webhook coverage —
 * read from Stripe on demand. Response: `StripeRevenuePayload` from
 * src/services/admin/stripeRevenueService.ts.
 *
 * @requires Authentication - Admin role required
 */

import { NextResponse, type NextRequest } from "next/server";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import { memoize } from "@/lib/cache/memoryCache";
import { getStripeRevenue } from "@/services/admin/stripeRevenueService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  // Stripe list calls page through up to a few hundred objects; one read a
  // minute keeps the board current without spending the API budget.
  const payload = await memoize("admin:revenue", 60_000, () => getStripeRevenue());
  return NextResponse.json({ success: true, ...payload });
}
