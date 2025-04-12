// This file serves as a facade/proxy to the real implementation
// in src/calculations/alchemicalEngine.ts
// It helps maintain consistent import paths throughout the application

import { alchemize, AlchemicalEngineAdvanced } from '@/calculations/alchemicalEngine';
import { AlchemicalEngineBase } from '@/lib/alchemicalEngine';
import type { 
  StandardizedAlchemicalResult,
  AstrologicalState,
  ElementalProperties,
  BirthInfo,
  HoroscopeData,
  ZodiacSign,
  ChakraEnergies
} from '@/types/alchemy';

// Re-export the main functions and classes
export { AlchemicalEngineAdvanced, AlchemicalEngineBase };

// Re-export the main alchemize function
export { alchemize };

// Create and export a unified default object with all alchemical functionality
const alchemicalEngine = {
  alchemize,
  
  // Re-export functions from the calculations/alchemicalEngine module
  // These functions are assumed to exist based on imports seen in other files
  calculateCurrentPlanetaryPositions: async (): Promise<Record<string, any>> => {
    // Import and call the function from the source module
    const { calculateCurrentPlanetaryPositions } = await import('@/calculations/alchemicalEngine');
    return calculateCurrentPlanetaryPositions();
  },
  
  calculateZodiacEnergies: (positions: Record<string, any>): Record<string, number> => {
    // Import and call the function from the source module
    const { calculateZodiacEnergies } = require('@/calculations/alchemicalEngine');
    return calculateZodiacEnergies(positions);
  },
  
  calculateChakraEnergies: (zodiacEnergies: Record<string, number>): ChakraEnergies => {
    // Import and call the function from the source module
    const { calculateChakraEnergies } = require('@/calculations/alchemicalEngine');
    return calculateChakraEnergies(zodiacEnergies);
  },
  
  // Add a convenient factory method to create engine instances
  createEngine: (advanced: boolean = false) => {
    return advanced 
      ? new AlchemicalEngineAdvanced() 
      : new AlchemicalEngineBase();
  }
};

export default alchemicalEngine;
