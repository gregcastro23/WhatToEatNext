/**
 * Test utility for ingredient mapping functionality
 * Shows how to use the mapping between ingredient data and recipe ingredients
 */

import { connectIngredientsToMappings } from './recipeMatching';
import { filterRecipesByIngredientMappings } from './recipeFilters';
import { cuisinesMap } from '@/data/cuisines';
import { ingredientsMap } from '@/data/ingredients';
import type { Recipe } from '@/types/recipe';
import type { ElementalProperties } from '@/types/alchemy';

/**
 * Example function showing how to use the ingredient mapping feature
 * This demonstrates how to get all Italian dinner recipes with good 
 * ingredient mapping coverage.
 */
export function findMatchedItalianDinnerRecipes() {
  // Get all Italian dinner recipes
  const italianCuisine = cuisinesMap.Italian;
  const allDinnerRecipes = [
    ...(italianCuisine.dishes.dinner.spring || []),
    ...(italianCuisine.dishes.dinner.summer || []),
    ...(italianCuisine.dishes.dinner.autumn || []),
    ...(italianCuisine.dishes.dinner.winter || [])
  ];
  
  // Map all ingredients to our ingredient database
  const mappedRecipes = allDinnerRecipes.map(recipe => {
    const mappedIngredients = connectIngredientsToMappings(recipe);
    
    // Calculate mapping score (percentage of ingredients with a mapping)
    const mappingScore = mappedIngredients.filter(i => i.matchedTo).length / 
                         Math.max(1, recipe.ingredients.length);
    
    return {
      recipe,
      mappingScore,
      mappedIngredients
    };
  });
  
  // Filter to recipes with at least 50% of ingredients mapped
  const wellMappedRecipes = mappedRecipes.filter(r => r.mappingScore >= 0.5);
  
  // Sort by mapping score (descending)
  return wellMappedRecipes.sort((a, b) => b.mappingScore - a.mappingScore);
}

/**
 * Example function showing how to use the advanced recipe filtering
 * with ingredient mappings to find recipes that match specific
 * elemental targets and ingredient requirements
 */
export function findRecipesMatchingElementalAndIngredientRequirements(
  elementalTarget: ElementalProperties,
  requiredIngredients: string[] = [],
  excludedIngredients: string[] = [],
  dietaryRestrictions: string[] = []
) {
  // Collect recipes from all cuisines
  const allRecipes: Recipe[] = [];
  
  Object.values(cuisinesMap).forEach(cuisine => {
    // Collect breakfast recipes
    Object.values(cuisine.dishes.breakfast).forEach(seasonRecipes => {
      allRecipes.push(...seasonRecipes);
    });
    
    // Collect lunch recipes
    Object.values(cuisine.dishes.lunch).forEach(seasonRecipes => {
      allRecipes.push(...seasonRecipes);
    });
    
    // Collect dinner recipes
    Object.values(cuisine.dishes.dinner).forEach(seasonRecipes => {
      allRecipes.push(...seasonRecipes);
    });
    
    // Collect dessert recipes
    Object.values(cuisine.dishes.dessert).forEach(seasonRecipes => {
      allRecipes.push(...seasonRecipes);
    });
  });
  
  // Use the new filtering function
  const matchedRecipes = filterRecipesByIngredientMappings(
    allRecipes,
    elementalTarget,
    {
      required: requiredIngredients,
      excluded: excludedIngredients,
      dietaryRestrictions: dietaryRestrictions,
      emphasized: [] // Optional emphasized ingredients
    }
  );
  
  return matchedRecipes;
}

/**
 * Example of how to use the ingredient mapping to suggest substitutions
 * based on elemental properties of ingredients
 */
export function suggestIngredientSubstitutions(
  recipe: Recipe,
  ingredientToReplace: string
) {
  // Map all ingredients
  const mappedIngredients = connectIngredientsToMappings(recipe);
  
  // Find the ingredient to replace
  const ingredientMapping = mappedIngredients.find(
    i => i.name.toLowerCase() === ingredientToReplace.toLowerCase()
  );
  
  if (!ingredientMapping?.matchedTo) {
    return {
      success: false,
      message: `Could not find a mapping for '${ingredientToReplace}'`,
      suggestions: []
    };
  }
  
  // Get the elemental properties of the ingredient
  const { 
    elementalProperties,
    alchemicalProperties
  } = ingredientMapping.matchedTo;
  
  // Find other ingredients with similar elemental properties
  // This is a simplified version that could be enhanced further
  const potentialSubstitutions = Object.entries(ingredientsMap)
    .filter(([name, mapping]) => {
      // Skip the original ingredient
      if (name.toLowerCase() === ingredientToReplace.toLowerCase()) return false;
      
      // Skip if not the same category (optional, depending on how flexible you want to be)
      if (mapping.category !== ingredientMapping.matchedTo.category) return false;
      
      // Check elemental similarity
      const similarity = calculateElementalSimilarity(
        elementalProperties,
        mapping.elementalProperties
      );
      
      return similarity > 0.7; // Only return ingredients with 70%+ similarity
    })
    .map(([name, mapping]) => ({
      name,
      similarity: calculateElementalSimilarity(elementalProperties, mapping.elementalProperties),
      mapping
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Get top 5 results
  
  return {
    success: true,
    original: ingredientMapping,
    suggestions: potentialSubstitutions
  };
}

/**
 * Helper to calculate similarity between elemental properties
 */
function calculateElementalSimilarity(
  properties1: ElementalProperties,
  properties2: ElementalProperties
): number {
  if (!properties1 || !properties2) return 0;
  
  // Calculate difference for each element
  const fireDiff = Math.abs((properties1.Fire || 0) - (properties2.Fire || 0));
  const waterDiff = Math.abs((properties1.Water || 0) - (properties2.Water || 0));
  const earthDiff = Math.abs((properties1.Earth || 0) - (properties2.Earth || 0));
  const airDiff = Math.abs((properties1.Air || 0) - (properties2.Air || 0));
  
  // Total difference (maximum possible is 4)
  const totalDiff = fireDiff + waterDiff + earthDiff + airDiff;
  
  // Convert to similarity (0-1 range)
  return 1 - (totalDiff / 4);
} 