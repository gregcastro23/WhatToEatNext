const axios = require('axios');
const { SpoonacularElementalMapper } = require('./SpoonacularElementalMapper');

const API_KEY = 'c91fb9d66d284351929fff78e51cedf0';
const BASE_URL = 'https://api.spoonacular.com/recipes';
const INGREDIENTS_URL = 'https://api.spoonacular.com/food/ingredients';

class SpoonacularService {
  static async searchRecipes(params) {
    try {
      const response = await axios.get(`${BASE_URL}/complexSearch`, {
        params: {
          ...params,
          apiKey: API_KEY,
          addRecipeNutrition: true,
          number: 20
        }
      });

      return response.data.results?.map((recipe) => this.mapToRecipe(recipe)) || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }
  }

  static async fetchVegetableData(vegetableName) {
    try {
      // Search for the vegetable by name
      const searchResponse = await axios.get(`${INGREDIENTS_URL}/search`, {
        params: {
          query: vegetableName,
          apiKey: API_KEY,
          number: 1
        }
      });

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn(`No results found for vegetable: ${vegetableName}`);
        return {};
      }

      const vegetableId = searchResponse.data.results[0].id;
      const vegetableName = searchResponse.data.results[0].name;

      // Get detailed information about the vegetable
      const detailsResponse = await axios.get(`${INGREDIENTS_URL}/${vegetableId}/information`, {
        params: {
          amount: 100,
          unit: 'grams',
          apiKey: API_KEY
        }
      });

      const vegetableData = detailsResponse.data;

      // Extract nutritional data
      const nutritionalProfile = {};
      if (vegetableData.nutrition && vegetableData.nutrition.nutrients) {
        vegetableData.nutrition.nutrients.forEach((nutrient) => {
          if (nutrient.name === 'Calories') {
            nutritionalProfile.calories = nutrient.amount;
          } else if (nutrient.name === 'Carbohydrates') {
            nutritionalProfile.carbs_g = nutrient.amount;
          } else if (nutrient.name === 'Fiber') {
            nutritionalProfile.fiber_g = nutrient.amount;
          } else if (nutrient.name === 'Protein') {
            nutritionalProfile.protein_g = nutrient.amount;
          }
        });

        const vitamins = [];
        const minerals = [];

        vegetableData.nutrition.nutrients.forEach((nutrient) => {
          if (nutrient.name.includes('Vitamin')) {
            vitamins.push(nutrient.name.replace('Vitamin ', '').toLowerCase());
          } else if (['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Zinc'].includes(nutrient.name)) {
            minerals.push(nutrient.name.toLowerCase());
          }
        });

        nutritionalProfile.vitamins = vitamins;
        nutritionalProfile.minerals = minerals;
      }

      // Map Spoonacular data to our IngredientMapping format
      const elementalProperties = SpoonacularElementalMapper.mapRecipeToElemental({
        nutrition: {
          nutrients: vegetableData.nutrition?.nutrients || []
        }
      });

      return {
        name: vegetableName,
        elementalProperties,
        category: 'vegetable',
        subCategory: 'vegetable',
        nutritionalProfile,
        // These would need to be manually enriched
        season: ['spring', 'summer', 'fall', 'winter'],
        cookingMethods: ['roast', 'boil', 'steam', 'saute'],
        qualities: ['nutritious']
      };
    } catch (error) {
      console.error(`Error fetching data for vegetable ${vegetableName}:`, error);
      return {};
    }
  }

  static calculateElementalProperties(recipe) {
    const ingredients = recipe.extendedIngredients || [];
    return ingredients.reduce((acc, ingredient) => ({
      Fire: acc.Fire + (ingredient.elementalProperties?.Fire || 0),
      Water: acc.Water + (ingredient.elementalProperties?.Water || 0),
      Earth: acc.Earth + (ingredient.elementalProperties?.Earth || 0),
      Air: acc.Air + (ingredient.elementalProperties?.Air || 0)
    }), { Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  static mapToRecipe(spoonacularRecipe) {
    const getNutrientAmount = (name) => {
      const nutrient = spoonacularRecipe.nutrition.nutrients.find(
        n => n.name.toLowerCase() === name.toLowerCase()
      );
      return nutrient?.amount || 0;
    };

    // Map the Spoonacular recipe to our Recipe interface
    return {
      id: spoonacularRecipe.id.toString(),
      name: spoonacularRecipe.title,
      description: `A delicious recipe featuring ${spoonacularRecipe.title}`,
      cuisine: spoonacularRecipe.cuisines[0] || 'unknown',
      timeToMake: `${spoonacularRecipe.readyInMinutes} minutes`,
      numberOfServings: spoonacularRecipe.servings,
      ingredients: [], // We need to fetch more data to get the ingredients
      instructions: [], // We need to fetch more data to get the instructions
      nutrition: {
        calories: getNutrientAmount('Calories'),
        protein: getNutrientAmount('Protein'),
        carbs: getNutrientAmount('Carbohydrates'),
        fat: getNutrientAmount('Fat')
      },
      mealType: ['any'],
      season: ['all'],
      elementalProperties: SpoonacularElementalMapper.mapRecipeToElemental ? 
        SpoonacularElementalMapper.mapRecipeToElemental(spoonacularRecipe) :
        { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
    };
  }
}

module.exports = { SpoonacularService }; 