import { useState } from 'react';
import Header from './components/Header';
import RecipeComponent from './components/Recipe';
import type { Recipe } from '@/types/recipe';

// Define a default recipe that matches the Recipe component's expected type
const defaultRecipe: Recipe = {
  id: 'default',
  title: "Select a Recipe",
  ingredients: [{
    id: 'default-ingredient',
    amount: 0,
    unit: '',
    name: 'No ingredients yet'
  }],
  instructions: [],
  difficulty: 'easy'
};

function App() {
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(defaultRecipe);

  return (
    <div className="app">
      <Header onServingsChange={setServingsMultiplier} />
      <RecipeComponent 
        recipe={selectedRecipe} 
        servingsMultiplier={servingsMultiplier}
      />
    </div>
  );
}

export default App; 