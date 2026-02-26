/**
 * Swiss Ephemeris calculations module
 *
 * ⚠️ DEPRECATED (November 2025)
 * This module is deprecated and no longer used in production.
 * High-precision planetary calculations have been migrated to the Python backend
 * using pyswisseph for better reliability in serverless environments.
 *
 * See: /backend/alchm_kitchen/main.py - /api/planetary/positions endpoint
 *
 * Kept for reference only - do not use in new code.
 */

import type { ZodiacSignType } from "@/types/celestial";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import { createLogger } from "@/utils/logger";

const logger = createLogger("SwissEphemeris");

// Lazy load swisseph-v2 to handle cases where it's not installed yet
let swisseph: typeof import("swisseph-v2") | null = null;
let ephemerisInitialized = false;

/**
 * Initialize Swiss Ephemeris library
 * @param ephePath Optional path to ephemeris files (null for Moshier)
 */
export function initializeSwissEphemeris(ephePath: string | null = null): void {
  try {
    if (!swisseph) {
       
      swisseph = require("swisseph-v2");
    }

    if (swisseph && !ephemerisInitialized) {
      // Set ephemeris path (null uses built-in Moshier ephemeris)
      swisseph.swe_set_ephe_path(ephePath);

      // Use tropical zodiac by default (no sidereal mode)
      // For sidereal, call swisseph.swe_set_sid_mode() before calculations

      ephemerisInitialized = true;
      logger.info("Swiss Ephemeris initialized successfully");
      logger.info(
        `Ephemeris mode: ${ephePath ? "Swiss Ephemeris files" : "Moshier (built-in)"}`,
      );
      logger.info(`Version: ${swisseph.swe_version()}`);
    }
  } catch (error) {
    logger.error("Failed to initialize Swiss Ephemeris:", error);
    throw new Error(
      "Swiss Ephemeris library not available. Run 'yarn install' to install swisseph-v2.",
    );
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
  // Normalize to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  // Each sign is 30 degrees
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
 * Calculate planetary positions using Swiss Ephemeris
 * @param date Date/time for calculations
 * @param zodiacSystem 'tropical' (default) or 'sidereal'
 * @param siderealMode Sidereal ayanamsa mode (only used if zodiacSystem is 'sidereal')
 * @returns Record of planetary positions
 */
export function calculatePlanetaryPositionsSwissEph(
  date: Date,
  zodiacSystem: "tropical" | "sidereal" = "tropical",
  siderealMode?: number,
): Record<string, PlanetPosition> {
  // Initialize if needed
  if (!ephemerisInitialized) {
    initializeSwissEphemeris();
  }

  if (!swisseph) {
    throw new Error("Swiss Ephemeris not initialized");
  }

  const positions: Record<string, PlanetPosition> = {};

  try {
    // Convert date to Julian day
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS months are 0-indexed
    const day = date.getDate();
    const hour =
      date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

    const julianDay = swisseph.swe_julday(
      year,
      month,
      day,
      hour,
      swisseph.SE_GREG_CAL,
    );

    logger.info(
      `Calculating positions for ${date.toISOString()} (JD: ${julianDay.toFixed(6)})`,
    );

    // Set sidereal mode if requested
    if (zodiacSystem === "sidereal") {
      const mode = siderealMode || swisseph.SE_SIDM_LAHIRI; // Default to Lahiri
      swisseph.swe_set_sid_mode(mode, 0, 0);
      logger.info(`Using sidereal zodiac (ayanamsa mode: ${mode})`);
    }

    // Calculate flag - use Swiss Ephemeris with speed calculations
    const calcFlag =
      swisseph.SEFLG_SWIEPH |
      swisseph.SEFLG_SPEED |
      (zodiacSystem === "sidereal" ? swisseph.SEFLG_SIDEREAL : 0);

    // Define planets to calculate
    const planets = [
      { name: "Sun", constant: swisseph.SE_SUN },
      { name: "Moon", constant: swisseph.SE_MOON },
      { name: "Mercury", constant: swisseph.SE_MERCURY },
      { name: "Venus", constant: swisseph.SE_VENUS },
      { name: "Mars", constant: swisseph.SE_MARS },
      { name: "Jupiter", constant: swisseph.SE_JUPITER },
      { name: "Saturn", constant: swisseph.SE_SATURN },
      { name: "Uranus", constant: swisseph.SE_URANUS },
      { name: "Neptune", constant: swisseph.SE_NEPTUNE },
      { name: "Pluto", constant: swisseph.SE_PLUTO },
    ];

    // Calculate each planet
    for (const planet of planets) {
      try {
        const result = swisseph.swe_calc_ut(
          julianDay,
          planet.constant,
          calcFlag,
        );

        if (result.error) {
          logger.warn(`Error calculating ${planet.name}: ${result.error}`);
          continue;
        }

        const longitude = result.longitude;
        const speed = result.longitudeSpeed;

        // Convert to zodiac position
        const zodiacPos = longitudeToZodiacPosition(longitude);

        // Determine if retrograde (negative speed)
        // Sun and Moon are never retrograde
        const isRetrograde =
          planet.name !== "Sun" && planet.name !== "Moon" && speed < 0;

        positions[planet.name] = {
          sign: zodiacPos.sign,
          degree: zodiacPos.degree,
          minute: zodiacPos.minute,
          exactLongitude: longitude,
          isRetrograde,
        };

        logger.info(
          `${planet.name}: ${zodiacPos.sign} ${zodiacPos.degree}°${zodiacPos.minute}' (${longitude.toFixed(4)}°) ${isRetrograde ? "Rx" : ""}`,
        );
      } catch (planetError) {
        logger.error(`Failed to calculate ${planet.name}:`, planetError);
      }
    }

    // Calculate lunar nodes (North Node / Rahu)
    try {
      const northNodeResult = swisseph.swe_calc_ut(
        julianDay,
        swisseph.SE_MEAN_NODE, // Use mean node (more stable)
        calcFlag,
      );

      if (!northNodeResult.error) {
        const longitude = northNodeResult.longitude;
        const zodiacPos = longitudeToZodiacPosition(longitude);

        positions["NorthNode"] = {
          sign: zodiacPos.sign,
          degree: zodiacPos.degree,
          minute: zodiacPos.minute,
          exactLongitude: longitude,
          isRetrograde: true, // Nodes are always retrograde
        };

        // South Node is always 180° opposite
        const southNodeLongitude = (longitude + 180) % 360;
        const southNodePos = longitudeToZodiacPosition(southNodeLongitude);

        positions["SouthNode"] = {
          sign: southNodePos.sign,
          degree: southNodePos.degree,
          minute: southNodePos.minute,
          exactLongitude: southNodeLongitude,
          isRetrograde: true,
        };

        logger.info(
          `North Node: ${zodiacPos.sign} ${zodiacPos.degree}°${zodiacPos.minute}' Rx`,
        );
      }
    } catch (nodeError) {
      logger.warn("Failed to calculate lunar nodes:", nodeError);
    }

    logger.info(
      `Successfully calculated ${Object.keys(positions).length} planetary positions`,
    );
  } catch (error) {
    logger.error("Error in Swiss Ephemeris calculations:", error);
    throw error;
  }

  return positions;
}

/**
 * Calculate houses for a given time and location
 * @param date Date/time for calculations
 * @param latitude Geographic latitude in degrees
 * @param longitude Geographic longitude in degrees (positive east)
 * @param houseSystem House system ('P' for Placidus, 'K' for Koch, etc.)
 * @returns Houses and angles (Ascendant, MC, etc.)
 */
export function calculateHouses(
  date: Date,
  latitude: number,
  longitude: number,
  houseSystem: string = "P", // Placidus by default
): {
  cusps: number[];
  ascendant: number;
  mc: number;
  vertex: number;
} {
  if (!ephemerisInitialized) {
    initializeSwissEphemeris();
  }

  if (!swisseph) {
    throw new Error("Swiss Ephemeris not initialized");
  }

  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour =
      date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

    const julianDay = swisseph.swe_julday(
      year,
      month,
      day,
      hour,
      swisseph.SE_GREG_CAL,
    );

    const result = swisseph.swe_houses(
      julianDay,
      latitude,
      longitude,
      houseSystem,
    );

    return {
      cusps: result.cusps,
      ascendant: result.ascmc[0], // Ascendant
      mc: result.ascmc[1], // Midheaven
      vertex: result.ascmc[3], // Vertex
    };
  } catch (error) {
    logger.error("Error calculating houses:", error);
    throw error;
  }
}

/**
 * Get ayanamsa (precession offset) for a given date
 * @param date Date for ayanamsa calculation
 * @param siderealMode Sidereal ayanamsa mode (e.g., SE_SIDM_LAHIRI)
 * @returns Ayanamsa value in degrees
 */
export function getAyanamsa(date: Date, siderealMode: number): number {
  if (!ephemerisInitialized) {
    initializeSwissEphemeris();
  }

  if (!swisseph) {
    throw new Error("Swiss Ephemeris not initialized");
  }

  try {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour =
      date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

    const julianDay = swisseph.swe_julday(
      year,
      month,
      day,
      hour,
      swisseph.SE_GREG_CAL,
    );

    swisseph.swe_set_sid_mode(siderealMode, 0, 0);
    return swisseph.swe_get_ayanamsa_ut(julianDay);
  } catch (error) {
    logger.error("Error calculating ayanamsa:", error);
    throw error;
  }
}

/**
 * Close Swiss Ephemeris and free resources
 */
export function closeSwissEphemeris(): void {
  if (swisseph && ephemerisInitialized) {
    swisseph.swe_close();
    ephemerisInitialized = false;
    logger.info("Swiss Ephemeris closed");
  }
}

/**
 * Check if Swiss Ephemeris is available
 * @returns true if swisseph-v2 is installed and available
 */
export function isSwissEphemerisAvailable(): boolean {
  try {
    if (!swisseph) {
       
      swisseph = require("swisseph-v2");
    }
    return swisseph !== null;
  } catch {
    return false;
  }
}
