/**
 * Natal Chart Service
 *
 * Service for calculating individual natal charts from birth data.
 * Uses the astrologize API and planetary alchemy mapping to generate
 * complete natal chart data including elemental and alchemical properties.
 */

import { _logger } from "@/lib/logger";
import type {
  Planet,
  ZodiacSignType,
  Element,
  Modality,
} from "@/types/celestial";
import type { BirthData, NatalChart, PlanetInfo } from "@/types/natalChart";
import {
  calculateEnhancedAlchemicalFromPlanets,
  aggregateEnhancedZodiacElementals,
  getDominantElement,
  isSectDiurnal,
} from "@/utils/planetaryAlchemyMapping";
import { getModalityForZodiac } from "@/utils/zodiacUtils";
import {
  validateBirthChartAgainstEstimates,
  detectStaticFallback,
} from "@/utils/astrology/birthChartSignEstimator";

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

interface AscendantData {
  sign: string;
  degree?: number;
  minute?: number;
  exactLongitude: number;
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
  ascendant?: AscendantData;
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
 * Calculate approximate Ascendant sign from birth data using Local Sidereal Time.
 * This is a fallback when the server doesn't return Ascendant data.
 */
function calculateApproximateAscendant(birthData: BirthData): ZodiacSignType {
  const zodiacSigns: ZodiacSignType[] = [
    "aries", "taurus", "gemini", "cancer", "leo", "virgo",
    "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
  ] as ZodiacSignType[];

  const date = new Date(birthData.dateTime);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const longitude = birthData.longitude;
  const latitude = birthData.latitude;

  // Julian Day Number (simplified)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y
    + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Greenwich Sidereal Time in degrees
  const T = (jdn - 2451545.0) / 36525.0;
  const gst0 = 280.46061837 + 360.98564736629 * (jdn - 2451545.0)
    + 0.000387933 * T * T;
  const utcHours = hour + minute / 60.0;
  const gst = ((gst0 + utcHours * 1.00273790935 * 15) % 360 + 360) % 360;

  // Local Sidereal Time
  const lst = ((gst + longitude) % 360 + 360) % 360;

  // Obliquity of the ecliptic and RAMC-to-Ascendant conversion
  const obliquity = 23.4393 - 0.0130 * T;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const lstRad = lst * Math.PI / 180;

  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(oblRad) * Math.tan(latRad) + Math.cos(oblRad) * Math.sin(lstRad))
  );
  const ascLongitude = ((ascRad * 180 / Math.PI) % 360 + 360) % 360;

  const signIndex = Math.floor(ascLongitude / 30) % 12;
  return zodiacSigns[signIndex];
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

    // Determine Ascendant from server response or calculate locally
    let ascendantSign: ZodiacSignType = "aries" as ZodiacSignType;
    if (data.ascendant?.sign) {
      ascendantSign = normalizeSignName(data.ascendant.sign);
      _logger.info(`Ascendant from API: ${data.ascendant.sign} (${data.ascendant.exactLongitude?.toFixed(2)}°)`);
    } else {
      // Calculate approximate Ascendant from birth data using Local Sidereal Time
      ascendantSign = calculateApproximateAscendant(birthData);
      _logger.info(`Ascendant calculated locally: ${ascendantSign}`);
    }

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
      Ascendant: ascendantSign,
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

    // Validate birth chart positions against astronomical estimates
    const birthDate = new Date(birthData.dateTime);
    const diurnal = isSectDiurnal(birthDate);

    if (detectStaticFallback(planetaryPositions)) {
      _logger.error(
        "Birth chart returned STATIC FALLBACK positions — these do not reflect the actual birth date. The API circuit breaker may be open.",
      );
    }
    const validation = validateBirthChartAgainstEstimates(birthDate, planetaryPositions);
    if (validation.hasWarnings) {
      _logger.warn(
        `Birth chart validation: ${validation.passedPlanets}/${validation.validatedPlanets} planets passed.`,
        validation.warnings.map((w) => w.message),
      );
    }

    // Convert to format expected by planetary alchemy mapping
    const positionsForAlchemy: Record<string, string> = {};
    Object.entries(planetaryPositions).forEach(([planet, sign]) => {
      positionsForAlchemy[planet] = sign;
    });

    // Calculate alchemical properties from planetary positions WITH sect logic
    const alchemicalProperties =
      calculateEnhancedAlchemicalFromPlanets(positionsForAlchemy, diurnal);

    // Calculate elemental balance from zodiac signs WITH sect logic
    const elementalBalance = aggregateEnhancedZodiacElementals(positionsForAlchemy, diurnal);

    // Determine dominant element and modality
    const dominantElement = getDominantElement(elementalBalance) as Element;
    const dominantModality = calculateDominantModality(planetaryPositions);

    const planets: PlanetInfo[] = Object.entries(planetaryPositions).map(
      ([name, sign]) => ({
        name: name as Planet,
        sign,
        position: 0, // Simplified for now
      }),
    );

    // Create natal chart
    const natalChart: NatalChart = {
      birthData,
      planets,
      ascendant: planetaryPositions.Ascendant,
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
      { cause: error },
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
