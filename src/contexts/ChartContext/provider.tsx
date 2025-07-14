'use client';

import React, { useState, useEffect } from 'react';
import { ChartContext } from './context';
import { CurrentChart } from './types';
import { _calculatePlanetaryPositions, calculateAspects } from '@/utils/astrologyUtils';
import { getCurrentSeason } from '@/utils/dateUtils';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

// Default placeholder for planetary positions
const getDefaultPlanetaryPositions = () => ({
  sun: { sign: 'aries', degree: 0, exactLongitude: 0 },
  moon: { sign: 'taurus', degree: 5, exactLongitude: 35 },
  mercury: { sign: 'pisces', degree: 15, exactLongitude: 345 },
  venus: { sign: 'aquarius', degree: 10, exactLongitude: 310 },
  mars: { sign: 'capricorn', degree: 20, exactLongitude: 290 },
  jupiter: { sign: 'sagittarius', degree: 25, exactLongitude: 265 },
  saturn: { sign: 'Libra', degree: 15, exactLongitude: 195 },
  ascendant: { sign: 'Libra', degree: 0, exactLongitude: 180 }
});

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

  const calculateStelliums = (positions: Record<string, unknown>): Record<string, string[]> => {
    const signGroups: Record<string, string[]> = {};
    Object.entries(positions).forEach(([planet, data]) => {
      if (planet === 'ascendant' || !data) return;
      
      // Use safe type casting for planetary data access
      const planetData = data as Record<string, unknown>;
      if (!planetData?.sign) return;
      
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
      const planetData = data as Record<string, unknown>;
      if (!planetData?.sign) return;
      
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
          positions = await _calculatePlanetaryPositions();
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
        currentSeason: season,
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
      
      // Use safe type casting for planetary data access
      const planetData = data as Record<string, unknown>;
      
      const planetName = key.charAt(0).toUpperCase() + key.slice(1);
      formattedPlanets[planetName] = {
        sign: planetData?.sign || 'Unknown',
        degree: planetData?.degree || 0,
        isRetrograde: planetData?.isRetrograde || false,
        exactLongitude: planetData?.exactLongitude || 0,
      };
    });
    
    // Create a basic SVG representation  
    return {
      planetPositions: formattedPlanets,
      ascendantSign: (chart.planetaryPositions.ascendant as Record<string, unknown>)?.sign || 'Libra',
      svgContent: `<svg width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#333" stroke-width="1"/>
        <text x="150" y="20" text-anchor="middle">Current Chart</text>
        ${Object.entries(formattedPlanets).map(([planet, data], index) => {
          const angle = (index * 30) % 360;
          const x = 150 + 120 * Math.cos(angle * Math.PI / 180);
          const y = 150 + 120 * Math.sin(angle * Math.PI / 180);
          const planetInfo = data as Record<string, unknown>;
          return `<text x="${x}" y="${y}" text-anchor="middle">${planet}: ${planetInfo?.sign}</text>`;
        }).join('')}
      </svg>`
    };
  };

  useEffect(() => {
    refreshChart();
  }, [alchemicalPositions]);

  return (
    <ChartContext.Provider value={{ chart, loading, error, refreshChart, createChartSvg }}>
      {children}
    </ChartContext.Provider>
  );
}; 