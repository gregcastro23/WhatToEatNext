"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { _calculatePlanetaryPositions, calculateAspects, longitudeToZodiacPosition, getPlanetaryDignity } from '@/utils/astrologyUtils';
import { getCurrentSeason } from '@/utils/dateUtils';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { PlanetaryAspect } from '@/types/celestial';

// Default placeholder for planetary positions
const getDefaultPlanetaryPositions = () => {
  try {
    // Try to get more accurate positions from reliable astronomy utilities
    const { getReliablePlanetaryPositions } = require('@/utils/reliableAstronomy');
    const positions = getReliablePlanetaryPositions();
    
    if (positions && Object.keys(positions).length > 0) {
      return positions;
    }
  } catch (error) {
    // console.error('Error getting reliable positions, using fallback:', error);
  }
  
  // Fallback to hardcoded values if reliable calculation fails
  return {
    sun: { sign: 'aries', degree: 0, exactLongitude: 0 },
    moon: { sign: 'taurus', degree: 5, exactLongitude: 35 },
    mercury: { sign: 'pisces', degree: 15, exactLongitude: 345 },
    venus: { sign: 'aquarius', degree: 10, exactLongitude: 310 },
    mars: { sign: 'capricorn', degree: 20, exactLongitude: 290 },
    jupiter: { sign: 'sagittarius', degree: 25, exactLongitude: 265 },
    saturn: { sign: 'Libra', degree: 15, exactLongitude: 195 },
    ascendant: { sign: 'Libra', degree: 0, exactLongitude: 180 }
  };
};

// Removed local PlanetaryAspect interface - now using authoritative definition from @/types/celestial

export interface ChartData {
  planetaryPositions: Record<string, unknown>;
  ascendant?: string;
  midheaven?: string;
  planets: Record<string, {
    sign: string;
    degree: number;
    isRetrograde?: boolean;
    exactLongitude?: number;
  }>;
  houses?: Record<number, {
    sign: string;
    degree: number;
  }>;
}

interface CurrentChart {
  planetaryPositions: Record<string, unknown>;
  aspects: PlanetaryAspect[];
  currentSeason: string;
  lastUpdated: Date;
  stelliums: Record<string, string[]>;
  houseEffects: Record<string, number>;
  elementalEffects?: Record<string, number>;
}

interface CurrentChartContextType {
  chart: CurrentChart;
  loading: boolean;
  error: string | null;
  refreshChart: () => Promise<void>;
  createChartSvg: () => {
    planetPositions: Record<string, unknown>;
    ascendantSign: string;
    svgContent: string;
  };
}

const CurrentChartContext = createContext<CurrentChartContextType | null>(null);

export const CurrentChartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { planetaryPositions: alchemicalPositions } = useAlchemical();
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

  const calculateStelliums = (positions: Record<string, unknown>): Record<string, string[]> => {
    const signGroups: Record<string, string[]> = {};
    Object.entries(positions).forEach(([planet, data]) => {
      const planetData = data as unknown;
      if (planet === 'ascendant' || !data || !planetData?.sign) return;
      
      const sign = planetData.sign;
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

  const calculateHouseEffects = (positions: Record<string, unknown>): Record<string, number> => {
    const houseEffects: Record<string, number> = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };

    Object.entries(positions).forEach(([planet, data]) => {
      const planetData = data as unknown;
      if (planet === 'ascendant' || !data || !planetData?.sign) return;
      
      const sign = planetData.sign;
      const element = getElementFromSign(sign);
      if (element) {
        houseEffects[element] += 1;
      }
    });

    return houseEffects;
  };

  const getElementFromSign = (sign: string): string => {
    const fireElements = ['aries', 'leo', 'sagittarius'];
    const earthElements = ['taurus', 'virgo', 'capricorn'];
    const airElements = ['gemini', 'Libra', 'aquarius'];
    const waterElements = ['cancer', 'Scorpio', 'pisces'];
    
    if (fireElements.includes(sign)) return 'Fire';
    if (earthElements.includes(sign)) return 'Earth';
    if (airElements.includes(sign)) return 'Air';
    if (waterElements.includes(sign)) return 'Water';
    return 'Fire'; // Default
  };

  const getSignFromDegree = (degree: number): string => {
    const signIndex = Math.floor(degree / 30);
    return [
      'aries', 'taurus', 'gemini', 'cancer', 
      'leo', 'virgo', 'Libra', 'Scorpio',
      'sagittarius', 'capricorn', 'aquarius', 'pisces'
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
      // console.log('Refreshing chart...');
      
      // Use alchemicalPositions if available, otherwise calculate new positions
      let positions = {};
      if (alchemicalPositions && Object.keys(alchemicalPositions).length > 0) {
        positions = alchemicalPositions;
        // console.log('Using positions from AlchemicalContext');
      } else {
        try {
          positions = await calculatePlanetaryPositions();
          // console.log('Successfully calculated planetary positions');
        } catch (posError) {
          // console.error('Error calculating planetary positions:', posError);
          // Use default positions as fallback
          positions = getDefaultPlanetaryPositions();
        }
      }
      
      // Validate positions before calculating aspects
      if (!positions || Object.keys(positions).length === 0) {
        throw new Error("Unable to calculate planetary positions");
      }
      
      // Calculate derived data
      const { aspects, elementalEffects } = calculateAspects(positions);
      const season = getCurrentSeason();
      const stelliums = calculateStelliums(positions);
      const houseEffects = calculateHouseEffects(positions);
      
      setChart({
        planetaryPositions: positions,
        aspects,
        elementalEffects,
        currentSeason: _season,
        lastUpdated: new Date(),
        stelliums,
        houseEffects
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chart');
      // console.error('Error updating chart:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChartSvg = () => {
    // Convert chart data to the format expected by components
    const formattedPlanets: Record<string, unknown> = {};
    Object.entries(chart.planetaryPositions).forEach(([key, data]) => {
      if (key === 'ascendant') return;
      
      const planetData = data as unknown;
      const planetName = key.charAt(0).toUpperCase() + key.slice(1);
      formattedPlanets[planetName] = {
        sign: planetData?.sign || 'Unknown',
        degree: planetData?.degree || 0,
        isRetrograde: planetData?.isRetrograde || false,
        exactLongitude: planetData?.exactLongitude || 0,
      };
    });
    
    // Create a basic SVG representation
    const ascendantData = chart.planetaryPositions.ascendant as unknown;
    return {
      planetPositions: formattedPlanets,
      ascendantSign: ascendantData?.sign || 'Libra',
      svgContent: `<svg width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#333" stroke-width="1"/>
        <text x="150" y="20" text-anchor="middle">Current Chart</text>
        ${Object.entries(formattedPlanets).map(([planet, data], index) => {
          const planetInfo = data as unknown;
          const angle = (index * 30) % 360;
          const x = 150 + 120 * Math.cos(angle * Math.PI / 180);
          const y = 150 + 120 * Math.sin(angle * Math.PI / 180);
          return `<text x="${x}" y="${y}" text-anchor="middle">${planet}: ${planetInfo?.sign}</text>`;
        }).join('')}
      </svg>`
    };
  };

  useEffect(() => {
    refreshChart();
  }, [alchemicalPositions]);

  return (
    <CurrentChartContext.Provider value={{ chart, loading, error, refreshChart, createChartSvg }}>
      {children}
    </CurrentChartContext.Provider>
  );
};

export const useCurrentChart = () => {
  const context = useContext(CurrentChartContext);
  if (!context) {
    throw new Error('useCurrentChart must be used within a CurrentChartProvider');
  }
  
  // Return the same interface that standalone hook would return for compatibility
  const ascendantData = context.chart.planetaryPositions.ascendant as unknown;
  return {
    chartData: {
      planets: Object.entries(context.chart.planetaryPositions).reduce((acc, [key, data]) => {
        if (key === 'ascendant') return acc;
        const planetData = data as unknown;
        const planetName = key.charAt(0).toUpperCase() + key.slice(1);
        acc[planetName] = {
          sign: planetData?.sign || 'Unknown',
          degree: planetData?.degree || 0,
          isRetrograde: planetData?.isRetrograde || false,
          exactLongitude: planetData?.exactLongitude || 0,
        };
        return acc;
      }, {} as Record<string, unknown>),
      ascendant: ascendantData?.sign
    },
    createChartSvg: context.createChartSvg,
    isLoading: context.loading,
    error: context.error,
    refreshChart: context.refreshChart
  };
}; 