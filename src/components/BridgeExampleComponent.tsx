'use client';

import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { useAlchemicalBridge } from '@/hooks/useContextServiceBridge';

/**
 * Example component demonstrating the use of bridge hooks
 * during the transition from contexts to services
 */
export default function BridgeExampleComponent() {
  const [showServiceData, setShowServiceData] = useState(true);

  const {
    isLoading,
    error,
    planetaryPositions,
    contextPositions,
    servicePositions,
    isDaytime,
    servicesReady,
  } = useAlchemicalBridge();

  // Toggle between service and context data
  const toggleDataSource = () => {
    setShowServiceData(prev => !prev);
  };

  // Select the appropriate data source based on toggle and availability
  const getDataSource = () => {
    if (showServiceData && servicesReady) {
      return servicePositions;
    }
    return contextPositions;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className='rounded-lg bg-gray-100 p-4 shadow-sm'>
        <div className='flex items-center justify-center p-8'>
          <Loader2 className='mr-2 h-6 w-6 animate-spin text-blue-500' />
          <p>Loading planetary data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='rounded-lg bg-red-50 p-4 shadow-sm'>
        <div className='p-2 text-red-500'>
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  // Get the current data source
  const dataSource = getDataSource();

  return (
    <div className='rounded-lg bg-gray-100 p-4 shadow-sm'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>Planetary Positions</h2>

        {/* Only show toggle if services are ready */}
        {servicesReady && (
          <div>
            <button
              onClick={toggleDataSource}
              className={`rounded-md px-3 py-1 ${
                showServiceData ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
              }`}
            >
              {showServiceData ? 'Using Service Data' : 'Using Context Data'}
            </button>
          </div>
        )}
      </div>

      <div className='mb-3 rounded-md bg-white p-3'>
        <p className='mb-1 text-sm text-gray-500'>Time of day:</p>
        <p className='font-medium'>{isDaytime ? 'Daytime' : 'Nighttime'}</p>
      </div>

      {/* Planetary Positions Overview - using previously unused variable */}
      {planetaryPositions && Object.keys(planetaryPositions).length > 0 && (
        <div className='mb-3 rounded-md border bg-gradient-to-r from-purple-50 to-indigo-50 p-3'>
          <h3 className='mb-2 text-sm font-semibold text-purple-700'>
            🌌 Complete Planetary Overview
          </h3>
          <div className='grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-4'>
            {Object.entries(planetaryPositions)
              .filter(([_, data]) => data && typeof data === 'object')
              .map(([planet, data]: [string, any]) => {
                const sign = data.sign || 'unknown';
                const degree =
                  typeof data.degree === 'number'
                    ? data.degree
                    : typeof data.exactLongitude === 'number'
                      ? data.exactLongitude % 30
                      : 0;

                return (
                  <div key={planet} className='rounded bg-white p-2 shadow-sm'>
                    <div className='text-xs font-medium text-gray-700'>{planet}</div>
                    <div className='text-xs text-gray-500'>
                      {sign.charAt(0).toUpperCase() + sign.slice(1)} {degree.toFixed(1)}°
                    </div>
                    {data.isRetrograde && (
                      <span className='inline-block text-xs text-orange-500'>℞</span>
                    )}
                    {isDaytime && planet === 'Sun' && (
                      <span className='ml-1 inline-block text-xs text-yellow-500'>☀</span>
                    )}
                    {!isDaytime && planet === 'Moon' && (
                      <span className='ml-1 inline-block text-xs text-blue-400'>🌙</span>
                    )}
                  </div>
                );
              })}
          </div>
          <p className='mt-2 text-xs text-gray-500'>
            ℞ = Retrograde • {isDaytime ? '☀ Solar' : '🌙 Lunar'} emphasis active
          </p>
        </div>
      )}

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {Object.entries(dataSource)
          .filter(([planet]) =>
            ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(planet.toLowerCase()),
          )
          .map(([planet, data]: [string, any]) => (
            <div key={planet} className='rounded-md bg-white p-3 shadow-sm'>
              <div className='flex justify-between'>
                <h3 className='font-medium capitalize'>{planet}</h3>
                <span className='rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800'>
                  {showServiceData && servicesReady ? 'Service' : 'Context'}
                </span>
              </div>

              {data?.sign && (
                <p className='mt-1'>
                  {data.sign.charAt(0)?.toUpperCase() + data.sign?.slice(1)}{' '}
                  {Math.floor(data.degree)}°
                  {data.isRetrograde && <span className='ml-1 text-orange-500'>℞</span>}
                </p>
              )}
            </div>
          ))}
      </div>

      <div className='mt-4 text-xs text-gray-500'>
        <p>
          Data source:{' '}
          {showServiceData && servicesReady ? 'New Service Architecture' : 'Legacy Context API'}
        </p>
      </div>
    </div>
  );
}
