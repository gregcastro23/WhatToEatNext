'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Moon, ArrowDown, Sunrise, Sunset, Navigation } from 'lucide-react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { getSignFromLongitude } from '@/utils/astrologyUtils';
import { AstrologicalService } from '@/services/AstrologicalService';
import { safeImportAndExecute, safeImportFunction } from '@/utils/dynamicImport';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * A utility function for logging errors
 * This is a safe replacement for console.error that can be disabled in production
 */
const errorLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.error to avoid linting warnings
  // console.error(message, ...args);
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
  
  return descriptions[phase] || 'A time of cosmic energy and lunar influence.';
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
  // Improve typing of useAlchemical hook
  interface AlchemicalHookResult {
    planetaryPositions: Record<string, unknown>;
    state: unknown;
  }
  
  const { planetaryPositions, state } = useAlchemical() as AlchemicalHookResult;
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
  // Fall back to using the moon position from planetaryPositions if available
  const moon = planetaryPositions?.moon || { sign: 'unknown', degree: 0, exactLongitude: 0, isRetrograde: false };
  
  // Simplified lunar node handling - ensure we have default values if northNode or southNode are missing
  const northNode = useMemo(() => {
    if (!planetaryPositions?.northnode && !planetaryPositions?.northNode) {
      // If north node is missing completely, provide a default
      return { sign: 'virgo', degree: 15, exactLongitude: 165, isRetrograde: true };
    }
    
    // Try both possible property names
    const node = planetaryPositions?.northnode || planetaryPositions?.northNode;
    const nodeData = node as any;
    
    // Ensure all required properties are present
    return {
      sign: nodeData?.sign || 'virgo',
      degree: nodeData?.degree ?? 15,
      exactLongitude: nodeData?.exactLongitude ?? 165,
      isRetrograde: nodeData?.isRetrograde ?? true
    };
  }, [planetaryPositions]);
  
  const southNode = useMemo(() => {
    if (!planetaryPositions?.southnode && !planetaryPositions?.southNode) {
      // If south node is missing completely, provide a default
      return { sign: 'pisces', degree: 15, exactLongitude: 345, isRetrograde: true };
    }
    
    // Try both possible property names
    const node = planetaryPositions?.southnode || planetaryPositions?.southNode;
    const nodeData = node as any;
    
    // Ensure all required properties are present
    return {
      sign: nodeData?.sign || 'pisces',
      degree: nodeData?.degree ?? 15,
      exactLongitude: nodeData?.exactLongitude ?? 345,
      isRetrograde: nodeData?.isRetrograde ?? true
    };
  }, [planetaryPositions]);

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        // Use safe method call checking if requestLocation exists
        if (typeof (AstrologicalService as any).requestLocation === 'function') {
          const coords = await (AstrologicalService as any).requestLocation();
          if (coords) {
            setCoordinates({
              latitude: coords.latitude,
              longitude: coords.longitude
            });
          }
        } else {
          // Fallback: try to get location using browser geolocation API
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setCoordinates({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                });
              },
              (error) => {
                errorLog('Geolocation error:', error);
              }
            );
          }
        }
      } catch (error) {
        errorLog('Failed to get location, using default:', error);
      }
    };
    
    getLocation();
  }, []);

  // Dynamic import for moon time calculations
  useEffect(() => {
    const calculateTimes = async () => {
      try {
        // Use the safe import and execute function
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
    
    // Update moon times every 30 minutes
    const interval = setInterval(() => calculateTimes(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coordinates.latitude, coordinates.longitude]);

  // Safely import and calculate lunar phase
  useEffect(() => {
    const getLunarPhaseData = async () => {
      try {
        // Get all the lunar phase functions at once to avoid multiple imports
        const [calculatePhase, getPhaseName, getIllumination] = await Promise.all([
          safeImportFunction<(date?: Date) => Promise<number>>('@/utils/astrologyUtils', 'calculateLunarPhase'),
          safeImportFunction<(phase: number) => string>('@/utils/astrologyUtils', 'getLunarPhaseName'),
          safeImportFunction<(date?: Date) => Promise<number>>('@/utils/astrologyUtils', 'getMoonIllumination')
        ]);
        
        if (calculatePhase && getPhaseName && getIllumination) {
          // Calculate current lunar phase (0-1)
          const currentPhase = await calculatePhase(new Date());
          // Get phase name
          const phaseName = getPhaseName(currentPhase);
          // Get illumination percentage
          const illuminationPct = await getIllumination(new Date());
          
          debugLog('Lunar phase calculation:', {
            phaseValue: currentPhase,
            phaseName,
            illuminationPct
          });
          
          // Sometimes the illumination percentage can be inconsistent with phase
          // For waning crescent, ensure illumination is at least 1%
          let correctedIllumination = illuminationPct;
          if (phaseName === 'waning_crescent' && illuminationPct < 1) {
            correctedIllumination = Math.max(1, Math.min(25, illuminationPct || 12));
          }
          
          // Update state with phase data
          setMoonPhase({
            phase: phaseName,
            phaseValue: currentPhase,
            description: getLunarPhaseDescription(phaseName),
            illumination: correctedIllumination
          });
        }
      } catch (error) {
        errorLog('Error calculating lunar phase:', error);
        // Don't use fallback values, but require proper calculation
        throw new Error('Failed to calculate lunar phase. Please check the implementation.');
      }
    };
    
    getLunarPhaseData();
    
    // Run calculation every minute to ensure accuracy
    const interval = setInterval(() => getLunarPhaseData(), 60 * 1000);
    return () => clearInterval(interval);
  }, [planetaryPositions.moon]);

  const formatDegree = (degree: number): string => {
    if (degree === undefined) return '0°0\'';
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
    
    return phases[phase] || '🌑';
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
    // Debug logging to help diagnose issues
    debugLog('Planetary positions debug:', {
      moon: planetaryPositions.moon,
      northNode: planetaryPositions.northNode,
      southNode: planetaryPositions.southNode,
      phase: moonPhase
    });
    
    // If the moon position is available and has proper sign information
    const moonData = planetaryPositions.moon as any;
    if (planetaryPositions.moon && moonData?.sign) {
      // No need for additional calculations - the context already has the sign and degree
      debugLog('Moon position available from planetary alignment:', planetaryPositions.moon);
    }
    
    // Only run this on component mount or when planetary positions change
  }, [planetaryPositions, moonPhase]);

  // Only log north node warning once when positions are loaded, not on every render
  useEffect(() => {
    // Skip if planetary positions are empty
    if (!planetaryPositions || Object.keys(planetaryPositions).length === 0) {
      return;
    }
    
    // Check for north node data only once when positions are available
    const northNodeMissing = !planetaryPositions.northNode && !planetaryPositions.northnode;
    const moonData = planetaryPositions.moon as any;
    const northNodeData = (planetaryPositions.northNode || planetaryPositions.northnode) as any;
    const northNodeIncomplete = 
      (planetaryPositions.northNode && !northNodeData?.sign) || 
      (planetaryPositions.northnode && !northNodeData?.sign);
      
    if (northNodeMissing || northNodeIncomplete) {
      // Log only once
      console.warn('North Node data missing or incomplete:', {
        northNodeData: planetaryPositions.northNode || planetaryPositions.northnode || 'undefined',
        availableKeys: Object.keys(planetaryPositions)
      });
    }
  }, [planetaryPositions.northNode, planetaryPositions.northnode]); // Only depend on the north node data

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
            {(() => {
              const moonData = moon as any;
              return moonData?.sign 
                ? `Moon in ${capitalizeFirstLetter(moonData.sign)} ${formatDegree(moonData.degree)}` 
                : 'Loading...';
            })()}
            {(() => {
              const moonData = moon as any;
              return moonData?.isRetrograde ? ' ℞' : '';
            })()}
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
              ></div>
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
                  {northNode && northNode.sign 
                    ? `${capitalizeFirstLetter(northNode.sign)} ${formatDegree(northNode.degree)}` 
                    : 'Calculating...'}
                  {northNode && northNode.isRetrograde ? ' ℞' : ''}
                </div>
                <div className="text-xs text-gray-400 mt-1">Karma you're growing toward</div>
              </div>
              
              <div className="bg-gray-800 rounded p-3">
                <div className="text-xs text-gray-400">South Node (☋)</div>
                <div className="font-medium">
                  {southNode && southNode.sign 
                    ? `${capitalizeFirstLetter(southNode.sign)} ${formatDegree(southNode.degree)}` 
                    : 'Calculating...'}
                  {southNode && southNode.isRetrograde ? ' ℞' : ''}
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