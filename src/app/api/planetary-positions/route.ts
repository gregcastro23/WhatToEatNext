/**
 * Planetary Positions API Route
 *
 * Provides real-time planetary positions with optional alchemical analysis.
 * Designed for integration with alchm.kitchen and other applications.
 *
 * Features:
 * - High-accuracy planetary positions from astrologize API
 * - Optional ESMS (Spirit, Essence, Matter, Substance) calculation
 * - Thermodynamic properties (Heat, Entropy, Reactivity, Energy)
 * - Intelligent caching (5-minute TTL for high accuracy)
 * - CORS-enabled for authorized domains
 */

import { NextResponse } from "next/server";
import { _logger } from "@/lib/logger";
import {
  getCurrentPlanetaryPositions,
  getPlanetaryPositionsForDateTime,
} from "@/services/astrologizeApi";
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
} from "@/utils/planetaryAlchemyMapping";
import { calculateThermodynamicMetrics } from "@/utils/monicaKalchmCalculations";
import { cache } from "@/utils/cache";

// Cache configuration
const CACHE_KEY_PREFIX = "planetary-positions";
const CACHE_TTL = 5 * 60; // 5 minutes

// CORS configuration
const ALLOWED_ORIGINS = [
  "https://alchm.kitchen",
  "https://www.alchm.kitchen",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
];

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: NextResponse, origin?: string | null) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  const response = NextResponse.json({}, { status: 200 });
  return addCorsHeaders(response, origin);
}

/**
 * Convert PlanetPosition to API format
 */
function formatPlanetaryPositions(positions: Record<string, any>) {
  return Object.entries(positions).map(([planet, position]) => {
    // Capitalize first letter of sign
    const sign = position.sign.charAt(0).toUpperCase() + position.sign.slice(1);

    return {
      planet,
      sign,
      degree: position.degree + position.minute / 60, // Convert to decimal degrees within sign
      longitude: position.exactLongitude, // Absolute longitude 0-360
      retrograde: position.isRetrograde || false,
      // Note: Speed data not available from current astrologize API
      // Could be calculated by comparing positions over time
    };
  });
}

/**
 * Calculate alchemical properties from planetary positions
 */
function calculateAlchemicalQuantities(positions: Record<string, any>) {
  // Convert positions to format needed for planetary alchemy mapping
  const planetarySignMap: Record<string, string> = {};

  Object.entries(positions).forEach(([planet, position]) => {
    // Skip Ascendant as it's not used in planetary alchemy
    if (planet === "Ascendant") return;

    // Convert sign to capitalized format
    const sign = position.sign.charAt(0).toUpperCase() + position.sign.slice(1);
    planetarySignMap[planet] = sign;
  });

  // Calculate ESMS from planetary positions
  const esms = calculateAlchemicalFromPlanets(planetarySignMap);

  // Aggregate elemental properties from zodiac signs
  const elementals = aggregateZodiacElementals(planetarySignMap);

  // Calculate thermodynamic properties
  const thermodynamics = calculateThermodynamicMetrics(esms, elementals);

  return {
    spirit: esms.Spirit,
    essence: esms.Essence,
    matter: esms.Matter,
    substance: esms.Substance,
    Heat: thermodynamics.heat,
    Entropy: thermodynamics.entropy,
    Reactivity: thermodynamics.reactivity,
    Energy: thermodynamics.gregsEnergy,
  };
}

/**
 * GET endpoint - Fetch current or historical planetary positions
 */
export async function GET(request: Request) {
  const origin = request.headers.get("origin");

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const includeAlchemy = searchParams.get("includeAlchemy") === "true";
    const useCache = searchParams.get("useCache") !== "false";
    const accuracy = searchParams.get("accuracy") || "high";
    const latitude = searchParams.get("latitude")
      ? parseFloat(searchParams.get("latitude")!)
      : undefined;
    const longitude = searchParams.get("longitude")
      ? parseFloat(searchParams.get("longitude")!)
      : undefined;
    const zodiacSystem =
      (searchParams.get("zodiacSystem") as "tropical" | "sidereal") ||
      "tropical";

    // Generate cache key
    const cacheKey = `${CACHE_KEY_PREFIX}:${date || "current"}:${latitude || "default"}:${longitude || "default"}:${zodiacSystem}:${includeAlchemy}`;

    // Check cache if enabled
    if (useCache) {
      const cached = cache.get(cacheKey) as any;
      if (cached) {
        const response = NextResponse.json({
          ...cached,
          cached: true,
          cacheAge: Date.now() - (cached.cacheTimestamp || Date.now()),
        });
        return addCorsHeaders(response, origin);
      }
    }

    // Fetch planetary positions
    const location =
      latitude !== undefined && longitude !== undefined
        ? { latitude, longitude }
        : undefined;

    let positions: Record<string, any>;
    const timestamp = new Date().toISOString();

    if (date) {
      // Fetch positions for specific date
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        const response = NextResponse.json(
          { error: "Invalid date format. Use ISO 8601 format." },
          { status: 400 },
        );
        return addCorsHeaders(response, origin);
      }
      positions = await getPlanetaryPositionsForDateTime(
        targetDate,
        location,
        zodiacSystem,
      );
    } else {
      // Fetch current positions
      positions = await getCurrentPlanetaryPositions(location, zodiacSystem);
    }

    // Format response
    const planetaryPositions = formatPlanetaryPositions(positions);

    const responseData: any = {
      timestamp: date || timestamp,
      planetaryPositions,
      source: "external-api",
      accuracy,
      cached: false,
    };

    // Include alchemical quantities if requested
    if (includeAlchemy) {
      try {
        const alchmQuantities = calculateAlchemicalQuantities(positions);
        responseData.alchmQuantities = alchmQuantities;

        // Calculate Monica constant
        const thermodynamics = calculateThermodynamicMetrics(
          {
            Spirit: alchmQuantities.spirit,
            Essence: alchmQuantities.essence,
            Matter: alchmQuantities.matter,
            Substance: alchmQuantities.substance,
          },
          aggregateZodiacElementals(
            Object.fromEntries(
              Object.entries(positions)
                .filter(([planet]) => planet !== "Ascendant")
                .map(([planet, position]) => [
                  planet,
                  position.sign.charAt(0).toUpperCase() +
                    position.sign.slice(1),
                ]),
            ),
          ),
        );
        responseData.monicaConstant = thermodynamics.monica;
      } catch (alchemyError) {
        _logger.error("Error calculating alchemical quantities:", alchemyError);
        // Don't fail the whole request if alchemy calculation fails
      }
    }

    // Cache the response
    if (useCache) {
      cache.set(
        cacheKey,
        { ...responseData, cacheTimestamp: Date.now() },
        CACHE_TTL,
      );
    }

    const response = NextResponse.json(responseData);

    // Add custom headers
    response.headers.set("X-Source", responseData.source);
    response.headers.set("X-Accuracy", accuracy);
    response.headers.set("X-Cached", "false");
    response.headers.set("Cache-Control", "public, max-age=300"); // 5 minutes

    return addCorsHeaders(response, origin);
  } catch (error) {
    _logger.error("Planetary positions API error:", error);
    const response = NextResponse.json(
      {
        error: "Failed to calculate planetary positions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
    return addCorsHeaders(response, origin);
  }
}

/**
 * POST endpoint - Same as GET but accepts parameters in body
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");

  try {
    const body = await request.json();
    const {
      date,
      includeAlchemy = false,
      useCache = true,
      accuracy = "high",
      latitude,
      longitude,
      zodiacSystem = "tropical",
    } = body;

    // Generate cache key
    const cacheKey = `${CACHE_KEY_PREFIX}:${date || "current"}:${latitude || "default"}:${longitude || "default"}:${zodiacSystem}:${includeAlchemy}`;

    // Check cache if enabled
    if (useCache) {
      const cached = cache.get(cacheKey) as any;
      if (cached) {
        const response = NextResponse.json({
          ...cached,
          cached: true,
          cacheAge: Date.now() - (cached.cacheTimestamp || Date.now()),
        });
        return addCorsHeaders(response, origin);
      }
    }

    // Fetch planetary positions
    const location =
      latitude !== undefined && longitude !== undefined
        ? { latitude, longitude }
        : undefined;

    let positions: Record<string, any>;
    const timestamp = new Date().toISOString();

    if (date) {
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        const response = NextResponse.json(
          { error: "Invalid date format. Use ISO 8601 format." },
          { status: 400 },
        );
        return addCorsHeaders(response, origin);
      }
      positions = await getPlanetaryPositionsForDateTime(
        targetDate,
        location,
        zodiacSystem,
      );
    } else {
      positions = await getCurrentPlanetaryPositions(location, zodiacSystem);
    }

    // Format response
    const planetaryPositions = formatPlanetaryPositions(positions);

    const responseData: any = {
      timestamp: date || timestamp,
      planetaryPositions,
      source: "external-api",
      accuracy,
      cached: false,
    };

    // Include alchemical quantities if requested
    if (includeAlchemy) {
      try {
        const alchmQuantities = calculateAlchemicalQuantities(positions);
        responseData.alchmQuantities = alchmQuantities;

        // Calculate Monica constant
        const thermodynamics = calculateThermodynamicMetrics(
          {
            Spirit: alchmQuantities.spirit,
            Essence: alchmQuantities.essence,
            Matter: alchmQuantities.matter,
            Substance: alchmQuantities.substance,
          },
          aggregateZodiacElementals(
            Object.fromEntries(
              Object.entries(positions)
                .filter(([planet]) => planet !== "Ascendant")
                .map(([planet, position]) => [
                  planet,
                  position.sign.charAt(0).toUpperCase() +
                    position.sign.slice(1),
                ]),
            ),
          ),
        );
        responseData.monicaConstant = thermodynamics.monica;
      } catch (alchemyError) {
        _logger.error("Error calculating alchemical quantities:", alchemyError);
      }
    }

    // Cache the response
    if (useCache) {
      cache.set(
        cacheKey,
        { ...responseData, cacheTimestamp: Date.now() },
        CACHE_TTL,
      );
    }

    const response = NextResponse.json(responseData);

    // Add custom headers
    response.headers.set("X-Source", responseData.source);
    response.headers.set("X-Accuracy", accuracy);
    response.headers.set("X-Cached", "false");
    response.headers.set("Cache-Control", "public, max-age=300");

    return addCorsHeaders(response, origin);
  } catch (error) {
    _logger.error("Planetary positions API error:", error);
    const response = NextResponse.json(
      {
        error: "Failed to calculate planetary positions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
    return addCorsHeaders(response, origin);
  }
}
