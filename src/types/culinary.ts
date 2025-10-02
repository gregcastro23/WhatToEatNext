import type { CuisineType } from './alchemy';
import type { PrimaryCuisineType } from './cuisineAliases';

/**
 * Comprehensive CulinaryProfile interface for all ingredients
 * Captures all relevant culinary properties for recommendations and pairing
 */
export interface CulinaryProfile {
  /** Primary flavor characteristics */
  flavorProfile: {
    primary: string,
    secondary: string[],
    intensity: 'mild' | 'moderate' | 'strong'
    umami: number, // 0-1 scale
  }

  /** Texture characteristics */
  texture: {
    raw: string,
    cooked: string,
    mouthfeel: string
  }

  /** Best cooking methods for this ingredient */
  cookingMethods: {
    primary: string[],
    secondary: string[],
    bestResults: string
  }

  /** Cuisine affinities where this ingredient is commonly used */
  cuisineAffinities: {
    primary: CuisineType[],
    secondary: CuisineType[],
    regionalUses: Record<string, string>
  }

  /** Classic ingredient pairings */
  pairings: {
    proteins: string[],
    vegetables: string[],
    herbs: string[],
    dairy: string[],
    acids: string[]
  }

  /** Common culinary uses */
  culinaryUses: {
    primary: string[],
    secondary: string[],
    presentation: string
  }

  /** Seasonal availability */
  seasonality: {
    peak: string[],
    available: string[],
    storage: string
  }

  /** Storage and shelf life information */
  shelfLife: {
    fresh: string,
    frozen: string,
    preserved: string
  }

  /** Possible substitutions */
  substitutions: {
    similar: string[],
    texture: string[],
    flavor: string[]
  }

  /** Additional culinary notes */
  notes: string,

  /** Flavor intensity level */
  intensity: 'mild' | 'moderate' | 'strong'
  /** Allergen information */
  allergenInfo: string,

  /** Regional varieties or preparations */
  regionalVarieties: Record<string, string>,

  /** Preparation tips */
  preparationTips: string[],

  /** Umami score (0-1) */
  umamiScore: number
}

/**
 * Enhanced Cuisine Type System
 * Builds on the existing PrimaryCuisineType with additional categories
 */

/**
 * Continental Cuisine Types
 * Broader geographical categories
 */
export type ContinentalCuisineType =
  | 'Asian'
  | 'European'
  | 'African'
  | 'American'
  | 'Oceanic'
  | 'Middle-Eastern'
  | 'Mediterranean'
/**
 * Regional Cuisine Types
 * Specific regional variations within primary cuisines
 */
export type RegionalCuisineType =
  // Chinese Regional,
  | 'Sichuan'
  | 'Cantonese'
  | 'Shanghai'
  | 'Hunan'
  | 'Northern'
  // Japanese Regional
  | 'Tokyo'
  | 'Osaka'
  | 'Kyoto'
  | 'Hokkaido'
  // Korean Regional
  | 'Seoul'
  | 'Busan'
  | 'Jeju'
  // Indian Regional
  | 'Punjabi'
  | 'Bengali'
  | 'Gujarati'
  | 'Marathi'
  | 'Tamil'
  | 'Telugu'
  | 'Kannada'
  | 'Malayalam'
  | 'Kashmiri'
  | 'Rajasthani'
  | 'Hyderabadi'
  | 'Lucknowi'
  // Thai Regional
  | 'Bangkok'
  | 'Chiangmai'
  | 'SouthernThai'
  | 'Northeastern'
  // Vietnamese Regional
  | 'Hanoi'
  | 'Saigon'
  | 'Hue'
  // Italian Regional
  | 'Tuscan'
  | 'Sicilian'
  | 'Lombard'
  | 'Venetian'
  | 'Roman'
  | 'Neapolitan'
  | 'Piedmontese'
  | 'Ligurian'
  | 'Emilian'
  | 'Sardinian'
  // French Regional
  | 'Provencal'
  | 'Norman'
  | 'Alsatian'
  | 'Lyonnais'
  | 'Bordeaux'
  | 'Burgundian'
  | 'Breton'
  // Spanish Regional
  | 'Catalan'
  | 'Andalusian'
  | 'Basque'
  | 'Galician'
  | 'Valencian'
  | 'Castilian'
  // Mexican Regional
  | 'Yucatecan'
  | 'Oaxacan'
  | 'Poblano'
  | 'Veracruzano'
  | 'Jaliscan'
  | 'Sonoran'
  // American Regional
  | 'Southern'
  | 'NewEngland'
  | 'Californian'
  | 'TexMex'
  | 'Cajun'
  | 'Creole'
  | 'Southwestern'
  | 'Midwestern'
  | 'PacificNorthwest'
  // Middle Eastern Regional
  | 'Lebanese'
  | 'Syrian'
  | 'Jordanian'
  | 'Palestinian'
  | 'Iraqi'
  | 'Iranian'
  | 'Turkish'
  | 'Egyptian'
  | 'Moroccan'
  | 'Tunisian'
  | 'Algerian'
  | 'Libyan'
  // African Regional
  | 'Ethiopian'
  | 'Nigerian'
  | 'Ghanaian'
  | 'Kenyan'
  | 'SouthAfrican'
  // Mediterranean Regional
  | 'Cypriot'
  | 'Maltese'
  // Russian Regional
  | 'Moscow'
  | 'StPetersburg'
  | 'Siberian'
  | 'Caucasian'
  | 'CentralAsian'
/**
 * Fusion Cuisine Types
 * Modern fusion and contemporary cuisine categories
 */
export type FusionCuisineType =
  | 'Asian-Fusion'
  | 'Mediterranean-Fusion'
  | 'Latin-Fusion'
  | 'Modern-American'
  | 'Contemporary-European'
  | 'Global-Fusion'
  | 'Molecular-Gastronomy'
  | 'Farm-to-Table'
  | 'New-American'
  | 'California-Cuisine'
  | 'Pacific-Rim'
  | 'Caribbean-Fusion'
/**
 * Dietary Cuisine Types
 * Cuisine categories based on dietary preferences
 */
export type DietaryCuisineType =
  | 'Vegetarian'
  | 'Vegan'
  | 'Raw-Food'
  | 'Gluten-Free'
  | 'Dairy-Free'
  | 'Low-Carb'
  | 'Keto'
  | 'Paleo'
  | 'Whole30'
  | 'Plant-Based'
  | 'Mediterranean-Diet'
  | 'DASH-Diet'
/**
 * Historical Cuisine Types
 * Cuisine categories based on historical periods
 */
export type HistoricalCuisineType =
  | 'Ancient-Roman'
  | 'Medieval-European'
  | 'Renaissance-Italian'
  | 'Victorian-English'
  | 'Colonial-American'
  | 'Ancient-Chinese'
  | 'Classical-Greek'
  | 'Ancient-Egyptian'
  | 'Moorish-Spanish'
  | 'Ottoman-Turkish'
/**
 * Street Food Cuisine Types
 * Street food and casual dining categories
 */
export type StreetFoodCuisineType =
  | 'Street-Food-Asian'
  | 'Street-Food-Mexican'
  | 'Street-Food-Indian'
  | 'Street-Food-Middle-Eastern'
  | 'Street-Food-American'
  | 'Street-Food-European'
  | 'Food-Truck'
  | 'Fast-Casual'
  | 'Comfort-Food'
  | 'Pub-Food'
  | 'Diner-Food'
  | 'Barbecue'
/**
 * Complete Cuisine Type Union
 * All possible cuisine types in the system
 */
export type CompleteCuisineType =
  | PrimaryCuisineType
  | ContinentalCuisineType
  | RegionalCuisineType
  | FusionCuisineType
  | DietaryCuisineType
  | HistoricalCuisineType
  | StreetFoodCuisineType,

/**
 * Cuisine Category Mapping
 * Maps cuisine types to their broader categories
 */
export const _CUISINE_CATEGORY_MAP: Record<CompleteCuisineType, string> = {
  // Primary Cuisine Types
  Chinese: 'Asian',
  Japanese: 'Asian',
  Korean: 'Asian',
  Indian: 'Asian',
  Thai: 'Asian',
  Vietnamese: 'Asian',
  Italian: 'European',
  French: 'European',
  Greek: 'Mediterranean',
  Spanish: 'European',
  Mexican: 'American',
  American: 'American',
  African: 'African',
  'Middle-Eastern': 'Middle-Eastern',
  Mediterranean: 'Mediterranean',
  Russian: 'European',
  Fusion: 'Fusion',

  // Continental Types
  Asian: 'Asian',
  European: 'European',
  Oceanic: 'Oceanic',

  // Regional Types (mapped to their primary cuisines)
  Sichuan: 'Chinese',
  Cantonese: 'Chinese',
  Shanghai: 'Chinese',
  Hunan: 'Chinese',
  Northern: 'Chinese',
  Tokyo: 'Japanese',
  Osaka: 'Japanese',
  Kyoto: 'Japanese',
  Hokkaido: 'Japanese',
  Seoul: 'Korean',
  Busan: 'Korean',
  Jeju: 'Korean',
  Punjabi: 'Indian',
  Bengali: 'Indian',
  Gujarati: 'Indian',
  Marathi: 'Indian',
  Tamil: 'Indian',
  Telugu: 'Indian',
  Kannada: 'Indian',
  Malayalam: 'Indian',
  Kashmiri: 'Indian',
  Rajasthani: 'Indian',
  Hyderabadi: 'Indian',
  Lucknowi: 'Indian',
  Bangkok: 'Thai',
  Chiangmai: 'Thai',
  SouthernThai: 'Thai',
  Northeastern: 'Thai',
  Hanoi: 'Vietnamese',
  Saigon: 'Vietnamese',
  Hue: 'Vietnamese',
  Tuscan: 'Italian',
  Sicilian: 'Italian',
  Lombard: 'Italian',
  Venetian: 'Italian',
  Roman: 'Italian',
  Neapolitan: 'Italian',
  Piedmontese: 'Italian',
  Ligurian: 'Italian',
  Emilian: 'Italian',
  Sardinian: 'Italian',
  Provencal: 'French',
  Norman: 'French',
  Alsatian: 'French',
  Lyonnais: 'French',
  Bordeaux: 'French',
  Burgundian: 'French',
  Breton: 'French',
  Catalan: 'Spanish',
  Andalusian: 'Spanish',
  Basque: 'Spanish',
  Galician: 'Spanish',
  Valencian: 'Spanish',
  Castilian: 'Spanish',
  Yucatecan: 'Mexican',
  Oaxacan: 'Mexican',
  Poblano: 'Mexican',
  Veracruzano: 'Mexican',
  Jaliscan: 'Mexican',
  Sonoran: 'Mexican',
  Southern: 'American',
  NewEngland: 'American',
  Californian: 'American',
  TexMex: 'American',
  Cajun: 'American',
  Creole: 'American',
  Southwestern: 'American',
  Midwestern: 'American',
  PacificNorthwest: 'American',
  Lebanese: 'Middle-Eastern',
  Syrian: 'Middle-Eastern',
  Jordanian: 'Middle-Eastern',
  Palestinian: 'Middle-Eastern',
  Iraqi: 'Middle-Eastern',
  Iranian: 'Middle-Eastern',
  Turkish: 'Middle-Eastern',
  Egyptian: 'Middle-Eastern',
  Moroccan: 'Middle-Eastern',
  Tunisian: 'Middle-Eastern',
  Algerian: 'Middle-Eastern',
  Libyan: 'Middle-Eastern',
  Ethiopian: 'African',
  Nigerian: 'African',
  Ghanaian: 'African',
  Kenyan: 'African',
  SouthAfrican: 'African',
  Cypriot: 'Mediterranean',
  Maltese: 'Mediterranean',
  Moscow: 'Russian',
  StPetersburg: 'Russian',
  Siberian: 'Russian',
  Caucasian: 'Russian',
  CentralAsian: 'Russian',

  // Fusion Types
  'Asian-Fusion': 'Fusion',
  'Mediterranean-Fusion': 'Fusion',
  'Latin-Fusion': 'Fusion',
  'Modern-American': 'Fusion',
  'Contemporary-European': 'Fusion',
  'Global-Fusion': 'Fusion',
  'Molecular-Gastronomy': 'Fusion',
  'Farm-to-Table': 'Fusion',
  'New-American': 'Fusion',
  'California-Cuisine': 'Fusion',
  'Pacific-Rim': 'Fusion',
  'Caribbean-Fusion': 'Fusion',

  // Dietary Types
  Vegetarian: 'Dietary',
  Vegan: 'Dietary',
  'Raw-Food': 'Dietary',
  'Gluten-Free': 'Dietary',
  'Dairy-Free': 'Dietary',
  'Low-Carb': 'Dietary',
  Keto: 'Dietary',
  Paleo: 'Dietary',
  Whole30: 'Dietary',
  'Plant-Based': 'Dietary',
  'Mediterranean-Diet': 'Dietary',
  'DASH-Diet': 'Dietary',

  // Historical Types
  'Ancient-Roman': 'Historical',
  'Medieval-European': 'Historical',
  'Renaissance-Italian': 'Historical',
  'Victorian-English': 'Historical',
  'Colonial-American': 'Historical',
  'Ancient-Chinese': 'Historical',
  'Classical-Greek': 'Historical',
  'Ancient-Egyptian': 'Historical',
  'Moorish-Spanish': 'Historical',
  'Ottoman-Turkish': 'Historical',

  // Street Food Types
  'Street-Food-Asian': 'Street-Food',
  'Street-Food-Mexican': 'Street-Food',
  'Street-Food-Indian': 'Street-Food',
  'Street-Food-Middle-Eastern': 'Street-Food',
  'Street-Food-American': 'Street-Food',
  'Street-Food-European': 'Street-Food',
  'Food-Truck': 'Street-Food',
  'Fast-Casual': 'Street-Food',
  'Comfort-Food': 'Street-Food',
  'Pub-Food': 'Street-Food',
  'Diner-Food': 'Street-Food',
  Barbecue: 'Street-Food'
}

/**
 * Master type for ingredient categories
 * Uses PascalCase per project conventions
 */
export type IngredientCategory =
  | 'Vegetable'
  | 'Fruit'
  | 'Grain'
  | 'Protein'
  | 'Dairy'
  | 'Spice'
  | 'Herb'
  | 'Seasoning'
  | 'Oil'
  | 'Vinegar'
  | 'Other'
/**
 * Subcategory types for better type safety
 */
export type FruitSubCategory =
  | 'Berry'
  | 'Citrus'
  | 'Pome'
  | 'Stone'
  | 'Melon'
  | 'Tropical'
  | 'Other'
export type VegetableSubCategory =
  | 'Root'
  | 'Starchy'
  | 'Leafy'
  | 'Nightshade'
  | 'Legume'
  | 'Cruciferous'
  | 'Allium'
  | 'Other'
export type ProteinSubCategory =
  | 'Poultry'
  | 'Seafood'
  | 'Meat'
  | 'Legume'
  | 'PlantBased'
  | 'Egg'
  | 'Other'
export type GrainSubCategory = 'Whole' | 'Refined' | 'Ancient' | 'Pseudo' | 'Other'
export type DairySubCategory = 'Milk' | 'Cheese' | 'Yogurt' | 'Butter' | 'Cream' | 'Other'
export type SpiceSubCategory = 'Warm' | 'Hot' | 'Sweet' | 'Aromatic' | 'Ground' | 'Whole' | 'Other'
export type HerbSubCategory = 'Fresh' | 'Dried' | 'Medicinal' | 'Culinary' | 'Other'
export type SeasoningSubCategory = 'Salt' | 'Pepper' | 'Aromatic' | 'Blend' | 'Other'
export type OilSubCategory = 'Cooking' | 'Finishing' | 'Infused' | 'Essential' | 'Other'
export type VinegarSubCategory = 'Wine' | 'Fruit' | 'Grain' | 'Specialty' | 'Other'
/**
 * Union type for all subcategories
 */
export type IngredientSubCategory =
  | FruitSubCategory,
  | VegetableSubCategory
  | ProteinSubCategory
  | GrainSubCategory
  | DairySubCategory
  | SpiceSubCategory
  | HerbSubCategory
  | SeasoningSubCategory
  | OilSubCategory
  | VinegarSubCategory
  | string; // Fallback for any other subcategories

/**
 * Enhanced ingredient interface with new culinary profile
 */
export interface EnhancedIngredient {
  name: string,
  category: IngredientCategory,
  subCategory?: IngredientSubCategory,
  culinaryProfile: CulinaryProfile,
  // ... other existing properties
}

/**
 * Cuisine compatibility scoring interface
 */
export interface CuisineCompatibility {
  cuisine: CompleteCuisineType,
  score: number, // 0-1 scale,
  factors: string[],
  ingredientMatches: string[],
  regionalVariations: string[]
}

/**
 * Cuisine pairing recommendations
 */
export interface CuisinePairing {
  primary: CompleteCuisineType,
  secondary: CompleteCuisineType,
  compatibility: number, // 0-1 scale,
  commonIngredients: string[],
  fusionOpportunities: string[],
  culturalNotes: string
}

// ========== MISSING TYPE EXPORTS ==========,

/**
 * Cuisine Type - Primary Export
 * Used by components for cuisine selection and filtering
 */
export type Cuisine = CompleteCuisineType,

/**
 * Cooking Method Types
 * Comprehensive cooking methods for recipe classification
 */
export type CookingMethodType =
  | 'grilling'
  | 'roasting'
  | 'baking'
  | 'braising'
  | 'steaming'
  | 'sautéing'
  | 'frying'
  | 'poaching'
  | 'stewing'
  | 'smoking'
  | 'sous-vide'
  | 'blanching'
  | 'broiling'
  | 'slow-cooking'
  | 'pressure-cooking'
  | 'fermenting'
  | 'curing'
  | 'pickling'
  | 'dehydrating'
  | 'caramelizing'
  | 'flambéing'
  | 'confit'
  | 'emulsifying'
  | 'tempering'
  | 'marinating'
  | 'brining'
/**
 * Flavor Intensity Levels
 * Used for matching flavors to user preferences
 */
export type FlavorIntensity = 'mild' | 'moderate' | 'strong' | 'intense'
/**
 * Dietary Classification Types
 * Used for dietary restriction filtering
 */
export type DietaryClassification =
  | 'omnivore'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'flexitarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'low-carb'
  | 'keto'
  | 'paleo'
  | 'whole30'
  | 'raw-food'
  | 'halal'
  | 'kosher'
/**
 * Recipe Difficulty Levels
 * Used for skill-based recipe filtering
 */
export type RecipeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert'
/**
 * Meal Type Categories
 * Used for time-based recipe recommendations
 */
export type MealType =
  | 'breakfast'
  | 'brunch'
  | 'lunch'
  | 'dinner'
  | 'snack'
  | 'appetizer'
  | 'dessert'
  | 'beverage'
  | 'late-night'
/**
 * Course Type Categories
 * Used for menu planning and recipe organization
 */
export type CourseType =
  | 'amuse-bouche'
  | 'appetizer'
  | 'soup'
  | 'salad'
  | 'main-course'
  | 'side-dish'
  | 'palate-cleanser'
  | 'dessert'
  | 'mignardises'
  | 'cheese-course'
  | 'digestif'
/**
 * Dish Type Categories
 * Used for recipe classification and searching
 */
export type DishType =
  | 'soup'
  | 'salad'
  | 'sandwich'
  | 'pasta'
  | 'pizza'
  | 'stir-fry'
  | 'casserole'
  | 'curry'
  | 'stew'
  | 'roast'
  | 'grill'
  | 'bake'
  | 'noodles'
  | 'rice-dish'
  | 'bread'
  | 'cake'
  | 'pie'
  | 'smoothie'
  | 'cocktail'
  | 'marinade'
  | 'sauce'
  | 'dressing'
  | 'dip'
// Re-export CuisineType from cuisineAliases for backwards compatibility
export type { PrimaryCuisineType as CuisineType } from './cuisineAliases';
