'use client';

import { AstrologicalState } from '@/types/celestial';


import { 
  ElementalProperties,
  AlchemicalProperties,
  CelestialPosition,
  ZodiacSign,
  LunarPhase,
  Planet,
  PlanetaryAlignment
} from '@/types/celestial';

// Type for planetary positions
export type PlanetaryPositionsType = Record<string, CelestialPosition>;

// Interface for astrological state
; 