import type { ElementalProperties } from '@/types/alchemy';

export interface CuisineFlavorProfile {
  id: string;
  name: string;
  description?: string;
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
  parentCuisine?: string;        // Parent cuisine for regional variants
  regionalVariants?: string[];   // Regional variants of this cuisine
  dietarySuitability?: string[];
  elementalProperties?: Record<string, number>;
  flavorIntensities?: Record<string, number>;
  tastingNotes?: string[];
  primaryIngredients?: string[];
  commonCookingMethods?: string[];
  signatureDishes?: string[];
  culturalContext?: string;
}

export const cuisineFlavorProfiles: Record<string, CuisineFlavorProfile> = {
  // Mediterranean Cuisines
  greek: {
    id: 'greek',
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
    seasonalPreference: ["summer", "spring"],
    dietarySuitability: ['vegetarian', 'pescatarian', 'Mediterranean'],
  },
  
  french: {
    id: 'french',
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
    seasonalPreference: ["all"],
    regionalVariants: ["provencal", "alsatian", "normandy"],
    dietarySuitability: ['vegetarian-adaptable', 'dairy-rich'],
  },

  italian: {
    id: 'italian',
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
    seasonalPreference: ["summer", "fall"],
    regionalVariants: ["sicilian", "tuscan", "neapolitan"],
    dietarySuitability: ['vegetarian-friendly', 'Mediterranean'],
  },
  
  // Asian Cuisines
  japanese: {
    id: 'japanese',
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
    seasonalPreference: ["spring", "winter"],
    regionalVariants: ["osaka", "tokyo", "kyoto", "okinawan"],
    dietarySuitability: ['pescatarian', 'low-fat', 'gluten-free-options'],
  },
  
  korean: {
    id: 'korean',
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
    seasonalPreference: ["all"],
    dietarySuitability: ['vegetarian-options', 'fermented-foods', 'gluten-free-adaptable'],
  },
  
  chinese: {
    id: 'chinese',
    name: "Chinese",
    description: "Diverse, ancient cuisine with emphasis on balance, texture, and technique.",
    flavorProfiles: {
      spicy: 0.5,
      sweet: 0.4,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.7
    },
    elementalAlignment: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1
    },
    signatureTechniques: ["stir-frying", "steaming", "braising", "double-frying"],
    signatureIngredients: ["soy sauce", "rice", "ginger", "garlic", "scallions"],
    traditionalMealPatterns: ["balance of flavors and textures", "shared dishes", "rice-based"],
    planetaryResonance: ["Saturn", "Jupiter", "Mercury"],
    seasonalPreference: ["all"],
    regionalVariants: ["sichuanese", "cantonese", "shanghainese", "hunanese"],
    dietarySuitability: ['vegetarian-adaptable', 'diverse-options'],
  },
  
  sichuanese: {
    id: 'sichuanese',
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
    seasonalPreference: ["winter", "fall"],
    parentCuisine: "chinese",
    dietarySuitability: ['vegetarian-friendly', 'gluten-free-friendly'],
  },
  
  cantonese: {
    id: 'cantonese',
    name: "Cantonese",
    description: "Fresh, delicate cuisine that emphasizes the natural flavors of ingredients.",
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.6,
      sour: 0.3,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.7
    },
    elementalAlignment: {
      Water: 0.4,
      Earth: 0.3,
      Fire: 0.2,
      Air: 0.1
    },
    signatureTechniques: ["steaming", "stir-frying", "roasting", "double-boiling"],
    signatureIngredients: ["fresh seafood", "soy sauce", "ginger", "scallions", "rice wine"],
    traditionalMealPatterns: ["family-style", "dim sum", "fresh ingredients"],
    planetaryResonance: ["Moon", "Venus", "Mercury"],
    seasonalPreference: ["spring", "summer"],
    parentCuisine: "chinese",
    dietarySuitability: ['vegetarian-friendly', 'gluten-free-friendly'],
  },
  
  // American Cuisines
  mexican: {
    id: 'mexican',
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
    seasonalPreference: ["summer", "fall"],
    regionalVariants: ["oaxacan", "yucatecan", "northern"],
    dietarySuitability: ['vegetarian-adaptable', 'corn-based', 'gluten-free-options'],
  },
  
  thai: {
    id: 'thai',
    name: "Thai",
    description: "Vibrant cuisine balancing sweet, sour, salty, and spicy elements.",
    flavorProfiles: {
      spicy: 0.8,
      sweet: 0.7,
      sour: 0.7,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.5
    },
    elementalAlignment: {
      Fire: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.1
    },
    signatureTechniques: ["stir-frying", "pounding", "grilling", "steaming"],
    signatureIngredients: ["lemongrass", "fish sauce", "chilies", "coconut milk", "thai basil"],
    traditionalMealPatterns: ["balance of flavors", "shared dishes", "rice-centric"],
    planetaryResonance: ["Venus", "Mars", "Sun"],
    seasonalPreference: ["summer", "spring"],
    regionalVariants: ["northern", "southern", "isaan", "central"],
    dietarySuitability: ['vegetarian-adaptable', 'gluten-free-friendly'],
  },
  
  indian: {
    id: 'indian',
    name: "Indian",
    description: "Rich, diverse cuisine with layered spices and regional distinctions.",
    flavorProfiles: {
      spicy: 0.8,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.4
    },
    elementalAlignment: {
      Fire: 0.5,
      Earth: 0.3,
      Water: 0.1,
      Air: 0.1
    },
    signatureTechniques: ["tempering", "slow cooking", "tandoor", "curry-making"],
    signatureIngredients: ["garam masala", "ghee", "chilies", "turmeric", "ginger-garlic"],
    traditionalMealPatterns: ["thali", "variety of flavors", "balanced nutrition"],
    planetaryResonance: ["Mars", "Sun", "Jupiter"],
    seasonalPreference: ["all"],
    regionalVariants: ["punjabi", "bengali", "south indian", "gujarati"],
    dietarySuitability: ['vegetarian', 'vegan-options', 'gluten-free-friendly'],
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
  const cuisineProfile = getCuisineProfile(cuisineName);
  if (!cuisineProfile) return 0;
  
  let matchScore = 0;
  let totalWeight = 0;
  
  // Compare recipe flavors to cuisine's typical flavor profile
  Object.entries(recipeFlavorProfile).forEach(([flavor, recipeValue]) => {
    const cuisineValue = cuisineProfile.flavorProfiles[flavor as keyof typeof cuisineProfile.flavorProfiles] || 0;
    
    // Calculate similarity with a more aggressive formula for differentiation
    // Use a steeper power function to more clearly separate close matches from moderate ones
    const difference = Math.abs(recipeValue - cuisineValue);
    // Increase exponent to 2.0 for more aggressive differentiation
    const similarity = 1 - Math.pow(difference, 2.0);
    
    // More aggressive weighting system to amplify differences
    const weight = cuisineValue > 0.8 ? 6 :  
                   cuisineValue > 0.6 ? 4 :
                   cuisineValue > 0.4 ? 2 :
                   cuisineValue > 0.2 ? 1 : 0.25;
    
    matchScore += similarity * weight;
    totalWeight += weight;
  });
  
  // Normalize to 0-1 range
  const normalizedScore = totalWeight > 0 ? matchScore / totalWeight : 0;
  
  // Apply a more aggressive sigmoid-like scaling function for better differentiation
  // This creates a steeper curve in the middle range (0.4-0.7)
  let scaledScore;
  if (normalizedScore < 0.4) {
    // Scale down lower scores more aggressively
    scaledScore = normalizedScore * 0.6;
  } else if (normalizedScore < 0.7) {
    // Create steeper slope in the middle range
    scaledScore = 0.24 + (normalizedScore - 0.4) * 1.5;
  } else {
    // Boost high scores even more
    scaledScore = 0.69 + (normalizedScore - 0.7) * 1.3;
  }
  
  // Add a small random factor to prevent identical scores (±5%)
  const randomFactor = (Math.random() * 0.1) - 0.05;
  
  // Apply floor and ceiling, ensuring good spread between min and max
  return Math.max(Math.min(scaledScore + randomFactor, 1.0), 0.1);
};

/**
 * Get recommended cuisines for a recipe based on flavor profile similarity,
 * including parent-child cuisine relationships
 */
export const getRecommendedCuisines = (
  recipeFlavorProfile: Record<string, number>
): {cuisine: string, matchScore: number}[] => {
  const results = Object.entries(cuisineFlavorProfiles)
    .map(([cuisineName, profile]) => {
      // Skip child cuisines that have a parent - will handle them separately
      if (profile.parentCuisine) return null;
      
      const matchScore = calculateCuisineFlavorMatch(recipeFlavorProfile, cuisineName);
      return {
        cuisine: cuisineName,
        matchScore,
        isParent: !!profile.regionalVariants?.length
      };
    })
    .filter(result => result !== null && result.matchScore > 0.6) as {cuisine: string, matchScore: number, isParent: boolean}[];
  
  // Add regional variants with good matches
  const regionalResults: {cuisine: string, matchScore: number, isParent: boolean}[] = [];
  
  Object.entries(cuisineFlavorProfiles)
    .filter(([_, profile]) => profile.parentCuisine)
    .forEach(([cuisineName, profile]) => {
      const matchScore = calculateCuisineFlavorMatch(recipeFlavorProfile, cuisineName);
      if (matchScore > 0.65) { // Higher threshold for regional variants
        regionalResults.push({
          cuisine: cuisineName,
          matchScore,
          isParent: false
        });
      }
    });
  
  // Combine and sort by match score
  return [...results, ...regionalResults]
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(({ cuisine, matchScore }) => ({ cuisine, matchScore }));
};

/**
 * Get fusion suggestions based on compatible cuisine flavor profiles,
 * with improved handling of regional cuisine relationships
 */
export const getFusionSuggestions = (
  cuisine1: string, 
  cuisine2: string
): {compatibility: number, techniques: string[], ingredients: string[]} => {
  const profile1 = getCuisineProfile(cuisine1);
  const profile2 = getCuisineProfile(cuisine2);
  
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

/**
 * Get cuisines related to the input cuisine, like regional variants or related traditions
 * Now returns an empty array to maintain compatibility without generating errors
 */
export function getRelatedCuisines(cuisineName: string): string[] {
  if (!cuisineName) return [];
  
  // Return empty array to maintain compatibility without checking regional variants
  return [];
}

/**
 * Calculate match score between two cuisines based on their flavor profiles
 */
export function getCuisineMatchScore(cuisine1: string, cuisine2: string): number {
  // Get cuisine profiles
  const profile1 = getCuisineProfile(cuisine1);
  const profile2 = getCuisineProfile(cuisine2);
  
  if (!profile1 || !profile2) return 0;
  
  // Calculate similarity based on elemental properties
  let similarityScore = 0;
  let totalWeight = 0;
  
  // Compare elemental properties (most important)
  if (profile1.elementalProperties && profile2.elementalProperties) {
    const elements = ['Fire', 'Water', 'Earth', 'Air'];
    let elementalSimilarity = 0;
    
    elements.forEach(element => {
      const val1 = profile1.elementalProperties?.[element] || 0;
      const val2 = profile2.elementalProperties?.[element] || 0;
      
      // Calculate similarity (1 minus the absolute difference)
      elementalSimilarity += 1 - Math.abs(val1 - val2);
    });
    
    // Normalize and weight elemental similarity (60%)
    similarityScore += (elementalSimilarity / 4) * 0.6;
    totalWeight += 0.6;
  }
  
  // Compare flavor intensities (20%)
  if (profile1.flavorIntensities && profile2.flavorIntensities) {
    const flavors = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'];
    let flavorSimilarity = 0;
    
    flavors.forEach(flavor => {
      const val1 = profile1.flavorIntensities?.[flavor] || 0;
      const val2 = profile2.flavorIntensities?.[flavor] || 0;
      
      // Calculate similarity (1 minus the absolute difference)
      flavorSimilarity += 1 - Math.abs(val1 - val2);
    });
    
    // Normalize and weight flavor similarity (20%)
    similarityScore += (flavorSimilarity / 6) * 0.2;
    totalWeight += 0.2;
  }
  
  // Bonus for parent-child relationship (20%)
  const cuisines = [cuisine1.toLowerCase(), cuisine2.toLowerCase()];
  const relatedCuisines1 = getRelatedCuisines(cuisine1);
  const relatedCuisines2 = getRelatedCuisines(cuisine2);
  
  if (relatedCuisines1.some(rc => rc.toLowerCase() === cuisines[1]) || 
      relatedCuisines2.some(rc => rc.toLowerCase() === cuisines[0])) {
    similarityScore += 0.2;
    totalWeight += 0.2;
  }
  
  // Normalize final score if we have weights
  return totalWeight > 0 ? similarityScore / totalWeight : 0;
}

/**
 * Get a cuisine profile by name
 */
export function getCuisineProfile(cuisineName: string): CuisineFlavorProfile | undefined {
  const normalizedName = cuisineName.toLowerCase();
  
  return Object.values(cuisineFlavorProfiles).find(
    c => c.name.toLowerCase() === normalizedName
  );
}

/**
 * Get recipes that match a particular cuisine based on flavor profiles
 */
export function getRecipesForCuisineMatch(cuisineName: string, recipes: any[], limit = 8): any[] {
  if (!cuisineName || !Array.isArray(recipes)) return [];
  
  // Get the cuisine profile
  const cuisineProfile = getCuisineProfile(cuisineName);
  if (!cuisineProfile) return [];
  
  // Different tiers of matches with varied scoring
  
  // Direct exact cuisine matches (highest priority)
  const exactCuisineMatches = recipes.filter(recipe => 
    recipe.cuisine?.toLowerCase() === cuisineName.toLowerCase()
  );
  
  // Regional variant matches
  const regionalMatches = recipes.filter(recipe => 
    !exactCuisineMatches.includes(recipe) &&
    recipe.regionalCuisine?.toLowerCase() === cuisineName.toLowerCase()
  );
  
  // Calculate match scores for all other recipes
  const otherRecipes = recipes.filter(recipe => 
    !exactCuisineMatches.includes(recipe) && 
    !regionalMatches.includes(recipe)
  );
  
  // Score recipe matches using various factors
  const scoredRecipes = otherRecipes.map(recipe => {
    let scoreComponents = [];
    let totalWeight = 0;
    
    // Base flavor profile match (weight: 0.4)
    if (cuisineProfile && recipe.flavorProfile) {
      const flavorScore = calculateFlavorProfileMatch(recipe.flavorProfile, cuisineProfile.flavorProfiles);
      scoreComponents.push(flavorScore * 0.4);
      totalWeight += 0.4;
    }
    
    // Ingredient similarity (weight: 0.3)
    if (cuisineProfile.signatureIngredients && recipe.ingredients) {
      const recipeIngredientNames = recipe.ingredients.map((ing: any) => 
        typeof ing === 'string' ? ing.toLowerCase() : ing.name.toLowerCase()
      );
      
      const commonIngredients = cuisineProfile.signatureIngredients.filter(ing => 
        recipeIngredientNames.some(ri => ri.includes(ing.toLowerCase()))
      );
      
      // Calculate score based on how many signature ingredients are used
      const ingredientScore = commonIngredients.length / 
        Math.min(cuisineProfile.signatureIngredients.length, 5);
      
      scoreComponents.push(ingredientScore * 0.3);
      totalWeight += 0.3;
    }
    
    // Cooking technique similarity (weight: 0.2)
    if (cuisineProfile.signatureTechniques && recipe.cookingMethod) {
      const cookingMethodStr = Array.isArray(recipe.cookingMethod) 
        ? recipe.cookingMethod.join(' ').toLowerCase() 
        : recipe.cookingMethod.toLowerCase();
      
      const techniqueMatch = cuisineProfile.signatureTechniques.some(tech =>
        cookingMethodStr.includes(tech.toLowerCase())
      );
      
      scoreComponents.push(techniqueMatch ? 0.2 : 0);
      totalWeight += 0.2;
    }
    
    // Seasonal alignment (weight: 0.1)
    if (cuisineProfile.seasonalPreference && recipe.season) {
      const seasons = Array.isArray(recipe.season) ? recipe.season : [recipe.season];
      const seasonMatch = seasons.some(season => 
        cuisineProfile.seasonalPreference.includes(season.toLowerCase())
      );
      
      scoreComponents.push(seasonMatch ? 0.1 : 0);
      totalWeight += 0.1;
    }
    
    // Calculate weighted score
    const totalScore = scoreComponents.reduce((sum, score) => sum + score, 0);
    const matchScore = totalWeight > 0 
      ? totalScore / totalWeight 
      : getCuisineMatchScore(cuisineName, recipe.cuisine || '');
    
    // Randomize slightly to avoid all recipes having identical scores
    const jitter = (Math.random() * 0.1) - 0.05; // ±5% variation
    const finalScore = Math.min(1, Math.max(0.1, matchScore + jitter));
    
    return {
      ...recipe,
      matchScore: finalScore
    };
  }).filter(recipe => recipe.matchScore > 0.2); // Only include reasonable matches
  
  // Combine all recipe groups with appropriate match scores
  const result = [
    // Direct matches have score variation from 0.85-1.0
    ...exactCuisineMatches.map(r => ({ 
      ...r, 
      matchScore: 0.85 + (Math.random() * 0.15) // 85-100% match
    })),
    
    // Regional matches have score variation from 0.7-0.9
    ...regionalMatches.map(r => ({ 
      ...r, 
      matchScore: 0.7 + (Math.random() * 0.2) // 70-90% match
    })),
    
    // Other scored recipes are already scored with their calculated values
    // Apply a wider variance to their scores for better differentiation
    ...scoredRecipes.map(recipe => {
      // Apply a larger jitter with a curve that pushes scores further apart
      const baseScore = recipe.matchScore;
      const jitterFactor = baseScore < 0.5 ? 0.15 : 0.10; // More jitter for lower scores
      const jitter = (Math.random() * jitterFactor * 2) - jitterFactor;
      
      // Apply a non-linear transformation to increase score separation
      let adjustedScore;
      if (baseScore > 0.7) {
        // Higher scores get slight adjustments
        adjustedScore = baseScore + jitter * 0.7;
      } else if (baseScore > 0.5) {
        // Mid-range scores get pushed toward extremes
        adjustedScore = baseScore + jitter;
      } else {
        // Lower scores get pushed lower
        adjustedScore = baseScore * 0.9 + jitter;
      }
      
      return {
        ...recipe,
        matchScore: Math.min(0.95, Math.max(0.2, adjustedScore))
      };
    }).sort((a, b) => b.matchScore - a.matchScore)
  ].slice(0, limit);
  
  return result;
}

// Helper function to calculate flavor profile match
function calculateFlavorProfileMatch(recipeProfile: any, cuisineProfile: any): number {
  let similarity = 0;
  let count = 0;
  
  // Compare common flavor dimensions
  const flavors = ['spicy', 'sweet', 'sour', 'bitter', 'salty', 'umami'];
  
  flavors.forEach(flavor => {
    if (recipeProfile[flavor] !== undefined && cuisineProfile[flavor] !== undefined) {
      similarity += 1 - Math.abs(recipeProfile[flavor] - cuisineProfile[flavor]);
      count++;
    }
  });
  
  return count > 0 ? similarity / count : 0.5;
} 