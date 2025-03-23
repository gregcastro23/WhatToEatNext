import axios from 'axios';
import type { Recipe } from '@/types/recipe';
import { SpoonacularElementalMapper } from './SpoonacularElementalMapper';

const API_KEY = 'c91fb9d66d284351929fff78e51cedf0';
const BASE_URL = 'https://api.spoonacular.com/recipes';

interface SpoonacularRecipe {
  id: number;
  title: string;
  cuisines: string[];
  readyInMinutes: number;
  servings: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
}

export class SpoonacularService {
  static async searchRecipes(params: {
    cuisine?: string;
    diet?: string;
    intolerances?: string;
    maxReadyTime?: number;
  }): Promise<Recipe[]> {
    try {
      const response = await axios.get(`${BASE_URL}/complexSearch`, {
        params: {
          ...params,
          apiKey: API_KEY,
          addRecipeNutrition: true,
          number: 20
        }
      });

      return response.data.results?.map(recipe => ({
        ...recipe,
        elementalProperties: this.calculateElementalProperties(recipe)
      })) || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  private static calculateElementalProperties(recipe: any): ElementalProperties {
    const ingredients = recipe.extendedIngredients || [];
    return ingredients.reduce((acc, ingredient) => ({
      Fire: acc.Fire + (ingredient.elementalProperties?.Fire || 0),
      Water: acc.Water + (ingredient.elementalProperties?.Water || 0),
      Earth: acc.Earth + (ingredient.elementalProperties?.Earth || 0),
      Air: acc.Air + (ingredient.elementalProperties?.Air || 0)
    }), { Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  private static mapToRecipe(spoonacularRecipe: SpoonacularRecipe): Recipe {
    const getNutrientAmount = (name: string) => {
      const nutrient = spoonacularRecipe.nutrition.nutrients.find(
        n => n.name.toLowerCase() === name.toLowerCase()
      );
      return nutrient?.amount || 0;
    };

    return {
      id: spoonacularRecipe.id.toString(),
      name: spoonacularRecipe.title,
      cuisine: spoonacularRecipe.cuisines[0] || 'unknown',
      timeToMake: `${spoonacularRecipe.readyInMinutes} minutes`,
      servingSize: spoonacularRecipe.servings,
      nutrition: {
        calories: getNutrientAmount('Calories'),
        protein: getNutrientAmount('Protein'),
        carbs: getNutrientAmount('Carbohydrates'),
        fat: getNutrientAmount('Fat')
      },
      mealType: ['any'],
      season: ['all'],
      elementalProperties: SpoonacularElementalMapper.mapRecipeToElemental(spoonacularRecipe)
    };
  }
} 