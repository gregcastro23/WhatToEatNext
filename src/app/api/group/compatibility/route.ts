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
import { _logger } from "@/lib/logger";
import { getServiceUrl } from "@/lib/serviceUrls";
import { GroupBackendProxyRequestSchema } from "@/lib/validation/apiSchemas";

const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET ?? "";

async function forwardGroupCompatibility(payload: unknown): Promise<Response> {
  const BACKEND_URL = getServiceUrl("wtenBackend");
  return fetch(`${BACKEND_URL}/api/group/compatibility`, {
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
        { error: "Need at least 2 members for compatibility analysis" },
        { status: 400 },
      );
    }

    const backendResponse = await forwardGroupCompatibility(parsed.data);
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
    _logger.error("[api/group/compatibility] Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze group compatibility" },
      { status: 500 },
    );
  }
}
