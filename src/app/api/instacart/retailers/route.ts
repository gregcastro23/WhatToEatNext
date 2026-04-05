/**
 * Instacart Retailers API Route
 *
 * Calls the Instacart Developer Platform (IDP) API to fetch available
 * retailers for a given postal code.
 */

import { NextResponse } from "next/server";
import type { InstacartRetailersResponse } from "@/types/instacart";
import type { NextRequest } from "next/server";

const INSTACART_IDP_BASE_URL = "https://connect.instacart.com";
const INSTACART_IDP_BASE_URL_DEV = "https://connect.dev.instacart.tools";
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

    const apiKey = process.env.INSTACART_API_KEY || process.env.instacart_development_api;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Instacart API key not configured. Set INSTACART_API_KEY in your environment.",
        },
        { status: 503 },
      );
    }

    const isDevEnv =
      process.env.NODE_ENV !== "production" ||
      process.env.INSTACART_USE_PROD !== "true";

    const baseUrl = isDevEnv ? INSTACART_IDP_BASE_URL_DEV : INSTACART_IDP_BASE_URL;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let instacartResponse: Response;
    try {
      instacartResponse = await fetch(
        `${baseUrl}/idp/v1/retailers?postal_code=${encodeURIComponent(
          postalCode,
        )}&country_code=${encodeURIComponent(countryCode)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          signal: controller.signal,
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!instacartResponse.ok) {
      const errorText = await instacartResponse.text();

      let statusCode = instacartResponse.status;
      const statusMessages: Record<number, string> = {
        400: `Bad Request: ${errorText}`,
        401: "Unauthorized: Invalid API key",
        403: "Forbidden: API key does not have required permissions",
        429: "Too Many Requests: Rate limit exceeded",
      };

      const details =
        statusMessages[statusCode] ??
        (statusCode >= 500
          ? "Instacart service unavailable"
          : `Instacart returned status ${statusCode}`);

      if (statusCode >= 500) statusCode = 502;

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
