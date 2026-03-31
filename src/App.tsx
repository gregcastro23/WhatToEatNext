import React, { useState, useEffect } from 'react';
import { Recipe } from '@/types/recipe';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import MoonDisplay from '@/components/MoonDisplay';
import AstrologicalClock from '@/components/AstrologicalClock';
import dynamic from 'next/dynamic';
import SunDisplay from '@/components/SunDisplay';
import { initializeAlchemicalEngine } from '@/utils/alchemyInitializer';

// Dynamically import FoodRecommender with loading state
const FoodRecommender = dynamic(
  () => import('@/components/FoodRecommender'),
  { loading: () => <div className="loading">Loading recommendations...</div>, ssr: false }
);

// Define a function to create default ingredients since the import is failing
function createDefaultIngredient(name = '') {
  return {
    id: `ingredient-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    amount: 1,
    unit: 'unit'
  };
}

// Add this type definition at the top of the file
type GeolocationCoordinates = {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
};

// Add this interface at the top of the file
interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins: string[];
  minerals: string[];
}

// Example recipe, intentionally unused but kept as reference
const defaultRecipe: Recipe = {
  id: 'default',
  name: "Select a Recipe",
  description: "No description available", // Add required property
  cuisine: "None", // Add required property
  ingredients: [
    createDefaultIngredient('No ingredients yet')
  ],
  instructions: ["No instructions yet"],
  timeToMake: "0 minutes",
  numberOfServings: 0, // Changed from servings to numberOfServings
  elementalProperties: {
    Fire: 0.25,
    Earth: 0.25,
    Air: 0.25,
    Water: 0.25
  }
};

// Define the available components for navigation
type ComponentName = 'foodRecommender' | 'elementalEnergy' | 'moonDisplay' | 'sunDisplay' | 'astrologicalClock' | 'cuisineRecommender' | 'cookingMethods';

function App() {
  // State variables with underscore prefix are intentionally kept for future use
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [servings, setServings] = useState(4);
  const [activeComponent, setActiveComponent] = useState<ComponentName>('foodRecommender');
  const [recipe, setRecipe] = useState<Recipe & { nutrition: NutritionInfo }>({
    id: 'custom-recipe-1',
    name: 'Example Recipe',
    description: 'A sample recipe to demonstrate the app functionality',
    // preparationTime and cookingTime are not in Recipe interface, but we'll keep them as additional properties
    preparationTime: 30,
    cookingTime: 45,
    numberOfServings: 4, // Changed from servings to numberOfServings
    // Removed difficulty property as it's not in the Recipe interface
    cuisine: 'Global',
    ingredients: [
      createDefaultIngredient('Ingredient 1'),
      createDefaultIngredient('Ingredient 2')
    ],
    instructions: ["Step 1: Mix ingredients", "Step 2: Cook"],
    nutrition: {
      calories: 500,
      protein: 20,
      carbs: 30,
      fat: 15,
      vitamins: ['A', 'C'],
      minerals: ['Iron', 'Zinc']
    },
    timeToMake: '30 minutes',
    season: ['spring', 'summer'],
    mealType: ['lunch', 'dinner'],
    elementalProperties: {
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.2,
      Water: 0.3
    }
  });

  // Initialize the alchemical engine
  initializeAlchemicalEngine();

  // Initialize the alchemical engine on mount
  useEffect(() => {
    // Mark as initialized
    setIsInitialized(true);
  }, []);

  // Servings handler - kept for future use
  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  // Navigation component definitions
  const navigationItems: { name: string; id: ComponentName }[] = [
    { name: 'Food Recommender', id: 'foodRecommender' },
    { name: 'Cuisine', id: 'cuisineRecommender' },
    { name: 'Cooking Methods', id: 'cookingMethods' },
    { name: 'Elemental Energy', id: 'elementalEnergy' },
    { name: 'Moon', id: 'moonDisplay' },
    { name: 'Sun', id: 'sunDisplay' },
    { name: 'Astrological Clock', id: 'astrologicalClock' }
  ];

  return (
    <AlchemicalProvider>
      <div className="w-full px-4 py-4">
        <h1 className="text-3xl font-bold mb-4 text-center">What To Eat Next</h1>
        
        {/* Planetary position initializer helps fetch position data */}
        <PlanetaryPositionInitializer />
        
        {/* Navigation bar for mobile */}
        <div className="w-full mb-4 overflow-x-auto">
          <div className="flex flex-row flex-nowrap space-x-2 pb-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveComponent(item.id)}
                className={`px-3 py-2 text-sm rounded-lg whitespace-nowrap ${
                  activeComponent === item.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content area - only show active component */}
        <div className="w-full">
          {/* Food Recommender */}
          {activeComponent === 'foodRecommender' && (
            <div className="mb-6">
              <FoodRecommender />
            </div>
          )}
          
          {/* Elemental Energy Display */}
          {activeComponent === 'elementalEnergy' && (
            <div className="mb-6">
              <ElementalEnergyDisplay />
            </div>
          )}
          
          {/* Moon Display */}
          {activeComponent === 'moonDisplay' && (
            <div className="mb-6">
              <MoonDisplay />
            </div>
          )}
          
          {/* Sun Display */}
          {activeComponent === 'sunDisplay' && (
            <div className="mb-6">
              <SunDisplay />
            </div>
          )}
          
          {/* Astrological Clock */}
          {activeComponent === 'astrologicalClock' && (
            <div className="mb-6">
              <AstrologicalClock />
            </div>
          )}
          
          {/* Cuisine Recommender */}
          {activeComponent === 'cuisineRecommender' && (
            <div className="mb-6">
              <CuisineRecommender />
            </div>
          )}
          
          {/* Cooking Methods */}
          {activeComponent === 'cookingMethods' && (
            <div className="mb-6">
              <CookingMethods />
            </div>
          )}
        </div>
      </div>
    </AlchemicalProvider>
  );
}

export default App; 