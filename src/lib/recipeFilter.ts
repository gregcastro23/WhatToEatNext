import type { Recipe, ElementalProperties } from '@/types/recipe';
import { AlchemicalEngine } from '@/calculations/alchemicalEngine';

const alchemicalEngine = new AlchemicalEngine();

export const recipeFilter = {
  filterAndSortRecipes(
    recipes: Recipe[],
    filters: {
      searchQuery?: string;
      cuisineTypes?: string[];
      mealType?: string[];
      dietaryRestrictions?: string[];
      maxPrepTime?: number;
      spiciness?: number;
      complexity?: number;
      elementalState?: ElementalProperties;
    },
    sortOptions: { by: string; direction: 'asc' | 'desc' }
  ): Recipe[] {
    let filteredRecipes = [...recipes];

    // Apply search filter
    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply cuisine filter
    if (filters.cuisineTypes?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.cuisineTypes.includes(recipe.cuisine)
      );
    }

    // Apply meal type filter
    if (filters.mealType?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.mealType.includes(recipe.mealType)
      );
    }

    // Apply dietary restrictions filter
    if (filters.dietaryRestrictions?.length) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        filters.dietaryRestrictions.every(restriction =>
          recipe.dietaryRestrictions?.includes(restriction)
        )
      );
    }

    // Apply prep time filter
    if (filters.maxPrepTime) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.prepTime <= filters.maxPrepTime
      );
    }

    // Apply spiciness filter
    if (filters.spiciness) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.spiciness <= filters.spiciness
      );
    }

    // Apply complexity filter
    if (filters.complexity) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.complexity <= filters.complexity
      );
    }

    // Apply elemental balance filter
    if (filters.elementalState) {
      filteredRecipes = filteredRecipes.map(recipe => ({
        ...recipe,
        matchScore: alchemicalEngine.calculateElementalHarmony(
          recipe.elementalProperties,
          filters.elementalState
        ).elementalHarmony
      })).sort((a, b) => b.matchScore - a.matchScore);
    }

    // Apply sorting
    if (sortOptions.by === 'relevance') {
      filteredRecipes.sort((a, b) => {
        const scoreA = a.matchScore || 0;
        const scoreB = b.matchScore || 0;
        return sortOptions.direction === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      });
    }

    return filteredRecipes;
  }
}; 