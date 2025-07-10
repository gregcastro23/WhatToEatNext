'use client';

import { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { initializeAlchemicalEngine } from '@/utils/alchemyInitializer';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getLongitudeToZodiacPosition } from '@/utils/accurateAstronomy';
import { createLogger } from '@/utils/logger';
import { _CelestialPosition, _ZodiacSign } from '@/types/celestial';

// Create a component-specific logger
const _logger = createLogger('PlanetaryPositions');

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
          sunPosition: (positions.sun as unknown)?.sign,
          moonPosition: (positions.moon as unknown)?.sign,
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
    const now = new Date();
    
    // Use fixed/current positions from March 2025
    const positions: PlanetaryPositions = {
      sun: { sign: 'aries', degree: 8.5, exactLongitude: 8.5, isRetrograde: false },
      moon: { sign: 'aries', degree: 1.57, exactLongitude: 1.57, isRetrograde: false },
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
    
    try {
      updatePlanetaryPositions(positions);
      logger.info('Successfully applied fallback planetary positions');
      
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
    } catch (error) {
      logger.error('Failed to apply fallback positions:', error);
      // Even with a failure here, we still want to mark fallback as applied
      // to prevent infinite retry loops
      setRetryStatus(prev => ({
        ...prev,
        usingFallback: true,
        needsFallback: false
      }));
    }
  };

  // Apply fallback positions immediately on first render
  useEffect(() => {
    // Initialize the alchemical engine
    initializeAlchemicalEngine();
    
    try {
      // Apply fallback positions immediately to ensure data is shown
      applyFallbackPositions();
      
      // Then try to get actual positions
      const getInitialPositions = async (): Promise<void> => {
        await attemptPositionUpdate();
      };
      
      getInitialPositions();
    } catch (error) {
      logger.error('Error during component initialization:', error);
      // Make sure fallback is applied even if initialization fails
      applyFallbackPositions();
    }
    
    // Set up regular refresh interval (every 15 minutes)
    const refreshInterval = setInterval(() => {
      if (!retryStatus.isRetrying) {
        attemptPositionUpdate();
      }
    }, 15 * 60 * 1000);
    
    // Set up exponential backoff retry for failures
    const retryInterval = setInterval(() => {
      if (retryStatus.usingFallback && !retryStatus.isRetrying) {
        // Only retry if we're in fallback mode and not currently retrying
        if (retryStatus.count < 5) {
          // Only try 5 times with increasing delays
          const minsSinceLastAttempt = (Date.now() - retryStatus.lastAttempt) / (60 * 1000);
          const waitMinutes = Math.min(2 ** retryStatus.count, 30);
          
          if (minsSinceLastAttempt >= waitMinutes) {
            logger.debug(`Initiating retry #${retryStatus.count + 1} after ${minsSinceLastAttempt.toFixed(1)} minutes`);
            attemptPositionUpdate();
          }
        } else if (retryStatus.count === 5) {
          // Final retry after a longer wait
          const hoursSinceLastAttempt = (Date.now() - retryStatus.lastAttempt) / (60 * 60 * 1000);
          if (hoursSinceLastAttempt >= 1) {
            logger.debug('Initiating final retry attempt after 1 hour');
            attemptPositionUpdate();
          }
        }
      }
    }, 60 * 1000); // Check every minute if we should retry
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(retryInterval);
    };
  }, []);

  // Also handle the fallback positions when needed
  useEffect(() => {
    if (retryStatus.needsFallback) {
      applyFallbackPositions();
    }
  }, [retryStatus.needsFallback]);

  // Render fallback notification with retry button if we're using fallback positions
  if (retryStatus.usingFallback) {
    return (
      <div className="bg-yellow-50 border border-yellow-400 rounded p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5" />
          <div>
            <p className="text-yellow-700 text-sm font-medium">
              Using current March 2025 planetary positions
            </p>
            <p className="text-yellow-600 text-xs">
              {updateError || 'Unable to connect to astronomical data source'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => attemptPositionUpdate(true)}
          disabled={retryStatus.isRetrying}
          className={`px-3 py-1 rounded text-xs flex items-center ${
            retryStatus.isRetrying 
              ? 'bg-gray-200 text-gray-500' 
              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
          }`}
          aria-label="Retry connection"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${retryStatus.isRetrying ? 'animate-spin' : ''}`} />
          {retryStatus.isRetrying ? 'Connecting...' : 'Retry Connection'}
        </button>
      </div>
    );
  }

  // When positions are successfully fetched, show data source
  if (lastUpdateTime) {
    return (
      <div className="text-xs text-green-700 mb-2 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Using live astronomical data • Updated {lastUpdateTime.toLocaleTimeString()}
      </div>
    )
  }

  // Return null when in initial loading state
  return null;
};

export default PlanetaryPositionInitializer; 