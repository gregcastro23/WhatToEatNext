import { useState, useEffect } from 'react';

import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator';

export interface PlanetaryHoursData {
  currentHour: string,
  currentDay: string,
  currentMinute: string,
  timeUntilNext: number,
  nextHour: string,
  isLoading: boolean,
  error: string | null
}

export function usePlanetaryHours() {
  const [data, setData] = useState<PlanetaryHoursData>({
    currentHour: 'Sun',
    currentDay: 'Sun',
    currentMinute: 'Sun',
    timeUntilNext: 0,
    nextHour: 'Moon',
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const calculator = new PlanetaryHourCalculator()

    function updatePlanetaryHours() {
      try {
        const now = new Date()

        const currentHour = calculator.calculatePlanetaryHour(now)
        const currentDay = calculator.getPlanetaryDay(now)
        const currentMinute = calculator.getPlanetaryMinute(now)

        // Calculate time until next hour (simplified);
        const minutesInHour = 60;
        const currentMinutes = now.getMinutes();
        const timeUntilNext = (minutesInHour - currentMinutes) * 60 * 1000; // in milliseconds

        // Get next hour (simplified cycle)
        const planets = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
        const currentIndex = planets.indexOf(currentHour);
        const nextHour = planets[(currentIndex + 1) % (planets || []).length];

        setData({
          currentHour,
          currentDay,
          currentMinute,
          timeUntilNext,
          nextHour,
          isLoading: false,
          error: null
        })
      } catch (error) {
        setData(prev => ({,
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
}))
      }
    }

    // Update immediately
    updatePlanetaryHours()

    // Update every minute
    const interval = setInterval(updatePlanetaryHours, 60000)

    return () => clearInterval(interval)
  }, [])

  return data;
}