/**
 * This utility provides helper functions to safely check for planets in PlanetaryAspect objects
 * regardless of which interface type is used.
 */

import { PlanetaryAspect } from '../types/alchemy';

/**
 * Safely checks if a planetary aspect includes a specific planet,
 * handling both PlanetaryAspect interface types
 * 
 * @param aspect The aspect to check
 * @param planet The planet name to look for
 * @returns True if the aspect includes the specified planet
 */
export function aspectIncludesPlanet(
  aspect: PlanetaryAspect | { planets: string[]; type: string; influence?: number; orb?: number },
  planet: string
): boolean {
  if ('planets' in aspect && Array.isArray(aspect.planets)) {
    return aspect.planets.includes(planet);
  } else if ('planet1' in aspect && 'planet2' in aspect) {
    return aspect.planet1 === planet || aspect.planet2 === planet;
  }
  return false;
}

/**
 * Safely checks if an aspect is of a specific type, handling both PlanetaryAspect interface types
 * 
 * @param aspect The aspect to check
 * @param aspectType The aspect type to check for
 * @returns True if the aspect is of the specified type
 */
export function isAspectOfType(
  aspect: PlanetaryAspect | { planets: string[]; type: string; influence?: number; orb?: number },
  aspectType: string
): boolean {
  if ('type' in aspect) {
    return aspect.type === aspectType;
  } else if ('aspectType' in aspect) {
    return aspect.aspectType === aspectType;
  }
  return false;
}

/**
 * Safely checks if a planetary aspect includes a specific planet and is of a specific type
 * 
 * @param aspect The aspect to check
 * @param planet The planet name to look for
 * @param aspectType The aspect type to check for
 * @returns True if the aspect includes the specified planet and is of the specified type
 */
export function aspectIncludesPlanetAndType(
  aspect: PlanetaryAspect | { planets: string[]; type: string; influence?: number; orb?: number },
  planet: string,
  aspectType: string
): boolean {
  return aspectIncludesPlanet(aspect, planet) && isAspectOfType(aspect, aspectType);
}

/**
 * Safely gets an array of planets from a planetary aspect,
 * handling both PlanetaryAspect interface types
 * 
 * @param aspect The aspect to get planets from
 * @returns Array of planet names
 */
export function getPlanetsFromAspect(
  aspect: PlanetaryAspect | { planets: string[]; type: string; influence?: number; orb?: number }
): string[] {
  if ('planets' in aspect && Array.isArray(aspect.planets)) {
    return aspect.planets;
  } else if ('planet1' in aspect && 'planet2' in aspect) {
    return [aspect.planet1, aspect.planet2];
  }
  return [];
} 