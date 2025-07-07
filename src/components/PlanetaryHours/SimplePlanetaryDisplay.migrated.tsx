'use client';

import React, { useState, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { Loader2 } from 'lucide-react';

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
        const hourInfoData = hourInfo as Record<string, unknown>;
        if (hourInfo && typeof hourInfoData?.planet === 'string') {
          setCurrentHour(hourInfoData.planet);
        } else if (typeof hourInfo === 'string') {
          setCurrentHour(hourInfo);
        }
        
        // Get current planetary day
        const astroService = astrologyService as Record<string, unknown>;
        const dayPlanet = await (astroService?.getCurrentPlanetaryDay as Function)?.();
        setCurrentDay(dayPlanet || 'Unknown');
        
        // Get current planetary minute
        const minutePlanet = await (astroService?.getCurrentPlanetaryMinute as Function)?.();
        setCurrentMinute(minutePlanet || 'Unknown');
        
        // Update time
        setCurrentTime(new Date());
        setUpdateCount(prev => prev + 1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Error updating planetary info: ${errorMessage}`);
        // console.error('Error updating planetary info:', err);
      }
    };
    
    // Initial update
    updateInfo();
    
    // Update every minute
    const intervalId = setInterval(updateInfo, 60000);
    
    // Cleanup
    return () => clearInterval(intervalId);
  }, [isLoading, serviceError, astrologyService]); // Dependencies include services

  // Create a formatted time string
  const timeString = currentTime.toLocaleTimeString();

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p>Loading planetary data...</p>
        </div>
      </div>
    );
  }

  // Show service error state
  if (serviceError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <p className="font-bold">Service Error:</p>
          <p>{serviceError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Simple Planetary Display</h2>
      
      {error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-500">Current Time:</p>
            <p className="text-xl font-medium">{timeString}</p>
            <p className="text-xs text-gray-500">Updated {updateCount} times</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-500 font-medium">Planetary Day:</p>
              <p className="text-2xl">{currentDay}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-500 font-medium">Planetary Hour:</p>
              <p className="text-2xl">{currentHour}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-500 font-medium">Planetary Minute:</p>
              <p className="text-2xl">{currentMinute}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 