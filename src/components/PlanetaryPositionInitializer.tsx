'use client';

import { useEffect, useState } from 'react';
import { useAlchemical } from '../contexts/AlchemicalContext/hooks';
import { initializeAlchemicalEngine } from '../utils/alchemyInitializer';
import { createLogger } from '../utils/logger';
import { CelestialPosition, ZodiacSign } from '../types/celestial';
// Import planet data
import { planetInfo } from '../data/planets';

// Create a component-specific logger
const logger = createLogger('PlanetaryPositions');

// Define interfaces for better type safety
interface RetryStatus {
  count: number;
  isRetrying: boolean;
  lastAttempt: number;
  usingFallback: boolean;
  needsFallback: boolean;
}

// Use PlanetaryPositions interface with the imported CelestialPosition type
interface PlanetaryPositions {
  sun: CelestialPosition;
  moon: CelestialPosition;
  mercury: CelestialPosition;
  venus: CelestialPosition;
  mars: CelestialPosition;
  jupiter: CelestialPosition;
  saturn: CelestialPosition;
  uranus: CelestialPosition;
  neptune: CelestialPosition;
  pluto: CelestialPosition;
  northNode?: CelestialPosition;
  southNode?: CelestialPosition;
  ascendant?: CelestialPosition;
  [key: string]: CelestialPosition | undefined;
}

/**
 * Gets current planetary positions based on the current date
 * This provides more accurate data for current moment
 */
const getCurrentMomentPositions = (): Record<string, {sign: string, degree: number, isRetrograde: boolean}> => {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-based
  const day = now.getDate();
  
  // Mapping months to approximated signs for the sun
  // These are rough estimations and will vary slightly year to year
  const sunSignByMonth: Record<number, {sign: string, startDay: number, endDay: number}> = {
    1: { sign: 'capricorn', startDay: 1, endDay: 19 },
    2: { sign: 'aquarius', startDay: 20, endDay: 18 },
    3: { sign: 'pisces', startDay: 19, endDay: 20 },
    4: { sign: 'aries', startDay: 21, endDay: 19 },
    5: { sign: 'taurus', startDay: 20, endDay: 20 },
    6: { sign: 'gemini', startDay: 21, endDay: 20 },
    7: { sign: 'cancer', startDay: 21, endDay: 22 },
    8: { sign: 'leo', startDay: 23, endDay: 22 },
    9: { sign: 'virgo', startDay: 23, endDay: 22 },
    10: { sign: 'libra', startDay: 23, endDay: 22 },
    11: { sign: 'scorpio', startDay: 23, endDay: 21 },
    12: { sign: 'sagittarius', startDay: 22, endDay: 21 },
    13: { sign: 'capricorn', startDay: 22, endDay: 31 } // Duplicate month 1 for Dec 22-31
  };
  
  // Determine sun sign
  let sunSign: string;
  let sunDegree: number;
  
  // Handle December special case
  if (month === 12 && day >= 22) {
    sunSign = 'capricorn';
    // Calculate degree (0-29)
    sunDegree = day - 22;
  } else {
    const monthData = sunSignByMonth[month];
    if (day >= monthData.startDay && day <= monthData.endDay) {
      sunSign = monthData.sign;
      // Calculate approximate degree position
      sunDegree = ((day - monthData.startDay) / (monthData.endDay - monthData.startDay + 1)) * 30;
    } else {
      // If day is past the end day, use the next sign
      sunSign = sunSignByMonth[month + 1]?.sign || 'aries';
      sunDegree = 0; // Start of the sign
    }
  }
  
  // For simplicity, we'll estimate other planet positions
  // In a real app, these would be calculated using astronomical libraries
  // Current outer planet positions for 2024 (these move slowly)
  const currentPositions: Record<string, {sign: string, degree: number, isRetrograde: boolean}> = {
    'sun': { sign: sunSign, degree: sunDegree, isRetrograde: false },
    'Moon': { sign: 'cancer', degree: 15, isRetrograde: false }, // Moon changes signs every 2.5 days
    'mercury': { sign: 'taurus', degree: 25, isRetrograde: false },
    'venus': { sign: 'taurus', degree: 15, isRetrograde: false },
    'Mars': { sign: 'aries', degree: 15, isRetrograde: false },
    'Jupiter': { sign: 'gemini', degree: 18.5, isRetrograde: false },
    'Saturn': { sign: 'pisces', degree: 26.23, isRetrograde: false },
    'Uranus': { sign: 'taurus', degree: 25.48, isRetrograde: false },
    'Neptune': { sign: 'aries', degree: 0.6, isRetrograde: false },
    'Pluto': { sign: 'aquarius', degree: 3.73, isRetrograde: false },
    'Ascendant': { sign: 'cancer', degree: 15, isRetrograde: false }
  };
  
  return currentPositions;
};

// Simplified helper function that won't crash the app
const getZodiacInfoForPlanet = (planetName: string): { sign: string, isRetrograde: boolean, degree: number } => {
  try {
    const planet = planetName.charAt(0).toUpperCase() + planetName.slice(1);
    
    // Default values with reasonable defaults
    let sign = 'aries';
    let isRetrograde = false;
    let degree = 15; // Default to mid-sign
    
    // Get current moment positions
    const currentPositions = getCurrentMomentPositions();
    
    // Get planet info from current positions
    if (planet in currentPositions) {
      return currentPositions[planet];
    }
    
    // If we reach here, use defaults
    return { sign, isRetrograde, degree };
  } catch (error) {
    // Ensure we never crash the component
    console.error(`Error in getZodiacInfoForPlanet for ${planetName}:`, error);
    return { sign: 'aries', isRetrograde: false, degree: 15 };
  }
};

const PlanetaryPositionInitializer: React.FC = () => {
  const { updatePlanetaryPositions, refreshPlanetaryPositions } = useAlchemical();
  const [retryStatus, setRetryStatus] = useState<RetryStatus>({
    count: 0,
    isRetrying: false,
    lastAttempt: Date.now(),
    usingFallback: false,
    needsFallback: false
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Function to update positions with comprehensive retry logic
  const attemptPositionUpdate = async (force = false): Promise<boolean> => {
    if (retryStatus.isRetrying && !force) return false;
    
    try {
      setRetryStatus(prev => ({ ...prev, isRetrying: true }));
      logger.info(`Attempt #${retryStatus.count + 1} to refresh planetary positions`);
      
      const positions = await refreshPlanetaryPositions();
      
      if (positions && Object.keys(positions).length > 0) {
        // Validate that the response has the minimum required planets
        const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
        const hasMissingPlanets = requiredPlanets.some(planet => !positions[planet]);
        
        if (hasMissingPlanets) {
          throw new Error('Incomplete planetary data received');
        }
        
        logger.info('Successfully updated planetary positions', {
          sunPosition: positions.sun?.sign,
          moonPosition: positions.moon?.sign,
          timestamp: new Date().toISOString()
        });
        
        setLastUpdateTime(new Date());
        setUpdateError(null);
        setRetryStatus({
          count: 0,
          isRetrying: false,
          lastAttempt: Date.now(),
          usingFallback: false,
          needsFallback: false
        });
        return true;
      } else {
        throw new Error('Received empty or invalid positions');
      }
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error fetching planetary positions';
      
      logger.error(`Attempt #${retryStatus.count + 1} failed:`, {
        error: errorMessage,
        retryCount: retryStatus.count + 1,
        timestamp: new Date().toISOString()
      });
      
      // Only update error state if it's different to prevent update loops
      setUpdateError(prevError => {
        if (prevError === errorMessage) return prevError;
        return errorMessage;
      });
      
      setRetryStatus(prev => ({
        ...prev,
        count: prev.count + 1,
        isRetrying: false,
        lastAttempt: Date.now(),
        needsFallback: true
      }));
      
      return false;
    }
  };

  // Function to apply fallback positions based on current moment
  const applyFallbackPositions = (): void => {
    try {
      logger.info('Applying current planetary positions...');
      
      // Define zodiac sign list for longitude calculations
      const zodiacSigns = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                          'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
      
      // Create base positions object with consistent structure
      const positions: PlanetaryPositions = {
        sun: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        moon: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        mercury: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        venus: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        mars: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        jupiter: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        saturn: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        uranus: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        neptune: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        pluto: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false },
        northNode: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: true },
        southNode: { sign: 'libra', degree: 15, exactLongitude: 195, isRetrograde: true },
        ascendant: { sign: 'aries', degree: 15, exactLongitude: 15, isRetrograde: false }
      };
      
      // Update positions with current moment data
      Object.keys(positions).forEach(planet => {
        if (planet !== 'northNode' && planet !== 'southNode') {
          try {
            const { sign, isRetrograde, degree } = getZodiacInfoForPlanet(planet);
            
            // Update position
            if (positions[planet]) {
              const planetPosition = positions[planet];
              if (planetPosition) {
                planetPosition.sign = sign;
                planetPosition.isRetrograde = isRetrograde;
                planetPosition.degree = degree;
                
                // Calculate longitude
                const signIndex = zodiacSigns.indexOf(sign);
                if (signIndex >= 0) {
                  const baseLongitude = signIndex * 30;
                  planetPosition.exactLongitude = baseLongitude + degree;
                }
              }
            }
          } catch (error) {
            console.error(`Error setting position for ${planet}:`, error);
            // Keep default value if there's an error
          }
        }
      });
      
      // Apply positions
      updatePlanetaryPositions(positions);
      logger.info('Successfully applied current planetary positions');
      
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
    } catch (error) {
      logger.error('Failed to apply current positions:', error);
      // Even with a failure here, we still want to mark fallback as applied
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
    }
  };

  // Apply current positions immediately on first render
  useEffect(() => {
    try {
      // Initialize the alchemical engine
      initializeAlchemicalEngine();
      
      // Apply current positions immediately to ensure data is shown
      applyFallbackPositions();
      
      // Then try to get actual positions asynchronously
      setTimeout(() => {
        attemptPositionUpdate(true);
      }, 500);
    } catch (error) {
      console.error('Error during component initialization:', error);
      // Make sure positions are applied even if initialization fails
      applyFallbackPositions();
    }
    
    // Set up regular refresh interval (every 15 minutes)
    const refreshInterval = setInterval(() => {
      if (!retryStatus.isRetrying) {
        attemptPositionUpdate();
      }
    }, 15 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Also handle the fallback positions when needed
  useEffect(() => {
    if (retryStatus.needsFallback) {
      applyFallbackPositions();
    }
  }, [retryStatus.needsFallback]);

  // Don't render anything, just handle the planetary positions behind the scenes
  return null;
};

export default PlanetaryPositionInitializer; 