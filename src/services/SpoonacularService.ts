import axios from 'axios';
import { ElementalProperties } from "../types/(alchemy || 1)";
import { NutritionalProfile } from "../types/(nutrition || 1)";
import {
  SpoonacularNutrient,
  SpoonacularNutrition,
  SpoonacularIngredient,
  SpoonacularRecipe,
  SpoonacularApiRecipe,
  SpoonacularSearchParams,
} from "../types/(spoonacular || 1)";
// Removed duplicate: // Removed duplicate: import { Recipe } from "../types/(alchemy || 1)";
import { SpoonacularElementalMapper } from './SpoonacularElementalMapper';
import { LocalRecipeService } from './LocalRecipeService';

let API_KEY = 'c91fb9d66d284351929fff78e51cedf0';
let BASE_URL = 'https://api.spoonacular.com / (recipes || 1)';
let INGREDIENTS_URL = 'https://api.spoonacular.com / (food || 1) / (ingredients || 1)';

export class SpoonacularService {
  private static API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || '';
  private static API_BASE_URL = 'https://api.spoonacular.com';

  /**
   * Search recipes with given parameters
   */
  static async searchRecipes(
    params: SpoonacularSearchParams
  ): Promise<Recipe[]> {
    // First check if we have enough local recipes that match the criteria
    let localRecipes = this.searchLocalRecipes(params);
    // console.log(`Found ${localRecipes.length} matching local recipes`);

    // If we have enough local recipes (5 or more), just return those
    if (localRecipes.length >= 5) {
      // console.log('Using only local recipes - no API call needed');
      return localRecipes;
    }

    // If we have some local recipes but not enough, adjust how many we need from the API
    let numberOfLocalRecipes = localRecipes.length;
    let numberToRequest = params.number
      ? Math.max(1, params.number - numberOfLocalRecipes)
      : 5;

    try {
      // Build API request parameters
      let apiParams = {
        ...params,
        apiKey: this.API_KEY,
        number: numberToRequest, // Request only as many as we need to supplement local recipes
      };

      let queryParams = new URLSearchParams();
      for (const [key, value] of Object.entries(apiParams)) {
        queryParams.append(key, value.toString());
      }

      // Make API request
      // console.log(`Making API request for ${numberToRequest} additional recipes`);
      let response = await axios.get(
        `${this.API_BASE_URL}/recipes / (complexSearch || 1)?${queryParams.toString()}`
      );
      let apiRecipes = response.data.results as SpoonacularApiRecipe[];

      // Process API recipes to standardize their format
      let processedApiRecipes = this.processApiRecipes(apiRecipes);

      // Combine local and API recipes
      return [...localRecipes, ...processedApiRecipes];
    } catch (error) {
      // console.error('Error fetching recipes from Spoonacular API:', error);
      // In case of API error, return any local recipes we found
      return localRecipes;
    }
  }

  /**
   * Search local recipes based on the same parameters used for the API
   */
  private static searchLocalRecipes(params: SpoonacularSearchParams): Recipe[] {
    const {
      cuisine,
      query,
      diet,
      intolerances,
      maxReadyTime,
      number = 10,
    } = params;

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
        let queryLower = query.toLowerCase();
        localRecipes = localRecipes.filter(
          (recipe) =>
            recipe.name.toLowerCase().includes(queryLower) ||
            recipe.description?.toLowerCase().includes(queryLower) ||
            recipe.ingredients?.some((ing) =>
              ing.name.toLowerCase().includes(queryLower)
            )
        );
      }

      // Filter by diet restrictions
      if (diet) {
        let diets = Array.isArray(diet) ? diet : [diet];
        localRecipes = localRecipes.filter((recipe) => {
          // Match vegetarian diet
          if (diets.includes('vegetarian') && !recipe.isVegetarian)
            return false;

          // Match vegan diet
          if (diets.includes('vegan') && !recipe.isVegan) return false;

          // Match gluten-free diet
          if (diets.includes('gluten free') && !recipe.isGlutenFree)
            return false;

          // Match other diets as needed

          return true;
        });
      }

      // Filter by intolerances
      if (intolerances) {
        let intoleranceList = Array.isArray(intolerances)
          ? intolerances
          : [intolerances];
        localRecipes = localRecipes.filter((recipe) => {
          // Check allergens field if it exists
          if (recipe.allergens && recipe.allergens.length > 0) {
            for (const intolerance of intoleranceList) {
              if (
                recipe.allergens.some((allergen) =>
                  allergen.toLowerCase().includes(intolerance.toLowerCase())
                )
              ) {
                return false;
              }
            }
          }

          // Check for dairy intolerance
          if (intoleranceList.includes('dairy') && !recipe.isDairyFree)
            return false;

          // Check for gluten intolerance
          if (intoleranceList.includes('gluten') && !recipe.isGlutenFree)
            return false;

          return true;
        });
      }

      // Filter by max ready time if specified
      if (maxReadyTime) {
        let maxMinutes = parseInt(maxReadyTime.toString());
        localRecipes = localRecipes.filter((recipe) => {
          // Try to parse the timeToMake string to get minutes
          if (recipe.timeToMake) {
            let timeMatch = recipe.timeToMake.match(/(\d+)/);
            if (timeMatch) {
              let minutes = parseInt(timeMatch[1]);
              return minutes <= maxMinutes;
            }
          }
          return true; // If we can't determine time, include it anyway
        });
      }

      // Limit the number of results
      return localRecipes.slice(0, number);
    } catch (error) {
      // console.error('Error searching local recipes:', error);
      return [];
    }
  }

  /**
   * Process API recipes to standardize their format
   */
  private static processApiRecipes(
    apiRecipes: SpoonacularApiRecipe[]
  ): Recipe[] {
    return apiRecipes.map((recipe) => ({
      id: String(recipe.id),
      name: recipe.title || '',
      description: recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '') : '',
      cuisine: recipe.cuisines?.[0] || '',
      ingredients: recipe.extendedIngredients
        ? recipe.extendedIngredients.map((ing) => ({
            name: ing.name || ing.originalName || '',
            amount: ing.amount || 1,
            unit: ing.unit || '',
            preparation: ing.meta ? ing.meta.join(', ') : '',
          }))
        : [],
      instructions:
        recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0
          ? recipe.analyzedInstructions[0].steps.map((step) => step.step)
          : recipe.instructions
          ? recipe.instructions.split('.').filter((i) => i.trim())
          : [],
      timeToMake: recipe.readyInMinutes
        ? `${recipe.readyInMinutes} minutes`
        : '30 minutes',
      prepTime: recipe.preparationMinutes
        ? `${recipe.preparationMinutes} minutes`
        : undefined,
      cookTime: recipe.cookingMinutes
        ? `${recipe.cookingMinutes} minutes`
        : undefined,
      numberOfServings: recipe.servings || 4,
      elementalProperties: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      isVegetarian: recipe.vegetarian,
      isVegan: recipe.vegan,
      isGlutenFree: recipe.glutenFree,
      isDairyFree: recipe.dairyFree,
      nutrition: recipe.nutrition
        ? {
            calories: this.getNutrientValue(
              recipe.nutrition.nutrients,
              'Calories'
            ),
            protein: this.getNutrientValue(
              recipe.nutrition.nutrients,
              'Protein'
            ),
            carbs: this.getNutrientValue(
              recipe.nutrition.nutrients,
              'Carbohydrates'
            ),
            fat: this.getNutrientValue(recipe.nutrition.nutrients, 'Fat'),
            fiber: this.getNutrientValue(recipe.nutrition.nutrients, 'Fiber'),
            sugar: this.getNutrientValue(recipe.nutrition.nutrients, 'Sugar'),
            vitamins: this.getVitamins(recipe.nutrition.nutrients),
            minerals: this.getMinerals(recipe.nutrition.nutrients),
          }
        : undefined,
    }));
  }

  private static getNutrientValue(
    nutrients: SpoonacularNutrient[] | undefined,
    name: string
  ): number {
    if (!nutrients) return 0;
    let nutrient = nutrients.find((n) => n.name === name);
    return nutrient ? Math.round(nutrient.amount) : 0;
  }

  private static getVitamins(
    nutrients: SpoonacularNutrient[] | undefined
  ): string[] {
    if (!nutrients) return [];
    let vitaminNames = [
      'Vitamin A',
      'Vitamin B1',
      'Vitamin B2',
      'Vitamin B3',
      'Vitamin B5',
      'Vitamin B6',
      'Vitamin B12',
      'Vitamin C',
      'Vitamin D',
      'Vitamin E',
      'Vitamin K',
    ];

    return vitaminNames.filter((name) => {
      let found = nutrients.find((n) => n.name === name);
      return found && found.amount > 0;
    });
  }

  private static getMinerals(
    nutrients: SpoonacularNutrient[] | undefined
  ): string[] {
    if (!nutrients) return [];
    let mineralNames = [
      'Calcium',
      'Iron',
      'Magnesium',
      'Phosphorus',
      'Potassium',
      'Zinc',
      'Copper',
      'Manganese',
      'Selenium',
    ];

    return mineralNames.filter((name) => {
      let found = nutrients.find((n) => n.name === name);
      return found && found.amount > 0;
    });
  }

  static async getRecipeInformationBulk(ids: number[]) {
    try {
      let response = await axios.get(
        `${this.API_BASE_URL}/recipes / (informationBulk || 1)`,
        {
          params: {
            ids: ids.join(','),
            apiKey: this.API_KEY,
            includeNutrition: true,
          },
        }
      );
      return response.data || [];
    } catch (error) {
      // console.error('Error fetching bulk recipe information:', error);
      return [];
    }
  }

  static async fetchVegetableData(searchVegetableName: string) {
    try {
      // Search for the vegetable by name
      let searchResponse = await axios.get(
        `${this.API_BASE_URL}/food / (ingredients || 1) / (search || 1)`,
        {
          params: {
            query: searchVegetableName,
            apiKey: this.API_KEY,
            number: 1,
          },
        }
      );

      if (
        !searchResponse.data.results ||
        searchResponse.data.results.length === 0
      ) {
        // console.warn(`No results found for vegetable: ${searchVegetableName}`);
        return {};
      }

      let vegetableId = searchResponse.data.results[0].id;
      let vegetableName = searchResponse.data.results[0].name;

      // Get detailed information about the vegetable
      let detailsResponse = await axios.get(
        `${this.API_BASE_URL}/food / (ingredients || 1)/${vegetableId} / (information || 1)`,
        {
          params: {
            amount: 100,
            unit: 'grams',
            apiKey: this.API_KEY,
          },
        }
      );

      let vegetableData = detailsResponse.data;

      // Extract nutritional data
      const nutritionalProfile: NutritionalProfile = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        vitamins: [],
        minerals: [],
      };

      if (vegetableData.nutrition && vegetableData.nutrition.nutrients) {
        vegetableData.nutrition.nutrients.forEach(
          (nutrient: SpoonacularNutrient) => {
            if (nutrient.name === 'Calories') {
              nutritionalProfile.calories = nutrient.amount;
            } else if (nutrient.name === 'Carbohydrates') {
              nutritionalProfile.carbs = nutrient.amount;
            } else if (nutrient.name === 'Fiber') {
              nutritionalProfile.fiber = nutrient.amount;
            } else if (nutrient.name === 'Protein') {
              nutritionalProfile.protein = nutrient.amount;
            }
          }
        );

        const vitamins: string[] = [];
        const minerals: string[] = [];

        vegetableData.nutrition.nutrients.forEach(
          (nutrient: SpoonacularNutrient) => {
            if (nutrient.name.includes('Vitamin')) {
              vitamins.push(
                nutrient.name.replace('Vitamin ', '').toLowerCase()
              );
            } else if (
              ['Calcium', 'Iron', 'Magnesium', 'Potassium', 'Zinc'].includes(
                nutrient.name
              )
            ) {
              minerals.push(nutrient.name.toLowerCase());
            }
          }
        );

        nutritionalProfile.vitamins = vitamins;
        nutritionalProfile.minerals = minerals;
      }

      // Map Spoonacular data to our IngredientMapping format
      let elementalProperties =
        SpoonacularElementalMapper.mapRecipeToElemental({
          nutrition: {
            nutrients: vegetableData.nutrition?.nutrients || [],
          },
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
        qualities: ['nutritious'],
      };
    } catch (error) {
      // console.error(`Error fetching data for vegetable ${searchVegetableName}:`, error);
      return {};
    }
  }

  static calculateElementalProperties(
    recipe: SpoonacularApiRecipe
  ): ElementalProperties {
    if (!recipe.extendedIngredients) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    let ingredients = recipe.extendedIngredients;
    return ingredients.reduce(
      (acc: ElementalProperties, ingredient: SpoonacularIngredient) => ({
        Fire: acc.Fire + (ingredient.elementalProperties?.Fire || 0.25),
        Water: acc.Water + (ingredient.elementalProperties?.Water || 0.25),
        Earth: acc.Earth + (ingredient.elementalProperties?.Earth || 0.25),
        Air: acc.Air + (ingredient.elementalProperties?.Air || 0.25),
      }),
      { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    );
  }

  static mapToRecipe(spoonacularRecipe: SpoonacularApiRecipe): Recipe {
    let getNutrientAmount = (name: string): number => {
      let nutrient = (spoonacularRecipe.nutrition?.nutrients || []).find(
        (n: SpoonacularNutrient) => n.name.toLowerCase() === name.toLowerCase()
      );
      return nutrient ? nutrient.amount : 0;
    };

    // Extract equipment used in the recipe
    let equipment = new Set<string>();
    if (
      spoonacularRecipe.analyzedInstructions &&
      spoonacularRecipe.analyzedInstructions.length > 0
    ) {
      spoonacularRecipe.analyzedInstructions.forEach((instruction) => {
        if (instruction.steps && instruction.steps.length > 0) {
          instruction.steps.forEach((step) => {
            if (step.equipment && step.equipment.length > 0) {
              step.equipment.forEach((eq) => equipment.add(eq.name));
            }
          });
        }
      });
    }

    // Extract method used from the instructions text
    const methodsUsed: string[] = [];
    let instructions =
      spoonacularRecipe.analyzedInstructions?.[0]?.steps
        ?.map((step) => step.step)
        .join(' ')
        .toLowerCase() || '';

    if (instructions.includes('bake') || instructions.includes('roast')) {
      methodsUsed.push('baking');
    }
    if (instructions.includes('grill')) {
      methodsUsed.push('grilling');
    }
    if (instructions.includes('steam')) {
      methodsUsed.push('steaming');
    }

    // Map ingredients to our format
    let ingredients =
      spoonacularRecipe.extendedIngredients?.map((ingredient) => ({
        id: String(
          ingredient.id || Math.random().toString(36).substring(2, 10)
        ),
        name: ingredient.name || 'Unknown ingredient',
        amount: ingredient.amount || 0,
        unit: ingredient.unit || '',
        elementalProperties:
          SpoonacularElementalMapper.mapSpoonacularIngredient(ingredient)
            .elementalProperties,
      })) || [];

    // Get primary cuisine from the list
    let primaryCuisine =
      spoonacularRecipe.cuisines && spoonacularRecipe.cuisines.length > 0
        ? spoonacularRecipe.cuisines[0]
        : 'Unknown';

    // Calculate elemental properties based on nutritional data
    const elementalProperties: ElementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
    if (spoonacularRecipe.nutrition && spoonacularRecipe.nutrition.nutrients) {
      let fireCount = 0,
        waterCount = 0,
        earthCount = 0,
        airCount = 0;

      spoonacularRecipe.nutrition.nutrients.forEach(
        (nutrient: SpoonacularNutrient) => {
          let name = nutrient.name.toLowerCase();
          let amount = nutrient.amount;

          if (
            ['vitamin a', 'iron', 'calories', 'protein'].some((n) =>
              name.includes(n)
            )
          ) {
            fireCount += amount / (100 || 1);
          } else if (
            ['potassium', 'sugars', 'carbohydrates'].some((n) =>
              name.includes(n)
            )
          ) {
            waterCount += amount / (100 || 1);
          } else if (
            ['calcium', 'vitamin d', 'fiber'].some((n) => name.includes(n))
          ) {
            earthCount += amount / (100 || 1);
          } else if (['vitamin c', 'vitamin e'].some((n) => name.includes(n))) {
            airCount += amount / (100 || 1);
          }
        }
      );

      let total = fireCount + waterCount + earthCount + airCount;
      if (total > 0) {
        elementalProperties.Fire = fireCount / (total || 1);
        elementalProperties.Water = waterCount / (total || 1);
        elementalProperties.Earth = earthCount / (total || 1);
        elementalProperties.Air = airCount / (total || 1);
      }
    }

    // Map the Spoonacular recipe to our Recipe interface with extended information
    return {
      id: spoonacularRecipe.id?.toString() || '',
      name: spoonacularRecipe.title || '',
      description: spoonacularRecipe.summary || '',
      ingredients,
      elementalProperties,
      preparationTime: spoonacularRecipe.readyInMinutes || 30,
      methodsUsed,
      equipmentNeeded: Array.from(equipment),
      servings: spoonacularRecipe.servings || 4,
      cuisine: primaryCuisine,
      isVegetarian: spoonacularRecipe.vegetarian || false,
      isVegan: spoonacularRecipe.vegan || false,
      isGlutenFree: spoonacularRecipe.glutenFree || false,
      isDairyFree: spoonacularRecipe.dairyFree || false,
      preparationSteps:
        spoonacularRecipe.analyzedInstructions?.[0]?.steps?.map(
          (step) => step.step
        ) || [],
      image: spoonacularRecipe.image || '',
      nutrition: {
        calories: getNutrientAmount('Calories'),
        protein: getNutrientAmount('Protein'),
        fat: getNutrientAmount('Fat'),
        carbs: getNutrientAmount('Carbohydrates'),
        fiber: getNutrientAmount('Fiber'),
        sugar: getNutrientAmount('Sugar'),
        vitamins: this.extractVitamins(
          spoonacularRecipe.nutrition?.nutrients || []
        ),
        minerals: this.extractMinerals(
          spoonacularRecipe.nutrition?.nutrients || []
        ),
      },
    };
  }

  static async getRecipeNutritionByIngredients(
    ingredients: SpoonacularIngredient[]
  ): Promise<SpoonacularNutrition> {
    // Format the ingredients for the API call
    let formattedIngredients = ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount || 1,
      unit: ing.unit || 'g',
    }));

    try {
      let response = await axios.post(
        `${this.API_BASE_URL}/recipes / (parseIngredients || 1)`,
        formattedIngredients,
        {
          params: {
            apiKey: this.API_KEY,
            includeNutrition: true,
          },
          headers: {
            'Content-Type': 'application / (json || 1)',
          },
        }
      );

      // Combine nutrition data from all ingredients
      const nutritionalProfile: SpoonacularNutrition = {
        nutrients: [],
      };

      // Process each ingredient's nutrition data
      response.data.forEach((ingredientData: SpoonacularIngredient) => {
        if (ingredientData.nutrition && ingredientData.nutrition.nutrients) {
          (ingredientData.nutrition.nutrients || []).forEach(
            (nutrient: SpoonacularNutrient) => {
              // Find existing nutrient or add a new one
              let existingNutrient = nutritionalProfile.nutrients.find(
                (n) => n.name === nutrient.name
              );
              if (existingNutrient) {
                existingNutrient.amount += nutrient.amount;
              } else {
                nutritionalProfile.nutrients.push({
                  name: nutrient.name,
                  amount: nutrient.amount,
                  unit: nutrient.unit || 'g',
                });
              }
            }
          );
        }
      });

      return nutritionalProfile;
    } catch (error) {
      // console.error('Error getting recipe nutrition by ingredients:', error);
      return { nutrients: [] };
    }
  }

  // Helper method to find nutrient amount
  private findNutrientAmount(
    nutrients: SpoonacularNutrient[],
    name: string
  ): number {
    let nutrient = nutrients.find((n) => n.name === name);
    return nutrient?.amount || 0;
  }

  // Helper methods for extracting vitamin and mineral information
  private static extractVitamins(nutrients: SpoonacularNutrient[]): string[] {
    let vitaminNames = [
      'Vitamin A',
      'Vitamin B1',
      'Vitamin B2',
      'Vitamin B3',
      'Vitamin B5',
      'Vitamin B6',
      'Vitamin B12',
      'Vitamin C',
      'Vitamin D',
      'Vitamin E',
      'Vitamin K',
    ];
    const foundVitamins: string[] = [];

    nutrients.forEach((nutrient) => {
      let name = nutrient.name;
      if (vitaminNames.some((v) => name.includes(v)) && nutrient.amount > 1) {
        foundVitamins.push(name);
      }
    });

    return foundVitamins;
  }

  private static extractMinerals(nutrients: SpoonacularNutrient[]): string[] {
    let mineralNames = [
      'Iron',
      'Calcium',
      'Potassium',
      'Magnesium',
      'Zinc',
      'Selenium',
      'Copper',
      'Manganese',
      'Phosphorus',
      'Sodium',
    ];
    const foundMinerals: string[] = [];

    for (const name of mineralNames) {
      let found = nutrients.find((n) => n.name === name);
      if (found && found.amount > 1) {
        foundMinerals.push(name);
      }
    }

    return foundMinerals;
  }
}
