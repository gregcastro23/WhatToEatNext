'use client';

import React from 'react';

import PlanetaryHoursDisplay from './PlanetaryHoursDisplay';

export default function PlanetaryHoursTest() {
  return (
    <div className='mx-auto max-w-4xl p-4'>
      <h1 className='mb-4 text-2xl font-bold'>Planetary Hours Display</h1>
      <div className='mb-6'>
        <PlanetaryHoursDisplay />
      </div>
      <div className='mb-6'>
        <h2 className='mb-2 text-xl font-semibold'>Compact Version</h2>
        <PlanetaryHoursDisplay compact={true} />
      </div>
    </div>
  );
}
