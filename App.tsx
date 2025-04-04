import React from 'react';
import { AlchemicalProvider } from './src/contexts/AlchemicalContext';
import PlanetaryPositionInitializer from './src/components/PlanetaryPositionInitializer';
import ElementalEnergyDisplay from './src/components/ElementalEnergyDisplay';
import MoonDisplay from './src/components/MoonDisplay';
import AstrologicalClock from './src/components/AstrologicalClock';
import FoodRecommender from './src/components/FoodRecommender';
import CuisineRecommender from './src/components/CuisineRecommender';
import CookingMethods from './src/components/CookingMethods';

function App() {
  return (
    <AlchemicalProvider>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">What To Eat Next</h1>
        
        {/* Planetary position initializer helps fetch position data */}
        <PlanetaryPositionInitializer />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ElementalEnergyDisplay />
            <MoonDisplay />
            <AstrologicalClock />
            <FoodRecommender />
          </div>
          
          {/* Right column */}
          <div className="space-y-6">
            <CuisineRecommender />
            <CookingMethods />
          </div>
        </div>
      </div>
    </AlchemicalProvider>
  );
}

export default App; 