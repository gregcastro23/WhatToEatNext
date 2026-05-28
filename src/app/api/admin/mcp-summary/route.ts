import { NextResponse } from "next/server";
import { getServiceUrl } from "@/lib/serviceUrls";
import { validateAdminRequest } from "@/lib/auth/validateRequest";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/admin/mcp-summary
 *
 * Secure Next.js API route that proxies telemetry requests to Planetary Agents'
 * /api/admin/mcp-summary endpoint. Access is restricted to WTEN administrators
 * to keep the shared internal secret private from the frontend client.
 */
export async function GET(request: NextRequest) {
  const authResult = await validateAdminRequest(request);
  if ("error" in authResult) return authResult.error;

  const { searchParams } = new URL(request.url);
  const windowMinutesStr = searchParams.get("windowMinutes") || "60";
  const windowMinutes = parseInt(windowMinutesStr, 10) || 60;

  const secret = process.env.INTERNAL_API_SECRET;
  const base = getServiceUrl("planetaryAgentsApi");

  if (!secret) {
    return NextResponse.json(
      { live: false, error: "internal_api_secret_missing" },
      { status: 500 }
    );
  }

  try {
    const url = `${base}/api/admin/mcp-summary?windowMinutes=${windowMinutes}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Internal-Secret": secret,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { live: false, error: "pa_unreachable", status: res.status },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      {
        live: false,
        error: "pa_unreachable",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 200 }
    );
  }
}
