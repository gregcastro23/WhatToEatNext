import React, { useState } from 'react';
import Header from './components/Header';
import RecipeComponent from './components/Recipe';
import type { Recipe } from '@/types/recipe';
import { LocationButton } from './components/LocationButton';
import { createDefaultIngredient } from '@/types/recipeIngredient';

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
  ingredients: [
    createDefaultIngredient('No ingredients yet')
  ],
  instructions: ["No instructions yet"],
  timeToMake: "0 minutes",
  servings: 0,
  elementalProperties: {
    Fire: 0.25,
    Earth: 0.25,
    Air: 0.25,
    Water: 0.25
  }
};

const App: React.FC = () => {
  const [userLocation, setUserLocation] = useState<GeolocationCoordinates | null>(null);
  const [servings, setServings] = useState(4);
  const [recipe, setRecipe] = useState<Recipe & { nutrition: NutritionInfo }>({
    id: 'custom-recipe-1',
    name: 'Example Recipe',
    description: 'A sample recipe to demonstrate the app functionality',
    preparationTime: 30,
    cookingTime: 45,
    servings: 4,
    difficulty: 'medium',
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

  const handleServingsChange = (newServings: number) => {
    setServings(newServings);
  };

  return (
    <div className="app">
      <Header onServingsChange={handleServingsChange} />
      <LocationButton onLocationUpdate={setUserLocation} />
      <main>
        <RecipeComponent 
          recipe={recipe} 
          servingsMultiplier={servings / (recipe.servings || 1)}
          onIngredientClick={(ingredient) => {
            console.log('Ingredient clicked:', ingredient);
          }}
        />
      </main>
    </div>
  );
};

export default App; 