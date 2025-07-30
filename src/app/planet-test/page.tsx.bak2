'use client';

// Add static generation marker
export const dynamic = 'force-static';

import dynamicImport from 'next/dynamic';
import React, { Suspense } from 'react';



// Use dynamic imports with no SSR
const PlanetaryHoursTest = dynamicImport(
  () => import('@/components/PlanetaryHours/PlanetaryHoursTest'),
  { ssr: false }
);

const SimplePlanetaryDisplay = dynamicImport(
  () => import('@/components/PlanetaryHours/SimplePlanetaryDisplay'),
  { ssr: false }
);

export default function PlanetaryTestPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Planetary Hours Testing Page</h1>
      
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Simple Version</h2>
        <Suspense fallback={<div>Loading simple display...</div>}>
          <SimplePlanetaryDisplay />
        </Suspense>
      </section>
      
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Full Component</h2>
        <Suspense fallback={<div>Loading full component...</div>}>
          <PlanetaryHoursTest />
        </Suspense>
      </section>
    </div>
  );
} 