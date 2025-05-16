// Enhanced implementation of alchemicalPillarUtils

import { alchemicalPillars } from '../constants/alchemicalPillars';
import { ElementalProperties } from '@/types/alchemy';
import { cookingMethods } from '@/data/cooking/cookingMethods';

/**
 * Get cooking recommendations based on alchemical pillars
 */
export function getHolisticCookingRecommendations(ingredient: any, preferences = {}) {
  try {
    if (!ingredient) {
      console.warn('No ingredient provided to getHolisticCookingRecommendations');
      return []; 
    }
    
    // Get elemental properties from the ingredient
    const elementalProps = ingredient.elementalProperties || {
      Fire: 0.25,
      Water: 0.25, 
      Earth: 0.25,
      Air: 0.25
    };
    
    // Get all cooking methods
    const allMethods = getCookingMethods();
    
    // First pass - calculate raw compatibility scores
    const methodScores = [];
    
    for (const [methodName, methodData] of Object.entries(allMethods)) {
      if (!methodData || !methodData.elementalEffect) continue;
      
      // Base elemental score
      const elementalScore = calculateElementalCompatibility(
        elementalProps,
        methodData.elementalEffect
      );
      
      // Get thermodynamic score
      let thermodynamicScore = 0.5; // Default middle score
      if (methodData.thermodynamicProperties) {
        const tp = methodData.thermodynamicProperties;
        // Weight heat and reactivity positively, but high entropy is generally negative
        thermodynamicScore = (tp.heat || 0) * 0.5 + (1 - (tp.entropy || 0)) * 0.2 + (tp.reactivity || 0) * 0.3;
      }
      
      // Add seasonal and time-of-day factors if available
      let seasonalScore = 0.25; // Base value
      if (methodData.seasonalPreference) {
        // Give a boost for seasonal alignment
        seasonalScore = 0.5; // Can be further calculated based on current season
      }
      
      // Add minor random variation (0-10%) to ensure diversity in recommendations
      const randomFactor = Math.random() * 0.1;
      
      // Calculate weighted total score (different weights for different factors)
      let totalScore = (
        elementalScore * 0.4 +
        thermodynamicScore * 0.3 +
        seasonalScore * 0.15 +
        randomFactor
      );
      
      // Ensure score is within bounds - more spread out between 0.15-0.95
      totalScore = Math.max(0.15, Math.min(0.95, totalScore));
      
      // Determine reason
      let reason = '';
      if (totalScore > 0.7) {
        reason = `Excellent match for ${ingredient.name}'s elemental profile`;
      } else if (totalScore > 0.5) {
        reason = `Good compatibility with ${ingredient.name}`;
      } else if (totalScore > 0.3) {
        reason = `Fair option for preparing ${ingredient.name}`;
      } else {
        reason = `Not ideal for ${ingredient.name}, but can be used`;
      }
      
      methodScores.push({
        method: methodName,
        score: totalScore,
        reason,
        elementalScore,
        thermodynamicScore,
        seasonalScore
      });
    }
    
    // Sort by score in descending order
    methodScores.sort((a, b) => b.score - a.score);
    
    return methodScores;
  } catch (error) {
    console.error('Error in getHolisticCookingRecommendations:', error);
    return [];
  }
}

/**
 * Calculate elemental compatibility between ingredient and cooking method
 */
function calculateElementalCompatibility(ingredientElements: any, methodElements: any): number {
  // Ensure we have valid element objects
  if (!ingredientElements || !methodElements) return 0.5;
  
  // Calculate similarity based on dot product of normalized vectors
  const dotProduct = 0;
  let ingredientMagnitude = 0;
  let methodMagnitude = 0;
  
  // Calculate for each element with proper error handling
  ['Fire', 'Water', 'Earth', 'Air'].forEach(element => {
    const ingredientValue = parseFloat(ingredientElements[element]) || 0;
    const methodValue = parseFloat(methodElements[element]) || 0;
    
    dotProduct += ingredientValue * methodValue;
    ingredientMagnitude += ingredientValue * ingredientValue;
    methodMagnitude += methodValue * methodValue;
  });
  
  // Calculate cosine similarity with safety checks
  ingredientMagnitude = Math.sqrt(ingredientMagnitude || 0.0001);
  methodMagnitude = Math.sqrt(methodMagnitude || 0.0001);
  
  if (ingredientMagnitude === 0 || methodMagnitude === 0) return 0.5;
  
  const similarity = dotProduct / (ingredientMagnitude * methodMagnitude);
  
  // Normalize to 0-1 range and ensure it's a valid number
  const result = (similarity + 1) / 2;
  return isNaN(result) ? 0.5 : Math.max(0.1, Math.min(0.9, result));
}

/**
 * Calculate alchemical compatibility
 */
function calculateAlchemicalCompatibility(ingredientProps: any, methodProps: any): number {
  if (!ingredientProps || !methodProps) return 0.5;
  
  // Calculate similarity for each alchemical property with error handling
  const similarity = 0;
  const count = 0;
  
  ['Spirit', 'Essence', 'Matter', 'Substance'].forEach(prop => {
    if (ingredientProps[prop] !== undefined && methodProps[prop] !== undefined) {
      // Properly parse float values and handle NaN
      const ingredientValue = parseFloat(ingredientProps[prop]) || 0;
      const methodValue = parseFloat(methodProps[prop]) || 0;
      
      // Higher score when both values are high or both are low
      similarity += 1 - Math.abs(ingredientValue - methodValue);
      count++;
    }
  });
  
  // Return average similarity with safety check
  const result = count > 0 ? similarity / count : 0.5;
  return isNaN(result) ? 0.5 : Math.max(0.1, Math.min(0.9, result));
}

/**
 * Get the primary pillar for an ingredient based on its element
 */
export function getPrimaryPillar(ingredient: any) {
  // Simplistic mapping based on elemental properties
  const props = ingredient?.elementalProperties || {};
  
  // Determine the dominant element
  let maxElement = 'Earth';
  let maxValue = props.Earth || 0;
  
  if ((props.Fire || 0) > maxValue) {
    maxElement = 'Fire';
    maxValue = props.Fire || 0;
  }
  
  if ((props.Water || 0) > maxValue) {
    maxElement = 'Water';
    maxValue = props.Water || 0;
  }
  
  if ((props.Air || 0) > maxValue) {
    maxElement = 'Air';
    maxValue = props.Air || 0;
  }
  
  // Map dominant element to pillar
  switch (maxElement) {
    case 'Fire':
      return 'Spirit';
    case 'Air':
      return 'Mind';
    case 'Water':
      return 'Soul';
    case 'Earth':
    default:
      return 'Body';
  }
}

/**
 * Calculate pillar balance from elemental properties
 */
export function calculatePillarBalance(elementalProps: any) {
  if (!elementalProps) {
    return {
      Spirit: 0.25,
      Soul: 0.25,
      Mind: 0.25,
      Body: 0.25
    };
  }
  
  // Calculate pillar values
  const spirit = (elementalProps.Fire || 0) * 0.7 + (elementalProps.Air || 0) * 0.3;
  const soul = (elementalProps.Water || 0) * 0.7 + (elementalProps.Fire || 0) * 0.3;
  const mind = (elementalProps.Air || 0) * 0.7 + (elementalProps.Water || 0) * 0.3;
  const body = (elementalProps.Earth || 0) * 0.7 + (elementalProps.Water || 0) * 0.3;
  
  // Normalize to ensure sum equals 1
  const total = spirit + soul + mind + body || 1;
  
  return {
    Spirit: spirit / total,
    Soul: soul / total,
    Mind: mind / total,
    Body: body / total
  };
}

/**
 * Get the cooking method pillar association
 */
export function getCookingMethodPillar(methodName: string) {
  const methodLower = methodName.toLowerCase();
  
  if (methodLower.includes('grill') || methodLower.includes('roast') || methodLower.includes('smoke')) {
    return 'Spirit';
  }
  if (methodLower.includes('steam') || methodLower.includes('boil') || methodLower.includes('poach')) {
    return 'Soul';
  }
  if (methodLower.includes('ferment') || methodLower.includes('infuse') || methodLower.includes('pickle')) {
    return 'Mind';
  }
  if (methodLower.includes('dehydrat') || methodLower.includes('brais') || methodLower.includes('bake')) {
    return 'Body';
  }
  
  // Default
  return 'Body';
}

/**
 * Apply pillar transformation to a cooking method
 */
export function applyPillarTransformation(method: any, methodName: string) {
  if (!method) return { pillar: 'Body', elementalProperties: { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 } };
  
  const pillar = getCookingMethodPillar(methodName);
  
  // Create a copy of the method to avoid modifying the original
  const transformedMethod = { ...method };
  
  // Add pillar information
  transformedMethod.pillar = pillar;
  
  // Default elemental properties if none exist
  if (!transformedMethod.elementalProperties) {
    transformedMethod.elementalProperties = {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25
    };
  }
  
  // Slightly adjust elemental properties based on pillar
  if (pillar === 'Spirit') {
    transformedMethod.elementalProperties = {
      ...transformedMethod.elementalProperties,
      Fire: Math.min(1, (transformedMethod.elementalProperties.Fire || 0) * 1.2)
    };
  } else if (pillar === 'Soul') {
    transformedMethod.elementalProperties = {
      ...transformedMethod.elementalProperties,
      Water: Math.min(1, (transformedMethod.elementalProperties.Water || 0) * 1.2)
    };
  } else if (pillar === 'Mind') {
    transformedMethod.elementalProperties = {
      ...transformedMethod.elementalProperties,
      Air: Math.min(1, (transformedMethod.elementalProperties.Air || 0) * 1.2)
    };
  } else if (pillar === 'Body') {
    transformedMethod.elementalProperties = {
      ...transformedMethod.elementalProperties,
      Earth: Math.min(1, (transformedMethod.elementalProperties.Earth || 0) * 1.2)
    };
  }
  
  return transformedMethod;
}

/**
 * Calculate cooking method compatibility with ingredient
 */
export function calculateCookingMethodCompatibility(method: any, ingredient: any) {
  if (!method || !ingredient) return 0.5;
  
  // Base score on elemental compatibility
  let compatibility = 0.5;
  
  if (method.elementalEffect && ingredient.elementalProperties) {
    compatibility = calculateElementalCompatibility(
      ingredient.elementalProperties,
      method.elementalEffect
    );
  }
  
  // Add bonus for matching alchemical properties
  if (method.alchemicalProperties && ingredient.alchemicalProperties) {
    const alchemicalScore = calculateAlchemicalCompatibility(
      ingredient.alchemicalProperties,
      method.alchemicalProperties
    );
    
    // Weight the final score with proper NaN check
    const rawScore = compatibility * 0.7 + alchemicalScore * 0.3;
    compatibility = isNaN(rawScore) ? 0.5 : rawScore;
  }
  
  // Ensure we return a valid number between 0.1 and 0.9
  return isNaN(compatibility) ? 0.5 : Math.max(0.1, Math.min(0.9, compatibility));
}

// Add the getCookingMethods function if it doesn't exist
function getCookingMethods() {
  return cookingMethods;
}

// Export all functions
export default {
  getHolisticCookingRecommendations,
  getPrimaryPillar,
  calculatePillarBalance,
  getCookingMethodPillar,
  applyPillarTransformation,
  calculateCookingMethodCompatibility
};
