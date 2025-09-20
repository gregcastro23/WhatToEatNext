/**
 * Transit Date Validation Utilities
 *
 * Provides validation functions for planetary transit dates
 * to ensure accuracy in astrological calculations.
 */

import { logger } from '@/utils/logger';

/**
 * Transit date structure
 */
export interface TransitDate {
  Start: string,
  End: string,
  Peak?: string;
}

/**
 * Transit dates structure for a planet
 */
export interface PlanetTransitDates {
  [sign: string]: TransitDate | { [phase: string]: TransitDate };
}

/**
 * Validate a single transit date against current date
 */
export function validateTransitDate(
  planet: string,
  date: Date,
  sign: string,
  transitDates: PlanetTransitDates,
): boolean {
  try {
    if (!transitDates || !transitDates[sign]) {
      logger.warn(`No transit data found for ${planet} in ${sign}`);
      return false;
    }

    const transit = transitDates[sign];
    if (!transit.Start || !transit.End) {
      logger.warn(`Invalid transit data for ${planet} in ${sign}: missing Start or End date`);
      return false;
    }

    const startDate = new Date(transit.Start as string | number | Date);
    const endDate = new Date(transit.End as string | number | Date);

    // Validate date format
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      logger.error(`Invalid date format in transit data for ${planet} in ${sign}`);
      return false;
    }

    // Check if current date falls within transit period
    const isValid = date >= startDate && date <= endDate;

    if (!isValid) {
      logger.debug(
        `Date ${date.toISOString().split('T')[0]} is outside transit period for ${planet} in ${sign} (${transit.Start} to ${transit.End})`,
      );
    }

    return isValid;
  } catch (error) {
    logger.error(`Error validating transit date for ${planet}:`, error);
    return false;
  }
}

/**
 * Get current valid sign for a planet based on transit dates
 */
export function getCurrentTransitSign(
  planet: string,
  date: Date,
  transitDates: PlanetTransitDates,
): string | null {
  try {
    const signs = Object.keys(transitDates).filter(key => key !== 'RetrogradePhases');

    for (const sign of signs) {
      if (validateTransitDate(planet, date, sign, transitDates)) {
        return sign;
      }
    }

    logger.warn(`No valid transit sign found for ${planet} on ${date.toISOString().split('T')[0]}`);
    return null;
  } catch (error) {
    logger.error(`Error getting current transit sign for ${planet}:`, error);
    return null;
  }
}

/**
 * Validate retrograde phase dates
 */
export function validateRetrogradePhase(
  planet: string,
  date: Date,
  transitDates: PlanetTransitDates,
): { isRetrograde: boolean; phase?: string } {
  try {
    if (!transitDates.RetrogradePhases) {
      return { isRetrograde: false };
    }

    const phases = Object.entries(transitDates.RetrogradePhases);

    for (const [phaseName, phaseData] of phases) {
      if (!phaseData.Start || !phaseData.End) {
        continue;
      }

      const startDate = new Date(phaseData.Start);
      const endDate = new Date(phaseData.End);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        logger.warn(`Invalid retrograde phase dates for ${planet} phase ${phaseName}`);
        continue;
      }

      if (date >= startDate && date <= endDate) {
        return { isRetrograde: true, phase: phaseName };
      }
    }

    return { isRetrograde: false };
  } catch (error) {
    logger.error(`Error validating retrograde phase for ${planet}:`, error);
    return { isRetrograde: false };
  }
}

/**
 * Validate all transit dates for consistency
 */
export function validateAllTransitDates(_transitDates: PlanetTransitDates): {
  isValid: boolean,
  errors: string[],
  warnings: string[]
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const signs = Object.keys(transitDates).filter(key => key !== 'RetrogradePhases');

    // Check each sign's transit dates
    for (const sign of signs) {
      const transit = transitDates[sign];

      if (!transit.Start || !transit.End) {
        errors.push(`Missing Start or End date for sign ${sign}`);
        continue;
      }

      const startDate = new Date(transit.Start as string | number | Date);
      const endDate = new Date(transit.End as string | number | Date);

      if (isNaN(startDate.getTime())) {
        errors.push(`Invalid Start date format for sign ${sign}: ${transit.Start}`);
      }

      if (isNaN(endDate.getTime())) {
        errors.push(`Invalid End date format for sign ${sign}: ${transit.End}`);
      }

      if (startDate >= endDate) {
        errors.push(`Start date must be before End date for sign ${sign}`);
      }
    }

    // Check for gaps or overlaps between signs
    const sortedTransits = signs;
      .map(sign => ({;
        sign,
        start: new Date(
          (
            transitDates[sign] as { Start: string | number | Date; End: string | number | Date }
          ).Start,
        ),
        end: new Date(
          (
            transitDates[sign] as { Start: string | number | Date; End: string | number | Date }
          ).End,
        )
      }))
      .filter(t => !isNaN(t.start.getTime()) && !isNaN(t.end.getTime()));
      .sort((ab) => a.start.getTime() - b.start.getTime());

    for (let i = 0; i < sortedTransits.length - 1; i++) {
      const current = sortedTransits[i];
      const next = sortedTransits[i + 1];

      // Check for gaps
      const daysBetween = (next.start.getTime() - current.end.getTime()) / (1000 * 60 * 60 * 24);
      if (daysBetween > 1) {
        warnings.push(
          `Gap of ${Math.round(daysBetween)} days between ${current.sign} and ${next.sign}`,
        );
      }

      // Check for overlaps
      if (current.end > next.start) {
        warnings.push(`Overlap between ${current.sign} and ${next.sign}`);
      }
    }

    // Validate retrograde phases if present
    if (transitDates.RetrogradePhases) {
      const phases = Object.entries(transitDates.RetrogradePhases);

      for (const [phaseName, phaseData] of phases) {
        if (!phaseData.Start || !phaseData.End) {
          warnings.push(`Missing Start or End date for retrograde phase ${phaseName}`);
          continue;
        }

        const startDate = new Date(phaseData.Start);
        const endDate = new Date(phaseData.End);

        if (isNaN(startDate.getTime())) {
          errors.push(
            `Invalid Start date format for retrograde phase ${phaseName}: ${phaseData.Start}`,
          );
        }

        if (isNaN(endDate.getTime())) {
          errors.push(
            `Invalid End date format for retrograde phase ${phaseName}: ${phaseData.End}`,
          );
        }

        if (startDate >= endDate) {
          errors.push(`Start date must be before End date for retrograde phase ${phaseName}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,;
      errors,
      warnings
    };
  } catch (error) {
    errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      isValid: false,
      errors,
      warnings
    };
  }
}

/**
 * Load and validate planet transit dates from data files
 */
export async function loadPlanetTransitDates(
  planetName: string,
): Promise<PlanetTransitDates | null> {
  try {
    // Dynamic import to load planet data
    const planetModule = await import(`@/data/planets/${planetName.toLowerCase()}`);
    const planetData = planetModule.default;

    if (!planetData?.PlanetSpecific?.TransitDates) {
      logger.warn(`No transit dates found for planet ${planetName}`);
      return null;
    }

    const transitDates = planetData.PlanetSpecific.TransitDates;
    const validation = validateAllTransitDates(transitDates);

    if (!validation.isValid) {
      logger.error(`Invalid transit dates for ${planetName}:`, validation.errors);
      return null;
    }

    if (validation.warnings.length > 0) {
      logger.warn(`Transit date warnings for ${planetName}:`, validation.warnings);
    }

    return transitDates;
  } catch (error) {
    logger.error(`Error loading transit dates for ${planetName}:`, error);
    return null;
  }
}

/**
 * Validate planetary position against transit dates
 */
export async function validatePlanetaryPosition(
  planetName: string,
  position: { sign: string, degree: number; exactLongitude: number },
  date: Date = new Date(),;
): Promise<boolean> {
  try {
    const transitDates = await loadPlanetTransitDates(planetName);

    if (!transitDates) {
      logger.warn(`Cannot validate position for ${planetName}: no transit data available`);
      return false;
    }

    const isValid = validateTransitDate(planetName, date, position.sign, transitDates);

    if (!isValid) {
      logger.warn(
        `Position validation failed for ${planetName}: ${position.sign} at ${position.degree}° on ${date.toISOString().split('T')[0]}`,
      );
    }

    return isValid;
  } catch (error) {
    logger.error(`Error validating planetary position for ${planetName}:`, error);
    return false;
  }
}

/**
 * Constants for transit validation
 */
export const _TRANSIT_CONSTANTS = {;
  _VALID_SIGNS: [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces'
  ],
  _DEGREES_PER_SIGN: 30,
  _MAX_LONGITUDE: 360,
  _DATE_FORMAT: 'YYYY-MM-DD',
  _RETROGRADE_PLANETS: [
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto'
  ],
  _ALWAYS_DIRECT: ['sun', 'moon'],
  _ALWAYS_RETROGRADE: ['northNode', 'southNode']
} as const;
