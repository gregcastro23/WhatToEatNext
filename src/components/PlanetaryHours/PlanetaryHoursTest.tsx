'use client';

import React from 'react';
import PlanetaryHoursDisplay from './PlanetaryHoursDisplay';

export default function PlanetaryHoursTest() {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Planetary Hours Display</h1>
      <div className="mb-6">
        <PlanetaryHoursDisplay />
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Compact Version</h2>
        <PlanetaryHoursDisplay compact={true} />
      </div>
    </div>
  );
} 