'use client';

import React, { useState, useEffect } from 'react';

import { PlanetaryHourCalculator } from '../../lib/PlanetaryHourCalculator';

type PlanetType = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

export default function SimplePlanetaryDisplay() {
  const [currentHour, setCurrentHour] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<string>('');
  const [currentMinute, setCurrentMinute] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Create calculator instance
      const calculator = new PlanetaryHourCalculator();

      // Update function that will be called on mount and by interval
      const updateInfo = () => {
        try {
          // Get current planetary hour
          const hourInfo = calculator.getCurrentPlanetaryHour();
          if (hourInfo && typeof hourInfo.planet === 'string') {
            setCurrentHour(hourInfo.planet);
          }

          // Get current planetary day
          const dayPlanet = calculator.getCurrentPlanetaryDay();
          setCurrentDay(dayPlanet);

          // Get current planetary minute
          const minutePlanet = calculator.getCurrentPlanetaryMinute();
          setCurrentMinute(minutePlanet);

          // Update time
          setCurrentTime(new Date());
          setUpdateCount(prev => prev + 1);
        } catch (err) {
          setError(
            `Error updating planetary info: ${err instanceof Error ? err.message : String(err)}`,
          );
          console.error('Error updating planetary info:', err);
        }
      };

      // Initial update
      updateInfo();

      // Update every minute
      const intervalId = setInterval(updateInfo, 60000);

      // Cleanup
      return () => clearInterval(intervalId);
    } catch (err) {
      setError(
        `Error initializing calculator: ${err instanceof Error ? err.message : String(err)}`,
      );
      console.error('Error initializing calculator:', err);
    }
  }, []); // Empty dependency array - only run on mount

  // Create a formatted time string
  const timeString = currentTime.toLocaleTimeString();

  return (
    <div className='rounded-lg bg-white p-6 shadow-md'>
      <h2 className='mb-4 text-2xl font-bold'>Simple Planetary Display</h2>

      {error ? (
        <div className='mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700'>
          <p className='font-bold'>Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='rounded-lg bg-gray-100 p-4'>
            <p className='text-gray-500'>Current Time:</p>
            <p className='text-xl font-medium'>{timeString}</p>
            <p className='text-xs text-gray-500'>Updated {updateCount} times</p>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='rounded-lg bg-blue-50 p-4'>
              <p className='font-medium text-blue-500'>Planetary Day:</p>
              <p className='text-2xl'>{currentDay}</p>
            </div>

            <div className='rounded-lg bg-purple-50 p-4'>
              <p className='font-medium text-purple-500'>Planetary Hour:</p>
              <p className='text-2xl'>{currentHour}</p>
            </div>

            <div className='rounded-lg bg-green-50 p-4'>
              <p className='font-medium text-green-500'>Planetary Minute:</p>
              <p className='text-2xl'>{currentMinute}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
