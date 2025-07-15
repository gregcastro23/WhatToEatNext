'use client';

import React, { useState } from 'react';
import { useAlchemicalBridge } from '@/hooks/useContextServiceBridge';
import { Loader2 } from 'lucide-react';

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
    servicesReady
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
      <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin mr-2" />
          <p>Loading planetary data...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg shadow-sm">
        <div className="text-red-500 p-2">
          <p>Error: {error.message}</p>
        </div>
      </div>
    );
  }
  
  // Get the current data source
  const dataSource = getDataSource();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Planetary Positions</h2>
        
        {/* Only show toggle if services are ready */}
        {servicesReady && (
          <div>
            <button
              onClick={toggleDataSource}
              className={`px-3 py-1 rounded-md ${
                showServiceData 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-700'
              }`}
            >
              {showServiceData ? 'Using Service Data' : 'Using Context Data'}
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-md p-3 mb-3">
        <p className="text-sm text-gray-500 mb-1">Time of day:</p>
        <p className="font-medium">{isDaytime ? 'Daytime' : 'Nighttime'}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(dataSource)
          .filter(([planet]) => ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(planet?.toLowerCase()))
          .map(([planet, data]: [string, any]) => (
            <div key={planet} className="bg-white rounded-md p-3 shadow-sm">
              <div className="flex justify-between">
                <h3 className="font-medium capitalize">{planet}</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {showServiceData && servicesReady ? 'Service' : 'Context'}
                </span>
              </div>
              
              {data && data.sign && (
                <p className="mt-1">
                  {data.sign.charAt(0)?.toUpperCase() + data.sign?.slice(1)}{' '}
                  {Math.floor(data.degree)}°
                  {data.isRetrograde && <span className="text-orange-500 ml-1">℞</span>}
                </p>
              )}
            </div>
          ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          Data source: {showServiceData && servicesReady 
            ? 'New Service Architecture' 
            : 'Legacy Context API'}
        </p>
      </div>
    </div>
  );
} 