'use client';

import React, { useEffect, useState } from 'react';
import { useAstrology } from '../hooks/useAstrology';

interface AstrologyWarningProps {
  latitude?: number;
  longitude?: number;
}

/**
 * Component that shows astrological data or a warning if data can't be loaded
 */
export const AstrologyWarning: React.FC<AstrologyWarningProps> = ({ 
  latitude = 40.7128, // Default to NYC coordinates
  longitude = -74.0060
}) => {
  const [retryCount, setRetryCount] = useState(0);
  
  const { 
    loading, 
    error, 
    data, 
    fetchAstrologyData, 
    getDominantElement,
    refreshData
  } = useAstrology({
    latitude,
    longitude,
    autoLoad: true,
    useFallback: true
  });

  const dominantElement = getDominantElement();
  
  // Handle retry logic with exponential backoff
  useEffect(() => {
    if (error && retryCount < 3) {
      const timeout = setTimeout(() => {
        console.log(`Retrying astrological data (attempt ${retryCount + 1})...`);
        refreshData();
        setRetryCount(prev => prev + 1);
      }, Math.pow(2, retryCount) * 1000); // Exponential backoff: 1s, 2s, 4s
      
      return () => clearTimeout(timeout);
    }
  }, [error, retryCount, refreshData]);

  return (
    <div className="p-4 rounded border shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Astrological Data</h3>
      
      {loading && (
        <div className="text-gray-600 animate-pulse">
          <p>Loading astrological data...</p>
          <div className="h-2 bg-gray-200 rounded mt-2 w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded mt-2 w-1/2"></div>
        </div>
      )}
      
      {error && (
        <div className="text-amber-600 bg-amber-50 p-3 rounded">
          <p className="font-medium">Warning:</p>
          <p>{error}</p>
          <button 
            onClick={() => {
              setRetryCount(0); // Reset retry count
              fetchAstrologyData(latitude, longitude);
            }}
            className="mt-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm transition"
            disabled={loading}
          >
            {loading ? 'Trying...' : 'Try Again'}
          </button>
        </div>
      )}
      
      {!loading && data.currentSign && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Current Sign:</span>
            <span>{data.currentSign}</span>
          </div>
          
          {data.lunarPhase && (
            <div className="flex justify-between">
              <span className="font-medium">Lunar Phase:</span>
              <span>{data.lunarPhase.replace(/_/g, ' ')}</span>
            </div>
          )}
          
          {data.elementalBalance && (
            <div>
              <p className="font-medium mb-1">Elemental Balance:</p>
              <div className="flex space-x-1 h-4 rounded overflow-hidden bg-gray-100">
                {Object.entries(data.elementalBalance).map(([element, value]) => (
                  <div 
                    key={element}
                    className={`h-full ${getElementColor(element)} transition-all duration-500 ease-in-out`}
                    style={{ width: `${value * 100}%` }}
                    title={`${element}: ${Math.round(value * 100)}%`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs mt-1">
                {Object.entries(data.elementalBalance).map(([element, value]) => (
                  <span key={element}>{element}: {Math.round(value * 100)}%</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-3 pt-3 border-t">
            <p>
              <span className="font-medium">Today's dominant element is</span>:{' '}
              <span className={`font-bold ${getElementTextColor(dominantElement)}`}>
                {dominantElement}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get element color
function getElementColor(element: string): string {
  switch (element) {
    case 'Fire': return 'bg-red-500';
    case 'Water': return 'bg-blue-500';
    case 'Earth': return 'bg-green-500';
    case 'Air': return 'bg-indigo-500';
    default: return 'bg-gray-500';
  }
}

// Helper function to get element text color
function getElementTextColor(element: string): string {
  switch (element) {
    case 'Fire': return 'text-red-600';
    case 'Water': return 'text-blue-600';
    case 'Earth': return 'text-green-600';
    case 'Air': return 'text-indigo-600';
    default: return 'text-gray-600';
  }
}

export default AstrologyWarning; 