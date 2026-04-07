/**
 * Instacart Retailers API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to fetch available
 * retailers for a given postal code.
 */

import { NextResponse } from "next/server";
import {
  fetchInstacartIdp,
  InstacartConfigurationError,
  mapInstacartProxyError,
} from "@/lib/instacart/idpClient";
import type { InstacartRetailersResponse } from "@/types/instacart";
import type { NextRequest } from "next/server";

const FETCH_TIMEOUT_MS = 10_000;

// In-memory cache mapping postal_code to retailers response
// Cache duration: 1 hour
interface CacheEntry {
  data: InstacartRetailersResponse;
  expiresAt: number;
}
const retailersCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postalCode = searchParams.get("postal_code");
    const countryCode = searchParams.get("country_code") || "US";

    if (!postalCode) {
      return NextResponse.json(
        { error: "postal_code parameter is required" },
        { status: 400 },
      );
    }

    // Check cache
    const cacheKey = `${postalCode}-${countryCode}`;
    const cached = retailersCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data);
    }

    let instacartResponse: Response;
    try {
      instacartResponse = await fetchInstacartIdp("retailers", {
        searchParams: {
          postal_code: postalCode,
          country_code: countryCode,
        },
        timeoutMs: FETCH_TIMEOUT_MS,
      });
    } catch (error) {
      if (error instanceof InstacartConfigurationError) {
        return NextResponse.json({ error: error.message }, { status: 503 });
      }
      throw error;
    }

    if (!instacartResponse.ok) {
      const errorText = await instacartResponse.text();
      const { statusCode, details } = mapInstacartProxyError(
        instacartResponse,
        errorText,
        "Instacart service unavailable",
      );

      return NextResponse.json(
        { error: "Failed to fetch Instacart retailers", details },
        { status: statusCode },
      );
    }

    const data = (await instacartResponse.json()) as InstacartRetailersResponse;

    // Save to cache
    retailersCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Failed to reach Instacart", details: "Request timed out" },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
