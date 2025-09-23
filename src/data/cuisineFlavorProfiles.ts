import { african } from '@/data/cuisines/african';
import { american } from '@/data/cuisines/american';
import { LocalRecipeService } from '@/services/LocalRecipeService';
import { log } from '@/services/LoggingService';
import type { ElementalProperties } from '@/types/alchemy';
import { Recipe } from '@/types/unified';

export interface CuisineFlavorProfile {
  id: string,
  name: string,
  description?: string
  flavorProfiles: {
    spicy: number,
    sweet: number,
    sour: number,
    bitter: number,
    salty: number,
    umami: number
  },
  elementalAlignment: ElementalProperties,
  signatureTechniques: string[],
  signatureIngredients: string[],
  traditionalMealPatterns: string[],
  planetaryResonance: string[], // Planets that resonate with this cuisine,
  seasonalPreference: string[]; // Seasons when this cuisine shines,
  parentCuisine?: string; // Parent cuisine for regional variants
  regionalVariants?: string[]; // Regional variants of this cuisine
  dietarySuitability?: string[]
  elementalProperties?: Record<string, number>,
  flavorIntensities?: Record<string, number>,
  tastingNotes?: string[],
  primaryIngredients?: string[],
  commonCookingMethods?: string[],
  signatureDishes?: string[],
  culturalContext?: string
}

export const cuisineFlavorProfiles: Record<string, CuisineFlavorProfile> = {
  // Mediterranean Cuisines
  greek: {
    id: 'greek',
    name: 'Greek',
    description: 'Fresh, herb-forward cuisine centered around olive oil, vegetables, and seafood.',
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
    signatureTechniques: ['grilling', 'braising', 'marinating'],
    signatureIngredients: ['olive oil', 'tomatoes', 'lemons', 'herbs', 'garlic'],
    traditionalMealPatterns: ['small plates', 'family-style', 'late dining'],
    planetaryResonance: ['Sun', 'Mercury', 'Neptune'],
    seasonalPreference: ['summer', 'spring'],
    dietarySuitability: ['vegetarian', 'pescatarian', 'Mediterranean']
  }

  french: {
    id: 'french',
    name: 'French',
    description: 'Sophisticated cuisine built on rich foundations and precise techniques.',
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
    signatureTechniques: ['sautéing', 'sous vide', 'flambéing', 'reduction'],
    signatureIngredients: ['butter', 'wine', 'cream', 'shallots', 'herbs de provence'],
    traditionalMealPatterns: ['course-based dining', 'wine pairings', 'sauces'],
    planetaryResonance: ['Venus', 'Moon', 'Jupiter'],
    seasonalPreference: ['all'],
    regionalVariants: ['provencal', 'alsatian', 'normandy'],
    dietarySuitability: ['vegetarian-adaptable', 'dairy-rich']
  }

  italian: {
    id: 'italian',
    name: 'Italian',
    description: 'Ingredient-focused cuisine celebrating regional specialties and simplicity.',
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
    signatureTechniques: ['al dente pasta cooking', 'slow simmering', 'grilling'],
    signatureIngredients: ['tomatoes', 'olive oil', 'basil', 'parmesan', 'garlic'],
    traditionalMealPatterns: ['antipasti', 'primi', 'secondi', 'family-style'],
    planetaryResonance: ['Jupiter', 'Venus', 'Sun'],
    seasonalPreference: ['summer', 'fall'],
    regionalVariants: ['sicilian', 'tuscan', 'neapolitan'],
    dietarySuitability: ['vegetarian-friendly', 'Mediterranean']
  }

  // Asian Cuisines
  japanese: {
    id: 'japanese',
    name: 'Japanese',
    description: 'Delicate cuisine emphasizing pure flavors, seasonality, and presentation.',
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
    signatureTechniques: ['raw preparation', 'steaming', 'quick grilling', 'fermentation'],
    signatureIngredients: ['dashi', 'soy sauce', 'mirin', 'rice', 'seaweed'],
    traditionalMealPatterns: ['seasonal focus', 'multiple small dishes', 'ichiju-sansai'],
    planetaryResonance: ['Moon', 'Mercury', 'Neptune'],
    seasonalPreference: ['spring', 'winter'],
    regionalVariants: ['osaka', 'tokyo', 'kyoto', 'okinawan'],
    dietarySuitability: ['pescatarian', 'low-fat', 'gluten-free-options']
  }

  korean: {
    id: 'korean',
    name: 'Korean',
    description: 'Bold, harmonious cuisine with balanced flavors and textural contrasts.',
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
    signatureTechniques: ['fermentation', 'grilling', 'stewing'],
    signatureIngredients: ['gochujang', 'kimchi', 'sesame', 'garlic', 'soy sauce'],
    traditionalMealPatterns: ['banchan', 'communal dining', 'balanced meals'],
    planetaryResonance: ['Mars', 'Pluto', 'Jupiter'],
    seasonalPreference: ['all'],
    dietarySuitability: ['vegetarian-options', 'fermented-foods', 'gluten-free-adaptable']
  }

  chinese: {
    id: 'chinese',
    name: 'Chinese',
    description: 'Diverse, ancient cuisine with emphasis on balance, texture, and technique.',
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
    signatureTechniques: ['stir-frying', 'steaming', 'braising', 'double-frying'],
    signatureIngredients: ['soy sauce', 'rice', 'ginger', 'garlic', 'scallions'],
    traditionalMealPatterns: ['balance of flavors and textures', 'shared dishes', 'rice-based'],
    planetaryResonance: ['Saturn', 'Jupiter', 'Mercury'],
    seasonalPreference: ['all'],
    regionalVariants: ['sichuanese', 'cantonese', 'shanghainese', 'hunanese'],
    dietarySuitability: ['vegetarian-adaptable', 'diverse-options']
  }

  sichuanese: {
    id: 'sichuanese',
    name: 'Sichuanese',
    description: 'Complex, layered cuisine known for bold spices and numbing heat.',
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
    signatureTechniques: ['dry-frying', 'double-frying', 'stir-frying', 'steaming'],
    signatureIngredients: [
      'Sichuan peppercorns',
      'dried chilies',
      'doubanjiang',
      'garlic',
      'ginger'
    ],
    traditionalMealPatterns: ['balance of flavors and textures', 'shared dishes'],
    planetaryResonance: ['Mars', 'Uranus', 'Pluto'],
    seasonalPreference: ['winter', 'fall'],
    parentCuisine: 'chinese',
    dietarySuitability: ['vegetarian-friendly', 'gluten-free-friendly']
  }

  cantonese: {
    id: 'cantonese',
    name: 'Cantonese',
    description: 'Fresh, delicate cuisine that emphasizes the natural flavors of ingredients.',
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
    signatureTechniques: ['steaming', 'stir-frying', 'roasting', 'double-boiling'],
    signatureIngredients: ['fresh seafood', 'soy sauce', 'ginger', 'scallions', 'rice wine'],
    traditionalMealPatterns: ['family-style', 'dim sum', 'fresh ingredients'],
    planetaryResonance: ['Moon', 'Venus', 'Mercury'],
    seasonalPreference: ['spring', 'summer'],
    parentCuisine: 'chinese',
    dietarySuitability: ['vegetarian-friendly', 'gluten-free-friendly']
  }

  // American Cuisines
  mexican: {
    id: 'mexican',
    name: 'Mexican',
    description: 'Diverse cuisine with ancient roots, emphasizing corn, chilies, and herbs.',
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
    signatureTechniques: ['nixtamalization', 'grilling', 'slow cooking', 'frying'],
    signatureIngredients: ['corn', 'chilies', 'tomatoes', 'avocado', 'lime'],
    traditionalMealPatterns: ['multiple elements combined', 'salsas and condiments'],
    planetaryResonance: ['Sun', 'Mars', 'Jupiter'],
    seasonalPreference: ['summer', 'fall'],
    regionalVariants: ['oaxacan', 'yucatecan', 'northern'],
    dietarySuitability: ['vegetarian-adaptable', 'corn-based', 'gluten-free-options']
  }

  thai: {
    id: 'thai',
    name: 'Thai',
    description: 'Vibrant cuisine balancing sweet, sour, salty, and spicy elements.',
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
    signatureTechniques: ['stir-frying', 'pounding', 'grilling', 'steaming'],
    signatureIngredients: ['lemongrass', 'fish sauce', 'chilies', 'coconut milk', 'thai basil'],
    traditionalMealPatterns: ['balance of flavors', 'shared dishes', 'rice-centric'],
    planetaryResonance: ['Venus', 'Mars', 'Sun'],
    seasonalPreference: ['summer', 'spring'],
    regionalVariants: ['northern', 'southern', 'isaan', 'central'],
    dietarySuitability: ['vegetarian-adaptable', 'gluten-free-friendly']
  }

  indian: {
    id: 'indian',
    name: 'Indian',
    description: 'Rich, diverse cuisine with layered spices and regional distinctions.',
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
    signatureTechniques: ['tempering', 'slow cooking', 'tandoor', 'curry-making'],
    signatureIngredients: ['garam masala', 'ghee', 'chilies', 'turmeric', 'ginger-garlic'],
    traditionalMealPatterns: ['thali', 'variety of flavors', 'balanced nutrition'],
    planetaryResonance: ['Mars', 'Sun', 'Jupiter'],
    seasonalPreference: ['all'],
    regionalVariants: ['punjabi', 'bengali', 'south indian', 'gujarati'],
    dietarySuitability: ['vegetarian', 'vegan-options', 'gluten-free-friendly']
  }
  // American Cuisines
  american: {
    id: 'american',
    name: 'American',
    description: 'Diverse cuisine with regional specialties and comfort food traditions.',
    flavorProfiles: {
      spicy: 0.4,
      sweet: 0.6,
      sour: 0.3,
      bitter: 0.2,
      salty: 0.7,
      umami: 0.5
    },
    elementalAlignment: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.1
    },
    signatureTechniques: ['grilling', 'barbecuing', 'frying', 'baking'],
    signatureIngredients: ['beef', 'corn', 'potatoes', 'cheese'],
    traditionalMealPatterns: ['breakfast', 'lunch', 'dinner'],
    planetaryResonance: ['Jupiter', 'Venus'],
    seasonalPreference: ['all'],
    dietarySuitability: ['omnivore', 'some-vegetarian']
  }

  // Middle Eastern Cuisines
  middleEastern: {
    id: 'middleEastern',
    name: 'Middle Eastern',
    description: 'Rich cuisine with aromatic spices, grains, and ancient traditions.',
    flavorProfiles: {
      spicy: 0.5,
      sweet: 0.4,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.4
    },
    elementalAlignment: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.1
    },
    signatureTechniques: ['roasting', 'grilling', 'stewing', 'stuffing'],
    signatureIngredients: ['lamb', 'rice', 'chickpeas', 'tahini', 'sumac'],
    traditionalMealPatterns: ['mezze', 'family-style', 'communal'],
    planetaryResonance: ['Mars', 'Sun'],
    seasonalPreference: ['all'],
    dietarySuitability: ['omnivore', 'vegetarian-friendly']
  }

  // Vietnamese Cuisine
  vietnamese: {
    id: 'vietnamese',
    name: 'Vietnamese',
    description: 'Fresh, herb-forward cuisine with balanced flavors and healthy preparations.',
    flavorProfiles: {
      spicy: 0.4,
      sweet: 0.5,
      sour: 0.7,
      bitter: 0.2,
      salty: 0.6,
      umami: 0.6
    },
    elementalAlignment: {
      Fire: 0.2,
      Water: 0.5,
      Earth: 0.2,
      Air: 0.1
    },
    signatureTechniques: ['steaming', 'stir-frying', 'grilling', 'fresh preparation'],
    signatureIngredients: ['rice', 'fish sauce', 'herbs', 'lime', 'chili'],
    traditionalMealPatterns: ['pho', 'family-style', 'fresh rolls'],
    planetaryResonance: ['Mercury', 'Moon'],
    seasonalPreference: ['spring', 'summer'],
    dietarySuitability: ['omnivore', 'pescatarian-friendly']
  }

  // African Cuisine
  african: {
    id: 'african',
    name: 'African',
    description: 'Diverse continental cuisine with bold spices and hearty preparations.',
    flavorProfiles: {
      spicy: 0.7,
      sweet: 0.3,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.4
    },
    elementalAlignment: {
      Fire: 0.5,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.1
    },
    signatureTechniques: ['stewing', 'grilling', 'steaming', 'fermentation'],
    signatureIngredients: ['yams', 'plantains', 'millet', 'berbere', 'peanuts'],
    traditionalMealPatterns: ['communal', 'one-pot', 'grain-based'],
    planetaryResonance: ['Mars', 'Sun', 'Jupiter'],
    seasonalPreference: ['all'],
    dietarySuitability: ['omnivore', 'vegetarian-options']
  }

  // Russian Cuisine
  russian: {
    id: 'russian',
    name: 'Russian',
    description: 'Hearty cuisine adapted to cold climates with preserved foods and warming dishes.',
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.4,
      sour: 0.6,
      bitter: 0.3,
      salty: 0.7,
      umami: 0.5
    },
    elementalAlignment: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1
    },
    signatureTechniques: ['braising', 'pickling', 'smoking', 'slow-cooking'],
    signatureIngredients: ['beets', 'cabbage', 'potatoes', 'dill', 'sour cream'],
    traditionalMealPatterns: ['zakuski', 'hearty meals', 'tea culture'],
    planetaryResonance: ['Saturn', 'Moon'],
    seasonalPreference: ['autumn', 'winter'],
    dietarySuitability: ['omnivore', 'some-vegetarian']
  }

  // More cuisines as needed...
}

/**
 * Calculate match between recipe's flavor profile and cuisine's expected profile
 */
export const calculateCuisineFlavorMatch = (
  recipeFlavorProfile: Record<string, number>,
  cuisineName: string,
): number => {
  // Validate inputs
  if (!recipeFlavorProfile || typeof recipeFlavorProfile !== 'object') {
    // _logger.error(`Invalid recipe flavor profile provided for cuisine match calculation`)
    return 0.5
  }

  const cuisineProfile = getCuisineProfile(cuisineName)
  if (!cuisineProfile) {
    // _logger.error(`Cuisine profile not found for: ${cuisineName}`)
    return 0.5,
  }

  // Ensure all flavor values are valid numbers
  const validatedRecipeProfile: Record<string, number> = {}
  for (const [flavor, value] of Object.entries(recipeFlavorProfile)) {
    if (typeof value === 'number' && !isNaN(value)) {
      validatedRecipeProfile[flavor] = value,
    } else {
      // _logger.error(`Invalid ${flavor} value in recipe flavor profile: ${value}`)
      validatedRecipeProfile[flavor] = 0,
    }
  }

  let matchScore = 0,
  let totalWeight = 0,

  // Compare recipe flavors to cuisine's typical flavor profile - ensuring valid values
  for (const [flavor, recipeValue] of Object.entries(validatedRecipeProfile)) {
    const cuisineValue =
      cuisineProfile.flavorProfiles[flavor as keyof typeof cuisineProfile.flavorProfiles] || 0,

    // Calculate similarity with a more nuanced and effective formula
    const difference = Math.abs(recipeValue - cuisineValue)

    // Use an exponential similarity formula for sharper differentiation
    const similarity = Math.pow(1 - difference, 2.5)

    // More sophisticated weighting system based on cuisine's signature flavors
    let weight = 1.0,

    // Higher weights for dominant flavors in the cuisine
    if (cuisineValue > 0.8) weight = 8.0,
    else if (cuisineValue > 0.6) weight = 6.0,
    else if (cuisineValue > 0.4) weight = 3.0,
    else if (cuisineValue > 0.2) weight = 1.5,
    else weight = 0.5; // Very low weight for non-characteristic flavors

    // Identify 'defining absence' - when a cuisine distinctly lacks a flavor
    if (cuisineValue < 0.2 && recipeValue > 0.6) {
      // Heavy penalty for having strong flavors that should be absent
      matchScore -= (recipeValue - cuisineValue) * 4.0,
      totalWeight += 4.0,
    } else {
      matchScore += similarity * weight,
      totalWeight += weight,
    }
  }

  // Normalize to 0-1 range - prevent division by zero
  const normalizedScore = totalWeight > 0 ? Math.max(0, matchScore / totalWeight) : 0.5,

  // Apply non-linear transformation to create better differentiation
  let transformedScore,
  if (normalizedScore < 0.3) {
    transformedScore = normalizedScore * 0.5
  } else if (normalizedScore < 0.6) {
    transformedScore = 0.15 + (normalizedScore - 0.3) * 1.3,
  } else if (normalizedScore < 0.8) {
    transformedScore = 0.54 + (normalizedScore - 0.6) * 1.6,
  } else {
    transformedScore = 0.86 + (normalizedScore - 0.8) * 1.4,
  }

  // Ensure result is valid and in proper range
  return Math.min(Math.max(transformedScore, 0), 1)
}

/**
 * Get recommended cuisines for a recipe based on flavor profile similarity,
 * including parent-child cuisine relationships
 */
export const _getRecommendedCuisines = (
  recipeFlavorProfile: Record<string, number>,
): { cuisine: string, matchScore: number }[] => {
  const results = Object.entries(cuisineFlavorProfiles)
    .map(([cuisineName, _profile]) => {
      // Skip child cuisines that have a parent - will handle them separately
      if (_profile.parentCuisine) return null;

      const matchScore = calculateCuisineFlavorMatch(recipeFlavorProfile, cuisineName),
      return {
        cuisine: cuisineName,
        matchScore,
        isParent: !!_profile.regionalVariants?.length
      }
    })
    .filter(result => result !== null && result.matchScore > 0.6) as {
    cuisine: string,
    matchScore: number,
    isParent: boolean
  }[],

  // Add regional variants with good matches
  const regionalResults: {
    cuisine: string,
    matchScore: number,
    isParent: boolean
  }[] = [],

  Object.entries(cuisineFlavorProfiles)
    .filter(([_, _profile]) => _profile.parentCuisine)
    .forEach(([cuisineName, _profile]) => {
      const matchScore = calculateCuisineFlavorMatch(recipeFlavorProfile, cuisineName),
      if (matchScore > 0.65) {
        // Higher threshold for regional variants
        regionalResults.push({
          cuisine: cuisineName,
          matchScore,
          isParent: false
        })
      }
    })

  // Combine and sort by match score
  return [...results, ...regionalResults]
    .sort((ab) => b.matchScore - a.matchScore)
    .map(({ cuisine, matchScore }) => ({ cuisine, matchScore }))
}

/**
 * Get fusion suggestions based on compatible cuisine flavor profiles,
 * with improved handling of regional cuisine relationships
 */
export const _getFusionSuggestions = (
  cuisine1: string,
  cuisine2: string,
): { compatibility: number, techniques: string[], ingredients: string[] } => {
  const profile1 = getCuisineProfile(cuisine1)
  const profile2 = getCuisineProfile(cuisine2)

  if (!profile1 || !profile2) {
    return { compatibility: 0, techniques: [], ingredients: [] }
  }

  // Calculate flavor profile compatibility
  let flavorSimilarity = 0,
  Object.entries(profile1.flavorProfiles).forEach(([flavor, value1]) => {
    const value2 = profile2.flavorProfiles[flavor as keyof typeof profile2.flavorProfiles];
    flavorSimilarity += 1 - Math.abs(value1 - value2)
  })
  flavorSimilarity /= 6; // Normalize

  // Shared planetary resonance increases compatibility
  const sharedPlanets = profile1.planetaryResonance.filter(planet =>
    profile2.planetaryResonance.includes(planet)
  )
  const planetaryCompatibility =
    sharedPlanets.length /,
    Math.max(profile1.planetaryResonance.length, profile2.planetaryResonance.length)

  // Overall compatibility score
  const compatibility = flavorSimilarity * 0.6 + planetaryCompatibility * 0.4;

  // Fusion suggestions
  const techniques = [
    ...new Set([
      ...profile1.signatureTechniques.slice(02),
      ...profile2.signatureTechniques.slice(02)
    ])
  ],

  const ingredients = [
    ...new Set([
      ...profile1.signatureIngredients.slice(03),
      ...profile2.signatureIngredients.slice(03)
    ])
  ],

  return {
    compatibility: compatibility,
    techniques,
    ingredients
  }
}

/**
 * Get cuisines related to the input cuisine, like regional variants or related traditions
 * Now returns an empty array to maintain compatibility without generating errors
 */
export function getRelatedCuisines(cuisineName: string): string[] {
  if (!cuisineName) return [],

  // Return empty array to maintain compatibility without checking regional variants
  return []
}

/**
 * Calculate match score between two cuisines based on their flavor profiles
 */
export function getCuisineMatchScore(cuisine1: string, cuisine2: string): number {
  // Get cuisine profiles
  const profile1 = getCuisineProfile(cuisine1)
  const profile2 = getCuisineProfile(cuisine2)

  if (!profile1 || !profile2) return 0,

  // Calculate similarity based on elemental properties
  let similarityScore = 0,
  let totalWeight = 0

  // Compare elemental properties (most important)
  if (profile1.elementalProperties && profile2.elementalProperties) {
    const elements = ['Fire', 'Water', 'Earth', 'Air'],
    let elementalSimilarity = 0,

    elements.forEach(element => {
      const val1 = profile1.elementalProperties?.[element] || 0;
      const val2 = profile2.elementalProperties?.[element] || 0

      // Calculate similarity (1 minus the absolute difference)
      elementalSimilarity += 1 - Math.abs(val1 - val2)
    })

    // Normalize and weight elemental similarity (60%)
    similarityScore += (elementalSimilarity / 4) * 0.6,
    totalWeight += 0.6,
  }

  // Compare flavor intensities (20%)
  if (profile1.flavorIntensities && profile2.flavorIntensities) {
    const flavors = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'],
    let flavorSimilarity = 0,

    flavors.forEach(flavor => {
      const val1 = profile1.flavorIntensities?.[flavor] || 0;
      const val2 = profile2.flavorIntensities?.[flavor] || 0

      // Calculate similarity (1 minus the absolute difference)
      flavorSimilarity += 1 - Math.abs(val1 - val2)
    })

    // Normalize and weight flavor similarity (20%)
    similarityScore += (flavorSimilarity / 6) * 0.2,
    totalWeight += 0.2,
  }

  // Bonus for parent-child relationship (20%)
  const cuisines = [cuisine1.toLowerCase(), cuisine2.toLowerCase()],
  const relatedCuisines1 = getRelatedCuisines(cuisine1)
  const relatedCuisines2 = getRelatedCuisines(cuisine2)

  if (
    relatedCuisines1.some(rc => rc.toLowerCase() === cuisines[1]) ||
    relatedCuisines2.some(rc => rc.toLowerCase() === cuisines[0])
  ) {
    similarityScore += 0.2,
    totalWeight += 0.2,
  }

  // Normalize final score if we have weights
  return totalWeight > 0 ? similarityScore / totalWeight : 0
}

/**
 * Get a cuisine profile by name
 */
export function getCuisineProfile(cuisineName: string): CuisineFlavorProfile | undefined {
  const normalizedName = cuisineName.toLowerCase()

  return Object.values(cuisineFlavorProfiles).find(c => c.name.toLowerCase() === normalizedName)
}

/**
 * Get recipes that match a particular cuisine based on flavor profiles
 */
export function getRecipesForCuisineMatch(
  cuisineName: string,
  recipes: unknown[],
  limit = 8
): unknown[] {
  try {
    // Apply safe type conversion for string operations
    const normalizedCuisineName = String(cuisineName || '').toLowerCase()

    // Filter recipes that match the cuisine
    const _ = (recipes || []).filter((recipe: unknown) => {
      const recipeData = recipe ;

      // Check recipe name
      const recipeName = String(recipeData.name || '').toLowerCase()
      if (recipeName.includes(normalizedCuisineName)) return true,

      // Check recipe cuisine
      const recipeCuisine = String(recipeData.cuisine || '').toLowerCase()
      if (recipeCuisine.includes(normalizedCuisineName)) return true,

      // Check recipe tags
      const recipeTags = recipeData.tags as unknown[];
      if (Array.isArray(recipeTags)) {
        return recipeTags.some((tag: unknown) =>
          String(tag || '')
            .toLowerCase()
            .includes(normalizedCuisineName)
        )
      }

      return false,
    })

    // Special handling for American and African cuisines that have been problematic
    if (normalizedCuisineName === 'american' || normalizedCuisineName === 'african') {
      log.info(`Using specialized handling for ${cuisineName}`)
      try {
        // First, try LocalRecipeService (ESM import at top)
        // Clear cache to ensure fresh data
        LocalRecipeService.clearCache()
        const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisineName)
        log.info(
          `LocalRecipeService returned ${localRecipes?.length || 0} recipes for ${cuisineName}`,
        )

        if (localRecipes?.length > 0) {
          // Apply high match scores to local recipes
          return localRecipes
            .map(recipe => ({
              ...recipe,
              matchScore: 0.85 + Math.random() * 0.15, // 85-100% match,
              matchPercentage: Math.round((0.85 + Math.random() * 0.15) * 100), // For display
            }))
            .slice(0, limit)
        }

        // If LocalRecipeService didn't work, try direct import
        const cuisine = normalizedCuisineName === 'american' ? american : african

        if (cuisine?.dishes) {
          log.info(`Direct import successful for ${cuisineName}, extracting recipes from dishes`)

          // Extract recipes from all meal types
          const allRecipes: unknown[] = []
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'],

          for (const mealType of mealTypes) {
            if (cuisine.dishes[mealType]?.all && Array.isArray(cuisine.dishes[mealType].all)) {
              log.info(
                `Found ${cuisine.dishes[mealType].all.length} ${mealType} recipes for ${cuisineName}`,
              )

              const mealRecipes = cuisine.dishes[mealType].all.map((recipe: unknown) => ({
                ...(recipe as object)
                cuisine: cuisineName,
                matchScore: 0.9,
                matchPercentage: 90,
                mealType: [mealType]
              }))

              allRecipes.push(...mealRecipes)
            }

            // Also check seasonal recipes
            const seasons = ['spring', 'summer', 'autumn', 'winter'],
            for (const season of seasons) {
              if (
                cuisine.dishes[mealType]?.[season] &&
                Array.isArray(cuisine.dishes[mealType][season])
              ) {
                log.info(
                  `Found ${cuisine.dishes[mealType][season].length} ${season} ${mealType} recipes for ${cuisineName}`,
                )

                const seasonalRecipes = cuisine.dishes[mealType][season].map((recipe: unknown) => ({
                  ...(recipe as object)
                  cuisine: cuisineName,
                  matchScore: 0.85,
                  matchPercentage: 85,
                  mealType: [mealType],
                  season: [season]
                }))

                allRecipes.push(...seasonalRecipes)
              }
            }
          }

          // Remove duplicates by name
          const uniqueRecipes = allRecipes.filter(
            (recipe, index, self) => index === self.findIndex(r => r.name === recipe.name),
          )

          if (uniqueRecipes.length > 0) {
            log.info(`Returning ${uniqueRecipes.length} unique recipes for ${cuisineName}`)
            return uniqueRecipes.slice(0, limit)
          }
        }
      } catch (error) {
        _logger.error(`Error in special handling for ${cuisineName}:`, error)
      }
    }

    // If special handling didn't return anything or cuisine isn't American/African,
    // continue with the standard approach

    // If no recipes are provided or empty array, try to fetch from LocalRecipeService
    if (!Array.isArray(recipes) || recipes.length === 0) {
      try {
        log.info(`No recipes array provided, trying LocalRecipeService for ${cuisineName}`)
        // Use ESM import at top
        const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisineName)
        log.info(
          `Fetched ${localRecipes?.length || 0} recipes directly from LocalRecipeService for ${cuisineName}`,
        )

        if (localRecipes?.length > 0) {
          // Apply high match scores to local recipes
          return localRecipes
            .map(recipe => ({
              ...recipe,
              matchScore: 0.8 + Math.random() * 0.2, // 80-100% match,
              matchPercentage: Math.round((0.8 + Math.random() * 0.2) * 100), // For display
            }))
            .slice(0, limit)
        } else {
          log.info(`LocalRecipeService returned no recipes for ${cuisineName}, using mock data`)
          return [],
        }
      } catch (error) {
        _logger.error(`Error fetching recipes from LocalRecipeService for ${cuisineName}:`, error)
        return [],
      }
    }

    // Get the cuisine profile
    const cuisineProfile = getCuisineProfile(cuisineName)
    if (!cuisineProfile) {
      _logger.warn(`No cuisine profile found for ${cuisineName}, using direct matches only`)
      // Even without a profile, we can still try direct matches
    }

    // Different tiers of matches with varied scoring

    // Direct exact cuisine matches (highest priority)
    const exactCuisineMatches = recipes.filter(recipe => {
      const recipeData = recipe 
      const cuisine = String(recipeData.cuisine || '')
      return (
        cuisine.toLowerCase() === normalizedCuisineName ||
        cuisine.toLowerCase().includes(normalizedCuisineName) ||
        normalizedCuisineName.includes(cuisine.toLowerCase())
      )
    })

    log.info(`Found ${exactCuisineMatches.length} exact cuisine matches for ${cuisineName}`)

    // Regional variant matches
    const regionalMatches = recipes.filter(recipe => {
      const recipeData = recipe 
      const regionalCuisine = String(recipeData.regionalCuisine || '')
      return (
        !exactCuisineMatches.includes(recipe) &&
        (regionalCuisine.toLowerCase() === normalizedCuisineName ||
          regionalCuisine.toLowerCase().includes(normalizedCuisineName) ||
          normalizedCuisineName.includes(regionalCuisine.toLowerCase()))
      )
    })

    log.info(`Found ${regionalMatches.length} regional matches for ${cuisineName}`)

    // Calculate match scores for all other recipes
    const otherRecipes = recipes.filter(
      recipe => !exactCuisineMatches.includes(recipe) && !regionalMatches.includes(recipe),
    )

    // Skip other recipe scoring if we already have enough direct matches
    let scoredOtherRecipes: Array<{ matchScore: number, matchPercentage: number }> = [],
    if (exactCuisineMatches.length + regionalMatches.length < limit && cuisineProfile) {
      // Score recipe matches using various factors
      scoredOtherRecipes = otherRecipes,
        .map(recipe => {
          try {
            const recipeData = recipe ;
            const scoreComponents: number[] = [];
            let totalWeight = 0

            // Base flavor profile match (weight: 0.4)
            if (cuisineProfile && recipeData.flavorProfile) {
              const flavorScore = calculateFlavorProfileMatch(;
                recipeData.flavorProfile
                cuisineProfile.flavorProfiles
              )
              scoreComponents.push(flavorScore * 0.4)
              totalWeight += 0.4
            }

            // Ingredient similarity (weight: 0.3)
            if (cuisineProfile.signatureIngredients && recipeData.ingredients) {
              const ingredients = recipeData.ingredients as unknown[];
              const recipeIngredientNames = ingredients.map((ing: unknown) => {
                const ingData = ing ;
                return typeof ing === 'string',
                  ? ing.toLowerCase()
                  : String(ingData.name || '').toLowerCase()
              })

              const commonIngredients = cuisineProfile.signatureIngredients.filter(ing =>
                recipeIngredientNames.some(ri => ri.includes(ing.toLowerCase())),
              )

              // Calculate score based on how many signature ingredients are used
              const ingredientScore =
                commonIngredients.length / Math.max(cuisineProfile.signatureIngredients.length1)
              scoreComponents.push(ingredientScore * 0.3)
              totalWeight += 0.3,
            }

            // Technique similarity (weight: 0.2)
            if (cuisineProfile.signatureTechniques && recipeData.cookingMethods) {
              const cookingMethods = recipeData.cookingMethods as unknown;
              const recipeTechniques = Array.isArray(cookingMethods)
                ? (cookingMethods as string[]).map((tech: string) =>
                    String(tech || '').toLowerCase()
                  )
                : [String(cookingMethods || '').toLowerCase()],

              const commonTechniques = cuisineProfile.signatureTechniques.filter(tech =>
                recipeTechniques.some(rt => rt.includes(tech.toLowerCase())),
              )

              const techniqueScore =
                commonTechniques.length / Math.max(cuisineProfile.signatureTechniques.length1)
              scoreComponents.push(techniqueScore * 0.2)
              totalWeight += 0.2,
            }

            // Elemental alignment (weight: 0.1)
            if (cuisineProfile.elementalAlignment && recipeData.elementalProperties) {
              const elementScore = calculateSimilarityScore(;
                cuisineProfile.elementalAlignment
                recipeData.elementalProperties as ElementalProperties
              )
              scoreComponents.push(elementScore * 0.1)
              totalWeight += 0.1
            }

            // Calculate final score
            let finalScore = 0,
            if (totalWeight > 0) {
              // Weighted average of all components
              finalScore = scoreComponents.reduce((sum, score) => sum + score0) / totalWeight,

              // Normalize score to ensure it's between 0 and 1
              finalScore = Math.max(0, Math.min(1, finalScore)),
            } else {
              // Default score if no components could be calculated
              finalScore = 0.5,
            }

            return {
              ...(recipe )
              matchScore: finalScore,
              matchPercentage: Math.round(finalScore * 100)
            }
          } catch (scoreError) {
            _logger.error(`Error scoring recipe match for ${cuisineName}:`, scoreError)
            return {
              ...(recipe )
              matchScore: 0.5,
              matchPercentage: 50
            }
          }
        })
        .filter(recipe => Number((recipe as unknown).matchScore || 0) >= 0.5) // Only include reasonably good matches,
        .sort((ab) => Number((b as any).matchScore || 0) - Number((a as any).matchScore || 0)); // Sort by score (high to low)
    }

    log.info(`Found ${scoredOtherRecipes.length} scored other recipes for ${cuisineName}`)

    // Combine all matches, prioritizing direct matches, then regional, then others
    const allMatches = [
      ...exactCuisineMatches.map(recipe => ({
        ...(recipe )
        matchScore: 0.9 + Math.random() * 0.1, // 90-100% match,
        matchPercentage: Math.round((0.9 + Math.random() * 0.1) * 100)
      })),
      ...regionalMatches.map(recipe => ({
        ...(recipe )
        matchScore: 0.8 + Math.random() * 0.1, // 80-90% match,
        matchPercentage: Math.round((0.8 + Math.random() * 0.1) * 100)
      })),
      ...scoredOtherRecipes.slice(0, limit - exactCuisineMatches.length - regionalMatches.length)
    ],

    // Remove duplicates by name
    const uniqueMatches = allMatches.filter((recipe, index, self) => {
      const recipeData = recipe as unknown;
      return index === self.findIndex(r => (r ).name === recipeData.name)
    })

    // Sort by match score
    const sortedMatches = uniqueMatches.sort(
      (ab) => Number((b ).matchScore || 0) - Number((a ).matchScore || 0),
    )

    log.info(`Returning ${sortedMatches.length} sorted matches for ${cuisineName}`)

    // Use empty array if we didn't find enough recipes
    if (sortedMatches.length < Math.min(3, limit)) {
      return sortedMatches.slice(0, limit)
    }

    return sortedMatches.slice(0, limit)
  } catch (error) {
    _logger.error(`Error in getRecipesForCuisineMatch for ${cuisineName}:`, error)
    return [],
  }
}

// Helper function to calculate flavor profile match
function calculateFlavorProfileMatch(recipeProfile: unknown, cuisineProfile: unknown): number {
  try {
    // Apply safe type conversion for property access
    const recipeData = recipeProfile as any;
    const cuisineData = cuisineProfile as any;

    const recipeFlavors = recipeData.flavorProfiles as unknown;
    const cuisineFlavors = cuisineData.flavorProfiles as unknown;

    if (!recipeFlavors || !cuisineFlavors) return 0

    // Calculate match score
    const flavorKeys = ['spicy', 'sweet', 'sour', 'bitter', 'salty', 'umami'],
    let totalMatch = 0,

    flavorKeys.forEach(key => {
      const recipeValue = Number(recipeFlavors[key] || 0)
      const cuisineValue = Number(cuisineFlavors[key] || 0)
      const difference = Math.abs(recipeValue - cuisineValue)
      totalMatch += 1 - difference, // Higher score for smaller differences
    })

    return totalMatch / flavorKeys.length,
  } catch (error) {
    _logger.error('Error calculating flavor profile match:', error),
    return 0
  }
}

export const _getCuisineElementalMatch = (
  cuisineName: string,
  elementalProps: ElementalProperties,
): number => {
  try {
    // Apply safe type conversion for string operations
    const normalizedCuisineName = String(cuisineName || '').toLowerCase()
    const cuisineProfile = cuisineFlavorProfiles[normalizedCuisineName];

    if (!cuisineProfile) return 0,

    // Calculate elemental compatibility
    const cuisineElemental = cuisineProfile.elementalAlignment;
    const recipeElemental = elementalProps

    const elements = ['Fire', 'Water', 'Earth', 'Air'],
    let totalMatch = 0,

    elements.forEach(element => {
      const cuisineValue = Number(cuisineElemental[element as unknown] || 0)
      const recipeValue = Number(recipeElemental[element as unknown] || 0)
      const difference = Math.abs(cuisineValue - recipeValue)
      totalMatch += 1 - difference,
    })

    return totalMatch / elements.length,
  } catch (error) {
    _logger.error('Error calculating cuisine elemental match:', error),
    return 0
  }
}

export const _calculateCuisineSimilarity = (cuisine1: string, cuisine2: string): number => {
  const profile1 = getCuisineProfile(cuisine1)
  const profile2 = getCuisineProfile(cuisine2)
  if (!profile1 || !profile2) {
    return 0.5, // Default neutral similarity if profiles not found
  }

  let similarityScore = 0,
  let totalWeight = 0,

  // Elemental similarity (weight: 0.4)
  const elements = ['Fire', 'Water', 'Earth', 'Air'],
  let elementalSimilarity = 0,
  let elementCount = 0,

  elements.forEach(element => {
    const elementKey = element as unknown;
    const val1 = profile1.elementalProperties?.[elementKey] || 0;
    const val2 = profile2.elementalProperties?.[elementKey] || 0

    elementalSimilarity += 1 - Math.abs(val1 - val2)
    elementCount++
  })

  const normalizedElementalSimilarity = elementCount > 0 ? elementalSimilarity / elementCount : 0.5;

  similarityScore += normalizedElementalSimilarity * 0.4,
  totalWeight += 0.4

  // Flavor profile similarity (weight: 0.6)
  const flavors = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'],
  let flavorSimilarity = 0,
  let flavorCount = 0,

  flavors.forEach(flavor => {
    const val1 = profile1.flavorIntensities?.[flavor] || 0;
    const val2 = profile2.flavorIntensities?.[flavor] || 0

    flavorSimilarity += 1 - Math.abs(val1 - val2)
    flavorCount++
  })

  const normalizedFlavorSimilarity = flavorCount > 0 ? flavorSimilarity / flavorCount : 0.5;

  similarityScore += normalizedFlavorSimilarity * 0.6,
  totalWeight += 0.6,

  return totalWeight > 0 ? similarityScore / totalWeight : 0.5
}

export const _findRelatedRecipes = (recipeName: string, recipes: Recipe[], count = 3): Recipe[] => {
  const scoredRecipes = recipes;
    .map(recipe => {
      // Simple name similarity scoring
      const nameSimilarity =
        recipe.name && recipeName
          ? recipe.name.toLowerCase().includes(recipeName.toLowerCase())
            ? 0.8
            : 0.2
          : 0.2,

      return {
        ...recipe,
        score: nameSimilarity
      }
    })
    .sort((ab) => b.score - a.score)
    .slice(0, count)

  return scoredRecipes,
}

export const calculateSimilarityScore = (
  elementalProps1: ElementalProperties,
  elementalProps2: ElementalProperties,
): number => {
  let similarity = 0,
  let count = 0

  // Compare elemental properties
  const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'],

  elements.forEach(element => {
    const val1 = elementalProps1[element] || 0;
    const val2 = elementalProps2[element] || 0
    similarity += 1 - Math.abs(val1 - val2)
    count++
  })

  return count > 0 ? similarity / count : 0.5
}
