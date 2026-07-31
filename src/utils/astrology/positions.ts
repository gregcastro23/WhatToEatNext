// astronomy-engine is a CommonJS module — import the whole namespace
// so Body, AstroTime, etc. resolve correctly regardless of bundler ESM/CJS resolution.
import * as Astronomy from "astronomy-engine";
import { _logger } from "@/lib/logger";
import type { ZodiacSignType } from "@/types/celestial";
import type { DegradedInfo } from "@/types/degraded";

// Removed unused log import

/**
 * A utility function for logging debug information
 * This is a safe replacement for _logger.info that can be disabled in production
 */
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // Comment out _logger.info to avoid linting warnings;
  // log.info(message, ...args)
};

// Reference data for April 2, 2026 at 12:00 UTC
// Positions cross-checked with JPL Horizons ephemeris data
const REFERENCE_POSITIONS: Record<string, [number, number, number, string]> = {
  // [degrees_in_sign, minutes, seconds, zodiacSign]
  Sun: [12, 44, 0, "aries"],        // ~12°44' Aries
  Moon: [14, 22, 0, "scorpio"],     // ~14°22' Scorpio
  Mercury: [26, 15, 0, "pisces"],   // ~26°15' Pisces (still in Pisces, pre-ingress)
  Venus: [3, 10, 0, "aries"],       // ~3°10' Aries (post-retrograde re-entry)
  Mars: [22, 18, 0, "cancer"],      // ~22°18' Cancer
  Jupiter: [20, 52, 0, "cancer"],   // ~20°52' Cancer
  Saturn: [25, 2, 0, "pisces"],     // ~25°2' Pisces
  Uranus: [3, 20, 0, "gemini"],     // ~3°20' Gemini
  Neptune: [2, 8, 0, "aries"],      // ~2°8' Aries
  Pluto: [5, 50, 0, "aquarius"],    // ~5°50' Aquarius
  NorthNode: [26, 34, 0, "pisces"], // ~26°34' Pisces (always retrograde)
  Chiron: [21, 42, 0, "aries"],     // ~21°42' Aries
  Ascendant: [0, 0, 0, "aries"],    // Placeholder - depends on birth location
  MC: [0, 0, 0, "capricorn"],       // Placeholder - depends on birth location
};

// Reference date: April 2, 2026 at 12:00 UTC
const REFERENCE_DATE = new Date("2026-04-02T12:00:00Z");

// Mean daily motion of planets in degrees (from astronomical ephemeris)
// Negative values are NOT used here — retrograde direction is handled separately
// via RETROGRADE_STATUS so that getFallbackPlanetaryPositions interpolates correctly.
const DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mercury: 1.383,
  Venus: 1.2,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.034,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004,
  NorthNode: 0.053,
  Chiron: 0.018,
  Ascendant: 1.0, // Location-dependent, approximate
  MC: 1.0,        // Location-dependent, approximate
};

// Retrograde status as of April 2, 2026
const RETROGRADE_STATUS: Record<string, boolean> = {
  Sun: false,
  Moon: false,
  Mercury: false,
  Venus: true,      // Venus retrograde (ends ~April 12, 2026)
  Mars: false,
  Jupiter: false,
  Saturn: false,
  Uranus: false,
  Neptune: false,
  Pluto: false,
  NorthNode: true,  // Lunar nodes always retrograde
  Chiron: false,
  Ascendant: false,
  MC: false,
};

/**
 * Type definition for cached positions
 */
interface PositionsCache {
  positions: { [key: string]: PlanetPositionData };
  degraded: DegradedInfo | null;
  timestamp: number;
  date: Date;
}

/**
 * Type for planetary position object
 */
export interface PlanetPositionData {
  sign: ZodiacSignType;
  degree: number;
  exactLongitude: number;
  isRetrograde: boolean;
}

// Map our planet names to astronomy-engine bodies (Capitalized per casing convention)
const PLANET_MAPPING: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

// Cache for planetary positions to avoid frequent recalculations
let positionsCache: PositionsCache | null = null;

// Cache expiration in milliseconds (15 minutes)
const CACHE_EXPIRATION = 15 * 60 * 1000;

// Zodiac signs in order
const ZODIAC_SIGNS = [
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

/**
 * Convert a position in degrees, minutes, seconds to decimal degrees
 */
function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number,
): number {
  return degrees + minutes / 60 + seconds / 3600;
}

/**
 * Convert a zodiac sign to its starting degree (0-330)
 */
function zodiacStartDegree(sign: string): number {
  const index = ZODIAC_SIGNS.indexOf(sign);
  return index * 30;
}

/**
 * Calculate the longitude in decimal degrees based on reference data
 */
function calculateReferenceLongitude(planet: string): number {
  if (!REFERENCE_POSITIONS[planet]) {
    debugLog(`No reference position for ${planet}, using default`);
    return 0;
  }

  const [degrees, minutes, seconds, sign] = REFERENCE_POSITIONS[planet];
  const decimalDegrees = dmsToDecimal(degrees, minutes, seconds);
  const signStart = zodiacStartDegree(sign);

  return (signStart + decimalDegrees) % 360;
}

/**
 * Get planetary positions for a given date using fallback approach
 */
export function getFallbackPlanetaryPositions(date: Date): Record<string, PlanetPositionData> {
  const positions: Record<string, PlanetPositionData> = {};

  // Calculate days difference from reference date
  const daysDiff =
    (date.getTime() - REFERENCE_DATE.getTime()) / (24 * 60 * 60 * 1000);

  // Calculate position for each planet
  for (const planet of Object.keys(REFERENCE_POSITIONS)) {
    const refLongitude = calculateReferenceLongitude(planet);
    const motion = DAILY_MOTION[planet] || 0;
    const isRetrograde = RETROGRADE_STATUS[planet] || false;

    // Adjust motion direction for retrograde planets
    const adjustedMotion = isRetrograde ? -Math.abs(motion) : Math.abs(motion);

    // Deterministic linear interpolation from reference positions
    let newLongitude = refLongitude + adjustedMotion * daysDiff;

    // Normalize to 0-360 degrees
    newLongitude = ((newLongitude % 360) + 360) % 360;

    // Get zodiac sign and degree
    const signIndex = Math.floor(newLongitude / 30);
    const degree = newLongitude % 30;
    const sign = ZODIAC_SIGNS[signIndex];

    // Store both the raw longitude and the formatted data
    positions[planet] = {
      sign: sign.toLowerCase() as ZodiacSignType,
      degree: parseFloat(degree.toFixed(2)),
      exactLongitude: newLongitude,
      isRetrograde,
    };
  }

  return positions;
}

/**
 * Calculate lunar node positions with more accurate reference data (private helper)
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
function calculateLunarNodesInternal(date: Date): {
  NorthNode: number;
  isRetrograde: boolean;
} {
  try {
    // Since moonNode is not available in astronomy-engine,
    // we'll implement a simple approximation using astronomical formulas

    // Time in Julian centuries since 2000
    const jd = Astronomy.MakeTime(date).tt;
    const T = (jd - 2451545.0) / 36525;

    // Mean longitude of ascending node (Meeus formula)
    let Omega =
      125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;

    // Normalize to 0-360 range
    Omega = ((Omega % 360) + 360) % 360;

    // The ascending node (North Node) is the opposite of Omega
    const NorthNode = (Omega + 180) % 360;

    // Nodes are always retrograde
    return { NorthNode, isRetrograde: true };
  } catch (error) {
    debugLog(
      "Error calculating lunar nodes: ",
      error instanceof Error ? error.message : String(error),
    );
    // Return current position for March 2024 (late pisces)
    return { NorthNode: 356.54, isRetrograde: true };
  }
}

/**
 * Default "live sky" vantage point. Current-moment calls carry no location of
 * their own, so the app observes the present sky from New York (Eastern US).
 */
export const NEW_YORK_OBSERVER = { latitude: 40.7128, longitude: -74.006 } as const;

/**
 * Diurnal/nocturnal sect at an ARBITRARY moment and place — the Sun's true
 * altitude above that observer's horizon.
 *
 * This is the primitive the other sect helpers are built from. Use it directly
 * whenever the moment and the place are both known — above all for **natal
 * charts**, where sect must be evaluated at the birth time and birthplace.
 * Getting either wrong flips the entire day/night ESMS split (day →
 * Spirit/Essence, night → Matter/Substance) and therefore the whole chart.
 *
 * Degrades to the UTC-hour heuristic only if astronomy-engine throws.
 */
export function isDiurnalAt(
  date: Date,
  latitude: number,
  longitude: number,
): boolean {
  try {
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    const equ = Astronomy.Equator(Astronomy.Body.Sun, date, observer, true, true);
    const hor = Astronomy.Horizon(date, observer, equ.ra, equ.dec, "normal");
    return hor.altitude > 0;
  } catch {
    const hour = date.getUTCHours();
    return hour >= 6 && hour < 18;
  }
}

/**
 * Diurnal/nocturnal sect for the *current sky*, observed from New York.
 *
 * Sect drives the entire day/night ESMS split (day → Spirit/Essence, night →
 * Matter/Substance), so it must reflect whether the Sun is actually above the
 * observer's horizon — not a raw UTC hour. The location-less `isSectDiurnal`
 * (UTC 06:00–18:00) is wrong for New York by ~5h (US afternoons read as "night").
 * This computes the Sun's true altitude at NY for `date`; if astronomy-engine
 * throws (it shouldn't at this latitude) it degrades to the UTC-hour heuristic.
 *
 * Use this for any "now"/live-sky sect. For a natal chart use
 * {@link isDiurnalAt} with the birth moment AND the birthplace — New York is
 * the site's reference observer, not the subject's.
 */
export function isCurrentSkyDiurnal(date: Date = new Date()): boolean {
  return isDiurnalAt(
    date,
    NEW_YORK_OBSERVER.latitude,
    NEW_YORK_OBSERVER.longitude,
  );
}

/**
 * Get accurate planetary positions AND report whether any value was interpolated.
 *
 * When astronomy-engine succeeds the result is live (not degraded). When a
 * planet (or the whole calculation) falls back to {@link getFallbackPlanetaryPositions}
 * — which interpolates from a fixed reference date — the result is degraded with
 * reason `stale-positions`.
 *
 * Callers that don't need the signal should use {@link getAccuratePlanetaryPositions}.
 * @param date Date to calculate positions for
 */
export function getAccuratePlanetaryPositionsWithMeta(date: Date): {
  positions: { [key: string]: PlanetPositionData };
  degraded: DegradedInfo | null;
} {
  // True when any planet's value came from the interpolated fallback.
  let usedFallback = false;
  try {
    // Check cache first
    if (
      positionsCache &&
      Math.abs(date.getTime() - positionsCache.date.getTime()) < 60000 && // 1 minute cache for same date
      Date.now() - positionsCache.timestamp < CACHE_EXPIRATION
    ) {
      debugLog("Using cached planetary positions");
      return {
        positions: positionsCache.positions,
        degraded: positionsCache.degraded,
      };
    }

    const astroTime = new Astronomy.AstroTime(date);
    const positions: { [key: string]: PlanetPositionData } = {};

    // Calculate position for each planet
    for (const [planet, body] of Object.entries(PLANET_MAPPING)) {
      try {
        // Special handling for the Sun - can't calculate heliocentric longitude of the Sun
        if (planet === "Sun") {
          // For the Sun we'll use a different approach - get ecliptic coordinates directly
          // The Sun is always at the opposite ecliptic longitude from earth's heliocentric longitude
          const earthLong = Astronomy.EclipticLongitude(
            Astronomy.Body.Earth,
            astroTime,
          );
          // Sun is 180 degrees opposite earth's heliocentric position
          const sunLong = (earthLong + 180) % 360;

          // Check if the Sun is retrograde (it never is from earth's perspective)
          const isRetrograde = false;

          // Get sign and degree
          const { sign, degree } = getSignFromLongitude(sunLong);

          positions[planet] = {
            sign: sign.toLowerCase() as ZodiacSignType,
            degree,
            exactLongitude: sunLong,
            isRetrograde,
          };
        } else {
          // For other planets, use geocentric ecliptic longitude and motion direction
          const geoVector = Astronomy.GeoVector(body, astroTime, true);
          const ecliptic = Astronomy.Ecliptic(geoVector);
          const longitude = ecliptic.elon;
          const isRetrograde = isPlanetRetrograde(body, date);

          // Get sign and degree
          const { sign, degree } = getSignFromLongitude(longitude);

          positions[planet] = {
            sign: sign.toLowerCase() as ZodiacSignType,
            degree,
            exactLongitude: longitude,
            isRetrograde,
          };
        }
      } catch (error) {
        debugLog(
          `Error calculating position for ${planet}:`,
          error instanceof Error ? error.message : String(error),
        );

        // Use fallback method for this planet
        const fallbackData = getFallbackPlanetaryPositions(date);
        const fallback = fallbackData[planet];
        if (fallback) {
          positions[planet] = fallback;
          usedFallback = true;
        }
      }
    }

    // Calculate lunar nodes
    try {
      const nodeData = calculateLunarNodes(date);
      const NorthNode = getNodeInfo(nodeData.NorthNode);
      positions.NorthNode = NorthNode;

      // Calculate South Node (opposite North Node)
      const southNodeLongitude = (nodeData.NorthNode + 180) % 360;
      const SouthNode = getNodeInfo(southNodeLongitude);
      positions.SouthNode = SouthNode;
    } catch (error) {
      debugLog(
        "Error calculating lunar nodes: ",
        error instanceof Error ? error.message : String(error),
      );
    }

    // Update cache
    const degraded: DegradedInfo | null = usedFallback
      ? { reasons: ["stale-positions"] }
      : null;
    positionsCache = {
      positions,
      degraded,
      timestamp: Date.now(),
      date: new Date(date),
    };

    return { positions, degraded };
  } catch (error) {
    debugLog(
      "Error in getAccuratePlanetaryPositions: ",
      error instanceof Error ? error.message : String(error),
    );

    // Return fallback positions with proper type conversion
    const fallbackData = getFallbackPlanetaryPositions(date);
    const convertedPositions: Record<string, PlanetPositionData> = { ...fallbackData };

    return {
      positions: convertedPositions,
      degraded: { reasons: ["stale-positions"] },
    };
  }
}

/**
 * Get accurate planetary positions using astronomy-engine.
 *
 * Thin wrapper over {@link getAccuratePlanetaryPositionsWithMeta} that drops the
 * degraded signal, preserving the original signature for existing callers.
 * @param date Date to calculate positions for
 * @returns Record of planetary positions in degrees (0-360)
 */
export function getAccuratePlanetaryPositions(date: Date): {
  [key: string]: PlanetPositionData;
} {
  return getAccuratePlanetaryPositionsWithMeta(date).positions;
}

/**
 * Calculate lunar nodes with more accurate reference data
 * @param date Date to calculate for
 * @returns Object with north node position and retrograde status
 */
export function calculateLunarNodes(date: Date = new Date()): {
  NorthNode: number;
  isRetrograde: boolean;
} {
  return calculateLunarNodesInternal(date);
}

/**
 * Get node information based on longitude
 * @param nodeLongitude Node longitude in degrees
 * @returns Node position data
 */
export function getNodeInfo(nodeLongitude: number): PlanetPositionData {
  const { sign, degree } = getSignFromLongitude(nodeLongitude);

  return {
    sign: (sign.toLowerCase() || "aries") as ZodiacSignType,
    degree,
    exactLongitude: nodeLongitude,
    isRetrograde: true, // Lunar nodes are always retrograde
  };
}

/**
 * Get sign from longitude
 * @param longitude Longitude in degrees
 * @returns Object with sign and degree
 */
export function getSignFromLongitude(longitude: number): {
  sign: string;
  degree: number;
} {
  return getLongitudeToZodiacPosition(longitude);
}

/**
 * Clear the positions cache
 */
export function clearPositionsCache(): void {
  positionsCache = null;
  debugLog("Positions cache cleared");
}

/**
 * Get a summary of current planetary positions
 * @returns String summary of positions
 */
export function getPositionsSummary(): string {
  if (!positionsCache) {
    return "No positions data in cache";
  }

  const { positions, timestamp } = positionsCache;
  const formattedDate = new Date(timestamp).toISOString();

  let summary = `Planetary positions as of ${formattedDate}:\n`;

  for (const [planet, data] of Object.entries(positions)) {
    summary += `${planet}: ${data.sign} ${data.degree.toFixed(2)}° ${data.isRetrograde ? "(R)" : ""}\n`;
  }

  return summary;
}

/**
 * Validate the structure of a positions object
 * @param positions Positions object to validate
 * @returns Boolean indicating if the structure is valid
 */
export function validatePositionsStructure(positions: {
  [key: string]: unknown;
}): boolean {
  if (!positions || typeof positions !== "object") {
    return false;
  }

  // Check if at least some key planets exist
  const requiredPlanets = ["Sun", "Moon", "Mercury", "Venus", "Mars"];
  for (const planet of requiredPlanets) {
    if (!positions[planet]) {
      return false;
    }

    const pos = positions[planet];
    if (typeof pos !== "object" || pos === null) {
      return false;
    }

    // Check for required properties
    const planetData = pos as Record<string, unknown>;
    if (!planetData.sign || typeof planetData.degree !== "number") {
      return false;
    }
  }

  return true;
}

/**
 * Convert longitude to zodiac position
 * @param longitude Longitude in degrees
 * @returns Object with sign and degree
 */
export function getLongitudeToZodiacPosition(longitude: number): {
  sign: string;
  degree: number;
} {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;

  // Calculate zodiac sign index (0-11)
  const signIndex = Math.floor(normalizedLongitude / 30);

  // Calculate degree within sign (0-29.999...)
  const degree = normalizedLongitude % 30;

  // Get sign name
  const sign = ZODIAC_SIGNS[signIndex];

  return { sign, degree };
}

/**
 * Check if a planet is retrograde
 * @param body Astronomy body
 * @param date Date to check
 * @returns Boolean indicating if planet is retrograde
 */
function isPlanetRetrograde(body: Astronomy.Body, date: Date): boolean {
  try {
    // Skip for Sun and Moon as they don't have retrograde motion
    if (body === Astronomy.Body.Sun || body === Astronomy.Body.Moon) {
      return false;
    }

    // Create proper AstroTime objects
    const astroTime = new Astronomy.AstroTime(date);
    const prevTime = new Astronomy.AstroTime(
      new Date(date.getTime() - 2 * 24 * 60 * 60 * 1000),
    ); // 2 days before

    // Check if position is decreasing (retrograde). Retrograde is a GEOCENTRIC
    // phenomenon — Astronomy.EclipticLongitude is heliocentric for non-Moon
    // bodies and never reverses, so we must go through GeoVector → Ecliptic.
    const currentLong = Astronomy.Ecliptic(
      Astronomy.GeoVector(body, astroTime, true),
    ).elon;
    const prevLong = Astronomy.Ecliptic(
      Astronomy.GeoVector(body, prevTime, true),
    ).elon;

    // Adjust for crossing 0/360 boundary
    let diff = currentLong - prevLong;
    if (Math.abs(diff) > 180) {
      diff = diff > 0 ? diff - 360 : diff + 360;
    }

    return diff < 0;
  } catch (error) {
    debugLog(
      `Error determining retrograde for ${body}:`,
      error instanceof Error ? error.message : String(error),
    );
    // Default to not retrograde when calculation fails
    return false;
  }
}
