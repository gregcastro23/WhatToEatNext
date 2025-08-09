'use client';

import React, { useState } from 'react';

import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { log } from '@/services/LoggingService';

const AstroDebug: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const { planetaryPositions, state } = useAlchemical();

  return (
    <div className='fixed bottom-4 right-4 z-50'>
      <button
        onClick={() => setExpanded(!expanded)}
        className='rounded bg-gray-800 px-3 py-1 text-gray-200'
      >
        {expanded ? 'Hide Debug' : 'Show Debug'}
      </button>

      {expanded && (
        <div className='mt-2 max-h-96 w-96 overflow-auto rounded bg-gray-900 p-4 text-white shadow-lg'>
          <h3 className='mb-2 font-bold'>Astrological Debug Info</h3>

          <h4 className='mt-2 font-semibold'>State</h4>
          <pre className='overflow-auto rounded bg-gray-800 p-2 text-xs'>
            {JSON.stringify(state, null, 2)}
          </pre>

          <h4 className='mt-2 font-semibold'>Planetary Positions</h4>
          <pre className='overflow-auto rounded bg-gray-800 p-2 text-xs'>
            {JSON.stringify(planetaryPositions, null, 2)}
          </pre>

          <button
            onClick={() => {
              log.info('Current state:', state);
              log.info('Planetary positions:', planetaryPositions);
              try {
                const SunCalc = require('suncalc');
                log.info('SunCalc moon illumination:', SunCalc.getMoonIllumination(new Date()));
              } catch (error) {
                console.error('SunCalc test failed:', error);
              }
            }}
            className='mt-2 rounded bg-blue-700 px-2 py-1 text-xs'
          >
            Log Details to Console
          </button>
        </div>
      )}
    </div>
  );
};

export default AstroDebug;
