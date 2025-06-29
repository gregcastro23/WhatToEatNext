'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Loading from '@/components/ui/Loading';
import { useAstrologicalState } from '@/hooks/useAstrologicalState';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import MoonDisplay from '@/components/MoonDisplay';
import AstrologicalClock from '@/components/AstrologicalClock';
import dynamic from 'next/dynamic';
import SunDisplay from '@/components/SunDisplay';
import OptimizedComponentWrapper from '@/components/OptimizedComponentWrapper';

// Wrap components with optimization
const OptimizedElementalEnergyDisplay = React.memo(ElementalEnergyDisplay);
const OptimizedMoonDisplay = React.memo(MoonDisplay);
const OptimizedSunDisplay = React.memo(SunDisplay);
const OptimizedAstrologicalClock = React.memo(AstrologicalClock);
const OptimizedCuisineRecommender = React.memo(CuisineRecommender);
const OptimizedCookingMethods = React.memo(CookingMethods);

// Dynamic imports with better error handling
const FoodRecommender = dynamic(
  () => import('@/components/FoodRecommender'),
  { loading: () => <Loading />, ssr: false }
);

export function ClientPage() {
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    // console.log(`ClientPage rendered ${renderCount + 1} times`);
  }, []);
  
  return (
    <main className="flex flex-col items-center p-6 w-full max-w-screen-xl mx-auto">
      <div style={{ fontSize: '10px', color: '#999', textAlign: 'right', width: '100%', marginBottom: '8px' }}>
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