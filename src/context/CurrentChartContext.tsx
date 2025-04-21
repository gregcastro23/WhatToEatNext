"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculatePlanetaryPositions, calculateAspects, longitudeToZodiacPosition, getPlanetaryDignity } from '../utils/astrologyUtils';
import { getCurrentSeason } from '../data/integrations/seasonal';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { CurrentChart, ChartContextType, PlanetaryPositions, isPlanetaryPosition } from '../types/chart';

// Default placeholder for planetary positions
const getDefaultPlanetaryPositions = (): PlanetaryPositions => {
  try {
    // Try to get more accurate positions from reliable astronomy utilities
    const { getReliablePlanetaryPositions } = require('@/utils/reliableAstronomy');
    const positions = getReliablePlanetaryPositions();
    
    if (positions && Object.keys(positions).length > 0) {
      return positions as PlanetaryPositions;
    }
  } catch (error) {
    console.error('Error getting reliable positions, using fallback:', error);
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

interface PlanetaryAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  strength: number;
}

export interface ChartData {
  planetaryPositions: PlanetaryPositions;
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

const CurrentChartContext = createContext<ChartContextType | null>(null);

export const CurrentChartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { planetaryPositions: alchemicalPositions, state } = useAlchemical();
  const [chart, setChart] = useState<CurrentChart>({
    planetaryPositions: {},
    aspects: [],
    currentSeason: '',
    lastUpdated: new Date(),
    stelliums: {},
    houseEffects: {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    },
    alchemicalTokens: {
      Spirit: 0.25,
      Essence: 0.25,
      Matter: 0.25,
      Substance: 0.25
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStelliums = (positions: PlanetaryPositions) => {
    const signGroups: Record<string, string[]> = {};
    
    Object.entries(positions).forEach(([planet, data]) => {
      if (planet === 'ascendant' || !data) return;
      
      if (isPlanetaryPosition(data)) {
        const sign = data.sign;
        if (!signGroups[sign]) {
          signGroups[sign] = [];
        }
        signGroups[sign].push(planet);
      }
    });

    const stelliums: Record<string, string[]> = {};
    Object.entries(signGroups).forEach(([sign, planets]) => {
      if (planets.length >= 3) {
        stelliums[sign] = planets;
      }
    });

    return stelliums;
  };

  const calculateHouseEffects = (positions: PlanetaryPositions) => {
    const houseEffects = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };

    Object.entries(positions).forEach(([planet, data]) => {
      if (planet === 'ascendant' || !data) return;
      
      if (isPlanetaryPosition(data)) {
        const sign = data.sign;
        const element = getElementFromSign(sign);
        if (element) {
          houseEffects[element] += 1;
        }
      }
    });

    return houseEffects;
  };

  const getElementFromSign = (sign: string): string => {
    const fireElements = ['aries', 'leo', 'sagittarius'];
    const earthElements = ['taurus', 'virgo', 'capricorn'];
    const airElements = ['gemini', 'Libra', 'aquarius'];
    const waterElements = ['cancer', 'Scorpio', 'pisces'];
    
    sign = sign.toLowerCase();
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
      'leo', 'virgo', 'libra', 'scorpio',
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
      console.log('Refreshing chart...');
      
      // Use alchemicalPositions if available, otherwise calculate new positions
      let positions: PlanetaryPositions = {};
      if (alchemicalPositions && Object.keys(alchemicalPositions).length > 0) {
        positions = alchemicalPositions as PlanetaryPositions;
        console.log('Using positions from AlchemicalContext');
      } else {
        try {
          positions = await calculatePlanetaryPositions() as PlanetaryPositions;
          console.log('Successfully calculated planetary positions');
        } catch (posError) {
          console.error('Error calculating planetary positions:', posError);
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
      
      // Use alchemical values from the state object
      setChart({
        planetaryPositions: positions,
        aspects,
        elementalEffects: elementalEffects || {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0
        },
        currentSeason: season,
        lastUpdated: new Date(),
        stelliums,
        houseEffects,
        alchemicalTokens: state?.alchemicalValues || {
          Spirit: 0.25,
          Essence: 0.25,
          Matter: 0.25,
          Substance: 0.25
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chart');
      console.error('Error updating chart:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChartSvg = () => {
    // Convert chart data to the format expected by components
    const formattedPlanets: PlanetaryPositions = {};
    Object.entries(chart.planetaryPositions).forEach(([key, data]) => {
      if (key === 'ascendant') return;
      
      if (isPlanetaryPosition(data)) {
        const planetName = key.toLowerCase();
        formattedPlanets[planetName] = {
          sign: data.sign?.toLowerCase() || 'unknown',
          degree: data.degree || 0,
          isRetrograde: data.isRetrograde || false,
          exactLongitude: data.exactLongitude || 0,
        };
      }
    });

    // Get ascendant sign
    const ascendantSign = chart.planetaryPositions.ascendant?.sign || 'aries';
    
    // Create a basic SVG representation
    const svgWidth = 500;
    const svgHeight = 500;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Create the wheel
    let svgContent = `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" stroke="black" fill="white" stroke-width="1" />
    `;
    
    // Draw the 12 sections for zodiac signs
    for (let i = 0; i < 12; i++) {
      const angle = i * (Math.PI / 6);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      svgContent += `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="black" stroke-width="1" />`;
    }
    
    // Add positions for planets
    Object.entries(formattedPlanets).forEach(([planet, data], index) => {
      if (!data.exactLongitude) return;
      
      const angle = (data.exactLongitude / 180) * Math.PI;
      const distance = radius * 0.7; // Place planets 70% from center
      const x = centerX + distance * Math.cos(angle);
      const y = centerY + distance * Math.sin(angle);
      
      // Add a circle for the planet
      svgContent += `
        <circle cx="${x}" cy="${y}" r="5" fill="blue" />
        <text x="${x + 7}" y="${y + 5}" font-size="10">${planet}</text>
      `;
    });
    
    // Close the SVG
    svgContent += `</svg>`;
    
    return {
      planetPositions: formattedPlanets,
      ascendantSign,
      svgContent
    };
  };

  useEffect(() => {
    refreshChart();
  }, [alchemicalPositions]); // Refresh when alchemical positions change

  const contextValue: ChartContextType = {
    chart,
    loading,
    error,
    refreshChart,
    createChartSvg
  };

  return (
    <CurrentChartContext.Provider value={contextValue}>
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
  return {
    chartData: {
      planets: Object.entries(context.chart.planetaryPositions).reduce((acc, [key, data]) => {
        if (key === 'ascendant' || !isPlanetaryPosition(data)) return acc;
        
        const planetName = key.toLowerCase();
        acc[planetName] = {
          sign: data.sign?.toLowerCase() || 'unknown',
          degree: data.degree || 0,
          isRetrograde: data.isRetrograde || false,
          exactLongitude: data.exactLongitude || 0,
        };
        return acc;
      }, {} as Record<string, unknown>),
      ascendant: context.chart.planetaryPositions.ascendant?.sign?.toLowerCase()
    },
    createChartSvg: context.createChartSvg,
    isLoading: context.loading,
    error: context.error,
    refreshChart: context.refreshChart
  };
}; 