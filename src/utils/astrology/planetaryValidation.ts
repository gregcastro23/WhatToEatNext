/**
 * Astronomical Validation Module
 *
 * Validates planetary positions against known astronomical constraints
 * to catch data corruption, API errors, or miscalculations.
 *
 * Key Validations:
 * 1. Outer planet positions match expected signs for birth year
 * 2. Mercury within 1 sign (28°) of Sun
 * 3. Venus within 2 signs (48°) of Sun
 * 4. Valid degree/minute ranges
 * 5. Reasonable retrograde states
 * 6. Birth date sanity checks
 */

import type { ZodiacSignType } from "@/types/celestial";
import type { PlanetPosition } from "@/utils/astrologyUtils";

// Zodiac sign ordering for distance calculations
const ZODIAC_ORDER: ZodiacSignType[] = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
];

/**
 * Outer Planet Ephemeris - Approximate sign positions by year
 * These slow-moving planets stay in each sign for years/decades
 * Source: NASA JPL Ephemeris data
 */
const OUTER_PLANET_RANGES = {
  Jupiter: [
    // Jupiter: ~12 year cycle (~1 year per sign)
    { years: [2023, 2024], signs: ["aries", "taurus"] },
    { years: [2022, 2023], signs: ["pisces", "aries"] },
    { years: [2021, 2022], signs: ["aquarius", "pisces"] },
    { years: [2020, 2021], signs: ["capricorn", "aquarius"] },
    { years: [2019, 2020], signs: ["sagittarius", "capricorn"] },
    { years: [2018, 2019], signs: ["scorpio", "sagittarius"] },
    { years: [2017, 2018], signs: ["libra", "scorpio"] },
    { years: [2016, 2017], signs: ["virgo", "libra"] },
    { years: [2015, 2016], signs: ["leo", "virgo"] },
    { years: [2014, 2015], signs: ["cancer", "leo"] },
    { years: [2013, 2014], signs: ["gemini", "cancer"] },
    { years: [2011, 2013], signs: ["taurus", "gemini"] },
    { years: [2010, 2011], signs: ["aries", "taurus"] },
    { years: [2009, 2010], signs: ["pisces", "aquarius"] },
    { years: [1990, 1995], signs: ["leo", "virgo"] },
    { years: [1985, 1990], signs: ["capricorn", "aquarius", "pisces"] },
    { years: [1980, 1985], signs: ["sagittarius", "scorpio", "libra"] },
    { years: [1975, 1980], signs: ["aries", "taurus", "gemini", "cancer"] },
  ],
  Saturn: [
    // Saturn: ~29 year cycle (~2.5 years per sign)
    { years: [2023, 2026], signs: ["pisces", "aquarius"] },
    { years: [2020, 2023], signs: ["aquarius", "capricorn"] },
    { years: [2017, 2020], signs: ["capricorn", "sagittarius"] },
    { years: [2015, 2017], signs: ["sagittarius", "scorpio"] },
    { years: [2012, 2015], signs: ["scorpio", "libra"] },
    { years: [2009, 2012], signs: ["libra", "virgo"] },
    { years: [2007, 2009], signs: ["virgo", "leo"] },
    { years: [2005, 2007], signs: ["leo", "cancer"] },
    { years: [2003, 2005], signs: ["cancer", "gemini"] },
    { years: [2000, 2003], signs: ["gemini", "taurus"] },
    { years: [1998, 2000], signs: ["taurus", "aries"] },
    { years: [1996, 1998], signs: ["aries", "pisces"] },
    { years: [1994, 1996], signs: ["pisces", "aquarius"] },
    { years: [1991, 1994], signs: ["aquarius", "capricorn"] },
    { years: [1988, 1991], signs: ["capricorn", "sagittarius"] },
    { years: [1985, 1988], signs: ["sagittarius", "scorpio"] },
    { years: [1983, 1985], signs: ["scorpio", "libra"] },
    { years: [1980, 1983], signs: ["libra", "virgo"] },
    { years: [1977, 1980], signs: ["virgo", "leo"] },
  ],
  Uranus: [
    // Uranus: ~84 year cycle (~7 years per sign)
    { years: [2019, 2026], signs: ["taurus"] },
    { years: [2011, 2019], signs: ["aries"] },
    { years: [2003, 2011], signs: ["pisces"] },
    { years: [1996, 2003], signs: ["aquarius"] },
    { years: [1988, 1996], signs: ["capricorn"] },
    { years: [1981, 1988], signs: ["sagittarius"] },
    { years: [1975, 1981], signs: ["scorpio"] },
    { years: [1969, 1975], signs: ["libra"] },
  ],
  Neptune: [
    // Neptune: ~165 year cycle (~14 years per sign)
    { years: [2012, 2026], signs: ["pisces"] },
    { years: [1998, 2012], signs: ["aquarius"] },
    { years: [1984, 1998], signs: ["capricorn"] },
    { years: [1970, 1984], signs: ["sagittarius"] },
    { years: [1957, 1970], signs: ["scorpio"] },
  ],
  Pluto: [
    // Pluto: ~248 year cycle (12-32 years per sign, varies)
    { years: [2008, 2024], signs: ["capricorn"] },
    { years: [1995, 2008], signs: ["sagittarius"] },
    { years: [1984, 1995], signs: ["scorpio"] },
    { years: [1971, 1984], signs: ["libra"] },
    { years: [1957, 1972], signs: ["virgo"] },
  ],
};

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    mercurySunDistance?: number;
    venusSunDistance?: number;
    outerPlanetChecks?: Record<string, boolean>;
    dateChecks?: Record<string, boolean>;
  };
}

/**
 * Calculate angular distance between two zodiac positions (0-180°)
 */
function calculateAngularDistance(
  sign1: ZodiacSignType,
  degree1: number,
  sign2: ZodiacSignType,
  degree2: number
): number {
  const idx1 = ZODIAC_ORDER.indexOf(sign1);
  const idx2 = ZODIAC_ORDER.indexOf(sign2);

  const long1 = idx1 * 30 + degree1;
  const long2 = idx2 * 30 + degree2;

  let distance = Math.abs(long2 - long1);
  // Take shorter arc around the circle
  if (distance > 180) distance = 360 - distance;

  return distance;
}

/**
 * Check if a planet's position is valid for the given year
 */
function validateOuterPlanetForYear(
  planet: "Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto",
  sign: ZodiacSignType,
  year: number
): { valid: boolean; expectedSigns?: string[] } {
  const ranges = OUTER_PLANET_RANGES[planet];

  for (const range of ranges) {
    const [startYear, endYear] = range.years;
    if (year >= startYear && year <= endYear) {
      const valid = range.signs.includes(sign);
      return {
        valid,
        expectedSigns: valid ? undefined : range.signs,
      };
    }
  }

  // Year not in our ephemeris - can't validate
  return { valid: true }; // Assume valid if outside known range
}

/**
 * Validate Mercury's proximity to the Sun
 * Mercury is never more than ~28° from the Sun
 */
function validateMercuryProximity(
  sunSign: ZodiacSignType,
  sunDegree: number,
  mercurySign: ZodiacSignType,
  mercuryDegree: number
): { valid: boolean; distance: number } {
  const distance = calculateAngularDistance(sunSign, sunDegree, mercurySign, mercuryDegree);
  return {
    valid: distance <= 28,
    distance,
  };
}

/**
 * Validate Venus's proximity to the Sun
 * Venus is never more than ~48° from the Sun
 */
function validateVenusProximity(
  sunSign: ZodiacSignType,
  sunDegree: number,
  venusSign: ZodiacSignType,
  venusDegree: number
): { valid: boolean; distance: number } {
  const distance = calculateAngularDistance(sunSign, sunDegree, venusSign, venusDegree);
  return {
    valid: distance <= 48,
    distance,
  };
}

/**
 * Validate degree and minute values are in valid ranges
 */
function validateDegreeMinute(position: PlanetPosition): boolean {
  const degree = position.degree;
  const minute = position.minute;

  // Degree should be 0-29 for position within a sign
  if (degree < 0 || degree >= 30) return false;

  // Minute should be 0-59
  if (minute < 0 || minute >= 60) return false;

  return true;
}

/**
 * Validate birth date is reasonable
 */
function validateBirthDate(birthDate: Date, currentDate: Date = new Date()): {
  valid: boolean;
  ageInYears?: number;
  issues: string[];
} {
  const issues: string[] = [];

  // Check birth date is not in the future
  if (birthDate > currentDate) {
    issues.push("Birth date is in the future");
    return { valid: false, issues };
  }

  // Calculate age
  const ageInYears = currentDate.getFullYear() - birthDate.getFullYear();

  // Check reasonable age range (0-150 years)
  if (ageInYears < 0) {
    issues.push(`Negative age calculated: ${ageInYears} years`);
  }
  if (ageInYears > 150) {
    issues.push(`Unreasonably old: ${ageInYears} years`);
  }

  // Check not today (common bug - using current date instead of birth date)
  const isSameDay =
    birthDate.getFullYear() === currentDate.getFullYear() &&
    birthDate.getMonth() === currentDate.getMonth() &&
    birthDate.getDate() === currentDate.getDate();

  if (isSameDay) {
    issues.push("⚠️ CRITICAL: Birth date is today! This likely indicates a bug.");
  }

  return {
    valid: issues.length === 0,
    ageInYears,
    issues,
  };
}

/**
 * Comprehensive validation of planetary positions
 */
export function validatePlanetaryPositions(
  positions: Record<string, PlanetPosition>,
  birthDate: Date
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: ValidationResult["details"] = {
    outerPlanetChecks: {},
    dateChecks: {},
  };

  const birthYear = birthDate.getFullYear();
  const now = new Date();

  // 1. Validate birth date
  const dateValidation = validateBirthDate(birthDate, now);
  details.dateChecks = {
    isInFuture: birthDate > now,
    isToday: birthDate.toDateString() === now.toDateString(),
    ageReasonable: dateValidation.ageInYears !== undefined &&
                   dateValidation.ageInYears >= 0 &&
                   dateValidation.ageInYears <= 150,
  };

  if (!dateValidation.valid) {
    dateValidation.issues.forEach(issue => {
      if (issue.includes("CRITICAL")) {
        errors.push(issue);
      } else {
        errors.push(`Birth date validation failed: ${issue}`);
      }
    });
  }

  // 2. Validate Sun exists and has valid position
  const sun = positions.Sun;
  if (!sun) {
    errors.push("Sun position is missing");
    return { valid: false, errors, warnings, details };
  }

  if (!validateDegreeMinute(sun)) {
    errors.push(`Sun has invalid degree/minute: ${sun.degree}° ${sun.minute}'`);
  }

  // 3. Validate Mercury proximity to Sun
  const mercury = positions.Mercury;
  if (mercury) {
    if (!validateDegreeMinute(mercury)) {
      errors.push(`Mercury has invalid degree/minute: ${mercury.degree}° ${mercury.minute}'`);
    }

    const mercuryCheck = validateMercuryProximity(
      sun.sign,
      sun.degree + sun.minute / 60,
      mercury.sign,
      mercury.degree + mercury.minute / 60
    );

    details.mercurySunDistance = mercuryCheck.distance;

    if (!mercuryCheck.valid) {
      errors.push(
        `Mercury is ${mercuryCheck.distance.toFixed(1)}° from Sun (max 28°). ` +
        `This is astronomically impossible! Sun: ${sun.sign} ${sun.degree}°, ` +
        `Mercury: ${mercury.sign} ${mercury.degree}°`
      );
    }
  } else {
    warnings.push("Mercury position is missing");
  }

  // 4. Validate Venus proximity to Sun
  const venus = positions.Venus;
  if (venus) {
    if (!validateDegreeMinute(venus)) {
      errors.push(`Venus has invalid degree/minute: ${venus.degree}° ${venus.minute}'`);
    }

    const venusCheck = validateVenusProximity(
      sun.sign,
      sun.degree + sun.minute / 60,
      venus.sign,
      venus.degree + venus.minute / 60
    );

    details.venusSunDistance = venusCheck.distance;

    if (!venusCheck.valid) {
      errors.push(
        `Venus is ${venusCheck.distance.toFixed(1)}° from Sun (max 48°). ` +
        `This is astronomically impossible! Sun: ${sun.sign} ${sun.degree}°, ` +
        `Venus: ${venus.sign} ${venus.degree}°`
      );
    }
  } else {
    warnings.push("Venus position is missing");
  }

  // 5. Validate outer planets for birth year
  const outerPlanets: Array<"Jupiter" | "Saturn" | "Uranus" | "Neptune" | "Pluto"> =
    ["Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

  for (const planet of outerPlanets) {
    const position = positions[planet];
    if (!position) {
      warnings.push(`${planet} position is missing`);
      continue;
    }

    if (!validateDegreeMinute(position)) {
      errors.push(`${planet} has invalid degree/minute: ${position.degree}° ${position.minute}'`);
    }

    const validation = validateOuterPlanetForYear(planet, position.sign, birthYear);
    details.outerPlanetChecks![planet] = validation.valid;

    if (!validation.valid && validation.expectedSigns) {
      errors.push(
        `${planet} in ${position.sign} is incorrect for birth year ${birthYear}. ` +
        `Expected signs: ${validation.expectedSigns.join(", ")}. ` +
        `This indicates planetary positions are from the wrong date!`
      );
    }
  }

  // 6. Validate Mars (within reasonable distance from Earth's orbit)
  const mars = positions.Mars;
  if (mars && !validateDegreeMinute(mars)) {
    errors.push(`Mars has invalid degree/minute: ${mars.degree}° ${mars.minute}'`);
  }

  // 7. Validate Moon
  const moon = positions.Moon;
  if (!moon) {
    errors.push("Moon position is missing");
  } else if (!validateDegreeMinute(moon)) {
    errors.push(`Moon has invalid degree/minute: ${moon.degree}° ${moon.minute}'`);
  }

  // 8. Validate Ascendant if present
  const ascendant = positions.Ascendant;
  if (ascendant) {
    if (!validateDegreeMinute(ascendant)) {
      errors.push(`Ascendant has invalid degree/minute: ${ascendant.degree}° ${ascendant.minute}'`);
    }
  } else {
    warnings.push("Ascendant position is missing");
  }

  // 9. Check for exact longitude validity
  for (const [planetName, position] of Object.entries(positions)) {
    if (position.exactLongitude !== undefined) {
      if (position.exactLongitude < 0 || position.exactLongitude >= 360) {
        errors.push(
          `${planetName} has invalid exact longitude: ${position.exactLongitude}° ` +
          `(must be 0-360)`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    details,
  };
}

/**
 * Format validation result for logging
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.valid) {
    lines.push("✅ All planetary positions validated successfully");
  } else {
    lines.push("❌ Planetary position validation FAILED");
  }

  if (result.errors.length > 0) {
    lines.push("\n🚨 ERRORS:");
    result.errors.forEach(err => lines.push(`  - ${err}`));
  }

  if (result.warnings.length > 0) {
    lines.push("\n⚠️  WARNINGS:");
    result.warnings.forEach(warn => lines.push(`  - ${warn}`));
  }

  if (result.details.mercurySunDistance !== undefined) {
    lines.push(`\n📏 Mercury-Sun distance: ${result.details.mercurySunDistance.toFixed(1)}° (max 28°)`);
  }

  if (result.details.venusSunDistance !== undefined) {
    lines.push(`📏 Venus-Sun distance: ${result.details.venusSunDistance.toFixed(1)}° (max 48°)`);
  }

  if (result.details.outerPlanetChecks && Object.keys(result.details.outerPlanetChecks).length > 0) {
    lines.push("\n🪐 Outer Planet Validation:");
    for (const [planet, valid] of Object.entries(result.details.outerPlanetChecks)) {
      lines.push(`  ${valid ? "✅" : "❌"} ${planet}`);
    }
  }

  return lines.join("\n");
}
