import type { 
    Recipe, 
    ElementalProperties,
    AstrologicalState,
    Season 
  } from '@/types/alchemy';
  import { elementalUtils } from './elementalUtils';
  import { astrologyUtils } from './astrologyUtils';
  
  interface MatchResult {
    recipe: Recipe;
    score: number;
    elements: ElementalProperties;
    dominantElements: [string, number][];
  }
  
  interface MatchFilters {
    maxTime?: number;
    dietary?: string[];
    season?: Season;
    servingSize?: number;
    excludeIngredients?: string[];
    cookingMethod?: string[];
  }
  
  export const findBestMatches = (
    recipes: Recipe[],
    targetBalance: ElementalProperties,
    astrologicalState?: AstrologicalState,
    filters: MatchFilters = {}
  ): MatchResult[] => {
    
    // Apply filters first
    let filteredRecipes = recipes.filter(recipe => {
      // Time filter
      if (filters.maxTime && recipe.timeToMake > filters.maxTime) return false;
      
      // Dietary preferences
      if (filters.dietary && !filters.dietary.every(tag => recipe.tags?.includes(tag))) return false;
      
      // Seasonal appropriateness
      if (filters.season && !recipe.season?.includes(filters.season)) return false;
      
      // Serving size
      if (filters.servingSize && recipe.servings < filters.servingSize) return false;
      
      // Excluded ingredients
      if (filters.excludeIngredients && recipe.ingredients.some(
        ing => filters.excludeIngredients?.includes(ing.name.toLowerCase())
      )) return false;
      
      // Cooking method
      if (filters.cookingMethod && !filters.cookingMethod.includes(recipe.cookingMethod)) return false;
      
      return true;
    });
  
    // Calculate scores with astrological influences
    const scoredRecipes = filteredRecipes.map(recipe => {
      let elements = recipe.elementalProperties || calculateBaseElements(recipe);
      
      // Apply astrological influences if available
      if (astrologicalState) {
        const astroInfluence = astrologyUtils.getElementalInfluence(astrologicalState);
        elements = elementalUtils.combineProperties(
          elements,
          astroInfluence.elementalEffect,
          0.8 // Weight for astrological influence
        );
      }
  
      // Calculate harmony score
      const score = calculateHarmonyScore(elements, targetBalance);
  
      // Calculate dominant elements
      const dominantElements = calculateDominantElements(elements);
  
      return {
        recipe,
        score,
        elements,
        dominantElements
      };
    });
  
    // Sort by score and return top matches
    return scoredRecipes
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);
  };
  
  const calculateBaseElements = (recipe: Recipe): ElementalProperties => {
    // Start with cooking method influence
    let elements: ElementalProperties = {
      Fire: 0,
      Water: 0,
      Air: 0,
      Earth: 0
    };
  
    // Add ingredient influences
    recipe.ingredients.forEach(ingredient => {
      if (ingredient.properties?.elemental) {
        elements = elementalUtils.combineProperties(
          elements,
          ingredient.properties.elemental,
          ingredient.amount / 100 // Weight by amount
        );
      }
    });
  
    return elementalUtils.normalizeProperties(elements);
  };
  
  const calculateHarmonyScore = (
    current: ElementalProperties,
    target: ElementalProperties
  ): number => {
    let score = 0;
    let totalWeight = 0;
  
    Object.entries(target).forEach(([element, targetValue]) => {
      const currentValue = current[element as keyof ElementalProperties] || 0;
      const weight = targetValue || 0;
      score += (1 - Math.abs(currentValue - targetValue)) * weight;
      totalWeight += weight;
    });
  
    return totalWeight > 0 ? score / totalWeight : 0;
  };
  
  const calculateDominantElements = (
    elements: ElementalProperties
  ): [string, number][] => {
    return Object.entries(elements)
      .sort(([, a], [, b]) => (b || 0) - (a || 0))
      .slice(0, 2)
      .map(([element, value]) => [element, value || 0]);
  };
  
  export default findBestMatches;