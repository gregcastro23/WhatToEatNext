/**
 * Server-side planetary calculations utility
 * This module provides direct planetary position calculations for use in API routes
 * without needing to make HTTP calls to the astrologize API.
 */

import * as AstronomyModule from "astronomy-engine";
import type { ZodiacSignType } from "@/types/celestial";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import { createLogger } from "@/utils/logger";

const Astronomy = (AstronomyModule as any).default || AstronomyModule;
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

    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/health`, {
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
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

    let response: Response;
    try {
      response = await fetch(`${BACKEND_URL}/api/planetary/positions`, {
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
    } finally {
      clearTimeout(timeoutId);
    }

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
        sign: pos.sign as ZodiacSignType,
        degree: pos.degree,
        minute: pos.minute,
        exactLongitude: pos.exactLongitude,
        isRetrograde: pos.isRetrograde,
        longitudeSpeed: pos.longitudeSpeed,
        eclipticLatitude: pos.eclipticLatitude,
        latitudeSpeed: pos.latitudeSpeed,
        distance: pos.distance,
        distanceSpeed: pos.distanceSpeed,
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
  sign: ZodiacSignType;
  degree: number;
  minute: number;
} {
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLongitude / 30);
  const degreeInSign = normalizedLongitude % 30;
  const degree = Math.floor(degreeInSign);
  const minute = Math.floor((degreeInSign - degree) * 60);

  const signs: ZodiacSignType[] = [
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

  // Create proper AstroTime objects for astronomy-engine.
  // dt = 1 hour for finite-difference kinematics. Anchored on the requested
  // moment so longitude/latitude reflect `date`, not the midpoint.
  const FD_HOURS = 1;
  const astroTime = new Astronomy.AstroTime(date);
  const astroTimeFuture = new Astronomy.AstroTime(
    new Date(date.getTime() + FD_HOURS * 60 * 60 * 1000),
  );
  const dtDays = FD_HOURS / 24;

  // Astrology is GEOCENTRIC. All bodies — including Sun and Moon — are reduced
  // to geocentric ecliptic coordinates (longitude, latitude, Earth-distance).
  //
  // Sun: GeoVector(Sun) gives the apparent geocentric vector to the Sun (≈ -Earth
  //      heliocentric vector). We do NOT use the "Earth+180°, r=1 AU" shortcut —
  //      Earth's distance from the Sun varies (~0.983–1.017 AU), and that variation
  //      modulates the inverse-square coupling in the alchemical force calculation.
  // Moon: GeoMoon(t) returns equatorial geocentric (AU); convert via Ecliptic().
  // Planets: GeoVector → Ecliptic, distance is the geocentric range in AU.
  const geoEcliptic = (
    body: any,
    at: any,
  ): { elon: number; elat: number; r: number } | null => {
    try {
      if (body === Astronomy.Body.Moon) {
        // Astronomy.GeoMoon returns geocentric Moon vector in AU (J2000 ecliptic).
        const moonVec = Astronomy.GeoMoon(at);
        const ecl = Astronomy.Ecliptic(moonVec);
        const r = Math.sqrt(
          moonVec.x * moonVec.x +
            moonVec.y * moonVec.y +
            moonVec.z * moonVec.z,
        );
        return { elon: ecl.elon, elat: ecl.elat ?? 0, r };
      }
      // Sun and planets: aberration-corrected geocentric vector → ecliptic.
      const geoVec = Astronomy.GeoVector(body, at, true);
      const ecl = Astronomy.Ecliptic(geoVec);
      const r = Math.sqrt(
        geoVec.x * geoVec.x + geoVec.y * geoVec.y + geoVec.z * geoVec.z,
      );
      return { elon: ecl.elon, elat: ecl.elat ?? 0, r };
    } catch {
      return null;
    }
  };

  const wrapDeltaLon = (diff: number): number => {
    let d = diff;
    if (d > 180) d -= 360;
    else if (d < -180) d += 360;
    return d;
  };

  for (const planet of planets) {
    try {
      const ecl = geoEcliptic(planet.body, astroTime);
      if (!ecl) throw new Error("ecliptic calc failed");
      const longitude = ecl.elon;

      const eclFuture = geoEcliptic(planet.body, astroTimeFuture);
      let longitudeSpeed = 0;
      let latitudeSpeed = 0;
      let distanceSpeed = 0;
      if (eclFuture) {
        longitudeSpeed = wrapDeltaLon(eclFuture.elon - longitude) / dtDays;
        latitudeSpeed = (eclFuture.elat - ecl.elat) / dtDays;
        distanceSpeed = (eclFuture.r - ecl.r) / dtDays;
      }
      const isRetrograde = longitudeSpeed < 0;

      const zodiacPos = longitudeToZodiacPosition(longitude);

      positions[planet.name] = {
        sign: zodiacPos.sign,
        degree: zodiacPos.degree,
        minute: zodiacPos.minute,
        exactLongitude: longitude,
        isRetrograde,
        longitudeSpeed,
        eclipticLatitude: ecl.elat,
        latitudeSpeed,
        distance: ecl.r,
        distanceSpeed,
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
 * Calculate the Ascendant (Rising Sign) using astronomy-engine's accurate
 * Greenwich Apparent Sidereal Time function, then applying the standard
 * Ascendant formula (Meeus, "Astronomical Algorithms").
 *
 * @param date        The date and time of birth / moment in question (UTC)
 * @param latitude    Observer's geographic latitude (degrees, positive = N)
 * @param longitude   Observer's geographic longitude (degrees, positive = E)
 */
export function calculateAscendantPosition(
  date: Date,
  latitude: number,
  longitude: number,
): PlanetPosition {
  const astroTime = new Astronomy.AstroTime(date);

  // Greenwich Apparent Sidereal Time in hours [0, 24) — precise via astronomy-engine
  const gastHours = Astronomy.SiderealTime(astroTime);

  // Local Sidereal Time in degrees [0, 360)
  const lstDeg = ((gastHours * 15 + longitude) % 360 + 360) % 360;
  const lstRad = lstDeg * Math.PI / 180;

  // Obliquity of the ecliptic (degrees → radians)
  // mean obliquity of ecliptic for J2000
  const OBLIQUITY_J2000 = 23.4392911;
  const oblRad = OBLIQUITY_J2000 * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;

  // Ascendant ecliptic longitude — standard formula
  // tan(ASC) = cos(LST) / -(sin(ε)·tan(φ) + cos(ε)·sin(LST))
  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad)),
  );
  const ascLongitude = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;

  const zodiacPos = longitudeToZodiacPosition(ascLongitude);
  logger.info(
    `Ascendant calculated: ${ascLongitude.toFixed(2)}° → ${zodiacPos.degree}°${zodiacPos.sign}`,
  );
  return {
    sign: zodiacPos.sign,
    degree: zodiacPos.degree,
    minute: zodiacPos.minute,
    exactLongitude: ascLongitude,
    isRetrograde: false,
  };
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
