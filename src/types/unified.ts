/**
 * Unified Type Definitions
 *
 * Comprehensive type definitions to resolve missing types and
 * provide consistent interfaces across the application.
 */

// Import and re-export commonly used types from other modules
import type {
  ElementalProperties,
  AlchemicalProperties,
  ZodiacSign,
  Element,
  AstrologicalState,
  StandardizedAlchemicalResult,
  Season,
  LunarPhase,
  AlchemicalResult,
} from '@/types/alchemy';
import type { CookingMethod } from '@/types/cooking';

// Re-export for convenience
export type {
  ElementalProperties,
  AlchemicalProperties,
  ZodiacSign,
  Element,
  AstrologicalState,
  StandardizedAlchemicalResult,
  Season,
  LunarPhase,
  AlchemicalResult,
  CookingMethod,
};

// Ingredient types - Unified interface consolidating all ingredient definitions
export interface Ingredient {
  id?: string;
  name: string;
  category: string;
  subCategory?: string;

  // Core properties
  elementalProperties: ElementalProperties;
  astrologicalProfile?: AstrologicalProfile;
  nutritionalData?: NutritionalData;
  description?: string;
  aliases?: string[];

  // Additional properties from various interfaces
  qualities?: string[];
  storage?:
    | string
    | {
        container?: string;
        duration: string;
        temperature?: string;
        humidity?: string;
        light?: string;
      };

  // Preparation and usage
  preparationMethods?: string[];
  cookingMethods?: string[];
  preparationNotes?: string;

  // Seasonality and origins
  seasonality?: Season[];
  regionalOrigins?: string[];
  availability?: string[];

  // Flavor and culinary properties
  flavorProfile?: {
    spicy?: number;
    sweet?: number;
    sour?: number;
    bitter?: number;
    salty?: number;
    umami?: number;
  };

  // Astrological properties
  zodiacInfluences?: any[];
  planetaryInfluences?: string[];
  lunarPhaseInfluences?: LunarPhase[];

  // Alchemical properties
  alchemicalProperties?: AlchemicalResult;
  affinities?: string[];

  // Metadata
  source?: string;
  validationStatus?: 'validated' | 'pending' | 'error';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UnifiedIngredient extends Ingredient {
  unifiedId: string;
  mappings: IngredientMapping[];
  validationStatus: 'validated' | 'pending' | 'error';
  sources: string[];
  lastUpdated: Date;
}

export interface IngredientMapping {
  sourceId: string;
  sourceName: string;
  confidence: number;
  mappingType: 'exact' | 'similar' | 'category';
}

// Astrological profile types
export interface AstrologicalProfile {
  rulingPlanet?: string;
  zodiacAffinity?: any[];
  elementalAlignment: ElementalProperties;
  planetaryCorrespondences?: Record<string, number>;
  seasonalPreferences?: SeasonalPreferences;
}

export interface SeasonalPreferences {
  spring: number;
  summer: number;
  autumn: number;
  winter: number;
}

// Nutritional data types
export interface NutritionalData {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  servingSize?: string;
  servingUnit?: string;
}

// Planet position types (unified)
export interface PlanetPosition {
  sign: any;
  degree: number;
  minute?: number;
  exactLongitude: number;
  isRetrograde?: boolean;
  error?: boolean;
}

export interface PlanetaryPosition {
  sign: any;
  degree: number;
  minute: number;
  isRetrograde: boolean;
}

// Search filter types (for advanced search functionality)
export interface SearchFilters {
  query: string;
  dietaryRestrictions: string[];
  difficultyLevel: string[];
  cookingTime: {
    min: number;
    max: number;
  };
  cuisineTypes: string[];
  mealTypes: string[];
  spiciness: string[];
  ingredients: string[];
}

export interface FilterChip {
  id: string;
  label: string;
  category: string;
  value: string | number;
  removable: boolean;
}

// Cooking method types (extended)
export interface CookingMethodExtended {
  id: string;
  name: string;
  description: string;
  elementalEffect: ElementalProperties;
  thermodynamicProperties?: ThermodynamicProperties;
  astrologicalInfluences?: AstrologicalInfluences;
  duration?: TimeRange;
  temperature?: TemperatureRange;
  suitable_for?: string[];
  benefits?: string[];
  variations?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  equipment?: string[];
}

export interface TimeRange {
  min: number;
  max: number;
  unit: 'minutes' | 'hours';
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: 'celsius' | 'fahrenheit';
}

export interface ThermodynamicProperties {
  heat: number;
  entropy: number;
  reactivity: number;
  gregsEnergy: number;
}

export interface AstrologicalInfluences {
  favorableZodiac?: any[];
  favorablePlanets?: string[];
  lunarPhasePreference?: string[];
  seasonalAlignment?: SeasonalPreferences;
}

// Recipe types - Unified interface consolidating all recipe definitions
export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cookingMethod: string;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  totalTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  tags?: string[];

  // Standardized elemental properties (not elementalBalance)
  elementalProperties: ElementalProperties;

  // Astrological and thermodynamic properties
  astrologicalTiming?: AstrologicalTiming;
  thermodynamicProperties?: ThermodynamicProperties;

  // Nutritional information
  nutritionalInfo?: NutritionalData;

  // Additional properties from various interfaces
  season?: Season[];
  seasonality?: Season | 'all' | Season[];
  mealType?: string[];
  source?: string;
  category?: string;

  // Compatibility properties
  monicaCompatibility?: number;
  alchemicalScore?: number;

  // Optional metadata
  createdAt?: Date;
  updatedAt?: Date;
  validationStatus?: 'validated' | 'pending' | 'error';
}

export interface RecipeIngredient {
  id?: string;
  ingredientId?: string;
  name: string;
  amount: number; // Standardized to 'amount' not 'quantity'
  unit: string;
  preparation?: string;
  optional?: boolean;
  substitutes?: string[];

  // Additional properties from various interfaces
  category?: string;
  notes?: string;
  function?: string;
  cookingPoint?: string;
  timing?: 'early' | 'middle' | 'late';

  // Elemental and astrological properties
  elementalProperties?: ElementalProperties;
  zodiacInfluences?: any[];
  planetaryInfluences?: string[];
  lunarPhaseInfluences?: LunarPhase[];

  // Nutritional data
  nutritionalContent?: NutritionalData;

  // Seasonal and regional data
  seasonality?: string[];
  regionalOrigins?: string[];
}

export interface AstrologicalTiming {
  optimalLunarPhase?: string[];
  favorableZodiac?: any[];
  seasonalPreference?: string[];
  planetaryHours?: string[];
  zodiacCompatibility?: Record<ZodiacSign, number>;
  lunarPhaseCompatibility?: Record<string, number>;
}

// Recommendation types
export interface RecommendationRequest {
  userPreferences?: ElementalProperties;
  astrologicalState?: AstrologicalState;
  dietaryRestrictions?: string[];
  cuisinePreferences?: string[];
  availableIngredients?: string[];
  cookingMethods?: string[];
  timeConstraints?: TimeConstraints;
  nutritionalGoals?: NutritionalGoals;
}

export interface TimeConstraints {
  maxPrepTime?: number;
  maxCookTime?: number;
  maxTotalTime?: number;
}

export interface NutritionalGoals {
  maxCalories?: number;
  minProtein?: number;
  maxCarbs?: number;
  maxFat?: number;
  requiredVitamins?: string[];
  requiredMinerals?: string[];
}

export interface RecommendationResult {
  recipes: Recipe[];
  ingredients: Ingredient[];
  cookingMethods: CookingMethodExtended[];
  score: number;
  reasoning: string[];
  astrologicalAlignment: number;
  elementalHarmony: number;
  nutritionalFit: number;
  culturalRelevance: number;
}

// Validation types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

// Search and filter types
export interface SearchCriteria {
  query?: string;
  filters?: SearchFilters;
  sorting?: SortingOptions;
  pagination?: PaginationOptions;
}

// SearchFilters interface moved above - keeping unified structure

export interface NutritionalRange {
  calories?: { min?: number; max?: number };
  protein?: { min?: number; max?: number };
  carbs?: { min?: number; max?: number };
  fat?: { min?: number; max?: number };
}

export interface SortingOptions {
  field: string;
  direction: 'asc' | 'desc';
  secondary?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets?: SearchFacets;
}

export interface SearchFacets {
  categories: FacetCount[];
  elements: FacetCount[];
  cuisines: FacetCount[];
  difficulty: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
  selected?: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type NumberKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

// Default values and constants
export const DEFAULT_ELEMENTAL_PROPERTIES: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

export const DEFAULT_NUTRITIONAL_DATA: NutritionalData = {
  calories: 0,
  protein: 0,
  carbohydrates: 0,
  fat: 0,
  fiber: 0,
  vitamins: {},
  minerals: {},
  servingSize: '1',
  servingUnit: 'serving',
};

export const DEFAULT_TIME_RANGE: TimeRange = {
  min: 0,
  max: 60,
  unit: 'minutes',
};

export const DEFAULT_TEMPERATURE_RANGE: TemperatureRange = {
  min: 20,
  max: 200,
  unit: 'celsius',
};

// Type guards
export const isIngredient = (value: unknown): value is Ingredient => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'elementalProperties' in value
  );
};

export const isRecipe = (value: unknown): value is Recipe => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'ingredients' in value &&
    'instructions' in value
  );
};

export const isCookingMethodExtended = (value: unknown): value is CookingMethodExtended => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'elementalEffect' in value
  );
};

export default {
  DEFAULT_ELEMENTAL_PROPERTIES,
  DEFAULT_NUTRITIONAL_DATA,
  DEFAULT_TIME_RANGE,
  DEFAULT_TEMPERATURE_RANGE,
  isIngredient,
  isRecipe,
  isCookingMethodExtended,
};
