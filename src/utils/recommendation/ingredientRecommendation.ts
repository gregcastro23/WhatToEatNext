import { AstrologicalState, ElementalProperties, ChakraEnergies, AstrologicalProfile, ElementalAffinity, PlanetName, Element } from "@/types/alchemy";

import type { Modality, Ingredient, SensoryProfile, CookingMethod } from '../../data/ingredients/types';


// Phase 10: Calculation Type Interfaces
interface CalculationData {
  value: number;
  weight?: number;
  score?: number;
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

interface CuisineData {
  id: string;
  name: string;
  zodiacInfluences?: string[];
  planetaryDignities?: Record<string, unknown>;
  elementalState?: ElementalData;
  elementalProperties?: ElementalData;
  modality?: string;
  gregsEnergy?: number;
  [key: string]: unknown;
}

interface NutrientData {
  nutrient?: { name?: string };
  nutrientName?: string;
  name?: string;
  vitaminCount?: number;
  data?: unknown;
  [key: string]: unknown;
}

interface MatchingResult {
  score: number;
  elements: ElementalData;
  recipe?: unknown;
  [key: string]: unknown;
}


// Phase 8: Lazy loading imports for performance optimization
let vegetables: { [key: string]: Record<string, unknown> } = {};
let fruits: { [key: string]: Record<string, unknown> } = {};
let herbs: { [key: string]: Record<string, unknown> } = {};
let spices: { [key: string]: Record<string, unknown> } = {};
let proteins: { [key: string]: Record<string, unknown> } = {};
let grains: { [key: string]: Record<string, unknown> } = {};
let seasonings: { [key: string]: Record<string, unknown> } = {};
let oils: { [key: string]: Record<string, unknown> } = {};
let vinegars: { [key: string]: Record<string, unknown> } = {};

// Lazy loading functions
const loadVegetables = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(vegetables).length === 0) {
    try {
      const module = await import('../../data/ingredients/vegetables');
      vegetables = module.vegetables;
    } catch (error) {
      console.error('Error loading vegetables:', error);
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
      console.error('Error loading fruits:', error);
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
      console.error('Error loading herbs:', error);
    }
  }
  return herbs;
};

const loadSpices = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(spices).length === 0) {
    try {
      const module = await import('../../data/ingredients/spices');
      spices = module.spices;
    } catch (error) {
      console.error('Error loading spices:', error);
    }
  }
  return spices;
};

const loadProteins = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(proteins).length === 0) {
    try {
      const module = await import('../../data/ingredients/proteins');
      proteins = module._proteins;
    } catch (error) {
      console.error('Error loading proteins:', error);
    }
  }
  return proteins;
};

const loadGrains = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(grains).length === 0) {
    try {
      const module = await import('../../data/ingredients/grains');
      grains = module.grains;
    } catch (error) {
      console.error('Error loading grains:', error);
    }
  }
  return grains;
};

const loadSeasonings = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(seasonings).length === 0) {
    try {
      const module = await import('../../data/ingredients/seasonings');
      seasonings = module.seasonings;
    } catch (error) {
      console.error('Error loading seasonings:', error);
    }
  }
  return seasonings;
};

const loadOils = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(oils).length === 0) {
    try {
      const module = await import('../../data/ingredients/oils');
      oils = module.oils;
    } catch (error) {
      console.error('Error loading oils:', error);
    }
  }
  return oils;
};

const loadVinegars = async (): Promise<Record<string, unknown>> => {
  if (Object.keys(vinegars).length === 0) {
    try {
      const module = await import('../../data/ingredients/vinegars');
      vinegars = module.vinegars;
    } catch (error) {
      console.error('Error loading vinegars:', error);
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
  const objRecord = obj as Record<string, unknown>;
  return (
    (typeof objRecord.bitter === 'number' || objRecord.bitter === undefined) &&
    (typeof objRecord.sweet === 'number' || objRecord.sweet === undefined) &&
    (typeof objRecord.sour === 'number' || objRecord.sour === undefined) &&
    (typeof objRecord.salty === 'number' || objRecord.salty === undefined) &&
    (typeof objRecord.umami === 'number' || objRecord.umami === undefined) &&
    (typeof objRecord.spicy === 'number' || objRecord.spicy === undefined)
  );
}

// Safe access to flavor properties
function _getFlavorProperty(obj: unknown, property: keyof FlavorProperties): number {
  if (hasFlavorProperties(obj) && typeof obj[property] === 'number') {
    return obj[property] as number;
  }
  return 0;
}

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
    decanModifiers?: { [key: string]: unknown };
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
  lunarPhaseModifiers?: { [key: string]: unknown };
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

export const loadIngredientCategories = async (categories: string[]): Promise<Record<string, Ingredient>> => {
  const result: Record<string, Ingredient> = {};
  try {
    if (categories.includes("vegetables")) {
      result.vegetables = await loadVegetables() as unknown as Ingredient;
    }
    if (categories.includes("fruits")) {
      result.fruits = await loadFruits() as unknown as Ingredient;
    }
    if (categories.includes("herbs")) {
      result.herbs = await loadHerbs() as unknown as Ingredient;
    }
    if (categories.includes("spices")) {
      result.spices = await loadSpices() as unknown as Ingredient;
    }
    if (categories.includes("proteins")) {
      result.proteins = await loadProteins() as unknown as Ingredient;
    }
    if (categories.includes("grains")) {
      result.grains = await loadGrains() as unknown as Ingredient;
    }
    if (categories.includes("seasonings")) {
      result.seasonings = await loadSeasonings() as unknown as Ingredient;
    }
    if (categories.includes("oils")) {
      result.oils = await loadOils() as unknown as Ingredient;
    }
    if (categories.includes("vinegars")) {
      result.vinegars = await loadVinegars() as unknown as Ingredient;
    }
  } catch (error) {
    console.error('Error loading ingredient categories:', error);
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
      ...(data as Record<string, unknown>)
    } as EnhancedIngredient));
    
    ingredients.push(...categoryIngredients);
    
    if (limit && ingredients.length >= limit) {
      return ingredients.slice(0, limit);
    }
  }
  
  return ingredients;
};

// Phase 8: Cached ingredient data for performance
const cachedAllIngredientsData: Ingredient[] | null = null;
const cacheTimestamp: number = 0;
const CACHE_TTL = 300000; // 5 minutes

export const getAllIngredientsData = async (): Promise<unknown[]> => {
  const allData: Ingredient[] = [];
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
    Object.values(vegData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(fruitData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(herbData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(spiceData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(proteinData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(grainData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(seasoningData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(oilData || {}).forEach(data => allData.push(data as Ingredient));
    Object.values(vinegarData || {}).forEach(data => allData.push(data as Ingredient));

    return allData;
  } catch (error) {
    console.error('Error loading all ingredient data:', error);
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
    .filter(([_, value]) => (value  as Record<string, unknown>).category === 'egg')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  const dairy = Object.entries(proteinsData || {})
    .filter(([_, value]) => (value  as Record<string, unknown>).category === 'dairy')
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
      console.warn(`No data for category: ${category.name}`);
      return;
    }
    
    Object.entries(category.data).forEach(([name, data]) => {
      // Make sure we add the name to the ingredient
      const ingredientData = {
        name,
        category: category.name.toLowerCase(),
        ...(data as Record<string, unknown>)
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
    ing.astrologicalProfile && 
    ((ing.astrologicalProfile.elementalAffinity as unknown as Record<string, unknown>).base) && 
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
      const aValue = a.elementalProperties[astroState.dominantElement as keyof ElementalProperties] || 0;
      const bValue = b.elementalProperties[astroState.dominantElement as keyof ElementalProperties] || 0;
      return bValue - aValue;
    });
  }
  
  return filteredIngredients as unknown as Ingredient[];
}

export async function getIngredientRecommendations(
  _elementalProps: ElementalProperties & {
    timestamp: Date;
    currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number }>;
    currentZodiac: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
  }, 
  _options: RecommendationOptions
): Promise<GroupedIngredientRecommendations> {
  const allIngredients = await getAllIngredients();
  const recommendations: GroupedIngredientRecommendations = {};
  
  // Filter by category if specified
  let filteredIngredients = allIngredients;
  if (_options.category) {
    filteredIngredients = allIngredients.filter(ing => 
      ing.category?.toLowerCase() === _options.category?.toLowerCase()
    );
  }
  
  // Filter by excluded ingredients
  if (_options.excludeIngredients && _options.excludeIngredients.length > 0) {
    filteredIngredients = filteredIngredients.filter(ing => 
      !_options.excludeIngredients?.includes(ing.name)
    );
  }
  
  // Filter by included ingredients only
  if (_options.includeOnly && _options.includeOnly.length > 0) {
    filteredIngredients = filteredIngredients.filter(ing => 
      _options.includeOnly?.includes(ing.name)
    );
  }
  
  // Enhanced scoring with unified flavor system
  const scoredIngredients = await Promise.all(filteredIngredients.map(async (ingredient) => {
    try {
      // Traditional scoring factors
      const elementalScore = calculateElementalScore(ingredient.elementalProperties, _elementalProps);
      const seasonalScore = await calculateSeasonalScore(ingredient as unknown as Ingredient, _elementalProps.timestamp);
      const modalityScore = await calculateModalityScore(ingredient.qualities || [], _options.modalityPreference);
      
      // NEW: Unified flavor compatibility scoring
      const flavorScore = calculateUnifiedFlavorScore(ingredient, _elementalProps, _options);
      
      // NEW: Kalchm resonance scoring
      const kalchmScore = calculateKalchmResonance(ingredient, _elementalProps);
      
      // NEW: Monica optimization scoring
      const monicaScore = calculateMonicaOptimization(ingredient, _elementalProps);
      
      // NEW: Cultural context scoring
      const culturalScore = calculateCulturalContextScore(ingredient, _options);
      
      // Enhanced weighted calculation
      const totalScore = (
        elementalScore * 0.20 +
        seasonalScore * 0.15 +
        modalityScore * 0.10 +
        flavorScore * 0.25 +
        kalchmScore * 0.15 +
        monicaScore * 0.10 +
        culturalScore * 0.05
      );
      
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
        totalScore
      } as IngredientRecommendation;
    } catch (error) {
      console.error('Error calculating scores for ingredient:', ingredient.name, error);
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
  const limit = _options.limit || 10;
  scoredIngredients.slice(0, limit * 2).forEach(ingredient => {
    const category = ingredient.category || 'other';
    if (!recommendations[category]) {
      recommendations[category] = [];
    }
    if ((recommendations[category]?.length ?? 0) < limit) {
      recommendations[category]?.push(ingredient);
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
      const elementValue = ingredient.elementalProperties[astroState.dominantElement] || 0;
      score += elementValue * 0.3;
    }
    
    // Planetary compatibility
    if (astroState.activePlanets && ingredient.astrologicalProfile?.rulingPlanets) {
      const planetMatch = ingredient.astrologicalProfile.rulingPlanets.some(planet => 
        astroState.activePlanets?.includes(planet)
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

async function calculateSeasonalScore(ingredient: Ingredient, date: Date): Promise<number> {
  // Simple seasonal scoring - could be enhanced
  const month = date.getMonth();
  const season = month >= 2 && month <= 4 ? 'spring' :
                month >= 5 && month <= 7 ? 'summer' :
                month >= 8 && month <= 10 ? 'autumn' : 'winter';
  
  const ingredientData = ingredient as unknown as Record<string, unknown>;
  if (ingredientData.season && Array.isArray(ingredientData.season)) {
    return (ingredientData.season as string[]).includes(season) ? 0.9 : 0.4;
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
  _elementalProps: ElementalProperties, 
  _options: RecommendationOptions
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
    console.warn('Error calculating unified flavor score:', error);
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
    console.warn('Error calculating kalchm resonance:', error);
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
    console.warn('Error calculating monica optimization:', error);
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
    console.warn('Error calculating cultural context score:', error);
    return 0.5;
  }
}

function _isElementalProperties(obj: unknown): obj is ElementalProperties {
  return Boolean(obj && 
    typeof obj === 'object' &&
    typeof (obj as Record<string, unknown>).Fire === 'number' &&
    typeof (obj as Record<string, unknown>).Water === 'number' &&
    typeof (obj as Record<string, unknown>).Earth === 'number' &&
    typeof (obj as Record<string, unknown>).Air === 'number');
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
  
  const grouped = await getIngredientRecommendations(elementalProps as unknown as ElementalProperties & {
    timestamp: Date;
    currentStability: number;
    planetaryAlignment: Record<string, { sign: string; degree: number }>;
    currentZodiac: string;
    activePlanets: string[];
    lunarPhase: string;
    aspects: Array<{ aspectType: string; planet1: string; planet2: string }>;
  }, options);
  
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