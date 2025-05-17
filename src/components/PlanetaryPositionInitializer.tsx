'use client';
<<<<<<< HEAD
import React, { useEffect, useCallback, useState } from 'react';
import { useAlchemical } from "../contexts/AlchemicalContext/hooks";
import { initializeAlchemicalEngine } from "../alchemizer";
import { CelestialPosition } from "../types/celestial";
import { ZodiacSign } from "../types/constants";
import { createLogger } from "../utils/logger";
=======

import { useEffect, useState } from 'react';
import @/contexts  from 'AlchemicalContext ';
import @/utils  from 'alchemyInitializer ';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import @/utils  from 'accurateAstronomy ';
import @/utils  from 'logger ';
import @/types  from 'celestial ';
import @/services  from 'errorHandler ';
import @/utils  from 'validation ';
>>>>>>> main

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

// Function to get default planetary positions
function getDefaultPlanetaryPositions(): Record<string, unknown> {
  return { 
    sun: { 
      sign: ZodiacSignAries, 
      degree: 15,
      isRetrograde: false 
    },
    moon: { 
      sign: ZodiacSignCancer, 
      degree: 10,
      isRetrograde: false 
    },
    mercury: { 
      sign: ZodiacSignPisces, 
      degree: 5,
      isRetrograde: false 
    },
    venus: { 
      sign: ZodiacSignTaurus, 
      degree: 20,
      isRetrograde: false 
    },
    mars: { 
      sign: ZodiacSignSagittarius, 
      degree: 8,
      isRetrograde: false 
    },
    jupiter: { 
      sign: ZodiacSignCapricorn, 
      degree: 12,
      isRetrograde: false 
    },
    saturn: { 
      sign: ZodiacSignAquarius, 
      degree: 25,
      isRetrograde: true 
    },
    uranus: { 
      sign: ZodiacSignTaurus, 
      degree: 18,
      isRetrograde: false 
    },
    neptune: { 
      sign: ZodiacSignPisces, 
      degree: 28,
      isRetrograde: false 
    },
    pluto: { 
      sign: ZodiacSignCapricorn, 
      degree: 3,
      isRetrograde: false 
    }
  };
}

/**
 * Safely gets a celestial position value with defaults if undefined
 * @param position The position to validate
 * @param fallbackSign Fallback sign to use if position is invalid
 * @returns A valid CelestialPosition object
 */
function getSafeCelestialPosition(
  position: CelestialPosition | undefined,
  fallbackSign: ZodiacSign = 'aries'
): CelestialPosition {
  // If position is undefined or null, return a default
  if (!position) {
    return {
      sign: fallbackSign,
      degree: 0,
      exactLongitude: 0,
      isRetrograde: false
    };
  }
  
  // If position doesn't have the required properties, fix them
  return {
    sign: position.sign || fallbackSign,
    degree: typeof position.degree === 'number' ? position.degree : 0,
    exactLongitude: typeof position.exactLongitude === 'number' ? position.exactLongitude : 0,
    isRetrograde: typeof position.isRetrograde === 'boolean' ? position.isRetrograde : false
  };
}

/**
 * Validates that the planetary positions object has all required planets
 * @param positions The positions object to validate
 * @returns True if the positions object is valid
 */
function validatePlanetaryPositions(positions: Partial<PlanetaryPositions> | null | undefined): positions is PlanetaryPositions {
  if (!positions) return false;
  
  const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  for (const planet of requiredPlanets) {
    if (!positions[planet] || !isValidCelestialPosition(positions[planet])) {
      return false;
    }
  }
  
  return true;
}

const PlanetaryPositionInitializer: React.FC = () => {
  const { updatePlanetaryPositions, refreshPlanetaryPositions } = useAlchemical();
  const [retryStatus, setRetryStatus] = useState<RetryStatus>({ 
    count: 0,
    isRetrying: false, 
    lastAttempt: 0,
    usingFallback: false, 
    needsFallback: false 
  });
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const attemptPositionUpdate = async (force = false): Promise<boolean> => {
    if (retryStatusisRetrying && !force) { return false; }
    try {
<<<<<<< HEAD
      setRetryStatus(prev => ({ 
        ...prev, 
        isRetrying: true,
        count: prevcount + 1, 
        lastAttempt: Datenow() 
      }));
      loggerinfo(`Attempt #${retryStatuscount + 1} to refresh planetary positions`);
      const positions = await refreshPlanetaryPositions();
      if (positions && Objectkeys(positions).length > 0) {
        // Validate that the response has the minimum required planets
        const requiredPlanets = ['sun', 'moon', 'mercury', 'venus', 'mars'];
        const hasMissingPlanets = requiredPlanetssome(planet => !positions[planet]);
        if (hasMissingPlanets) {
          throw new Error('Incomplete planetary data received');
        }
        
        loggerinfo('Successfully updated planetary positions', { 
          sunPosition: positionssun?.sign, 
          moonPosition: positionsmoon?.sign, 
          timestamp: new Date().toISOString() 
        });
        setLastUpdateTime(new Date());
        setUpdateError(null);
        setRetryStatus({ 
          count: 0,
          isRetrying: false, 
          lastAttempt: Datenow(), 
          usingFallback: false,
          needsFallback: false 
        });
        return true;
      } else {
        throw new Error('Received empty or invalid positions');
=======
      setRetryStatus(prev => ({ ...prev, isRetrying: true }));
      logger.info(`Attempt #${retryStatus.count + 1} to refresh planetary positions`);
      
      // Wrap in try-catch to handle potential Promise rejection
      let positions;
      try {
        positions = await refreshPlanetaryPositions();
      } catch (refreshError) {
        throw new Error(`Failed to refresh planetary positions: ${
          refreshError instanceof Error ? refreshError.message : 'Unknown error'
        }`);
>>>>>>> main
      }
      
      // Validate positions
      if (!validatePlanetaryPositions(positions)) {
        throw new Error('Invalid or incomplete planetary data received');
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
    } catch (error) {
      const errorMessage = error instanceof Error ? errormessage : 'Unknown error fetching planetary positions';
      loggererror(`Failed to update planetary positions: ${errorMessage}`);
      
      setRetryStatus(prev => {
        const updatedStatus = {
          ...prev,
          isRetrying: false,
          lastAttempt: Datenow()
        };
        
        // After several retries, flag that we need to use fallback data
        if (prevcount >= 3) {
          updatedStatusneedsFallback = true;
        }
        
        return updatedStatus;
      });
      
<<<<<<< HEAD
      setUpdateError(errorMessage);
=======
      // Report error to error handler
      ErrorHandler.log(error, {
        context: 'PlanetaryPositionInitializer',
        data: { retryCount: retryStatus.count + 1 }
      });
      
      // Only update error state if it's different to prevent update loops
      setUpdateError(prevError => {
        if (prevError === errorMessage) return prevError;
        return errorMessage;
      });
      
      // Move the fallback positions to a useEffect that depends on updateError
      // This prevents calling it directly here, which might cause loops
      // We'll use the retry status instead to trigger the fallback
      setRetryStatus(prev => ({
        ...prev,
        count: prev.count + 1,
        isRetrying: false,
        lastAttempt: Date.now(),
        needsFallback: true
      }));
      
>>>>>>> main
      return false;
    }
  };

<<<<<<< HEAD
  const useFallbackData = useCallback(() => {
    if (!retryStatususingFallback) {
      loggerwarn('Using fallback planetary position data');
      const defaultPositions = getDefaultPlanetaryPositions();
      updatePlanetaryPositions(defaultPositions);
=======
  // Function to apply fallback positions
  const applyFallbackPositions = (): void => {
    logger.warn('Applying fallback positions...');
    
    try {
      // Import default positions from constants
      const { DEFAULT_PLANETARY_POSITIONS } = require('@/constants / (defaults || 1) ');
      
      // Create a complete set of planetary positions with enhanced fallbacks
      const positions: PlanetaryPositions = {
        sun: getSafeCelestialPosition(DEFAULT_PLANETARY_POSITIONS.sun),
        moon: getSafeCelestialPosition(DEFAULT_PLANETARY_POSITIONS.moon),
        mercury: { sign: 'aries', degree: 0.85, exactLongitude: 0.85, isRetrograde: true },
        venus: { sign: 'pisces', degree: 29.08, exactLongitude: 359.08, isRetrograde: true },
        mars: { sign: 'cancer', degree: 22.63, exactLongitude: 112.63, isRetrograde: false },
        jupiter: { sign: 'gemini', degree: 15.52, exactLongitude: 75.52, isRetrograde: false },
        saturn: { sign: 'pisces', degree: 24.12, exactLongitude: 354.12, isRetrograde: false },
        uranus: { sign: 'taurus', degree: 24.62, exactLongitude: 54.62, isRetrograde: false },
        neptune: { sign: 'pisces', degree: 29.93, exactLongitude: 359.93, isRetrograde: false },
        pluto: { sign: 'aquarius', degree: 3.5, exactLongitude: 333.5, isRetrograde: false },
        northNode: { sign: 'pisces', degree: 26.88, exactLongitude: 356.88, isRetrograde: true },
        southNode: { sign: 'virgo', degree: 26.88, exactLongitude: 176.88, isRetrograde: true },
        ascendant: { sign: 'libra', degree: 7.82, exactLongitude: 187.82, isRetrograde: false }
      };
      
      // Validate each position before updating
      Object.keys(positions).forEach(planet => {
        if (positions[planet]) {
          positions[planet] = getSafeCelestialPosition(positions[planet]);
        }
      });
      
      updatePlanetaryPositions(positions);
      logger.info('Successfully applied fallback planetary positions');
      
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
    } catch (error) {
      logger.error('Failed to apply fallback positions:', error);
      
      // Report error to error handler
      ErrorHandler.log(error, {
        context: 'PlanetaryPositionInitializer:fallback',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      
      // Even with a failure here, we still want to mark fallback as applied
      // to prevent infinite retry loops
>>>>>>> main
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
<<<<<<< HEAD
      setUpdateError('Using default planetary data. Will try to fetch accurate data later.');
=======
      
      // Apply absolute minimum fallback as a last resort
      try {
        updatePlanetaryPositions({
          sun: { sign: 'aries', degree: 0, exactLongitude: 0, isRetrograde: false },
          moon: { sign: 'taurus', degree: 0, exactLongitude: 30, isRetrograde: false },
          mercury: { sign: 'gemini', degree: 0, exactLongitude: 60, isRetrograde: false },
          venus: { sign: 'cancer', degree: 0, exactLongitude: 90, isRetrograde: false },
          mars: { sign: 'leo', degree: 0, exactLongitude: 120, isRetrograde: false },
          jupiter: { sign: 'virgo', degree: 0, exactLongitude: 150, isRetrograde: false },
          saturn: { sign: 'libra', degree: 0, exactLongitude: 180, isRetrograde: false },
          uranus: { sign: 'scorpio', degree: 0, exactLongitude: 210, isRetrograde: false },
          neptune: { sign: 'sagittarius', degree: 0, exactLongitude: 240, isRetrograde: false },
          pluto: { sign: 'capricorn', degree: 0, exactLongitude: 270, isRetrograde: false }
        });
      } catch (lastResortError) {
        logger.error('Failed to apply last resort positions:', lastResortError);
      }
>>>>>>> main
    }
  }, [retryStatususingFallback, updatePlanetaryPositions]);
  
  // Initial data fetch
  useEffect(() => {
<<<<<<< HEAD
    let isMounted = true;
    
    const initializePositions = async () => {
      if (isMounted) {
        const success = await attemptPositionUpdate(true);
        if (!success && isMounted) {
          useFallbackData();
        }
      }
    };
    
    initializePositions();
    
    // Set up periodic refresh
    const refreshInterval = setInterval(() => {
      if (isMounted) {
        attemptPositionUpdate();
      }
    }, 3600000); // Refresh every hour
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Use fallback data if needed
=======
    // Initialize the alchemical engine
    try {
      initializeAlchemicalEngine();
      logger.info('Alchemical engine initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize alchemical engine:', error);
      ErrorHandler.log(error, {
        context: 'PlanetaryPositionInitializer:initialization'
      });
    }
    
    try {
      // Apply fallback positions immediately to ensure data is shown
      applyFallbackPositions();
      
      // Then attempt to get actual positions
      const getInitialPositions = async (): Promise<void> => {
        try {
          const success = await attemptPositionUpdate(true);
          if (!success) {
            logger.warn('Initial position update failed, using fallback positions');
          }
        } catch (initError) {
          logger.error('Error in initial position update:', initError);
          ErrorHandler.log(initError, {
            context: 'PlanetaryPositionInitializer:initialPositions'
          });
        }
      };
      
      getInitialPositions();
    } catch (error) {
      logger.error('Error in initial setup:', error);
      ErrorHandler.log(error, {
        context: 'PlanetaryPositionInitializer:initialSetup'
      });
    }
  }, []);

  // Apply fallback when needed
>>>>>>> main
  useEffect(() => {
    if (retryStatusneedsFallback) {
      useFallbackData();
    }
<<<<<<< HEAD
  }, [retryStatusneedsFallback, useFallbackData]);
  
  return null; // This component doesn't render anything
=======
  }, [retryStatus.needsFallback]);

  // Set up periodic position updates
  useEffect(() => {
    // Refresh positions every 12 hours
    const refreshInterval = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
    
    const scheduleNextUpdate = () => {
      const timerId = setTimeout(async () => {
        try {
          logger.info('Performing scheduled position update');
          await attemptPositionUpdate();
        } catch (error) {
          logger.error('Scheduled position update failed:', error);
          ErrorHandler.log(error, {
            context: 'PlanetaryPositionInitializer:scheduledUpdate'
          });
        } finally {
          // Always schedule next update, even if this one failed
          scheduleNextUpdate();
        }
      }, refreshInterval);
      
      // Cleanup function to clear timeout if component unmounts
      return () => clearTimeout(timerId);
    };
    
    // Start the cycle
    return scheduleNextUpdate();
  }, []);

  // Render appropriate UI based on status
  return (
    <div className="flex flex-col items-center">
      {updateError && !retryStatus.usingFallback && (
        <div className="text-amber-600 dark:text-amber-400 flex items-center mb-2 p-2 rounded bg-amber-100 dark:bg-amber-950">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="text-sm">Using cached planetary data. {updateError}</span>
        </div>
      )}
      
      {retryStatus.usingFallback && (
        <div className="text-amber-600 dark:text-amber-400 flex items-center mb-2 p-2 rounded bg-amber-100 dark:bg-amber-950">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span className="text-sm">Using fallback planetary data.</span>
          <button 
            onClick={() => attemptPositionUpdate(true)} 
            className="ml-2 text-sm flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </button>
        </div>
      )}
      
      {retryStatus.isRetrying && (
        <div className="text-blue-600 dark:text-blue-400 flex items-center mb-2">
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          <span className="text-sm">Refreshing data...</span>
        </div>
      )}
      
      {lastUpdateTime && !updateError && !retryStatus.usingFallback && (
        <div className="text-green-600 dark:text-green-400 text-xs mt-1">
          Updated: {lastUpdateTime.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
>>>>>>> main
};

export default PlanetaryPositionInitializer;