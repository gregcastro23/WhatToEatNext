/**
 * Usage Tracking API — POST to increment usage counter
 *
 * @file src/app/api/subscription/usage/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { _logger } from "@/lib/logger";
import { SubscriptionTrackUsageRequestSchema } from "@/lib/validation/apiSchemas";
import { subscriptionService } from "@/services/subscriptionService";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = SubscriptionTrackUsageRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing feature parameter", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { feature } = parsed.data;

  try {
    const count = await subscriptionService.incrementUsage(
      session.user.id,
      feature,
    );

    return NextResponse.json({ count, feature });
  } catch (error) {
    _logger.error("[api/subscription/usage] Error:", error);
    return NextResponse.json(
      { error: "Failed to track usage" },
      { status: 500 },
    );
  }
}
