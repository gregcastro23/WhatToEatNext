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
import { _logger } from "@/lib/logger";
import { getServiceUrl } from "@/lib/serviceUrls";
import { GroupBackendProxyRequestSchema } from "@/lib/validation/apiSchemas";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";

async function forwardGroupRecommendations(payload: unknown): Promise<Response> {
  const BACKEND_URL = getServiceUrl("wtenBackend");
  return fetch(`${BACKEND_URL}/api/group/recommendations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(INTERNAL_API_SECRET ? { Authorization: `Bearer ${INTERNAL_API_SECRET}` } : {}),
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = GroupBackendProxyRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Group must have at least 2 members" },
        { status: 400 },
      );
    }

    const backendResponse = await forwardGroupRecommendations(parsed.data);
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.detail ?? "Backend recommendation failed" },
        { status: backendResponse.status },
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    _logger.error("[api/group/recommendations] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate group recommendations" },
      { status: 500 },
    );
  }
}
