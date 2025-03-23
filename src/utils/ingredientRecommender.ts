import type { ElementalProperties, ZodiacSign, LunarPhase, PlanetaryAlignment, Season, Element } from '@/types/alchemy';
// import { allIngredients } from '@/data/ingredients/ingredients'; // Commented out as unused
// import { getElementalAlignmentFromTarot } from '@/utils/tarotUtils'; // Commented out as unused
import type { AstrologicalState } from '@/types';
import { planetaryFlavorProfiles } from '@/data/planetaryFlavorProfiles';
import { enrichIngredientsWithFlavorProfiles } from '@/data/ingredients/flavorProfiles';
import { spices } from '@/data/ingredients/spices';
import { plantBased } from '@/data/ingredients/proteins/plantBased';
import { herbs } from '@/data/ingredients/herbs';
import { fruits } from '@/data/ingredients/fruits';
import { grains } from '@/data/ingredients/grains';
import { vegetables } from '@/data/ingredients/vegetables';
import { oils } from '@/data/ingredients/oils';
import { seasonings } from '@/data/ingredients/seasonings';
import { seafood } from '@/data/ingredients/proteins/seafood';

// Import integration data
import { getCurrentSeason, getSeasonalScore, isInSeason } from '@/data/integrations/seasonal';
import { textureProfiles } from '@/data/integrations/textureProfiles';
import { getMedicinalProperties } from '@/data/integrations/medicinalCrossReference';
import { getTemperatureEffect } from '@/data/integrations/temperatureEffects';
import { ElementalCalculator } from '@/services/ElementalCalculator';
import { ingredientMappings } from '@/utils/elementalMappings/ingredients';

// Add type guard for element keys
type ElementKey = keyof ElementalProperties;

// Add at the top with other imports
import type { AstrologicalInfluence, IngredientMapping } from '@/types/ingredients';

// Enhanced Ingredient interface that combines properties from various definitions
interface EnhancedIngredient {
  name: string;
  category?: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile: {
    elementalAffinity: {
      base: string;
      decanModifiers?: Record<string, any>;
    } | string;
    rulingPlanets: string[];
    favorableZodiac?: ZodiacSign[];
  };
  flavorProfile?: Record<string, number>;
  season?: string[];
  energyProfile?: {
    zodiac?: ZodiacSign[];
    lunar?: LunarPhase[];
    planetary?: PlanetaryAlignment[];
  };
  // Additional properties
  isInSeason?: boolean;
  seasonalScore?: number;
  temperatureEffect?: string;
  medicinalProperties?: string[];
  nutritionalProfile?: {
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sugars: number;
    };
    vitamins: Record<string, number>;
    minerals: Record<string, number>;
    phytonutrients: Record<string, number>;
  };
  nutritionalScore?: number;
  [key: string]: any; // Allow other properties
}

interface CurrentEnergy {
  zodiac: ZodiacSign;
  lunar: LunarPhase;
  planetary: PlanetaryAlignment;
  tarot?: {
    elementalAlignment: {
      Fire: number;
      Water: number;
      Earth: number;
      Air: number;
    }
  };
}

/**
 * Flattens all ingredients from various categories into a single array
 */
const flattenIngredients = (): EnhancedIngredient[] => {
  const allIngredients: EnhancedIngredient[] = [];
  
  // Define all categories
  const categories = [
    { name: 'Spices', data: spices },
    { name: 'Plant-Based Proteins', data: plantBased },
    { name: 'Herbs', data: herbs },
    { name: 'Fruits', data: fruits },
    { name: 'Grains', data: grains },
    { name: 'Vegetables', data: vegetables },
    { name: 'Oils', data: oils },
    { name: 'Seasonings', data: seasonings },
    { name: 'Seafood', data: seafood }
  ];
  
  // Process each category
  categories.forEach(category => {
    if (!category.data) {
      console.warn(`No data for category: ${category.name}`);
      return;
    }
    
    Object.entries(category.data).forEach(([name, data]) => {
      // Make sure we add the name to the ingredient
      allIngredients.push({
        name,
        category: category.name.toLowerCase(),
        ...data,
      } as EnhancedIngredient);
    });
  });
  
  console.log(`Collected ${allIngredients.length} total ingredients from all categories`);
  
  // Filter out ingredients without proper astrological profiles
  const validIngredients = allIngredients.filter(ing => 
    ing.astrologicalProfile && 
    ing.astrologicalProfile.elementalAffinity && 
    ing.astrologicalProfile.rulingPlanets
  );
  
  console.log(`Found ${validIngredients.length} ingredients with valid astrological profiles`);
  
  return validIngredients;
};

export const getRecommendedIngredients = (astroState: AstrologicalState): EnhancedIngredient[] => {
  const ingredients = flattenIngredients();
  
  return ingredients.filter(ingredient => {
    const profile = ingredient.astrologicalProfile;
    
    // Check if the ingredient has the required properties
    if (!profile || !profile.elementalAffinity || !profile.rulingPlanets) {
      return false;
    }

    // Handle case where elementalAffinity is a string or an object
    let baseElement: ElementKey;
    if (typeof profile.elementalAffinity === 'string') {
      baseElement = profile.elementalAffinity as ElementKey;
    } else {
      baseElement = profile.elementalAffinity.base as ElementKey;
    }

    const elementMatch = ingredient.elementalProperties[baseElement] > 0.4;
    const planetMatch = profile.rulingPlanets.some((p: string) => astroState.activePlanets.includes(p));
    
    return elementMatch && planetMatch;
  });
};

/**
 * Calculate a flavor profile based on planetary influences
 */
function calculateFlavorProfile(planetaryInfluences: Record<string, number>): Record<string, number> {
  const flavorProfile: Record<string, number> = {
    'sweet': 0,
    'salty': 0,
    'sour': 0,
    'bitter': 0,
    'umami': 0,
    'spicy': 0
  };
  
  // Sum flavor influences from each active planet
  Object.entries(planetaryInfluences).forEach(([planet, weight]) => {
    const planetProfile = planetaryFlavorProfiles[planet];
    if (planetProfile && 'flavorInfluences' in planetProfile) {
      Object.entries(planetProfile.flavorInfluences as Record<string, number>).forEach(([flavor, value]) => {
        if (flavorProfile[flavor] !== undefined && typeof value === 'number') {
          flavorProfile[flavor] += value * weight;
        }
      });
    }
  });
  
  // Normalize values
  const total = Object.values(flavorProfile).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(flavorProfile).forEach(key => {
      flavorProfile[key] = flavorProfile[key] / total;
    });
  }
  
  return flavorProfile;
}

/**
 * Calculate how well an ingredient's flavor matches the current planetary influences
 */
function calculatePlanetaryFlavorMatch(
  ingredientFlavorProfile: Record<string, number>,
  planetaryInfluences: Record<string, number>
): number {
  // First calculate the target flavor profile based on planetary influences
  const targetProfile = calculateFlavorProfile(planetaryInfluences);
  
  // Then compare the ingredient's profile to the target
  let matchScore = 0;
  let totalWeight = 0;
  
  Object.entries(targetProfile).forEach(([flavor, targetValue]) => {
    if (targetValue > 0) {
      const ingredientValue = ingredientFlavorProfile[flavor] || 0;
      // Calculate similarity (1 - difference)
      const similarity = 1 - Math.abs(targetValue - ingredientValue);
      matchScore += similarity * targetValue; // Weight by the importance in target profile
      totalWeight += targetValue;
    }
  });
  
  return totalWeight > 0 ? matchScore / totalWeight : 0;
}

/**
 * Enhanced version of getTopIngredientMatches that incorporates seasonal data
 */
export const getTopIngredientMatches = (
  ingredients: EnhancedIngredient[],
  targetElemental: ElementalProperties,
  currentZodiac?: ZodiacSign,
  currentSeason?: Season,
  limit: number = 10
): EnhancedIngredient[] => {
  return ingredients.map(ingredient => {
    // Calculate nutritional impact
    const nutrition = ingredient.nutritionalProfile || {
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugars: 0 },
      vitamins: {},
      minerals: {},
      phytonutrients: {}
    };
    
    const nutritionScore = Math.log1p(
      nutrition.calories + 
      nutrition.macros.protein * 5 +
      nutrition.macros.fiber * 3 +
      (nutrition.vitamins.vitaminC || 0) * 2 +
      (nutrition.minerals.iron || 0) * 1.5
    );
    
    // Update elemental properties with nutrition boost
    const boostedElements = {
      Fire: ingredient.elementalProperties.Fire * (1 + nutritionScore * 0.2),
      Water: ingredient.elementalProperties.Water * (1 + nutritionScore * 0.15),
      Earth: ingredient.elementalProperties.Earth * (1 + nutritionScore * 0.25),
      Air: ingredient.elementalProperties.Air * (1 + nutritionScore * 0.1)
    };
    
    // Calculate scores with nutrition impact
    const elementalScore = calculateElementalState(boostedElements, targetElemental);
    const astrologicalScore = calculateAstrologicalScore(ingredient, currentZodiac);
    const seasonalScore = calculateSeasonalScore(ingredient, currentSeason);
    
    return {
      ...ingredient,
      elementalProperties: boostedElements,
      nutritionalScore,
      totalScore: (
        elementalScore * 0.5 + 
        astrologicalScore * 0.3 + 
        seasonalScore * 0.2
      )
    };
  }).sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);
};

/**
 * Recommendation interface
 */
export interface IngredientRecommendation {
  name: string;
  elementalScore: number;
  astrologicalScore: number;
  seasonalScore: number;
  totalScore: number;
  description: string;
  elementalProperties: ElementalProperties;
  category?: string;
  sensoryProfile?: SensoryProfile;
  recommendedCookingMethods?: CookingMethod[];
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
    toAvoid: string[];
  };
  elementalTransformation?: {
    whenCooked: Partial<ElementalProperties>;
    whenFermented?: Partial<ElementalProperties>;
    whenDried?: Partial<ElementalProperties>;
  };
}

/**
 * Options for recommendation algorithm
 */
export interface RecommendationOptions {
  targetElemental?: ElementalProperties;
  currentZodiac?: ZodiacSign;
  currentSeason?: Season;
  dietaryPreferences?: string[];
  excludeIngredients?: string[];
  limit?: number;
}

/**
 * Get ingredient recommendations based on current state
 */
export function getIngredientRecommendations(
  currentState: ElementalState,
  options: RecommendationOptions = {}
): IngredientRecommendation[] {
  const {
    targetElemental = { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 },
    currentZodiac,
    currentSeason = 'summer',
    dietaryPreferences = [],
    excludeIngredients = [],
    limit = 10
  } = options;
  
  // Calculate lunar phase
  const lunarPhase = calculateLunarPhase();
  
  // Calculate aspects (with validation)
  let aspects = { aspects: [], elementalEffects: { fire: 0, earth: 0, air: 0, water: 0 } };
  
  if (currentState.planetaryAlignment && Object.keys(currentState.planetaryAlignment).length > 0) {
    // Verify that all positions have valid sign properties
    const hasValidPositions = Object.values(currentState.planetaryAlignment).every(
      position => position && position.sign
    );
    
    if (hasValidPositions) {
      aspects = calculateAspects(currentState.planetaryAlignment);
    } else {
      console.warn('Some planetary positions have invalid or missing sign data');
    }
  }
  
  // Use currentState instead of balance calculations
  const stateScores = calculateStateSimilarity(ingredientMappings, currentState);
  
  const allIngredients = flattenIngredients();
  const filteredIngredients = allIngredients.filter(ingredient => {
    // Apply dietary preferences if provided
    if (dietaryPreferences.length > 0 && !dietaryPreferences.some(pref => ingredient.category?.includes(pref))) {
      return false;
    }

    // Exclude specific ingredients if provided
    if (excludeIngredients.includes(ingredient.name)) {
      return false;
    }

    return true;
  });

  // Calculate scores for ingredients
  const scoredIngredients = filteredIngredients.map(ingredient => {
    const elementalScore = calculateElementalState(ingredient.elementalProperties, targetElemental);
    const astrologicalScore = calculateAstrologicalScore(ingredient, currentZodiac);
    const seasonalScore = options.currentSeason ? calculateSeasonalScore(ingredient, options.currentSeason) : 0.5;
    
    // Calculate total score giving more weight to elemental and seasonal scores
    const totalScore = (elementalScore * 0.5) + (astrologicalScore * 0.25) + (seasonalScore * 0.25);
    
    // Determine dominant element
    const dominantElement = Object.entries(ingredient.elementalProperties)
      .reduce((max, [element, value]) => value > max.value ? {element, value} : max, {element: '', value: 0})
      .element;
      
    // Generate a meaningful description based on dominant element and properties
    const description = generateIngredientDescription(
      ingredient.name, 
      ingredient.elementalProperties, 
      dominantElement,
      ingredient.isInSeason || false,
      options.currentZodiac && ingredient.astrologicalProfile?.favorableZodiac?.includes(options.currentZodiac) || false
    );
    
    // Generate sensory profile
    const sensoryProfile = generateSensoryProfile(
      ingredient.name,
      ingredient.elementalProperties,
      dominantElement
    );
    
    // Generate cooking methods
    const recommendedCookingMethods = generateCookingMethods(
      dominantElement,
      ingredient.elementalProperties
    );
    
    // Generate pairing recommendations
    const pairingRecommendations = generatePairingRecommendations(
      ingredient.name,
      ingredient.elementalProperties,
      dominantElement,
      Object.entries(ingredientMappings)
    );

    // Return a recommendation object with only relevant properties
    return {
      name: ingredient.name,
      elementalScore,
      astrologicalScore,
      seasonalScore,
      totalScore,
      description,
      elementalProperties: ingredient.elementalProperties,
      category: ingredient.category,
      sensoryProfile,
      recommendedCookingMethods,
      pairingRecommendations
    };
  });

  // Sort results by total score and limit if needed
  return scoredIngredients
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, options.limit || 10);
}

/**
 * Calculate elemental score based on how well it matches target properties
 */
function calculateElementalState(
  properties: ElementalProperties,
  targetElemental: ElementalProperties
): number {
  const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  let similarity = 0;
  elements.forEach((element: keyof ElementalProperties) => {
    similarity += 1 - Math.abs(
      (properties[element] || 0) - 
      (targetElemental[element] || 0)
    );
  });
  
  return similarity / elements.length;
}

/**
 * Calculate astrological score
 */
function calculateAstrologicalScore(
  ingredient: any,
  currentZodiac?: ZodiacSign,
  lunarPhase: LunarPhase
): number {
  if (!currentZodiac || !ingredient.astrologicalProfile) return 0.5; // Neutral score
  
  // Check if current zodiac is in favorable signs
  if (ingredient.astrologicalProfile.favorableZodiac?.includes(currentZodiac)) {
    return 1.0; // Perfect match
  }
  
  // Check elemental affinity
  const zodiacElements: Record<ZodiacSign, Element> = {
    aries: 'Fire', leo: 'Fire', sagittarius: 'Fire',
    taurus: 'Earth', virgo: 'Earth', capricorn: 'Earth',
    gemini: 'Air', libra: 'Air', aquarius: 'Air',
    cancer: 'Water', scorpio: 'Water', pisces: 'Water'
  };
  
  const zodiacElement = zodiacElements[currentZodiac];
  const baseElement = typeof ingredient.astrologicalProfile.elementalAffinity === 'string'
    ? ingredient.astrologicalProfile.elementalAffinity
    : ingredient.astrologicalProfile.elementalAffinity?.base;
  
  if (baseElement === zodiacElement) {
    return 0.8; // Good elemental affinity
  }
  
  return 0.3; // No strong connection
}

/**
 * Calculate seasonal score
 */
function calculateSeasonalScore(
  ingredient: any,
  currentSeason: Season
): number {
  if (!ingredient.season) return 0.5; // Neutral score
  
  // Check if current season is in the ingredient's season list
  if (ingredient.season.includes(currentSeason)) {
    return 1.0; // Perfect seasonal match
  }
  
  // Check if ingredient is available all year
  if (ingredient.season.includes('all')) {
    return 0.7; // Available but not optimal
  }
  
  return 0.2; // Out of season
}

// Update interface names
export interface ElementalState extends ElementalProperties {
  timestamp: Date;
  astrologicalInfluences?: AstrologicalInfluence[];
  currentStability: number;  // Added stability metric
  planetaryAlignment: PlanetaryAlignment; // Added from types
}

// Add the calculateStateSimilarity function
function calculateStateSimilarity(
  ingredientMappings: Record<string, IngredientMapping>,
  currentState: ElementalState
): Record<string, number> {
  const stateScores: Record<string, number> = {};
  
  Object.entries(ingredientMappings).forEach(([name, mapping]) => {
    let similarity = 0;
    const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
    
    elements.forEach(element => {
      similarity += 1 - Math.abs(
        (mapping.elementalProperties[element] || 0) - 
        (currentState[element] || 0)
      );
    });
    
    stateScores[name] = similarity / elements.length;
  });
  
  return stateScores;
}

// Add aspect scoring to the recommendation system
function calculateAspectScore(
  ingredient: EnhancedIngredient,
  aspects: PlanetaryAspect[]
): number {
  if (!ingredient.astrologicalProfile?.rulingPlanets) return 0;
  
  let totalScore = 0;
  const rulingPlanets = ingredient.astrologicalProfile.rulingPlanets;
  
  aspects.forEach(aspect => {
    // Check if either planet in the aspect is a ruling planet
    const hasPlanet1 = rulingPlanets.includes(aspect.planet1);
    const hasPlanet2 = rulingPlanets.includes(aspect.planet2);
    
    if (hasPlanet1 || hasPlanet2) {
      // Apply aspect strength based on type
      let aspectScore = aspect.strength;
      
      // Apply additional weights based on aspect type
      switch (aspect.type) {
        case 'conjunction':
          aspectScore *= 1.2;
          break;
        case 'trine':
          aspectScore *= 1.1;
          break;
        case 'sextile':
          aspectScore *= 0.9;
          break;
        case 'square':
          aspectScore *= 0.8;
          break;
        case 'opposition':
          aspectScore *= 1.0;
          break;
      }
      
      totalScore += aspectScore;
    }
  });
  
  // Normalize score to 0-1 range
  return Math.min(1, totalScore / 2);
}

/**
 * Generate a meaningful description for an ingredient based on its properties
 */
function generateIngredientDescription(
  name: string,
  elementalProperties: ElementalProperties,
  dominantElement: string,
  isInSeason: boolean,
  isZodiacCompatible: boolean
): string {
  // Create a more informative description
  const elementalValues = Object.entries(elementalProperties)
    .sort(([_, a], [__, b]) => b - a);
  
  const primaryElement = elementalValues[0][0];
  const primaryValue = elementalValues[0][1];
  
  let description = `${name} is primarily a ${primaryElement.toLowerCase()} ingredient`;
  
  // Add secondary element if significant
  if (elementalValues.length > 1 && elementalValues[1][1] > 0.2) {
    description += ` with strong ${elementalValues[1][0].toLowerCase()} qualities`;
  }
  
  // Add seasonal information if relevant
  if (isInSeason) {
    description += `. It's currently in season`;
  }
  
  // Add zodiac compatibility if relevant
  if (isZodiacCompatible) {
    description += ` and harmonizes well with your zodiac sign`;
  }
  
  // Add culinary suggestions based on dominant element
  switch (dominantElement) {
    case 'Fire':
      description += `. Best prepared with high-heat cooking methods.`;
      break;
    case 'Water':
      description += `. Excellent in soups, stews, or gentle poaching.`;
      break;
    case 'Earth':
      description += `. Ideal for slow cooking or roasting to develop flavor.`;
      break;
    case 'Air':
      description += `. Versatile and adaptable to many cooking styles.`;
      break;
    default:
      description += `.`;
  }
  
  return description;
}

/**
 * Utility function to capitalize the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a sensory profile for an ingredient based on its elemental properties
 */
function generateSensoryProfile(
  name: string,
  elementalProperties: ElementalProperties,
  dominantElement: string
): SensoryProfile {
  const fire = elementalProperties.Fire || 0;
  const water = elementalProperties.Water || 0;
  const earth = elementalProperties.Earth || 0;
  const air = elementalProperties.Air || 0;
  
  // Generate taste properties based on elemental composition
  const taste = {
    sweet: Math.min(1, earth * 0.7 + water * 0.4),
    salty: Math.min(1, water * 0.6 + earth * 0.2),
    sour: Math.min(1, water * 0.5 + air * 0.3),
    bitter: Math.min(1, fire * 0.6 + air * 0.3),
    umami: Math.min(1, earth * 0.8 + fire * 0.2),
    spicy: Math.min(1, fire * 0.9 + air * 0.2)
  };
  
  // Generate aroma properties
  const aroma = {
    floral: Math.min(1, air * 0.8 + water * 0.3),
    fruity: Math.min(1, water * 0.6 + fire * 0.3),
    herbal: Math.min(1, air * 0.7 + earth * 0.4),
    spicy: Math.min(1, fire * 0.8 + air * 0.3),
    earthy: Math.min(1, earth * 0.9 + water * 0.2),
    woody: Math.min(1, earth * 0.7 + fire * 0.3)
  };
  
  // Generate texture properties
  const texture = {
    crisp: Math.min(1, air * 0.7 + fire * 0.4),
    tender: Math.min(1, water * 0.7 + earth * 0.3),
    creamy: Math.min(1, water * 0.8 + earth * 0.3),
    chewy: Math.min(1, earth * 0.6 + fire * 0.4),
    crunchy: Math.min(1, earth * 0.5 + fire * 0.5),
    silky: Math.min(1, water * 0.9 + air * 0.3)
  };
  
  // Combine into sensory profile
  return {
    taste,
    aroma,
    texture
  };
}

/**
 * Generate recommended cooking methods based on elemental properties
 */
function generateCookingMethods(
  dominantElement: string,
  elementalProperties: ElementalProperties
): CookingMethod[] {
  const methods: CookingMethod[] = [];
  
  // Add methods based on dominant element
  if (dominantElement === 'Fire') {
    methods.push({
      name: 'Grilling',
      elementalEffect: { Fire: 0.2, Air: 0.1, Earth: -0.1, Water: -0.2 },
      cookingTime: { min: 5, max: 15, unit: 'minutes' },
      description: 'High heat cooking that enhances Fire element and caramelization.'
    });
    methods.push({
      name: 'Roasting',
      elementalEffect: { Fire: 0.15, Earth: 0.1, Water: -0.1 },
      cookingTime: { min: 20, max: 45, unit: 'minutes' },
      temperatures: { min: 180, max: 220, unit: 'celsius' },
      description: 'Dry heat that intensifies flavors and enhances Fire properties.'
    });
  }
  
  if (dominantElement === 'Water') {
    methods.push({
      name: 'Steaming',
      elementalEffect: { Water: 0.2, Air: 0.1, Fire: -0.1 },
      cookingTime: { min: 5, max: 15, unit: 'minutes' },
      description: 'Gentle cooking that preserves Water element and nutrients.'
    });
    methods.push({
      name: 'Poaching',
      elementalEffect: { Water: 0.25, Earth: 0.05, Fire: -0.15 },
      cookingTime: { min: 3, max: 12, unit: 'minutes' },
      description: 'Slow, gentle simmering that enhances Water properties.'
    });
  }
  
  if (dominantElement === 'Earth') {
    methods.push({
      name: 'Braising',
      elementalEffect: { Earth: 0.2, Water: 0.15, Fire: 0.05 },
      cookingTime: { min: 1, max: 4, unit: 'hours' },
      description: 'Slow cooking that enhances Earth element and deepens flavor.'
    });
    methods.push({
      name: 'Fermenting',
      elementalEffect: { Earth: 0.3, Water: 0.1, Air: 0.1, Fire: -0.1 },
      cookingTime: { min: 2, max: 14, unit: 'days' },
      description: 'Transformation process that greatly enhances Earth properties.'
    });
  }
  
  if (dominantElement === 'Air') {
    methods.push({
      name: 'Whipping',
      elementalEffect: { Air: 0.3, Fire: 0.05, Earth: -0.1 },
      cookingTime: { min: 2, max: 10, unit: 'minutes' },
      description: 'Incorporates air and lightness, enhancing Air element.'
    });
    methods.push({
      name: 'Infusing',
      elementalEffect: { Air: 0.25, Water: 0.1, Earth: 0.05 },
      cookingTime: { min: 30, max: 240, unit: 'minutes' },
      description: 'Gentle extraction that enhances aromatic Air properties.'
    });
  }
  
  // Add common methods for all elements
  methods.push({
    name: 'Sautéing',
    elementalEffect: { Fire: 0.15, Air: 0.1, Water: -0.1 },
    cookingTime: { min: 3, max: 10, unit: 'minutes' },
    description: 'Quick cooking that balances elements while enhancing flavor.'
  });
  
  // Return the first 3 methods to not overwhelm the display
  return methods.slice(0, 3);
}

/**
 * Generate pairing recommendations based on elemental compatibility
 */
function generatePairingRecommendations(
  name: string,
  elementalProperties: ElementalProperties,
  dominantElement: string,
  allIngredients: [string, IngredientMapping][]
): { complementary: string[], contrasting: string[], toAvoid: string[] } {
  const complementary: string[] = [];
  const contrasting: string[] = [];
  const toAvoid: string[] = [];
  
  // Filter out the current ingredient
  const otherIngredients = allIngredients.filter(([iName]) => iName !== name);
  
  // Find complementary ingredients (similar elemental profile)
  for (const [iName, mapping] of otherIngredients) {
    // Skip if the ingredient doesn't have elemental properties
    if (!mapping.elementalProperties) continue;
    
    // Calculate similarity score
    const similarity = calculateElementalSimilarity(
      elementalProperties,
      mapping.elementalProperties
    );
    
    // Find dominant element
    const ingDominantElement = Object.entries(mapping.elementalProperties)
      .sort(([_, a], [__, b]) => b - a)[0][0];
    
    // Complementary: similar dominant element or high similarity
    if (ingDominantElement === dominantElement || similarity > 0.85) {
      complementary.push(iName);
    }
    // Contrasting: different dominant element but moderate similarity
    else if (similarity > 0.5 && similarity < 0.7) {
      contrasting.push(iName);
    }
    // To avoid: very different elemental profile
    else if (similarity < 0.3) {
      toAvoid.push(iName);
    }
  }
  
  // Limit results to prevent overwhelming display
  return {
    complementary: shuffle(complementary).slice(0, 5),
    contrasting: shuffle(contrasting).slice(0, 3),
    toAvoid: shuffle(toAvoid).slice(0, 2)
  };
}

/**
 * Calculate similarity between two elemental profiles
 */
function calculateElementalSimilarity(
  properties1: ElementalProperties,
  properties2: ElementalProperties
): number {
  const elements: (keyof ElementalProperties)[] = ['Fire', 'Water', 'Earth', 'Air'];
  
  let similarity = 0;
  elements.forEach((element) => {
    similarity += 1 - Math.abs(
      (properties1[element] || 0) - 
      (properties2[element] || 0)
    );
  });
  
  return similarity / elements.length;
}

/**
 * Generate data about how elemental properties change when cooked
 */
function generateElementalTransformation(
  elementalProperties: ElementalProperties,
  dominantElement: string
): { whenCooked: Partial<ElementalProperties>, whenFermented?: Partial<ElementalProperties>, whenDried?: Partial<ElementalProperties> } {
  const fire = elementalProperties.Fire || 0;
  const water = elementalProperties.Water || 0;
  const earth = elementalProperties.Earth || 0;
  const air = elementalProperties.Air || 0;
  
  // Transformations when cooked
  const whenCooked: Partial<ElementalProperties> = {};
  
  // Cooking increases Fire and reduces Water
  whenCooked.Fire = Math.min(1, fire * 1.3);
  whenCooked.Water = Math.max(0, water * 0.7);
  
  // Fermentation transformation (optional)
  let whenFermented: Partial<ElementalProperties> | undefined;
  if (water > 0.3 && earth > 0.2) {
    whenFermented = {
      Earth: Math.min(1, earth * 1.5),
      Water: Math.max(0, water * 0.8),
      Air: Math.min(1, air * 1.2)
    };
  }
  
  // Drying transformation (optional)
  let whenDried: Partial<ElementalProperties> | undefined;
  if (water > 0.2) {
    whenDried = {
      Water: Math.max(0, water * 0.3),
      Fire: Math.min(1, fire * 1.1),
      Earth: Math.min(1, earth * 1.2),
      Air: Math.min(1, air * 1.1)
    };
  }
  
  return {
    whenCooked,
    ...(whenFermented && { whenFermented }),
    ...(whenDried && { whenDried })
  };
}

/**
 * Utility function to shuffle an array
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
} 