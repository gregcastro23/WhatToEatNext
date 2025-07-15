'use client';

import React, { useState } from 'react';
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import SunCalc from 'suncalc';

const AstroDebug: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { planetaryPositions, state } = useAlchemical();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="bg-gray-800 text-gray-200 px-3 py-1 rounded"
      >
        {expanded ? 'Hide Debug' : 'Show Debug'}
      </button>
      
      {expanded && (
        <div className="bg-gray-900 p-4 mt-2 rounded shadow-lg text-white overflow-auto max-h-96 w-96">
          <h3 className="font-bold mb-2">Astrological Debug Info</h3>
          
          <h4 className="font-semibold mt-2">State</h4>
          <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(state, null, 2)}
          </pre>
          
          <h4 className="font-semibold mt-2">Planetary Positions</h4>
          <pre className="text-xs bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(planetaryPositions, null, 2)}
          </pre>
          
          <button 
            onClick={() => {
              console.log('Current state:', state);
              console.log('Planetary positions:', planetaryPositions);
              try {
                console.log('SunCalc moon illumination:', SunCalc.getMoonIllumination(new Date()));
              } catch (error) {
                console.error('SunCalc test failed:', error);
              }
            }}
            className="mt-2 bg-blue-700 px-2 py-1 rounded text-xs"
          >
            Log Details to Console
          </button>
        </div>
      )}
    </div>
  );
};

export default AstroDebug; 