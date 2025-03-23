"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculatePlanetaryPositions, calculateAspects, longitudeToZodiacPosition, getPlanetaryDignity } from '@/utils/astrologyUtils';
import { getCurrentSeason } from '@/data/integrations/seasonal';

interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
}

interface CurrentChart {
  planetaryPositions: Record<string, number>;
  aspects: PlanetaryAspect[];
  currentSeason: string;
  lastUpdated: Date;
  stelliums: Record<string, string[]>;
  houseEffects: Record<string, number>;
}

interface CurrentChartContextType {
  chart: CurrentChart;
  loading: boolean;
  error: string | null;
  refreshChart: () => Promise<void>;
}

const CurrentChartContext = createContext<CurrentChartContextType | null>(null);

export const CurrentChartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [chart, setChart] = useState<CurrentChart>({
    planetaryPositions: {},
    aspects: [],
    currentSeason: '',
    lastUpdated: new Date(),
    stelliums: {},
    houseEffects: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStelliums = (positions: Record<string, number>): Record<string, string[]> => {
    const signGroups: Record<string, string[]> = {};
    Object.entries(positions).forEach(([planet, degree]) => {
      const sign = getSignFromDegree(degree);
      if (!signGroups[sign]) {
        signGroups[sign] = [];
      }
      signGroups[sign].push(planet);
    });

    const stelliums: Record<string, string[]> = {};
    Object.entries(signGroups).forEach(([sign, planets]) => {
      if (planets.length >= 3) {
        stelliums[sign] = planets;
      }
    });

    return stelliums;
  };

  const calculateHouseEffects = (positions: Record<string, number>): Record<string, number> => {
    const houseEffects: Record<string, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };

    Object.entries(positions).forEach(([planet, degree]) => {
      const house = Math.floor(degree / 30) + 1;
      const element = getHouseElement(house);
      houseEffects[element] += 1;
    });

    return houseEffects;
  };

  const getSignFromDegree = (degree: number): string => {
    const signIndex = Math.floor(degree / 30);
    return [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ][signIndex];
  };

  const getHouseElement = (house: number): string => {
    const houseElements = [
      'Fire', 'Earth', 'Air', 'Water',
      'Fire', 'Earth', 'Air', 'Water',
      'Fire', 'Earth', 'Air', 'Water'
    ];
    return houseElements[house - 1] || 'Fire';
  };

  const refreshChart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing chart...');
      
      // Use try-catch to handle errors in calculatePlanetaryPositions
      let positions;
      try {
        positions = await calculatePlanetaryPositions();
        console.log('Successfully calculated planetary positions');
      } catch (posError) {
        console.error('Error calculating planetary positions:', posError);
        // Use default positions as fallback
        positions = getDefaultPlanetaryPositions();
      }
      
      // Validate positions before calculating aspects
      if (!positions || Object.keys(positions).length === 0) {
        throw new Error("Unable to calculate planetary positions");
      }
      
      // Ensure all positions have the required properties
      const hasValidPositions = Object.values(positions).every(
        position => position && typeof position === 'object' && 'sign' in position
      );
      
      if (!hasValidPositions) {
        console.warn("Some planetary positions are invalid or incomplete, using defaults");
        positions = getDefaultPlanetaryPositions();
      }
      
      // Continue with the rest of the chart calculations
      const aspects = calculateAspects(positions);
      const season = getCurrentSeason();
      const stelliums = calculateStelliums(positions);
      const houseEffects = calculateHouseEffects(positions);
      
      setChart({
        planetaryPositions: positions,
        aspects,
        currentSeason: season,
        lastUpdated: new Date(),
        stelliums,
        houseEffects
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chart');
      console.error('Error updating chart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshChart();
  }, []);

  return (
    <CurrentChartContext.Provider value={{ chart, loading, error, refreshChart }}>
      {children}
    </CurrentChartContext.Provider>
  );
};

export const useCurrentChart = () => {
  const context = useContext(CurrentChartContext);
  if (!context) {
    throw new Error('useCurrentChart must be used within a CurrentChartProvider');
  }
  return context;
}; 