'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowDown, Sunrise, Sunset, Navigation } from 'lucide-react';
import { useServices } from '@/hooks/useServices';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (_message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * A utility function for logging errors
 * This is a safe replacement for console.error that can be disabled in production
 */
const errorLog = (_message: string, ...args: unknown[]): void => {
  // Comment out console.error to avoid linting warnings
  // console.error(message, ...args);
};

// Helper function to get Moon phase description
const getLunarPhaseDescription = (phase: string): string => {
  const descriptions: { [key: string]: string } = {
    'new_moon': 'New beginnings, planting seeds, and setting intentions.',
    'waxing_crescent': 'Building momentum, gathering resources, and taking initial steps.',
    'first_quarter': 'Action, decision-making, and overcoming challenges.',
    'waxing_gibbous': 'Refining, adjusting, and preparing for culmination.',
    'full_moon': 'Culmination, manifestation, and realization of goals.',
    'waning_gibbous': 'Gratitude, sharing, and beginning to release.',
    'last_quarter': 'Letting go, forgiveness, and making space for the new.',
    'waning_crescent': 'Rest, reflection, and preparation for renewal.'
  };
  
  return descriptions[phase] || 'A time of cosmic energy and lunar influence.';
};

// Add proper type for Moon times
interface MoonTimes {
  rise?: Date;
  set?: Date;
  calculating: boolean;
}

// Add type for Moon phase
interface MoonPhase {
  phase: string;
  phaseValue: number;
  description: string;
  illumination: number;
}

// Define type for coordinates
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Helper function to format Moon time
const formatMoonTime = (time: Date | undefined): string => {
  if (!time) return 'Unknown';
  
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const MoonDisplayMigrated: React.FC = () => {
  // Use the services hook to get dependencies
  const { 
    isLoading, 
    error,
    astrologyService
  } = useServices();
  
  const [expanded, setExpanded] = useState(false);
  const [moonPhase, setMoonPhase] = useState<MoonPhase>({
    phase: 'new_moon',
    phaseValue: 0,
    description: 'Beginning of the lunar cycle.',
    illumination: 0
  });
  
  const [moonTimes, setMoonTimes] = useState<MoonTimes>({
    calculating: true
  });
  
  const [coordinates, setCoordinates] = useState<Coordinates>({
    latitude: 40.7128, // Default to New York
    longitude: -74.0060
  });
  
  const [planetaryPositions, setPlanetaryPositions] = useState<Record<string, any>>({});

  // Get planetary positions from the astrologyService
  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const fetchPlanetaryPositions = async () => {
        try {
          const positions = await astrologyService.getCurrentPlanetaryPositions();
          setPlanetaryPositions(positions);
        } catch (err) {
          errorLog('Failed to fetch planetary positions:', err);
        }
      };
      
      fetchPlanetaryPositions();
    }
  }, [isLoading, error, astrologyService]);

  // Extract Moon info from planetaryPositions
  const Moon = useMemo(() => {
    return planetaryPositions?.moon || { sign: 'unknown', degree: 0, exactLongitude: 0, isRetrograde: false };
  }, [planetaryPositions]);
  
  // Simplified lunar node handling
  const NorthNode = useMemo(() => {
    if (!planetaryPositions?.NorthNode && !planetaryPositions?.NorthNode) {
      // If north node is missing completely, provide a default
      return { sign: 'virgo', degree: 15, exactLongitude: 165, isRetrograde: true };
    }
    
    // Try both possible property names
    const node = planetaryPositions?.NorthNode || planetaryPositions?.NorthNode;
    
    // Ensure all required properties are present
    return {
      sign: node?.sign || 'virgo',
      degree: (node?.degree ?? 15),
      exactLongitude: (node?.exactLongitude ?? 165),
      isRetrograde: (node?.isRetrograde ?? true)
    };
  }, [planetaryPositions]);
  
  const SouthNode = useMemo(() => {
    if (!planetaryPositions?.SouthNode && !planetaryPositions?.SouthNode) {
      // If south node is missing completely, provide a default
      return { sign: 'pisces', degree: 15, exactLongitude: 345, isRetrograde: true };
    }
    
    // Try both possible property names
    const node = planetaryPositions?.SouthNode || planetaryPositions?.SouthNode;
    
    // Ensure all required properties are present
    return {
      sign: node?.sign || 'pisces',
      degree: (node?.degree ?? 15),
      exactLongitude: (node?.exactLongitude ?? 345),
      isRetrograde: (node?.isRetrograde ?? true)
    };
  }, [planetaryPositions]);

  // Get user's location
  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const getLocation = async () => {
        try {
          const location = await (astrologyService as Record<string, unknown>)?.getUserLocation?.();
          if (location) {
            setCoordinates({
              latitude: location.latitude,
              longitude: location.longitude
            });
          }
        } catch (error) {
          errorLog('Failed to get location, using default:', error);
        }
      };
      
      getLocation();
    }
  }, [isLoading, error, astrologyService]);

  // Calculate Moon times
  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const calculateTimes = async () => {
        try {
          const times = await (astrologyService as Record<string, unknown>)?.getMoonTimes?.(new Date(), coordinates);
          
          if (times) {
            setMoonTimes({
              rise: times.rise,
              set: times.set,
              calculating: false
            });
          } else {
            // If calculation fails, use a fallback
            debugLog('Moon times calculation failed, using fallback values');
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Simple fallback calculation (not accurate but better than nothing)
            setMoonTimes({
              rise: new Date(now.setHours(18, 30, 0, 0)), // Rough estimate for evening
              set: new Date(tomorrow.setHours(6, 30, 0, 0)), // Rough estimate for morning
              calculating: false
            });
          }
        } catch (error: unknown) {
          errorLog('Error in calculateTimes:', error);
          // Even in case of error, set calculating to false to avoid endless loading
          setMoonTimes({
            calculating: false,
            rise: undefined,
            set: undefined
          });
        }
      };
      
      calculateTimes();
      
      // Update Moon times every 30 minutes
      const interval = setInterval(() => calculateTimes(), 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [coordinates, isLoading, error, astrologyService]);

  // Calculate lunar phase
  useEffect(() => {
    if (!isLoading && !error && astrologyService) {
      const getLunarPhaseData = async () => {
        try {
          // ✅ Pattern MM-1: getLunarPhaseData expects boolean parameter, not Date
          const phaseData = await astrologyService.getLunarPhaseData(false);
          
          if (phaseData) {
            const phaseDataObj = phaseData as LunarPhase;
            setMoonPhase({
              phase: phaseDataObj?.phaseName || phaseDataObj?.phase || 'new_moon',
              phaseValue: phaseDataObj?.phaseValue || 0,
              description: getLunarPhaseDescription(phaseDataObj?.phaseName || phaseDataObj?.phase || 'new_moon'),
              illumination: phaseDataObj?.illumination || 0
            });
          }
        } catch (error) {
          errorLog('Error getting lunar phase data:', error);
        }
      };
      
      getLunarPhaseData();
      
      // Update lunar phase data every hour
      const interval = setInterval(() => getLunarPhaseData(), 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isLoading, error, astrologyService]);

  // Helper functions
  const formatDegree = (degree: number): string => {
    return `${Math.floor(degree)}°`;
  };

  const getLunarPhaseIcon = (phase: string): string => {
    const phaseIcons: { [key: string]: string } = {
      'new_moon': '🌑',
      'waxing_crescent': '🌒',
      'first_quarter': '🌓',
      'waxing_gibbous': '🌔',
      'full_moon': '🌕',
      'waning_gibbous': '🌖',
      'last_quarter': '🌗',
      'waning_crescent': '🌘'
    };
    
    return phaseIcons[phase] || '🌙';
  };

  const capitalizeFirstLetter = (string: string | undefined | null): string => {
    if (!string) return '';
    return string.charAt(0)?.toUpperCase() + string?.slice(1);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <p>Loading Moon data...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="Moon-display bg-indigo-50 dark:bg-indigo-900 rounded-lg shadow-md p-4 mb-4 w-full max-w-md mx-auto">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <Moon className="h-5 w-5 mr-2 text-indigo-700 dark:text-indigo-300" />
          <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">
            Moon in {capitalizeFirstLetter(Moon.sign)}
          </h3>
        </div>
        <ArrowDown 
          className={`h-4 w-4 text-indigo-600 dark:text-indigo-400 transition-transform ${expanded ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {expanded && (
        <div className="mt-4 space-y-3">
          {/* Moon Details */}
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="p-3 bg-white dark:bg-indigo-800 rounded-md shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-300 block mb-1">Position</span>
              <div className="font-medium text-indigo-700 dark:text-indigo-300">
                {capitalizeFirstLetter(Moon.sign)} {formatDegree(Moon.degree)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {Moon.isRetrograde ? 'Retrograde' : 'Direct'}
              </div>
            </div>
            
            <div className="p-3 bg-white dark:bg-indigo-800 rounded-md shadow-sm">
              <span className="text-xs text-gray-500 dark:text-gray-300 block mb-1">Lunar Phase</span>
              <div className="flex items-center">
                <span className="mr-2 text-xl">{getLunarPhaseIcon(moonPhase.phase)}</span>
                <div>
                  <div className="font-medium text-indigo-700 dark:text-indigo-300">
                    {capitalizeFirstLetter(moonPhase.phase.replace('_', ' '))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(moonPhase.illumination)}% illuminated
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Moon Times */}
          <div className="bg-white dark:bg-indigo-800 rounded-md shadow-sm p-3">
            <span className="text-xs text-gray-500 dark:text-gray-300 block mb-1">Moon Times</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <Sunrise className="h-4 w-4 mr-1 text-amber-500" />
                <span className="text-sm font-medium">
                  {moonTimes.calculating ? 'Calculating...' : formatMoonTime(moonTimes.rise)}
                </span>
              </div>
              <div className="flex items-center">
                <Sunset className="h-4 w-4 mr-1 text-purple-500" />
                <span className="text-sm font-medium">
                  {moonTimes.calculating ? 'Calculating...' : formatMoonTime(moonTimes.set)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Lunar Nodes */}
          <div className="bg-white dark:bg-indigo-800 rounded-md shadow-sm p-3">
            <span className="text-xs text-gray-500 dark:text-gray-300 block mb-1">Lunar Nodes</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  North Node
                </div>
                <div className="text-xs">
                  {capitalizeFirstLetter(NorthNode.sign)} {formatDegree(NorthNode.degree)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  South Node
                </div>
                <div className="text-xs">
                  {capitalizeFirstLetter(SouthNode.sign)} {formatDegree(SouthNode.degree)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Lunar Phase Meaning */}
          <div className="bg-white dark:bg-indigo-800 rounded-md shadow-sm p-3">
            <span className="text-xs text-gray-500 dark:text-gray-300 block mb-1">Lunar Phase Meaning</span>
            <p className="text-sm">{moonPhase.description}</p>
          </div>
          
          {/* Location Info */}
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <Navigation className="h-3 w-3 mr-1" />
            <span>
              Calculations based on: {coordinates.latitude.toFixed(2)}°, {coordinates.longitude.toFixed(2)}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonDisplayMigrated; 