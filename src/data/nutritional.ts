import { log } from '@/services/LoggingService';

// Define NutritionalProfile locally
interface NutritionalProfile {
  calories?: number;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  phytonutrients?: Record<string, number>;
  macronutrients?: Record<string, number>;
  micronutrients?: Record<string, number>;
}

// ========== BASIC NUTRITIONAL PROFILES ==========
export const baseNutritionalProfiles: Record<string, NutritionalProfile> = {
  vegetables: {
    calories: 50,
    macros: {
      protein: 2,
      carbs: 10,
      fat: 0.5,
      fiber: 3
    },
    vitamins: {
      A: 0.2,
      C: 0.3,
      K: 0.25,
      E: 0.1,
      B6: 0.1
    },
    minerals: {
      potassium: 0.2,
      magnesium: 0.15,
      iron: 0.1,
      calcium: 0.1
    },
    phytonutrients: {
      antioxidants: 0.3,
      flavonoids: 0.25
    }
  },
  fruits: {
    calories: 75,
    macros: {
      protein: 1,
      carbs: 20,
      fat: 0.2,
      fiber: 3
    },
    vitamins: {
      A: 0.1,
      C: 0.4,
      E: 0.1,
      B6: 0.1
    },
    minerals: {
      potassium: 0.2,
      magnesium: 0.1,
      iron: 0.05,
      calcium: 0.05
    },
    phytonutrients: {
      antioxidants: 0.35,
      flavonoids: 0.3
    }
  },
  grains: {
    calories: 150,
    macros: {
      protein: 5,
      carbs: 30,
      fat: 1,
      fiber: 4
    },
    vitamins: {
      B1: 0.2,
      B3: 0.2,
      B6: 0.1,
      E: 0.1
    },
    minerals: {
      iron: 0.15,
      magnesium: 0.15,
      zinc: 0.1,
      selenium: 0.1
    }
  },
  legumes: {
    calories: 120,
    macros: {
      protein: 8,
      carbs: 20,
      fat: 1,
      fiber: 7
    },
    vitamins: {
      B1: 0.1,
      B6: 0.1,
      K: 0.1,
      folate: 0.2
    },
    minerals: {
      iron: 0.2,
      magnesium: 0.15,
      zinc: 0.1,
      potassium: 0.15
    },
    phytonutrients: {
      isoflavones: 0.3
    }
  },
  nuts: {
    calories: 180,
    macros: {
      protein: 6,
      carbs: 6,
      fat: 16,
      fiber: 3
},
    vitamins: {
      E: 0.3,
    B6: 0.1
},
    minerals: {
      magnesium: 0.2,
      zinc: 0.15,
      selenium: 0.2,
      copper: 0.2
},
    phytonutrients: {
      phytosterols: 0.25
}
  },
  dairy: {
    calories: 120,
    macros: {
      protein: 8,
      carbs: 12,
      fat: 5,
      fiber: 0
},
    vitamins: {
      A: 0.1,
      D: 0.15,
      B12: 0.2,
      riboflavin: 0.25
},
    minerals: {
      calcium: 0.3,
      phosphorus: 0.2,
      selenium: 0.1,
      zinc: 0.1
}
  },
  meat: {
    calories: 200,
    macros: {
      protein: 25,
      carbs: 0,
      fat: 10,
      fiber: 0
},
    vitamins: {
      B12: 0.4,
    B6: 0.2,
      niacin: 0.25,
      riboflavin: 0.15
},
    minerals: {
      iron: 0.2,
      zinc: 0.3,
      phosphorus: 0.2,
      selenium: 0.2
}
  },
  fish: {
    calories: 150,
    macros: {
      protein: 22,
      carbs: 0,
      fat: 6,
      fiber: 0
},
    vitamins: {
      D: 0.3,
      B12: 0.3,
      niacin: 0.2,
    B6: 0.15
},
    minerals: {
      selenium: 0.3,
      phosphorus: 0.2,
      iodine: 0.2,
      magnesium: 0.1
}
  }
}

// ========== ASTROLOGICAL NUTRITION CORRELATIONS ==========;

// Planetary rulership of macronutrients
export const planetaryNutrientRulership: Record<string, string> = {
  mars: 'protein', // Mars rules proteins (building, energy, strength),
  jupiter: 'fats', // Jupiter rules fats (expansion, storage, abundance),
  venus: 'carbs', // Venus rules carbohydrates (pleasure, energy, comfort),
  mercury: 'fiber', // Mercury rules fiber (communication, movement, cleansing),
  saturn: 'minerals', // Saturn rules minerals (structure, foundation, discipline),
  sun: 'vitamins', // Sun rules vitamins (vitality, energy, life force),
  moon: 'Water', // Moon rules water (emotions, fluidity, cleansing)
}

// Elemental food affinities
export const elementalFoodAffinities: Record<string, string[]> = {
  Fire: [
    'chili peppers',
    'ginger',
    'garlic',
    'onions',
    'radishes',
    'hot spices',
    'tomatoes',
    'red meat',
    'alcohol',
    'coffee'
  ],
  Water: [
    'seafood',
    'watermelon',
    'cucumber',
    'lettuce',
    'coconut',
    'melons',
    'berries',
    'tea',
    'soup',
    'algae'
  ],
  Earth: [
    'root vegetables',
    'potatoes',
    'mushrooms',
    'grains',
    'nuts',
    'seeds',
    'legumes',
    'chocolate',
    'earthy herbs',
    'dairy'
  ],
  Air: [
    'leafy greens',
    'sprouts',
    'aromatic herbs',
    'popcorn',
    'puffed grains',
    'carbonated drinks',
    'light fruits',
    'honey',
    'olive oil',
    'seeds'
  ]
}

// Zodiac sign nutritional affinities
export const zodiacNutritionalNeeds: Record<
  string,
  {
    elementalNeeds: Record<string, number>,
    nutritionalFocus: string[],
    beneficialFoods: string[],
    challengeFoods: string[]
  }
> = {
  aries: {
    elementalNeeds: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    nutritionalFocus: ['protein', 'iron', 'vitamin B12', 'magnesium'],
    beneficialFoods: ['lean meats', 'spinach', 'peppers', 'garlic', 'spices'],
    challengeFoods: ['excessive dairy', 'processed foods', 'alcohol']
  },
  taurus: {
    elementalNeeds: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    nutritionalFocus: ['calcium', 'vitamin D', 'zinc', 'healthy fats'],
    beneficialFoods: ['leafy greens', 'nuts', 'dairy', 'root vegetables', 'berries'],
    challengeFoods: ['refined sugar', 'processed carbs', 'excess caffeine']
  },
  gemini: {
    elementalNeeds: { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
    nutritionalFocus: ['omega-3', 'B vitamins', 'antioxidants', 'magnesium'],
    beneficialFoods: ['fish', 'nuts', 'seeds', 'berries', 'citrus fruits'],
    challengeFoods: ['excessive stimulants', 'artificial additives', 'heavy meals']
  },
  cancer: {
    elementalNeeds: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    nutritionalFocus: ['calcium', 'selenium', 'B vitamins', 'protein'],
    beneficialFoods: ['seafood', 'dairy', 'seaweed', 'watermelon', 'cucumber'],
    challengeFoods: ['spicy foods', 'alcohol', 'excessive salt']
  },
  leo: {
    elementalNeeds: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalFocus: ['vitamin D', 'CoQ10', 'magnesium', 'potassium'],
    beneficialFoods: ['citrus fruits', 'olive oil', 'walnuts', 'sunflower seeds', 'bell peppers'],
    challengeFoods: ['excessive fats', 'refined carbs', 'too much red meat']
  },
  virgo: {
    elementalNeeds: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    nutritionalFocus: ['fiber', 'probiotics', 'digestive enzymes', 'B vitamins'],
    beneficialFoods: ['fermented foods', 'whole grains', 'leafy greens', 'herbs', 'seeds'],
    challengeFoods: ['processed foods', 'artificial additives', 'gluten (for many)']
  },
  libra: {
    elementalNeeds: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 },
    nutritionalFocus: ['vitamin E', 'antioxidants', 'omega-3', 'vitamin C'],
    beneficialFoods: ['apples', 'berries', 'leafy greens', 'fish', 'olive oil'],
    challengeFoods: ['excessive sugar', 'fried foods', 'artificial sweeteners']
  },
  scorpio: {
    elementalNeeds: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
    nutritionalFocus: ['iron', 'antioxidants', 'zinc', 'vitamin K'],
    beneficialFoods: [
      'dark leafy greens',
      'berries',
      'fermented foods',
      'mushrooms',
      'dark chocolate'
    ],
    challengeFoods: ['processed meats', 'excessive alcohol', 'artificial preservatives']
  },
  sagittarius: {
    elementalNeeds: { Fire: 0.4, Air: 0.3, Water: 0.2, Earth: 0.1 },
    nutritionalFocus: ['protein', 'B vitamins', 'magnesium', 'antioxidants'],
    beneficialFoods: ['lean proteins', 'berries', 'citrus fruits', 'nuts', 'spices'],
    challengeFoods: ['excessive sugars', 'processed snacks', 'fried foods']
  },
  capricorn: {
    elementalNeeds: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
    nutritionalFocus: ['calcium', 'vitamin D', 'magnesium', 'collagen'],
    beneficialFoods: ['dark leafy greens', 'nuts', 'seeds', 'bone broth', 'root vegetables'],
    challengeFoods: ['excessive caffeine', 'alcohol', 'refined carbs']
  },
  aquarius: {
    elementalNeeds: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    nutritionalFocus: ['vitamin B12', 'omega-3', 'antioxidants', 'trace minerals'],
    beneficialFoods: ['sprouts', 'blue/purple foods', 'fermented foods', 'herbs', 'seeds'],
    challengeFoods: ['excessive processed foods', 'artificial ingredients', 'traditional dairy']
  },
  pisces: {
    elementalNeeds: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    nutritionalFocus: ['omega-3', 'vitamin D', 'magnesium', 'zinc'],
    beneficialFoods: ['seafood', 'seaweed', 'berries', 'herbal teas', 'coconut'],
    challengeFoods: ['alcohol', 'caffeine', 'artificial additives', 'processed foods']
  }
}

// Planets and corresponding nutrients/health areas
export const planetaryNutritionInfluence: Record<
  string,
  {
    nutrientRulership: string[],
    healthDomain: string[],
    beneficialFoods: string[]
  }
> = {
  sun: {
    nutrientRulership: ['vitamin D', 'potassium', 'magnesium'],
    healthDomain: ['heart health', 'vitality', 'immunity'],
    beneficialFoods: ['citrus fruits', 'sunflower seeds', 'orange vegetables', 'olive oil']
  },
  moon: {
    nutrientRulership: ['calcium', 'selenium', 'electrolytes'],
    healthDomain: ['hydration', 'digestion', 'emotional balance'],
    beneficialFoods: ['leafy greens', 'dairy', 'coconut', 'melons', 'cucumber']
  },
  mercury: {
    nutrientRulership: ['B vitamins', 'antioxidants', 'zinc'],
    healthDomain: ['nervous system', 'cognitive function', 'communication'],
    beneficialFoods: ['nuts', 'seeds', 'fish', 'dark leafy greens', 'berries']
  },
  venus: {
    nutrientRulership: ['vitamin E', 'copper', 'essential fatty acids'],
    healthDomain: ['skin health', 'hormone balance', 'sensory pleasure'],
    beneficialFoods: ['berries', 'avocados', 'nuts', 'chocolate', 'apples']
  },
  mars: {
    nutrientRulership: ['iron', 'protein', 'vitamin B12'],
    healthDomain: ['energy', 'muscle function', 'circulation'],
    beneficialFoods: ['red meat', 'spinach', 'legumes', 'peppers', 'garlic']
  },
  jupiter: {
    nutrientRulership: ['zinc', 'selenium', 'healthy fats'],
    healthDomain: ['liver function', 'growth', 'optimism'],
    beneficialFoods: ['nuts', 'whole grains', 'eggs', 'berries', 'leafy greens']
  },
  saturn: {
    nutrientRulership: ['calcium', 'vitamin D', 'minerals'],
    healthDomain: ['bone health', 'structure', 'longevity'],
    beneficialFoods: ['dark leafy greens', 'sesame seeds', 'beans', 'root vegetables']
  },
  uranus: {
    nutrientRulership: ['antioxidants', 'electrolytes', 'trace minerals'],
    healthDomain: ['electrical impulses', 'innovation', 'circulation'],
    beneficialFoods: ['fermented foods', 'blue/purple foods', 'sprouts', 'seaweed']
  },
  neptune: {
    nutrientRulership: ['omega-3', 'vitamin B12', 'iodine'],
    healthDomain: ['immune system', 'intuition', 'pineal function'],
    beneficialFoods: ['seafood', 'seaweed', 'purple fruits', 'mushrooms']
  },
  pluto: {
    nutrientRulership: ['antioxidants', 'sulfur compounds', 'selenium'],
    healthDomain: ['detoxification', 'transformation', 'cellular regeneration'],
    beneficialFoods: ['fermented foods', 'cruciferous vegetables', 'garlic', 'berries']
  }
}

// Seasonal Nutrition Influences
export const seasonalNutritionFocus: Record<
  string,
  {
    elementalEmphasis: string,
    nutritionalFocus: string[],
    recommendedFoods: string[]
  }
> = {
  spring: {
    elementalEmphasis: 'Air',
    nutritionalFocus: ['antioxidants', 'cleansing compounds', 'bitter compounds'],
    recommendedFoods: ['leafy greens', 'sprouts', 'herbs', 'berries', 'citrus', 'asparagus']
  },
  summer: {
    elementalEmphasis: 'Fire',
    nutritionalFocus: ['electrolytes', 'carotenoids', 'vitamin C'],
    recommendedFoods: ['berries', 'stone fruits', 'peppers', 'tomatoes', 'cucumber', 'watermelon']
  },
  fall: {
    // Also for autumn
    elementalEmphasis: 'Earth',
    nutritionalFocus: ['fiber', 'antioxidants', 'vitamins A and C'],
    recommendedFoods: ['root vegetables', 'squash', 'apples', 'pears', 'nuts', 'whole grains']
  },
  autumn: {
    elementalEmphasis: 'Earth',
    nutritionalFocus: ['fiber', 'antioxidants', 'vitamins A and C'],
    recommendedFoods: ['root vegetables', 'squash', 'apples', 'pears', 'nuts', 'whole grains']
  },
  winter: {
    elementalEmphasis: 'Water',
    nutritionalFocus: ['vitamin D', 'immunity support', 'healthy fats'],
    recommendedFoods: [
      'citrus',
      'root vegetables',
      'winter squash',
      'hearty soups',
      'nuts',
      'seeds'
    ]
  }
}

// ========== LOCAL NUTRITIONAL DATA INTEGRATION ==========;

/**
 * Fetch nutritional data from local database
 * Replaced USDA API integration with local nutritional profiles
 */
export async function fetchNutritionalData(foodName: string): Promise<NutritionalProfile | null> {
  try {
    log.info(`Fetching local nutritional data for ${foodName}`)

    // Use base nutritional profiles for common food categories
    const normalizedName = foodName.toLowerCase()

    // Map food names to categories
    if (
      normalizedName.includes('vegetable') ||
      ['spinach', 'lettuce', 'broccoli', 'carrot', 'pepper'].some(v => normalizedName.includes(v))
    ) {
      return baseNutritionalProfiles.vegetables;
    }

    if (
      normalizedName.includes('fruit') ||
      ['apple', 'orange', 'banana', 'berry', 'grape'].some(f => normalizedName.includes(f))
    ) {
      return baseNutritionalProfiles.fruits;
    }

    if (
      normalizedName.includes('grain') ||
      ['rice', 'wheat', 'oat', 'quinoa', 'barley'].some(g => normalizedName.includes(g))
    ) {
      return baseNutritionalProfiles.grains;
    }

    if (
      normalizedName.includes('legume') ||
      ['bean', 'lentil', 'pea', 'chickpea'].some(l => normalizedName.includes(l))
    ) {
      return baseNutritionalProfiles.legumes;
    }

    if (
      normalizedName.includes('nut') ||
      ['almond', 'walnut', 'peanut', 'cashew'].some(n => normalizedName.includes(n))
    ) {
      return baseNutritionalProfiles.nuts;
    }

    if (
      normalizedName.includes('dairy') ||
      ['milk', 'cheese', 'yogurt', 'butter'].some(d => normalizedName.includes(d))
    ) {
      return baseNutritionalProfiles.dairy;
    }

    if (
      normalizedName.includes('meat') ||
      ['beef', 'pork', 'chicken', 'turkey'].some(m => normalizedName.includes(m))
    ) {
      return baseNutritionalProfiles.meat;
    }

    if (
      normalizedName.includes('fish') ||
      ['salmon', 'tuna', 'cod', 'sardine'].some(f => normalizedName.includes(f))
    ) {
      return baseNutritionalProfiles.fish;
    }

    // Default to mixed nutritional profile
    log.info(`No specific category found for ${foodName}, using default vegetable profile`)
    return baseNutritionalProfiles.vegetables;
  } catch (error) {
    _logger.error('Error fetching nutritional data: ', error);
    return null;
  }
}

// ========== NUTRITION CALCULATION FUNCTIONS ==========;

// Interface for ingredients with nutritional profiles
interface IngredientWithNutrition {
  nutritionalProfile?: NutritionalProfile,
  amount?: number,
  [key: string]: unknown
}

/**
 * Calculate nutritional balance for a recipe based on ingredients
 */
export function calculateNutritionalBalance(
  ingredients: IngredientWithNutrition[],
): NutritionalProfile {
  const defaultProfile: NutritionalProfile = {
    calories: 0,
    macros: {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
},
    vitamins: {},
    minerals: {},
    phytonutrients: {}
  };

  if (!ingredients || ingredients.length === 0) {
    return defaultProfile
  }

  return ingredients.reduce((acc, ingredient) => {
    const profile = ingredient.nutritionalProfile || {}

    // Add calories
    acc.calories = (acc.calories || 0) + (profile.calories || 0)

    // Add macros
    if (profile.macros) {
      if (!acc.macros) {
        acc.macros = { protein: 0, carbs: 0, fat: 0, fiber: 0 }
      }
      acc.macros.protein = (acc.macros.protein || 0) + (profile.macros.protein || 0)
      acc.macros.carbs = (acc.macros.carbs || 0) + (profile.macros.carbs || 0)
      acc.macros.fat = (acc.macros.fat || 0) + (profile.macros.fat || 0)
      acc.macros.fiber = (acc.macros.fiber || 0) + (profile.macros.fiber || 0);
    }

    // Add vitamins
    if (profile.vitamins) {
      Object.entries(profile.vitamins).forEach(([key, value]) => {
        if (!acc.vitamins) acc.vitamins = {}
        acc.vitamins[key] = (acc.vitamins[key] || 0) + value;
      })
    }

    // Add minerals
    if (profile.minerals) {
      Object.entries(profile.minerals).forEach(([key, value]) => {
        if (!acc.minerals) acc.minerals = {}
        acc.minerals[key] = (acc.minerals[key] || 0) + value;
      })
    }

    // Add phytonutrients
    if (profile.phytonutrients) {
      Object.entries(profile.phytonutrients).forEach(([key, value]) => {
        if (!acc.phytonutrients) acc.phytonutrients = {}
        acc.phytonutrients[key] = (acc.phytonutrients[key] || 0) + value;
      })
    }

    return acc;
  }, defaultProfile)
}

/**
 * Convert NutritionalProfile to elemental influences
 */
export function nutritionalToElemental(_profile: NutritionalProfile): {
  Fire: number,
  Water: number,
  Earth: number,
  Air: number
} {
  if (!profile) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }
  }

  // Calculate element weights based on nutritional properties
  let fire = 0;
  let water = 0;
  let earth = 0;
  let air = 0;

  // Protein contributes to Fire
  fire += (profile.macros?.protein || 0) * 0.04;

  // Fats contribute to Water
  water += (profile.macros?.fat || 0) * 0.05;

  // Carbs contribute to Earth
  earth += (profile.macros?.carbs || 0) * 0.02;

  // Fiber contributes to Air
  air += (profile.macros?.fiber || 0) * 0.05;

  // Vitamins and minerals adjustments
  if (profile.vitamins) {
    const vitaminTotal = Object.values(profile.vitamins).reduce((sum, val) => sum + val0)
    fire += vitaminTotal * 0.1;
    air += vitaminTotal * 0.05;
  }

  if (profile.minerals) {
    const mineralTotal = Object.values(profile.minerals).reduce((sum, val) => sum + val0)
    earth += mineralTotal * 0.1;
    water += mineralTotal * 0.05;
  }

  // Normalize to ensure sum is 1
  const total = fire + water + earth + air;

  return {
    Fire: fire / total,
    Water: water / total,
    Earth: earth / total,
    Air: air / total
  }
}

/**
 * Get nutritional recommendations based on zodiac sign
 */
export function getZodiacNutritionalRecommendations(_sign: string): {
  elementalBalance: Record<string, number>,
  focusNutrients: string[],
  recommendedFoods: string[],
  avoidFoods: string[]
} {
  const signData = zodiacNutritionalNeeds[sign];

  return {
    elementalBalance:
      (signData as { elementalNeeds?: Record<string, number> }).elementalNeeds ?? {},
    focusNutrients: (signData as { nutritionalFocus?: string[] }).nutritionalFocus ?? [],
    recommendedFoods: signData.beneficialFoods,
    avoidFoods: signData.challengeFoods
  }
}

/**
 * Map planets to their elemental influences (diurnal and nocturnal elements)
 */
const planetaryElements: Record<string, { diurnal: string, nocturnal: string }> = {
  sun: { diurnal: 'Fire', nocturnal: 'Fire' },
        moon: { diurnal: 'Water', nocturnal: 'Water' },
        mercury: { diurnal: 'Air', nocturnal: 'Earth' },
        venus: { diurnal: 'Water', nocturnal: 'Earth' },
        mars: { diurnal: 'Fire', nocturnal: 'Water' },
        jupiter: { diurnal: 'Air', nocturnal: 'Fire' },
        saturn: { diurnal: 'Air', nocturnal: 'Earth' },
        uranus: { diurnal: 'Water', nocturnal: 'Air' },
        neptune: { diurnal: 'Water', nocturnal: 'Water' },
        pluto: { diurnal: 'Earth', nocturnal: 'Water' }
}

/**
 * Helper function to determine if it's currently daytime (6am-6pm)
 */
function isDaytime(date: Date = new Date()): boolean {
  const hour = date.getHours()
  return hour >= 6 && hour < 18;
}

/**
 * Get nutritional recommendations based on planetary day and hour influences
 *
 * @param planetaryDay The ruling planet of the day
 * @param planetaryHour The ruling planet of the hour
 * @param currentTime Optional date to determine day/night (defaults to now)
 */
export function getEnhancedPlanetaryNutritionalRecommendations(
  planetaryDay: string,
  planetaryHour: string,
  currentTime: Date = new Date()
): {
  elements: Record<string, number>,
  focusNutrients: string[],
  healthAreas: string[],
  recommendedFoods: string[]
} {
  // Normalize planet names to lowercase
  const dayPlanet = planetaryDay.toLowerCase()
  const hourPlanet = planetaryHour.toLowerCase()

  // Initialize results;
  const focusNutrients: string[] = [];
  const healthAreas: string[] = [];
  const recommendedFoods: string[] = []
  const elements: Record<string, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
}

  // Get day planet influence (both diurnal and nocturnal elements all day)
  const dayElements = planetaryElements[dayPlanet];
  if (dayElements) {
    // For day planet, both diurnal and nocturnal elements are active
    const diurnalElement = dayElements.diurnal;
    const nocturnalElement = dayElements.nocturnal;

    // Add elemental influence (equal weight for both elements)
    elements[diurnalElement] = (elements[diurnalElement] || 0) + 0.35;
    elements[nocturnalElement] = (elements[nocturnalElement] || 0) + 0.35;

    // Get nutritional associations
    const dayInfluence = planetaryNutritionInfluence[dayPlanet];
    if (dayInfluence) {
      focusNutrients.push(...dayInfluence.nutrientRulership)
      healthAreas.push(...dayInfluence.healthDomain)
      recommendedFoods.push(...dayInfluence.beneficialFoods)
    }
  }

  // Get hour planet influence (depends on day/night)
  const hourElements = planetaryElements[hourPlanet];
  if (hourElements) {
    // For hour planet, use diurnal during day, nocturnal at night
    const isDay = isDaytime(currentTime);
    const relevantElement = isDay ? hourElements.diurnal : hourElements.nocturnal;

    // Add elemental influence
    elements[relevantElement] = (elements[relevantElement] || 0) + 0.3;

    // Get nutritional associations
    const hourInfluence = planetaryNutritionInfluence[hourPlanet];
    if (hourInfluence) {
      focusNutrients.push(...hourInfluence.nutrientRulership)
      healthAreas.push(...hourInfluence.healthDomain)
      recommendedFoods.push(...hourInfluence.beneficialFoods)
    }
  }

  // Normalize elements to sum to 1.0
  const elementsTotal = Object.values(elements).reduce((sum, val) => sum + val0)
  if (elementsTotal > 0) {
    Object.keys(elements).forEach(element => {
      elements[element] = elements[element] / elementsTotal;
    })
  }

  // Remove duplicates
  return {
    elements,
    focusNutrients: [...new Set(focusNutrients)],
    healthAreas: [...new Set(healthAreas)],
    recommendedFoods: [...new Set(recommendedFoods)]
  }
}

/**
 * Get nutritional recommendations based on planetary influences
 * Legacy method - consider using getEnhancedPlanetaryNutritionalRecommendations instead
 */
export function getPlanetaryNutritionalRecommendations(_planets: string[]): {
  focusNutrients: string[],
  healthAreas: string[],
  recommendedFoods: string[]
} {
  // Combine recommendations from all influential planets
  const focusNutrients: string[] = [];
  const healthAreas: string[] = [];
  const recommendedFoods: string[] = [];

  planets.forEach(planet => {
    const influence = planetaryNutritionInfluence[planet]
    if (influence) {
      focusNutrients.push(...influence.nutrientRulership)
      healthAreas.push(...influence.healthDomain)
      recommendedFoods.push(...influence.beneficialFoods);
    }
  })

  // Remove duplicates
  return {
    focusNutrients: [...new Set(focusNutrients)],
    healthAreas: [...new Set(healthAreas)],
    recommendedFoods: [...new Set(recommendedFoods)]
  }
}

/**
 * Get seasonal nutritional recommendations
 */
export function getSeasonalNutritionalRecommendations(_season: string): {
  element: string,
  focusNutrients: string[],
  seasonalFoods: string[]
} {
  // Normalize season name
  const normalizedSeason = season.toLowerCase();

  // Handle both 'autumn' and 'fall'
  const seasonKey =
    normalizedSeason === 'fall' || normalizedSeason === 'autumn' ? 'autumn' : normalizedSeason;

  const seasonData = seasonalNutritionFocus[seasonKey] || seasonalNutritionFocus['spring'];

  return {
    element: (seasonData as { elementalEmphasis?: string }).elementalEmphasis ?? 'Earth',
    focusNutrients: (seasonData as { nutritionalFocus?: string[] }).nutritionalFocus ?? [],
    seasonalFoods: seasonData.recommendedFoods
  }
}

/**
 * Evaluate nutritional balance based on elemental requirements
 */
export function evaluateNutritionalElementalBalance(
  profile: NutritionalProfile,
  targetElements: { Fire: number, Water: number, Earth: number, Air: number }): {
  score: number,
  imbalances: string[],
  recommendations: string[]
} {
  const currentElements = nutritionalToElemental(profile)

  // Calculate difference between current and target
  const differences = {
    Fire: Math.abs(currentElements.Fire - targetElements.Fire),
    Water: Math.abs(currentElements.Water - targetElements.Water),
    Earth: Math.abs(currentElements.Earth - targetElements.Earth),
    Air: Math.abs(currentElements.Air - targetElements.Air)
  }

  // Calculate average difference (lower is better)
  const avgDifference =
    (differences.Fire + differences.Water + differences.Earth + differences.Air) / 4;

  // Convert to score (0-100, higher is better)
  const score = Math.max(0, Math.min(100, 100 * (1 - avgDifference * 2)))

  // Identify significant imbalances (difference > 0.15)
  const imbalances: string[] = [];
  const recommendations: string[] = [];

  if (differences.Fire > 0.15) {
    if (currentElements.Fire < targetElements.Fire) {
      imbalances.push('Low Fire energy')
      recommendations.push('Increase protein and spicy foods')
    } else {
      imbalances.push('Excessive Fire energy')
      recommendations.push('Reduce spicy foods and red meat')
    }
  }

  if (differences.Water > 0.15) {
    if (currentElements.Water < targetElements.Water) {
      imbalances.push('Low Water energy')
      recommendations.push('Increase hydration and healthy fats')
    } else {
      imbalances.push('Excessive Water energy')
      recommendations.push('Reduce excessive fats and salt')
    }
  }

  if (differences.Earth > 0.15) {
    if (currentElements.Earth < targetElements.Earth) {
      imbalances.push('Low Earth energy')
      recommendations.push('Increase complex carbohydrates and root vegetables')
    } else {
      imbalances.push('Excessive Earth energy')
      recommendations.push('Reduce heavy starches and excessive grounding foods')
    }
  }

  if (differences.Air > 0.15) {
    if (currentElements.Air < targetElements.Air) {
      imbalances.push('Low Air energy')
      recommendations.push('Increase fiber and leafy greens')
    } else {
      imbalances.push('Excessive Air energy')
      recommendations.push('Ground your diet with more substantial foods')
    }
  }

  return {
    score,
    imbalances,
    recommendations
  }
}

export default {
  baseNutritionalProfiles,
  calculateNutritionalBalance,
  nutritionalToElemental,
  planetaryNutrientRulership,
  elementalFoodAffinities,
  zodiacNutritionalNeeds,
  planetaryNutritionInfluence,
  seasonalNutritionFocus,
  fetchNutritionalData,
  getZodiacNutritionalRecommendations,
  getPlanetaryNutritionalRecommendations,
  getEnhancedPlanetaryNutritionalRecommendations,
  getSeasonalNutritionalRecommendations,
  evaluateNutritionalElementalBalance
}
