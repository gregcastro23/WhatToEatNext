'use client';
import React, { useState, useEffect } from 'react';

import { PlanetaryHourCalculator } from '../lib/PlanetaryHourCalculator';

import useErrorHandler from './useErrorHandler';

interface PlanetaryHourData {
  currentPlanetaryHour: string,
  planetaryHourChakras: string[],
  isLoading: boolean,
  error: string | null,
}

/**
 * Hook to get the current planetary hour
 * @returns The current planetary hour and associated chakras
 */
export function usePlanetaryHour(): PlanetaryHourData {
  const [currentPlanetaryHour, setCurrentPlanetaryHour] = useState<string>('');
  const [planetaryHourChakras, setPlanetaryHourChakras] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { captureError } = useErrorHandler({ componentName: 'usePlanetaryHour' });

  useEffect(() => {
    const calculator = new PlanetaryHourCalculator();

    try {
      // Calculate the current planetary hour
      const now = new Date();
      const planetaryHour = calculator.calculatePlanetaryHour(now);
      setCurrentPlanetaryHour(planetaryHour);

      // Map to chakras - this could be replaced with actual logic
      const chakraMapping: Record<string, string[]> = {
        Sun: ['Crown', 'Solar Plexus'],
        Moon: ['Third Eye', 'Sacral'],
        Mercury: ['Throat', 'Root'],
        Venus: ['Heart', 'Sacral'],
        Mars: ['Root', 'Solar Plexus'],
        Jupiter: ['Crown', 'Heart'],
        Saturn: ['Root', 'Third Eye']
      };

      setPlanetaryHourChakras(chakraMapping[planetaryHour] || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error calculating planetary hour:', err);
      setError('Failed to calculate planetary hour');
      setIsLoading(false);
    }

    // Update every minute
    const intervalId = setInterval(() => {
      try {
        const now = new Date();
        const planetaryHour = calculator.calculatePlanetaryHour(now);
        setCurrentPlanetaryHour(planetaryHour);
      } catch (err) {
        console.error('Error updating planetary hour:', err);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [captureError]);

  return {
    currentPlanetaryHour,
    planetaryHourChakras,
    isLoading,
    error
  };
}

export default usePlanetaryHour;
