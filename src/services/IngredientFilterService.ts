import { herbs } from '../data/ingredients/herbs';
import { spices } from '../data/ingredients/spices';
import { vegetables } from '../data/ingredients/vegetables';
import { proteins } from '../data/ingredients/proteins';
import { grains } from '../data/ingredients/grains';
import { oils } from '../data/ingredients/oils';
import { fruits } from '../data/ingredients/fruits';
import type { IngredientMapping } from '../types/alchemy';
import { ElementalFilter } from '../types/elemental';
import { 
  NutritionalFilter, 
  NutritionData 
} from '../types/nutrition';
import { 
  SpoonacularRecipe, 
  SpoonacularNutritionData 
} from '../types/spoonacular';
import { type ElementalProperties } from "@/types/alchemy";

// Interface to provide special dietary filtering
export interface DietaryFilter {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  isNutFree?: boolean;
  isLowSodium?: boolean;
  isLowSugar?: boolean;
}

// Combined filter interface
export interface IngredientFilter {
  nutritional?: NutritionalFilter;
  elemental?: ElementalFilter;
  dietary?: DietaryFilter;
  season?: string[];
  categories?: string[];
  searchQuery?: string;
  excludeIngredients?: string[];
}

// Structure for recipe recommendations
export interface RecipeRecommendation {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number;
  healthScore: number;
  nutrition: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  usedIngredients: string[];
}

// Groupings for ingredient types
export const INGREDIENT_GROUPS = {
  PROTEINS: 'Proteins',
  VEGETABLES: 'Vegetables',
  FRUITS: 'Fruits',
  HERBS: 'Herbs',
  SPICES: 'Spices',
  GRAINS: 'Grains',
  OILS: 'Oils & Fats'
};

// Helper class to provide ingredient filtering services
export class IngredientFilterService {
  private static instance: IngredientFilterService;
  private allIngredients: Record<string, Record<string, IngredientMapping>>;
  private spoonacularCache: Map<string, SpoonacularNutritionData> = new Map();

  private constructor() {
    // Initialize with all available ingredient data
    this.allIngredients = {
      [INGREDIENT_GROUPS.PROTEINS]: proteins,
      [INGREDIENT_GROUPS.VEGETABLES]: vegetables,
      [INGREDIENT_GROUPS.FRUITS]: fruits,
      [INGREDIENT_GROUPS.HERBS]: herbs,
      [INGREDIENT_GROUPS.SPICES]: spices,
      [INGREDIENT_GROUPS.GRAINS]: grains,
      [INGREDIENT_GROUPS.OILS]: oils
    } as Record<string, Record<string, IngredientMapping>>;
  }

  // Singleton instance getter
  public static getInstance(): IngredientFilterService {
    if (!IngredientFilterService.instance) {
      IngredientFilterService.instance = new IngredientFilterService();
    }
    return IngredientFilterService.instance;
  }

  // Main filtering method that combines all filter types
  public filterIngredients(filter: IngredientFilter = {}): Record<string, IngredientMapping[]> {
    // Start with all ingredients, grouped by category
    const filteredResults: Record<string, IngredientMapping[]> = {};

    // Determine which categories to include
    const categoriesToInclude = filter.categories && filter.categories.length > 0 
      ? filter.categories 
      : Object.keys(this.allIngredients);

    // Process each category
    categoriesToInclude.forEach(category => {
      if (!this.allIngredients[category]) return;

      // Convert object to array of ingredients with names
      const categoryIngredients = Object.entries(this.allIngredients[category]).map(
        ([name, data]) => ({ name, ...data } as unknown as IngredientMapping)
      );
      
      // Apply all filters sequentially
      let filtered = [...categoryIngredients];
      
      // Apply nutritional filter if specified
      if (filter.nutritional) {
        filtered = this.applyNutritionalFilter(filtered, filter.nutritional);
      }
      
      // Apply elemental filter if specified
      if (filter.elemental) {
        filtered = this.applyElementalFilter(filtered, filter.elemental);
      }
      
      // Apply dietary filter if specified
      if (filter.dietary) {
        filtered = this.applyDietaryFilter(filtered, filter.dietary);
      }
      
      // Apply seasonal filter if specified
      if (filter.season && filter.season.length > 0) {
        filtered = this.applySeasonalFilter(filtered, filter.season);
      }
      
      // Apply search query if specified
      if (filter.searchQuery) {
        filtered = this.applySearchFilter(filtered, filter.searchQuery);
      }
      
      // Apply exclusion filter if specified
      if (filter.excludeIngredients && filter.excludeIngredients.length > 0) {
        filtered = this.applyExclusionFilter(filtered, filter.excludeIngredients);
      }
      
      // Only add category if it has matching ingredients
      if (filtered.length > 0) {
        filteredResults[category] = filtered;
      }
    });

    return filteredResults;
  }

  // Apply nutritional filtering criteria
  private applyNutritionalFilter(
    ingredients: IngredientMapping[], 
    filter: NutritionalFilter
  ): IngredientMapping[] {
    return ingredients.filter(ingredient => {
      const nutrition = (ingredient.nutritionalProfile || {}) as NutritionData;
      
      // Check protein requirements
      if (filter.minProtein !== undefined && 
          (!nutrition.protein_g || nutrition.protein_g < filter.minProtein)) {
        return false;
      }
      
      if (filter.maxProtein !== undefined && 
          (nutrition.protein_g && nutrition.protein_g > filter.maxProtein)) {
        return false;
      }
      
      // Check fiber requirements
      if (filter.minFiber !== undefined && 
          (!nutrition.fiber_g || nutrition.fiber_g < filter.minFiber)) {
        return false;
      }
      
      if (filter.maxFiber !== undefined && 
          (nutrition.fiber_g && nutrition.fiber_g > filter.maxFiber)) {
        return false;
      }
      
      // Check calorie requirements
      if (filter.minCalories !== undefined && 
          (!nutrition.calories || nutrition.calories < filter.minCalories)) {
        return false;
      }
      
      if (filter.maxCalories !== undefined && 
          (nutrition.calories && nutrition.calories > filter.maxCalories)) {
        return false;
      }
      
      // Check for required vitamins
      if (filter.vitamins && filter.vitamins.length > 0 && nutrition.vitamins) {
        const hasAllVitamins = filter.vitamins.every(vitamin => 
          nutrition.vitamins && (nutrition.vitamins as string[]).includes(vitamin)
        );
        if (!hasAllVitamins) return false;
      }
      
      // Check for required minerals
      if (filter.minerals && filter.minerals.length > 0 && nutrition.minerals) {
        const hasAllMinerals = filter.minerals.every(mineral => 
          nutrition.minerals && (nutrition.minerals as string[]).includes(mineral)
        );
        if (!hasAllMinerals) return false;
      }
      
      // Check high protein requirement
      if (filter.highProtein && (!nutrition.protein_g || nutrition.protein_g < 10)) {
        return false;
      }
      
      // Check low carb requirement
      if (filter.lowCarb && (nutrition.carbs && nutrition.carbs > 20)) {
        return false;
      }
      
      // Check low fat requirement
      if (filter.lowFat && (nutrition.fats && nutrition.fats > 5)) {
        return false;
      }
      
      return true;
    });
  }

  // Apply elemental filtering criteria
  private applyElementalFilter(
    ingredients: IngredientMapping[], 
    filter: ElementalFilter
  ): IngredientMapping[] {
    return ingredients.filter(ingredient => {
      const elementalProps = ingredient.elementalProperties as unknown as ElementalProperties;
      
      // Check Fire element range
      if (filter.minFire !== undefined && 
          (!elementalProps || !elementalProps.Fire || elementalProps.Fire < filter.minFire)) {
        return false;
      }
      
      if (filter.maxFire !== undefined && 
          (!elementalProps || !elementalProps.Fire || elementalProps.Fire > filter.maxFire)) {
        return false;
      }
      
      // Check Water element range
      if (filter.minWater !== undefined && 
          (!elementalProps || !elementalProps.Water || elementalProps.Water < filter.minWater)) {
        return false;
      }
      
      if (filter.maxWater !== undefined && 
          (!elementalProps || !elementalProps.Water || elementalProps.Water > filter.maxWater)) {
        return false;
      }
      
      // Check Earth element range
      if (filter.minEarth !== undefined && 
          (!elementalProps || !elementalProps.Earth || elementalProps.Earth < filter.minEarth)) {
        return false;
      }
      
      if (filter.maxEarth !== undefined && 
          (!elementalProps || !elementalProps.Earth || elementalProps.Earth > filter.maxEarth)) {
        return false;
      }
      
      // Check Air element range
      if (filter.minAir !== undefined && 
          (!elementalProps || !elementalProps.Air || elementalProps.Air < filter.minAir)) {
        return false;
      }
      
      if (filter.maxAir !== undefined && 
          (!elementalProps || !elementalProps.Air || elementalProps.Air > filter.maxAir)) {
        return false;
      }
      
      // Check for dominant element if specified
      if (filter.dominantElement) {
        if (!elementalProps) return false;
        
        const dominantElement = Object.entries(elementalProps)
          .filter(([key]) => ['Fire', 'Water', 'Earth', 'Air'].includes(key))
          .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];
        
        if (dominantElement !== filter.dominantElement) return false;
      }
      
      return true;
    });
  }

  // Apply dietary filtering criteria
  private applyDietaryFilter(
    ingredients: IngredientMapping[], 
    filter: DietaryFilter
  ): IngredientMapping[] {
    return ingredients.filter(ingredient => {
      // Check for vegetarian
      if (filter.isVegetarian && !(ingredient as any).isVegetarian) {
        return false;
      }
      
      // Check for vegan
      if (filter.isVegan && !(ingredient as any).isVegan) {
        return false;
      }
      
      // Check for gluten-free
      if (filter.isGlutenFree && !(ingredient as any).isGlutenFree) {
        return false;
      }
      
      // Check for dairy-free
      if (filter.isDairyFree && !(ingredient as any).isDairyFree) {
        return false;
      }
      
      // Check for nut-free
      if (filter.isNutFree && !(ingredient as any).isNutFree) {
        return false;
      }
      
      // Check for low sodium
      if (filter.isLowSodium && !(ingredient as any).isLowSodium) {
        return false;
      }
      
      // Check for low sugar
      if (filter.isLowSugar && !(ingredient as any).isLowSugar) {
        return false;
      }
      
      return true;
    });
  }

  // Apply seasonal filtering criteria
  private applySeasonalFilter(
    ingredients: IngredientMapping[], 
    seasons: string[]
  ): IngredientMapping[] {
    return ingredients.filter(ingredient => {
      // Safe access to seasonality property with type assertion
      const seasonality = (ingredient as any).seasonality || [];
      
      // If no seasonality data, assume available year-round
      if (!seasonality || (Array.isArray(seasonality) && seasonality.length === 0)) {
        return true;
      }
      
      // Check if any of the specified seasons match
      return seasons.some(season => 
        Array.isArray(seasonality) && seasonality.includes(season.toLowerCase())
      );
    });
  }

  // Apply search query filtering
  private applySearchFilter(
    ingredients: IngredientMapping[], 
    query: string
  ): IngredientMapping[] {
    if (!query || typeof query !== 'string') return ingredients;
    
    const lowerCaseQuery = query.toLowerCase();
    
    return ingredients.filter(ingredient => {
      // Safe access to ingredient name with type assertion
      const ingredientName = (ingredient as any).name || ingredient.id || '';
      
      // Check if ingredient name matches query
      if (typeof ingredientName === 'string' && 
          ingredientName.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      
      // Check if any preparation notes match (if available)
      const preparationNotes = (ingredient as any).preparationNotes || '';
      if (typeof preparationNotes === 'string' && preparationNotes.length > 0) {
        if (preparationNotes.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
      }
      
      // Check if any affinities match (if available)
      const affinities = (ingredient as any).affinities || [];
      if (Array.isArray(affinities) && affinities.length > 0) {
        return affinities.some((affinity: any) => 
          typeof affinity === 'string' && affinity.toLowerCase().includes(lowerCaseQuery)
        );
      }
      
      return false;
    });
  }

  // Apply exclusion filtering
  private applyExclusionFilter(
    ingredients: IngredientMapping[], 
    excludedIngredients: string[]
  ): IngredientMapping[] {
    if (!excludedIngredients || excludedIngredients.length === 0) return ingredients;
    
    return ingredients.filter(ingredient => {
      // Safe access to ingredient name with type assertion
      const ingredientName = (ingredient as any).name || ingredient.id || '';
      
      return !excludedIngredients.some(excluded => 
        typeof ingredientName === 'string' && 
        typeof excluded === 'string' &&
        ingredientName.toLowerCase().includes(excluded.toLowerCase())
      );
    });
  }

  // Get recommended ingredients with balanced nutrition from each group
  public getBalancedRecommendations(
    count = 3,
    filter: IngredientFilter = {}
  ): Record<string, IngredientMapping[]> {
    // Apply basic filtering first
    const filteredByCategory = this.filterIngredients(filter);
    const result: Record<string, IngredientMapping[]> = {};
    
    // For each category, select a limited number of most nutritionally balanced items
    Object.entries(filteredByCategory).forEach(([category, ingredients]) => {
      // Sort ingredients by nutritional completeness (if data available)
      const sorted = [...ingredients].sort((a, b) => {
        const aNutrition = a.nutritionalProfile || {};
        const bNutrition = b.nutritionalProfile || {};
        
        // Create a simple score based on available nutritional data
        const aScore = this.calculateNutritionalScore(aNutrition);
        const bScore = this.calculateNutritionalScore(bNutrition);
        
        return bScore - aScore; // Higher score first
      });
      
      // Take the top N items
      result[category] = sorted.slice(0, count);
    });
    
    return result;
  }
  
  // Calculate a nutrient density score
  private calculateNutritionalScore(nutrition: NutritionData): number {
    if (!nutrition) return 0;
    
    let score = 0;
    
    // Award points for protein content
    if (nutrition.protein_g) {
      score += nutrition.protein_g * 2;
    }
    
    // Award points for fiber content
    if (nutrition.fiber_g) {
      score += nutrition.fiber_g * 3;
    }
    
    // Award points for vitamin variety
    if (nutrition.vitamins && Array.isArray(nutrition.vitamins)) {
      score += nutrition.vitamins.length * 5;
    }
    
    // Award points for mineral variety
    if (nutrition.minerals && Array.isArray(nutrition.minerals)) {
      score += nutrition.minerals.length * 5;
    }
    
    // Award points for vitamin density
    if (nutrition.vitamin_density) {
      score += nutrition.vitamin_density * 2;
    }
    
    // Penalize for very high calories
    if (nutrition.calories && nutrition.calories > 300) {
      score -= (nutrition.calories - 300) / 10;
    }
    
    return score;
  }

  // Get enhanced nutrition data for an ingredient from Spoonacular
  public async getEnhancedNutritionData(ingredientName: string): Promise<SpoonacularNutritionData | null> {
    try {
      // Check cache first
      if (this.spoonacularCache.has(ingredientName)) {
        return this.spoonacularCache.get(ingredientName) || null;
      }

      // Format query for API
      const query = ingredientName.toLowerCase().trim();
      
      // Call SpoonacularService to get ingredient data
      const response = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(query)}&number=1&apiKey=c91fb9d66d284351929fff78e51cedf0`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const ingredientId = data.results[0].id;
        
        // Get detailed nutrition information
        const nutritionResponse = await fetch(`https://api.spoonacular.com/food/ingredients/${ingredientId}/information?amount=100&unit=grams&apiKey=c91fb9d66d284351929fff78e51cedf0`);
        const nutritionData = await nutritionResponse.json() as SpoonacularNutritionData;
        
        // Cache the result
        this.spoonacularCache.set(ingredientName, nutritionData);
        
        return nutritionData;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching enhanced nutrition data:', error);
      return null;
    }
  }

  // Get recipe recommendations using ingredients
  public async getRecipeRecommendations(ingredients: string[], dietaryFilter?: DietaryFilter): Promise<RecipeRecommendation[]> {
    try {
      // Join ingredients with commas for the API call
      const ingredientsList = ingredients.join(',');
      
      // Build diet restrictions for API
      let dietParam = '';
      if (dietaryFilter) {
        if (dietaryFilter.isVegetarian) dietParam = 'vegetarian';
        if (dietaryFilter.isVegan) dietParam = 'vegan';
        if (dietaryFilter.isGlutenFree) dietParam = `${dietParam},gluten-free`.replace(/^,/, '');
        if (dietaryFilter.isDairyFree) dietParam = `${dietParam},dairy-free`.replace(/^,/, '');
      }
      
      // Call Spoonacular API to find recipes by ingredients
      const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredientsList)}&number=5&ranking=2&apiKey=c91fb9d66d284351929fff78e51cedf0`);
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      // Get nutrition info for each recipe
      const recipePromises = data.map(async (recipe: SpoonacularRecipe) => {
        try {
          const nutritionResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/nutritionWidget.json?apiKey=c91fb9d66d284351929fff78e51cedf0`);
          const nutritionData = await nutritionResponse.json();
          
          return {
            id: recipe.id?.toString() || '',
            title: recipe.title || '',
            image: (recipe as any).image || '',
            readyInMinutes: recipe.readyInMinutes || 30, // Default value
            healthScore: 50, // Default value
            nutrition: {
              nutrients: nutritionData.nutrients || []
            },
            usedIngredients: recipe.extendedIngredients?.map(ing => ing.name || '') || []
          };
        } catch (err) {
          console.error(`Error fetching nutrition for recipe ${recipe.id}:`, err);
          return null;
        }
      });
      
      const results = await Promise.all(recipePromises);
      return results.filter(Boolean) as RecipeRecommendation[];
    } catch (error) {
      console.error('Error fetching recipe recommendations:', error);
      return [];
    }
  }
}

// Export singleton instance
export const ingredientFilterService = IngredientFilterService.getInstance(); 