'use client';

// This file serves as a facade/proxy to the real implementation
// in src/calculations/alchemicalEngine.ts
// It helps maintain consistent import paths throughout the application

import { alchemize, AlchemicalEngineAdvanced } from '@/calculations/alchemicalEngine';
import { AlchemicalEngineBase } from '@/lib/alchemicalEngine';
import type { 
  StandardizedAlchemicalResult,
  AstrologicalState,
  BirthInfo,
  HoroscopeData,
  ChakraEnergies
} from '@/types/alchemy';

// Re-export the main functions and classes
export { AlchemicalEngineAdvanced, AlchemicalEngineBase };

// Re-export the main alchemize function
export { alchemize };

// Create and export a unified default object with all alchemical functionality
const alchemicalEngine = {
  alchemize: (birthInfo: BirthInfo, horoscopeDict: HoroscopeData): StandardizedAlchemicalResult => {
    try {
      return alchemize(birthInfo , horoscopeDict as HoroscopeData);
    } catch (error) {
      console.error('Error in alchemize:', error);
      
      // Special handling for 'Assignment to constant variable' error
      if (error instanceof TypeError && error.message.includes('Assignment to constant')) {
        console.error('Assignment to constant variable detected!');
        console.error('Error stack:', error.stack);
        
        // Try to extract the variable name from the error message
        const match = error.message.match(/Assignment to constant variable: (.+)/);
        if (match && match[1]) {
          console.error(`Attempted to reassign constant variable: ${match[1]}`);
        }
      }
      
      // Return a fallback result
      return {
        elementalProperties: {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        thermodynamicProperties: {
          heat: 0.5,
          entropy: 0.5,
          reactivity: 0.5,
          gregsEnergy: 0.0
        },
        kalchm: 1.0,
        monica: 1.0,
        score: 0.5,
        normalized: true,
        confidence: 0.5,
        metadata: {
          name: "Alchm NFT",
          description: "Fallback result due to error.",
          attributes: []
        }
      };
    }
  },
  
  // Re-export functions from the calculations/alchemicalEngine module
  calculateCurrentPlanetaryPositions: async (): Promise<Record<string, unknown>> => {
    try {
      // Import and call the function from the source module
      const { calculateCurrentPlanetaryPositions } = await import('@/calculations/alchemicalEngine');
      return calculateCurrentPlanetaryPositions();
    } catch (error) {
      console.error('Error calculating planetary positions:', error);
      // Return a safe fallback
      return {
        Sun: { Sign: { label: 'Aries' } },
        Moon: { Sign: { label: 'Cancer' } }
      };
    }
  },
  
  calculateZodiacEnergies: (positions: Record<string, unknown>): Record<string, number> => {
    try {
      // Import and call the function from the source module
      const { calculateZodiacEnergies } = require('@/calculations/alchemicalEngine');
      return calculateZodiacEnergies(positions);
    } catch (error) {
      console.error('Error calculating zodiac energies:', error);
      // Return a safe fallback with equal distribution
      return {
        aries: 0.0833,
        taurus: 0.0833,
        gemini: 0.0833,
        cancer: 0.0833,
        leo: 0.0833,
        virgo: 0.0833,
        libra: 0.0833,
        scorpio: 0.0833,
        sagittarius: 0.0833,
        capricorn: 0.0833,
        aquarius: 0.0833,
        pisces: 0.0833
      };
    }
  },
  
  calculateChakraEnergies: (zodiacEnergies: Record<string, number>): ChakraEnergies => {
    try {
      // Import and call the function from the source module
      const { calculateChakraEnergies } = require('@/calculations/alchemicalEngine');
      return calculateChakraEnergies(zodiacEnergies);
    } catch (error) {
      console.error('Error calculating chakra energies:', error);
      // Return a safe fallback with equal distribution
      return {
        root: 0.125,
        sacral: 0.125,
        solarPlexus: 0.125,
        heart: 0.125,
        throat: 0.125,
        thirdEye: 0.125,
        crown: 0.125
      };
    }
  },
  
  // Add a convenient factory method to create engine instances with error handling
  createEngine: (advanced: boolean = false) => {
    try {
      return advanced 
        ? new AlchemicalEngineAdvanced() 
        : new AlchemicalEngineBase();
    } catch (error) {
      console.error('Error creating engine instance:', error);
      // Return a minimal mock implementation
      return {
        calculateNaturalInfluences: () => ({
          Fire: 0.25,
          Water: 0.25,
          Air: 0.25,
          Earth: 0.25
        })
      };
    }
  },
  
  // Add getCurrentAstrologicalState method for AstrologicalContext
  getCurrentAstrologicalState: async (): Promise<AstrologicalState> => {
    try {
      // Simple implementation that returns a minimal valid state
      return {
        sunSign: 'aries',
        moonSign: 'cancer',
        ascendantSign: 'libra',
        activePlanets: ['Sun', 'Moon', 'Mercury'],
        aspects: [],
        houses: {},
        lunarPhase: 'full moon',
        currentZodiac: 'aries',
        zodiacSign: 'cancer',
        elementalBalance: {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        }
      } as AstrologicalState;
    } catch (error) {
      console.error('Error getting current astrological state:', error);
      return {
        sunSign: 'aries',
        moonSign: 'cancer',
        ascendantSign: 'libra',
        activePlanets: ['Sun', 'Moon'],
        aspects: [],
        houses: {},
        lunarPhase: 'full moon',
        currentZodiac: 'aries',
        zodiacSign: 'cancer',
        elementalBalance: {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        }
      } as AstrologicalState;
    }
  }
};

// Create and export the alchemical engine instance
export const alchemicalEngineInstance = new AlchemicalEngineBase();

// Export the alchemicalEngine object as well
export { alchemicalEngine };

// Default export for compatibility
export default {
  AlchemicalEngineBase,
  AlchemicalEngineAdvanced,
  alchemize,
  alchemicalEngine
};
