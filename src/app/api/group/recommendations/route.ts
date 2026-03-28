/**
 * Group Recommendations API — Proxy to Railway backend
 *
 * Validates auth + premium tier, then forwards to the backend
 * group recommendation engine. Premium feature only.
 *
 * @file src/app/api/group/recommendations/route.ts
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { subscriptionService } from "@/services/subscriptionService";

const BACKEND_URL = process.env.BACKEND_URL || "https://whattoeatnext-production.up.railway.app";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || "";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check premium access (admins always have access)
  const isAdmin = session.user.role === "admin";
  if (!isAdmin) {
    const sub = await subscriptionService.getOrCreateSubscription(session.user.id);
    if (sub.tier !== "premium") {
      return NextResponse.json(
        {
          upgrade_required: true,
          message: "Group recommendations require a Premium subscription.",
          feature: "diningCompanions",
        },
        { status: 403 },
      );
    }
  }

  try {
    const body = await request.json();

    // Validate member count
    if (!body.members || body.members.length < 2) {
      return NextResponse.json(
        { error: "Group must have at least 2 members" },
        { status: 400 },
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/group/recommendations`, {
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
        { error: errorData.detail || "Backend recommendation failed" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("[api/group/recommendations] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate group recommendations" },
      { status: 500 },
    );
  }
}
