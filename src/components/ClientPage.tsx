'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';


import AstrologicalClock from '@/components/AstrologicalClock';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';
import MoonDisplay from '@/components/MoonDisplay';
import OptimizedComponentWrapper from '@/components/OptimizedComponentWrapper';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import SunDisplay from '@/components/SunDisplay';
import Loading from '@/components/ui/Loading';
import { log } from '@/services/LoggingService';

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
    setRenderCount(prev => {
      log.info(`ClientPage rendered ${prev + 1} times`);
      return prev + 1;
    });
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