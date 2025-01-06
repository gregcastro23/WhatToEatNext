import { cuisines } from '@/data/cuisines';
import type { Recipe } from '@/types/recipe';

// Helper function to flatten dishes from all cuisines
const flattenDishes = () => {
  const allDishes: Recipe[] = [];
  let id = 1;

  Object.entries(cuisines).forEach(([cuisineType, cuisineData]) => {
    // Skip if cuisineData is not properly structured
    if (!cuisineData?.dishes) return;

    // Handle breakfast, lunch, dinner, dessert
    Object.entries(cuisineData.dishes).forEach(([mealType, mealData]) => {
      // Handle all, summer, winter, etc.
      if (typeof mealData === 'object') {
        Object.entries(mealData).forEach(([season, dishes]) => {
          if (Array.isArray(dishes)) {
            dishes.forEach(dish => {
              if (dish.name && dish.description) {
                allDishes.push({
                  id: id++,
                  name: dish.name,
                  cuisine: cuisineType,
                  prepTime: dish.timeToMake || '30 mins',
                  difficulty: calculateDifficulty(dish),
                  description: dish.description
                });
              }
            });
          }
        });
      }
    });
  });

  return allDishes;
};

// Helper function to calculate difficulty based on preparation time and ingredients
const calculateDifficulty = (dish: any): 'Easy' | 'Medium' | 'Hard' => {
  if (!dish.timeToMake || !dish.ingredients) return 'Medium';
  
  const prepTimeMinutes = parseInt(dish.timeToMake);
  const ingredientCount = Array.isArray(dish.ingredients) ? dish.ingredients.length : 0;

  if (prepTimeMinutes > 60 || ingredientCount > 10) return 'Hard';
  if (prepTimeMinutes > 30 || ingredientCount > 5) return 'Medium';
  return 'Easy';
};

export const recipes = flattenDishes();