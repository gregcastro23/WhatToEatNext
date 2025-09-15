import { ZodiacSign } from '@/types/zodiac';
import {
  ZodiacAffinity,
  createZodiacAffinity,
  ZODIAC_MODALITIES,
  Modality
} from '@/types/zodiacAffinity';

export type { ZodiacAffinity };
export { createZodiacAffinity };

/**
 * Mapping of zodiac signs to culinary preferences and affinities
 */
export const _zodiacCulinaryPreferences: Record<
  ZodiacSign,
  {
    favoredCuisines: string[];
    favoredIngredients: string[];
    favoredFlavors: string[];
    favoredCookingMethods: string[];
    seasonalPreferences: string[];
    nutritionalFocus: string[];
    cookingStyle: string;
    diningStyle: string;
    weakness: string;
    mealStructure: string;
  }
> = {
  aries: {
    favoredCuisines: ['Mexican', 'Indian', 'Thai', 'Spanish', 'Cajun', 'Szechuan'],
    favoredIngredients: [
      'chili peppers',
      'garlic',
      'ginger',
      'red meat',
      'tomatoes',
      'onions',
      'lamb',
      'cinnamon',
      'cayenne'
    ],
    favoredFlavors: ['spicy', 'bold', 'tangy', 'smoky', 'pungent', 'intense'],
    favoredCookingMethods: [
      'grilling',
      'roasting',
      'frying',
      'broiling',
      'high-heat searing',
      'flambéing'
    ],
    seasonalPreferences: ['summer', 'spring', 'harvest foods'],
    nutritionalFocus: ['protein', 'iron', 'vitamin B12', 'energizing foods'],
    cookingStyle: 'Impulsive, quick and energetic cooking with minimal preparation',
    diningStyle: 'Enthusiastic but impatient, may eat quickly and prefer casual settings',
    weakness: 'Rushing cooking process, not following recipes closely',
    mealStructure: 'Protein-centered meals with immediate satisfaction'
  },
  taurus: {
    favoredCuisines: [
      'Italian',
      'French',
      'Greek',
      'Swiss',
      'Argentinian',
      'Provençal',
      'Southern American'
    ],
    favoredIngredients: [
      'cheese',
      'butter',
      'root vegetables',
      'beef',
      'mushrooms',
      'bread',
      'potatoes',
      'truffles',
      'chocolate',
      'cream'
    ],
    favoredFlavors: ['rich', 'sweet', 'earthy', 'umami', 'creamy', 'buttery', 'savory'],
    favoredCookingMethods: [
      'slow cooking',
      'baking',
      'braising',
      'roasting',
      'confit',
      'caramelizing'
    ],
    seasonalPreferences: [
      'autumn',
      'harvest foods',
      'aged delicacies',
      'traditional seasonal staples'
    ],
    nutritionalFocus: ['quality proteins', 'calcium', 'healthy fats', 'sustainable energy foods'],
    cookingStyle: 'Patient, traditional cooking with attention to quality ingredients',
    diningStyle: 'Appreciates fine dining, takes time to savor every bite',
    weakness: 'Overindulgence, richness, and portion control',
    mealStructure: 'Complete traditional courses with emphasis on quality'
  },
  gemini: {
    favoredCuisines: [
      'Fusion',
      'Vietnamese',
      'Spanish',
      'Tapas',
      'Street food',
      'Korean-Mexican',
      'California cuisine'
    ],
    favoredIngredients: [
      'fresh herbs',
      'citrus',
      'vegetables',
      'seafood',
      'berries',
      'sprouts',
      'unusual combinations',
      'edible flowers'
    ],
    favoredFlavors: [
      'light',
      'varied',
      'bright',
      'complex',
      'layered',
      'contrasting',
      'surprising'
    ],
    favoredCookingMethods: [
      'stir-frying',
      'steaming',
      'raw preparations',
      'quick sautéing',
      'mixing methods',
      'pickling'
    ],
    seasonalPreferences: ['spring', 'early summer', 'changing seasonal offerings'],
    nutritionalFocus: ['variety', 'brain foods', 'omega-3', 'antioxidants'],
    cookingStyle: 'Experimental and playful, often cooking multiple dishes at once',
    diningStyle: 'Enjoys conversation while eating, prefers variety like tapas or shared plates',
    weakness: 'Getting distracted while cooking, inconsistent results',
    mealStructure: 'Multiple small plates with diverse flavors and textures'
  },
  cancer: {
    favoredCuisines: [
      'Japanese',
      'American',
      'Homestyle',
      'Coastal',
      'Polish',
      'Irish',
      'Southern comfort food'
    ],
    favoredIngredients: [
      'seafood',
      'dairy',
      'comfort foods',
      'rice',
      'potatoes',
      'broths',
      'heritage grains',
      'family recipes'
    ],
    favoredFlavors: ['comforting', 'traditional', 'subtle', 'nostalgic', 'soothing', 'familiar'],
    favoredCookingMethods: [
      'steaming',
      'boiling',
      'slow cooking',
      'simmering',
      'poaching',
      'baking'
    ],
    seasonalPreferences: ['winter', 'comfort foods', 'family traditions'],
    nutritionalFocus: ['gut health', 'immunity', 'emotional wellbeing foods', 'hydration'],
    cookingStyle: 'Intuitive, nurturing cooking often connected to memories and traditions',
    diningStyle: 'Values family-style dining and emotional connections through food',
    weakness: 'Emotional eating, overfeeding others, comfort-focused rather than nutrition',
    mealStructure: 'Nourishing main dishes with sides that evoke memory and comfort'
  },
  leo: {
    favoredCuisines: [
      'Mediterranean',
      'Moroccan',
      'Brazilian',
      'French fine dining',
      'Peruvian',
      'Lebanese',
      'Luxury fusion'
    ],
    favoredIngredients: [
      'expensive cuts',
      'saffron',
      'honey',
      'gold leaf',
      'truffles',
      'wagyu beef',
      'foie gras',
      'champagne'
    ],
    favoredFlavors: ['rich', 'indulgent', 'exotic', 'vibrant', 'memorable', 'impressive'],
    favoredCookingMethods: [
      'grilling',
      'roasting',
      'flambé',
      'tableside preparation',
      'showcase techniques',
      'artistic plating'
    ],
    seasonalPreferences: ['midsummer', 'festival foods', 'celebration dishes'],
    nutritionalFocus: ['heart health', 'vitality', 'antioxidants', 'energy sustaining foods'],
    cookingStyle: 'Dramatic, impressive cooking with flair and presentation focus',
    diningStyle: 'Appreciates being the center of attention, enjoys dining as an event',
    weakness: 'Focusing too much on appearance over substance, extravagance',
    mealStructure: 'Dramatic main course with theatrical elements and presentation'
  },
  virgo: {
    favoredCuisines: [
      'Japanese',
      'Korean',
      'Farm-to-table',
      'Nordic',
      'German',
      'Vegan',
      'Health-focused'
    ],
    favoredIngredients: [
      'whole grains',
      'fresh vegetables',
      'herbs',
      'lean proteins',
      'seeds',
      'fermented foods',
      'precise ingredients'
    ],
    favoredFlavors: ['clean', 'precise', 'balanced', 'pure', 'refined', 'subtle'],
    favoredCookingMethods: [
      'steaming',
      'fermentation',
      'precision cooking',
      'sous vide',
      'dehydrating',
      'proper technique'
    ],
    seasonalPreferences: ['late summer', 'harvest', 'precision seasonal eating'],
    nutritionalFocus: [
      'digestive health',
      'balanced nutrition',
      'medicinal foods',
      'precise macronutrients'
    ],
    cookingStyle: 'Methodical, precise cooking following exact recipes and techniques',
    diningStyle: 'Appreciates quality, cleanliness and order in dining experiences',
    weakness: 'Overthinking recipes, perfectionism leading to stress',
    mealStructure: 'Carefully balanced plate with proper nutritional proportions'
  },
  libra: {
    favoredCuisines: [
      'French',
      'Thai',
      'California Cuisine',
      'New American',
      'Venetian',
      'Contemporary',
      'Balanced fusion'
    ],
    favoredIngredients: [
      'artfully presented foods',
      'balanced flavors',
      'wine pairings',
      'edible flowers',
      'artisanal ingredients',
      'harmonious combinations'
    ],
    favoredFlavors: [
      'balanced',
      'elegant',
      'harmonious',
      'complementary',
      'sophisticated',
      'refined'
    ],
    favoredCookingMethods: [
      'sous vide',
      'careful sautéing',
      'artful plating',
      'balanced techniques',
      'color-conscious preparation'
    ],
    seasonalPreferences: ['fall', 'transitional foods', 'balanced seasonal elements'],
    nutritionalFocus: ['balanced macros', 'beauty foods', 'anti-inflammatory', 'skin health'],
    cookingStyle: 'Aesthetic, balanced cooking with attention to presentation and harmony',
    diningStyle: 'Values beautiful environments and well-paired flavors',
    weakness: 'Indecision about what to cook, prioritizing appearance over flavor',
    mealStructure: 'Perfectly balanced plate with complementary flavors and visual appeal'
  },
  scorpio: {
    favoredCuisines: [
      'Mexican',
      'Korean',
      'Cajun',
      'North African',
      'Indonesian',
      'Caribbean',
      'Scottish'
    ],
    favoredIngredients: [
      'fermented foods',
      'dark chocolate',
      'seafood',
      'mushrooms',
      'game meats',
      'offal',
      'blood sausage',
      'intense spices'
    ],
    favoredFlavors: [
      'intense',
      'complex',
      'mysterious',
      'deep',
      'transformative',
      'fermented',
      'aged'
    ],
    favoredCookingMethods: [
      'smoking',
      'fermenting',
      'slow cooking',
      'curing',
      'aging',
      'sous vide',
      'charring'
    ],
    seasonalPreferences: ['late autumn', 'winter', 'preserved foods', 'aged delicacies'],
    nutritionalFocus: ['gut microbiome', 'detoxification', 'regenerative foods', 'immune support'],
    cookingStyle: 'Intense, transformative cooking that changes ingredients significantly',
    diningStyle: 'Enjoys exploring unusual flavors and hidden food establishments',
    weakness: 'Making dishes too intense or complex for others to enjoy',
    mealStructure: 'Deeply complex dishes with mysterious elements and surprising depth'
  },
  sagittarius: {
    favoredCuisines: [
      'Indian',
      'Middle Eastern',
      'Caribbean',
      'Ethiopian',
      'Polynesian',
      'South American',
      'Adventurous fusion'
    ],
    favoredIngredients: [
      'exotic spices',
      'game meats',
      'international ingredients',
      'unusual fruits',
      'rare herbs',
      'diverse grains',
      'global discoveries'
    ],
    favoredFlavors: [
      'bold',
      'adventurous',
      'varied',
      'global',
      'spiced',
      'expansive',
      'cross-cultural'
    ],
    favoredCookingMethods: [
      'grilling',
      'open fire cooking',
      'experimental techniques',
      'foreign methods',
      'high-adventure cooking'
    ],
    seasonalPreferences: ['global seasonal variations', 'cross-cultural seasonal celebrations'],
    nutritionalFocus: [
      'diverse nutrients',
      'superfoods',
      'travel-supporting nutrition',
      'adaptogenic herbs'
    ],
    cookingStyle: 'Adventurous, spontaneous cooking often inspired by travels',
    diningStyle: 'Enjoys exploration of new cuisines and food traditions',
    weakness: 'Overambitious recipes, imprecise measurements, abandoned cooking projects',
    mealStructure: 'Globally inspired plates with educational and philosophical elements'
  },
  capricorn: {
    favoredCuisines: [
      'Traditional French',
      'German',
      'Classic American',
      'British',
      'Alpine',
      'Russian',
      'Classic steakhouse'
    ],
    favoredIngredients: [
      'root vegetables',
      'aged meats',
      'hearty grains',
      'traditional herbs',
      'quality staples',
      'bone broths',
      'traditional preserves'
    ],
    favoredFlavors: [
      'traditional',
      'rich',
      'substantial',
      'time-tested',
      'authentic',
      'structured',
      'classic'
    ],
    favoredCookingMethods: [
      'slow cooking',
      'baking',
      'traditional methods',
      'braising',
      'classic techniques',
      'aging'
    ],
    seasonalPreferences: ['winter', 'traditional seasonal staples', 'preserved heritage foods'],
    nutritionalFocus: ['bone health', 'sustained energy', 'structural support', 'longevity foods'],
    cookingStyle: 'Traditional, disciplined cooking with respect for classic techniques',
    diningStyle: 'Appreciates quality establishments with history and reputation',
    weakness: 'Resistance to innovation, overreliance on tradition',
    mealStructure: 'Traditional courses with proper progressions and heritage elements'
  },
  aquarius: {
    favoredCuisines: [
      'Modernist',
      'Fusion',
      'Plant-based',
      'Molecular',
      'Future foods',
      'Sustainable cuisine',
      'Technological food'
    ],
    favoredIngredients: [
      'unusual ingredients',
      'ancient grains',
      'molecular components',
      'sustainable proteins',
      'innovative substitutes',
      'food tech',
      'rare plant varieties'
    ],
    favoredFlavors: [
      'unexpected',
      'innovative',
      'unconventional',
      'futuristic',
      'progressive',
      'idealistic',
      'cerebral'
    ],
    favoredCookingMethods: [
      'molecular gastronomy',
      'innovative techniques',
      'unconventional pairings',
      'technological cooking',
      'scientific methods'
    ],
    seasonalPreferences: ['future foods', 'climate-adaptive ingredients', 'sustainable options'],
    nutritionalFocus: [
      'cognitive function',
      'innovative supplements',
      'sustainability',
      'ethical nutrition'
    ],
    cookingStyle: 'Innovative, experimental cooking that breaks traditions',
    diningStyle: 'Values unique concepts and intellectual approaches to food',
    weakness: 'Creating dishes that are too conceptual or detached from enjoyment',
    mealStructure: 'Unconventional progressions that challenge dining norms'
  },
  pisces: {
    favoredCuisines: [
      'Coastal',
      'Nordic',
      'Asian',
      'Island',
      'Scandinavian',
      'Pacific Rim',
      'Seafood-focused'
    ],
    favoredIngredients: [
      'seafood',
      'delicate herbs',
      'subtle flavors',
      'exotic teas',
      'edible flowers',
      'seaweed',
      'ethereal textures',
      'aromatic wines'
    ],
    favoredFlavors: [
      'subtle',
      'ethereal',
      'dreamy',
      'delicate',
      'mystical',
      'flowing',
      'intuitive'
    ],
    favoredCookingMethods: [
      'poaching',
      'steaming',
      'gentle cooking methods',
      'infusing',
      'marinating',
      'aromatic cooking'
    ],
    seasonalPreferences: ['early spring', 'transitional periods', 'liminal seasonal moments'],
    nutritionalFocus: ['omega-3', 'brain health', 'dream-enhancing foods', 'spiritual nutrition'],
    cookingStyle: 'Intuitive, flowing cooking often without precise recipes',
    diningStyle: 'Enjoys atmospheric dining with emotional and spiritual elements',
    weakness: 'Vagueness in recipes, inconsistent results, getting lost in process',
    mealStructure: 'Fluid dining experiences that blur boundaries between courses'
  }
};

/**
 * Modality-based ingredient preferences
 */
export const _modalityIngredientPreferences: Record<
  Modality,
  {
    proteins: string[];
    vegetables: string[];
    fruits: string[];
    herbs: string[];
    textures: string[];
    preparations: string[];
  }
> = {
  cardinal: {
    proteins: ['lean meats', 'quickly cooked fish', 'eggs', 'tofu'],
    vegetables: ['red bell peppers', 'radishes', 'onions', 'chilis', 'young vegetables'],
    fruits: ['apples', 'strawberries', 'pomegranate', 'citrus'],
    herbs: ['chives', 'cilantro', 'mint', 'ginger'],
    textures: ['crisp', 'crunchy', 'fresh', 'direct'],
    preparations: ['quick cooking', 'raw', 'minimal processing', 'immediate flavor']
  },
  fixed: {
    proteins: ['slow-cooked meats', 'aged beef', 'cured meats', 'baked proteins'],
    vegetables: ['root vegetables', 'squash', 'potatoes', 'cabbage', 'sturdy greens'],
    fruits: ['apples', 'pears', 'dried fruits', 'preserved fruits'],
    herbs: ['rosemary', 'sage', 'thyme', 'bay leaf'],
    textures: ['dense', 'substantial', 'hearty', 'lasting'],
    preparations: ['slow cooking', 'roasting', 'preserving', 'aging']
  },
  mutable: {
    proteins: ['seafood', 'versatile proteins', 'plant-based proteins', 'varied preparations'],
    vegetables: ['leafy greens', 'adaptable vegetables', 'multi-use produce', 'shoots'],
    fruits: ['berries', 'tropical fruits', 'versatile fruits', 'mixed fruit combinations'],
    herbs: ['parsley', 'basil', 'mixed herb blends', 'adaptable aromatics'],
    textures: ['varied', 'layered', 'complex', 'changing'],
    preparations: [
      'multiple techniques',
      'fusion methods',
      'variable cooking times',
      'adaptive recipes'
    ]
  }
};

/**
 * Seasonal affinities by zodiac sign
 */
export const _zodiacSeasonalAffinities: Record<
  ZodiacSign,
  {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
    bestSeasonalIngredients: string[];
  }
> = {
  aries: {
    spring: 0.9,
    summer: 0.7,
    autumn: 0.4,
    winter: 0.3,
    bestSeasonalIngredients: [
      'spring lambs',
      'asparagus',
      'radishes',
      'spring onions',
      'fresh herbs'
    ]
  },
  taurus: {
    spring: 0.7,
    summer: 0.6,
    autumn: 0.9,
    winter: 0.5,
    bestSeasonalIngredients: [
      'spring vegetables',
      'strawberries',
      'fresh cheeses',
      'early root vegetables'
    ]
  },
  gemini: {
    spring: 0.8,
    summer: 0.7,
    autumn: 0.5,
    winter: 0.4,
    bestSeasonalIngredients: ['spring peas', 'leafy greens', 'berries', 'versatile produce']
  },
  cancer: {
    spring: 0.5,
    summer: 0.9,
    autumn: 0.6,
    winter: 0.4,
    bestSeasonalIngredients: ['summer fruits', 'fresh seafood', 'zucchini', 'tomatoes', 'corn']
  },
  leo: {
    spring: 0.4,
    summer: 0.9,
    autumn: 0.6,
    winter: 0.3,
    bestSeasonalIngredients: [
      'summer berries',
      'stone fruits',
      'heirloom tomatoes',
      'grilling vegetables'
    ]
  },
  virgo: {
    spring: 0.5,
    summer: 0.7,
    autumn: 0.9,
    winter: 0.4,
    bestSeasonalIngredients: [
      'harvest grains',
      'late summer vegetables',
      'early apples',
      'herbs at peak'
    ]
  },
  libra: {
    spring: 0.5,
    summer: 0.6,
    autumn: 0.9,
    winter: 0.4,
    bestSeasonalIngredients: ['apples', 'pears', 'nuts', 'squash', 'late harvest produce']
  },
  scorpio: {
    spring: 0.3,
    summer: 0.5,
    autumn: 0.8,
    winter: 0.7,
    bestSeasonalIngredients: ['root vegetables', 'game meats', 'mushrooms', 'preserved foods']
  },
  sagittarius: {
    spring: 0.4,
    summer: 0.6,
    autumn: 0.7,
    winter: 0.9,
    bestSeasonalIngredients: [
      'winter spices',
      'exotic imports',
      'hearty vegetables',
      'aged ingredients'
    ]
  },
  capricorn: {
    spring: 0.3,
    summer: 0.4,
    autumn: 0.7,
    winter: 0.9,
    bestSeasonalIngredients: [
      'winter roots',
      'preserved items',
      'hearty greens',
      'stored harvest goods'
    ]
  },
  aquarius: {
    spring: 0.5,
    summer: 0.3,
    autumn: 0.6,
    winter: 0.9,
    bestSeasonalIngredients: [
      'winter citrus',
      'greenhouse innovations',
      'stored technology foods',
      'preserved rarities'
    ]
  },
  pisces: {
    spring: 0.8,
    summer: 0.5,
    autumn: 0.4,
    winter: 0.7,
    bestSeasonalIngredients: [
      'early spring seafood',
      'snow peas',
      'delicate greens',
      'transition seasonal items'
    ]
  }
};

/**
 * Modality-based cooking techniques
 */
export const modalityCookingTechniques: Record<Modality, string[]> = {
  cardinal: [
    'grilling',
    'searing',
    'stir-frying',
    'quick cooking techniques',
    'blanching',
    'broiling',
    'direct heat methods',
    'initiative cooking'
  ],
  fixed: [
    'slow roasting',
    'braising',
    'sous vide',
    'consistent temperature techniques',
    'smoking',
    'fermenting',
    'aging',
    'preserving',
    'endurance cooking'
  ],
  mutable: [
    'steaming',
    'poaching',
    'adaptable cooking',
    'fusion techniques',
    'variable methods',
    'combination cooking',
    'multi-step preparations',
    'flexible timing'
  ]
};

/**
 * Get recommended cooking techniques based on zodiac sign
 */
export function getCookingTechniquesForSign(sign: any): string[] {
  const modality = ZODIAC_MODALITIES[sign];
  return modalityCookingTechniques[modality];
}

/**
 * Zodiac affinity for meal timing
 */
export const _zodiacMealTimingPreferences: Record<
  ZodiacSign,
  {
    breakfast: number;
    lunch: number;
    dinner: number;
    snacking: number;
    idealEatingHours: string;
  }
> = {
  aries: {
    breakfast: 0.8,
    lunch: 0.6,
    dinner: 0.7,
    snacking: 0.4,
    idealEatingHours: 'Early morning and midday when energy is highest'
  },
  taurus: {
    breakfast: 0.6,
    lunch: 0.7,
    dinner: 0.9,
    snacking: 0.8,
    idealEatingHours: 'Leisurely evening meals, appreciating dinner fully'
  },
  gemini: {
    breakfast: 0.5,
    lunch: 0.7,
    dinner: 0.6,
    snacking: 0.9,
    idealEatingHours: 'Multiple small meals throughout the day'
  },
  cancer: {
    breakfast: 0.7,
    lunch: 0.6,
    dinner: 0.9,
    snacking: 0.7,
    idealEatingHours: 'Evening family meals, breakfast comfort foods'
  },
  leo: {
    breakfast: 0.5,
    lunch: 0.7,
    dinner: 0.9,
    snacking: 0.6,
    idealEatingHours: 'Prime dinner time when attention can be focused'
  },
  virgo: {
    breakfast: 0.8,
    lunch: 0.7,
    dinner: 0.6,
    snacking: 0.5,
    idealEatingHours: 'Regular, precisely timed meals throughout day'
  },
  libra: {
    breakfast: 0.6,
    lunch: 0.8,
    dinner: 0.9,
    snacking: 0.5,
    idealEatingHours: 'Social lunch and dinner times with company'
  },
  scorpio: {
    breakfast: 0.4,
    lunch: 0.6,
    dinner: 0.9,
    snacking: 0.7,
    idealEatingHours: 'Evening and late night when atmosphere is intense'
  },
  sagittarius: {
    breakfast: 0.7,
    lunch: 0.8,
    dinner: 0.7,
    snacking: 0.8,
    idealEatingHours: 'Varied meal times, adaptable to adventure'
  },
  capricorn: {
    breakfast: 0.8,
    lunch: 0.7,
    dinner: 0.8,
    snacking: 0.3,
    idealEatingHours: 'Traditional meal times adhered to strictly'
  },
  aquarius: {
    breakfast: 0.6,
    lunch: 0.5,
    dinner: 0.7,
    snacking: 0.8,
    idealEatingHours: 'Unconventional eating schedule, meal timing experiments'
  },
  pisces: {
    breakfast: 0.5,
    lunch: 0.6,
    dinner: 0.8,
    snacking: 0.7,
    idealEatingHours: 'Flowing meal times that follow intuition rather than clock'
  }
};

/**
 * Get modality-compatible flavors for cooking
 */
export function getCompatibleFlavorsForModality(modality: Modality): string[] {
  const flavorMappings: Record<Modality, string[]> = {
    cardinal: ['spicy', 'bold', 'crisp', 'pronounced', 'direct', 'immediate', 'energetic'],
    fixed: ['rich', 'deep', 'complex', 'sustained', 'persistent', 'powerful', 'foundational'],
    mutable: ['adaptable', 'layered', 'evolving', 'complementary', 'versatile', 'transforming']
  };

  return flavorMappings[modality];
}

/**
 * Calculate zodiac compatibility for recipe combinations
 */
export function calculateRecipeZodiacCompatibility(
  mainIngredientSign: any,
  preparationMethodSign: any,
): number {
  // Get modalities
  const ingredientModality = ZODIAC_MODALITIES[mainIngredientSign];
  const preparationModality = ZODIAC_MODALITIES[preparationMethodSign];

  // Get elements (from zodiacUtils)
  const elementMap: Record<ZodiacSign, string> = {
    aries: 'Fire',
    leo: 'Fire',
    sagittarius: 'Fire',
    taurus: 'Earth',
    virgo: 'Earth',
    capricorn: 'Earth',
    gemini: 'Air',
    libra: 'Air',
    aquarius: 'Air',
    cancer: 'Water',
    scorpio: 'Water',
    pisces: 'Water'
  };

  const ingredientElement = elementMap[mainIngredientSign];
  const preparationElement = elementMap[preparationMethodSign];

  // Calculate compatibility scores
  let modalityScore = 0;
  if (ingredientModality === preparationModality) {;
    modalityScore = 0.8; // Strong match
  } else if (
    (ingredientModality === 'cardinal' && preparationModality === 'mutable') ||;
    (ingredientModality === 'mutable' && preparationModality === 'cardinal');
  ) {
    modalityScore = 0.6; // Good match
  } else {
    modalityScore = 0.3; // Fair match
  }

  // Element compatibility
  let elementScore = 0;
  if (ingredientElement === preparationElement) {;
    elementScore = 0.9; // Strong match
  } else if (
    (ingredientElement === 'fire' && preparationElement === 'air') ||;
    (ingredientElement === 'air' && preparationElement === 'fire') ||;
    (ingredientElement === 'earth' && preparationElement === 'water') ||;
    (ingredientElement === 'water' && preparationElement === 'earth');
  ) {
    elementScore = 0.7; // Good match
  } else {
    elementScore = 0.4; // Fair match
  }

  // Combined score (weighted)
  return modalityScore * 0.5 + elementScore * 0.5;
}
