'use client';

import React, { useEffect, useState, useMemo } from 'react';
import @/components  from 'ui ';
import @/hooks  from 'useAstrologicalState ';
import @/components  from 'CookingMethods ';
import @/components  from 'CuisineRecommender ';
import @/components  from 'ElementalEnergyDisplay ';
import @/components  from 'PlanetaryPositionInitializer ';
import @/components  from 'MoonDisplay ';
import @/components  from 'AstrologicalClock ';
import next  from 'dynamic ';
import @/components  from 'SunDisplay ';
import @/components  from 'OptimizedComponentWrapper ';

// Wrap components with optimization
let OptimizedElementalEnergyDisplay = React.memo(ElementalEnergyDisplay);
let OptimizedMoonDisplay = React.memo(MoonDisplay);
let OptimizedSunDisplay = React.memo(SunDisplay);
let OptimizedAstrologicalClock = React.memo(AstrologicalClock);
let OptimizedCuisineRecommender = React.memo(CuisineRecommender);
let OptimizedCookingMethods = React.memo(CookingMethods);

// Dynamic imports with better error handling
let FoodRecommender = dynamic(() => import('@/components / (FoodRecommenderWrapper || 1)'), {
  loading: () => <Loading />,
  ssr: false,
});

export function ClientPage() {
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
    // console.log(`ClientPage rendered ${renderCount + 1} times`);
  }, []);

  return (
    <main className="flex flex-col items-center p-6 w-full max-w-screen-xl mx-auto">
      <div
        style={{
          fontSize: '10px',
          color: '#999',
          textAlign: 'right',
          width: '100%',
          marginBottom: '8px',
        }}
      >
        ClientPage renders: {renderCount}
      </div>

      <PlanetaryPositionInitializer />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Celestial Info */}
        <div className="space-y-6">
          <OptimizedComponentWrapper name="ElementalEnergyDisplay">
            <OptimizedElementalEnergyDisplay />
          </OptimizedComponentWrapper>

          <OptimizedComponentWrapper name="MoonDisplay">
            <OptimizedMoonDisplay />
          </OptimizedComponentWrapper>

          <OptimizedComponentWrapper name="SunDisplay">
            <OptimizedSunDisplay />
          </OptimizedComponentWrapper>

          <OptimizedComponentWrapper name="AstrologicalClock">
            <OptimizedAstrologicalClock />
          </OptimizedComponentWrapper>

          <OptimizedComponentWrapper name="FoodRecommender">
            <FoodRecommender />
          </OptimizedComponentWrapper>
        </div>

        {/* Right Column - Food Recommendations */}
        <div className="space-y-6">
          <OptimizedComponentWrapper name="CuisineRecommender">
            <OptimizedCuisineRecommender />
          </OptimizedComponentWrapper>

          <OptimizedComponentWrapper name="CookingMethods">
            <OptimizedCookingMethods />
          </OptimizedComponentWrapper>
        </div>
      </div>
    </main>
  );
}
