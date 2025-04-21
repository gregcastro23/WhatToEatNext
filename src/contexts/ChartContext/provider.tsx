'use client';

import React, { useState, useEffect } from 'react';
import { ChartContext } from './context';
import { CurrentChart, PlanetaryPosition, PlanetaryPositions, isPlanetaryPosition, Stelliums } from './types';
import { calculatePlanetaryPositions, calculateAspects } from '../../utils/astrologyUtils';
import { getCurrentSeason } from '../../data/integrations/seasonal';
import { useAlchemical } from '../AlchemicalContext/hooks';
import { ElementalProperties } from '../../types/elements';

// Default placeholder for planetary positions
const getDefaultPlanetaryPositions = (): PlanetaryPositions => ({
  sun: { sign: 'aries', degree: 0, exactLongitude: 0 },
  moon: { sign: 'taurus', degree: 5, exactLongitude: 35 },
  mercury: { sign: 'pisces', degree: 15, exactLongitude: 345 },
  venus: { sign: 'aquarius', degree: 10, exactLongitude: 310 },
  mars: { sign: 'capricorn', degree: 20, exactLongitude: 290 },
  jupiter: { sign: 'sagittarius', degree: 25, exactLongitude: 265 },
  saturn: { sign: 'libra', degree: 15, exactLongitude: 195 },
  ascendant: { sign: 'libra', degree: 0, exactLongitude: 180 }
});

export const ChartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { planetaryPositions: alchemicalPositions } = useAlchemical();
  const [chart, setChart] = useState<CurrentChart>({
    planetaryPositions: getDefaultPlanetaryPositions(),
    aspects: [],
    currentSeason: '',
    lastUpdated: new Date(),
    stelliums: {},
    houseEffects: {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateStelliums = (positions: PlanetaryPositions): Stelliums => {
    const signGroups: Record<string, string[]> = {};
    Object.entries(positions).forEach(([planet, data]) => {
      if (planet === 'ascendant' || !data || !isPlanetaryPosition(data)) return;
      
      const sign = data.sign.toLowerCase();
      if (!signGroups[sign]) {
        signGroups[sign] = [];
      }
      signGroups[sign].push(planet);
    });

    const stelliums: Stelliums = {};
    Object.entries(signGroups).forEach(([sign, planets]) => {
      if (planets.length >= 3) {
        stelliums[sign] = planets;
      }
    });

    return stelliums;
  };

  const calculateHouseEffects = (positions: PlanetaryPositions): ElementalProperties => {
    const houseEffects: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Earth: 0,
      Air: 0
    };

    Object.entries(positions).forEach(([planet, data]) => {
      if (planet === 'ascendant' || !data || !isPlanetaryPosition(data)) return;
      
      const sign = data.sign.toLowerCase();
      const element = getElementFromSign(sign);
      if (element) {
        houseEffects[element] += 1;
      }
    });

    return houseEffects;
  };

  const getElementFromSign = (sign: string): keyof ElementalProperties | undefined => {
    sign = sign.toLowerCase();
    const fireElements = ['aries', 'leo', 'sagittarius'];
    const earthElements = ['taurus', 'virgo', 'capricorn'];
    const airElements = ['gemini', 'libra', 'aquarius'];
    const waterElements = ['cancer', 'scorpio', 'pisces'];
    
    if (fireElements.includes(sign)) return 'Fire';
    if (earthElements.includes(sign)) return 'Earth';
    if (airElements.includes(sign)) return 'Air';
    if (waterElements.includes(sign)) return 'Water';
    return undefined;
  };

  const refreshChart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Refreshing chart...');
      
      // Use alchemicalPositions if available, otherwise calculate new positions
      let positions: PlanetaryPositions = getDefaultPlanetaryPositions();
      
      if (alchemicalPositions && Object.keys(alchemicalPositions).length > 0) {
        // Ensure the alchemicalPositions conform to our type expectations
        const typedPositions: PlanetaryPositions = {};
        
        Object.entries(alchemicalPositions).forEach(([planet, data]) => {
          if (data && typeof data === 'object' && 'sign' in data && 'degree' in data) {
            typedPositions[planet] = {
              sign: String(data.sign),
              degree: Number(data.degree),
              isRetrograde: 'isRetrograde' in data ? Boolean(data.isRetrograde) : undefined,
              exactLongitude: 'exactLongitude' in data ? Number(data.exactLongitude) : undefined
            };
          }
        });
        
        positions = typedPositions;
        console.log('Using positions from AlchemicalContext');
      } else {
        try {
          const calculatedPositions = await calculatePlanetaryPositions();
          // Ensure calculated positions conform to our type expectations
          if (calculatedPositions && typeof calculatedPositions === 'object') {
            positions = calculatedPositions as PlanetaryPositions;
          }
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
    const formattedPlanets: PlanetaryPositions = {};
    Object.entries(chart.planetaryPositions).forEach(([key, data]) => {
      if (key === 'ascendant' || !data) return;
      
      const planetName = key.charAt(0).toUpperCase() + key.slice(1);
      formattedPlanets[planetName] = {
        sign: data.sign || 'Unknown',
        degree: data.degree || 0,
        isRetrograde: data.isRetrograde || false,
        exactLongitude: data.exactLongitude || 0,
      };
    });
    
    // Create a basic SVG representation
    return {
      planetPositions: formattedPlanets,
      ascendantSign: chart.planetaryPositions.ascendant?.sign || 'libra',
      svgContent: `<svg width="300" height="300" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="140" fill="none" stroke="#333" stroke-width="1"/>
        <text x="150" y="20" text-anchor="middle" font-size="12">Current Chart</text>
        ${Object.entries(formattedPlanets).map(([planet, data], index) => {
          const angle = (index * 30) % 360;
          const x = 150 + 120 * Math.cos(angle * Math.PI / 180);
          const y = 150 + 120 * Math.sin(angle * Math.PI / 180);
          return `<text x="${x}" y="${y}" text-anchor="middle" font-size="10">${planet.charAt(0)}</text>`;
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