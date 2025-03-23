import type { ElementalProperties } from '@/types/alchemy';

export interface CuisineFlavorProfile {
  name: string;
  description: string;
  flavorProfiles: {
    spicy: number;
    sweet: number;
    sour: number;
    bitter: number;
    salty: number;
    umami: number;
  };
  elementalAlignment: ElementalProperties;
  signatureTechniques: string[];
  signatureIngredients: string[];
  traditionalMealPatterns: string[];
  planetaryResonance: string[];  // Planets that resonate with this cuisine
  seasonalPreference: string[];  // Seasons when this cuisine shines
}

export const cuisineFlavorProfiles: Record<string, CuisineFlavorProfile> = {
  // Mediterranean Cuisines
  greek: {
    name: "Greek",
    description: "Fresh, herb-forward cuisine centered around olive oil, vegetables, and seafood.",
    flavorProfiles: {
      spicy: 0.3,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.4,
      salty: 0.6,
      umami: 0.5
    },
    elementalAlignment: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.1
    },
    signatureTechniques: ["grilling", "braising", "marinating"],
    signatureIngredients: ["olive oil", "tomatoes", "lemons", "herbs", "garlic"],
    traditionalMealPatterns: ["small plates", "family-style", "late dining"],
    planetaryResonance: ["Sun", "Mercury", "Neptune"],
    seasonalPreference: ["summer", "spring"]
  },
  
  french: {
    name: "French",
    description: "Sophisticated cuisine built on rich foundations and precise techniques.",
    flavorProfiles: {
      spicy: 0.1,
      sweet: 0.5,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.8
    },
    elementalAlignment: {
      Earth: 0.55,
      Water: 0.25,
      Fire: 0.1,
      Air: 0.1
    },
    signatureTechniques: ["sautéing", "sous vide", "flambéing", "reduction"],
    signatureIngredients: ["butter", "wine", "cream", "shallots", "herbs de provence"],
    traditionalMealPatterns: ["course-based dining", "wine pairings", "sauces"],
    planetaryResonance: ["Venus", "Moon", "Jupiter"],
    seasonalPreference: ["all"]
  },

  italian: {
    name: "Italian",
    description: "Ingredient-focused cuisine celebrating regional specialties and simplicity.",
    flavorProfiles: {
      spicy: 0.3,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.7
    },
    elementalAlignment: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.1,
      Air: 0.1
    },
    signatureTechniques: ["al dente pasta cooking", "slow simmering", "grilling"],
    signatureIngredients: ["tomatoes", "olive oil", "basil", "parmesan", "garlic"],
    traditionalMealPatterns: ["antipasti", "primi", "secondi", "family-style"],
    planetaryResonance: ["Jupiter", "Venus", "Sun"],
    seasonalPreference: ["summer", "fall"]
  },
  
  // Asian Cuisines
  japanese: {
    name: "Japanese",
    description: "Delicate cuisine emphasizing pure flavors, seasonality, and presentation.",
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.3,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.9
    },
    elementalAlignment: {
      Water: 0.65,
      Earth: 0.2,
      Air: 0.1,
      Fire: 0.05
    },
    signatureTechniques: ["raw preparation", "steaming", "quick grilling", "fermentation"],
    signatureIngredients: ["dashi", "soy sauce", "mirin", "rice", "seaweed"],
    traditionalMealPatterns: ["seasonal focus", "multiple small dishes", "ichiju-sansai"],
    planetaryResonance: ["Moon", "Mercury", "Neptune"],
    seasonalPreference: ["spring", "winter"]
  },
  
  korean: {
    name: "Korean",
    description: "Bold, harmonious cuisine with balanced flavors and textural contrasts.",
    flavorProfiles: {
      spicy: 0.8,
      sweet: 0.4,
      sour: 0.6,
      bitter: 0.2,
      salty: 0.6,
      umami: 0.7
    },
    elementalAlignment: {
      Fire: 0.5,
      Earth: 0.3,
      Water: 0.1,
      Air: 0.1
    },
    signatureTechniques: ["fermentation", "grilling", "stewing"],
    signatureIngredients: ["gochujang", "kimchi", "sesame", "garlic", "soy sauce"],
    traditionalMealPatterns: ["banchan", "communal dining", "balanced meals"],
    planetaryResonance: ["Mars", "Pluto", "Jupiter"],
    seasonalPreference: ["all"]
  },
  
  sichuanese: {
    name: "Sichuanese",
    description: "Complex, layered cuisine known for bold spices and numbing heat.",
    flavorProfiles: {
      spicy: 0.9,
      sweet: 0.3,
      sour: 0.5,
      bitter: 0.4,
      salty: 0.5,
      umami: 0.6
    },
    elementalAlignment: {
      Fire: 0.7,
      Earth: 0.1,
      Water: 0.1,
      Air: 0.1
    },
    signatureTechniques: ["dry-frying", "double-frying", "stir-frying", "steaming"],
    signatureIngredients: ["Sichuan peppercorns", "dried chilies", "doubanjiang", "garlic", "ginger"],
    traditionalMealPatterns: ["balance of flavors and textures", "shared dishes"],
    planetaryResonance: ["Mars", "Uranus", "Pluto"],
    seasonalPreference: ["winter", "fall"]
  },
  
  // American Cuisines
  mexican: {
    name: "Mexican",
    description: "Diverse cuisine with ancient roots, emphasizing corn, chilies, and herbs.",
    flavorProfiles: {
      spicy: 0.7,
      sweet: 0.3,
      sour: 0.5,
      bitter: 0.2,
      salty: 0.5,
      umami: 0.4
    },
    elementalAlignment: {
      Fire: 0.55,
      Earth: 0.25,
      Water: 0.1,
      Air: 0.1
    },
    signatureTechniques: ["nixtamalization", "grilling", "slow cooking", "frying"],
    signatureIngredients: ["corn", "chilies", "tomatoes", "avocado", "lime"],
    traditionalMealPatterns: ["multiple elements combined", "salsas and condiments"],
    planetaryResonance: ["Sun", "Mars", "Jupiter"],
    seasonalPreference: ["summer", "fall"]
  },
  
  // More cuisines as needed...
};

/**
 * Calculate match between recipe's flavor profile and cuisine's expected profile
 */
export const calculateCuisineFlavorMatch = (
  recipeFlavorProfile: Record<string, number>,
  cuisineName: string
): number => {
  const cuisineProfile = cuisineFlavorProfiles[cuisineName.toLowerCase()];
  if (!cuisineProfile) return 0;
  
  let matchScore = 0;
  let totalWeight = 0;
  
  // Compare recipe flavors to cuisine's typical flavor profile
  Object.entries(recipeFlavorProfile).forEach(([flavor, recipeValue]) => {
    const cuisineValue = cuisineProfile.flavorProfiles[flavor as keyof typeof cuisineProfile.flavorProfiles] || 0;
    // Calculate similarity (1 - absolute difference)
    const similarity = 1 - Math.abs(recipeValue - cuisineValue);
    // Weight by the importance of the flavor in the cuisine profile
    const weight = cuisineValue > 0.5 ? 2 : 1; // More weight to dominant flavors
    
    matchScore += similarity * weight;
    totalWeight += weight;
  });
  
  // Normalize to 0-1 range
  return totalWeight > 0 ? matchScore / totalWeight : 0;
};

/**
 * Get recommended cuisines for a recipe based on flavor profile similarity
 */
export const getRecommendedCuisines = (
  recipeFlavorProfile: Record<string, number>
): {cuisine: string, matchScore: number}[] => {
  return Object.entries(cuisineFlavorProfiles)
    .map(([cuisineName, _]) => ({
      cuisine: cuisineName,
      matchScore: calculateCuisineFlavorMatch(recipeFlavorProfile, cuisineName)
    }))
    .filter(result => result.matchScore > 0.7)
    .sort((a, b) => b.matchScore - a.matchScore);
};

/**
 * Get fusion suggestions based on compatible cuisine flavor profiles
 */
export const getFusionSuggestions = (
  cuisine1: string, 
  cuisine2: string
): {compatibility: number, techniques: string[], ingredients: string[]} => {
  const profile1 = cuisineFlavorProfiles[cuisine1.toLowerCase()];
  const profile2 = cuisineFlavorProfiles[cuisine2.toLowerCase()];
  
  if (!profile1 || !profile2) {
    return {compatibility: 0, techniques: [], ingredients: []};
  }
  
  // Calculate flavor profile compatibility
  let flavorSimilarity = 0;
  Object.entries(profile1.flavorProfiles).forEach(([flavor, value1]) => {
    const value2 = profile2.flavorProfiles[flavor as keyof typeof profile2.flavorProfiles];
    flavorSimilarity += 1 - Math.abs(value1 - value2);
  });
  flavorSimilarity /= 6; // Normalize
  
  // Shared planetary resonance increases compatibility
  const sharedPlanets = profile1.planetaryResonance.filter(planet => 
    profile2.planetaryResonance.includes(planet)
  );
  const planetaryCompatibility = sharedPlanets.length / 
    Math.max(profile1.planetaryResonance.length, profile2.planetaryResonance.length);
  
  // Overall compatibility score
  const compatibility = (flavorSimilarity * 0.6) + (planetaryCompatibility * 0.4);
  
  // Fusion suggestions
  const techniques = [...new Set([
    ...profile1.signatureTechniques.slice(0, 2),
    ...profile2.signatureTechniques.slice(0, 2)
  ])];
  
  const ingredients = [...new Set([
    ...profile1.signatureIngredients.slice(0, 3),
    ...profile2.signatureIngredients.slice(0, 3)
  ])];
  
  return {
    compatibility: compatibility,
    techniques,
    ingredients
  };
};

// Add a validation function at the end of the file
Object.entries(cuisineFlavorProfiles).forEach(([cuisine, profile]) => {
  // Ensure all elemental alignments add up to 1.0
  const sum = Object.values(profile.elementalAlignment).reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.001) {
    console.warn(`Elemental alignment for ${cuisine} sums to ${sum.toFixed(2)}, should be 1.0`);
  }
  
  // Check for any zero values
  Object.entries(profile.elementalAlignment).forEach(([element, value]) => {
    if (value < 0.05) {
      console.warn(`${cuisine} has very low ${element} value: ${value}`);
    }
  });
}); 