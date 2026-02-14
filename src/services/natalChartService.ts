/**
 * Natal Chart Service
 *
 * Service for calculating individual natal charts from birth data.
 * Uses the astrologize API and planetary alchemy mapping to generate
 * complete natal chart data including elemental and alchemical properties.
 */

import type { BirthData, NatalChart } from "@/types/natalChart";
import type {
  Planet,
  ZodiacSignType,
  Element,
  Modality,
} from "@/types/celestial";
import {
  calculateAlchemicalFromPlanets,
  aggregateZodiacElementals,
  getDominantElement,
} from "@/utils/planetaryAlchemyMapping";
import { getModalityForZodiac } from "@/utils/zodiacUtils";
import { _logger } from "@/lib/logger";

/**
 * Interface for the astrologize API response (simplified)
 */
interface AstrologizePlanetData {
  key: string;
  label: string;
  Sign: {
    key: string;
    zodiac: string;
    label: string;
  };
  ChartPosition: {
    Ecliptic: {
      DecimalDegrees: number;
      ArcDegrees: {
        degrees: number;
        minutes: number;
        seconds: number;
      };
    };
  };
  isRetrograde: boolean;
}

interface AstrologizeResponse {
  _celestialBodies: {
    all: AstrologizePlanetData[];
    sun: AstrologizePlanetData;
    moon: AstrologizePlanetData;
    mercury: AstrologizePlanetData;
    venus: AstrologizePlanetData;
    mars: AstrologizePlanetData;
    jupiter: AstrologizePlanetData;
    saturn: AstrologizePlanetData;
    uranus: AstrologizePlanetData;
    neptune: AstrologizePlanetData;
    pluto: AstrologizePlanetData;
  };
  birth_info: {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    latitude: number;
    longitude: number;
  };
}

/**
 * Normalize zodiac sign name from API to our lowercase format
 */
function normalizeSignName(signName: string): ZodiacSignType {
  const signMap: Record<string, ZodiacSignType> = {
    aries: "aries",
    taurus: "taurus",
    gemini: "gemini",
    cancer: "cancer",
    leo: "leo",
    virgo: "virgo",
    libra: "libra",
    scorpio: "scorpio",
    sagittarius: "sagittarius",
    capricorn: "capricorn",
    aquarius: "aquarius",
    pisces: "pisces",
  };

  const normalized = signName.toLowerCase();
  return signMap[normalized] || ("aries" as ZodiacSignType);
}

/**
 * Call astrologize API with birth data
 */
async function fetchPlanetaryPositions(
  birthData: BirthData,
): Promise<Record<Planet, ZodiacSignType>> {
  try {
    const date = new Date(birthData.dateTime);

    const payload = {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // 1-indexed
      date: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
      latitude: birthData.latitude,
      longitude: birthData.longitude,
      zodiacSystem: "tropical" as const,
    };

    const response = await fetch("/api/astrologize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Astrologize API error: ${response.statusText}`);
    }

    const data = (await response.json()) as AstrologizeResponse;

    // Extract planetary positions
    const positions: Record<Planet, ZodiacSignType> = {
      Sun: normalizeSignName(data._celestialBodies.sun.Sign.label),
      Moon: normalizeSignName(data._celestialBodies.moon.Sign.label),
      Mercury: normalizeSignName(data._celestialBodies.mercury.Sign.label),
      Venus: normalizeSignName(data._celestialBodies.venus.Sign.label),
      Mars: normalizeSignName(data._celestialBodies.mars.Sign.label),
      Jupiter: normalizeSignName(data._celestialBodies.jupiter.Sign.label),
      Saturn: normalizeSignName(data._celestialBodies.saturn.Sign.label),
      Uranus: normalizeSignName(data._celestialBodies.uranus.Sign.label),
      Neptune: normalizeSignName(data._celestialBodies.neptune.Sign.label),
      Pluto: normalizeSignName(data._celestialBodies.pluto.Sign.label),
      Ascendant: "aries" as ZodiacSignType, // Placeholder - would need more calculation
    };

    return positions;
  } catch (error) {
    _logger.error("Error fetching planetary positions: ", error as any);
    throw error;
  }
}

/**
 * Calculate dominant modality from planetary positions
 */
function calculateDominantModality(
  planetaryPositions: Record<Planet, ZodiacSignType>,
): Modality {
  const modalityCounts: Record<string, number> = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };

  // Count occurrences of each modality
  Object.values(planetaryPositions).forEach((sign) => {
    const modality = getModalityForZodiac(sign);
    const capitalizedModality =
      modality.charAt(0).toUpperCase() + modality.slice(1);
    modalityCounts[capitalizedModality] =
      (modalityCounts[capitalizedModality] || 0) + 1;
  });

  // Find the dominant modality
  let dominant: Modality = "Cardinal";
  let maxCount = 0;

  (Object.entries(modalityCounts) as Array<[Modality, number]>).forEach(
    ([modality, count]) => {
      if (count > maxCount) {
        maxCount = count;
        dominant = modality;
      }
    },
  );

  return dominant;
}

/**
 * Calculate natal chart from birth data
 *
 * @param birthData - Birth date, time, and location
 * @returns Complete natal chart with planetary, elemental, and alchemical properties
 */
export async function calculateNatalChart(
  birthData: BirthData,
): Promise<NatalChart> {
  try {
    // Fetch planetary positions from astrologize API
    const planetaryPositions = await fetchPlanetaryPositions(birthData);

    // Convert to format expected by planetary alchemy mapping
    const positionsForAlchemy: Record<string, string> = {};
    Object.entries(planetaryPositions).forEach(([planet, sign]) => {
      positionsForAlchemy[planet] = sign;
    });

    // Calculate alchemical properties from planetary positions
    const alchemicalProperties =
      calculateAlchemicalFromPlanets(positionsForAlchemy);

    // Calculate elemental balance from zodiac signs
    const elementalBalance = aggregateZodiacElementals(positionsForAlchemy);

    // Determine dominant element and modality
    const dominantElement = getDominantElement(elementalBalance) as Element;
    const dominantModality = calculateDominantModality(planetaryPositions);

    // Create natal chart
    const natalChart: NatalChart = {
      birthData,
      planetaryPositions,
      dominantElement,
      dominantModality,
      elementalBalance,
      alchemicalProperties,
      calculatedAt: new Date().toISOString(),
    };

    return natalChart;
  } catch (error) {
    _logger.error("Error calculating natal chart: ", error as any);
    throw new Error(
      "Failed to calculate natal chart. Please check birth data and try again.",
    );
  }
}

/**
 * Validate birth data before calculating natal chart
 */
export function validateBirthData(birthData: BirthData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate date/time
  const date = new Date(birthData.dateTime);
  if (isNaN(date.getTime())) {
    errors.push("Invalid date/time format");
  }

  // Validate latitude (-90 to 90)
  if (
    birthData.latitude < -90 ||
    birthData.latitude > 90 ||
    isNaN(birthData.latitude)
  ) {
    errors.push("Latitude must be between -90 and 90");
  }

  // Validate longitude (-180 to 180)
  if (
    birthData.longitude < -180 ||
    birthData.longitude > 180 ||
    isNaN(birthData.longitude)
  ) {
    errors.push("Longitude must be between -180 and 180");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
