'use client';

import { useState, useEffect } from 'react';

import { validatePlanetaryPositions } from '@/utils/astrologyValidation';

export default function PlanetaryPositionValidation() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-medium text-white">Celestial Positions Information</h3>
      </div>
      
      <p className="text-sm text-cyan-300 mb-3">
        These planetary positions are used for all alchemical calculations throughout the application.
      </p>
      
      <div className="flex items-center space-x-2 mb-3">
        <button 
          className="text-sm px-3 py-1 bg-purple-700 text-white font-medium rounded hover:bg-purple-600"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide Details&apos; : 'Show Details&apos;}
        </button>
      </div>
      
      {expanded && (
        <div className="space-y-2">
          <div className="p-3 border border-purple-700 rounded bg-purple-900 bg-opacity-30">
            <h4 className="font-medium mb-2 text-yellow-300">About Celestial Energy</h4>
            <p className="text-sm text-white">
              The positions shown above are used to calculate elemental energies that influence the recipe recommendations.
            </p>
            <p className="text-sm mt-2 text-white">
              Different planets contribute different energies: Sun and Moon are particularly influential, while outer planets 
              like Jupiter, Saturn, Uranus, Neptune, and Pluto contribute more subtle influences.
            </p>
            <p className="text-sm mt-2 text-white">
              Retrograde planets (marked with R) can reverse or internalize their usual effects.
            </p>
          </div>
          
          <div className="mt-4 text-xs text-cyan-300">
            <p>Positions are updated daily to reflect the current celestial alignments</p>
          </div>
        </div>
      )}
    </div>
  );
} 