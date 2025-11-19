import { getPlanetaryPositionsForDateTime } from "./astrologizeApi";
import { calculateAlchemicalFromPlanets } from "@/utils/planetaryAlchemyMapping";
import type { BirthChart } from "@/types/astrology";
import type { ElementalCharacter } from "@/constants/planetaryElements";
import type { AlchemicalProperties, PlanetaryPositions } from "@/types/alchemy";

/**
 * Birth Data Interface
 * Contains the user's birth date, time, and location information
 */
export interface BirthData {
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // Time string (HH:MM)
  latitude: number;
  longitude: number;
  locationName?: string; // Optional human-readable location name
}

/**
 * Natal Chart Interface
 * Complete natal chart with planetary positions, elemental composition, and ESMS properties
 */
export interface NatalChart {
  birthData: BirthData;
  planetaryPositions: PlanetaryPositions;
  elementalComposition: Record<ElementalCharacter, number>;
  alchemicalProperties: AlchemicalProperties;
  calculatedAt: string; // ISO timestamp
}

/**
 * Validates birth data to ensure all required fields are present and valid
 */
export function validateBirthData(data: Partial<BirthData>): data is BirthData {
  if (!data.date || !data.time) {
    return false;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.date)) {
    return false;
  }

  // Validate time format (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(data.time)) {
    return false;
  }

  // Validate coordinates
  if (
    typeof data.latitude !== "number" ||
    typeof data.longitude !== "number" ||
    data.latitude < -90 ||
    data.latitude > 90 ||
    data.longitude < -180 ||
    data.longitude > 180
  ) {
    return false;
  }

  return true;
}

/**
 * Gets default birth data (current moment in New York City)
 */
export function getDefaultBirthData(): BirthData {
  const now = new Date();

  // Format date as YYYY-MM-DD
  const date = now.toISOString().split("T")[0];

  // Format time as HH:MM
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const time = `${hours}:${minutes}`;

  return {
    date,
    time,
    latitude: 40.7128,  // New York City
    longitude: -74.006,
    locationName: "New York, NY",
  };
}

/**
 * Calculates elemental composition from planetary positions
 *
 * Each zodiac sign has an associated element:
 * - Fire: Aries, Leo, Sagittarius
 * - Earth: Taurus, Virgo, Capricorn
 * - Air: Gemini, Libra, Aquarius
 * - Water: Cancer, Scorpio, Pisces
 */
function calculateElementalComposition(
  planetaryPositions: PlanetaryPositions
): Record<ElementalCharacter, number> {
  const elementalCounts = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0,
  };

  // Map zodiac signs to elements
  const signElements: Record<string, ElementalCharacter> = {
    aries: "Fire",
    taurus: "Earth",
    gemini: "Air",
    cancer: "Water",
    leo: "Fire",
    virgo: "Earth",
    libra: "Air",
    scorpio: "Water",
    sagittarius: "Fire",
    capricorn: "Earth",
    aquarius: "Air",
    pisces: "Water",
  };

  // Count elemental placements (only count the 10 planets, not Ascendant)
  const planets = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  planets.forEach((planet) => {
    const position = planetaryPositions[planet];
    if (position) {
      const element = signElements[position];
      if (element) {
        elementalCounts[element]++;
      }
    }
  });

  // Normalize to percentages (total = 1.0)
  const total = Object.values(elementalCounts).reduce((sum, count) => sum + count, 0);

  return {
    Fire: total > 0 ? elementalCounts.Fire / total : 0.25,
    Water: total > 0 ? elementalCounts.Water / total : 0.25,
    Earth: total > 0 ? elementalCounts.Earth / total : 0.25,
    Air: total > 0 ? elementalCounts.Air / total : 0.25,
  };
}

/**
 * Calculates a complete natal chart from birth data
 *
 * This function:
 * 1. Fetches planetary positions for the birth date/time/location
 * 2. Calculates elemental composition from zodiac placements
 * 3. Calculates alchemical properties (ESMS) from planetary positions per CLAUDE.md
 *
 * @param birthData - The user's birth date, time, and location
 * @returns A complete natal chart with all astrological data
 */
export async function calculateNatalChart(
  birthData: BirthData
): Promise<NatalChart> {
  // Validate birth data
  if (!validateBirthData(birthData)) {
    throw new Error("Invalid birth data provided");
  }

  // Parse birth date and time
  const [year, month, day] = birthData.date.split("-").map(Number);
  const [hours, minutes] = birthData.time.split(":").map(Number);

  // Create Date object for birth moment
  const birthMoment = new Date(year, month - 1, day, hours, minutes);

  // Fetch planetary positions for birth moment
  const planetaryPositions = await getPlanetaryPositionsForDateTime(
    birthMoment,
    {
      latitude: birthData.latitude,
      longitude: birthData.longitude,
    }
  );

  // Convert PlanetPosition objects to zodiac sign strings for planetary positions
  const planetaryZodiacPositions: PlanetaryPositions = Object.entries(
    planetaryPositions
  ).reduce((acc, [planet, position]) => {
    acc[planet] = position.sign;
    return acc;
  }, {} as PlanetaryPositions);

  // Calculate elemental composition
  const elementalComposition = calculateElementalComposition(planetaryZodiacPositions);

  // Calculate ESMS (Spirit, Essence, Matter, Substance) from planetary positions
  // This is the ONLY correct way per CLAUDE.md
  const alchemicalProperties = calculateAlchemicalFromPlanets(planetaryZodiacPositions);

  return {
    birthData,
    planetaryPositions: planetaryZodiacPositions,
    elementalComposition,
    alchemicalProperties,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Converts a natal chart to the BirthChart format used by FoodAlchemySystem
 */
export function natalChartToBirthChart(natalChart: NatalChart): BirthChart {
  // Convert zodiac signs to numerical values for compatibility
  // (In the future, this could be enhanced with actual degree positions)
  const planetaryPositionsNumeric: Record<string, number> = Object.entries(
    natalChart.planetaryPositions
  ).reduce((acc, [planet, _sign]) => {
    // For now, use a simple numeric representation
    // Could be enhanced to use actual degree positions
    acc[planet] = 0;
    return acc;
  }, {} as Record<string, number>);

  return {
    elementalState: natalChart.elementalComposition,
    planetaryPositions: planetaryPositionsNumeric,
    ascendant: natalChart.planetaryPositions.Ascendant || "aries",
    lunarPhase: "New Moon", // Could be calculated from Moon position
    aspects: [], // Aspects calculation could be added in future
  };
}
