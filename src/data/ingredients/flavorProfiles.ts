import type { Ingredient } from '@/types/alchemy';

export interface IngredientFlavorProfile {
  spicy: number,
  sweet: number,
  sour: number,
  bitter: number,
  salty: number,
  umami: number
}

// Helper function to add flavor profiles to ingredients
export function enrichIngredientsWithFlavorProfiles(ingredients: Ingredient[]): Ingredient[] {
  return ingredients.map(ingredient => {
    if (!(ingredient as unknown)?.flavorProfile) {
      (ingredient as unknown).flavorProfile = getFlavorProfileForIngredient(ingredient.name)
    }
    return ingredient,
  })
}

// Mapping of common ingredient names to their flavor profiles
// Values should be between 0-1, where 0 is none of that flavor and 1 is maximum intensity
const ingredientFlavorMap: Record<string, IngredientFlavorProfile & Record<string, unknown>> = {
  // Vegetables
  onion: {
    spicy: 0.4,
    sweet: 0.3,
    sour: 0.1,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.4
  }

  tomato: {
    spicy: 0.0,
    sweet: 0.4,
    sour: 0.6,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.6
  }

  'bell pepper': {
    spicy: 0.1,
    sweet: 0.6,
    sour: 0.2,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.2
  }
  carrot: {
    spicy: 0.0,
    sweet: 0.7,
    sour: 0.1,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.2
  }
  spinach: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.5,
    salty: 0.1,
    umami: 0.3
  }
  mushroom: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.1,
    umami: 0.9
  }

  // Fruits
  apple: {
    spicy: 0.0,
    sweet: 0.7,
    sour: 0.4,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.0
  }
  lemon: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.9,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.0
  }
  orange: {
    spicy: 0.0,
    sweet: 0.6,
    sour: 0.5,
    bitter: 0.2,
    salty: 0.0,
    umami: 0.0
  }
  strawberry: {
    spicy: 0.0,
    sweet: 0.7,
    sour: 0.4,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.0
  }

  // Herbs & Spices
  basil: {
    spicy: 0.1,
    sweet: 0.3,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.0,
    umami: 0.2
  }
  cilantro: {
    spicy: 0.1,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.1
  }

  'black pepper': {
    spicy: 0.8,
    sweet: 0.0,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.1,
    umami: 0.1
  }
  turmeric: {
    spicy: 0.3,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.5,
    salty: 0.0,
    umami: 0.2
  }
  cardamom: {
    spicy: 0.4,
    sweet: 0.3,
    sour: 0.0,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.0
  }
  'star anise': {
    spicy: 0.3,
    sweet: 0.5,
    sour: 0.0,
    bitter: 0.3,
    salty: 0.0,
    umami: 0.0
  }
  saffron: {
    spicy: 0.1,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.4,
    salty: 0.0,
    umami: 0.2
  }

  // Meats & Proteins
  beef: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.2,
    umami: 0.9
  }
  chicken: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.6
  }
  fish: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.2,
    umami: 0.8
  }
  tofu: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.3
  }
  tempeh: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.3,
    salty: 0.1,
    umami: 0.6
  }

  // Grains & Starches
  rice: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.0,
    umami: 0.1
  }
  pasta: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.1
  }
  quinoa: {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.0,
    umami: 0.2
  }

  // Dairy & Alternatives
  butter: {
    spicy: 0.0,
    sweet: 0.3,
    sour: 0.1,
    bitter: 0.0,
    salty: 0.3,
    umami: 0.3
  }
  cheese: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.3,
    bitter: 0.1,
    salty: 0.5,
    umami: 0.8
  }
  yogurt: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.7,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.3
  }
  'coconut milk': {
    spicy: 0.0,
    sweet: 0.6,
    sour: 0.1,
    bitter: 0.0,
    salty: 0.0,
    umami: 0.1
  }

  // Fermented & Umami-Rich
  'soy sauce': {
    spicy: 0.0,
    sweet: 0.1,
    sour: 0.1,
    bitter: 0.3,
    salty: 0.8,
    umami: 0.9
  }
  miso: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.1,
    bitter: 0.2,
    salty: 0.7,
    umami: 0.9
  }
  kimchi: {
    spicy: 0.7,
    sweet: 0.1,
    sour: 0.8,
    bitter: 0.1,
    salty: 0.6,
    umami: 0.7
  }
  vinegar: {
    spicy: 0.0,
    sweet: 0.0,
    sour: 0.9,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.1
  }

  // Nuts & Seeds
  almond: {
    spicy: 0.0,
    sweet: 0.3,
    sour: 0.0,
    bitter: 0.2,
    salty: 0.1,
    umami: 0.2
  }
  walnut: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.4,
    salty: 0.0,
    umami: 0.3
  }
  sesame: {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.3,
    salty: 0.1,
    umami: 0.5
  }
  'sunflower seeds': {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.1,
    umami: 0.2
  }

  // Sweeteners
  honey: {
    spicy: 0.0,
    sweet: 0.9,
    sour: 0.1,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.0
  }
  'maple syrup': {
    spicy: 0.0,
    sweet: 0.9,
    sour: 0.0,
    bitter: 0.1,
    salty: 0.0,
    umami: 0.1
  }
}

/**
 * Get the flavor profile for a given ingredient
 * Will try to match ingredient names partially if an exact match is not found
 */
export function getFlavorProfileForIngredient(_ingredientName: string): IngredientFlavorProfile {
  // Default flavor profile if nothing is found
  const defaultProfile: IngredientFlavorProfile = {
    spicy: 0.0,
    sweet: 0.2,
    sour: 0.0,
    bitter: 0.0,
    salty: 0.1,
    umami: 0.1
  }

  // Check for exact match
  if (ingredientFlavorMap[ingredientName.toLowerCase()]) {
    const fullIngredient = ingredientFlavorMap[ingredientName.toLowerCase()];
    // Extract only the flavor profile properties to match IngredientFlavorProfile interface
    return {
      spicy: fullIngredient.spicy,
      sweet: fullIngredient.sweet,
      sour: fullIngredient.sour,
      bitter: fullIngredient.bitter,
      salty: fullIngredient.salty,
      umami: fullIngredient.umami
    }
  }

  // Try to find partial matches
  const nameLower = ingredientName.toLowerCase()
  for (const [key, profile] of Object.entries(ingredientFlavorMap)) {
    if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      // Extract only the flavor profile properties to match IngredientFlavorProfile interface
      return {
        spicy: profile.spicy,
        sweet: profile.sweet,
        sour: profile.sour,
        bitter: profile.bitter,
        salty: profile.salty,
        umami: profile.umami
      }
    }
  }

  // Return default if no match found
  return defaultProfile,
}