'use client';

import React, { useEffect, useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { calculateSunTimes, formatSunTime } from '@/utils/sunTimes';
import { getSunPosition } from '@/utils/solarPositions';
import { Sun, Clock, ArrowDown, Sunrise, Sunset } from 'lucide-react';
import { AstrologicalService } from '@/services/AstrologicalService';
import { safeImportAndExecute, safeImportFunction } from '@/utils/dynamicImport';

const SunDisplay: React.FC = () => {
  const { planetaryPositions } = useAlchemical();
  const [expanded, setExpanded] = useState(false);
  const [sunTimes, setSunTimes] = useState({
    sunrise: null as Date | null,
    sunset: null as Date | null,
    solarNoon: null as Date | null,
    goldenHour: null as Date | null,
    calculating: true
  });
  const [coordinates, setCoordinates] = useState({
    latitude: 40.7128, // Default to New York
    longitude: -74.0060
  });
  const [sunPosition, setSunPosition] = useState({
    azimuth: 0,
    altitude: 0
  });

  // Get sun position from planetaryPositions if available
  const sun = planetaryPositions.sun || { sign: 'unknown', degree: 0 };

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const coords = await AstrologicalService.requestLocation();
        if (coords) {
          setCoordinates({
            latitude: coords.latitude,
            longitude: coords.longitude
          });
        }
      } catch (error) {
        console.error('Failed to get location, using default:', error);
      }
    };
    
    getLocation();
  }, []);

  // Calculate sun times and position based on location
  useEffect(() => {
    const calculateData = async () => {
      try {
        // Use safe import and execute with proper typing
        const times = await safeImportAndExecute<{
          sunrise: Date;
          sunset: Date;
          solarNoon: Date;
          goldenHour: Date;
        }>(
          '@/utils/sunTimes',
          'calculateSunTimes',
          [new Date(), coordinates.latitude, coordinates.longitude]
        );
        
        if (times) {
          setSunTimes({
            sunrise: times.sunrise,
            sunset: times.sunset,
            solarNoon: times.solarNoon,
            goldenHour: times.goldenHour,
            calculating: false
          });
        } else {
          console.warn('Failed to calculate sun times, using defaults');
          setSunTimes(prev => ({ ...prev, calculating: false }));
        }
        
        // Get sun position with proper typing
        const position = await safeImportAndExecute<{
          azimuth: number;
          altitude: number;
        }>(
          '@/utils/solarPositions',
          'getSunPosition',
          [new Date(), coordinates.latitude, coordinates.longitude]
        );
        
        if (position) {
          setSunPosition({
            azimuth: position.azimuth,
            altitude: position.altitude
          });
        } else {
          console.warn('Failed to calculate sun position');
        }
      } catch (error) {
        console.error('Error calculating sun data:', error);
        setSunTimes(prev => ({
          ...prev,
          calculating: false
        }));
      }
    };
    
    calculateData();
    
    // Update sun position every minute
    const interval = setInterval(() => calculateData(), 60 * 1000);
    return () => clearInterval(interval);
  }, [coordinates.latitude, coordinates.longitude]);

  const formatDegree = (degree: number): string => {
    if (degree === undefined) return '0°0\'';
    const wholeDegree = Math.floor(degree);
    const minutes = Math.floor((degree - wholeDegree) * 60);
    return `${wholeDegree}°${minutes}'`;
  };

  // Calculate daylight percentage
  const getDaylightPercentage = (): number => {
    if (!sunTimes.sunrise || !sunTimes.sunset) return 50;
    
    const now = new Date();
    
    // If before sunrise or after sunset, return 0
    if (now < sunTimes.sunrise || now > sunTimes.sunset) return 0;
    
    // Calculate percentage of daylight elapsed
    const daylightTotal = sunTimes.sunset.getTime() - sunTimes.sunrise.getTime();
    const daylightElapsed = now.getTime() - sunTimes.sunrise.getTime();
    
    return Math.round((daylightElapsed / daylightTotal) * 100);
  };

  const daylightPercentage = getDaylightPercentage();

  return (
    <div className="bg-amber-900 rounded-lg p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium flex items-center">
          <Sun className="w-5 h-5 mr-2 text-yellow-300" />
          Solar Energies
        </h3>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-yellow-300 hover:text-yellow-100"
        >
          <ArrowDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">☉</span>
          <div>
            <p className="font-medium">{sun.sign || 'Unknown'}</p>
            <p className="text-sm text-amber-200">
              {sun && sun.degree !== undefined ? formatDegree(sun.degree) : ''}
            </p>
          </div>
        </div>
        
        <div className="w-16 h-16 relative rounded-full border-2 border-yellow-300 overflow-hidden bg-amber-800">
          <div 
            className="absolute inset-0 bg-yellow-300"
            style={{
              height: `${100 - Math.min(100, Math.max(0, Math.round(sunPosition.altitude * 180/Math.PI)))}%`,
              top: 0,
              borderRadius: '0 0 9999px 9999px'
            }}
          ></div>
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 border-t border-amber-700 pt-4">
          <p className="text-sm text-amber-200 mb-3">
            The Sun in {sun.sign} brings energy of confidence, vitality, and creative expression.
          </p>
          
          <div className="bg-amber-800 rounded p-3 mt-2">
            <div className="text-xs text-amber-300 mb-1">Daylight: {daylightPercentage}%</div>
            <div className="w-full bg-amber-700 rounded-full h-2.5">
              <div
                className="bg-yellow-300 h-2.5 rounded-full"
                style={{ width: `${daylightPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {/* Sun Rise and Set Times */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-amber-800 rounded p-3 flex items-center">
              <Sunrise className="w-5 h-5 mr-2 text-yellow-300" />
              <div>
                <div className="text-xs text-amber-300">Sunrise</div>
                <div className="font-medium">
                  {sunTimes.calculating 
                    ? 'Calculating...' 
                    : (sunTimes.sunrise ? formatSunTime(sunTimes.sunrise) : 'Unknown')}
                </div>
              </div>
            </div>
            
            <div className="bg-amber-800 rounded p-3 flex items-center">
              <Sunset className="w-5 h-5 mr-2 text-orange-300" />
              <div>
                <div className="text-xs text-amber-300">Sunset</div>
                <div className="font-medium">
                  {sunTimes.calculating 
                    ? 'Calculating...' 
                    : (sunTimes.sunset ? formatSunTime(sunTimes.sunset) : 'Unknown')}
                </div>
              </div>
            </div>
            
            <div className="bg-amber-800 rounded p-3 flex items-center col-span-2">
              <Clock className="w-5 h-5 mr-2 text-yellow-300" />
              <div>
                <div className="text-xs text-amber-300">Golden Hour</div>
                <div className="font-medium">
                  {sunTimes.calculating 
                    ? 'Calculating...' 
                    : (sunTimes.goldenHour ? formatSunTime(sunTimes.goldenHour) : 'Unknown')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SunDisplay; 