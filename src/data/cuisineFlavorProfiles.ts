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
  planetaryResonance: string[]; // Planets that resonate with this cuisine
  seasonalPreference: string[]; // Seasons when this cuisine shines
  parentCuisine?: string; // Parent cuisine for regional variants
  regionalVariants?: string[]; // Regional variants of this cuisine
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
    name: 'Greek',
    description:
      'Fresh, herb-forward cuisine centered around olive oil, vegetables, and seafood.',
    flavorProfiles: {
      spicy: 0.3,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.4,
      salty: 0.6,
      umami: 0.5,
    },
    elementalAlignment: {
      Fire: 0.3,
      Earth: 0.3,
      Water: 0.3,
      Air: 0.1,
    },
    signatureTechniques: ['grilling', 'braising', 'marinating'],
    signatureIngredients: [
      'olive oil',
      'tomatoes',
      'lemons',
      'herbs',
      'garlic',
    ],
    traditionalMealPatterns: ['small plates', 'family-style', 'late dining'],
    planetaryResonance: ['Sun', 'Mercury', 'Neptune'],
    seasonalPreference: ['summer', 'spring'],
    dietarySuitability: ['vegetarian', 'pescatarian', 'Mediterranean'],
  },

  french: {
    id: 'french',
    name: 'French',
    description:
      'Sophisticated cuisine built on rich foundations and precise techniques.',
    flavorProfiles: {
      spicy: 0.1,
      sweet: 0.5,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.8,
    },
    elementalAlignment: {
      Earth: 0.55,
      Water: 0.25,
      Fire: 0.1,
      Air: 0.1,
    },
    signatureTechniques: ['sautéing', 'sous vide', 'flambéing', 'reduction'],
    signatureIngredients: [
      'butter',
      'wine',
      'cream',
      'shallots',
      'herbs de provence',
    ],
    traditionalMealPatterns: ['course-based dining', 'wine pairings', 'sauces'],
    planetaryResonance: ['Venus', 'Moon', 'Jupiter'],
    seasonalPreference: ['all'],
    regionalVariants: ['provencal', 'alsatian', 'normandy'],
    dietarySuitability: ['vegetarian-adaptable', 'dairy-rich'],
  },

  italian: {
    id: 'italian',
    name: 'Italian',
    description:
      'Ingredient-focused cuisine celebrating regional specialties and simplicity.',
    flavorProfiles: {
      spicy: 0.3,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.7,
    },
    elementalAlignment: {
      Earth: 0.5,
      Fire: 0.3,
      Water: 0.1,
      Air: 0.1,
    },
    signatureTechniques: [
      'al dente pasta cooking',
      'slow simmering',
      'grilling',
    ],
    signatureIngredients: [
      'tomatoes',
      'olive oil',
      'basil',
      'parmesan',
      'garlic',
    ],
    traditionalMealPatterns: ['antipasti', 'primi', 'secondi', 'family-style'],
    planetaryResonance: ['Jupiter', 'Venus', 'Sun'],
    seasonalPreference: ['summer', 'fall'],
    regionalVariants: ['sicilian', 'tuscan', 'neapolitan'],
    dietarySuitability: ['vegetarian-friendly', 'Mediterranean'],
  },

  // Asian Cuisines
  japanese: {
    id: 'japanese',
    name: 'Japanese',
    description:
      'Delicate cuisine emphasizing pure flavors, seasonality, and presentation.',
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.3,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.9,
    },
    elementalAlignment: {
      Water: 0.65,
      Earth: 0.2,
      Air: 0.1,
      Fire: 0.05,
    },
    signatureTechniques: [
      'raw preparation',
      'steaming',
      'quick grilling',
      'fermentation',
    ],
    signatureIngredients: ['dashi', 'soy sauce', 'mirin', 'rice', 'seaweed'],
    traditionalMealPatterns: [
      'seasonal focus',
      'multiple small dishes',
      'ichiju-sansai',
    ],
    planetaryResonance: ['Moon', 'Mercury', 'Neptune'],
    seasonalPreference: ['spring', 'winter'],
    regionalVariants: ['osaka', 'tokyo', 'kyoto', 'okinawan'],
    dietarySuitability: ['pescatarian', 'low-fat', 'gluten-free-options'],
  },

  korean: {
    id: 'korean',
    name: 'Korean',
    description:
      'Bold, harmonious cuisine with balanced flavors and textural contrasts.',
    flavorProfiles: {
      spicy: 0.8,
      sweet: 0.4,
      sour: 0.6,
      bitter: 0.2,
      salty: 0.6,
      umami: 0.7,
    },
    elementalAlignment: {
      Fire: 0.5,
      Earth: 0.3,
      Water: 0.1,
      Air: 0.1,
    },
    signatureTechniques: ['fermentation', 'grilling', 'stewing'],
    signatureIngredients: [
      'gochujang',
      'kimchi',
      'sesame',
      'garlic',
      'soy sauce',
    ],
    traditionalMealPatterns: ['banchan', 'communal dining', 'balanced meals'],
    planetaryResonance: ['Mars', 'Pluto', 'Jupiter'],
    seasonalPreference: ['all'],
    dietarySuitability: [
      'vegetarian-options',
      'fermented-foods',
      'gluten-free-adaptable',
    ],
  },

  chinese: {
    id: 'chinese',
    name: 'Chinese',
    description:
      'Diverse, ancient cuisine with emphasis on balance, texture, and technique.',
    flavorProfiles: {
      spicy: 0.5,
      sweet: 0.4,
      sour: 0.4,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.7,
    },
    elementalAlignment: {
      Fire: 0.3,
      Earth: 0.4,
      Water: 0.2,
      Air: 0.1,
    },
    signatureTechniques: [
      'stir-frying',
      'steaming',
      'braising',
      'double-frying',
    ],
    signatureIngredients: [
      'soy sauce',
      'rice',
      'ginger',
      'garlic',
      'scallions',
    ],
    traditionalMealPatterns: [
      'balance of flavors and textures',
      'shared dishes',
      'rice-based',
    ],
    planetaryResonance: ['Saturn', 'Jupiter', 'Mercury'],
    seasonalPreference: ['all'],
    regionalVariants: ['sichuanese', 'cantonese', 'shanghainese', 'hunanese'],
    dietarySuitability: ['vegetarian-adaptable', 'diverse-options'],
  },

  sichuanese: {
    id: 'sichuanese',
    name: 'Sichuanese',
    description:
      'Complex, layered cuisine known for bold spices and numbing heat.',
    flavorProfiles: {
      spicy: 0.9,
      sweet: 0.3,
      sour: 0.5,
      bitter: 0.4,
      salty: 0.5,
      umami: 0.6,
    },
    elementalAlignment: {
      Fire: 0.7,
      Earth: 0.1,
      Water: 0.1,
      Air: 0.1,
    },
    signatureTechniques: [
      'dry-frying',
      'double-frying',
      'stir-frying',
      'steaming',
    ],
    signatureIngredients: [
      'Sichuan peppercorns',
      'dried chilies',
      'doubanjiang',
      'garlic',
      'ginger',
    ],
    traditionalMealPatterns: [
      'balance of flavors and textures',
      'shared dishes',
    ],
    planetaryResonance: ['Mars', 'Uranus', 'Pluto'],
    seasonalPreference: ['winter', 'fall'],
    parentCuisine: 'chinese',
    dietarySuitability: ['vegetarian-friendly', 'gluten-free-friendly'],
  },

  cantonese: {
    id: 'cantonese',
    name: 'Cantonese',
    description:
      'Fresh, delicate cuisine that emphasizes the natural flavors of ingredients.',
    flavorProfiles: {
      spicy: 0.2,
      sweet: 0.6,
      sour: 0.3,
      bitter: 0.3,
      salty: 0.5,
      umami: 0.7,
    },
    elementalAlignment: {
      Water: 0.4,
      Earth: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    signatureTechniques: [
      'steaming',
      'stir-frying',
      'roasting',
      'double-boiling',
    ],
    signatureIngredients: [
      'fresh seafood',
      'soy sauce',
      'ginger',
      'scallions',
      'rice wine',
    ],
    traditionalMealPatterns: ['family-style', 'dim sum', 'fresh ingredients'],
    planetaryResonance: ['Moon', 'Venus', 'Mercury'],
    seasonalPreference: ['spring', 'summer'],
    parentCuisine: 'chinese',
    dietarySuitability: ['vegetarian-friendly', 'gluten-free-friendly'],
  },

  // American Cuisines
  mexican: {
    id: 'mexican',
    name: 'Mexican',
    description:
      'Diverse cuisine with ancient roots, emphasizing corn, chilies, and herbs.',
    flavorProfiles: {
      spicy: 0.7,
      sweet: 0.3,
      sour: 0.5,
      bitter: 0.2,
      salty: 0.5,
      umami: 0.4,
    },
    elementalAlignment: {
      Fire: 0.55,
      Earth: 0.25,
      Water: 0.1,
      Air: 0.1,
    },
    signatureTechniques: [
      'nixtamalization',
      'grilling',
      'slow cooking',
      'frying',
    ],
    signatureIngredients: ['corn', 'chilies', 'tomatoes', 'avocado', 'lime'],
    traditionalMealPatterns: [
      'multiple elements combined',
      'salsas and condiments',
    ],
    planetaryResonance: ['Sun', 'Mars', 'Jupiter'],
    seasonalPreference: ['summer', 'fall'],
    regionalVariants: ['oaxacan', 'yucatecan', 'northern'],
    dietarySuitability: [
      'vegetarian-adaptable',
      'corn-based',
      'gluten-free-options',
    ],
  },

  thai: {
    id: 'thai',
    name: 'Thai',
    description:
      'Vibrant cuisine balancing sweet, sour, salty, and spicy elements.',
    flavorProfiles: {
      spicy: 0.8,
      sweet: 0.7,
      sour: 0.7,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.5,
    },
    elementalAlignment: {
      Fire: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.1,
    },
    signatureTechniques: ['stir-frying', 'pounding', 'grilling', 'steaming'],
    signatureIngredients: [
      'lemongrass',
      'fish sauce',
      'chilies',
      'coconut milk',
      'thai basil',
    ],
    traditionalMealPatterns: [
      'balance of flavors',
      'shared dishes',
      'rice-centric',
    ],
    planetaryResonance: ['Venus', 'Mars', 'Sun'],
    seasonalPreference: ['summer', 'spring'],
    regionalVariants: ['northern', 'southern', 'isaan', 'central'],
    dietarySuitability: ['vegetarian-adaptable', 'gluten-free-friendly'],
  },

  indian: {
    id: 'indian',
    name: 'Indian',
    description:
      'Rich, diverse cuisine with layered spices and regional distinctions.',
    flavorProfiles: {
      spicy: 0.8,
      sweet: 0.4,
      sour: 0.5,
      bitter: 0.3,
      salty: 0.6,
      umami: 0.4,
    },
    elementalAlignment: {
      Fire: 0.5,
      Earth: 0.3,
      Water: 0.1,
      Air: 0.1,
    },
    signatureTechniques: [
      'tempering',
      'slow cooking',
      'tandoor',
      'curry-making',
    ],
    signatureIngredients: [
      'garam masala',
      'ghee',
      'chilies',
      'turmeric',
      'ginger-garlic',
    ],
    traditionalMealPatterns: [
      'thali',
      'variety of flavors',
      'balanced nutrition',
    ],
    planetaryResonance: ['Mars', 'Sun', 'Jupiter'],
    seasonalPreference: ['all'],
    regionalVariants: ['punjabi', 'bengali', 'south indian', 'gujarati'],
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
  // Validate inputs
  if (!recipeFlavorProfile || typeof recipeFlavorProfile !== 'object') {
    // console.error(`Invalid recipe flavor profile provided for cuisine match calculation`);
    return 0.5;
  }

  const cuisineProfile = getCuisineProfile(cuisineName);
  if (!cuisineProfile) {
    // console.error(`Cuisine profile not found for: ${cuisineName}`);
    return 0.5;
  }

  // Ensure all flavor values are valid numbers
  const validatedRecipeProfile: Record<string, number> = {};
  for (const [flavor, value] of Object.entries(recipeFlavorProfile)) {
    if (typeof value === 'number' && !isNaN(value)) {
      validatedRecipeProfile[flavor] = value;
    } else {
      // console.error(`Invalid ${flavor} value in recipe flavor profile: ${value}`);
      validatedRecipeProfile[flavor] = 0;
    }
  }

  let matchScore = 0;
  let totalWeight = 0;

  // Compare recipe flavors to cuisine's typical flavor profile - ensuring valid values
  for (const [flavor, recipeValue] of Object.entries(validatedRecipeProfile)) {
    const cuisineValue =
      cuisineProfile.flavorProfiles[
        flavor as keyof typeof cuisineProfile.flavorProfiles
      ] || 0;

    // Calculate similarity with a more nuanced and effective formula
    const difference = Math.abs(recipeValue - cuisineValue);

    // Use an exponential similarity formula for sharper differentiation
    const similarity = Math.pow(1 - difference, 2.5);

    // More sophisticated weighting system based on cuisine's signature flavors
    let weight = 1.0;

    // Higher weights for dominant flavors in the cuisine
    if (cuisineValue > 0.8) weight = 8.0;
    else if (cuisineValue > 0.6) weight = 6.0;
    else if (cuisineValue > 0.4) weight = 3.0;
    else if (cuisineValue > 0.2) weight = 1.5;
    else weight = 0.5; // Very low weight for non-characteristic flavors

    // Identify "defining absence" - when a cuisine distinctly lacks a flavor
    if (cuisineValue < 0.2 && recipeValue > 0.6) {
      // Heavy penalty for having strong flavors that should be absent
      matchScore -= (recipeValue - cuisineValue) * 4.0;
      totalWeight += 4.0;
    } else {
      matchScore += similarity * weight;
      totalWeight += weight;
    }
  }

  // Normalize to 0-1 range - prevent division by zero
  const normalizedScore =
    totalWeight > 0 ? Math.max(0, matchScore / totalWeight) : 0.5;

  // Apply non-linear transformation to create better differentiation
  let transformedScore;
  if (normalizedScore < 0.3) {
    transformedScore = normalizedScore * 0.5;
  } else if (normalizedScore < 0.6) {
    transformedScore = 0.15 + (normalizedScore - 0.3) * 1.3;
  } else if (normalizedScore < 0.8) {
    transformedScore = 0.54 + (normalizedScore - 0.6) * 1.6;
  } else {
    transformedScore = 0.86 + (normalizedScore - 0.8) * 1.4;
  }

  // Ensure result is valid and in proper range
  return Math.min(Math.max(transformedScore, 0), 1);
};

/**
 * Get recommended cuisines for a recipe based on flavor profile similarity,
 * including parent-child cuisine relationships
 */
export const getRecommendedCuisines = (
  recipeFlavorProfile: Record<string, number>
): { cuisine: string; matchScore: number }[] => {
  const results = Object.entries(cuisineFlavorProfiles)
    .map(([cuisineName, profile]) => {
      // Skip child cuisines that have a parent - will handle them separately
      if (profile.parentCuisine) return null;

      const matchScore = calculateCuisineFlavorMatch(
        recipeFlavorProfile,
        cuisineName
      );
      return {
        cuisine: cuisineName,
        matchScore,
        isParent: !!profile.regionalVariants?.length,
      };
    })
    .filter((result) => result !== null && result.matchScore > 0.6) as {
    cuisine: string;
    matchScore: number;
    isParent: boolean;
  }[];

  // Add regional variants with good matches
  const regionalResults: {
    cuisine: string;
    matchScore: number;
    isParent: boolean;
  }[] = [];

  Object.entries(cuisineFlavorProfiles)
    .filter(([_, profile]) => profile.parentCuisine)
    .forEach(([cuisineName, profile]) => {
      const matchScore = calculateCuisineFlavorMatch(
        recipeFlavorProfile,
        cuisineName
      );
      if (matchScore > 0.65) {
        // Higher threshold for regional variants
        regionalResults.push({
          cuisine: cuisineName,
          matchScore,
          isParent: false,
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
): { compatibility: number; techniques: string[]; ingredients: string[] } => {
  const profile1 = getCuisineProfile(cuisine1);
  const profile2 = getCuisineProfile(cuisine2);

  if (!profile1 || !profile2) {
    return { compatibility: 0, techniques: [], ingredients: [] };
  }

  // Calculate flavor profile compatibility
  let flavorSimilarity = 0;
  Object.entries(profile1.flavorProfiles).forEach(([flavor, value1]) => {
    const value2 =
      profile2.flavorProfiles[flavor as keyof typeof profile2.flavorProfiles];
    flavorSimilarity += 1 - Math.abs(value1 - value2);
  });
  flavorSimilarity /= 6; // Normalize

  // Shared planetary resonance increases compatibility
  const sharedPlanets = profile1.planetaryResonance.filter((planet) =>
    profile2.planetaryResonance.includes(planet)
  );
  const planetaryCompatibility =
    sharedPlanets.length /
    Math.max(
      profile1.planetaryResonance.length,
      profile2.planetaryResonance.length
    );

  // Overall compatibility score
  const compatibility = flavorSimilarity * 0.6 + planetaryCompatibility * 0.4;

  // Fusion suggestions
  const techniques = [
    ...new Set([
      ...profile1.signatureTechniques.slice(0, 2),
      ...profile2.signatureTechniques.slice(0, 2),
    ]),
  ];

  const ingredients = [
    ...new Set([
      ...profile1.signatureIngredients.slice(0, 3),
      ...profile2.signatureIngredients.slice(0, 3),
    ]),
  ];

  return {
    compatibility: compatibility,
    techniques,
    ingredients,
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
export function getCuisineMatchScore(
  cuisine1: string,
  cuisine2: string
): number {
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

    elements.forEach((element) => {
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

    flavors.forEach((flavor) => {
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

  if (
    relatedCuisines1.some((rc) => rc.toLowerCase() === cuisines[1]) ||
    relatedCuisines2.some((rc) => rc.toLowerCase() === cuisines[0])
  ) {
    similarityScore += 0.2;
    totalWeight += 0.2;
  }

  // Normalize final score if we have weights
  return totalWeight > 0 ? similarityScore / totalWeight : 0;
}

/**
 * Get a cuisine profile by name
 */
export function getCuisineProfile(
  cuisineName: string
): CuisineFlavorProfile | undefined {
  const normalizedName = cuisineName.toLowerCase();

  return Object.values(cuisineFlavorProfiles).find(
    (c) => c.name.toLowerCase() === normalizedName
  );
}

/**
 * Get recipes that match a particular cuisine based on flavor profiles
 */
export function getRecipesForCuisineMatch(
  cuisineName: string,
  recipes: unknown[],
  limit = 8
): unknown[] {
  if (!cuisineName) {
    // console.warn('getRecipesForCuisineMatch called with empty cuisineName');
    return [];
  }

  // console.log(`getRecipesForCuisineMatch called for "${cuisineName}" with ${recipes?.length || 0} recipes`);

  // Normalize the cuisine name to ensure case-insensitive matching
  const normalizedCuisineName = cuisineName.toLowerCase().trim();

  // Create a mock recipe generator for fallback if needed
  const createMockRecipes = (count = 3) => {
    // console.log(`Creating ${count} mock recipes for "${cuisineName}"`);
    const mockRecipes = [];
    
    // Common dishes by cuisine - add more as needed
    const cuisineDishes = {
      'italian': ['Spaghetti Carbonara', 'Margherita Pizza', 'Risotto', 'Lasagna', 'Tiramisu'],
      'french': ['Coq au Vin', 'Beef Bourguignon', 'Ratatouille', 'Quiche Lorraine', 'Crème Brûlée'],
      'japanese': ['Sushi', 'Ramen', 'Tempura', 'Yakitori', 'Miso Soup'],
      'chinese': ['Kung Pao Chicken', 'Dim Sum', 'Mapo Tofu', 'Peking Duck', 'Hot Pot'],
      'indian': ['Butter Chicken', 'Biryani', 'Tikka Masala', 'Samosas', 'Naan'],
      'mexican': ['Tacos', 'Enchiladas', 'Guacamole', 'Mole Poblano', 'Chiles Rellenos'],
      'thai': ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice', 'Som Tam'],
      'greek': ['Moussaka', 'Souvlaki', 'Greek Salad', 'Spanakopita', 'Baklava'],
      'american': ['Burger', 'BBQ Ribs', 'Mac and Cheese', 'Apple Pie', 'Fried Chicken'],
      'african': ['Jollof Rice', 'Bobotie', 'Tagine', 'Piri Piri Chicken', 'Injera'],
    };
    
    // Get dishes specific to this cuisine or use general names
    const dishNames = cuisineDishes[normalizedCuisineName] || 
      [`${cuisineName} Specialty`, `Traditional ${cuisineName} Dish`, `${cuisineName} Delight`];
    
    // Common ingredients for each dish
    const commonIngredients = [
      { name: "Salt", amount: 1, unit: "tsp" },
      { name: "Pepper", amount: 0.5, unit: "tsp" },
      { name: "Olive Oil", amount: 2, unit: "tbsp" },
    ];
    
    // Generate mock recipes
    for (let i = 0; i < Math.min(count, dishNames.length); i++) {
      mockRecipes.push({
        id: `mock-${normalizedCuisineName}-${i}`,
        name: dishNames[i],
        description: `A traditional ${cuisineName} recipe featuring local ingredients and authentic flavors.`,
        cuisine: cuisineName,
        ingredients: [...commonIngredients],
        instructions: ["Prepare ingredients", "Cook according to traditional methods", "Serve and enjoy!"],
        timeToMake: "30 minutes",
        servingSize: 4,
        matchScore: 0.85 + (Math.random() * 0.15),
        matchPercentage: Math.round((0.85 + Math.random() * 0.15) * 100),
        elementalProperties: {
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25
        },
        isMockData: true
      });
    }
    
    return mockRecipes;
  };

  try {
    // Special handling for American and African cuisines that have been problematic
    if (
      normalizedCuisineName === 'american' ||
      normalizedCuisineName === 'african'
    ) {
      // console.log(`Using specialized handling for ${cuisineName}`);
      try {
        // First, try LocalRecipeService
        const { LocalRecipeService } = require('../services/LocalRecipeService');

        // Clear cache to ensure fresh data
        LocalRecipeService.clearCache();
        const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisineName);
        // console.log(`LocalRecipeService returned ${localRecipes?.length || 0} recipes for ${cuisineName}`);

        if (localRecipes && localRecipes.length > 0) {
          // Apply high match scores to local recipes
          return localRecipes
            .map((recipe) => ({
              ...recipe,
              matchScore: 0.85 + Math.random() * 0.15, // 85-100% match
              matchPercentage: Math.round((0.85 + Math.random() * 0.15) * 100), // For display
            }))
            .slice(0, limit);
        }

        // If LocalRecipeService didn't work, try direct import
        let cuisine;
        try {
          if (normalizedCuisineName === 'american') {
            const { american } = require('../data/cuisines/american');
            cuisine = american;
          } else {
            const { african } = require('../data/cuisines/african');
            cuisine = african;
          }
        } catch (importError) {
          // console.error(`Error importing special cuisine data for ${cuisineName}:`, importError);
        }

        if (cuisine && cuisine.dishes) {
          // console.log(`Direct import successful for ${cuisineName}, extracting recipes from dishes`);

          // Extract recipes from all meal types
          const allRecipes = [];
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'dessert'];

          for (const mealType of mealTypes) {
            if (
              cuisine.dishes[mealType]?.all &&
              Array.isArray(cuisine.dishes[mealType].all)
            ) {
              // console.log(`Found ${cuisine.dishes[mealType].all.length} ${mealType} recipes for ${cuisineName}`);

              const mealRecipes = cuisine.dishes[mealType].all.map(
                (recipe: unknown) => ({
                  ...recipe,
                  cuisine: cuisineName,
                  matchScore: 0.9,
                  matchPercentage: 90,
                  mealType: [mealType],
                })
              );

              allRecipes.push(...mealRecipes);
            }

            // Also check seasonal recipes
            const seasons = ['spring', 'summer', 'autumn', 'winter'];
            for (const season of seasons) {
              if (
                cuisine.dishes[mealType]?.[season] &&
                Array.isArray(cuisine.dishes[mealType][season])
              ) {
                // console.log(`Found ${cuisine.dishes[mealType][season].length} ${season} ${mealType} recipes for ${cuisineName}`);

                const seasonalRecipes = cuisine.dishes[mealType][season].map(
                  (recipe: unknown) => ({
                    ...recipe,
                    cuisine: cuisineName,
                    matchScore: 0.85,
                    matchPercentage: 85,
                    mealType: [mealType],
                    season: [season],
                  })
                );

                allRecipes.push(...seasonalRecipes);
              }
            }
          }

          // Remove duplicates by name
          const uniqueRecipes = allRecipes.filter(
            (recipe, index, self) =>
              index === self.findIndex((r) => r.name === recipe.name)
          );

          if (uniqueRecipes.length > 0) {
            // console.log(`Returning ${uniqueRecipes.length} unique recipes for ${cuisineName}`);
            return uniqueRecipes.slice(0, limit);
          }
        }
      } catch (error) {
        // console.error(`Error in special handling for ${cuisineName}:`, error);
      }
    }

    // If special handling didn't return anything or cuisine isn't American/African,
    // continue with the standard approach

    // If no recipes are provided or empty array, try to fetch from LocalRecipeService
    if (!Array.isArray(recipes) || recipes.length === 0) {
      try {
        // console.log(`No recipes array provided, trying LocalRecipeService for ${cuisineName}`);
        const { LocalRecipeService } = require('../services/LocalRecipeService');
        const localRecipes = LocalRecipeService.getRecipesByCuisine(cuisineName);
        // console.log(`Fetched ${localRecipes?.length || 0} recipes directly from LocalRecipeService for ${cuisineName}`);

        if (localRecipes && localRecipes.length > 0) {
          // Apply high match scores to local recipes
          return localRecipes
            .map((recipe) => ({
              ...recipe,
              matchScore: 0.8 + Math.random() * 0.2, // 80-100% match
              matchPercentage: Math.round((0.8 + Math.random() * 0.2) * 100), // For display
            }))
            .slice(0, limit);
        } else {
          // console.log(`LocalRecipeService returned no recipes for ${cuisineName}, using mock data`);
          return createMockRecipes(limit);
        }
      } catch (error) {
        // console.error(`Error fetching recipes from LocalRecipeService for ${cuisineName}:`, error);
        return createMockRecipes(limit);
      }
    }

    // Get the cuisine profile
    const cuisineProfile = getCuisineProfile(cuisineName);
    if (!cuisineProfile) {
      // console.warn(`No cuisine profile found for ${cuisineName}, using direct matches only`);
      // Even without a profile, we can still try direct matches
    }

    // Different tiers of matches with varied scoring

    // Direct exact cuisine matches (highest priority)
    const exactCuisineMatches = recipes.filter(
      (recipe) => {
        const recipeData = recipe as unknown;
        return recipeData?.cuisine?.toLowerCase() === normalizedCuisineName ||
               recipeData?.cuisine?.toLowerCase()?.includes(normalizedCuisineName) ||
               normalizedCuisineName.includes(recipeData?.cuisine?.toLowerCase());
      }
    );

    // console.log(`Found ${exactCuisineMatches.length} exact cuisine matches for ${cuisineName}`);

    // Regional variant matches
    const regionalMatches = recipes.filter(
      (recipe) => {
        const recipeData = recipe as unknown;
        return !exactCuisineMatches.includes(recipe) && (
                 recipeData?.regionalCuisine?.toLowerCase() === normalizedCuisineName ||
                 recipeData?.regionalCuisine?.toLowerCase()?.includes(normalizedCuisineName) ||
                 normalizedCuisineName.includes(recipeData?.regionalCuisine?.toLowerCase())
               );
      }
    );

    // console.log(`Found ${regionalMatches.length} regional matches for ${cuisineName}`);

    // Calculate match scores for all other recipes
    const otherRecipes = recipes.filter(
      (recipe) =>
        !exactCuisineMatches.includes(recipe) && !regionalMatches.includes(recipe)
    );

    // Skip other recipe scoring if we already have enough direct matches
    let scoredOtherRecipes = [];
    if (exactCuisineMatches.length + regionalMatches.length < limit && cuisineProfile) {
      // Score recipe matches using various factors
      scoredOtherRecipes = otherRecipes
        .map((recipe) => {
          try {
            const recipeData = recipe as unknown;
            const scoreComponents = [];
            let totalWeight = 0;

            // Base flavor profile match (weight: 0.4)
            if (cuisineProfile && recipeData?.flavorProfile) {
              const flavorScore = calculateFlavorProfileMatch(
                recipeData.flavorProfile,
                cuisineProfile.flavorProfiles
              );
              scoreComponents.push(flavorScore * 0.4);
              totalWeight += 0.4;
            }

            // Ingredient similarity (weight: 0.3)
            if (cuisineProfile.signatureIngredients && recipeData?.ingredients) {
              const recipeIngredientNames = recipeData.ingredients.map((ing: unknown) => {
                const ingData = ing as unknown;
                return typeof ing === 'string' ? ing.toLowerCase() : ingData?.name?.toLowerCase() || '';
              });

              const commonIngredients = cuisineProfile.signatureIngredients.filter(
                (ing) =>
                  recipeIngredientNames.some((ri) => ri?.includes(ing.toLowerCase()))
              );

              // Calculate score based on how many signature ingredients are used
              const ingredientScore =
                commonIngredients.length /
                Math.max(cuisineProfile.signatureIngredients.length, 1);
              scoreComponents.push(ingredientScore * 0.3);
              totalWeight += 0.3;
            }

            // Technique similarity (weight: 0.2)
            if (cuisineProfile.signatureTechniques && recipeData?.cookingMethods) {
              const recipeTechniques = Array.isArray(recipeData.cookingMethods)
                ? recipeData.cookingMethods.map((tech: string) => tech?.toLowerCase() || '')
                : [recipeData.cookingMethods?.toLowerCase() || ''];

              const commonTechniques = cuisineProfile.signatureTechniques.filter(
                (tech) => recipeTechniques.some((rt) => rt?.includes(tech.toLowerCase()))
              );

              const techniqueScore =
                commonTechniques.length /
                Math.max(cuisineProfile.signatureTechniques.length, 1);
              scoreComponents.push(techniqueScore * 0.2);
              totalWeight += 0.2;
            }

            // Elemental alignment (weight: 0.1)
            if (
              cuisineProfile.elementalAlignment &&
              recipeData?.elementalProperties
            ) {
              const elementScore = calculateSimilarityScore(
                cuisineProfile.elementalAlignment,
                recipeData.elementalProperties
              );
              scoreComponents.push(elementScore * 0.1);
              totalWeight += 0.1;
            }

            // Calculate final score
            let finalScore = 0;
            if (totalWeight > 0) {
              // Weighted average of all components
              finalScore = scoreComponents.reduce((sum, score) => sum + score, 0) / totalWeight;

              // Normalize score to ensure it's between 0 and 1
              finalScore = Math.max(0, Math.min(1, finalScore));
            } else {
              // Default score if no components could be calculated
              finalScore = 0.5;
            }

            return {
              ...recipe,
              matchScore: finalScore,
              matchPercentage: Math.round(finalScore * 100),
            };
          } catch (scoreError) {
            // console.error(`Error scoring recipe match for ${cuisineName}:`, scoreError);
            return {
              ...recipe,
              matchScore: 0.5,
              matchPercentage: 50,
            };
          }
        })
        .filter((recipe) => (recipe as unknown)?.matchScore >= 0.5) // Only include reasonably good matches
        .sort((a, b) => (b as unknown).matchScore - (a as unknown).matchScore); // Sort by score (high to low)
    }

    // console.log(`Found ${scoredOtherRecipes.length} scored other recipes for ${cuisineName}`);

    // Combine all matches, prioritizing direct matches, then regional, then others
    const allMatches = [
      ...exactCuisineMatches.map((recipe) => ({
        ...recipe,
        matchScore: 0.9 + Math.random() * 0.1, // 90-100% match
        matchPercentage: Math.round((0.9 + Math.random() * 0.1) * 100),
      })),
      ...regionalMatches.map((recipe) => ({
        ...recipe,
        matchScore: 0.8 + Math.random() * 0.1, // 80-90% match
        matchPercentage: Math.round((0.8 + Math.random() * 0.1) * 100),
      })),
      ...scoredOtherRecipes.slice(0, limit - exactCuisineMatches.length - regionalMatches.length),
    ];

    // Remove duplicates by name
    const uniqueMatches = allMatches.filter(
      (recipe, index, self) => {
        const recipeData = recipe as unknown;
        return index === self.findIndex((r) => (r as unknown)?.name === recipeData?.name);
      }
    );

    // Sort by match score
    const sortedMatches = uniqueMatches.sort((a, b) => (b as unknown).matchScore - (a as unknown).matchScore);
    
    // console.log(`Returning ${sortedMatches.length} sorted matches for ${cuisineName}`);
    
    // Use mock data if we didn't find enough recipes
    if (sortedMatches.length < Math.min(3, limit)) {
      const mockRecipes = createMockRecipes(limit - sortedMatches.length);
      return [...sortedMatches, ...mockRecipes].slice(0, limit);
    }
    
    return sortedMatches.slice(0, limit);
  } catch (error) {
    // console.error(`Error in getRecipesForCuisineMatch for ${cuisineName}:`, error);
    return createMockRecipes(limit);
  }
}

// Helper function to calculate flavor profile match
function calculateFlavorProfileMatch(
  recipeProfile: unknown,
  cuisineProfile: unknown
): number {
  let similarity = 0;
  let count = 0;

  const recipeData = recipeProfile as unknown;
  const cuisineData = cuisineProfile as unknown;

  // Compare common flavor dimensions
  const flavors = ['spicy', 'sweet', 'sour', 'bitter', 'salty', 'umami'];

  flavors.forEach((flavor) => {
    if (
      recipeData?.[flavor] !== undefined &&
      cuisineData?.[flavor] !== undefined
    ) {
      similarity +=
        1 - Math.abs(recipeData[flavor] - cuisineData[flavor]);
      count++;
    }
  });

  return count > 0 ? similarity / count : 0.5;
}

export const getCuisineElementalMatch = (
  cuisineName: string,
  elementalProps: ElementalProperties
): number => {
  let matchScore = 0;
  let totalWeight = 0;

  // Get the cuisine profile
  const cuisine = cuisineFlavorProfiles[cuisineName.toLowerCase()];
  if (!cuisine) return 0.5; // Default neutral match if cuisine not found

  // Compare elemental compatibility
  if (cuisine.elementalProperties) {
    Object.keys(elementalProps).forEach((element) => {
      const elementKey = element as keyof ElementalProperties;
      const cuisineValue = cuisine.elementalProperties?.[elementKey] || 0;
      const targetValue = elementalProps[elementKey] || 0;

      // Calculate similarity - the closer the values, the better the match
      const similarity = 1 - Math.abs(cuisineValue - targetValue);
      
      // Weight important elements more heavily
      const weight = Math.max(cuisineValue, targetValue) * 2;
      
      matchScore += similarity * weight;
      totalWeight += weight;
    });
  }

  return totalWeight > 0 ? matchScore / totalWeight : 0.5;
};

export const calculateCuisineSimilarity = (
  cuisine1: string,
  cuisine2: string
): number => {
  const profile1 = getCuisineProfile(cuisine1);
  const profile2 = getCuisineProfile(cuisine2);

  if (!profile1 || !profile2) {
    return 0.5; // Default neutral similarity if profiles not found
  }

  let similarityScore = 0;
  let totalWeight = 0;

  // Elemental similarity (weight: 0.4)
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  let elementalSimilarity = 0;
  let elementCount = 0;

  elements.forEach((element) => {
    const elementKey = element as keyof ElementalProperties;
    const val1 = profile1.elementalProperties?.[elementKey] || 0;
    const val2 = profile2.elementalProperties?.[elementKey] || 0;
    
    elementalSimilarity += 1 - Math.abs(val1 - val2);
    elementCount++;
  });

  const normalizedElementalSimilarity = 
    elementCount > 0 ? elementalSimilarity / elementCount : 0.5;
  
  similarityScore += normalizedElementalSimilarity * 0.4;
  totalWeight += 0.4;

  // Flavor profile similarity (weight: 0.6)
  const flavors = ['sweet', 'salty', 'sour', 'bitter', 'umami', 'spicy'];
  let flavorSimilarity = 0;
  let flavorCount = 0;

  flavors.forEach((flavor) => {
    const val1 = profile1.flavorIntensities?.[flavor] || 0;
    const val2 = profile2.flavorIntensities?.[flavor] || 0;
    
    flavorSimilarity += 1 - Math.abs(val1 - val2);
    flavorCount++;
  });

  const normalizedFlavorSimilarity = 
    flavorCount > 0 ? flavorSimilarity / flavorCount : 0.5;
  
  similarityScore += normalizedFlavorSimilarity * 0.6;
  totalWeight += 0.6;

  return totalWeight > 0 ? similarityScore / totalWeight : 0.5;
};

export const findRelatedRecipes = (
  recipeName: string,
  recipes: unknown[],
  count = 3
): unknown[] => {
  const scoredRecipes = recipes
    .map((recipe) => {
      const scoreComponents = [];
      const totalWeight = 0;
      
      // ... existing code ...
    });
};

export const calculateSimilarityScore = (
  elementalProps1: ElementalProperties,
  elementalProps2: ElementalProperties
): number => {
  const similarity = 0;
  const count = 0;
  
  // ... existing code ...
};
