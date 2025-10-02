/**
 * Database Types - Auto-generated from PostgreSQL Schema
 * Created: September 26, 2025
 *
 * TypeScript type definitions for alchm.kitchen database tables
 * Based on schema in database/init/01-schema.sql
 */

// ==========================================
// ENUM TYPES
// ==========================================

export type UserRole = 'admin' | 'user' | 'guest' | 'service'
export type PlanetType = 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
export type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces'
export type LunarPhase = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent'
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter'
export type CuisineType = 'Italian' | 'French' | 'Chinese' | 'Japanese' | 'Indian' | 'Mexican' | 'Thai' | 'Vietnamese' | 'Korean' | 'Greek' | 'Middle Eastern' | 'American' | 'African' | 'Russian'
export type DietaryRestriction = 'Vegetarian' | 'Vegan' | 'Gluten Free' | 'Dairy Free' | 'Keto' | 'Paleo' | 'Low Carb' | 'Kosher' | 'Halal'
// ==========================================
// USER MANAGEMENT TABLES
// ==========================================

export interface User {
  id: string; // UUID
  email: string,
  password_hash: string,
  roles: UserRole[],
  is_active: boolean,
  email_verified: boolean,
  profile: Record<string, any>; // JSONB
  preferences: Record<string, any>; // JSONB
  created_at: Date,
  updated_at: Date,
  last_login_at?: Date,
  login_count: number;
}

export interface ApiKey {
  id: string; // UUID
  user_id: string; // UUID (references users.id)
  name: string,
  key_hash: string,
  scopes: string[],
  rate_limit_tier: string,
  is_active: boolean,
  expires_at?: Date,
  last_used_at?: Date,
  usage_count: number,
  created_at: Date;
}

// ==========================================
// ALCHEMICAL DATA TABLES
// ==========================================

export interface ElementalProperties {
  id: string; // UUID
  entity_type: 'ingredient' | 'recipe' | 'user_state'
  entity_id: string; // UUID
  fire: number; // DECIMAL(4,3) - 0.000 to 1.000
  water: number; // DECIMAL(4,3) - 0.000 to 1.000
  earth: number; // DECIMAL(4,3) - 0.000 to 1.000
  air: number; // DECIMAL(4,3) - 0.000 to 1.000
  calculation_method?: string,
  confidence_score: number; // DECIMAL(3,2) - 0.00 to 1.00
  created_at: Date,
  updated_at: Date;
}

export interface PlanetaryInfluence {
  id: string; // UUID
  entity_type: string,
  entity_id: string; // UUID
  planet: PlanetType,
  influence_strength: number; // DECIMAL(3,2) - 0.00 to 1.00
  is_primary: boolean,
  created_at: Date;
}

export interface ZodiacAffinity {
  id: string; // UUID
  entity_type: string,
  entity_id: string; // UUID
  zodiac_sign: ZodiacSign,
  affinity_strength: number; // DECIMAL(3,2) - 0.00 to 1.00
  created_at: Date;
}

export interface SeasonalAssociation {
  id: string; // UUID
  entity_type: string,
  entity_id: string; // UUID
  season: Season,
  strength: number; // DECIMAL(3,2) - 0.00 to 1.00
  created_at: Date;
}

// ==========================================
// INGREDIENT TABLES
// ==========================================

export interface Ingredient {
  id: string; // UUID
  name: string,
  common_name?: string,
  scientific_name?: string,
  category: string,
  subcategory?: string,
  description?: string;

  // Nutritional data (per 100g)
  calories?: number; // DECIMAL(6,2)
  protein?: number; // DECIMAL(5,2)
  carbohydrates?: number; // DECIMAL(5,2)
  fat?: number; // DECIMAL(5,2)
  fiber?: number; // DECIMAL(5,2)
  sugar?: number; // DECIMAL(5,2)

  // Flavor profile
  flavor_profile: Record<string, any>; // JSONB
  preparation_methods: string[]; // TEXT[]

  // Metadata
  is_active: boolean,
  data_source?: string,
  confidence_score: number; // DECIMAL(3,2)
  created_at: Date,
  updated_at: Date;
}

export interface IngredientCuisine {
  ingredient_id: string; // UUID (references ingredients.id)
  cuisine: CuisineType,
  usage_frequency: number; // DECIMAL(3,2) - 0.00 to 1.00
}

export interface IngredientCompatibility {
  ingredient_a_id: string; // UUID (references ingredients.id)
  ingredient_b_id: string; // UUID (references ingredients.id)
  compatibility_score: number; // DECIMAL(3,2) - 0.00 to 1.00
  interaction_type: string; // 'synergistic', 'neutral', 'conflicting'
  notes?: string,
  created_at: Date;
}

// ==========================================
// RECIPE TABLES
// ==========================================

export interface Recipe {
  id: string; // UUID
  name: string,
  description?: string,
  cuisine: CuisineType,
  category: string; // 'appetizer', 'main', 'dessert', etc.

  // Instructions and timing
  instructions: Record<string, any>; // JSONB - Array of step objects
  prep_time_minutes: number; // INTEGER >= 0
  cook_time_minutes: number; // INTEGER >= 0
  servings: number; // INTEGER > 0
  difficulty_level: number; // INTEGER 1-5

  // Dietary information
  dietary_tags: DietaryRestriction[]; // ARRAY
  allergens: string[]; // TEXT[]
  nutritional_profile: Record<string, any>; // JSONB

  // Scoring and popularity
  popularity_score: number; // DECIMAL(3,2)
  alchemical_harmony_score: number; // DECIMAL(3,2)
  cultural_authenticity_score: number; // DECIMAL(3,2)
  user_rating: number; // DECIMAL(2,1)
  rating_count: number; // INTEGER

  // Metadata
  author_id?: string; // UUID (references users.id)
  source?: string,
  is_public: boolean,
  is_verified: boolean,
  created_at: Date,
  updated_at: Date;
}

export interface RecipeIngredient {
  id: string; // UUID
  recipe_id: string; // UUID (references recipes.id)
  ingredient_id: string; // UUID (references ingredients.id)
  quantity: number; // DECIMAL(8,3)
  unit: string,
  preparation_notes?: string,
  is_optional: boolean,
  group_name?: string,
  order_index: number;
}

export interface RecipeContext {
  id: string; // UUID
  recipe_id: string; // UUID (references recipes.id)
  recommended_moon_phases: LunarPhase[]; // ARRAY
  recommended_seasons: Season[]; // ARRAY
  time_of_day: string[]; // VARCHAR[] - 'morning', 'afternoon', 'evening', 'late_night'
  occasion: string[]; // VARCHAR[] - 'everyday', 'celebration', 'healing', 'meditation'
  energy_intention?: string; // 'grounding', 'energizing', 'calming', 'balancing'
}

// ==========================================
// CALCULATION AND ANALYTICS TABLES
// ==========================================

export interface CalculationCache {
  id: string; // UUID
  cache_key: string; // UNIQUE
  calculation_type: string,
  input_data: Record<string, any>; // JSONB
  result_data: Record<string, any>; // JSONB
  expires_at: Date,
  hit_count: number,
  created_at: Date,
  last_accessed_at: Date;
}

export interface UserCalculation {
  id: string; // UUID
  user_id: string; // UUID (references users.id)
  calculation_type: string,
  input_data: Record<string, any>; // JSONB
  result_data: Record<string, any>; // JSONB
  execution_time_ms?: number,
  created_at: Date;
}

export interface Recommendation {
  id: string; // UUID
  user_id: string; // UUID (references users.id)
  request_context: Record<string, any>; // JSONB
  recommended_recipes: string[]; // UUID[]
  recipe_scores: Record<string, any>; // JSONB - Array of {recipe_id, score, reasons}
  algorithm_version: string,
  user_feedback?: Record<string, any>; // JSONB - User ratings, selections, etc.
  created_at: Date;
}

export interface SystemMetric {
  id: string; // UUID
  metric_name: string,
  metric_value: number; // DECIMAL(15,4)
  metric_unit?: string,
  tags: Record<string, any>; // JSONB
  timestamp: Date;
}

// ==========================================
// QUERY RESULT TYPES
// ==========================================

export interface ActiveUser extends Pick<User, 'id' | 'email' | 'roles' | 'created_at' | 'last_login_at' | 'login_count'> {}

export interface RecipeSearch extends
  Pick<Recipe, 'id' | 'name' | 'description' | 'cuisine' | 'category' | 'prep_time_minutes' | 'cook_time_minutes' | 'difficulty_level' | 'dietary_tags' | 'popularity_score' | 'user_rating'>,
  Pick<ElementalProperties, 'fire' | 'water' | 'earth' | 'air'> {}

// ==========================================
// UTILITY TYPES
// ==========================================

export type DatabaseTable =
  | 'users'
  | 'api_keys'
  | 'elemental_properties'
  | 'planetary_influences'
  | 'zodiac_affinities'
  | 'seasonal_associations'
  | 'ingredients'
  | 'ingredient_cuisines'
  | 'ingredient_compatibility'
  | 'recipes'
  | 'recipe_ingredients'
  | 'recipe_contexts'
  | 'calculation_cache'
  | 'user_calculations'
  | 'recommendations'
  | 'system_metrics'
export type Insertable<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type Updatable<T> = Partial<Omit<T, 'id' | 'created_at'>> & { updated_at?: Date };

// Common query options
export interface QueryOptions {
  limit?: number,
  offset?: number,
  orderBy?: string,
  orderDirection?: 'ASC' | 'DESC'
}

export interface PaginationResult<T> {
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  totalPages: number,
  hasNext: boolean,
  hasPrevious: boolean;
}
