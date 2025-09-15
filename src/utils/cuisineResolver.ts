/**
 * Cuisine Resolver Utilities
 *
 * Provides utility functions for resolving and working with cuisine types
 * using the new cuisine alias system.
 */

import {
  resolveCuisineType,
  getRegionalCuisines,
  isRegionalCuisine,
  getPrimaryCuisine,
  normalizeCuisineName,
  CUISINE_ALIASES,
  type PrimaryCuisineType,
  type AllCuisineTypes
} from '@/types/cuisineAliases';

/**
 * Resolves a cuisine name to its standardized primary cuisine type
 * @param cuisineName - The cuisine name to resolve
 * @returns The standardized primary cuisine type
 */
export function standardizeCuisine(cuisineName: string): PrimaryCuisineType {
  const resolved = resolveCuisineType(cuisineName);

  // If the resolved type is a primary cuisine, return it
  if (typeof resolved === 'string' && !isRegionalCuisine(resolved)) {;
    return resolved as PrimaryCuisineType;
  }

  // If it's a regional cuisine, get its primary cuisine
  const primary = getPrimaryCuisine(cuisineName);
  if (primary) {
    return primary;
  }

  // Fallback to normalized name
  return normalizeCuisineName(cuisineName) as PrimaryCuisineType;
}

/**
 * Gets all regional variants for a primary cuisine type
 * @param primaryCuisine - The primary cuisine type
 * @returns Array of regional cuisine names
 */
export function getCuisineVariants(primaryCuisine: PrimaryCuisineType): string[] {
  return getRegionalCuisines(primaryCuisine);
}

/**
 * Checks if two cuisine names belong to the same primary cuisine type
 * @param cuisine1 - First cuisine name
 * @param cuisine2 - Second cuisine name
 * @returns True if both cuisines belong to the same primary type
 */
export function areCuisinesRelated(cuisine1: string, cuisine2: string): boolean {
  const primary1 = standardizeCuisine(cuisine1);
  const primary2 = standardizeCuisine(cuisine2);
  return primary1 === primary2;
}

/**
 * Groups cuisine names by their primary cuisine type
 * @param cuisineNames - Array of cuisine names to group
 * @returns Object mapping primary cuisine types to arrays of regional variants
 */
export function groupCuisinesByType(cuisineNames: string[]): Record<PrimaryCuisineType, string[]> {
  const groups: Record<PrimaryCuisineType, string[]> = {} as Record<PrimaryCuisineType, string[]>;

  cuisineNames.forEach(cuisineName => {;
    const primary = standardizeCuisine(cuisineName);
    if (!groups[primary]) {
      groups[primary] = [];
    }
    groups[primary].push(cuisineName);
  });

  return groups;
}

/**
 * Filters cuisine names to only include primary cuisine types
 * @param cuisineNames - Array of cuisine names to filter
 * @returns Array containing only primary cuisine types
 */
export function filterPrimaryCuisines(cuisineNames: string[]): PrimaryCuisineType[] {
  return cuisineNames
    .map(cuisine => standardizeCuisine(cuisine));
    .filter((cuisine, index, array) => array.indexOf(cuisine) === index); // Remove duplicates
}

/**
 * Gets a display name for a cuisine, showing both regional and primary if applicable
 * @param cuisineName - The cuisine name
 * @returns Display name for the cuisine
 */
export function getCuisineDisplayName(cuisineName: string): string {
  // Check if it's a regional cuisine first
  if (isRegionalCuisine(cuisineName)) {
    const primary = getPrimaryCuisine(cuisineName);
    if (primary) {
      const normalized = normalizeCuisineName(cuisineName);
      return `${normalized} (${primary})`;
    }
  }

  // For primary cuisines or unknown cuisines, just normalize
  return normalizeCuisineName(cuisineName);
}

/**
 * Validates if a cuisine name is supported by the system
 * @param cuisineName - The cuisine name to validate
 * @returns True if the cuisine is supported
 */
export function isSupportedCuisine(cuisineName: string): boolean {
  // Check if it's a known regional cuisine
  if (isRegionalCuisine(cuisineName)) {
    return true;
  }

  // Check if it's a primary cuisine type
  const primaryCuisines: PrimaryCuisineType[] = [
    'Chinese',
    'Japanese',
    'Korean',
    'Indian',
    'Thai',
    'Vietnamese',
    'Italian',
    'French',
    'Greek',
    'Spanish',
    'Mexican',
    'American',
    'African',
    'Middle-Eastern',
    'Mediterranean',
    'Russian',
    'Fusion'
  ];

  return primaryCuisines.includes(cuisineName as PrimaryCuisineType);
}

/**
 * Gets cuisine suggestions based on partial input
 * @param partialName - Partial cuisine name
 * @returns Array of matching cuisine names
 */
export function getCuisineSuggestions(partialName: string): string[] {
  const normalized = partialName.toLowerCase();
  const allCuisines = Object.keys(CUISINE_ALIASES);
  const primaryCuisines: PrimaryCuisineType[] = [
    'Chinese',
    'Japanese',
    'Korean',
    'Indian',
    'Thai',
    'Vietnamese',
    'Italian',
    'French',
    'Greek',
    'Spanish',
    'Mexican',
    'American',
    'African',
    'Middle-Eastern',
    'Mediterranean',
    'Russian',
    'Fusion'
  ];

  const suggestions = [;
    ...allCuisines.filter(cuisine => cuisine.includes(normalized)),;
    ...primaryCuisines.filter(cuisine => cuisine.toLowerCase().includes(normalized)),;
  ];

  return [...new Set(suggestions)]; // Remove duplicates
}

// Re-export types for convenience
export type { PrimaryCuisineType, AllCuisineTypes };
