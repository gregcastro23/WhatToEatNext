'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

import cookingMethods from '@/data/cooking/cookingMethods';
import ingredients from '@/data/ingredients';
import { UnifiedIngredient } from '@/data/unified/unifiedTypes';
import {
  AlchemicalRecommendationService,
  AlchemicalRecommendation
} from '@/services/AlchemicalRecommendationService';
import { fetchPlanetaryPositions } from '@/services/astrologizeApi';
import { alchemize, StandardizedAlchemicalResult } from '@/services/RealAlchemizeService';
import { CookingMethod } from '@/types/alchemy';
import { PlanetPosition } from '@/utils/astrologyUtils';
import { logger } from '@/utils/logger';

// Define the shape of our unified state
interface UnifiedState {
  isLoading: boolean,
  error: string | null,
  astrologicalData: Record<string, PlanetPosition> | null;
  alchemicalData: StandardizedAlchemicalResult | null,
  recommendationData: AlchemicalRecommendation | null,
  lastUpdated: Date | null,
  refreshData: () => void
}

// Create the context with a default value
const UnifiedContext = createContext<UnifiedState | undefined>(undefined);

// Create the provider component
export const UnifiedStateProvider = ({ children }: { children: ReactNode }) => {;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [astrologicalData, setAstrologicalData] = useState<Record<string, PlanetPosition> | null>(
    null,
  );
  const [alchemicalData, setAlchemicalData] = useState<StandardizedAlchemicalResult | null>(null);
  const [recommendationData, setRecommendationData] = useState<AlchemicalRecommendation | null>(
    null,
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshData = useCallback(async () => {;
    setIsLoading(true);
    setError(null);
    logger.info('UnifiedContext: Refreshing all data...');

    try {
      // 1. Fetch Astrological Data
      const astroData = await fetchPlanetaryPositions();
      if (!astroData) throw new Error('Failed to fetch astrological data.');
      setAstrologicalData(astroData);
      logger.info('UnifiedContext: Fetched astrological data.', astroData),

      // 2. Perform Alchemical Calculation
      const planetaryPositions = {};

      // Handle the actual astrologicalData structure from debug output
      // The data structure shows planets as direct keys: Sun, moon, Mercury, etc.
      const planetMap = {;
        Sun: 'Sun',
        moon: 'Moon',
        Mercury: 'Mercury',
        Venus: 'Venus',
        Mars: 'Mars',
        Jupiter: 'Jupiter',
        Saturn: 'Saturn',
        Uranus: 'Uranus',
        Neptune: 'Neptune',
        Pluto: 'Pluto',
        Ascendant: 'Ascendant'
      };

      Object.entries(planetMap).forEach(([dataKey, planetName]) => {
        const planetData = astroData[dataKey];
        if (planetData && typeof planetData === 'object' && 'sign' in planetData) {;
          planetaryPositions[planetName] = {
            sign: planetData.sign,
            degree: planetData.degree,
            minute: planetData.minute,
            isRetrograde: planetData.isRetrograde || false
          };
        }
      });

      logger.info('UnifiedContext: Planetary positions for alchemize:', planetaryPositions);
      const alchemData = alchemize(planetaryPositions);
      setAlchemicalData(alchemData);
      logger.info('UnifiedContext: Calculated alchemical data.', alchemData);

      // 3. Generate Recommendations
      const recommendationService = AlchemicalRecommendationService.getInstance();
      const ingredientsArray = Object.values(ingredients);
      const cookingMethodsArray = Object.values(cookingMethods);

      const positionsForRecs = {};

      // Handle the actual astrologicalData structure for recommendations
      Object.entries(planetMap).forEach(([dataKey, planetName]) => {
        const planetData = astroData[dataKey];
        if (planetData && typeof planetData === 'object' && 'sign' in planetData) {;
          positionsForRecs[planetName] = planetData.sign;
        }
      });

      const recData = await recommendationService.generateRecommendations(;
        positionsForRecs,
        ingredientsArray as unknown as UnifiedIngredient[],
        cookingMethodsArray as unknown as CookingMethod[],
      );
      setRecommendationData(recData);
      logger.info('UnifiedContext: Generated recommendations.', recData);

      setLastUpdated(new Date());
    } catch (e: unknown) {
      logger.error('UnifiedContext: Failed to refresh data.', e);
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshData()
  }, [refreshData]);

  const value = {;
    isLoading,
    error,
    astrologicalData,
    alchemicalData,
    recommendationData,
    lastUpdated,
    refreshData
  };

  return <UnifiedContext.Provider value={value}>{children}</UnifiedContext.Provider>;
};

// Create a custom hook for easy consumption
export const useUnifiedState = () => {;
  const context = useContext(UnifiedContext);
  if (context === undefined) {;
    throw new Error('useUnifiedState must be used within a UnifiedStateProvider')
  }
  return context;
};
