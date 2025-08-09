'use client';

import { Sun, Clock, ArrowDown, Sunrise, Sunset } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { AstrologicalService } from '@/services/AstrologicalService';
import { safeImportAndExecute } from '@/utils/dynamicImport';
import { formatSunTime } from '@/utils/sunTimes';

const SunDisplay: React.FC = () => {
  const { planetaryPositions } = useAlchemical();
  const [expanded, setExpanded] = useState(false);
  const [sunTimes, setSunTimes] = useState({
    sunrise: null as Date | null,
    sunset: null as Date | null,
    solarNoon: null as Date | null,
    goldenHour: null as Date | null,
    calculating: true,
  });
  const [coordinates, setCoordinates] = useState({
    latitude: 40.7128, // Default to New York
    longitude: -74.006,
  });
  const [sunPosition, setSunPosition] = useState({
    azimuth: 0,
    altitude: 0,
  });

  // Get sun position from planetaryPositions if available
  const sun = planetaryPositions.sun || { sign: 'unknown', degree: 0 };

  // Get user's location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const astroService = AstrologicalService as unknown as Record<string, unknown>;
        const requestLocation = astroService.requestLocation;
        const coords =
          requestLocation && typeof requestLocation === 'function' ? await requestLocation() : null;
        if (coords) {
          setCoordinates({
            latitude: coords.latitude,
            longitude: coords.longitude,
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
        }>('@/utils/sunTimes', 'calculateSunTimes', [
          new Date(),
          coordinates.latitude,
          coordinates.longitude,
        ]);

        if (times) {
          setSunTimes({
            sunrise: times.sunrise,
            sunset: times.sunset,
            solarNoon: times.solarNoon,
            goldenHour: times.goldenHour,
            calculating: false,
          });
        } else {
          console.warn('Failed to calculate sun times, using defaults');
          setSunTimes(prev => ({ ...prev, calculating: false }));
        }

        // Get sun position with proper typing
        const position = await safeImportAndExecute<{
          azimuth: number;
          altitude: number;
        }>('@/utils/solarPositions', 'getSunPosition', [
          new Date(),
          coordinates.latitude,
          coordinates.longitude,
        ]);

        if (position) {
          setSunPosition({
            azimuth: position.azimuth,
            altitude: position.altitude,
          });
        } else {
          console.warn('Failed to calculate sun position');
        }
      } catch (error) {
        console.error('Error calculating sun data:', error);
        setSunTimes(prev => ({
          ...prev,
          calculating: false,
        }));
      }
    };

    calculateData();

    // Update sun position every minute
    const interval = setInterval(() => calculateData(), 60 * 1000);
    return () => clearInterval(interval);
  }, [coordinates.latitude, coordinates.longitude]);

  const formatDegree = (degree: number): string => {
    if (degree === undefined) return "0°0'";
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
    <div className='rounded-lg bg-amber-900 p-4 text-white'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='flex items-center text-xl font-medium'>
          <Sun className='mr-2 h-5 w-5 text-yellow-300' />
          Solar Energies
        </h3>

        <button
          onClick={() => setExpanded(!expanded)}
          className='text-yellow-300 hover:text-yellow-100'
        >
          <ArrowDown className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center'>
          <span className='mr-3 text-3xl'>☉</span>
          <div>
            <p className='font-medium'>
              {String((sun as Record<string, unknown>).sign || 'Unknown')}
            </p>
            <p className='text-sm text-amber-200'>
              {sun && (sun as Record<string, unknown>).degree !== undefined
                ? formatDegree(Number((sun as Record<string, unknown>).degree))
                : ''}
            </p>
          </div>
        </div>

        <div className='relative h-16 w-16 overflow-hidden rounded-full border-2 border-yellow-300 bg-amber-800'>
          <div
            className='absolute inset-0 bg-yellow-300'
            style={{
              height: `${100 - Math.min(100, Math.max(0, Math.round((sunPosition.altitude * 180) / Math.PI)))}%`,
              top: 0,
              borderRadius: '0 0 9999px 9999px',
            }}
          ></div>
        </div>
      </div>

      {expanded && (
        <div className='mt-4 border-t border-amber-700 pt-4'>
          <p className='mb-3 text-sm text-amber-200'>
            The Sun in {String((sun as Record<string, unknown>).sign || 'your sign')} brings energy
            of confidence, vitality, and creative expression.
          </p>

          <div className='mt-2 rounded bg-amber-800 p-3'>
            <div className='mb-1 text-xs text-amber-300'>Daylight: {daylightPercentage}%</div>
            <div className='h-2.5 w-full rounded-full bg-amber-700'>
              <div
                className='h-2.5 rounded-full bg-yellow-300'
                style={{ width: `${daylightPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Sun Rise and Set Times */}
          <div className='mt-4 grid grid-cols-2 gap-3'>
            <div className='flex items-center rounded bg-amber-800 p-3'>
              <Sunrise className='mr-2 h-5 w-5 text-yellow-300' />
              <div>
                <div className='text-xs text-amber-300'>Sunrise</div>
                <div className='font-medium'>
                  {sunTimes.calculating
                    ? 'Calculating...'
                    : sunTimes.sunrise
                      ? formatSunTime(sunTimes.sunrise)
                      : 'Unknown'}
                </div>
              </div>
            </div>

            <div className='flex items-center rounded bg-amber-800 p-3'>
              <Sunset className='mr-2 h-5 w-5 text-orange-300' />
              <div>
                <div className='text-xs text-amber-300'>Sunset</div>
                <div className='font-medium'>
                  {sunTimes.calculating
                    ? 'Calculating...'
                    : sunTimes.sunset
                      ? formatSunTime(sunTimes.sunset)
                      : 'Unknown'}
                </div>
              </div>
            </div>

            <div className='col-span-2 flex items-center rounded bg-amber-800 p-3'>
              <Clock className='mr-2 h-5 w-5 text-yellow-300' />
              <div>
                <div className='text-xs text-amber-300'>Golden Hour</div>
                <div className='font-medium'>
                  {sunTimes.calculating
                    ? 'Calculating...'
                    : sunTimes.goldenHour
                      ? formatSunTime(sunTimes.goldenHour)
                      : 'Unknown'}
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
