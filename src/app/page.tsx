'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FoodRecommender from '../components/FoodRecommender';
import IngredientRecommender from '../components/IngredientRecommender';
import { AstrologicalProvider } from '../context/AstrologicalContext';
import Link from 'next/link';
import { Button } from '@mui/material';
import PlanetaryPositionInitializer from '../components/PlanetaryPositionInitializer';
import { initializeAlchemicalEngine } from '../utils/alchemyInitializer';

// Use dynamic import with SSR disabled for components that use client-side only features
const DynamicSearchComponent = dynamic(
  () => import('../components/SearchComponent'),
  { ssr: false }
);

const DynamicCuisineRecommender = dynamic(
  () => import('../components/CuisineRecommender'),
  { ssr: false }
);

const DynamicCookingMethods = dynamic(
  () => import('../components/CookingMethods'),
  { ssr: false }
);

const DynamicPlanetaryTimeDisplay = dynamic(
  () => import('../components/PlanetaryTimeDisplay'),
  { ssr: false }
);

// A wrapper component that only renders children when client-side
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  if (!hasMounted) {
    return null;
  }
  
  return <>{children}</>;
}

export default function Home() {
  // Initialize alchemical engine and track render count
  const [renderCount, setRenderCount] = useState(0);
  
  useEffect(() => {
    // Initialize the alchemical engine
    initializeAlchemicalEngine();
    setRenderCount(prev => prev + 1);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 text-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div style={{ fontSize: '10px', color: '#999', textAlign: 'right', width: '100%', marginBottom: '8px' }}>
          Page renders: {renderCount}
        </div>
      
        {/* Initialize planetary positions needed by all components */}
        <PlanetaryPositionInitializer />
        
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-indigo-900">What to Eat Next</h1>
          <p className="text-indigo-600 mb-4">
            Food recommendations based on the current celestial energies
          </p>
          
          {/* Display planetary day and hour information */}
          <ClientOnly>
            <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-sm">
              <DynamicPlanetaryTimeDisplay compact={true} />
            </div>
          </ClientOnly>
        </header>
        
        {/* Search Component */}
        <section className="mb-8">
          <ClientOnly>
            <DynamicSearchComponent />
          </ClientOnly>
        </section>
        
        {/* Navigation Jump Links */}
        <nav className="flex flex-wrap justify-center gap-4 mb-8 bg-white rounded-lg shadow-md p-4 sticky top-2 z-10">
          <a href="#cuisine" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cuisine Recommendations
          </a>
          <a href="#ingredients" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Ingredient Recommendations
          </a>
          <a href="#methods" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Cooking Methods
          </a>
        </nav>
        
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          <div id="cuisine" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <DynamicCuisineRecommender />
            </ClientOnly>
          </div>
          
          <div id="ingredients" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <IngredientRecommender />
            </ClientOnly>
          </div>
          
          <div id="methods" className="bg-white rounded-lg shadow-md p-5 w-full">
            <ClientOnly>
              <DynamicCookingMethods />
            </ClientOnly>
          </div>
        </div>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Astrological and chakra data is for demonstration purposes.
            All recommendations should be considered with proper discretion and personal needs.
          </p>
        </footer>
      </div>
    </main>
  );
}
