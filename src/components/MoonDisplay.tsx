'use client';

import { Moon, ArrowDown, Sunrise, Sunset, Navigation } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { _logger } from '@/lib/logger';
import { safeImportAndExecute, safeImportFunction } from '@/utils/dynamicImport';

/**
 * A utility function for logging debug information
 */
const debugLog = (_message: string, ..._args: unknown[]): void => {
  // Debug logging disabled in production
};

/**
 * A utility function for logging errors
 */
const errorLog = (_message: string, ..._args: unknown[]): void => {
  // Error logging
};

// Helper function to get moon phase description
const getLunarPhaseDescription = (phase: string): string => {
  const descriptions: Record<string, string> = {
    'new_moon': 'New beginnings, planting seeds, and setting intentions.',
    'waxing_crescent': 'Building momentum, gathering resources, and taking initial steps.',
    'first_quarter': 'Action, decision-making, and overcoming challenges.',
    'waxing_gibbous': 'Refining, adjusting, and preparing for culmination.',
    'full_moon': 'Culmination, manifestation, and realization of goals.',
    'waning_gibbous': 'Gratitude, sharing, and beginning to release.',
    'last_quarter': 'Letting go, forgiveness, and making space for the new.',
    'waning_crescent': 'Rest, reflection, and preparation for renewal.'
  };
  
  return descriptions[phase] ?? 'A time of cosmic energy and lunar influence.';
};

// Add proper type for moon times
interface MoonTimes {
  rise?: Date;
  set?: Date;
  calculating: boolean;
}

// Add type for moon phase
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

interface PlanetPosition {
  sign?: string;
  degree?: number;
  exactLongitude?: number;
  isRetrograde?: boolean;
}

// Helper function to format moon time
const formatMoonTime = (time: Date | undefined): string => {
  if (!time) return 'Unknown';
  
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

const MoonDisplay: React.FC = () => {
  const alchemical = useAlchemical() as { planetaryPositions?: Record<string, unknown> };
  const planetaryPositions = alchemical.planetaryPositions ?? {};
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

  // Extract moon info directly from planetaryPositions rather than calculating it separately
  const moon = (planetaryPositions.moon as PlanetPosition | undefined) ?? { sign: 'unknown', degree: 0, exactLongitude: 0, isRetrograde: false };
  
  // Simplified lunar node handling - ensure we have default values if northNode or southNode are missing
  const northNode = useMemo<PlanetPosition>(() => {
    const node = (planetaryPositions.northnode ?? planetaryPositions.northNode) as PlanetPosition | undefined;
    if (!node) {
      return { sign: 'virgo', degree: 15, exactLongitude: 165, isRetrograde: true };
    }
    
    return {
      sign: node.sign ?? 'virgo',
      degree: node.degree ?? 15,
      exactLongitude: node.exactLongitude ?? 165,
      isRetrograde: node.isRetrograde ?? true
    };
  }, [planetaryPositions]);
  
  const southNode = useMemo<PlanetPosition>(() => {
    const node = (planetaryPositions.southnode ?? planetaryPositions.southNode) as PlanetPosition | undefined;
    if (!node) {
      return { sign: 'pisces', degree: 15, exactLongitude: 345, isRetrograde: true };
    }
    
    return {
      sign: node.sign ?? 'pisces',
      degree: node.degree ?? 15,
      exactLongitude: node.exactLongitude ?? 345,
      isRetrograde: node.isRetrograde ?? true
    };
  }, [planetaryPositions]);

  // Get user's location
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (error) => {
          errorLog('Failed to get location, using default:', error);
        },
        { timeout: 10000 }
      );
    }
  }, []);

  // Dynamic import for moon time calculations
  useEffect(() => {
    const calculateTimes = async (): Promise<void> => {
      try {
        const times = await safeImportAndExecute<{ rise?: Date; set?: Date }>(
          '@/utils/moonTimes',
          'calculateMoonTimes',
          [new Date(), coordinates.latitude, coordinates.longitude]
        );
        
        if (times) {
          setMoonTimes({
            rise: times.rise,
            set: times.set,
            calculating: false
          });
        } else {
          debugLog('Moon times calculation failed, using fallback values');
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          setMoonTimes({
            rise: new Date(now.setHours(18, 30, 0, 0)),
            set: new Date(tomorrow.setHours(6, 30, 0, 0)),
            calculating: false
          });
        }
      } catch (error: unknown) {
        errorLog('Error in calculateTimes:', error);
        setMoonTimes({
          calculating: false,
          rise: undefined,
          set: undefined
        });
      }
    };
    
    calculateTimes().catch(() => {});
    
    // Update moon times every 30 minutes
    const interval = setInterval(() => {
      calculateTimes().catch(() => {});
    }, 30 * 60 * 1000);
    return (): void => clearInterval(interval);
  }, [coordinates.latitude, coordinates.longitude]);

  // Safely import and calculate lunar phase
  useEffect(() => {
    const getLunarPhaseData = async (): Promise<void> => {
      try {
        const [calculatePhase, getPhaseName, getIllumination] = await Promise.all([
          safeImportFunction<(date?: Date) => Promise<number>>('@/utils/astrologyUtils', 'calculateLunarPhase'),
          safeImportFunction<(phase: number) => string>('@/utils/astrologyUtils', 'getLunarPhaseName'),
          safeImportFunction<(date?: Date) => Promise<number>>('@/utils/astrologyUtils', 'getMoonIllumination')
        ]);
        
        if (calculatePhase && getPhaseName && getIllumination) {
          const currentPhase = await calculatePhase(new Date());
          const phaseName = getPhaseName(currentPhase);
          const illuminationPct = await getIllumination(new Date());
          
          debugLog('Lunar phase calculation:', {
            phaseValue: currentPhase,
            phaseName,
            illuminationPct
          });
          
          let correctedIllumination = illuminationPct;
          if (phaseName === 'waning_crescent' && illuminationPct < 1) {
            correctedIllumination = Math.max(1, Math.min(25, illuminationPct || 12));
          }
          
          setMoonPhase({
            phase: phaseName,
            phaseValue: currentPhase,
            description: getLunarPhaseDescription(phaseName),
            illumination: correctedIllumination
          });
        }
      } catch (error) {
        errorLog('Error calculating lunar phase:', error);
        throw new Error('Failed to calculate lunar phase. Please check the implementation.');
      }
    };
    
    getLunarPhaseData().catch(() => {});
    
    // Run calculation every minute to ensure accuracy
    const interval = setInterval(() => {
      getLunarPhaseData().catch(() => {});
    }, 60 * 1000);
    return (): void => clearInterval(interval);
  }, [planetaryPositions.moon]);

  const formatDegree = (degree: number): string => {
    const wholeDegree = Math.floor(degree);
    const minutes = Math.floor((degree - wholeDegree) * 60);
    return `${wholeDegree}°${minutes}'`;
  };

  // Get lunar phase icon
  const getLunarPhaseIcon = (phase: string): string => {
    const phases: Record<string, string> = {
      'new_moon': '🌑',
      'waxing_crescent': '🌒',
      'first_quarter': '🌓',
      'waxing_gibbous': '🌔',
      'full_moon': '🌕',
      'waning_gibbous': '🌖',
      'last_quarter': '🌗',
      'waning_crescent': '🌘'
    };
    
    return phases[phase] ?? '🌑';
  };

  // Helper function to capitalize the first letter of each word
  const capitalizeFirstLetter = (string: string | undefined | null): string => {
    if (!string) return '';
    
    return string
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Add useEffect to log data for debugging
  useEffect(() => {
    debugLog('Planetary positions debug:', {
      moon: planetaryPositions.moon,
      northNode: planetaryPositions.northNode,
      southNode: planetaryPositions.southNode,
      phase: moonPhase
    });
  }, [planetaryPositions, moonPhase]);

  // Only log north node warning once when positions are loaded
  useEffect(() => {
    if (Object.keys(planetaryPositions).length === 0) {
      return;
    }
    
    const northNodeObj = (planetaryPositions.northNode ?? planetaryPositions.northnode) as PlanetPosition | undefined;
    if (!northNodeObj?.sign) {
      _logger.warn('North Node data missing or incomplete:', {
        northNodeData: planetaryPositions.northNode ?? planetaryPositions.northnode ?? 'undefined',
        availableKeys: Object.keys(planetaryPositions)
      });
    }
  }, [planetaryPositions]);

  return (
    <div className="bg-gray-900 bg-opacity-90 rounded-lg p-4 shadow-lg border border-indigo-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-white flex items-center">
          <Moon className="w-5 h-5 mr-2 text-cyan-300" />
          Lunar Information
        </h2>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white"
        >
          <ArrowDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className="flex mb-2">
        <div className="mr-4 text-3xl">
          {getLunarPhaseIcon(moonPhase.phase)}
        </div>
        <div>
          <p className="font-medium capitalize">{moonPhase.phase.replace(/_/g, ' ')}</p>
          <p className="text-sm text-gray-300">
            {moon.sign 
              ? `Moon in ${capitalizeFirstLetter(moon.sign)} ${formatDegree(moon.degree ?? 0)}` 
              : 'Loading...'}
            {moon.isRetrograde ? ' ℞' : ''}
          </p>
          <p className="text-xs text-gray-400">{moonPhase.illumination}% illuminated</p>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-300 mb-3">
            {moonPhase.description}
          </p>
          
          <div className="bg-gray-800 rounded p-3 mt-2">
            <div className="text-xs text-gray-400 mb-1">Lunar Cycle</div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-cyan-300 h-2.5 rounded-full"
                style={{ width: `${Math.round(moonPhase.phaseValue * 100)}%` }}
               />
            </div>
          </div>
          
          {/* Moon Rise and Set Times */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded p-3 flex items-center">
              <Sunrise className="w-5 h-5 mr-2 text-yellow-300" />
              <div>
                <div className="text-xs text-gray-400">Moonrise</div>
                <div className="font-medium">
                  {moonTimes.calculating 
                    ? 'Calculating...' 
                    : (moonTimes.rise ? formatMoonTime(moonTimes.rise) : 'Not visible today')}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded p-3 flex items-center">
              <Sunset className="w-5 h-5 mr-2 text-orange-300" />
              <div>
                <div className="text-xs text-gray-400">Moonset</div>
                <div className="font-medium">
                  {moonTimes.calculating 
                    ? 'Calculating...' 
                    : (moonTimes.set ? formatMoonTime(moonTimes.set) : 'Not visible today')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Lunar Nodes Section */}
          <div className="mt-4">
            <h4 className="text-md font-medium flex items-center">
              <Navigation className="w-4 h-4 mr-2 text-cyan-300" />
              Lunar Nodes
            </h4>
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-400">North Node (☊)</div>
                <div className="font-medium">
                  {northNode.sign 
                    ? `${capitalizeFirstLetter(northNode.sign)} ${formatDegree(northNode.degree ?? 0)}` 
                    : 'Calculating...'}
                  {northNode.isRetrograde ? ' ℞' : ''}
                </div>
                <div className="text-xs text-gray-400 mt-1">Karma you&apos;re growing toward</div>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-400">South Node (☋)</div>
                <div className="font-medium">
                  {southNode.sign 
                    ? `${capitalizeFirstLetter(southNode.sign)} ${formatDegree(southNode.degree ?? 0)}` 
                    : 'Calculating...'}
                  {southNode.isRetrograde ? ' ℞' : ''}
                </div>
                <div className="text-xs text-gray-400 mt-1">Past life expertise</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoonDisplay;
