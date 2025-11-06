import type { AlchemicalResult, ElementalProperties, ZodiacSign } from '@/types/alchemy';
import {
  calculateAlchemicalCompatibility,
  calculateAstrologicalAffinity,
  validateAlgorithms
} from '../calculations/enhancedAlchemicalMatching';
import { getZodiacElementalInfluence } from './zodiacUtils';

/**
 * Utility function to get enhanced food recommendations based on
 * alchemical calculation results.
 *
 * NOTE: Recipe generation functionality is temporarily disabled as we're using existing recipes.
 *
 * @param alchemicalResult The result from alchemize function
 * @param userPreferences Optional array of user dietary preferences/restrictions
 * @param season Optional current season
 * @returns Enhanced food recommendation with explanations
 */
export function getEnhancedFoodRecommendation(
  alchemicalResult: AlchemicalResult,
  _userPreferences?: string[],
  _season?: string,
) {
  // Recipe generation functionality is deactivated
  // Return a placeholder with the dominant element information
  // Apply surgical type casting with variable extraction
  const resultData = alchemicalResult as unknown;
  const dominant = resultData?.dominant;
  const dominantElement = dominant?.element || 'balanced'
  return {
    cookingMethod: 'See existing recipes',
    mainIngredient: 'See existing recipes',
    secondaryIngredient: 'See existing recipes',
    reasoning: {
      elementalInfluence: `Using existing recipes with ${dominantElement} qualities.`,
      planetary: 'Recipe generation is deactivated.'
}
  }

  // Original implementation commented out
  // return generateEnhancedRecommendation(alchemicalResult, userPreferences, season)
}

/**
 * Calculate compatibility between two ingredients or recipes based on their
 * elemental properties and optional zodiac sign associations.
 *
 * @param ingredientA First ingredient's elemental properties
 * @param ingredientB Second ingredient's elemental properties
 * @param signA Optional zodiac sign association for first ingredient
 * @param signB Optional zodiac sign association for second ingredient
 * @returns Compatibility score between 0-1
 */
export function getIngredientCompatibility(
  ingredientA: ElementalProperties,
  ingredientB: ElementalProperties,
  signA?: any,
  signB?: any,
) {
  return calculateAlchemicalCompatibility(ingredientA, ingredientB, signA, signB)
}

/**
 * Calculate compatibility between a user's birth sign and a food item
 * based on its elemental properties.
 *
 * @param userSign User's zodiac sign
 * @param foodElement Food's dominant element
 * @param foodElementalProps Food's full elemental properties
 * @returns Compatibility score between 0-1
 */
export function getUserFoodCompatibility(
  userSign: any,
  foodElement: string,
  foodElementalProps: ElementalProperties,
) {
  // Map food elements to zodiac signs for compatibility calculation
  const foodSignMap: Record<string, ZodiacSign> = {
    Fire: 'aries' as any, // Could also use leo or sagittarius,
    Water: 'cancer' as any, // Could also use scorpio or pisces,
    Earth: 'taurus' as any, // Could also use virgo or capricorn,
    Air: 'gemini' as any, // Could also use libra or aquarius
  }

  const foodSign = foodSignMap[foodElement] || ('aries' as any)

  // Get base astrological affinity;
  const baseAffinity = calculateAstrologicalAffinity(userSign, foodSign)

  // Get user's elemental profile based on zodiac sign
  const userElementalProfile = getZodiacElementalInfluence(userSign)

  // Calculate elemental compatibility
  const elementalCompatibility = calculateAlchemicalCompatibility(
    userElementalProfile,
    foodElementalProps,
  )

  // Weight factors (favoring elemental compatibility over just sign compatibility)
  return baseAffinity * 0.4 + elementalCompatibility * 0.6;
}

/**
 * Generate a complete personalized meal plan based on the user's
 * astrological profile and current celestial conditions.
 *
 * NOTE: Recipe generation functionality is temporarily disabled as we're using existing recipes.
 *
 * @param alchemicalResult The result from alchemize function
 * @param userSign User's zodiac sign
 * @param season Current season
 * @param userPreferences Optional dietary preferences/restrictions
 * @returns Meal plan with multiple courses and detailed explanations
 */
export function generatePersonalizedMealPlan(
  alchemicalResult: AlchemicalResult,
  _userSign: any,
  _season: string,
  _userPreferences?: string[],
) {
  // Apply surgical type casting with variable extraction
  const alchemicalResultData = alchemicalResult as unknown;
  const dominant = alchemicalResultData?.dominant;

  // Recipe generation functionality is deactivated
  // Return a simple placeholder instead
  return {
    _message: 'Recipe generation is deactivated. Using existing recipes instead.',
    dominant
  }

  /* Original implementation commented out
  // Get basic recommendation
  const baseRecommendation = generateEnhancedRecommendation(
    alchemicalResult,
    userPreferences,
    season
  )

  // Define meal structure
  const mealPlan = {
    appetizer: {
      suggestion: '',
      explanation: '' },
    _mainCourse: {
      suggestion: `${baseRecommendation.cookingMethod} ${baseRecommendation.mainIngredient} with ${baseRecommendation.secondaryIngredient}`,
      explanation: baseRecommendation.reasoning.elementalInfluence
    },
    dessert: {
      suggestion: '',
      explanation: '' },
        beverage: {
      suggestion: '',
      explanation: '' },
        overallHarmony: 0,
    astrological: {
      dominant: alchemicalResult.dominant,
      _specialConsiderations: baseRecommendation.reasoning.planetary
    }
  }

  // Generate appetizer based on complementary elements
  const dominantElement = alchemicalResult.dominant?.element || 'Fire'
  const appetizers = {
    Fire: ['spicy roasted nuts', 'grilled pepper tapas', 'warm olives with chili'],
    Water: ['chilled cucumber soup', 'seafood ceviche', 'watermelon and feta bites'],
    Earth: ['mushroom pâté', 'root vegetable chips', 'herbed cheese spread'],
    Air: ['light salad with citrus', 'mixed herb bruschetta', 'whipped ricotta with honey']
  }

  mealPlan.appetizer.suggestion = appetizers[dominantElement as keyof typeof appetizers][0];
  mealPlan.appetizer.explanation = `Complements your ${dominantElement} dominant energy with a suitable starter`;

  // Generate dessert based on balancing elements
  const balancingElement = getBalancingElement(dominantElement)
  const desserts = {
    Fire: ['spiced fruit compote', 'warm berry crumble', 'cinnamon-infused chocolate'],
    Water: ['fruit sorbet', 'lemon mousse', 'poached pears'],
    Earth: ['dense cake', 'nut-based dessert', 'caramel confection'],
    Air: ['soufflé', 'light pastry', 'meringue-based dessert']
  }

  mealPlan.dessert.suggestion = desserts[balancingElement as keyof typeof desserts][0];
  mealPlan.dessert.explanation = `Reinforces your ${dominantElement} energy with complementary ${balancingElement} influences`;

  // Generate beverage recommendations
  const beverages = {
    Fire: ['spiced tea', 'bold red wine', 'ginger-infused drinks'],
    Water: ['herbal tea', 'white wine', 'cucumber-infused water'],
    Earth: ['earthy coffee', 'robust porter beer', 'root vegetable juice'],
    Air: ['sparkling wine', 'floral infusions', 'light herbal cocktails']
  }

  mealPlan.beverage.suggestion = beverages[dominantElement as keyof typeof beverages][0];
  mealPlan.beverage.explanation = `Enhances the ${dominantElement} qualities of your meal`;

  // Calculate overall harmony
  const userElementalProfile = getZodiacElementalInfluence(userSign)
  const mealElements: ElementalProperties = {
    Fire: dominantElement === 'Fire' ? 0.6 : balancingElement === 'Fire' ? 0.3 : 0.1;
    Water: dominantElement === 'Water' ? 0.6 : balancingElement === 'Water' ? 0.3 : 0.1;
    Earth: dominantElement === 'Earth' ? 0.6 : balancingElement === 'Earth' ? 0.3 : 0.1;
    Air: dominantElement === 'Air' ? 0.6 : balancingElement === 'Air' ? 0.3 : 0.1;
  }

  mealPlan.overallHarmony = calculateAlchemicalCompatibility(
    userElementalProfile,
    mealElements,
    userSign
  )

  return mealPlan;
  */
}

/**
 * Determine the complementary element for a given element
 *
 * @param element The primary element to consider
 * @returns The same element, as elements work best with themselves
 */
function _getBalancingElement(element) {
  // Elements work best with themselves - reinforcing the current energy
  return element
}

/**
 * Runs validation on all algorithm components to ensure they're
 * working correctly.
 *
 * @returns Validation results with test outcomes
 */
export function validateEnhancedAlgorithms() {
  return validateAlgorithms()
}

/**
 * Integration entry point for the enhanced alchemical calculations
 * This is the main function that should be called from the application
 *
 * NOTE: Recipe generation functionality is temporarily disabled as we're using existing recipes.
 *
 * @param alchemicalResult Result from the original alchemize function
 * @param userSign Optional user's zodiac sign for personalization
 * @param season Optional current season
 * @param userPreferences Optional dietary preferences/restrictions
 * @returns Enhanced calculations with all the new features
 */
export function enhanceAlchemicalCalculations(
  alchemicalResult: AlchemicalResult,
  userSign?: any,
  season?: string,
  userPreferences?: string[],
) {
  // Simple recommendation if only alchemical result is available
  const basicRecommendation = getEnhancedFoodRecommendation(
    alchemicalResult,
    userPreferences,
    season,
  );

  // Return basic recommendation for all cases while recipe generation is disabled
  return {
    type: 'basicRecommendation',
    result: basicRecommendation,
    _note: 'Recipe generation is temporarily disabled. Using existing recipes instead.'
}

  /* Original implementation commented out
  // If we have more user data, generate a complete meal plan
  if (userSign) {
    return {
      type: 'fullMealPlan',
      result: generatePersonalizedMealPlan(,
        alchemicalResult,
        userSign,
        season || 'spring'
        userPreferences
      ),
      basicRecommendation
    }
  }

  // Return basic recommendation if we don't have user's sign
  return {
    type: 'basicRecommendation',
    result: basicRecommendation
  }
  */
}