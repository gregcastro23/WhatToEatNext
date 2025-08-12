'use client';

// Add static generation marker
export const dynamic = 'force-static';

import { Suspense } from 'react';

// Temporary lightweight fallbacks for missing components
const PlanetaryHoursTest = () => (
  <div className='text-gray-600'>PlanetaryHoursTest component unavailable.</div>
);

const SimplePlanetaryDisplay = () => (
  <div className='text-gray-600'>SimplePlanetaryDisplay component unavailable.</div>
);

export default function PlanetaryTestPage() {
  return (
    <div className='container mx-auto space-y-8 p-4'>
      <h1 className='mb-6 text-2xl font-bold'>Planetary Hours Testing Page</h1>

      <section className='rounded-lg bg-white p-4 shadow'>
        <h2 className='mb-4 text-xl font-bold'>Simple Version</h2>
        <Suspense fallback={<div>Loading simple display...</div>}>
          <SimplePlanetaryDisplay />
        </Suspense>
      </section>

      <section className='rounded-lg bg-white p-4 shadow'>
        <h2 className='mb-4 text-xl font-bold'>Full Component</h2>
        <Suspense fallback={<div>Loading full component...</div>}>
          <PlanetaryHoursTest />
        </Suspense>
      </section>
    </div>
  );
}
