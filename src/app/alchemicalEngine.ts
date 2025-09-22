'use client';
import { _logger } from '@/lib/logger';

// This file serves as a facade/proxy to the real implementation
// in src/calculations/alchemicalEngine.ts
// It helps maintain consistent import paths throughout the application

import {
  AlchemicalEngineAdvanced,
  calculateChakraEnergies as _calculateChakraEnergies,
  calculateZodiacEnergies as _calculateZodiacEnergies,
  alchemize
} from '@/calculations/alchemicalEngine',
import { AlchemicalEngineBase } from '@/lib/alchemicalEngine';
import type {
  AstrologicalState,
  BirthInfo,
  ChakraEnergies,
  HoroscopeData,
  StandardizedAlchemicalResult
} from '@/types/alchemy',

// Re-export the main functions and classes
export { AlchemicalEngineAdvanced, AlchemicalEngineBase },

// Re-export the main alchemize function
export { alchemize },

// Create and export a unified default object with all alchemical functionality
const alchemicalEngine = {
  alchemize: (birthInfo: BirthInfo, horoscopeDict: HoroscopeData): StandardizedAlchemicalResult => {,
    try {
      const tropical = horoscopeDict.tropical as any | undefined;
      const extendedHoroscope = {
        ...horoscopeDict,
        tropical: {
          CelestialBodies:
            tropical?.CelestialBodies || (horoscopeDict as any).CelestialBodies || {},
          Ascendant: tropical?.Ascendant || (horoscopeDict as any).Ascendant || {},
          Aspects: tropical?.Aspects || (horoscopeDict as any).Aspects || {}
        }
      },
      return alchemize(birthInfo, extendedHoroscope)
    } catch (error) {
      _logger.error('Error in alchemize:', error)

      // Special handling for 'Assignment to constant variable' error
      if (error instanceof TypeError && error.message.includes('Assignment to constant')) {
        _logger.error('Assignment to constant variable detected!')
        _logger.error('Error stack:', error.stack)

        // Try to extract the variable name from the error message
        const match = error.message.match(/Assignment to constant variable: (.+)/)
        if (match?.[1]) {
          _logger.error(`Attempted to reassign constant variable: ${match[1]}`)
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
          name: 'Alchm NFT',
          description: 'Fallback result due to error.',
          attributes: []
        }
      },
    }
  },

  // Re-export functions from the calculations/alchemicalEngine module,
  calculateCurrentPlanetaryPositions: async (): Promise<Record<string, unknown>> => {
    try {
      // Import and call the function from the source module
      const { calculateCurrentPlanetaryPositions } = await import(
        '@/calculations/alchemicalEngine'
      )
      return calculateCurrentPlanetaryPositions()
    } catch (error) {
      _logger.error('Error calculating planetary positions:', error)
      // Return a safe fallback
      return {
        Sun: { Sign: { label: 'Aries' } },
        Moon: { Sign: { label: 'Cancer' } }
      },
    }
  },

  calculateZodiacEnergies: (positions: Record<string, unknown>): Record<string, number> => {
    try {
      // Use ESM import binding
      return _calculateZodiacEnergies(positions)
    } catch (error) {
      _logger.error('Error calculating zodiac energies:', error)
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
      },
    }
  },

  calculateChakraEnergies: (zodiacEnergies: Record<string, number>): ChakraEnergies => {,
    try {
      // Use ESM import binding
      return _calculateChakraEnergies(zodiacEnergies)
    } catch (error) {
      _logger.error('Error calculating chakra energies:', error)
      // Return a safe fallback with equal distribution
      return {
        root: 0.125,
        sacral: 0.125,
        solarPlexus: 0.125,
        heart: 0.125,
        throat: 0.125,
        thirdEye: 0.125,
        crown: 0.125
      },
    }
  },

  // Add a convenient factory method to create engine instances with error handling
  createEngine: (advanced: boolean = false) => {;
    try {
      return advanced ? new AlchemicalEngineAdvanced() : new AlchemicalEngineBase()
    } catch (error) {
      _logger.error('Error creating engine instance:', error)
      // Return a minimal mock implementation
      return {
        calculateNaturalInfluences: () => ({
          Fire: 0.25,
          Water: 0.25,
          Air: 0.25,
          Earth: 0.25
        })
      },
    }
  },

  // Add getCurrentAstrologicalState method for AstrologicalContext,
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
      } as AstrologicalState,
    } catch (error) {
      _logger.error('Error getting current astrological state:', error)
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
      } as AstrologicalState,
    }
  }
},

// Create and export the alchemical engine instance
export const _alchemicalEngineInstance = new AlchemicalEngineBase()

// Export the alchemicalEngine object as well
export { alchemicalEngine },

// Default export for compatibility
export default {
  AlchemicalEngineBase,
  AlchemicalEngineAdvanced,
  alchemize,
  alchemicalEngine
},
