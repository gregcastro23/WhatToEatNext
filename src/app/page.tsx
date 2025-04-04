'use client';

import { useState, useEffect } from 'react';
import ElementalEnergyDisplay from '@/components/ElementalDisplay/ElementalEnergyDisplay';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import MoonDisplay from '@/components/MoonDisplay';
import AstrologicalClock from '@/components/AstrologicalClock';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import ElementalAlchemicalDisplay from '@/components/ElementalAlchemicalDisplay';
import Clock from '@/components/Clock';

// Dynamically import FoodRecommender with loading state
const FoodRecommender = dynamic(
  () => import('@/components/FoodRecommender'),
  { loading: () => <div className="loading">Loading recommendations...</div>, ssr: false }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  
  // Only show after client-side hydration to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col space-y-8">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="w-full">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">What To Eat Next</h1>
          <button
            onClick={() => setShowDebug(prev => !prev)}
            className={`px-3 py-1 rounded text-sm ${
              showDebug ? 'bg-green-600 text-white' : 'bg-gray-200'
            }`}
          >
            {showDebug ? 'Debug Mode: ON' : 'Debug Mode: OFF'}
          </button>
        </header>

        {/* Initialize components */}
        <PlanetaryPositionInitializer />
        <Clock />
        
        {/* Food Recommender full width */}
        <div className="w-full mb-6">
          <Suspense fallback={<div>Loading food recommendations...</div>}>
            <FoodRecommender />
          </Suspense>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="space-y-6">
              <AstrologicalClock />
              <ElementalEnergyDisplay showDebug={showDebug} />
              <ElementalAlchemicalDisplay />
              <MoonDisplay />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-6">
              <Suspense fallback={<div>Loading cuisine recommendations...</div>}>
                <CuisineRecommender />
              </Suspense>
              <CookingMethods />
            </div>
          </div>
        </div>

        {showDebug && (
          <section className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-lg font-medium mb-2">Debug Information</h2>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({
                mounted,
                dateTime: new Date().toISOString(),
              }, null, 2)}
            </pre>
          </section>
        )}
      </div>
    </main>
  );
}
