/**
 * Usage Tracking API — POST to increment usage counter
 *
 * @file src/app/api/subscription/usage/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const feature = body.feature as string;

    if (!feature) {
      return NextResponse.json(
        { error: "Missing feature parameter" },
        { status: 400 },
      );
    }

    const count = await subscriptionService.incrementUsage(
      session.user.id,
      feature,
    );

    return NextResponse.json({ count, feature });
  } catch (error) {
    console.error("[api/subscription/usage] Error:", error);
    return NextResponse.json(
      { error: "Failed to track usage" },
      { status: 500 },
    );
  }
}
