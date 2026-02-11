/**
 * Server-side planetary calculations utility
 * This module provides direct planetary position calculations for use in API routes
 * without needing to make HTTP calls to the astrologize API.
 */

import * as Astronomy from "astronomy-engine";
import type { ZodiacSign } from "@/types/celestial";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("ServerPlanetaryCalculations");

// Backend URL configuration
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:8000";

/**
 * Check if backend is available
 */
async function isBackendAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${BACKEND_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    logger.debug("Backend health check failed:", error);
    return false;
  }
}

/**
 * Call backend for planetary positions calculation
 */
async function calculatePlanetaryPositionsBackend(
  date: Date,
  zodiacSystem: "tropical" | "sidereal" = "tropical",
): Promise<Record<string, PlanetPosition> | null> {
  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/api/planetary/positions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year,
        month,
        day,
        hour,
        minute,
        zodiacSystem,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    const positions: Record<string, PlanetPosition> = {};

    for (const [planetName, position] of Object.entries(
      data.planetary_positions || {},
    )) {
      const pos = position as any;
      positions[planetName] = {
        sign: pos.sign as ZodiacSign,
        degree: pos.degree,
        minute: pos.minute,
        exactLongitude: pos.exactLongitude,
        isRetrograde: pos.isRetrograde,
      };
    }

    logger.info(
      `Calculated ${Object.keys(positions).length} planetary positions using backend (${data.metadata?.source || "unknown"})`,
    );

    return positions;
  } catch (error) {
    logger.warn("Backend planetary calculation failed:", error);
    return null;
  }
}

/**
 * Convert ecliptic longitude to zodiac sign and degree
 */
function longitudeToZodiacPosition(longitude: number): {
  sign: ZodiacSign;
  degree: number;
  minute: number;
} {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreeInSign = normalizedLongitude % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);

  const signs: ZodiacSign[] = [
    "aries",
    "taurus",
    "gemini",
    "cancer",
    "leo",
    "virgo",
    "libra",
    "scorpio",
    "sagittarius",
    "capricorn",
    "aquarius",
    "pisces",
  ];

  return {
    sign: signs[signIndex],
    degree,
    minute,
  };
}

/**
 * Calculate planetary positions using astronomy-engine (fallback)
 * Uses the correct astronomy-engine API with AstroTime objects
 */
function calculatePositionsWithAstronomyEngine(
  date: Date,
): Record<string, PlanetPosition> {
  const positions: Record<string, PlanetPosition> = {};

  const planets = [
    { name: "Sun", body: Astronomy.Body.Sun },
    { name: "Moon", body: Astronomy.Body.Moon },
    { name: "Mercury", body: Astronomy.Body.Mercury },
    { name: "Venus", body: Astronomy.Body.Venus },
    { name: "Mars", body: Astronomy.Body.Mars },
    { name: "Jupiter", body: Astronomy.Body.Jupiter },
    { name: "Saturn", body: Astronomy.Body.Saturn },
    { name: "Uranus", body: Astronomy.Body.Uranus },
    { name: "Neptune", body: Astronomy.Body.Neptune },
    { name: "Pluto", body: Astronomy.Body.Pluto },
  ];

  // Create proper AstroTime object for astronomy-engine
  const astroTime = new Astronomy.AstroTime(date);

  for (const planet of planets) {
    try {
      let longitude: number;

      // Special handling for the Sun - can't calculate heliocentric longitude of the Sun
      if (planet.body === Astronomy.Body.Sun) {
        // The Sun is always at the opposite ecliptic longitude from Earth's heliocentric position
        const earthLong = Astronomy.EclipticLongitude(
          Astronomy.Body.Earth,
          astroTime,
        );
        longitude = (earthLong + 180) % 360;
      } else {
        // For other planets, use EclipticLongitude directly
        longitude = Astronomy.EclipticLongitude(planet.body, astroTime);
      }

      const zodiacPos = longitudeToZodiacPosition(longitude);

      let isRetrograde = false;
      try {
        if (
          planet.body !== Astronomy.Body.Sun &&
          planet.body !== Astronomy.Body.Moon
        ) {
          // Check retrograde by comparing with position 2 days ago
          const prevDate = new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000);
          const prevAstroTime = new Astronomy.AstroTime(prevDate);
          const prevLongitude = Astronomy.EclipticLongitude(
            planet.body,
            prevAstroTime,
          );

          // Adjust for crossing 0/360 boundary
          let diff = longitude - prevLongitude;
          if (Math.abs(diff) > 180) {
            diff = diff > 0 ? diff - 360 : diff + 360;
          }
          isRetrograde = diff < 0;
        }
      } catch (retroError) {
        logger.debug(
          `Error checking retrograde for ${planet.name}:`,
          retroError,
        );
        isRetrograde = false;
      }

      positions[planet.name] = {
        sign: zodiacPos.sign,
        degree: zodiacPos.degree,
        minute: zodiacPos.minute,
        exactLongitude: longitude,
        isRetrograde,
      };
    } catch (planetError) {
      logger.warn(
        `Failed to calculate position for ${planet.name}:`,
        planetError,
      );
      // Use fallback position for this planet
      const fallback = getFallbackPlanetaryPositions();
      if (fallback[planet.name]) {
        positions[planet.name] = fallback[planet.name];
      }
    }
  }

  // If we didn't get all planets, fill in from fallback
  if (Object.keys(positions).length < planets.length) {
    const fallback = getFallbackPlanetaryPositions();
    for (const planet of planets) {
      if (!positions[planet.name] && fallback[planet.name]) {
        positions[planet.name] = fallback[planet.name];
      }
    }
  }

  logger.info(
    `Calculated ${Object.keys(positions).length} planetary positions using astronomy-engine`,
  );
  return positions;
}

/**
 * Calculate planetary positions - tries backend first, falls back to astronomy-engine
 * This is the main function to use for server-side calculations
 */
export async function calculatePlanetaryPositions(
  date: Date = new Date(),
  zodiacSystem: "tropical" | "sidereal" = "tropical",
): Promise<Record<string, PlanetPosition>> {
  logger.info(
    `calculatePlanetaryPositions called for date: ${date.toISOString()}`,
  );

  // Try backend first for high-precision Swiss Ephemeris calculations
  try {
    const backendAvailable = await isBackendAvailable();
    if (backendAvailable) {
      const backendPositions = await calculatePlanetaryPositionsBackend(
        date,
        zodiacSystem,
      );
      if (backendPositions && Object.keys(backendPositions).length > 0) {
        logger.info(
          "Using backend Swiss Ephemeris for planetary calculations (high precision)",
        );
        return backendPositions;
      }
    }
  } catch (backendError) {
    logger.warn("Backend planetary calculation attempt failed:", backendError);
  }

  // Try astronomy-engine as fallback
  try {
    logger.info(
      "Backend not available, using astronomy-engine fallback (moderate precision)",
    );
    const astronomyPositions = calculatePositionsWithAstronomyEngine(date);
    if (astronomyPositions && Object.keys(astronomyPositions).length > 0) {
      return astronomyPositions;
    }
  } catch (astronomyError) {
    logger.error("astronomy-engine calculation failed:", astronomyError);
  }

  // Ultimate fallback - return static positions
  logger.warn(
    "All calculation methods failed, using static fallback positions",
  );
  return getFallbackPlanetaryPositions();
}

/**
 * Get current planetary positions for the server-side
 */
export async function getCurrentPlanetaryPositionsServer(
  zodiacSystem: "tropical" | "sidereal" = "tropical",
): Promise<Record<string, PlanetPosition>> {
  return calculatePlanetaryPositions(new Date(), zodiacSystem);
}

/**
 * Fallback planetary positions for when all calculations fail
 */
export function getFallbackPlanetaryPositions(): Record<
  string,
  PlanetPosition
> {
  return {
    Sun: {
      sign: "sagittarius",
      degree: 2,
      minute: 30,
      exactLongitude: 242.5,
      isRetrograde: false,
    },
    Moon: {
      sign: "cancer",
      degree: 15,
      minute: 20,
      exactLongitude: 105.33,
      isRetrograde: false,
    },
    Mercury: {
      sign: "sagittarius",
      degree: 18,
      minute: 45,
      exactLongitude: 258.75,
      isRetrograde: false,
    },
    Venus: {
      sign: "capricorn",
      degree: 10,
      minute: 30,
      exactLongitude: 280.5,
      isRetrograde: false,
    },
    Mars: {
      sign: "leo",
      degree: 25,
      minute: 15,
      exactLongitude: 145.25,
      isRetrograde: false,
    },
    Jupiter: {
      sign: "gemini",
      degree: 16,
      minute: 40,
      exactLongitude: 76.67,
      isRetrograde: false,
    },
    Saturn: {
      sign: "pisces",
      degree: 14,
      minute: 20,
      exactLongitude: 344.33,
      isRetrograde: false,
    },
    Uranus: {
      sign: "taurus",
      degree: 22,
      minute: 10,
      exactLongitude: 52.17,
      isRetrograde: true,
    },
    Neptune: {
      sign: "pisces",
      degree: 27,
      minute: 45,
      exactLongitude: 357.75,
      isRetrograde: false,
    },
    Pluto: {
      sign: "aquarius",
      degree: 0,
      minute: 15,
      exactLongitude: 300.25,
      isRetrograde: false,
    },
  };
}
