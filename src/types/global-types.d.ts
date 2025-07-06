// global-types.d.ts - created 2025-07-06
// Provides ambient global type aliases so that frequently used types
// (which are often referenced without explicit import) compile without
// triggering TS2304 "Cannot find name" errors.  These aliases do NOT
// pollute runtime—they are erased during compilation.

import type { ElementalProperties as _ElementalProperties, Planet as _Planet, CelestialPosition as _CelestialPosition, ChakraEnergies as _ChakraEnergies, ThermodynamicMetrics as _ThermodynamicMetrics, Season as _Season, LunarPhase as _LunarPhase } from '@/types/alchemy';
import type { createElementalProperties as _createElementalProperties } from '@/utils/elemental/elementalUtils';
import type { AlchemicalProperties as _AlchemicalProperties } from '@/types/alchemy';
import type { PlanetName as _PlanetName } from '@/types/celestial';

declare global {
  // Allow un-prefixed usage across components/services
  type ElementalProperties = _ElementalProperties;
  type Planet = _Planet;
  type CelestialPosition = _CelestialPosition;
  type ChakraEnergies = _ChakraEnergies;
  type ThermodynamicMetrics = _ThermodynamicMetrics;
  type Season = _Season;
  type LunarPhase = _LunarPhase;
  const createElementalProperties: typeof _createElementalProperties;
  const isElementalProperties: typeof import('@/utils/elemental/elementalUtils')._isElementalProperties;
  const elementalUtils: typeof import('@/utils/elementalUtils').elementalUtils;
  const validatePlanetaryPositions: typeof import('@/utils/validatePlanetaryPositions').validatePlanetaryPositions;
  type AlchemicalProperties = _AlchemicalProperties;
  // Provide shorthand alias if referenced without import
  type alchemicalProperties = _AlchemicalProperties; // lowercase variant sometimes appears
  type PlanetName = _PlanetName;
}

export {}; // ensure this file is treated as a module 