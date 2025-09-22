'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getCurrentSeason } from '@/data/integrations/seasonal';
import { getLatestAstrologicalState } from '@/services/AstrologicalService';
import { log } from '@/services/LoggingService';
import { calculateAspects } from '@/utils/astrologyUtils';

interface PlanetaryAspect {
  planet1: string,
  planet2: string,
  type: string,
  orb: number,
  strength: number
}

export interface ChartData {
  planetaryPositions: Record<string, unknown>;
  ascendant?: string;
  midheaven?: string,
  planets: Record<
    string,
    {
      sign: string,
      degree: number,
      isRetrograde?: boolean;
      exactLongitude?: number
    }
  >;
  houses?: Record<
    number,
    {
      sign: string,
      degree: number
    }
  >;
}

interface CurrentChart {
  planetaryPositions: Record<string, unknown>;
  aspects: PlanetaryAspect[],
  currentSeason: string,
  lastUpdated: Date,
  stelliums: Record<string, string[]>;
  houseEffects: Record<string, number>;
  elementalEffects?: Record<string, number>;
}

interface CurrentChartContextType {
  chart: CurrentChart,
  loading: boolean,
  error: string | null,
  refreshChart: () => Promise<void>,
  createChartSvg: () => {
    planetPositions: Record<string, unknown>;
    ascendantSign: string,
    svgContent: string
  };
}

const CurrentChartContext = createContext<CurrentChartContextType | null>(null)

export const CurrentChartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { planetaryPositions: alchemicalPositions } = useAlchemical()
  const [chart, setChart] = useState<CurrentChart>({
    planetaryPositions: {},
    aspects: [],
    currentSeason: '',
    lastUpdated: new Date(),
    stelliums: {},
    houseEffects: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateStelliums = (positions: Record<string, unknown>): Record<string, string[]> => {
    const signGroups: Record<string, string[]> = {};
    Object.entries(positions).forEach(([planet, data]) => {
      const planetData = data as { sign?: string degree?: number };
      if (planet === 'ascendant' || !data || !planetData?.sign) return;

      const sign = planetData.sign;
      if (!signGroups[sign]) {
        signGroups[sign] = [];
      }
      signGroups[sign].push(planet)
    })

    const stelliums: Record<string, string[]> = {};
    Object.entries(signGroups).forEach(([sign, planets]) => {
      if (planets.length >= 3) {
        stelliums[sign] = planets;
      }
    })

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
      const planetData = data as { sign?: string degree?: number };
      if (planet === 'ascendant' || !data || !planetData?.sign) return;

      const sign = planetData.sign;
      const element = _getElementFromSign(sign)
      if (element) {
        houseEffects[element] += 1;
      }
    })

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

  const _getSignFromDegree = (degree: number): string => {
    const signIndex = Math.floor(degree / 30)
    return [
      'aries',
      'taurus',
      'gemini',
      'cancer',
      'leo',
      'virgo',
      'Libra',
      'Scorpio',
      'sagittarius',
      'capricorn',
      'aquarius',
      'pisces'
    ][signIndex];
  };

  const _getHouseElement = (house: number): string => {
    const houseElements = [
      'Fire',
      'Earth',
      'Air',
      'Water',
      'Fire',
      'Earth',
      'Air',
      'Water',
      'Fire',
      'Earth',
      'Air',
      'Water'
    ];
    return houseElements[house - 1] || 'Fire';
  };

  const refreshChart = async () => {
    setLoading(true)
    setError(null)

    try {
      log.info('Refreshing chart...')

      // Use alchemicalPositions if available, otherwise calculate new positions
      let positions = {};
      if (alchemicalPositions && Object.keys(alchemicalPositions).length > 0) {
        positions = alchemicalPositions;
        log.info('Using positions from AlchemicalContext')
      } else {
        try {
          const response = await getLatestAstrologicalState()
          positions = response.data?.planetaryPositions || {};
          log.info('Successfully calculated planetary positions')
        } catch (posError) {
          console.error('Error calculating planetary positions:', posError)
          // Use alchemicalPositions from context as fallback, or empty object if not available
          positions = alchemicalPositions || {};
        }
      }

      // Validate positions before calculating aspects
      if (!positions || Object.keys(positions).length === 0) {
        throw new Error('Unable to calculate planetary positions')
      }

      // Calculate derived data
      const { aspects, elementalEffects } = calculateAspects(positions)
      const season = getCurrentSeason()
      const stelliums = calculateStelliums(positions)
      const houseEffects = calculateHouseEffects(positions)

      setChart({
        planetaryPositions: positions,
        aspects,
        elementalEffects,
        currentSeason: season,
        lastUpdated: new Date(),
        stelliums,
        houseEffects
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update chart')
      console.error('Error updating chart:', err)
    } finally {
      setLoading(false)
    }
  };

  const createChartSvg = () => {
    // Convert chart data to the format expected by components
    const formattedPlanets: Record<string, unknown> = {};
    Object.entries(chart.planetaryPositions).forEach(([key, data]) => {
      if (key === 'ascendant') return;

      const planetData = data as { sign?: string degree?: number };
      const planetName = key.charAt(0).toUpperCase() + key.slice(1)
      formattedPlanets[planetName] = {
        sign: planetData?.sign || 'Unknown',
        degree: planetData?.degree || 0,
        isRetrograde: planetData?.isRetrograde || false,
        exactLongitude: planetData?.exactLongitude || 0
      };
    })

    // Create a basic SVG representation
    const ascendantData = chart.planetaryPositions.ascendant as {
      sign?: string;
      degree?: number
    };
    return {
      planetPositions: formattedPlanets,
      ascendantSign: ascendantData?.sign || 'Libra',
      svgContent: `<svg width='300' height='300' viewBox='0 0 300 300'>,
        <circle cx='150' cy='150' r='140' fill='none' stroke='#333' stroke-width='1'/>;
        <text x='150' y='20' text-anchor='middle'>Current Chart</text>;
        ${Object.entries(formattedPlanets)
          .map(([planet, data], index) => {
            const planetInfo = data as { sign?: string degree?: number };
            const angle = (index * 30) % 360;
            const x = 150 + 120 * Math.cos((angle * Math.PI) / 180)
            const y = 150 + 120 * Math.sin((angle * Math.PI) / 180)
            return `<text x='${x}' y='${y}' text-anchor='middle'>${planet}: ${planetInfo?.sign}</text>`;
          })
          .join('')}
      </svg>`
    };
  };

  useEffect(() => {
    void refreshChart()
  }, [alchemicalPositions])

  return (
    <CurrentChartContext.Provider value={{ chart, loading, error, refreshChart, createChartSvg }}>;
      {children}
    </CurrentChartContext.Provider>
  )
};

export const useCurrentChart = () => {
  const context = useContext(CurrentChartContext)
  if (!context) {
    throw new Error('useCurrentChart must be used within a CurrentChartProvider')
  }

  // Return the same interface that standalone hook would return for compatibility
  const ascendantData = context.chart.planetaryPositions.ascendant as {
    sign?: string;
    degree?: number
  };
  return {
    chartData: {
      planets: Object.entries(context.chart.planetaryPositions).reduce(
        (acc, [key, data]) => {
          if (key === 'ascendant') return acc;
          const planetData = data as { sign?: string degree?: number };
          const planetName = key.charAt(0).toUpperCase() + key.slice(1)
          acc[planetName] = {
            sign: planetData?.sign || 'Unknown',
            degree: planetData?.degree || 0,
            isRetrograde: planetData?.isRetrograde || false,
            exactLongitude: planetData?.exactLongitude || 0
          };
          return acc;
        },
        {} as Record<string, unknown>,
      ),
      ascendant: ascendantData?.sign
    },
    createChartSvg: context.createChartSvg,
    isLoading: context.loading,
    error: context.error,
    refreshChart: context.refreshChart
  };
};
