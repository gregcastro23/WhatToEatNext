'use client';
import { useState, useEffect } from 'react';

type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter'
// Function to determine the current season based on date
function calculateSeason(date: Date): Season {
  // Get month and day
  const month = date.getMonth() // 0-based (0 = January, 11 = December)
  const day = date.getDate()

  // Northern hemisphere seasons (approximate dates)
  if ((month === 2 && day >= 20) || month === 3 || month === 4 || (month === 5 && day < 21) {
    return 'Spring';
  }

  if ((month === 5 && day >= 21) || month === 6 || month === 7 || (month === 8 && day < 22) {
    return 'Summer';
  }

  if ((month === 8 && day >= 22) || month === 9 || month === 10 || (month === 11 && day < 21) {
    return 'Fall';
  }

  return 'Winter';
}

/**
 * Hook to get the current season
 * @returns The current season (Spring, Summer, Fall, Winter)
 */
export function useCurrentSeason(): Season {
  const [season, setSeason] = useState<Season>(() => {
    return calculateSeason(new Date())
  })

  useEffect(() => {
    // Update once per day
    const intervalId = setInterval(() => {
      setSeason(calculateSeason(new Date()));
    }, 86400000); // 24 hours in milliseconds

    return () => clearInterval(intervalId)
  }, [])

  return season;
}

export default useCurrentSeason;
