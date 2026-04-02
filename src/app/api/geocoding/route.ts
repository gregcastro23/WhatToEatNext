/**
 * Geocoding API Route
 * GET /api/geocoding?q=location - Search for locations
 */

import { NextResponse } from "next/server";
import { geocodeLocation } from "@/services/geocodingService";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
// Note: Removed `runtime = "edge"` - Cloudflare Workers are already edge functions
// and OpenNext requires edge functions to be configured separately.

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Query must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    const results = await geocodeLocation(query);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Geocoding error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to geocode location",
      },
      { status: 500 },
    );
  }
}
