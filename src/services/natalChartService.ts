/**
 * Natal Chart Service
 *
 * Calculates natal (birth) charts from birth data
 * Uses the astrologize API and planetary alchemy mapping
 */

import { fetchPlanetaryPositions } from "@/services/astrologizeApi";
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
} from "@/utils/planetaryAlchemyMapping";
import { _logger } from "@/lib/logger";

interface BirthLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface BirthData {
  birthDate: string; // ISO date string
  birthTime: string; // HH:mm format
  birthLocation: BirthLocation;
}

export interface NatalChart {
  planetaryPositions: Record<string, string>; // Planet name -> Zodiac sign
  elementalComposition: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  alchemicalProperties: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
  };
  calculatedAt: string; // ISO timestamp
}

/**
 * Calculate natal chart from birth data
 *
 * @param birthData - Birth date, time, and location
 * @returns Complete natal chart with planetary positions, elemental composition, and alchemical properties
 */
export async function calculateNatalChart(
  birthData: BirthData,
): Promise<NatalChart> {
  try {
    _logger.info("Calculating natal chart for birth data:", birthData);

    // Parse birth date and time
    const birthDateTime = new Date(`${birthData.birthDate}T${birthData.birthTime}`);

    // Prepare request for astrologize API
    const request = {
      year: birthDateTime.getFullYear(),
      month: birthDateTime.getMonth() + 1, // 1-indexed (January = 1)
      date: birthDateTime.getDate(),
      hour: birthDateTime.getHours(),
      minute: birthDateTime.getMinutes(),
      latitude: birthData.birthLocation.latitude,
      longitude: birthData.birthLocation.longitude,
      zodiacSystem: "tropical" as const,
    };

    _logger.debug("Fetching planetary positions for:", request);

    // Fetch planetary positions from astrologize API
    const planetaryPositionsDetailed = await fetchPlanetaryPositions(request);

    // Extract just the zodiac signs (capitalize first letter to match ZODIAC_ELEMENTS)
    const planetaryPositions: Record<string, string> = {};
    for (const [planet, position] of Object.entries(planetaryPositionsDetailed)) {
      // Capitalize the first letter of the sign to match the ZODIAC_ELEMENTS keys
      const sign = position.sign.charAt(0).toUpperCase() + position.sign.slice(1);
      planetaryPositions[planet] = sign;
    }

    _logger.debug("Planetary positions:", planetaryPositions);

    // Calculate alchemical properties (ESMS) from planetary positions
    const alchemicalProperties = calculateAlchemicalFromPlanets(planetaryPositions);

    _logger.debug("Alchemical properties (ESMS):", alchemicalProperties);

    // Calculate elemental composition from zodiac signs
    const elementalComposition = aggregateZodiacElementals(planetaryPositions);

    _logger.debug("Elemental composition:", elementalComposition);

    // Create natal chart object
    const natalChart: NatalChart = {
      planetaryPositions,
      elementalComposition,
      alchemicalProperties,
      calculatedAt: new Date().toISOString(),
    };

    _logger.info("Natal chart calculated successfully");

    return natalChart;
  } catch (error) {
    _logger.error("Error calculating natal chart:", error);
    throw new Error(`Failed to calculate natal chart: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get default birth data (current moment, New York)
 *
 * @returns Default birth data with current date/time and New York location
 */
export function getDefaultBirthData(): BirthData {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return {
    birthDate: dateStr,
    birthTime: timeStr,
    birthLocation: {
      latitude: 40.7128,
      longitude: -74.006,
      city: "New York",
      country: "United States",
    },
  };
}

/**
 * Validate birth data
 *
 * @param birthData - Birth data to validate
 * @returns True if valid, throws error otherwise
 */
export function validateBirthData(birthData: BirthData): boolean {
  // Validate date
  const date = new Date(birthData.birthDate);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid birth date");
  }

  // Validate time format (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(birthData.birthTime)) {
    throw new Error("Invalid birth time format (expected HH:mm)");
  }

  // Validate location
  if (
    birthData.birthLocation.latitude < -90 ||
    birthData.birthLocation.latitude > 90
  ) {
    throw new Error("Invalid latitude (must be between -90 and 90)");
  }

  if (
    birthData.birthLocation.longitude < -180 ||
    birthData.birthLocation.longitude > 180
  ) {
    throw new Error("Invalid longitude (must be between -180 and 180)");
  }

  return true;
}
