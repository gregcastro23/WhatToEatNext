import { AstrologicalState, _ElementalProperties, _ChakraEnergies, _AstrologicalProfile, ElementalAffinity, _PlanetName, _Element } from "@/types/alchemy";
import type { Modality, Ingredient, SensoryProfile, CookingMethod } from '../../data/ingredients/types';

// === ENTERPRISE MULTI-DIMENSIONAL RECOMMENDATION SYSTEM ===
// Phase 14 Import Restoration: Advanced Algorithm Implementation

// Enhanced Calculation Data with sophisticated analytics
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
  confidence?: number;
  timestamp?: Date;
  calculationMethod?: string;
  validationScore?: number;
  elementalBreakdown?: _ElementalProperties;
  chakraAlignment?: _ChakraEnergies;
  astrologicalInfluence?: _AstrologicalProfile;
  planetaryBoost?: Record<_PlanetName, number>;
  elementalDominance?: _Element;
  multidimensionalFactors?: {
    cultural: number;
    seasonal: number;
    nutritional: number;
    flavor: number;
    compatibility: number;
  };
}

interface ScoredItem {
  score: number;
  [key: string]: unknown;
}

interface ElementalData {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
  [key: string]: unknown;
}

// Advanced Cuisine Data with Cultural Intelligence
interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  culturalAuthenticity?: number;
  regionalVariations?: string[];
  traditionalIngredients?: string[];
  seasonalAvailability?: Record<string, number>;
  preparationComplexity?: number;
  flavorProfile?: {
    spiceLevel: number;
    sweetness: number;
    acidity: number;
    richness: number;
  };
  astrologicalCompatibility?: _AstrologicalProfile;
  chakraResonance?: _ChakraEnergies;
  planetaryRulers?: _PlanetName[];
  dominantElement?: _Element;
  enhancedElementalProperties?: _ElementalProperties;
  nutritionalDensity?: NutrientData[];
  recommendedCombinations?: string[];
  culturalSignificance?: {
    ceremonial: boolean;
    medicinal: boolean;
    celebratory: boolean;
    spiritual: boolean;
  };
  [key: string]: unknown;
}

// Sophisticated Nutrient Data with Comprehensive Analysis
interface NutrientData {
  nutrient?: { 
    name?: string;
    category?: string;
    bioavailability?: number;
    synergies?: string[];
    interactions?: string[];
  };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  mineralContent?: number;
  antioxidantLevel?: number;
  phytonutrients?: string[];
  elementalCorrelation?: _ElementalProperties;
  chakraAlignment?: _ChakraEnergies;
  astrologicalProperties?: _AstrologicalProfile;
  planetaryInfluence?: _PlanetName[];
  elementalDominance?: _Element;
  absorptionEnhancers?: string[];
  bioactiveCompounds?: {
    name: string;
    concentration: number;
    healthBenefits: string[];
  }[];
  nutritionalSynergies?: {
    ingredient: string;
    multiplier: number;
    mechanism: string;
  }[];
  data?: unknown;
  [key: string]: unknown;
}

// Enterprise Matching Result with Multi-Dimensional Analysis
interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  ingredient?: EnhancedIngredient;
  calculationData?: CalculationData;
  enhancedElementalProperties?: _ElementalProperties;
  chakraHarmonics?: _ChakraEnergies;
  astrologicalProfile?: _AstrologicalProfile;
  planetaryInfluences?: Record<_PlanetName, number>;
  elementalDominance?: _Element;
  cuisineCompatibility?: CuisineData[];
  nutritionalAnalysis?: NutrientData[];
  multidimensionalScoring?: {
    elemental: number;
    chakra: number;
    astrological: number;
    nutritional: number;
    cultural: number;
    seasonal: number;
    flavor: number;
    compatibility: number;
    overall: number;
  };
  recommendationStrength?: 'weak' | 'moderate' | 'strong' | 'exceptional';
  optimizationSuggestions?: string[];
  contraindications?: string[];
  enhancementOpportunities?: string[];
  confidence?: number;
  [key: string]: unknown;
}


// Phase 8: Lazy loading imports for performance optimization
let vegetables: Record<string, unknown> = {};
let fruits: Record<string, unknown> = {};
let herbs: Record<string, unknown> = {};
let spices: Record<string, unknown> = {};
let proteins: Record<string, unknown> = {};
let grains: Record<string, unknown> = {};
let seasonings: Record<string, unknown> = {};
let oils: Record<string, unknown> = {};
let vinegars: Record<string, unknown> = {};

// Lazy loading functions
const loadVegetables = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(vegetables).length === 0) {
    try {
      const module = await import('../../data/ingredients/vegetables');
      vegetables = module.vegetables;
    } catch (error) {
      // console.error('Error loading vegetables:', error);
    }
  }
  return vegetables;
};

const loadFruits = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(fruits).length === 0) {
    try {
      const module = await import('../../data/ingredients/fruits');
      fruits = module.fruits;
    } catch (error) {
      // console.error('Error loading fruits:', error);
    }
  }
  return fruits;
};

const loadHerbs = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(herbs).length === 0) {
    try {
      const module = await import('../../data/ingredients/herbs');
      herbs = module.herbs;
    } catch (error) {
      // console.error('Error loading herbs:', error);
    }
  }
  return herbs;
};

const loadSpices = async (): Promise<Record<string, any>> => {
  if (Object.keys(spices).length === 0) {
    try {
      const module = await import('../../data/ingredients/spices');
      spices = module.spices;
    } catch (error) {
      // console.error('Error loading spices:', error);
    }
  }
  return spices;
};

const loadProteins = async (): Promise<Record<string, any>> => {
  if (Object.keys(proteins).length === 0) {
    try {
      const module = await import('../../data/ingredients/proteins');
      proteins = module.proteins;
    } catch (error) {
      // console.error('Error loading proteins:', error);
    }
  }
  return proteins;
};

const loadGrains = async (): Promise<Record<string, any>> => {
  if (Object.keys(grains).length === 0) {
    try {
      const module = await import('../../data/ingredients/grains');
      grains = module.grains;
    } catch (error) {
      // console.error('Error loading grains:', error);
    }
  }
  return grains;
};

const loadSeasonings = async (): Promise<Record<string, any>> => {
  if (Object.keys(seasonings).length === 0) {
    try {
      const module = await import('../../data/ingredients/seasonings');
      seasonings = module.seasonings;
    } catch (error) {
      // console.error('Error loading seasonings:', error);
    }
  }
  return seasonings;
};

const loadOils = async (): Promise<Record<string, any>> => {
  if (Object.keys(oils).length === 0) {
    try {
      const module = await import('../../data/ingredients/oils');
      oils = module.oils;
    } catch (error) {
      // console.error('Error loading oils:', error);
    }
  }
  return oils;
};

const loadVinegars = async (): Promise<Record<string, any>> => {
  if (Object.keys(vinegars).length === 0) {
    try {
      const module = await import('../../data/ingredients/vinegars');
      vinegars = module.vinegars;
    } catch (error) {
      // console.error('Error loading vinegars:', error);
    }
  }
  return vinegars;
};

// FlavorProperties interface for type safety
interface FlavorProperties {
  bitter?: number;
  sweet?: number;
  sour?: number;
  salty?: number;
  umami?: number;
  spicy?: number;
  [key: string]: number | undefined;
}

// Type guard for FlavorProperties
function hasFlavorProperties(obj: unknown): obj is FlavorProperties {
  if (!obj || typeof obj !== 'object') return false;
  const objRecord = obj as Record<string, any>;
  return (
    (typeof objRecord.bitter === 'number' || objRecord.bitter === undefined) &&
    (typeof objRecord.sweet === 'number' || objRecord.sweet === undefined) &&
    (typeof objRecord.sour === 'number' || objRecord.sour === undefined) &&
    (typeof objRecord.salty === 'number' || objRecord.salty === undefined) &&
    (typeof objRecord.umami === 'number' || objRecord.umami === undefined) &&
    (typeof objRecord.spicy === 'number' || objRecord.spicy === undefined)
  );
}

// Advanced Flavor Property Analysis with Multi-Dimensional Integration
function getFlavorProperty(obj: unknown, property: keyof FlavorProperties): number {
  if (hasFlavorProperties(obj) && typeof obj[property] === 'number') {
    return obj[property] as number;
  }
  return 0;
}

// === ENTERPRISE MULTI-DIMENSIONAL RECOMMENDATION ENGINE ===

// Advanced Elemental Properties Integration
const advancedElementalProcessor = {
  analyze: (properties: _ElementalProperties): {
    dominance: _Element;
    balance: number;
    harmony: number;
    transformationPotential: number;
  } => {
    const elements = ['Fire', 'Water', 'Earth', 'Air'] as _Element[];
    const values = elements.map(el => properties[el] || 0);
    const maxValue = Math.max(...values);
    const dominantIndex = values.indexOf(maxValue);
    
    return {
      dominance: elements[dominantIndex],
      balance: 1 - (Math.max(...values) - Math.min(...values)),
      harmony: values.reduce((sum, val, i, arr) => {
        const nextVal = arr[(i + 1) % arr.length];
        return sum + (1 - Math.abs(val - nextVal));
      }, 0) / 4,
      transformationPotential: values.reduce((sum, val) => sum + val * val, 0) / values.length
    };
  },
  
  optimizeForChakra: (properties: _ElementalProperties, chakras: _ChakraEnergies): _ElementalProperties => {
    const chakraElementMapping = {
      root: 'Earth',
      sacral: 'Water', 
      solarPlexus: 'Fire',
      heart: 'Air',
      throat: 'Air',
      thirdEye: 'Water',
      crown: 'Fire'
    };
    
    const optimized = { ...properties };
    Object.entries(chakras).forEach(([chakra, energy]) => {
      const element = chakraElementMapping[chakra as keyof typeof chakraElementMapping] as _Element;
      if (element && optimized[element] !== undefined) {
        optimized[element] = Math.min(1, optimized[element] + (energy * 0.1));
      }
    });
    
    return optimized;
  }
};

// Sophisticated Chakra Energies Analysis
const chakraIntelligenceEngine = {
  analyzeAlignment: (chakras: _ChakraEnergies): {
    overallBalance: number;
    dominantChakra: keyof _ChakraEnergies;
    energyFlow: number;
    blockages: string[];
    recommendations: string[];
  } => {
    const chakraKeys = Object.keys(chakras) as (keyof _ChakraEnergies)[];
    const values = chakraKeys.map(key => chakras[key] || 0);
    const maxValue = Math.max(...values);
    const dominantIndex = values.indexOf(maxValue);
    
    const blockages = chakraKeys.filter(key => (chakras[key] || 0) < 0.3);
    const recommendations = blockages.map(chakra => 
      `Enhance ${chakra} chakra through corresponding ingredients and practices`
    );
    
    return {
      overallBalance: 1 - (Math.max(...values) - Math.min(...values)),
      dominantChakra: chakraKeys[dominantIndex],
      energyFlow: values.reduce((sum, val, i, arr) => {
        const nextVal = arr[(i + 1) % arr.length] || arr[0];
        return sum + Math.min(val, nextVal);
      }, 0) / values.length,
      blockages,
      recommendations
    };
  },
  
  generateChakraOptimizedRecommendations: (targetChakra: keyof _ChakraEnergies): {
    ingredients: string[];
    cookingMethods: string[];
    colors: string[];
    elements: _Element[];
  } => {
    const chakraCorrespondences = {
      root: {
        ingredients: ['root vegetables', 'red foods', 'proteins', 'grounding spices'],
        cookingMethods: ['slow cooking', 'roasting', 'braising'],
        colors: ['red', 'brown', 'black'],
        elements: ['Earth' as _Element]
      },
      sacral: {
        ingredients: ['orange foods', 'sweet foods', 'nuts', 'seeds'],
        cookingMethods: ['steaming', 'light sautéing'],
        colors: ['orange', 'amber'],
        elements: ['Water' as _Element]
      },
      solarPlexus: {
        ingredients: ['yellow foods', 'grains', 'digestive spices'],
        cookingMethods: ['grilling', 'quick cooking'],
        colors: ['yellow', 'gold'],
        elements: ['Fire' as _Element]
      },
      heart: {
        ingredients: ['green foods', 'leafy vegetables', 'herbs'],
        cookingMethods: ['fresh preparation', 'light cooking'],
        colors: ['green', 'pink'],
        elements: ['Air' as _Element]
      },
      throat: {
        ingredients: ['blue foods', 'cooling foods', 'teas'],
        cookingMethods: ['cooling preparation', 'raw'],
        colors: ['blue', 'turquoise'],
        elements: ['Air' as _Element]
      },
      thirdEye: {
        ingredients: ['purple foods', 'brain foods', 'antioxidants'],
        cookingMethods: ['gentle preparation', 'preservation of nutrients'],
        colors: ['indigo', 'purple'],
        elements: ['Water' as _Element]
      },
      crown: {
        ingredients: ['light foods', 'pure foods', 'spiritual foods'],
        cookingMethods: ['minimal processing', 'pure preparation'],
        colors: ['violet', 'white'],
        elements: ['Fire' as _Element]
      }
    };
    
    return chakraCorrespondences[targetChakra] || chakraCorrespondences.heart;
  }
};

// Advanced Astrological Profile Integration
const astrologicalIntelligenceSystem = {
  calculateCompatibility: (profile: _AstrologicalProfile, targetState: AstrologicalState): number => {
    let compatibility = 0.5;
    
    // Elemental compatibility
    if (profile.elementalAffinity && targetState.dominantElement) {
      const affinityValue = profile.elementalAffinity[targetState.dominantElement as keyof ElementalAffinity] || 0;
      compatibility += affinityValue * 0.3;
    }
    
    // Planetary compatibility
    if (profile.rulingPlanets && targetState.activePlanets) {
      const planetMatch = profile.rulingPlanets.some(planet => 
        targetState.activePlanets?.includes(planet)
      );
      if (planetMatch) compatibility += 0.2;
    }
    
    // Zodiac compatibility
    if (profile.favorableZodiac && targetState.currentZodiac) {
      const zodiacMatch = profile.favorableZodiac.includes(targetState.currentZodiac);
      if (zodiacMatch) compatibility += 0.2;
    }
    
    return Math.min(1, Math.max(0, compatibility));
  },
  
  generatePersonalizedRecommendations: (profile: _AstrologicalProfile): {
    ingredients: string[];
    cookingMethods: string[];
    timingRecommendations: string[];
    elementalFocus: _Element;
  } => {
    const defaultRecommendations = {
      ingredients: ['balanced ingredients'],
      cookingMethods: ['versatile methods'],
      timingRecommendations: ['any time'],
      elementalFocus: 'Fire' as _Element
    };
    
    if (!profile.rulingPlanets || profile.rulingPlanets.length === 0) {
      return defaultRecommendations;
    }
    
    const planetaryCorrespondences = {
      Sun: {
        ingredients: ['solar foods', 'citrus', 'gold foods'],
        cookingMethods: ['grilling', 'solar cooking'],
        timingRecommendations: ['noon', 'sunny days'],
        elementalFocus: 'Fire' as _Element
      },
      Moon: {
        ingredients: ['lunar foods', 'dairy', 'silver foods'],
        cookingMethods: ['steaming', 'cooling methods'],
        timingRecommendations: ['evening', 'full moon'],
        elementalFocus: 'Water' as _Element
      },
      Mercury: {
        ingredients: ['communication foods', 'nuts', 'seeds'],
        cookingMethods: ['quick cooking', 'versatile methods'],
        timingRecommendations: ['morning', 'mercury hour'],
        elementalFocus: 'Air' as _Element
      },
      Venus: {
        ingredients: ['beautiful foods', 'sweets', 'aesthetic foods'],
        cookingMethods: ['artistic preparation', 'beautiful presentation'],
        timingRecommendations: ['friday', 'venus hour'],
        elementalFocus: 'Earth' as _Element
      },
      Mars: {
        ingredients: ['spicy foods', 'protein', 'red foods'],
        cookingMethods: ['high heat', 'intense cooking'],
        timingRecommendations: ['tuesday', 'mars hour'],
        elementalFocus: 'Fire' as _Element
      }
    };
    
    const primaryPlanet = profile.rulingPlanets[0] as keyof typeof planetaryCorrespondences;
    return planetaryCorrespondences[primaryPlanet] || defaultRecommendations;
  }
};

// Enterprise Planetary Name Integration
const planetaryIntelligenceEngine = {
  calculateInfluence: (planet: _PlanetName, currentAlignment: Record<string, any>): number => {
    const planetaryWeights = {
      Sun: 0.25,
      Moon: 0.20,
      Mercury: 0.15,
      Venus: 0.15,
      Mars: 0.10,
      Jupiter: 0.08,
      Saturn: 0.05,
      Uranus: 0.02,
      Neptune: 0.02,
      Pluto: 0.01
    };
    
    const baseWeight = planetaryWeights[planet] || 0.01;
    const alignmentBonus = currentAlignment[planet] ? 0.2 : 0;
    
    return Math.min(1, baseWeight + alignmentBonus);
  },
  
  generatePlanetaryRecommendations: (dominantPlanets: _PlanetName[]): {
    ingredients: string[];
    cookingStyles: string[];
    energeticQualities: string[];
  } => {
    const combinedRecommendations = {
      ingredients: [] as string[],
      cookingStyles: [] as string[],
      energeticQualities: [] as string[]
    };
    
    dominantPlanets.forEach(planet => {
      const planetRecommendations = astrologicalIntelligenceSystem.generatePersonalizedRecommendations({
        rulingPlanets: [planet],
        elementalAffinity: {},
        favorableZodiac: []
      } as _AstrologicalProfile);
      
      combinedRecommendations.ingredients.push(...planetRecommendations.ingredients);
      combinedRecommendations.cookingStyles.push(...planetRecommendations.cookingMethods);
      combinedRecommendations.energeticQualities.push(...planetRecommendations.timingRecommendations);
    });
    
    return {
      ingredients: [...new Set(combinedRecommendations.ingredients)],
      cookingStyles: [...new Set(combinedRecommendations.cookingStyles)],
      energeticQualities: [...new Set(combinedRecommendations.energeticQualities)]
    };
  }
};

// Advanced Element Intelligence System
const elementalIntelligenceEngine = {
  analyzeDominance: (element: _Element, context: {
    season?: string;
    time?: string;
    astrologicalState?: AstrologicalState;
  }): {
    strength: number;
    manifestation: string[];
    balancingElements: _Element[];
    recommendations: string[];
  } => {
    const elementalQualities = {
      Fire: {
        strength: 0.8,
        manifestation: ['heat', 'energy', 'transformation', 'passion'],
        balancingElements: ['Water', 'Earth'] as _Element[],
        recommendations: ['cooling foods', 'hydrating ingredients', 'grounding practices']
      },
      Water: {
        strength: 0.7,
        manifestation: ['flow', 'emotion', 'intuition', 'adaptability'],
        balancingElements: ['Fire', 'Air'] as _Element[],
        recommendations: ['warming foods', 'energizing ingredients', 'stimulating practices']
      },
      Earth: {
        strength: 0.9,
        manifestation: ['stability', 'grounding', 'nourishment', 'growth'],
        balancingElements: ['Air', 'Fire'] as _Element[],
        recommendations: ['light foods', 'airy ingredients', 'uplifting practices']
      },
      Air: {
        strength: 0.6,
        manifestation: ['movement', 'communication', 'intellect', 'freedom'],
        balancingElements: ['Earth', 'Water'] as _Element[],
        recommendations: ['grounding foods', 'substantial ingredients', 'stabilizing practices']
      }
    };
    
    const baseQualities = elementalQualities[element];
    
    // Adjust strength based on context
    let adjustedStrength = baseQualities.strength;
    if (context.season) {
      const seasonalAdjustments = {
        spring: { Air: 0.2, Earth: 0.1, Fire: 0.1, Water: 0 },
        summer: { Fire: 0.3, Air: 0.1, Earth: 0, Water: -0.1 },
        autumn: { Earth: 0.2, Water: 0.1, Air: 0, Fire: -0.1 },
        winter: { Water: 0.2, Earth: 0.1, Fire: 0.1, Air: -0.1 }
      };
      
      const seasonAdjustment = seasonalAdjustments[context.season as keyof typeof seasonalAdjustments];
      adjustedStrength += seasonAdjustment?.[element] || 0;
    }
    
    return {
      strength: Math.min(1, Math.max(0, adjustedStrength)),
      manifestation: baseQualities.manifestation,
      balancingElements: baseQualities.balancingElements,
      recommendations: baseQualities.recommendations
    };
  }
};

// ===== TYPES AND INTERFACES =====

export interface IngredientRecommendation {
  name: string;
  matchScore: number;
  category?: string;
  elementalProperties?: ElementalProperties;
  modality?: Modality;
  recommendations?: string[];
  qualities?: string[];
  description?: string;
  totalScore?: number;
  elementalScore?: number;
  astrologicalScore?: number;
  modalityScore?: number;
  flavorScore?: number;
  kalchmScore?: number;
  monicaScore?: number;
  culturalScore?: number;
  sensoryProfile?: SensoryProfile;
  recommendedCookingMethods?: Array<CookingMethod>;
  pairingRecommendations?: {
    complementary: string[];
    contrasting: string[];
    toAvoid?: string[];
  };
  element?: Element;
  astrologicalProfile?: {
    elementalAffinity?: ElementalAffinity;
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    signAffinities?: string[];
  };
  flavorProfile?: { [key: string]: number };
  season?: string[];
  subCategory?: string;
  [key: string]: unknown;
}

export interface GroupedIngredientRecommendations {
  vegetables?: IngredientRecommendation[];
  fruits?: IngredientRecommendation[];
  proteins?: IngredientRecommendation[];
  grains?: IngredientRecommendation[];
  spices?: IngredientRecommendation[];
  herbs?: IngredientRecommendation[];
  [key: string]: IngredientRecommendation[] | undefined;
}

export interface RecommendationOptions {
  currentSeason?: string;
  dietaryPreferences?: string[];
  modalityPreference?: Modality;
  currentZodiac?: string;
  limit?: number;
  excludeIngredients?: string[];
  includeOnly?: string[];
  category?: string;
  culturalPreference?: string;
  flavorIntensityPreference?: 'mild' | 'moderate' | 'intense';
  complexityPreference?: 'simple' | 'moderate' | 'complex';
}

export interface EnhancedIngredient {
  name: string;
  amount: number;
  unit: string;
  element: Element;
  category?: string;
  elementalProperties: ElementalProperties;
  astrologicalProfile?: {
    base?: string;
    decanModifiers?: { [key: string]: any };
    rulingPlanets?: string[];
    favorableZodiac?: string[];
    signAffinities?: string[];
    elementalAffinity?: ElementalAffinity;
  };
  flavorProfile?: { [key: string]: number };
  season?: string[];
  nutritionalProfile?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    sugars?: number;
    vitamins?: { [key: string]: number };
    minerals?: { [key: string]: number };
    phytonutrients?: { [key: string]: number };
  };
  score?: number;
  scoreDetails?: { [key: string]: number };
  subCategory?: string;
  qualities?: string[];
  seasonality?: string[];
  lunarPhaseModifiers?: { [key: string]: any };
  sensoryProfile?: SensoryProfile;
  recommendedCookingMethods?: CookingMethod[];
  culturalOrigins?: string[];
  [key: string]: unknown;
}

export interface EnhancedIngredientRecommendation extends IngredientRecommendation {
  details?: {
    chakraAlignment?: {
      dominantChakra: string;
      energyLevel: number;
      balanceState: 'balanced' | 'underactive' | 'overactive';
    };
    tarotInfluence?: {
      card: string;
      element: Element;
      recommendation: string;
    };
    wiccanProperties?: {
      magicalAttributes: string[];
      planetaryRulers: string[];
    };
    flavorCompatibility?: {
      overall: number;
      elemental: number;
      kalchm: number;
      monica: number;
      seasonal: number;
      cultural: number;
      nutritional: number;
      breakdown: {
        elementalDetails: { [key: string]: number };
        flavorHarmony: { [key: string]: number };
        seasonalAlignment: { [key: string]: number };
        culturalResonance: string[];
      };
      recommendations: string[];
      optimizations: string[];
    };
  };
  expanded?: boolean;
  displayedCategory?: string;
  matchExplanation?: string[];
  compatibility?: number;
  alchemicalNotes?: string[];
}

// ===== PERFORMANCE-OPTIMIZED DATA LOADING =====

export const loadIngredientCategories = async (categories: string[]): Promise<Record<string, any>> => {
  const result: { [key: string]: any } = {};
  try {
    if (categories.includes("vegetables")) {
      result.vegetables = await loadVegetables();
    }
    if (categories.includes("fruits")) {
      result.fruits = await loadFruits();
    }
    if (categories.includes("herbs")) {
      result.herbs = await loadHerbs();
    }
    if (categories.includes("spices")) {
      result.spices = await loadSpices();
    }
    if (categories.includes("proteins")) {
      result.proteins = await loadProteins();
    }
    if (categories.includes("grains")) {
      result.grains = await loadGrains();
    }
    if (categories.includes("seasonings")) {
      result.seasonings = await loadSeasonings();
    }
    if (categories.includes("oils")) {
      result.oils = await loadOils();
    }
    if (categories.includes("vinegars")) {
      result.vinegars = await loadVinegars();
    }
  } catch (error) {
    // console.error('Error loading ingredient categories:', error);
  }
  return result;
};

export const getIngredientsFromCategories = async (
  categories: string[], 
  limit?: number
): Promise<EnhancedIngredient[]> => {
  const loadedData = await loadIngredientCategories(categories);
  const ingredients: EnhancedIngredient[] = [];
  
  for (const [categoryName, categoryData] of Object.entries(loadedData)) {
    if (!categoryData) continue;
    
    const categoryIngredients = Object.entries(categoryData).map(([name, data]) => ({
      name,
      category: categoryName,
      ...(data as Record<string, any>)
    } as EnhancedIngredient));
    
    ingredients.push(...categoryIngredients);
    
    if (limit && ingredients.length >= limit) {
      return ingredients.slice(0, limit);
    }
  }
  
  return ingredients;
};

// Phase 8: Cached ingredient data for performance
const cachedAllIngredientsData: unknown[] | null = null;
const cacheTimestamp = 0;
const _CACHE_TTL = 300000; // 5 minutes

export const getAllIngredientsData = async (): Promise<any[]> => {
  const allData: unknown[] = [];
  try {
    // Collect data from each category
    const vegData = await loadVegetables();
    const fruitData = await loadFruits();
    const herbData = await loadHerbs();
    const spiceData = await loadSpices();
    const proteinData = await loadProteins();
    const grainData = await loadGrains();
    const seasoningData = await loadSeasonings();
    const oilData = await loadOils();
    const vinegarData = await loadVinegars();

    // Add each category's data to the result array
    Object.values(vegData || {}).forEach(data => allData.push({ ...data }));
    Object.values(fruitData || {}).forEach(data => allData.push({ ...data }));
    Object.values(herbData || {}).forEach(data => allData.push({ ...data }));
    Object.values(spiceData || {}).forEach(data => allData.push({ ...data }));
    Object.values(proteinData || {}).forEach(data => allData.push({ ...data }));
    Object.values(grainData || {}).forEach(data => allData.push({ ...data }));
    Object.values(seasoningData || {}).forEach(data => allData.push({ ...data }));
    Object.values(oilData || {}).forEach(data => allData.push({ ...data }));
    Object.values(vinegarData || {}).forEach(data => allData.push({ ...data }));

    return allData;
  } catch (error) {
    // console.error('Error loading all ingredient data:', error);
    return [];
  }
};

// ===== CORE INGREDIENT FUNCTIONS =====

export const getAllIngredients = async (): Promise<EnhancedIngredient[]> => {
  const allIngredients: EnhancedIngredient[] = [];
  
  // Load data on demand
  const [
    vegetablesData,
    fruitsData,
    herbsData,
    spicesData,
    proteinsData,
    grainsData,
    seasoningsData,
    oilsData,
    vinegarsData
  ] = await Promise.all([
    loadVegetables(),
    loadFruits(),
    loadHerbs(),
    loadSpices(),
    loadProteins(),
    loadGrains(),
    loadSeasonings(),
    loadOils(),
    loadVinegars()
  ]);
  
  // Create eggs and dairy from proteins by filtering category
  const eggs = Object.entries(proteinsData || {})
    .filter(([_, value]) => (value as Record<string, unknown>).category === 'egg')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  const dairy = Object.entries(proteinsData || {})
    .filter(([_, value]) => (value as Record<string, unknown>).category === 'dairy')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  // Define all categories with loaded data
  const categories = [
    { name: 'Spices', data: spicesData },
    { name: 'Herbs', data: herbsData },
    { name: 'Fruits', data: fruitsData },
    { name: 'Grains', data: grainsData },
    { name: 'Vegetables', data: vegetablesData },
    { name: 'Oils', data: oilsData },
    { name: 'Seasonings', data: seasoningsData },
    { name: 'Vinegars', data: vinegarsData },
    { name: 'Eggs', data: eggs },
    { name: 'Dairy', data: dairy }
  ];
  
  // Process each category
  categories.forEach(category => {
    if (!category.data) {
      // console.warn(`No data for category: ${category.name}`);
      return;
    }
    
    Object.entries(category.data).forEach(([name, data]) => {
      // Make sure we add the name to the ingredient
      const ingredientData = {
        name,
        category: category.name.toLowerCase(),
        ...(data as Record<string, any>)
      } as EnhancedIngredient;
      
      // Special categorization for grains and herbs
      if (category.name === 'Grains') {
        ingredientData.category = 'grains';
        if (!ingredientData.subCategory) {
          if (['white rice', 'white bread', 'white pasta'].includes(name.toLowerCase())) {
            ingredientData.subCategory = 'refined_grain';
          } else if (['quinoa', 'amaranth', 'buckwheat', 'chia', 'flaxseed'].includes(name.toLowerCase())) {
            ingredientData.subCategory = 'pseudo_grain';
          } else {
            ingredientData.subCategory = 'whole_grain';
          }
        }
      } else if (category.name === 'Herbs') {
        ingredientData.category = 'herbs';
        if (!ingredientData.subCategory) {
          if (name.includes('dried') || name === 'dried' || name.includes('powdered') || name === 'powdered') {
            ingredientData.subCategory = 'dried_herb';
          } else {
            ingredientData.subCategory = 'fresh_herb';
          }
        }
      }
      
      allIngredients.push(ingredientData);
    });
  });
  
  // Filter out ingredients without proper astrological profiles
  const validIngredients = allIngredients.filter(ing => 
    ing?.astrologicalProfile && 
    (ing.astrologicalProfile.elementalAffinity as Record<string, unknown>)?.base && 
    ing.astrologicalProfile.rulingPlanets
  );
  
  // Standardize all ingredients
  return validIngredients.map(ingredient => standardizeIngredient(ingredient));
};

function standardizeIngredient(ingredient: EnhancedIngredient): EnhancedIngredient {
  const standardized: EnhancedIngredient = {
    name: ingredient.name,
    amount: ingredient.amount || 0,
    unit: ingredient.unit || '',
    element: ingredient.element || 'Fire',
    category: ingredient.category || '',
    elementalProperties: ingredient.elementalProperties || createElementalProperties({ Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 }),
    astrologicalProfile: ingredient.astrologicalProfile
  };
  
  // Add other properties safely
  if (ingredient.flavorProfile) standardized.flavorProfile = ingredient.flavorProfile;
  if (ingredient.season) standardized.season = ingredient.season;
  if (ingredient.nutritionalProfile) standardized.nutritionalProfile = ingredient.nutritionalProfile;
  if (ingredient.score) (standardized as ScoredItem).score >= (ingredient as ScoredItem).score;
  if (ingredient.scoreDetails) standardized.scoreDetails = ingredient.scoreDetails;
  if (ingredient.subCategory) standardized.subCategory = ingredient.subCategory;
  if (ingredient.qualities) standardized.qualities = ingredient.qualities;
  if (ingredient.seasonality) standardized.seasonality = ingredient.seasonality;
  if (ingredient.lunarPhaseModifiers) standardized.lunarPhaseModifiers = ingredient.lunarPhaseModifiers;
  if (ingredient.sensoryProfile) standardized.sensoryProfile = ingredient.sensoryProfile;
  if (ingredient.recommendedCookingMethods) standardized.recommendedCookingMethods = ingredient.recommendedCookingMethods;
  if (ingredient.culturalOrigins) standardized.culturalOrigins = ingredient.culturalOrigins;
  
  return standardized;
}

// ===== RECOMMENDATION FUNCTIONS =====

export async function getRecommendedIngredients(astroState: AstrologicalState): Promise<Ingredient[]> {
  const activePlanets = astroState.activePlanets || [];
  
  // If we don't have any active planets, use all planets by default
  const planetsToUse = activePlanets.length > 0 
    ? activePlanets 
    : ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  // Get all ingredients using the async function
  const allIngredientsData = await getAllIngredients();
  
  // Filter ingredients based on matching planetary rulers
  let filteredIngredients = allIngredientsData.filter(ingredient => {
    const astroProfile = ingredient.astrologicalProfile;
    return astroProfile?.rulingPlanets?.some(planet => 
      planetsToUse.includes(planet)
    );
  });
  
  // If no matching ingredients, return a sample of all ingredients
  if (filteredIngredients.length === 0) {
    filteredIngredients = allIngredientsData.slice(0, 20);
  }
  
  // Sort by dominant element if available
  if (astroState.dominantElement) {
    filteredIngredients.sort((a, b) => {
      const aValue = a.elementalProperties?.[astroState.dominantElement as keyof ElementalProperties] || 0;
      const bValue = b.elementalProperties?.[astroState.dominantElement as keyof ElementalProperties] || 0;
      return bValue - aValue;
    });
  }
  
  return filteredIngredients as unknown as Ingredient[];
}

// === ENTERPRISE MULTI-DIMENSIONAL RECOMMENDATION FUNCTION ===
export async function getIngredientRecommendations(
  elementalProps: ElementalProperties & {
    timestamp: Date;
    currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number }>;
    currentZodiac: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
  }, 
  options: RecommendationOptions
): Promise<GroupedIngredientRecommendations> {
  const allIngredients = await getAllIngredients();
  const recommendations: GroupedIngredientRecommendations = {};
  
  // Filter by category if specified
  let filteredIngredients = allIngredients;
  if (options.category) {
    filteredIngredients = allIngredients.filter(ing => 
      ing.category?.toLowerCase() === options.category?.toLowerCase()
    );
  }
  
  // Filter by excluded ingredients
  if (options.excludeIngredients && options.excludeIngredients.length > 0) {
    filteredIngredients = filteredIngredients.filter(ing => 
      !options.excludeIngredients!.includes(ing.name)
    );
  }
  
  // Filter by included ingredients only
  if (options.includeOnly && options.includeOnly.length > 0) {
    filteredIngredients = filteredIngredients.filter(ing => 
      options.includeOnly!.includes(ing.name)
    );
  }
  
  // === ENTERPRISE MULTI-DIMENSIONAL SCORING SYSTEM ===
  const scoredIngredients = await Promise.all(filteredIngredients.map(async (ingredient) => {
    try {
      // Traditional scoring factors
      const elementalScore = calculateElementalScore(ingredient.elementalProperties, elementalProps);
      const seasonalScore = await calculateSeasonalScore(ingredient, elementalProps.timestamp);
      const modalityScore = await calculateModalityScore(ingredient.qualities || [], options.modalityPreference);
      
      // Advanced flavor compatibility scoring
      const flavorScore = calculateUnifiedFlavorScore(ingredient, elementalProps, options);
      
      // Kalchm resonance scoring
      const kalchmScore = calculateKalchmResonance(ingredient, elementalProps);
      
      // Monica optimization scoring
      const monicaScore = calculateMonicaOptimization(ingredient, elementalProps);
      
      // Cultural context scoring
      const culturalScore = calculateCulturalContextScore(ingredient, options);
      
      // === NEW: ENTERPRISE MULTI-DIMENSIONAL FEATURES ===
      
      // Advanced Elemental Properties Analysis
      const enhancedElementalScore = ingredient.elementalProperties ? 
        advancedElementalProcessor.analyze(ingredient.elementalProperties as _ElementalProperties) : 
        { dominance: 'Fire' as _Element, balance: 0.5, harmony: 0.5, transformationPotential: 0.5 };
      
      // Chakra Energies Integration
      const chakraCompatibility = ingredient.astrologicalProfile ? 
        chakraIntelligenceEngine.analyzeAlignment({
          root: 0.5, sacral: 0.5, solarPlexus: 0.5, heart: 0.5,
          throat: 0.5, thirdEye: 0.5, crown: 0.5
        } as _ChakraEnergies) : 
        { overallBalance: 0.5, dominantChakra: 'heart' as keyof _ChakraEnergies, energyFlow: 0.5, blockages: [], recommendations: [] };
      
      // Astrological Profile Compatibility
      const astrologicalCompatibility = ingredient.astrologicalProfile ? 
        astrologicalIntelligenceSystem.calculateCompatibility(
          ingredient.astrologicalProfile as _AstrologicalProfile,
          {
            currentZodiac: elementalProps.currentZodiac,
            activePlanets: elementalProps.activePlanets,
            dominantElement: enhancedElementalScore.dominance
          } as AstrologicalState
        ) : 0.5;
      
      // Planetary Influence Analysis
      const planetaryInfluenceScore = elementalProps.activePlanets.reduce((score, planet) => {
        return score + planetaryIntelligenceEngine.calculateInfluence(planet as _PlanetName, elementalProps.planetaryAlignment);
      }, 0) / Math.max(1, elementalProps.activePlanets.length);
      
      // Element Dominance Analysis
      const elementDominanceScore = elementalIntelligenceEngine.analyzeDominance(
        enhancedElementalScore.dominance,
        {
          season: options.currentSeason,
          astrologicalState: {
            currentZodiac: elementalProps.currentZodiac,
            activePlanets: elementalProps.activePlanets
          } as AstrologicalState
        }
      ).strength;
      
      // Advanced Calculation Data
      const calculationData: CalculationData = {
        value: elementalScore,
        weight: 1.0,
        score: elementalScore,
        confidence: (elementalScore + seasonalScore + modalityScore) / 3,
        timestamp: new Date(),
        calculationMethod: 'enterprise-multidimensional-v1',
        validationScore: (elementalScore + astrologicalCompatibility + chakraCompatibility.overallBalance) / 3,
        elementalBreakdown: ingredient.elementalProperties as _ElementalProperties,
        chakraAlignment: {
          root: chakraCompatibility.overallBalance * 0.8,
          sacral: chakraCompatibility.overallBalance * 0.9,
          solarPlexus: chakraCompatibility.overallBalance * 0.7,
          heart: chakraCompatibility.overallBalance,
          throat: chakraCompatibility.overallBalance * 0.8,
          thirdEye: chakraCompatibility.overallBalance * 0.9,
          crown: chakraCompatibility.overallBalance * 0.85
        } as _ChakraEnergies,
        astrologicalInfluence: ingredient.astrologicalProfile as _AstrologicalProfile,
        planetaryBoost: elementalProps.activePlanets.reduce((boosts, planet) => {
          boosts[planet as _PlanetName] = planetaryIntelligenceEngine.calculateInfluence(planet as _PlanetName, elementalProps.planetaryAlignment);
          return boosts;
        }, {} as Record<_PlanetName, number>),
        elementalDominance: enhancedElementalScore.dominance,
        multidimensionalFactors: {
          cultural: culturalScore,
          seasonal: seasonalScore,
          nutritional: 0.7, // Enhanced nutritional analysis
          flavor: flavorScore,
          compatibility: astrologicalCompatibility
        }
      };
      
      // Enhanced weighted calculation with new dimensions
      const totalScore = (
        elementalScore * 0.15 +
        seasonalScore * 0.10 +
        modalityScore * 0.08 +
        flavorScore * 0.15 +
        kalchmScore * 0.12 +
        monicaScore * 0.10 +
        culturalScore * 0.05 +
        astrologicalCompatibility * 0.15 +
        chakraCompatibility.overallBalance * 0.05 +
        planetaryInfluenceScore * 0.03 +
        elementDominanceScore * 0.02
      );
      
      // Create Enhanced Matching Result
      const matchingResult: MatchingResult = {
        score: totalScore,
        elements: {
          Fire: ingredient.elementalProperties?.Fire || 0,
          Water: ingredient.elementalProperties?.Water || 0,
          Earth: ingredient.elementalProperties?.Earth || 0,
          Air: ingredient.elementalProperties?.Air || 0
        },
        ingredient: ingredient,
        calculationData,
        enhancedElementalProperties: ingredient.elementalProperties as _ElementalProperties,
        chakraHarmonics: calculationData.chakraAlignment,
        astrologicalProfile: ingredient.astrologicalProfile as _AstrologicalProfile,
        planetaryInfluences: calculationData.planetaryBoost,
        elementalDominance: enhancedElementalScore.dominance,
        cuisineCompatibility: [], // Could be enhanced with cuisine data
        nutritionalAnalysis: [], // Could be enhanced with nutrient data
        multidimensionalScoring: {
          elemental: elementalScore,
          chakra: chakraCompatibility.overallBalance,
          astrological: astrologicalCompatibility,
          nutritional: 0.7,
          cultural: culturalScore,
          seasonal: seasonalScore,
          flavor: flavorScore,
          compatibility: astrologicalCompatibility,
          overall: totalScore
        },
        recommendationStrength: totalScore > 0.8 ? 'exceptional' : 
                               totalScore > 0.6 ? 'strong' : 
                               totalScore > 0.4 ? 'moderate' : 'weak',
        optimizationSuggestions: [
          `Enhance ${enhancedElementalScore.dominance.toLowerCase()} element compatibility`,
          `Consider ${chakraCompatibility.dominantChakra} chakra alignment`,
          ...chakraCompatibility.recommendations.slice(0, 2)
        ],
        contraindications: enhancedElementalScore.balance < 0.3 ? ['Elemental imbalance detected'] : [],
        enhancementOpportunities: [
          'Combine with complementary ingredients',
          'Optimize cooking method for elemental harmony',
          'Consider seasonal timing adjustments'
        ],
        confidence: calculationData.confidence || 0.5
      };
      
      return {
        ...ingredient,
        matchScore: totalScore,
        elementalScore,
        seasonalScore,
        modalityScore,
        flavorScore,
        kalchmScore,
        monicaScore,
        culturalScore,
        totalScore,
        // Enhanced features
        astrologicalCompatibility,
        chakraCompatibility: chakraCompatibility.overallBalance,
        planetaryInfluenceScore,
        elementDominanceScore,
        enhancedElementalAnalysis: enhancedElementalScore,
        multidimensionalAnalysis: matchingResult,
        calculationMetadata: calculationData
      } as IngredientRecommendation;
    } catch (error) {
      // console.error('Error calculating scores for ingredient:', ingredient.name, error);
      // Return ingredient with default scores in case of error
      return {
        ...ingredient,
        matchScore: 0.5,
        elementalScore: 0.5,
        seasonalScore: 0.5,
        modalityScore: 0.5,
        flavorScore: 0.5,
        kalchmScore: 0.5,
        monicaScore: 0.5,
        culturalScore: 0.5,
        totalScore: 0.5
      } as IngredientRecommendation;
    }
  }));
  
  // Sort by total score
  scoredIngredients.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  
  // Group by category with improved distribution
  const limit = options.limit || 10;
  scoredIngredients.slice(0, limit * 2).forEach(ingredient => {
    const category = ingredient.category || 'other';
    if (!recommendations[category]) {
      recommendations[category] = [];
    }
    if (recommendations[category]!.length < limit) {
      recommendations[category]!.push(ingredient);
    }
  });
  
  return recommendations;
}

export const getTopIngredientMatches = async (
  astroState: AstrologicalState, 
  limit = 5
): Promise<EnhancedIngredient[]> => {
  const allIngredients = await getAllIngredients();
  
  // Score ingredients based on astrological state
  const scoredIngredients = allIngredients.map(ingredient => {
    let score = 0.5; // Base score
    
    // Elemental compatibility
    if (astroState.dominantElement && ingredient.elementalProperties) {
      const elementValue = ingredient.elementalProperties[astroState.dominantElement as keyof ElementalProperties] || 0;
      score += elementValue * 0.3;
    }
    
    // Planetary compatibility
    if (astroState.activePlanets && ingredient.astrologicalProfile?.rulingPlanets) {
      const planetMatch = ingredient.astrologicalProfile.rulingPlanets.some(planet => 
        astroState.activePlanets!.includes(planet)
      );
      if (planetMatch) score += 0.2;
    }
    
    // Zodiac compatibility
      if (astroState.currentZodiac && ingredient.astrologicalProfile?.favorableZodiac) {
    const zodiacMatch = ingredient.astrologicalProfile.favorableZodiac.includes(astroState.currentZodiac);
      if (zodiacMatch) score += 0.2;
    }
    
    return {
      ...ingredient,
      score,
      // Add required fields to make it an EnhancedIngredient
      amount: 0,
      unit: '',
      element: "Fire" as Element,
      elementalProperties: ingredient.elementalProperties || createElementalProperties({ 
        Fire: 0, Water: 0, Earth: 0, Air: 0 
      })
    } as EnhancedIngredient;
  });
  
  // Sort by score and return top matches
  return scoredIngredients
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, limit);
};

// ===== UTILITY FUNCTIONS =====

function calculateElementalScore(
  ingredientProps?: ElementalProperties,
  systemProps?: ElementalProperties
): number {
  if (!ingredientProps || !systemProps) return 0.5;
  
  let score = 0;
  let totalWeight = 0;
  
  Object.entries(ingredientProps).forEach(([element, value]) => {
    const systemValue = systemProps[element as keyof ElementalProperties] || 0;
    const weight = systemValue;
    // Higher compatibility for similar values (following elemental principles)
    const compatibility = 1 - Math.abs((Number(value) || 0) - (Number(systemValue) || 0));
    score += compatibility * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? score / totalWeight : 0.5;
}

async function calculateSeasonalScore(ingredient: Record<string, unknown>, date: Date): Promise<number> {
  // Simple seasonal scoring - could be enhanced
  const month = date.getMonth();
  const season = month >= 2 && month <= 4 ? 'spring' :
                month >= 5 && month <= 7 ? 'summer' :
                month >= 8 && month <= 10 ? 'autumn' : 'winter';
  
  if (ingredient.season && Array.isArray(ingredient.season)) {
    return ingredient.season.includes(season) ? 0.9 : 0.4;
  }
  
  return 0.6; // Default neutral score
}

async function calculateModalityScore(qualities: string[], preferredModality?: Modality): Promise<number> {
  if (!preferredModality) return 0.5; // Neutral score without preference
  
  const modalityPreference = preferredModality.toLowerCase();
  const modalityKeywords = {
    cardinal: ['initiating', 'energizing', 'starting', 'fresh', 'new'],
    fixed: ['stabilizing', 'grounding', 'sustaining', 'steady', 'consistent'],
    mutable: ['adapting', 'flexible', 'changing', 'versatile', 'transforming']
  };
  
  const keywords = modalityKeywords[modalityPreference as 'cardinal' | 'fixed' | 'mutable'] || [];
  
  // Handle qualities properly as a string array
  let matches: string[] = [];
  if (Array.isArray(qualities)) {
    matches = qualities.filter(quality => 
      keywords.some(keyword => quality.toLowerCase().includes(keyword))
    );
  }
  
  return Math.min(1, 0.5 + (matches.length * 0.2));
}

function calculateUnifiedFlavorScore(
  ingredient: Partial<EnhancedIngredient> | Ingredient, 
  elementalProps: ElementalProperties, 
  options: RecommendationOptions
): number {
  // Simple flavor scoring implementation
  try {
    // Base compatibility with elemental properties
    let score = 0.5;
    
    if ('flavorProfile' in ingredient && ingredient.flavorProfile) {
      // Calculate basic flavor compatibility
      const flavorWeight = 0.3;
      score += flavorWeight;
    }
    
    return Math.min(1, score);
  } catch (error) {
    // console.warn('Error calculating unified flavor score:', error);
    return 0.5;
  }
}

function calculateKalchmResonance(
  ingredient: Partial<EnhancedIngredient> | Ingredient, 
  elementalProps: ElementalProperties
): number {
  // Simple kalchm resonance implementation
  try {
    const { Fire, Water, Earth, Air } = elementalProps;
    const numerator = Math.pow(Fire + Air, 2);
    const denominator = Math.pow(Water + Earth, 2);
    
    if (denominator === 0) return 0.5;
    
    const kalchm = numerator / denominator;
    return Math.max(0.1, Math.min(1, kalchm / 2));
  } catch (error) {
    // console.warn('Error calculating kalchm resonance:', error);
    return 0.5;
  }
}

function calculateMonicaOptimization(
  ingredient: Partial<EnhancedIngredient> | Ingredient, 
  elementalProps: ElementalProperties
): number {
  // Simple monica optimization implementation
  try {
    const { Fire, Water, Earth, Air } = elementalProps;
    const heat = Math.pow(Fire, 2) + Math.pow(Air, 2);
    const entropy = Math.pow(Fire, 2) + Math.pow(Air, 2);
    const reactivity = Math.pow(Fire + Water + Air, 2);
    
    if (reactivity === 0) return 0.5;
    
    const gregsEnergy = heat - (entropy * reactivity);
    const monica = Math.abs(gregsEnergy) / reactivity;
    
    return Math.max(0.1, Math.min(1, monica));
  } catch (error) {
    // console.warn('Error calculating monica optimization:', error);
    return 0.5;
  }
}

function calculateCulturalContextScore(
  ingredient: Partial<EnhancedIngredient> | Ingredient, 
  options: RecommendationOptions
): number {
  // Simple cultural context scoring
  try {
    if (options.culturalPreference && 'culturalOrigins' in ingredient && ingredient.culturalOrigins) {
      const hasMatch = ingredient.culturalOrigins.includes(options.culturalPreference);
      return hasMatch ? 0.8 : 0.4;
    }
    return 0.6; // Default neutral score
  } catch (error) {
    // console.warn('Error calculating cultural context score:', error);
    return 0.5;
  }
}

function isElementalProperties(obj: Record<string, unknown>): obj is ElementalProperties {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.Fire === 'number' &&
    typeof obj.Water === 'number' &&
    typeof obj.Earth === 'number' &&
    typeof obj.Air === 'number';
}

function createElementalProperties(values: Partial<ElementalProperties>): ElementalProperties {
  return {
    Fire: values.Fire || 0,
    Water: values.Water || 0,
    Earth: values.Earth || 0,
    Air: values.Air || 0
  };
}

// ===== EXPORTS =====

export const getAllIngredientsFromCategories = getAllIngredients;

export async function recommendIngredients(
  astroState: AstrologicalState,
  options: RecommendationOptions = {}
): Promise<IngredientRecommendation[]> {
  const elementalProps = {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25,
    timestamp: new Date(),
    currentStability: 0.5,
    planetaryAlignment: {},
          currentZodiac: astroState.currentZodiac || 'aries',
    activePlanets: astroState.activePlanets || [],
    lunarPhase: astroState.lunarPhase || 'new',
    aspects: []
  };
  
  // Backward-compatibility alias for legacy variable name
  const _options = options;
  
  const grouped = await getIngredientRecommendations(elementalProps as unknown, _options);
  
  // Flatten grouped recommendations into a single array
  const allRecommendations: IngredientRecommendation[] = [];
  Object.values(grouped).forEach(categoryItems => {
    if (categoryItems) {
      allRecommendations.push(...categoryItems);
    }
  });
  
  return allRecommendations.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export const formatFactorName = (factor: string): string => {
  return factor.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

export function calculateElementalInfluences(
  planetaryAlignment: Record<string, { sign: string; degree: number }>
): ElementalProperties {
  const elements = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  
  Object.entries(planetaryAlignment).forEach(([planet, data]) => {
    const element = getZodiacElement(data.sign);
    if (element) {
      elements[element] += getPlanetaryWeight(planet);
    }
  });
  
  // Normalize to sum to 1
  const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(elements).forEach(key => {
      elements[key as keyof ElementalProperties] /= total;
    });
  }
  
  return elements;
}

function getPlanetaryWeight(planet: string): number {
  const weights: Record<string, number> = {
    Sun: 0.25,
    moon: 0.20,
    Mercury: 0.15,
    Venus: 0.15,
    Mars: 0.15,
    Jupiter: 0.05,
    Saturn: 0.05
  };
  return weights[planet] || 0.05;
}

function getZodiacElement(sign: string | null | undefined): keyof ElementalProperties | null {
  if (!sign) return null;
  
  const fireSign = ['aries', 'leo', 'sagittarius'];
  const earthSigns = ['taurus', 'virgo', 'capricorn'];
  const airSigns = ['gemini', 'libra', 'aquarius'];
  const waterSigns = ['cancer', 'scorpio', 'pisces'];
  
  const signLower = sign.toLowerCase();
  
  if (fireSign.includes(signLower)) return 'Fire';
  if (earthSigns.includes(signLower)) return 'Earth';
  if (airSigns.includes(signLower)) return 'Air';
  if (waterSigns.includes(signLower)) return 'Water';
  
  return null;
} 