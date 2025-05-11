import type { Recipe, ElementalProperties } from "@/types/(recipe || 1)";
import { elementalUtils } from "@/utils/(elementalUtils || 1)";

// Calculate elemental harmony between two sets of elemental properties
const calculateElementalHarmony = (
  recipeProperties: ElementalProperties,
  targetProperties: ElementalProperties
): { elementalHarmony: number } => {
  // Simple implementation - can be replaced with the actual alchemical engine later
  return {
    elementalHarmony: 0.5, // Default value
  };
};

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
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.name?.toLowerCase().includes(searchLower) ||
          false ||
          recipe.description?.toLowerCase().includes(searchLower) ||
          false
      );
    }

    // Apply cuisine filter
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.cuisine && filters.cuisineTypes?.includes(recipe.cuisine)
      );
    }

    // Apply meal type filter
    if (filters.mealType && filters.mealType.length > 0) {
      filteredRecipes = filteredRecipes.filter((recipe) => {
        if (Array.isArray(recipe.mealType)) {
          return recipe.mealType.some((type) =>
            filters.mealType?.includes(type)
          );
        }
        return (
          recipe.mealType &&
          filters.mealType?.includes(recipe.mealType as string)
        );
      });
    }

    // Apply dietary restrictions filter
    if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
      filteredRecipes = filteredRecipes.filter((recipe) =>
        filters.dietaryRestrictions?.every(
          (restriction) =>
            recipe.dietaryRestrictions?.includes(restriction) || false
        )
      );
    }

    // Apply prep time filter
    if (typeof filters.maxPrepTime === 'number') {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          typeof recipe.prepTime === 'number' &&
          recipe.prepTime <= filters.maxPrepTime
      );
    }

    // Apply spiciness filter
    if (typeof filters.spiciness === 'number') {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          typeof recipe.spiciness === 'number' &&
          recipe.spiciness <= filters.spiciness
      );
    }

    // Apply complexity filter
    if (typeof filters.complexity === 'number') {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          typeof recipe.complexity === 'number' &&
          recipe.complexity <= filters.complexity
      );
    }

    // Apply elemental balance filter
    if (filters.elementalState) {
      filteredRecipes = filteredRecipes
        .map((recipe) => {
          const recipeElementalProps =
            recipe.elementalProperties ||
            elementalUtils.DEFAULT_ELEMENTAL_PROPERTIES;
          return {
            ...recipe,
            matchScore: calculateElementalHarmony(
              recipeElementalProps,
              filters.elementalState
            ).elementalHarmony,
          };
        })
        .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    // Apply sorting
    if (sortOptions.by === 'relevance') {
      filteredRecipes.sort((a, b) => {
        const scoreA = a.matchScore || 0;
        const scoreB = b.matchScore || 0;
        return sortOptions.direction === 'desc'
          ? scoreB - scoreA
          : scoreA - scoreB;
      });
    }

    return filteredRecipes;
  },
};
