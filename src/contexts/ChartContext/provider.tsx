'use client';

import React, { useState, useEffect } from 'react';


import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getCurrentSeason } from '@/data/integrations/seasonal';
import { getLatestAstrologicalState } from '@/services/AstrologicalService';
import { log } from '@/services/LoggingService';
import { calculatePlanetaryPositions, calculateAspects } from '@/utils/astrologyUtils';

import { ChartContext } from './context';
import { CurrentChart } from './types';

// Phase 5: Type-safe interfaces for planetary data access
interface SafePlanetaryData {
  sign?: string;
  degree?: number;
  isRetrograde?: boolean;
  exactLongitude?: number;
  [key: string]: unknown;
}

interface SafePlanetaryPositions {
  [key: string]: SafePlanetaryData;
}

export const ChartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
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

  // Safe helper function for planetary data access
  const getSafePlanetaryData = (data: unknown): SafePlanetaryData => {
    if (!data || typeof data !== 'object') {
      return {};
    }
    return data as SafePlanetaryData;
  };

  const calculateStelliums = (positions: Record<string, unknown>): Record<string, string[]> => {
    const signGroups: Record<string, string[]> = {};
    Object.entries(positions).forEach(([planet, data]) => {
      if (planet === 'ascendant' || !data) return;
      
      // Use safe type casting for planetary data access
      const planetData = getSafePlanetaryData(data);
      if (!planetData.sign) return;
      
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
      if (planet === 'ascendant' || !data) return;
      
      // Use safe type casting for planetary data access  
      const planetData = getSafePlanetaryData(data);
      if (!planetData.sign) return;
      
      const sign = planetData.sign;
      const element = getElementFromSign(sign);
      if (element) {
        houseEffects[element] += 1;
      }
    });

    return houseEffects;
  };

  const _getElementFromSign = (sign: string): string => {
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

  const refreshChart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      log.info('Refreshing chart...');
      
      // Use alchemicalPositions if available, otherwise calculate new positions
      let positions = {};
      if (alchemicalPositions && Object.keys(alchemicalPositions).length > 0) {
        positions = alchemicalPositions;
        log.info('Using positions from AlchemicalContext');
      } else {
        try {
          const astroResponse = await getLatestAstrologicalState();
          if (astroResponse.success && astroResponse.data) {
            positions = astroResponse.data.planetaryPositions;
            log.info('Successfully calculated planetary positions');
          } else {
            console.error('Astrological service returned error:', astroResponse.error);
            positions = alchemicalPositions || {};
          }
        } catch (posError) {
          console.error('Error calculating planetary positions:', posError);
          // Use alchemicalPositions from context as fallback, or empty object if not available
          positions = alchemicalPositions || {};
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

  const createChartSvg = () => {
    // Convert chart data to the format expected by components
    const formattedPlanets: Record<string, SafePlanetaryData> = {};
    Object.entries(chart.planetaryPositions).forEach(([key, data]) => {
      if (key === 'ascendant') return;
      
      // Use safe type casting for planetary data access
      const planetData = getSafePlanetaryData(data);
      
      const planetName = key.charAt(0).toUpperCase() + key.slice(1);
      formattedPlanets[planetName] = {
        sign: planetData.sign || 'Unknown',
        degree: planetData.degree || 0,
        isRetrograde: planetData.isRetrograde || false,
        exactLongitude: planetData.exactLongitude || 0,
      };
    });
    
    // Get ascendant data safely
    const ascendantData = getSafePlanetaryData(chart.planetaryPositions.ascendant);
    
    // Create a basic SVG representation  
    return {
      planetPositions: formattedPlanets,
      ascendantSign: ascendantData.sign || 'Libra',
      svgContent: `<svg width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#333" stroke-width="1"/>
        <text x="150" y="20" text-anchor="middle">Current Chart</text>
        ${Object.entries(formattedPlanets).map(([planet, planetInfo], index) => {
          const angle = (index * 30) % 360;
          const x = 150 + 120 * Math.cos(angle * Math.PI / 180);
          const y = 150 + 120 * Math.sin(angle * Math.PI / 180);
          return `<text x="${x}" y="${y}" text-anchor="middle">${planet}: ${planetInfo.sign}</text>`;
        }).join('')}
      </svg>`
    };
  };

  useEffect(() => {
    void refreshChart();
  }, [alchemicalPositions]);

  return (
    <ChartContext.Provider value={{ chart, loading, error, refreshChart, createChartSvg }}>
      {children}
    </ChartContext.Provider>
  );
}; 