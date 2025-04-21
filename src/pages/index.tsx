import React from 'react';
import { AlchemicalProvider } from '../contexts/AlchemicalContext/provider';
import CuisineRecommender from '../components/CuisineRecommender';
import CookingMethods from '../components/CookingMethods';
import FoodRecommender from '../components/FoodRecommender';
import PlanetaryPositionInitializer from '../components/PlanetaryPositionInitializer';
import AlchemicalDebug from '../components/Debug/AlchemicalDebug';
import TodaysRecommendation from '../components/TodaysRecommendation';

export default function Home() {
  return (
    <AlchemicalProvider>
      <div className="w-full px-4 py-4">
        <h1 className="text-3xl font-bold mb-6 text-center">What To Eat Next</h1>
        
        {/* Planetary position initializer to fetch position data */}
        <PlanetaryPositionInitializer />
        
        {/* Main components */}
        <div className="grid gap-8">
          {/* Today's Recommendation */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <TodaysRecommendation />
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Food Recommendations</h2>
            <FoodRecommender />
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Cuisine Recommendations</h2>
            <CuisineRecommender />
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Cooking Methods</h2>
            <CookingMethods />
          </section>
          
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Debug Information</h2>
            <AlchemicalDebug />
          </section>
        </div>
      </div>
    </AlchemicalProvider>
  );
} 