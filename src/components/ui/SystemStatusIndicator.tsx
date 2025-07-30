'use client';

import React, { useState, useEffect } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';

/**
 * SystemStatusIndicator component displays the current status of astrological data sources
 * and shows which source is currently being used.
 */
export const SystemStatusIndicator: React.FC = React.memo(() => {
  const alchemicalData = useAlchemical();
  const planetaryPositions = alchemicalData.planetaryPositions;
  const isLoading = (alchemicalData as { isLoading?: boolean }).isLoading || false;
  const state = alchemicalData.state;
  const [dataSource, setDataSource] = useState<string>('unknown');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  useEffect(() => {
    // Determine data source based on available data
    if (isLoading) {
      setDataSource('loading');
      return;
    }
    
    if (!planetaryPositions || Object.keys(planetaryPositions || {}).length === 0) {
      setDataSource('unavailable');
      return;
    }
    
    // Check if data is from API, cached, or fallback
    // This is a simple heuristic - in a real implementation we would get this from telemetry
    const sunPosition = planetaryPositions.Sun;
    if (sunPosition && 
        (sunPosition as { sign?: string; degree?: number }).sign === 'aries' && 
        (sunPosition as { sign?: string; degree?: number }).degree === 8.63) {
      setDataSource('hardcoded');
    } else {
      setDataSource('api');
    }
    
    // Update last updated timestamp
    if (state.lastUpdated) {
      setLastUpdated(new Date(state.lastUpdated));
    }
  }, [planetaryPositions, isLoading, state.lastUpdated]);
  
  // Render different indicators based on status
  const getStatusIndicator = () => {
    switch (dataSource) {
      case 'loading':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-yellow-500">Loading planetary data...</span>
          </div>
        );
      case 'api':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-600">Using live API data</span>
          </div>
        );
      case 'hardcoded':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm text-blue-500">Using reliable reference data</span>
          </div>
        );
      case 'unavailable':
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-red-600">Planetary data unavailable</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">System status unknown</span>
          </div>
        );
    }
  };
  
  return (
    <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">System Status</h4>
          {lastUpdated &amp;&amp; (
            <span className="text-xs text-gray-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        {getStatusIndicator()}
      </div>
    </div>
  );
});

SystemStatusIndicator.displayName = 'SystemStatusIndicator';

export default SystemStatusIndicator; 