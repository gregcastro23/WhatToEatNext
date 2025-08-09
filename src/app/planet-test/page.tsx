'use client';

// Add static generation marker
export const dynamic = 'force-static';

import dynamicImport from 'next/dynamic';
import React, { Suspense } from 'react';

// Use dynamic imports with no SSR
const PlanetaryHoursTest = dynamicImport(
  () => import('@/components/PlanetaryHours/PlanetaryHoursTest'),
  { ssr: false },
);

const SimplePlanetaryDisplay = dynamicImport(
  () => import('@/components/PlanetaryHours/SimplePlanetaryDisplay'),
  { ssr: false },
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
