/**
 * Group Compatibility API — Proxy to Railway backend
 *
 * Calculates elemental compatibility matrix between group members.
 * Premium feature only.
 *
 * @file src/app/api/group/compatibility/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getServiceUrl } from "@/lib/serviceUrls";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Tier gate removed with the premium concept. `user_subscriptions` held 3,479
  // rows and NOT ONE was Stripe-backed; 3,418 were agents, so this 403 refused
  // essentially every human for a subscription that never existed. Access is
  // authentication plus the ESMS token economy now.

  try {
    const BACKEND_URL = getServiceUrl("wtenBackend");
    const body = await request.json();

    if (!body.members || body.members.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 members for compatibility analysis" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/group/compatibility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(INTERNAL_API_SECRET ? { Authorization: `Bearer ${INTERNAL_API_SECRET}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail ?? "Backend compatibility analysis failed" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("[api/group/compatibility] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze group compatibility" },
      { status: 500 },
    );
  }
}
