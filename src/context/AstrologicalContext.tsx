'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { ChakraEnergies, AstrologicalState } from '@/types/alchemy';
import alchemicalEngine from '@/calculations/alchemicalEngine';
import { isChakraEnergies, isAstrologicalState } from '@/utils/validation';
import { 
  DEFAULT_CHAKRA_ENERGIES, 
  DEFAULT_ZODIAC_ENERGIES,
  DEFAULT_PLANETARY_POSITIONS,
  DEFAULT_ASTROLOGICAL_STATE 
} from '@/constants/defaults';
import ErrorHandler from '@/services/errorHandler';

interface AstrologicalContextState {
  chakraEnergies: ChakraEnergies;
  planetaryPositions: Record<string, unknown>;
  zodiacEnergies: Record<string, number>;
  astrologicalState: AstrologicalState;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
}

// Create context with default values to prevent undefined
const defaultContextValue: AstrologicalContextState = {
  chakraEnergies: DEFAULT_CHAKRA_ENERGIES,
  planetaryPositions: DEFAULT_PLANETARY_POSITIONS,
  zodiacEnergies: DEFAULT_ZODIAC_ENERGIES,
  astrologicalState: DEFAULT_ASTROLOGICAL_STATE,
  isLoading: false,
  error: null,
  lastUpdated: null,
  refreshData: async () => {
    console.warn('refreshData called before provider was initialized');
  },
};

const AstrologicalContext = createContext<AstrologicalContextState>(defaultContextValue);

export function AstrologicalProvider({ children }: { children: ReactNode }) {
  // Initialize state with safe default values
  const [chakraEnergies, setChakraEnergies] = useState<ChakraEnergies>(DEFAULT_CHAKRA_ENERGIES);
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, unknown>>(DEFAULT_PLANETARY_POSITIONS);
  const [zodiacEnergies, setZodiacEnergies] = useState<Record<string, number>>(DEFAULT_ZODIAC_ENERGIES);
  const [astrologicalState, setAstrologicalState] = useState<AstrologicalState>(DEFAULT_ASTROLOGICAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Function to load astrological data
  const loadAstrologicalData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate current planetary positions
      const positions = await ErrorHandler.safeAsync(
        async () => alchemicalEngine.calculateCurrentPlanetaryPositions(),
        DEFAULT_PLANETARY_POSITIONS,
        'AstrologicalContext.loadAstrologicalData.positions'
      );
      
      setPlanetaryPositions(positions);

      // Calculate zodiac energies based on current planetary positions
      let zodiacEnergies = DEFAULT_ZODIAC_ENERGIES;
      try {
        zodiacEnergies = alchemicalEngine.calculateZodiacEnergies(positions);
      } catch (err) {
        ErrorHandler.log(err, { 
          context: 'AstrologicalContext.loadAstrologicalData.zodiacEnergies',
          data: { positions }
        });
      }
      setZodiacEnergies(zodiacEnergies);

      // Calculate chakra energies based on zodiac energies
      let chakraEnergies = DEFAULT_CHAKRA_ENERGIES;
      try {
        chakraEnergies = alchemicalEngine.calculateChakraEnergies(zodiacEnergies);
        // Validate the chakra energies
        if (!isChakraEnergies(chakraEnergies)) {
          ErrorHandler.log(
            'Invalid chakra energies structure', 
            { context: 'AstrologicalContext', data: { chakraEnergies } }
          );
          chakraEnergies = DEFAULT_CHAKRA_ENERGIES;
        }
      } catch (err) {
        ErrorHandler.log(err, { 
          context: 'AstrologicalContext.loadAstrologicalData.chakraEnergies',
          data: { zodiacEnergies }
        });
      }
      setChakraEnergies(chakraEnergies);
      
      // Attempt to get current astrological state
      let currentAstroState = DEFAULT_ASTROLOGICAL_STATE;
      try {
        const astroState = await alchemicalEngine.getCurrentAstrologicalState();
        if (isAstrologicalState(astroState)) {
          currentAstroState = astroState;
        } else {
          ErrorHandler.log(
            'Invalid astrological state structure', 
            { context: 'AstrologicalContext', data: { astroState } }
          );
        }
      } catch (err) {
        ErrorHandler.log(err, { 
          context: 'AstrologicalContext.loadAstrologicalData.astrologicalState'
        });
      }
      setAstrologicalState(currentAstroState);
      
      // Update last updated timestamp
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      ErrorHandler.log(err, { 
        context: 'AstrologicalContext.loadAstrologicalData',
        isFatal: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAstrologicalData().catch(err => {
      ErrorHandler.log(err, { 
        context: 'AstrologicalContext.useEffect', 
        data: { message: 'Failed to load initial astrological data' }
      });
    });
  }, []);

  // Function to refresh data
  const refreshData = async () => {
    await loadAstrologicalData();
  };

  const value: AstrologicalContextState = {
    chakraEnergies,
    planetaryPositions,
    zodiacEnergies,
    astrologicalState,
    isLoading,
    error,
    lastUpdated,
    refreshData,
  };

  return (
    <AstrologicalContext.Provider value={value}>
      {children}
    </AstrologicalContext.Provider>
  );
}

export function useAstrologicalState() {
  const context = useContext(AstrologicalContext);

  // No need to check for undefined since we provide default values in createContext
  return context;
}
