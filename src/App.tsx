import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import RecipeComponent from '@/components/Recipe';
import type { Recipe } from '@/types/recipe';
import { LocationButton } from '@/components/LocationButton';
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider';
import ElementalEnergyDisplay from '@/components/ElementalEnergyDisplay';
import AlchemicalRecommendations from '@/components/AlchemicalRecommendations';
import CookingMethods from '@/components/CookingMethods';
import CuisineRecommender from '@/components/CuisineRecommender';
import PlanetaryPositionInitializer from '@/components/PlanetaryPositionInitializer';
import MoonDisplay from '@/components/MoonDisplay';
import AstrologicalClock from '@/components/AstrologicalClock';
import dynamic from 'next/dynamic';
import SunDisplay from '@/components/SunDisplay';

// Dynamically import FoodRecommender with loading state
const FoodRecommender = dynamic(
  () => import('@/components/FoodRecommender'),
  { loading: () => <div className="loading">Loading recommendations...</div>, ssr: false }
);

// Define a function to create default ingredients since the import is failing
function createDefaultIngredient(name: string = '') {
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

// Define a default recipe that conforms to the Recipe interface
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

// Just before the App function, add this missing function
// Implement the missing function used in useEffect
function initializeAlchemyEngine() {
  console.log('Initializing alchemy engine...');
  // This is a placeholder for the actual initialization logic
  // The real implementation would likely set up global state or load data
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [servings, setServings] = useState(4);
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

  // Initialize the alchemical engine on mount
  useEffect(() => {
    // Initialize the alchemize function
    initializeAlchemyEngine();
    
    // Mark as initialized
    setIsInitialized(true);
  }, []);

  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  return (
    <AlchemicalProvider>
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">What To Eat Next</h1>
        
        {/* Planetary position initializer helps fetch position data */}
        <PlanetaryPositionInitializer />
        
        {/* Food Recommender section - full width */}
        <div className="w-full mb-6">
          <FoodRecommender />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            <ElementalEnergyDisplay />
            <MoonDisplay />
            <SunDisplay />
            <AstrologicalClock />
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