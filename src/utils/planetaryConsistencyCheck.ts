import { logger } from './logger';
import { planetaryModifiers } from './planetaryCycles';

/**
 * Validates the consistency of planetary modifiers
 * Returns a list of issues found or an empty array if all is well
 */
export function validatePlanetaryModifiers(): string[] {
  const issues: string[] = []

  // Required planets
  const requiredPlanets = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
  ];

  // Check if all required planets exist
  for (const planet of requiredPlanets) {
    if (!planetaryModifiers[planet]) {
      issues.push(`Missing planetary modifier for ${planet}`)
    }
  }

  // Check if all planets have all required attributes
  const requiredAttributes = [
    'Fire',
    'Water',
    'Air',
    'Earth',
    'Spirit',
    'Essence',
    'Matter',
    'Substance'
  ];

  for (const planet in planetaryModifiers) {
    for (const attr of requiredAttributes) {
      if (planetaryModifiers[planet][attr] === undefined) {
        issues.push(`Missing ${attr} attribute for ${planet}`)
      }
    }
  }

  // Check that all modifier values are within a reasonable range (-1 to 1)
  for (const planet in planetaryModifiers) {
    for (const attr in planetaryModifiers[planet]) {
      const value = planetaryModifiers[planet][attr];
      if (value < -1 || value > 1) {
        issues.push(`Value out of range for ${planet}.${attr}: ${value}`)
      }
    }
  }

  return issues;
}

/**
 * Logs the validation results to the console
 */
export function logPlanetaryConsistencyCheck(): void {
  const issues = validatePlanetaryModifiers()

  if (issues.length === 0) {
    if (typeof logger !== 'undefined' && logger.info) {
      logger.info('✅ Planetary modifiers are consistent')
    }
  } else {
    if (typeof logger !== 'undefined' && logger.error) {
      logger.error('❌ Planetary modifier consistency issues found: ')
      issues.forEach(issue => logger.error(`- ${issue}`))
    }
  }
}
