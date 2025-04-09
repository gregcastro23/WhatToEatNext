import axios from 'axios';
import { SpoonacularElementalMapper } from './SpoonacularElementalMapper';
import { Recipe, NutritionalProfile } from '../types/alchemy';
import { calculateEstimatedNutrition } from '../utils/nutritionUtils';
import { LocalRecipeService } from './LocalRecipeService';
import { Recipe as RecipeType } from '@/types/recipe';

const API_KEY = 'c91fb9d66d284351929fff78e51cedf0';
const BASE_URL = 'https://api.spoonacular.com/recipes';
const INGREDIENTS_URL = 'https://api.spoonacular.com/food/ingredients';

export interface SpoonacularSearchParams {
  cuisine?: string;
  query?: string;
  diet?: string;
  maxReadyTime?: number;
  number?: number;
  addRecipeInformation?: boolean;
  fillIngredients?: boolean;
  instructionsRequired?: boolean;
  addRecipeNutrition?: boolean;
}

export class SpoonacularService {
  private static API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';
  private static API_BASE_URL = 'https://api.spoonacular.com';
  
  /**
   * Search recipes with given parameters
   */
  static async searchRecipes(params: any): Promise<any[]> {
    // First check if we have enough local recipes that match the criteria
    const localRecipes = this.searchLocalRecipes(params);
    console.log(`Found ${localRecipes.length} matching local recipes`);
    
    // If we have enough local recipes (5 or more), just return those
    if (localRecipes.length >= 5) {
      console.log('Using only local recipes - no API call needed');
      return localRecipes;
    }
    
    // If we have some local recipes but not enough, adjust how many we need from the API
    const numberOfLocalRecipes = localRecipes.length;
    const numberToRequest = params.number ? Math.max(1, params.number - numberOfLocalRecipes) : 5;
    
    try {
      // Build API request parameters
      const apiParams = {
        ...params,
        apiKey: this.API_KEY,
        number: numberToRequest // Request only as many as we need to supplement local recipes
      };
      
      const queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(apiParams)) {
        queryParams.append(key, value.toString());
      }
      
      // Make API request
      console.log(`Making API request for ${numberToRequest} additional recipes`);
      const response = await axios.get(`${this.API_BASE_URL}/recipes/complexSearch?${queryParams.toString()}`);
      const apiRecipes = response.data.results;
      
      // Process API recipes to standardize their format
      const processedApiRecipes = this.processApiRecipes(apiRecipes);
      
      // Combine local and API recipes
      return [...localRecipes, ...processedApiRecipes];
    } catch (error) {
      console.error('Error fetching recipes from Spoonacular API:', error);
      // In case of API error, return any local recipes we found
      return localRecipes;
    }
  }
  
  /**
   * Search local recipes based on the same parameters used for the API
   */
  private static searchLocalRecipes(params: any): Recipe[] {
    const { cuisine, query, diet, intolerances, maxReadyTime, number = 10 } = params;
    
    // Search local recipes
    let localRecipes = [];
    
    try {
      // If cuisine is specified, filter by that first
      if (cuisine) {
        localRecipes = LocalRecipeService.getRecipesByCuisine(cuisine);
      } else {
        // Otherwise get all recipes
        localRecipes = LocalRecipeService.getAllRecipes();
      }
      
      // Apply filters similar to the API's parameters
      
      // Filter by query (search text)
      if (query) {
        const queryLower = query.toLowerCase();
        localRecipes = localRecipes.filter(recipe =>
          recipe.name.toLowerCase().includes(queryLower) ||
          recipe.description?.toLowerCase().includes(queryLower) ||
          recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(queryLower))
        );
      }
      
      // Filter by diet restrictions
      if (diet) {
        const diets = Array.isArray(diet) ? diet : [diet];
        localRecipes = localRecipes.filter(recipe => {
          // Match vegetarian diet
          if (diets.includes('vegetarian') && !recipe.isVegetarian) return false;
          
          // Match vegan diet
          if (diets.includes('vegan') && !recipe.isVegan) return false;
          
          // Match gluten-free diet
          if (diets.includes('gluten free') && !recipe.isGlutenFree) return false;
          
          // Match other diets as needed
          
          return true;
        });
      }
      
      // Filter by intolerances
      if (intolerances) {
        const intoleranceList = Array.isArray(intolerances) ? intolerances : [intolerances];
        localRecipes = localRecipes.filter(recipe => {
          // Check allergens field if it exists
          if (recipe.allergens && recipe.allergens.length > 0) {
            for (const intolerance of intoleranceList) {
              if (recipe.allergens.some(allergen => 
                allergen.toLowerCase().includes(intolerance.toLowerCase()))) {
                return false;
              }
            }
          }
          
          // Check for dairy intolerance
          if (intoleranceList.includes('dairy') && !recipe.isDairyFree) return false;
          
          // Check for gluten intolerance
          if (intoleranceList.includes('gluten') && !recipe.isGlutenFree) return false;
          
          return true;
        });
      }
      
      // Filter by max ready time if specified
      if (maxReadyTime) {
        const maxMinutes = parseInt(maxReadyTime);
        localRecipes = localRecipes.filter(recipe => {
          // Try to parse the timeToMake string to get minutes
          if (recipe.timeToMake) {
            const timeMatch = recipe.timeToMake.match(/(\d+)/);
            if (timeMatch) {
              const minutes = parseInt(timeMatch[1]);
              return minutes <= maxMinutes;
            }
          }
          return true; // If we can't determine time, include it anyway
        });
      }
      
      // Limit the number of results
      return localRecipes.slice(0, number);
    } catch (error) {
      console.error('Error searching local recipes:', error);
      return [];
    }
  }
  
  /**
   * Process API recipes to standardize their format 
   */
  private static processApiRecipes(apiRecipes: any[]): Recipe[] {
    return apiRecipes.map(recipe => ({
      id: String(recipe.id),
      name: recipe.title,
      description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '') : '',
      cuisine: recipe.cuisines?.[0] || '',
      ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => ({
        name: ing.name || ing.originalName,
        amount: ing.amount || 1,
        unit: ing.unit || '',
        preparation: ing.meta ? ing.meta.join(', ') : ''
      })) : [],
      instructions: recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? 
        recipe.analyzedInstructions[0].steps.map(step => step.step) : 
        recipe.instructions ? 
          recipe.instructions.split('.').filter(i => i.trim()) : 
          [],
      timeToMake: recipe.readyInMinutes ? `${recipe.readyInMinutes} minutes` : '30 minutes',
      prepTime: recipe.preparationMinutes ? `${recipe.preparationMinutes} minutes` : undefined,
      cookTime: recipe.cookingMinutes ? `${recipe.cookingMinutes} minutes` : undefined,
      numberOfServings: recipe.servings || 4,
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25
      },
      isVegetarian: recipe.vegetarian,
      isVegan: recipe.vegan,
      isGlutenFree: recipe.glutenFree,
      isDairyFree: recipe.dairyFree,
      nutrition: recipe.nutrition ? {
        calories: this.getNutrientValue(recipe.nutrition.nutrients, 'Calories'),
        protein: this.getNutrientValue(recipe.nutrition.nutrients, 'Protein'),
        carbs: this.getNutrientValue(recipe.nutrition.nutrients, 'Carbohydrates'),
        fat: this.getNutrientValue(recipe.nutrition.nutrients, 'Fat'),
        fiber: this.getNutrientValue(recipe.nutrition.nutrients, 'Fiber'),
        sugar: this.getNutrientValue(recipe.nutrition.nutrients, 'Sugar'),
        vitamins: this.getVitamins(recipe.nutrition.nutrients),
        minerals: this.getMinerals(recipe.nutrition.nutrients)
      } : undefined
    }));
  }
  
  private static getNutrientValue(nutrients: any[], name: string): number {
    if (!nutrients) return 0;
    const nutrient = nutrients.find((n: any) => n.name === name);
    return nutrient ? Math.round(nutrient.amount) : 0;
  }
  
  private static getVitamins(nutrients: any[]): string[] {
    if (!nutrients) return [];
    const vitaminNames = [
      'Vitamin A', 'Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5',
      'Vitamin B6', 'Vitamin B12', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K'
    ];
    
    return vitaminNames.filter(name => {
      const found = nutrients.find((n: any) => n.name === name);
      return found && found.amount > 0;
    });
  }
  
  private static getMinerals(nutrients: any[]): string[] {
    if (!nutrients) return [];
    const mineralNames = [
      'Calcium', 'Iron', 'Magnesium', 'Phosphorus',
      'Potassium', 'Zinc', 'Copper', 'Manganese', 'Selenium'
    ];
    
    return mineralNames.filter(name => {
      const found = nutrients.find((n: any) => n.name === name);
      return found && found.amount > 0;
    });
  }

  static async getRecipeInformationBulk(ids: number[]) {
    try {
      const response = await axios.get(`${BASE_URL}/informationBulk`, {
        params: {
          ids: ids.join(','),
          apiKey: API_KEY,
          includeNutrition: true
        }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching bulk recipe information:', error);
      return [];
    }
  }

  static async fetchVegetableData(searchVegetableName: string) {
    try {
      // Search for the vegetable by name
      const searchResponse = await axios.get(`${INGREDIENTS_URL}/search`, {
        params: {
          query: searchVegetableName,
          apiKey: API_KEY,
          number: 1
        }
      });

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn(`No results found for vegetable: ${searchVegetableName}`);
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
      const nutritionalProfile: any = {};
      if (vegetableData.nutrition && vegetableData.nutrition.nutrients) {
        vegetableData.nutrition.nutrients.forEach((nutrient: any) => {
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

        const vitamins: string[] = [];
        const minerals: string[] = [];

        vegetableData.nutrition.nutrients.forEach((nutrient: any) => {
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
      console.error(`Error fetching data for vegetable ${searchVegetableName}:`, error);
      return {};
    }
  }

  static calculateElementalProperties(recipe: any) {
    const ingredients = recipe.extendedIngredients || [];
    return ingredients.reduce((acc: any, ingredient: any) => ({
      Fire: acc.Fire + (ingredient.elementalProperties?.Fire || 0),
      Water: acc.Water + (ingredient.elementalProperties?.Water || 0),
      Earth: acc.Earth + (ingredient.elementalProperties?.Earth || 0),
      Air: acc.Air + (ingredient.elementalProperties?.Air || 0)
    }), { Fire: 0, Water: 0, Earth: 0, Air: 0 });
  }

  static mapToRecipe(spoonacularRecipe: any) {
    const getNutrientAmount = (name: string) => {
      const nutrient = spoonacularRecipe.nutrition?.nutrients?.find(
        (n: any) => n.name.toLowerCase() === name.toLowerCase()
      );
      return nutrient?.amount || 0;
    };

    // Extract cooking methods and equipment from analyzed instructions
    const cookingMethods = new Set<string>();
    const equipment = new Set<string>();
    
    if (spoonacularRecipe.analyzedInstructions && spoonacularRecipe.analyzedInstructions.length > 0) {
      spoonacularRecipe.analyzedInstructions.forEach((instruction: any) => {
        if (instruction.steps) {
          instruction.steps.forEach((step: any) => {
            // Add equipment from step
            if (step.equipment) {
              step.equipment.forEach((eq: any) => equipment.add(eq.name));
            }
          });
        }
      });
    }
    
    // Map cooking techniques based on keywords in instructions
    const cookingTechniques = ['roast', 'bake', 'fry', 'sauté', 'boil', 'steam', 'grill', 'poach', 'simmer', 'stir-fry'];
    const instructions = spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step).join(' ').toLowerCase() || '';
    
    cookingTechniques.forEach(technique => {
      if (instructions.includes(technique)) {
        cookingMethods.add(technique);
      }
    });

    // Process ingredients to ensure consistent format
    const ingredients = spoonacularRecipe.extendedIngredients?.map((ingredient: any) => ({
      name: ingredient.originalName || ingredient.name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      preparation: ingredient.meta?.join(', ') || '',
      notes: ingredient.notes || '',
      // Add more details if available
      id: ingredient.id?.toString(),
      category: ingredient.aisle?.split(';')?.[0],
      nutrients: ingredient.nutrition?.nutrients
    })) || [];

    // Extract vitamins and minerals from nutrition data
    const vitamins = [];
    const minerals = [];
    
    // Collect vitamin and mineral information
    if (spoonacularRecipe.nutrition && spoonacularRecipe.nutrition.nutrients) {
      const vitaminNames = [
        'Vitamin A', 'Vitamin B1', 'Vitamin B2', 'Vitamin B3', 'Vitamin B5',
        'Vitamin B6', 'Vitamin B12', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'Vitamin K'
      ];
      
      const mineralNames = [
        'Calcium', 'Iron', 'Magnesium', 'Phosphorus',
        'Potassium', 'Zinc', 'Copper', 'Manganese', 'Selenium'
      ];
      
      spoonacularRecipe.nutrition.nutrients.forEach((nutrient: any) => {
        if (vitaminNames.includes(nutrient.name) && nutrient.amount > 0) {
          vitamins.push(nutrient.name);
        } else if (mineralNames.includes(nutrient.name) && nutrient.amount > 0) {
          minerals.push(nutrient.name);
        }
      });
    }

    // Map the Spoonacular recipe to our Recipe interface with extended information
    return {
      id: spoonacularRecipe.id.toString(),
      name: spoonacularRecipe.title,
      description: spoonacularRecipe.summary 
        ? spoonacularRecipe.summary.replace(/<[^>]*>/g, '')  // Remove HTML tags
        : `A delicious recipe featuring ${spoonacularRecipe.title}`,
      cuisine: spoonacularRecipe.cuisines?.[0] || 'unknown',
      timeToMake: `${spoonacularRecipe.readyInMinutes} minutes`,
      prepTime: spoonacularRecipe.preparationMinutes ? `${spoonacularRecipe.preparationMinutes} minutes` : undefined,
      cookTime: spoonacularRecipe.cookingMinutes ? `${spoonacularRecipe.cookingMinutes} minutes` : undefined,
      numberOfServings: spoonacularRecipe.servings,
      ingredients,
      instructions: spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || 
                    (spoonacularRecipe.instructions ? spoonacularRecipe.instructions.split('.').filter((s: string) => s.trim()) : []),
      nutrition: {
        calories: getNutrientAmount('Calories'),
        protein: getNutrientAmount('Protein'),
        carbs: getNutrientAmount('Carbohydrates'),
        fat: getNutrientAmount('Fat'),
        fiber: getNutrientAmount('Fiber'),
        sugar: getNutrientAmount('Sugar'),
        vitamins,
        minerals,
        source: 'Spoonacular API'
      },
      mealType: spoonacularRecipe.dishTypes?.length ? [spoonacularRecipe.dishTypes[0]] : ['any'],
      dishTypes: spoonacularRecipe.dishTypes || [],
      season: ['all'],
      elementalProperties: SpoonacularElementalMapper.mapRecipeToElemental ? 
        SpoonacularElementalMapper.mapRecipeToElemental(spoonacularRecipe) :
        { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
      cookingMethods: Array.from(cookingMethods),
      tools: Array.from(equipment),
      preparationSteps: spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map((step: any) => step.step) || [],
      
      // Dietary information
      isVegetarian: spoonacularRecipe.vegetarian || false,
      isVegan: spoonacularRecipe.vegan || false,
      isGlutenFree: spoonacularRecipe.glutenFree || false,
      isDairyFree: spoonacularRecipe.dairyFree || false,
      
      // Additional properties
      servingSize: `${spoonacularRecipe.servings} servings`,
      spiceLevel: spoonacularRecipe.spiceScore ? 
        (spoonacularRecipe.spiceScore > 80 ? 'High' : 
         spoonacularRecipe.spiceScore > 40 ? 'Medium' : 'Low') : 'Medium',
      
      // Source information
      sourceName: spoonacularRecipe.sourceName,
      sourceUrl: spoonacularRecipe.sourceUrl,
      
      // Image if available
      image: spoonacularRecipe.image,
      
      // Additional information if available
      healthScore: spoonacularRecipe.healthScore,
      readyInMinutes: spoonacularRecipe.readyInMinutes,
      creditsText: spoonacularRecipe.creditsText,
      
      matchScore: 0.7 // Default match score for Spoonacular recipes
    };
  }

  static async getRecipeNutritionByIngredients(ingredients: any[]): Promise<any> {
    try {
      // Extract ingredient names and filter out empty strings
      const ingredientNames = ingredients
        .map(ing => typeof ing === 'string' ? ing : ing.name)
        .filter(Boolean);

      if (!ingredientNames.length) {
        return {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          vitamins: [],
          minerals: [],
          source: 'Default values due to no ingredients'
        };
      }

      // Take the top 5 ingredients for a more focused search
      const topIngredients = ingredientNames.slice(0, 5);
      
      // First attempt: Try to find a recipe by ingredients
      try {
        const findByIngredientsUrl = `${BASE_URL}/recipes/findByIngredients`;
        const findResponse = await axios.get(findByIngredientsUrl, {
          params: {
            apiKey: API_KEY,
            ingredients: topIngredients.join(','),
            number: 1,
            ranking: 1
          }
        });

        if (findResponse.data && findResponse.data.length > 0) {
          const recipeId = findResponse.data[0].id;
          
          // Fetch nutritional information for the found recipe
          const nutritionUrl = `${BASE_URL}/recipes/${recipeId}/nutritionWidget.json`;
          const nutritionResponse = await axios.get(nutritionUrl, {
            params: {
              apiKey: API_KEY
            }
          });
          
          if (nutritionResponse.data) {
            // Extract nutritional information
            const nutrition = nutritionResponse.data;
            const nutrients = nutrition.nutrients || [];
            
            // Find nutrient values
            const calories = this.findNutrientAmount(nutrients, 'Calories');
            const protein = this.findNutrientAmount(nutrients, 'Protein');
            const carbs = this.findNutrientAmount(nutrients, 'Carbohydrates');
            const fat = this.findNutrientAmount(nutrients, 'Fat');
            const fiber = this.findNutrientAmount(nutrients, 'Fiber');
            const sugar = this.findNutrientAmount(nutrients, 'Sugar');
            
            // Extract vitamins and minerals
            const vitamins = [];
            const minerals = [];
            
            (nutrition.nutrients || []).forEach((nutrient: any) => {
              const name = nutrient.name;
              if (name.includes('Vitamin')) {
                vitamins.push(name);
              } else if (['Calcium', 'Iron', 'Magnesium', 'Zinc', 'Phosphorus', 'Potassium', 'Sodium', 'Selenium'].includes(name)) {
                minerals.push(name);
              }
            });
            
            return {
              calories,
              protein,
              carbs,
              fat,
              fiber,
              sugar,
              vitamins,
              minerals,
              source: 'Spoonacular API - Ingredient Match'
            };
          }
        }
      } catch (innerError) {
        console.log('Error finding recipe by ingredients:', innerError);
        // Continuing to fallback options
      }
      
      // Second attempt: Try to search for recipe by title
      try {
        return await this.getRecipeNutritionByTitle(ingredientNames.join(' '));
      } catch (searchError) {
        console.log('Error searching recipe by title:', searchError);
        // Continuing to fallback options
      }
      
      // Final fallback: Use local estimation
      return calculateEstimatedNutrition(ingredients);
      
    } catch (error) {
      console.error('Error getting recipe nutrition by ingredients:', error);
      // Fallback to local estimation if all API attempts fail
      return calculateEstimatedNutrition(ingredients);
    }
  }

  // Helper function to find nutrient amount
  private findNutrientAmount(nutrients: any[], name: string): number {
    const nutrient = nutrients.find((n: any) => n.name === name);
    return nutrient ? nutrient.amount : 0;
  }

  // Alternative method to get nutrition by recipe title
  static async getRecipeNutritionByTitle(title: string): Promise<any> {
    try {
      // Search for the recipe by title
      const searchResponse = await axios.get(`${BASE_URL}/recipes/complexSearch`, {
        params: {
          query: title,
          number: 1,
          addRecipeNutrition: true,
          apiKey: API_KEY
        }
      });

      if (!searchResponse.data.results || searchResponse.data.results.length === 0) {
        console.warn(`No recipe found with title: ${title}`);
        // If we can't find a recipe by title, use our estimated calculation
        return calculateEstimatedNutrition([title]);
      }

      const recipe = searchResponse.data.results[0];
      
      // Extract nutrition information
      const nutrients = recipe.nutrition?.nutrients || [];
      
      return {
        calories: this.findNutrientAmount(nutrients, 'Calories'),
        protein: this.findNutrientAmount(nutrients, 'Protein'),
        carbs: this.findNutrientAmount(nutrients, 'Carbohydrates'),
        fat: this.findNutrientAmount(nutrients, 'Fat'),
        fiber: this.findNutrientAmount(nutrients, 'Fiber'),
        sugar: this.findNutrientAmount(nutrients, 'Sugar'),
        vitamins: this.extractVitamins(nutrients),
        minerals: this.extractMinerals(nutrients),
        source: 'Spoonacular API - Title Search'
      };
    } catch (error) {
      console.error('Error fetching nutrition by recipe title:', error);
      // Use our estimated calculation as fallback
      return calculateEstimatedNutrition([title]);
    }
  }

  // Helper method to extract vitamins
  private static extractVitamins(nutrients: any[]): string[] {
    if (!nutrients) return [];
    const vitamins = [];
    
    nutrients.forEach((nutrient: any) => {
      if (nutrient.name.includes('Vitamin') && nutrient.amount > 0) {
        vitamins.push(nutrient.name);
      }
    });
    
    return vitamins;
  }

  // Helper method to extract minerals
  private static extractMinerals(nutrients: any[]): string[] {
    if (!nutrients) return [];
    const minerals = [];
    const mineralNames = [
      'Calcium', 'Iron', 'Magnesium', 'Phosphorus', 
      'Potassium', 'Zinc', 'Copper', 'Manganese', 'Selenium', 'Sodium'
    ];
    
    mineralNames.forEach(name => {
      const found = nutrients.find((n: any) => n.name === name);
      if (found && found.amount > 0) {
        minerals.push(name);
      }
    });
    
    return minerals;
  }
}