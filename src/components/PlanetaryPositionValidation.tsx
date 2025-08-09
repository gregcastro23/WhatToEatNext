'use client';

import { useState, useEffect } from 'react';

export default function PlanetaryPositionValidation() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='mt-6 rounded-lg bg-gray-800 bg-opacity-50 p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h3 className='text-xl font-medium text-white'>Celestial Positions Information</h3>
      </div>

      <p className='mb-3 text-sm text-cyan-300'>
        These planetary positions are used for all alchemical calculations throughout the
        application.
      </p>

      <div className='mb-3 flex items-center space-x-2'>
        <button
          className='rounded bg-purple-700 px-3 py-1 text-sm font-medium text-white hover:bg-purple-600'
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {expanded && (
        <div className='space-y-2'>
          <div className='rounded border border-purple-700 bg-purple-900 bg-opacity-30 p-3'>
            <h4 className='mb-2 font-medium text-yellow-300'>About Celestial Energy</h4>
            <p className='text-sm text-white'>
              The positions shown above are used to calculate elemental energies that influence the
              recipe recommendations.
            </p>
            <p className='mt-2 text-sm text-white'>
              Different planets contribute different energies: Sun and Moon are particularly
              influential, while outer planets like Jupiter, Saturn, Uranus, Neptune, and Pluto
              contribute more subtle influences.
            </p>
            <p className='mt-2 text-sm text-white'>
              Retrograde planets (marked with R) can reverse or internalize their usual effects.
            </p>
          </div>

          <div className='mt-4 text-xs text-cyan-300'>
            <p>Positions are updated daily to reflect the current celestial alignments</p>
          </div>
        </div>
      )}
    </div>
  );
}
