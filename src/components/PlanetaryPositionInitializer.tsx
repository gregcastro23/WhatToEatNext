'use client';

import { useEffect, useState } from 'react';
import @/contexts  from 'AlchemicalContext ';
import @/utils  from 'alchemyInitializer ';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import @/utils  from 'accurateAstronomy ';
import @/utils  from 'logger ';
import @/types  from 'celestial ';
import @/services  from 'errorHandler ';
import @/utils  from 'validation ';

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
      
      // Wrap in try-catch to handle potential Promise rejection
      let positions;
      try {
        positions = await refreshPlanetaryPositions();
      } catch (refreshError) {
        throw new Error(`Failed to refresh planetary positions: ${
          refreshError instanceof Error ? refreshError.message : 'Unknown error'
        }`);
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error fetching planetary positions';
      
      logger.error(`Attempt #${retryStatus.count + 1} failed:`, {
        error: errorMessage,
        retryCount: retryStatus.count + 1,
        timestamp: new Date().toISOString()
      });
      
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
      
      return false;
    }
  };

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
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
      
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
    }
  };

  // Apply fallback positions immediately on first render
  useEffect(() => {
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
  useEffect(() => {
    if (retryStatus.needsFallback) {
      applyFallbackPositions();
    }
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
};

export default PlanetaryPositionInitializer; 