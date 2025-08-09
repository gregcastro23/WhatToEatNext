'use client';

import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useServices } from '@/hooks/useServices';

export default function SimplePlanetaryDisplayMigrated() {
  const { isLoading, error: serviceError, astrologyService } = useServices();

  const [currentHour, setCurrentHour] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<string>('');
  const [currentMinute, setCurrentMinute] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || serviceError || !astrologyService) {
      return;
    }

    // Update function that will be called on mount and by interval
    const updateInfo = async () => {
      try {
        // Get current planetary hour
        const hourInfo = await astrologyService.getCurrentPlanetaryHour();
        const hourInfoData = hourInfo as any;
        if (hourInfo && typeof hourInfoData?.planet === 'string') {
          setCurrentHour(hourInfoData.planet);
        } else if (typeof hourInfo === 'string') {
          setCurrentHour(hourInfo);
        }

        // Get current planetary day
        const dayPlanet = await (astrologyService as any)?.getCurrentPlanetaryDay?.();
        setCurrentDay(dayPlanet || 'Unknown');

        // Get current planetary minute
        const minutePlanet = await (astrologyService as any)?.getCurrentPlanetaryMinute?.();
        setCurrentMinute(minutePlanet || 'Unknown');

        // Update time
        setCurrentTime(new Date());
        setUpdateCount(prev => prev + 1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error updating planetary info: ${errorMessage}`);
        console.error('Error updating planetary info:', err);
      }
    };

    // Initial update
    void updateInfo();

    // Update every minute
    const intervalId = setInterval(() => void updateInfo(), 60000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [isLoading, serviceError, astrologyService]); // Dependencies include services

  // Create a formatted time string
  const timeString = currentTime.toLocaleTimeString();

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex min-h-[300px] items-center justify-center rounded-lg bg-white p-6 shadow-md'>
        <div className='text-center'>
          <Loader2 className='mx-auto mb-2 h-8 w-8 animate-spin text-blue-500' />
          <p>Loading planetary data...</p>
        </div>
      </div>
    );
  }

  // Show service error state
  if (serviceError) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <div className='mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700'>
          <p className='font-bold'>Service Error:</p>
          <p>{serviceError.message}</p>
        </div>
      </div>
    );
  }

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
