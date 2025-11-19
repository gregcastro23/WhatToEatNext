/**
 * Natal Chart Service
 *
 * Handles birth chart calculations using the astrologize API
 * and provides natal chart data for personalized recommendations.
 */

import { fetchPlanetaryPositions } from "./astrologizeApi";
import type { PlanetPosition } from "@/utils/astrologyUtils";
import type { Planet, ZodiacSign } from "@/types/celestial";
import { _logger } from "@/lib/logger";

/**
 * Birth data interface for natal chart calculations
 */
export interface BirthData {
  dateTime: {
    year: number;
    month: number; // 1-indexed (January = 1)
    day: number;
    hour: number;
    minute: number;
  };
  location: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  name?: string; // Optional name for the chart
}

/**
 * Natal chart interface containing planetary positions at birth
 */
export interface NatalChart {
  birthData: BirthData;
  planetaryPositions: Record<string, PlanetPosition>;
  calculatedAt: string; // ISO timestamp
  dominantElements: {
    Fire: number;
    Water: number;
    Earth: number;
    Air: number;
  };
  dominantModalities?: {
    Cardinal: number;
    Fixed: number;
    Mutable: number;
  };
}

/**
 * Element associated with each zodiac sign
 */
const signElements: Record<ZodiacSign, "Fire" | "Water" | "Earth" | "Air"> = {
  aries: "Fire",
  leo: "Fire",
  sagittarius: "Fire",
  taurus: "Earth",
  virgo: "Earth",
  capricorn: "Earth",
  gemini: "Air",
  libra: "Air",
  aquarius: "Air",
  cancer: "Water",
  scorpio: "Water",
  pisces: "Water",
};

/**
 * Modality associated with each zodiac sign
 */
const signModalities: Record<ZodiacSign, "Cardinal" | "Fixed" | "Mutable"> = {
  aries: "Cardinal",
  cancer: "Cardinal",
  libra: "Cardinal",
  capricorn: "Cardinal",
  taurus: "Fixed",
  leo: "Fixed",
  scorpio: "Fixed",
  aquarius: "Fixed",
  gemini: "Mutable",
  virgo: "Mutable",
  sagittarius: "Mutable",
  pisces: "Mutable",
};

/**
 * Planet weights for element calculation
 * Sun and Moon are most important for overall character
 */
const planetWeights: Record<string, number> = {
  Sun: 3.0,
  Moon: 2.5,
  Mercury: 1.5,
  Venus: 1.5,
  Mars: 1.5,
  Jupiter: 1.0,
  Saturn: 1.0,
  Uranus: 0.5,
  Neptune: 0.5,
  Pluto: 0.5,
  Ascendant: 2.0,
};

/**
 * Calculate dominant elements from planetary positions
 */
function calculateDominantElements(
  positions: Record<string, PlanetPosition>,
): {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
} {
  const elements = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  // Sum up weighted elements from each planet
  Object.entries(positions).forEach(([planet, position]) => {
    const sign = position.sign as ZodiacSign;
    const element = signElements[sign];
    const weight = planetWeights[planet] || 1.0;

    if (element) {
      elements[element] += weight;
    }
  });

  // Normalize to sum to 1.0
  const total = elements.Fire + elements.Water + elements.Earth + elements.Air;
  if (total > 0) {
    elements.Fire /= total;
    elements.Water /= total;
    elements.Earth /= total;
    elements.Air /= total;
  } else {
    // Default to balanced if no data
    elements.Fire = 0.25;
    elements.Water = 0.25;
    elements.Earth = 0.25;
    elements.Air = 0.25;
  }

  return elements;
}

/**
 * Calculate dominant modalities from planetary positions
 */
function calculateDominantModalities(
  positions: Record<string, PlanetPosition>,
): {
  Cardinal: number;
  Fixed: number;
  Mutable: number;
} {
  const modalities = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0,
  };

  // Sum up weighted modalities from each planet
  Object.entries(positions).forEach(([planet, position]) => {
    const sign = position.sign as ZodiacSign;
    const modality = signModalities[sign];
    const weight = planetWeights[planet] || 1.0;

    if (modality) {
      modalities[modality] += weight;
    }
  });

  // Normalize to sum to 1.0
  const total = modalities.Cardinal + modalities.Fixed + modalities.Mutable;
  if (total > 0) {
    modalities.Cardinal /= total;
    modalities.Fixed /= total;
    modalities.Mutable /= total;
  } else {
    // Default to balanced if no data
    modalities.Cardinal = 0.33;
    modalities.Fixed = 0.33;
    modalities.Mutable = 0.34;
  }

  return modalities;
}

/**
 * Calculate natal chart from birth data
 *
 * @param birthData - Birth date, time, and location
 * @returns Natal chart with planetary positions and derived data
 */
export async function calculateNatalChart(
  birthData: BirthData,
): Promise<NatalChart> {
  try {
    _logger.info("Calculating natal chart for birth data", birthData);

    // Fetch planetary positions for birth moment
    const planetaryPositions = await fetchPlanetaryPositions({
      year: birthData.dateTime.year,
      month: birthData.dateTime.month,
      date: birthData.dateTime.day,
      hour: birthData.dateTime.hour,
      minute: birthData.dateTime.minute,
      latitude: birthData.location.latitude,
      longitude: birthData.location.longitude,
    });

    // Calculate dominant elements
    const dominantElements = calculateDominantElements(planetaryPositions);

    // Calculate dominant modalities
    const dominantModalities = calculateDominantModalities(planetaryPositions);

    const natalChart: NatalChart = {
      birthData,
      planetaryPositions,
      calculatedAt: new Date().toISOString(),
      dominantElements,
      dominantModalities,
    };

    _logger.info("Natal chart calculated successfully", {
      dominantElements,
      dominantModalities,
    });

    return natalChart;
  } catch (error) {
    _logger.error("Error calculating natal chart", error as any);
    throw new Error(
      "Failed to calculate natal chart. Please check your birth data and try again.",
    );
  }
}

/**
 * Validate birth data before calculation
 *
 * @param birthData - Birth data to validate
 * @returns True if valid, throws error if invalid
 */
export function validateBirthData(birthData: BirthData): boolean {
  const { dateTime, location } = birthData;

  // Validate year (reasonable range)
  if (dateTime.year < 1900 || dateTime.year > new Date().getFullYear()) {
    throw new Error("Year must be between 1900 and current year");
  }

  // Validate month
  if (dateTime.month < 1 || dateTime.month > 12) {
    throw new Error("Month must be between 1 and 12");
  }

  // Validate day
  if (dateTime.day < 1 || dateTime.day > 31) {
    throw new Error("Day must be between 1 and 31");
  }

  // Validate hour
  if (dateTime.hour < 0 || dateTime.hour > 23) {
    throw new Error("Hour must be between 0 and 23");
  }

  // Validate minute
  if (dateTime.minute < 0 || dateTime.minute > 59) {
    throw new Error("Minute must be between 0 and 59");
  }

  // Validate latitude
  if (location.latitude < -90 || location.latitude > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  // Validate longitude
  if (location.longitude < -180 || location.longitude > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return true;
}

/**
 * Get a summary of the natal chart for display
 *
 * @param natalChart - Natal chart to summarize
 * @returns Human-readable summary
 */
export function getNatalChartSummary(natalChart: NatalChart): {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  risingSign: ZodiacSign | null;
  dominantElement: "Fire" | "Water" | "Earth" | "Air";
  dominantModality: "Cardinal" | "Fixed" | "Mutable" | null;
} {
  const { planetaryPositions, dominantElements, dominantModalities } =
    natalChart;

  // Get sun sign
  const sunSign = (planetaryPositions.Sun?.sign || "aries") as ZodiacSign;

  // Get moon sign
  const moonSign = (planetaryPositions.Moon?.sign || "aries") as ZodiacSign;

  // Get rising sign (Ascendant)
  const risingSign = planetaryPositions.Ascendant
    ? (planetaryPositions.Ascendant.sign as ZodiacSign)
    : null;

  // Find dominant element
  const dominantElement = (
    (Object.entries(dominantElements) as [string, number][]).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0]
  ) as "Fire" | "Water" | "Earth" | "Air";

  // Find dominant modality
  const dominantModality = dominantModalities
    ? ((
        (Object.entries(dominantModalities) as [string, number][]).reduce((a, b) =>
          a[1] > b[1] ? a : b,
        )[0]
      ) as "Cardinal" | "Fixed" | "Mutable")
    : null;

  return {
    sunSign,
    moonSign,
    risingSign,
    dominantElement,
    dominantModality,
  };
}
