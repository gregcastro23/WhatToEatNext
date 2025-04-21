// This file serves as a facade/proxy to the real implementation
// in src/calculations/alchemicalEngine.ts
// It helps maintain consistent import paths throughout the application

import { alchemize, AlchemicalEngineAdvanced } from '../calculations/alchemicalEngine';
import { AlchemicalEngineBase } from '../lib/alchemicalEngine';
import { getAccuratePlanetaryPositions } from '../utils/accurateAstronomy';
import type { 
  StandardizedAlchemicalResult,
  AstrologicalState,
  ElementalProperties,
  BirthInfo,
  HoroscopeData,
  ZodiacSign,
  ChakraEnergies
} from '../types/alchemy';

// Re-export the main functions and classes
export { AlchemicalEngineAdvanced, AlchemicalEngineBase };

// Re-export the main alchemize function
export { alchemize };

// Create and export a unified default object with all alchemical functionality
const alchemicalEngine = {
  alchemize,
  
  // Enhanced implementation of calculateCurrentPlanetaryPositions with proper error handling
  calculateCurrentPlanetaryPositions: async (): Promise<Record<string, unknown>> => {
    try {
      // Use the imported function from accurateAstronomy
      return await getAccuratePlanetaryPositions();
    } catch (error) {
      console.error('Error in calculateCurrentPlanetaryPositions:', error);
      
      // Return fallback data with error information
      return {
        error: 'Failed to calculate planetary positions',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
        calculationDate: new Date().toISOString(),
        // Minimal fallback data to prevent app crashes
        sun: { sign: 'aries', degree: 15 },
        Moon: { sign: 'cancer', degree: 10 }
      };
    }
  },
  
  calculateZodiacEnergies: (positions: Record<string, unknown>): Record<string, number> => {
    try {
      // Define the function inline using the algorithm from the original file
      const signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      
      // Initialize the energies with base values
      const energies: Record<string, number> = {};
      signs.forEach(sign => {
        energies[sign] = 0.05; // Base energy for each sign
      });
      
      // Process each planet's position to contribute to sign energies
      Object.entries(positions).forEach(([planet, data]) => {
        if (!data || typeof data !== 'object') return;
        
        const sign = (data as any).sign?.toLowerCase();
        if (!sign || !signs.includes(sign)) return;
        
        // Basic planet weight mapping
        const planetWeights: Record<string, number> = {
          'sun': 0.15,
          'moon': 0.13,
          'mercury': 0.08,
          'venus': 0.08,
          'mars': 0.08,
          'jupiter': 0.07,
          'saturn': 0.06,
          'uranus': 0.05,
          'neptune': 0.05,
          'pluto': 0.05
        };
        
        // Add the planet's energy to its sign
        const weight = planetWeights[planet.toLowerCase()] || 0.05;
        energies[sign] += weight;
      });
      
      // Normalize to ensure values sum reasonably (not exactly to 1)
      return energies;
    } catch (error) {
      console.error('Error in calculateZodiacEnergies:', error);
      
      // Return fallback data
      return {
        aries: 0.083, taurus: 0.083, gemini: 0.083, cancer: 0.083,
        leo: 0.083, virgo: 0.083, libra: 0.083, scorpio: 0.083,
        sagittarius: 0.083, capricorn: 0.083, aquarius: 0.083, pisces: 0.083
      };
    }
  },
  
  calculateChakraEnergies: (zodiacEnergies: Record<string, number>): ChakraEnergies => {
    try {
      // Define the mapping from zodiac signs to chakras
      const chakraMapping: Record<string, string[]> = {
        'root': ['capricorn', 'aquarius'],
        'sacral': ['scorpio', 'pisces'],
        'solarPlexus': ['aries', 'leo', 'sagittarius'],
        'heart': ['taurus', 'libra'],
        'throat': ['gemini'],
        'brow': ['virgo'],
        'crown': ['cancer']
      };
      
      // Initialize chakra energies
      const chakraEnergies: Record<string, number> = {
        'root': 0,
        'sacral': 0,
        'solarPlexus': 0,
        'heart': 0,
        'throat': 0,
        'brow': 0,
        'crown': 0
      };
      
      // Calculate chakra energies based on zodiac sign energies
      Object.entries(chakraMapping).forEach(([chakra, signs]) => {
        signs.forEach(sign => {
          if (zodiacEnergies[sign]) {
            chakraEnergies[chakra] += zodiacEnergies[sign] / signs.length;
          }
        });
      });
      
      // Normalize values to ensure they're in a reasonable range
      const total = Object.values(chakraEnergies).reduce((sum, val) => sum + val, 0);
      if (total > 0) {
        Object.keys(chakraEnergies).forEach(chakra => {
          chakraEnergies[chakra] = chakraEnergies[chakra] / total;
        });
      }
      
      return chakraEnergies as ChakraEnergies;
    } catch (error) {
      console.error('Error in calculateChakraEnergies:', error);
      
      // Return fallback data
      return {
        root: 0.143,
        sacral: 0.143,
        solarPlexus: 0.143,
        heart: 0.143,
        throat: 0.143,
        brow: 0.143,
        crown: 0.143
      };
    }
  },
  
  // Add a convenient factory method to create engine instances
  createEngine: (advanced: boolean = false) => {
    return advanced 
      ? new AlchemicalEngineAdvanced() 
      : new AlchemicalEngineBase();
  }
};

export default alchemicalEngine;
