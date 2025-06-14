import type { ElementalProperties, Element, ElementalCharacter } from "@/types/alchemy";
import { Recipe } from '@/types/recipe';

/**
 * Elemental Core Module
 * 
 * Consolidates elemental properties, calculations, and compatibility functions
 * following the elemental principles guide where elements are individually valuable.
 */





// --- Core Types ---

export type ElementalColor = {
  primary: string;
  secondary: string;
  text: string;
  border: string;
  bg: string;
};

export interface ElementalCompatibility {
  compatibility: number; // 0-1 score,
  dominantPAir: {
    recipe: keyof ElementalProperties;
    user: keyof ElementalProperties;
  };
  complementaryScore: number; // 0-1 score for how well elements complement each other,
  balanceScore: number; // 0-1 score for overall balance,
  recommendation: string; // Text recommendation,
}

export interface ElementalCharacteristics {
  name: string;
  description: string;
  qualities: string[];
  season: string;
  timeOfDay: string[];
  cookingMethods: string[];
  flavors: string[];
  colors: string[];
}

export interface ElementalProfile {
  dominant: Element;
  secondary: Element;
  balance: ElementalProperties;
  characteristics: ElementalCharacteristics;
  recommendations: {
    ingredients: string[];
    cookingMethods: string[];
    timeOfDay: string[];
  };
}

// --- Constants ---

export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25
};

export const ELEMENTAL_COLORS: Record<keyof ElementalProperties, ElementalColor> = { Fire: {
    primary: '#FF6B35',
    secondary: '#FF8E53',
    text: '#D63031',
    border: '#FF7675',
    bg: '#FFF5F5',
  },
  Water: {
    primary: '#0984E3',
    secondary: '#74B9FF',
    text: '#2D3436',
    border: '#81ECEC',
    bg: '#F0F8FF',
  },
  Earth: {
    primary: '#6C5CE7',
    secondary: '#A29BFE',
    text: '#2D3436',
    border: '#FDCB6E',
    bg: '#FFFBF0',
  },
  Air: {
    primary: '#00B894',
    secondary: '#55EFC4',
    text: '#2D3436',
    border: '#00CEC9',
    bg: '#F0FFF4',
  }
};

export const ELEMENTAL_SYMBOLS: Record<keyof ElementalProperties, string> = { Fire: '🔥', Water: '💧', Earth: '🌍', Air: '💨'
};

export const ELEMENTAL_DESCRIPTIONS: Record<keyof ElementalProperties, string> = { Fire: 'Energizing, warming, transformative',
  Water: 'Cooling, flowing, adaptive',
  Earth: 'Grounding, nourishing, stable',
  Air: 'Light, fresh, inspiring'
};

// --- Core Functions ---

/**
 * Validate elemental properties structure
 * @param properties Properties to validate
 * @returns Boolean indicating if properties are valid
 */
export function validateElementalProperties(properties: ElementalProperties): boolean {
  if (!properties || typeof properties !== 'object') {
    return false;
  }

  const requiredElements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  for (const element of requiredElements) {
    if (typeof properties[element] !== 'number' || 
        properties[element] < 0 || 
        properties[element] > 1) {
      return false;
    }
  }

  return true;
}

/**
 * Normalize elemental properties to ensure they sum to 1
 * @param properties Partial elemental properties
 * @returns Normalized elemental properties
 */
export function normalizeProperties(properties: Partial<ElementalProperties>): ElementalProperties {
  const normalized: ElementalProperties = { Fire: properties.Fire || 0, Water: properties.Water || 0, Earth: properties.Earth || 0, Air: properties.Air || 0
  };

  const total = normalized.Fire + normalized.Water + normalized.Earth + normalized.Air;
  
  if (total === 0) {
    return DEFAULT_ELEMENTAL_PROPERTIES;
  }

  return { Fire: normalized.Fire / total, Water: normalized.Water / total, Earth: normalized.Earth / total, Air: normalized.Air / total
  };
}

/**
 * Calculate dominant element from elemental properties
 * @param elementalState Elemental properties
 * @returns Dominant element key
 */
export function calculateDominantElement(elementalState: ElementalProperties): keyof ElementalProperties {
  let dominantElement: keyof ElementalProperties = 'Fire';
  let maxValue = 0;

  Object.entries(elementalState || {}).forEach(([element, value]) => {
    if (value > maxValue) {
      maxValue = value;
      dominantElement = element as "Fire" | "Water" | "Earth" | "Air";
    }
  });

  return dominantElement;
}

/**
 * Get elemental color for display
 * @param element Element or undefined
 * @param type Color type to retrieve
 * @returns Color string
 */
export function getElementalColor(
  element: keyof ElementalProperties | undefined, 
  type: keyof ElementalColor = 'text',
): string {
  if (!element || !ELEMENTAL_COLORS[element]) {
    return ELEMENTAL_COLORS?.Fire?.[type]; // Default to Fire
  }
  return ELEMENTAL_COLORS[element][type];
}

/**
 * Get elemental symbol
 * @param element Element
 * @returns Symbol string
 */
export function getElementalSymbol(element: keyof ElementalProperties): string {
  return ELEMENTAL_SYMBOLS[element] || '🔥';
}

/**
 * Get elemental description
 * @param element Element
 * @returns Description string
 */
export function getElementalDescription(element: keyof ElementalProperties): string {
  return ELEMENTAL_DESCRIPTIONS[element] || 'Energizing and transformative';
}

/**
 * Calculate elemental compatibility between two elements
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility description
 */
export function getElementalCompatibility(
  element1: keyof ElementalProperties,
  element2: keyof ElementalProperties,
): 'highly-compatible' | 'compatible' | 'neutral' {
  // Same element has highest compatibility
  if (element1 === element2) {
    return 'highly-compatible';
  }
  
  // All different element combinations have good compatibility
  return 'compatible';
}

/**
 * Calculate numerical elemental compatibility score
 * @param element1 First element
 * @param element2 Second element
 * @returns Compatibility score (0-1)
 */
export function calculateElementalCompatibility(element1: Element, element2: Element): number {
  // Following the elemental principles: all elements work well together
  if (element1 === element2) {
    return 0.9; // Same element has highest compatibility
  }
  
  // All different element combinations have good compatibility
  return 0.7;
}

/**
 * Calculate detailed elemental compatibility between recipe and user
 * @param recipeElemental Recipe elemental properties
 * @param userElemental User elemental properties
 * @returns Detailed compatibility analysis
 */
export function calculateDetailedElementalCompatibility(
  recipeElemental: ElementalProperties,
  userElemental: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES,
): ElementalCompatibility {
  const recipeDominant = calculateDominantElement(recipeElemental);
  const userDominant = calculateDominantElement(userElemental);
  
  // Calculate base compatibility
  const baseCompatibility = calculateElementalCompatibility(recipeDominant, userDominant);
  
  // Calculate complementary score (how well elements work together)
  const complementaryScore = calculateComplementaryScore(recipeDominant, userDominant);
  
  // Calculate balance score (overall harmony)
  const balanceScore = calculateBalanceScore(recipeElemental, userElemental);
  
  // Overall compatibility is weighted average
  const compatibility = (baseCompatibility * 0.4) + (complementaryScore * 0.3) + (balanceScore * 0.3);
  
  return {
    compatibility,
    dominantPAir: {
      recipe: recipeDominant,
      user: userDominant,
    },
    complementaryScore,
    balanceScore,
    recommendation: generateCompatibilityRecommendation(compatibility, recipeDominant, userDominant)
  };
}

/**
 * Get complementary element (following elemental principles: like reinforces like)
 * @param element Element to find complement for
 * @returns Complementary element (same element)
 */
export function getComplementaryElement(element: keyof ElementalProperties): keyof ElementalProperties {
  // Each element complements itself most strongly
  return element;
}

/**
 * Get strengthening element (element that enhances the given element)
 * @param element Element to strengthen
 * @returns Strengthening element
 */
export function getStrengtheningElement(element: Element): Element {
  // Following elemental principles: like reinforces like
  return element;
}

/**
 * Combine elemental properties with weighting
 * @param a First elemental properties
 * @param b Second elemental properties
 * @param bWeight Weight for second properties (0-1)
 * @returns Combined elemental properties
 */
export function combineElementalProperties(
  a: ElementalProperties,
  b: ElementalProperties,
  bWeight = 0.5
): ElementalProperties {
  const aWeight = 1 - bWeight;
  
  return normalizeProperties({ Fire: (a.Fire * aWeight) + (b.Fire * bWeight), Water: (a.Water * aWeight) + (b.Water * bWeight), Earth: (a.Earth * aWeight) + (b.Earth * bWeight), Air: (a.Air * aWeight) + (b.Air * bWeight)
  });
}

/**
 * Calculate elemental state from recipe
 * @param recipe Recipe to analyze
 * @returns Elemental properties
 */
export function calculateElementalState(recipe: Recipe | null | undefined): ElementalProperties {
  if (!recipe) {
    return DEFAULT_ELEMENTAL_PROPERTIES;
  }

  // Use existing elemental properties if available
  if (recipe.elementalState && validateElementalProperties(recipe.elementalState)) {
    return recipe.elementalState as ElementalProperties;
  }

  // Calculate from ingredients if available
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    return calculateElementalStateFromIngredients(recipe.ingredients);
  }

  // Default fallback
  return DEFAULT_ELEMENTAL_PROPERTIES;
}

/**
 * Calculate elemental state from ingredients
 * @param ingredients Array of ingredients
 * @returns Elemental properties
 */
function calculateElementalStateFromIngredients(ingredients: Array<{ category?: string; amount?: number }>): ElementalProperties {
  const elementalState = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalWeight = 0;

  (ingredients || []).forEach(ingredient => {
    const category = ingredient.category?.toLowerCase() || '';
    const amount = ingredient.amount || 1;
    
    // Map categories to elements
    let elementContribution = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    
    if (category.includes('spice') || category.includes('pepper')) {
      elementContribution.Fire = 0.7;
      elementContribution.Air = 0.3;
    } else if (category.includes('vegetable') || category.includes('root')) {
      elementContribution.Earth = 0.6;
      elementContribution.Water = 0.4;
    } else if (category.includes('fruit') || category.includes('liquid')) {
      elementContribution.Water = 0.7;
      elementContribution.Air = 0.3;
    } else if (category.includes('herb') || category.includes('leaf')) {
      elementContribution.Air = 0.6;
      elementContribution.Earth = 0.4;
    } else {
      // Default balanced contribution
      elementContribution = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }
    
    // Add weighted contribution
    Object.keys(elementContribution || {}).forEach(element => {
      elementalState[element as "Fire" | "Water" | "Earth" | "Air"] += 
        elementContribution[element as "Fire" | "Water" | "Earth" | "Air"] * amount;
    });
    
    totalWeight += amount;
  });

  // Normalize
  if (totalWeight > 0) {
    Object.keys(elementalState || {}).forEach(element => {
      elementalState[element as "Fire" | "Water" | "Earth" | "Air"] /= totalWeight;
    });
  }

  return normalizeProperties(elementalState);
}

/**
 * Get elemental characteristics for an element
 * @param element Element
 * @returns Elemental characteristics
 */
export function getElementalCharacteristics(element: Element): ElementalCharacteristics {
  const characteristics: Record<Element, ElementalCharacteristics> = { Fire: {
      name: 'Fire',
      description: 'Energizing, warming, transformative energy that brings vitality and passion',
      qualities: ['Hot', 'Dry', 'Active', 'Transformative', 'Energizing'],
      season: 'Summer',
      timeOfDay: ['Morning', 'Noon'],
      cookingMethods: ['Grilling', 'Roasting', 'Searing', 'Flambéing'],
      flavors: ['Spicy', 'Pungent', 'Warming'],
      colors: ['Red', 'Orange', 'Yellow']
    },
    Water: {
      name: 'Water',
      description: 'Cooling, flowing, adaptive energy that brings calm and flexibility',
      qualities: ['Cold', 'Wet', 'Passive', 'Flowing', 'Cooling'],
      season: 'Winter',
      timeOfDay: ['Evening', 'Night'],
      cookingMethods: ['Steaming', 'Boiling', 'Poaching', 'Braising'],
      flavors: ['Sweet', 'Salty', 'Cooling'],
      colors: ['Blue', 'Indigo', 'Deep Purple']
    },
    Earth: {
      name: 'Earth',
      description: 'Grounding, nourishing, stable energy that brings strength and endurance',
      qualities: ['Cold', 'Dry', 'Stable', 'Grounding', 'Nourishing'],
      season: 'Autumn',
      timeOfDay: ['Late Afternoon', 'Early Evening'],
      cookingMethods: ['Baking', 'Slow Cooking', 'Stewing', 'Fermenting'],
      flavors: ['Sweet', 'earthy', 'Rich'],
      colors: ['Brown', 'Green', 'Yellow']
    },
    Air: {
      name: 'Air',
      description: 'Light, fresh, inspiring energy that brings clarity and movement',
      qualities: ['Hot', 'Wet', 'Active', 'Light', 'Inspiring'],
      season: 'Spring',
      timeOfDay: ['Early Morning', 'Late Morning'],
      cookingMethods: ['Raw', 'Light Sautéing', 'Quick Stir-fry', 'Blanching'],
      flavors: ['Bitter', 'Sour', 'Fresh'],
      colors: ['Light Blue', 'White', 'Light Green']
    }
  };

  return characteristics[element];
}

// --- Helper Functions ---

function calculateComplementaryScore(
  element1: keyof ElementalProperties,
  element2: keyof ElementalProperties,
): number {
  // Same element has highest complementary score
  if (element1 === element2) {
    return 0.9;
  }
  
  // All different combinations have good complementary scores
  return 0.7;
}

function calculateBalanceScore(
  recipeProps: ElementalProperties,
  userProps: ElementalProperties,
): number {
  // Calculate how well the recipe balances with user's elemental state
  let totalDifference = 0;
  const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  (elements || []).forEach(element => {
    const difference = Math.abs(recipeProps[element] - userProps[element]);
    totalDifference += difference;
  });
  
  // Convert difference to balance score (lower difference = higher balance)
  const averageDifference = totalDifference / (elements || []).length;
  return Math.max(0, 1 - averageDifference);
}

function generateCompatibilityRecommendation(
  score: number,
  recipeDominant: keyof ElementalProperties,
  userDominant: keyof ElementalProperties,
): string {
  // Use safe type casting for string operations
  const recipeDominantStr = (recipeDominant as string)?.toLowerCase();
  const userDominantStr = (userDominant as string)?.toLowerCase();
  
  if (score >= 0.8) {
    return `Excellent match! This ${recipeDominantStr}-dominant recipe aligns perfectly with your ${userDominantStr} energy.`;
  } else if (score >= 0.6) {
    return `Good compatibility. This ${recipeDominantStr}-based recipe complements your ${userDominantStr} nature well.`;
  } else if (score >= 0.4) {
    return `Moderate match. This ${recipeDominantStr} recipe offers a different but harmonious energy to your ${userDominantStr} state.`;
  } else {
    return `This ${recipeDominantStr} recipe provides a contrasting energy to your ${userDominantStr} nature, which can be balancing.`;
  }
}

/**
 * Get default elemental properties
 * @returns Default balanced elemental properties
 */
export function getDefaultElementalProperties(): ElementalProperties {
  return { ...DEFAULT_ELEMENTAL_PROPERTIES };
}

/**
 * Standardize recipe elemental properties
 * @param recipe Recipe to standardize
 * @returns Recipe with standardized elemental properties
 */
export function standardizeRecipeElements<T>(
  recipe: T | null | undefined,
): T & { elementalProperties: ElementalProperties } {
  if (!recipe) {
    return {
      elementalProperties: DEFAULT_ELEMENTAL_PROPERTIES,
    } as T & { elementalProperties: ElementalProperties };
  }

  // Use safe type casting for property access
  const recipeData = recipe as any;
  const elementalProperties = recipeData?.elementalState 
    ? normalizeProperties(recipeData.elementalState)
    : DEFAULT_ELEMENTAL_PROPERTIES;

  return {
    ...recipe,
    elementalProperties
  };
}

export default {
  validateElementalProperties,
  normalizeProperties,
  calculateDominantElement,
  getElementalColor,
  getElementalSymbol,
  getElementalDescription,
  getElementalCompatibility,
  calculateElementalCompatibility,
  calculateDetailedElementalCompatibility,
  getComplementaryElement,
  getStrengtheningElement,
  combineElementalProperties,
  calculateElementalState,
  getElementalCharacteristics,
  getDefaultElementalProperties,
  standardizeRecipeElements,
  DEFAULT_ELEMENTAL_PROPERTIES,
  ELEMENTAL_COLORS,
  ELEMENTAL_SYMBOLS,
  ELEMENTAL_DESCRIPTIONS
}; 