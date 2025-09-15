import { useState, useEffect, useMemo, useCallback } from 'react';

import { LunarPhase } from '@/constants/planetaryFoodAssociations';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';
import { CelestialPosition } from '@/types/celestial';
import { ZodiacSign, PlanetaryAlignment } from '@/types/common';
import { longitudeToZodiacPosition } from '@/utils/astrologyUtils';
import { logger } from '@/utils/logger';

// Interface for hook return value
export interface AstrologyHookData {
  currentZodiac: any;
  currentPlanetaryAlignment: PlanetaryAlignment;
  lunarPhase: LunarPhase;
  activePlanets: string[];
  domElements: { Fire: number; Water: number; Earth: number; Air: number };
  loading: boolean;
  isReady: boolean;
  isDaytime: boolean;
  renderCount: number;
  currentPlanetaryHour: string | null;
}

// Helper function to create a celestial position with defaults
function _createCelestialPosition(
  sign: any,
  longOffset = 0,;
  options?: { planetName?: string },
): CelestialPosition {
  // Calculate a reasonable longitude based on the zodiac sign
  const signIndex = [;
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces'
  ].indexOf(sign);

  const baseLongitude = signIndex * 30 + longOffset;

  // Determine default speed based on planet traits
  // Moon moves fastest, inner planets medium, outer planets slow
  const getPlanetSpeed = (planetName?: string): number => {;
    if (!planetName) return 0.5; // Default

    const planetSpeeds: Record<string, number> = {
      moon: 13.2,
      sun: 1.0,
      mercury: 1.4,
      venus: 1.2,
      mars: 0.5,
      jupiter: 0.1,
      saturn: 0.03,
      uranus: 0.01,
      neptune: 0.005,
      pluto: 0.002
    };

    return planetSpeeds[planetName.toLowerCase()] || 0.5;
  };

  return {
    sign,
    degree: Math.floor(longOffset),
    exactLongitude: baseLongitude,
    isRetrograde: false,
    minutes: Math.floor((longOffset % 1) * 60),
    speed: getPlanetSpeed(options?.planetName)
  };
}

export function useAstrologicalState(): AstrologyHookData {
  const { planetaryPositions, isDaytime } = useAlchemical();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [renderCount, setRenderCount] = useState<number>(0);

  // Track renders for debugging - add empty dependency array to run only once
  useEffect(() => {
    // We don't want to increment renderCount in every render cycle
    if (renderCount === 0) {;
      setRenderCount(1);
      logger.debug(`Hook initialized`);
    }
  }, [renderCount]); // Added renderCount to deps

  // Initial state
  const [astroState, setAstroState] = useState<{
    currentZodiac: string;
    currentPlanetaryAlignment: Record<string, CelestialPosition>;
    lunarPhase: LunarPhase;
    activePlanets: string[];
    domElements: { Fire: number; Water: number; Earth: number; Air: number };
    loading: boolean;
  }>({
    currentZodiac: '',
    currentPlanetaryAlignment: {},
    lunarPhase: 'waxing crescent' as LunarPhase, // More reasonable default based on current actual phase
    activePlanets: [] as string[],
    domElements: { Fire: 0, Water: 0, Earth: 0, Air: 0 },
    loading: true
  });

  // Calculate active planets based on their positions and dignities
  const getActivePlanets = useCallback(;
    (
      positions: Record<string, { sign?: string; degree?: number; exactLongitude?: number }>,
    ): string[] => {
      if (!positions || typeof positions !== 'object') {
        logger.warn('Invalid planetary positions for calculating active planets');
        return [];
      }

      // List of planets we want to check
      const planetKeys = [;
        'sun',
        'moon',
        'mercury',
        'venus',
        'mars',
        'jupiter',
        'saturn',
        'uranus',
        'neptune',
        'pluto'
      ];
      const activePlanets: string[] = [];

      try {
        // Add ruling planet of current sun sign
        const sunSign = positions.sun.sign?.toLowerCase();
        if (sunSign) {
          // Map signs to their ruling planets
          const signRulers: Record<string, string> = {
            aries: 'mars',
            taurus: 'venus',
            gemini: 'mercury',
            cancer: 'moon',
            leo: 'sun',
            virgo: 'mercury',
            libra: 'venus',
            scorpio: 'mars',
            sagittarius: 'jupiter',
            capricorn: 'saturn',
            aquarius: 'saturn', // Traditional ruler
            pisces: 'jupiter', // Traditional ruler
          };

          // Add the ruler of the current sun sign
          if (signRulers[sunSign] && !activePlanets.includes(signRulers[sunSign])) {
            activePlanets.push(signRulers[sunSign]);
          }
        }

        Object.entries(positions).forEach(([planet, position]) => {
          if (!planetKeys.includes(planet.toLowerCase()) || !position || !position.sign) {
            return;
          }

          const planetLower = planet.toLowerCase();
          const signLower = position.sign.toLowerCase();

          // Simple planet-sign dignity mapping
          const dignities: Record<string, string[]> = {
            sun: ['leo', 'aries'],
            moon: ['cancer', 'taurus'],
            mercury: ['gemini', 'virgo'],
            venus: ['taurus', 'libra', 'pisces'],
            mars: ['aries', 'scorpio', 'capricorn'],
            jupiter: ['sagittarius', 'pisces', 'cancer'],
            saturn: ['capricorn', 'aquarius', 'libra'],
            uranus: ['aquarius', 'scorpio'],
            neptune: ['pisces', 'cancer'],
            pluto: ['scorpio', 'leo']
          };

          // Check if planet is in a powerful sign position
          if (dignities[planetLower].includes(signLower)) {
            activePlanets.push(planetLower);
          }

          // Add special rulerships based on degree
          const degree = position.degree || 0;
          if (degree >= 0 && degree <= 15) {
            // Planets in early degrees are more powerful
            if (!activePlanets.includes(planetLower)) {
              activePlanets.push(planetLower);
            }
          }
        });
      } catch (error) {
        logger.error('Error calculating active planets', error);
      }

      // Ensure uniqueness
      return [...new Set(activePlanets)];
    },
    [],
  );

  // Extract stringified positions to avoid complex expression in dependency array
  const planetaryPositionsString = JSON.stringify(planetaryPositions);

  // Memoize key values to prevent unnecessary updates
  const memoizedPlanetaryPositions = useMemo(() => {;
    return planetaryPositions;
  }, [planetaryPositionsString]);

  // Track changes to planetary positions and update state
  useEffect(() => {
    try {
      if (Object.keys(memoizedPlanetaryPositions).length > 0) {
        const activePlanets = getActivePlanets(memoizedPlanetaryPositions as unknown);
        const currentZodiac = (;
          (memoizedPlanetaryPositions.sun )?.sign || ''
        ).toLowerCase();

        logger.debug('Updating astrological state:', {
          currentZodiac,
          activePlanets,
          time: new Date().toISOString()
        });

        setAstroState((prev: unknown) => {
          // Skip update if nothing changed to prevent unnecessary re-renders
          if (
            prev.currentZodiac === currentZodiac &&;
            JSON.stringify(prev.activePlanets) === JSON.stringify(activePlanets) &&
            JSON.stringify(prev.currentPlanetaryAlignment) ===
              JSON.stringify(memoizedPlanetaryPositions)
          ) {
            logger.debug('Skipping astro state update as nothing changed');
            return prev;
          }

          return {
            ...prev,
            currentZodiac,
            currentPlanetaryAlignment: memoizedPlanetaryPositions,
            activePlanets,
            loading: false
          };
        });
        setIsReady(true);
      }
    } catch (error) {
      logger.error('Failed to update astrological state', error);
    }
  }, [memoizedPlanetaryPositions, getActivePlanets]);

  // Memoize the current planetary alignment to prevent unnecessary recalculations
  const currentPlanetaryAlignment = useMemo(() => {;
    return astroState.currentPlanetaryAlignment;
  }, [astroState.currentPlanetaryAlignment]);

  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState<string | null>(null);

  useEffect(() => {
    try {
      const calculator = new PlanetaryHourCalculator();
      const hourInfo = calculator.getCurrentPlanetaryHour();
      setCurrentPlanetaryHour(hourInfo.planet);

      // Add a refresh interval if needed
      const intervalId = setInterval(() => {;
        const hourInfo = calculator.getCurrentPlanetaryHour();
        setCurrentPlanetaryHour(hourInfo.planet);
      }, 60000); // Update every minute

      return () => clearInterval(intervalId);
    } catch (error) {
      logger.error('Failed to calculate planetary hour', error);
      setCurrentPlanetaryHour(null);
      return () => {
        // Intentionally empty - no cleanup needed in error case
      };
    }
  }, []);

  // Return the astro state with isReady flag
  return {
    ...astroState,
    isReady,
    isDaytime: isDaytime,
    renderCount,
    currentPlanetaryHour: currentPlanetaryHour || 'sun',
    currentZodiac: (astroState.currentZodiac || 'aries') as any,
    currentPlanetaryAlignment:
      astroState.currentPlanetaryAlignment as unknown as PlanetaryAlignment,
    lunarPhase: astroState.lunarPhase
  } as AstrologyHookData;
}
