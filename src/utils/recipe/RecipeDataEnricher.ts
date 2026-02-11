/**
 * RecipeDataEnricher - Intelligent Recipe Data Enrichment System
 *
 * This module provides sophisticated algorithms for enriching recipe data with:
 * - Authentic elemental properties calculated from ingredients and cooking methods
 * - Planetary influences based on recipe characteristics
 * - Seasonal alignment from ingredient analysis
 * - Flavor profiles with multi-dimensional taste analysis
 * - Nutritional estimates based on ingredient categories
 * - Meal type determination
 *
 * @file src/utils/recipe/RecipeDataEnricher.ts
 * @created 2026-01-29
 */

import type {
  ElementalProperties,
  Recipe,
  RecipeIngredient,
} from "@/types/recipe";
import { COOKING_METHOD_MODIFIERS } from "@/utils/hierarchicalRecipeCalculations";
import { createLogger } from "../logger";

const logger = createLogger("RecipeDataEnricher");

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface EnrichmentResult {
  elementalProperties: ElementalProperties;
  planetaryInfluences: string[];
  seasonalAlignment: string[];
  flavorProfile: FlavorProfile;
  nutritionEstimate: NutritionEstimate;
  mealTypes: string[];
  enrichmentMetadata: EnrichmentMetadata;
}

export interface FlavorProfile {
  primary: string[];
  accent: string[];
  tasteBalance: {
    sweet: number;
    savory: number;
    spicy: number;
    sour: number;
    bitter: number;
    umami: number;
  };
}

export interface NutritionEstimate {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: "low" | "medium" | "high";
}

export interface EnrichmentMetadata {
  enrichedAt: string;
  version: string;
  ingredientCount: number;
  cookingMethodCount: number;
  confidenceScore: number;
}

// ============================================================================
// Ingredient Elemental Mappings
// ============================================================================

/**
 * Comprehensive ingredient-to-element mapping based on culinary alchemy principles
 * Each ingredient category has primary and secondary elemental associations
 */
const INGREDIENT_ELEMENTAL_MAP: Record<
  string,
  { Fire: number; Water: number; Earth: number; Air: number }
> = {
  // Spicy/Hot ingredients - Fire dominant
  chili: { Fire: 0.7, Water: 0.0, Earth: 0.1, Air: 0.2 },
  pepper: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
  cayenne: { Fire: 0.8, Water: 0.0, Earth: 0.1, Air: 0.1 },
  jalapeno: { Fire: 0.65, Water: 0.1, Earth: 0.15, Air: 0.1 },
  sriracha: { Fire: 0.7, Water: 0.1, Earth: 0.1, Air: 0.1 },
  ginger: { Fire: 0.5, Water: 0.2, Earth: 0.2, Air: 0.1 },
  garlic: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
  onion: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
  mustard: { Fire: 0.55, Water: 0.1, Earth: 0.25, Air: 0.1 },
  horseradish: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
  wasabi: { Fire: 0.65, Water: 0.1, Earth: 0.15, Air: 0.1 },
  curry: { Fire: 0.55, Water: 0.1, Earth: 0.25, Air: 0.1 },
  paprika: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },
  cinnamon: { Fire: 0.45, Water: 0.1, Earth: 0.35, Air: 0.1 },
  clove: { Fire: 0.5, Water: 0.1, Earth: 0.3, Air: 0.1 },

  // Watery/Hydrating ingredients - Water dominant
  water: { Fire: 0.0, Water: 0.9, Earth: 0.0, Air: 0.1 },
  broth: { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
  stock: { Fire: 0.1, Water: 0.7, Earth: 0.1, Air: 0.1 },
  milk: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  cream: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  yogurt: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  coconut_milk: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  "coconut milk": { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  cucumber: { Fire: 0.0, Water: 0.7, Earth: 0.2, Air: 0.1 },
  watermelon: { Fire: 0.0, Water: 0.8, Earth: 0.1, Air: 0.1 },
  melon: { Fire: 0.0, Water: 0.7, Earth: 0.2, Air: 0.1 },
  lettuce: { Fire: 0.0, Water: 0.6, Earth: 0.2, Air: 0.2 },
  celery: { Fire: 0.0, Water: 0.6, Earth: 0.2, Air: 0.2 },
  zucchini: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
  tomato: { Fire: 0.3, Water: 0.5, Earth: 0.1, Air: 0.1 },
  wine: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  sake: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  vinegar: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  lemon: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  lime: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  orange: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  fish: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  seafood: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  shrimp: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  squid: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  clam: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  mussel: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  oyster: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  crab: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },
  lobster: { Fire: 0.1, Water: 0.6, Earth: 0.2, Air: 0.1 },

  // Grounding/Heavy ingredients - Earth dominant
  potato: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  rice: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
  bread: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  pasta: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  noodle: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  flour: { Fire: 0.1, Water: 0.1, Earth: 0.6, Air: 0.2 },
  wheat: { Fire: 0.1, Water: 0.1, Earth: 0.6, Air: 0.2 },
  oat: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  quinoa: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
  barley: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  corn: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  bean: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  lentil: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  chickpea: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  mushroom: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
  root: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  carrot: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  beet: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  turnip: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  parsnip: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  "sweet potato": { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  yam: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  cheese: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  beef: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  pork: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  lamb: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  meat: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  tofu: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
  tempeh: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
  nut: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  almond: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  walnut: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  cashew: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  peanut: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  seed: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  sesame: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  egg: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  butter: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },

  // Light/Aromatic ingredients - Air dominant
  herb: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
  basil: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  mint: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  cilantro: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
  parsley: { Fire: 0.1, Water: 0.2, Earth: 0.2, Air: 0.5 },
  dill: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  thyme: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  rosemary: { Fire: 0.3, Water: 0.1, Earth: 0.1, Air: 0.5 },
  oregano: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  sage: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  bay: { Fire: 0.2, Water: 0.1, Earth: 0.2, Air: 0.5 },
  lemongrass: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  kaffir: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  "green onion": { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  scallion: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  leek: { Fire: 0.2, Water: 0.2, Earth: 0.3, Air: 0.3 },
  shallot: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
  sprout: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  spinach: { Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.4 },
  arugula: { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 },
  kale: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  cabbage: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  broccoli: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  cauliflower: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  asparagus: { Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.4 },
  pea: { Fire: 0.1, Water: 0.2, Earth: 0.3, Air: 0.4 },

  // Proteins with specific profiles
  chicken: { Fire: 0.25, Water: 0.25, Earth: 0.35, Air: 0.15 },
  turkey: { Fire: 0.2, Water: 0.25, Earth: 0.4, Air: 0.15 },
  duck: { Fire: 0.3, Water: 0.25, Earth: 0.35, Air: 0.1 },
  salmon: { Fire: 0.15, Water: 0.5, Earth: 0.25, Air: 0.1 },
  tuna: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  cod: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },
  tilapia: { Fire: 0.1, Water: 0.55, Earth: 0.25, Air: 0.1 },

  // Oils and fats
  oil: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  "olive oil": { Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2 },
  "sesame oil": { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  "coconut oil": { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
  ghee: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },
  lard: { Fire: 0.35, Water: 0.15, Earth: 0.4, Air: 0.1 },

  // Sweeteners
  sugar: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
  honey: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
  maple: { Fire: 0.25, Water: 0.25, Earth: 0.4, Air: 0.1 },
  molasses: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },

  // Sauces and condiments
  "soy sauce": { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
  "fish sauce": { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  miso: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  tahini: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  hummus: { Fire: 0.15, Water: 0.2, Earth: 0.5, Air: 0.15 },
};

// ============================================================================
// Cuisine Elemental Modifiers
// ============================================================================

/**
 * Cuisine-based elemental adjustments
 * These modifiers enhance certain elements based on cuisine characteristics
 */
const CUISINE_ELEMENTAL_MODIFIERS: Record<
  string,
  { Fire: number; Water: number; Earth: number; Air: number }
> = {
  thai: { Fire: 1.3, Water: 1.0, Earth: 0.9, Air: 1.1 },
  indian: { Fire: 1.3, Water: 0.9, Earth: 1.1, Air: 1.0 },
  mexican: { Fire: 1.25, Water: 0.9, Earth: 1.1, Air: 0.95 },
  korean: { Fire: 1.2, Water: 1.0, Earth: 1.0, Air: 1.0 },
  japanese: { Fire: 0.9, Water: 1.3, Earth: 1.0, Air: 1.0 },
  chinese: { Fire: 1.1, Water: 1.1, Earth: 1.0, Air: 0.95 },
  vietnamese: { Fire: 1.0, Water: 1.2, Earth: 0.9, Air: 1.1 },
  italian: { Fire: 1.0, Water: 1.0, Earth: 1.2, Air: 1.0 },
  french: { Fire: 0.95, Water: 1.1, Earth: 1.2, Air: 0.95 },
  greek: { Fire: 1.0, Water: 1.0, Earth: 1.1, Air: 1.1 },
  "middle-eastern": { Fire: 1.15, Water: 0.9, Earth: 1.1, Air: 1.05 },
  american: { Fire: 1.1, Water: 0.95, Earth: 1.15, Air: 0.95 },
  russian: { Fire: 0.9, Water: 1.0, Earth: 1.3, Air: 0.9 },
  african: { Fire: 1.2, Water: 0.9, Earth: 1.1, Air: 1.0 },
};

// ============================================================================
// Planetary Influence Mappings
// ============================================================================

/**
 * Recipe characteristics mapped to planetary influences
 */
const PLANETARY_CHARACTERISTICS: Record<
  string,
  { keywords: string[]; characteristics: string[] }
> = {
  Sun: {
    keywords: [
      "bright",
      "vital",
      "energizing",
      "golden",
      "citrus",
      "saffron",
      "honey",
    ],
    characteristics: [
      "breakfast",
      "energizing",
      "vitality",
      "warm",
      "golden color",
    ],
  },
  Moon: {
    keywords: [
      "comfort",
      "nurturing",
      "mild",
      "soft",
      "cream",
      "milk",
      "dairy",
      "soup",
      "porridge",
    ],
    characteristics: [
      "comfort food",
      "soothing",
      "hydrating",
      "emotional",
      "nighttime",
    ],
  },
  Mercury: {
    keywords: ["quick", "light", "varied", "diverse", "snack", "appetizer"],
    characteristics: [
      "quick meals",
      "diverse ingredients",
      "appetizers",
      "finger food",
    ],
  },
  Venus: {
    keywords: [
      "elegant",
      "sweet",
      "beautiful",
      "dessert",
      "romantic",
      "chocolate",
      "fruit",
    ],
    characteristics: [
      "elegant presentation",
      "sweet",
      "romantic",
      "indulgent",
      "aesthetic",
    ],
  },
  Mars: {
    keywords: [
      "spicy",
      "bold",
      "hot",
      "pepper",
      "chili",
      "grilled",
      "red",
      "meat",
    ],
    characteristics: [
      "spicy",
      "bold flavors",
      "high protein",
      "energizing",
      "red colored",
    ],
  },
  Jupiter: {
    keywords: [
      "feast",
      "abundant",
      "rich",
      "celebration",
      "holiday",
      "traditional",
    ],
    characteristics: [
      "generous portions",
      "festive",
      "celebratory",
      "rich",
      "traditional",
    ],
  },
  Saturn: {
    keywords: [
      "traditional",
      "slow",
      "aged",
      "fermented",
      "preserved",
      "cured",
      "patience",
    ],
    characteristics: [
      "slow-cooked",
      "traditional recipes",
      "aged ingredients",
      "disciplined",
    ],
  },
};

// ============================================================================
// Seasonal Ingredient Mappings
// ============================================================================

const SEASONAL_INGREDIENTS: Record<string, string[]> = {
  spring: [
    "asparagus",
    "pea",
    "artichoke",
    "fava",
    "ramp",
    "morel",
    "radish",
    "spinach",
    "arugula",
    "mint",
    "chive",
    "lamb",
    "strawberry",
    "rhubarb",
    "apricot",
  ],
  summer: [
    "tomato",
    "corn",
    "zucchini",
    "eggplant",
    "pepper",
    "cucumber",
    "basil",
    "watermelon",
    "berry",
    "peach",
    "plum",
    "fig",
    "melon",
    "squash",
  ],
  autumn: [
    "pumpkin",
    "squash",
    "apple",
    "pear",
    "grape",
    "mushroom",
    "cranberry",
    "sweet potato",
    "brussels",
    "cabbage",
    "beet",
    "parsnip",
    "sage",
    "thyme",
  ],
  winter: [
    "potato",
    "carrot",
    "turnip",
    "rutabaga",
    "citrus",
    "kale",
    "collard",
    "cabbage",
    "leek",
    "onion",
    "garlic",
    "root",
    "nut",
    "dried fruit",
  ],
};

// ============================================================================
// RecipeDataEnricher Class
// ============================================================================

export class RecipeDataEnricher {
  private static instance: RecipeDataEnricher;

  private constructor() {}

  public static getInstance(): RecipeDataEnricher {
    if (!RecipeDataEnricher.instance) {
      RecipeDataEnricher.instance = new RecipeDataEnricher();
    }
    return RecipeDataEnricher.instance;
  }

  /**
   * Enrich a recipe with comprehensive data
   */
  public enrichRecipe(recipe: Partial<Recipe>): EnrichmentResult {
    const ingredients = recipe.ingredients || [];
    const cookingMethods = recipe.cookingMethod || [];
    const cuisine = recipe.cuisine?.toLowerCase() || "";

    // Calculate elemental properties
    const elementalProperties = this.calculateElementalProperties(
      ingredients,
      cookingMethods,
      cuisine,
    );

    // Determine planetary influences
    const planetaryInfluences = this.determinePlanetaryInfluences(
      recipe,
      elementalProperties,
    );

    // Calculate seasonal alignment
    const seasonalAlignment = this.calculateSeasonalAlignment(ingredients);

    // Generate flavor profile
    const flavorProfile = this.generateFlavorProfile(recipe, ingredients);

    // Estimate nutrition
    const nutritionEstimate = this.estimateNutrition(
      ingredients,
      recipe.numberOfServings || 4,
    );

    // Determine meal types
    const mealTypes = this.determineMealTypes(recipe, elementalProperties);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      ingredients.length,
      cookingMethods.length,
      !!cuisine,
    );

    return {
      elementalProperties,
      planetaryInfluences,
      seasonalAlignment,
      flavorProfile,
      nutritionEstimate,
      mealTypes,
      enrichmentMetadata: {
        enrichedAt: new Date().toISOString(),
        version: "2.0.0",
        ingredientCount: ingredients.length,
        cookingMethodCount: cookingMethods.length,
        confidenceScore,
      },
    };
  }

  /**
   * Calculate elemental properties from ingredients, cooking methods, and cuisine
   */
  public calculateElementalProperties(
    ingredients: RecipeIngredient[],
    cookingMethods: string[],
    cuisine: string,
  ): ElementalProperties {
    // Start with base elemental properties from ingredients
    const baseElementals = this.aggregateIngredientElementals(ingredients);

    // Apply cooking method modifiers
    const afterMethods = this.applyCookingMethodModifiers(
      baseElementals,
      cookingMethods,
    );

    // Apply cuisine modifiers
    const afterCuisine = this.applyCuisineModifiers(afterMethods, cuisine);

    // Normalize to ensure sum = 1.0
    return this.normalizeElementals(afterCuisine);
  }

  /**
   * Aggregate elemental properties from all ingredients
   */
  private aggregateIngredientElementals(
    ingredients: RecipeIngredient[],
  ): ElementalProperties {
    if (!ingredients || ingredients.length === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
    let matchCount = 0;

    for (const ingredient of ingredients) {
      const name = ingredient.name.toLowerCase();

      // Find matching elemental mapping
      const mapping = this.findIngredientMapping(name);
      if (mapping) {
        // Weight by amount (simple heuristic)
        const amount =
          typeof ingredient.amount === "number" ? ingredient.amount : 1;
        const weight = Math.log(1 + amount / 10); // Logarithmic scaling

        totals.Fire += mapping.Fire * weight;
        totals.Water += mapping.Water * weight;
        totals.Earth += mapping.Earth * weight;
        totals.Air += mapping.Air * weight;
        matchCount++;
      }
    }

    // If no matches, return balanced
    if (matchCount === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    return totals;
  }

  /**
   * Find the best matching elemental mapping for an ingredient
   */
  private findIngredientMapping(
    ingredientName: string,
  ): { Fire: number; Water: number; Earth: number; Air: number } | null {
    // Direct match
    if (INGREDIENT_ELEMENTAL_MAP[ingredientName]) {
      return INGREDIENT_ELEMENTAL_MAP[ingredientName];
    }

    // Partial match - check if ingredient name contains any mapped key
    for (const [key, mapping] of Object.entries(INGREDIENT_ELEMENTAL_MAP)) {
      if (ingredientName.includes(key) || key.includes(ingredientName)) {
        return mapping;
      }
    }

    // Category-based fallback
    const categories: Record<
      string,
      { Fire: number; Water: number; Earth: number; Air: number }
    > = {
      protein: { Fire: 0.25, Water: 0.25, Earth: 0.4, Air: 0.1 },
      vegetable: { Fire: 0.15, Water: 0.35, Earth: 0.3, Air: 0.2 },
      grain: { Fire: 0.1, Water: 0.2, Earth: 0.55, Air: 0.15 },
      spice: { Fire: 0.4, Water: 0.1, Earth: 0.2, Air: 0.3 },
      herb: { Fire: 0.15, Water: 0.2, Earth: 0.15, Air: 0.5 },
      dairy: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
      fruit: { Fire: 0.2, Water: 0.4, Earth: 0.2, Air: 0.2 },
      seasoning: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
      garnish: { Fire: 0.15, Water: 0.2, Earth: 0.15, Air: 0.5 },
    };

    return null;
  }

  /**
   * Apply cooking method modifiers to elemental properties
   */
  private applyCookingMethodModifiers(
    elementals: ElementalProperties,
    cookingMethods: string[],
  ): ElementalProperties {
    let result = { ...elementals };

    for (const method of cookingMethods) {
      const methodKey = method.toLowerCase().replace(/\s+/g, "-");
      const modifier =
        COOKING_METHOD_MODIFIERS[methodKey] ||
        COOKING_METHOD_MODIFIERS[method.toLowerCase()];

      if (modifier) {
        result = {
          Fire: result.Fire * (modifier.Fire ?? 1.0),
          Water: result.Water * (modifier.Water ?? 1.0),
          Earth: result.Earth * (modifier.Earth ?? 1.0),
          Air: result.Air * (modifier.Air ?? 1.0),
        };
      }
    }

    return result;
  }

  /**
   * Apply cuisine-based modifiers
   */
  private applyCuisineModifiers(
    elementals: ElementalProperties,
    cuisine: string,
  ): ElementalProperties {
    const cuisineKey = cuisine.toLowerCase().replace(/\s+/g, "-");
    const modifier =
      CUISINE_ELEMENTAL_MODIFIERS[cuisineKey] ||
      CUISINE_ELEMENTAL_MODIFIERS[cuisine.toLowerCase()];

    if (!modifier) {
      return elementals;
    }

    return {
      Fire: elementals.Fire * modifier.Fire,
      Water: elementals.Water * modifier.Water,
      Earth: elementals.Earth * modifier.Earth,
      Air: elementals.Air * modifier.Air,
    };
  }

  /**
   * Normalize elemental properties to sum to 1.0
   */
  private normalizeElementals(
    elementals: ElementalProperties,
  ): ElementalProperties {
    const total =
      elementals.Fire + elementals.Water + elementals.Earth + elementals.Air;

    if (total === 0) {
      return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
    }

    return {
      Fire: Math.round((elementals.Fire / total) * 100) / 100,
      Water: Math.round((elementals.Water / total) * 100) / 100,
      Earth: Math.round((elementals.Earth / total) * 100) / 100,
      Air: Math.round((elementals.Air / total) * 100) / 100,
    };
  }

  /**
   * Determine planetary influences based on recipe characteristics
   */
  public determinePlanetaryInfluences(
    recipe: Partial<Recipe>,
    elementals: ElementalProperties,
  ): string[] {
    const influences: Set<string> = new Set();
    const recipeName = recipe.name?.toLowerCase() || "";
    const recipeDesc = recipe.description?.toLowerCase() || "";
    const ingredients = recipe.ingredients || [];
    const ingredientNames = ingredients
      .map((i) => i.name.toLowerCase())
      .join(" ");
    const combinedText = `${recipeName} ${recipeDesc} ${ingredientNames}`;

    // Check each planet's keywords
    for (const [planet, config] of Object.entries(PLANETARY_CHARACTERISTICS)) {
      for (const keyword of config.keywords) {
        if (combinedText.includes(keyword)) {
          influences.add(planet);
          break;
        }
      }
    }

    // Add elemental-based influences
    const dominantElement = this.getDominantElement(elementals);
    switch (dominantElement) {
      case "Fire":
        influences.add("Mars");
        influences.add("Sun");
        break;
      case "Water":
        influences.add("Moon");
        influences.add("Neptune");
        break;
      case "Earth":
        influences.add("Saturn");
        influences.add("Venus");
        break;
      case "Air":
        influences.add("Mercury");
        influences.add("Uranus");
        break;
    }

    // Ensure at least one influence
    if (influences.size === 0) {
      influences.add("Sun");
    }

    return Array.from(influences).slice(0, 3); // Return top 3 influences
  }

  /**
   * Get the dominant element
   */
  private getDominantElement(elementals: ElementalProperties): string {
    const entries = Object.entries(elementals) as [string, number][];
    return entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];
  }

  /**
   * Calculate seasonal alignment from ingredients
   */
  public calculateSeasonalAlignment(ingredients: RecipeIngredient[]): string[] {
    const seasonScores: Record<string, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    };

    for (const ingredient of ingredients) {
      const name = ingredient.name.toLowerCase();

      for (const [season, seasonalItems] of Object.entries(
        SEASONAL_INGREDIENTS,
      )) {
        for (const item of seasonalItems) {
          if (name.includes(item) || item.includes(name)) {
            seasonScores[season]++;
            break;
          }
        }
      }
    }

    // Get seasons with matches
    const matchedSeasons = Object.entries(seasonScores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([season]) => season);

    // Return matched seasons or "all" if no matches
    return matchedSeasons.length > 0 ? matchedSeasons : ["all"];
  }

  /**
   * Generate flavor profile from recipe and ingredients
   */
  public generateFlavorProfile(
    recipe: Partial<Recipe>,
    ingredients: RecipeIngredient[],
  ): FlavorProfile {
    const tasteBalance = {
      sweet: 0,
      savory: 0,
      spicy: 0,
      sour: 0,
      bitter: 0,
      umami: 0,
    };

    const primary: Set<string> = new Set();
    const accent: Set<string> = new Set();

    // Analyze ingredients for taste profile
    for (const ingredient of ingredients) {
      const name = ingredient.name.toLowerCase();

      // Sweet indicators
      if (
        name.includes("sugar") ||
        name.includes("honey") ||
        name.includes("sweet") ||
        name.includes("maple")
      ) {
        tasteBalance.sweet += 2;
        primary.add("sweet");
      }

      // Savory indicators
      if (
        name.includes("salt") ||
        name.includes("soy") ||
        name.includes("broth") ||
        name.includes("stock")
      ) {
        tasteBalance.savory += 2;
        primary.add("savory");
      }

      // Spicy indicators
      if (
        name.includes("chili") ||
        name.includes("pepper") ||
        name.includes("hot") ||
        name.includes("cayenne")
      ) {
        tasteBalance.spicy += 2;
        primary.add("spicy");
        accent.add("heat");
      }

      // Sour indicators
      if (
        name.includes("lemon") ||
        name.includes("lime") ||
        name.includes("vinegar") ||
        name.includes("tamarind")
      ) {
        tasteBalance.sour += 2;
        primary.add("tangy");
      }

      // Bitter indicators
      if (
        name.includes("coffee") ||
        name.includes("dark chocolate") ||
        name.includes("arugula") ||
        name.includes("radicchio")
      ) {
        tasteBalance.bitter += 1;
        accent.add("bitter notes");
      }

      // Umami indicators
      if (
        name.includes("mushroom") ||
        name.includes("miso") ||
        name.includes("fish sauce") ||
        name.includes("parmesan") ||
        name.includes("tomato")
      ) {
        tasteBalance.umami += 2;
        primary.add("umami");
        accent.add("depth");
      }
    }

    // Consider spice level from recipe
    const spiceLevel = recipe.spiceLevel || 0;
    if (typeof spiceLevel === "number" && spiceLevel >= 3) {
      tasteBalance.spicy += spiceLevel;
      primary.add("spicy");
    }

    // Normalize taste balance (0-10 scale)
    for (const key of Object.keys(
      tasteBalance,
    ) as (keyof typeof tasteBalance)[]) {
      tasteBalance[key] = Math.min(10, tasteBalance[key]);
    }

    // Ensure we have some primary flavors
    if (primary.size === 0) {
      primary.add("savory"); // Default
    }

    return {
      primary: Array.from(primary).slice(0, 3),
      accent: Array.from(accent).slice(0, 2),
      tasteBalance,
    };
  }

  /**
   * Estimate nutrition from ingredients
   */
  public estimateNutrition(
    ingredients: RecipeIngredient[],
    servings: number,
  ): NutritionEstimate {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    const NUTRITION_ESTIMATES: Record<
      string,
      {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
      }
    > = {
      // Proteins
      protein: { calories: 200, protein: 25, carbs: 0, fat: 10, fiber: 0 },
      chicken: { calories: 180, protein: 27, carbs: 0, fat: 8, fiber: 0 },
      beef: { calories: 250, protein: 26, carbs: 0, fat: 17, fiber: 0 },
      pork: { calories: 220, protein: 25, carbs: 0, fat: 13, fiber: 0 },
      fish: { calories: 150, protein: 25, carbs: 0, fat: 5, fiber: 0 },
      seafood: { calories: 120, protein: 20, carbs: 2, fat: 3, fiber: 0 },
      tofu: { calories: 80, protein: 9, carbs: 2, fat: 4, fiber: 1 },
      egg: { calories: 70, protein: 6, carbs: 1, fat: 5, fiber: 0 },

      // Grains
      grain: { calories: 150, protein: 4, carbs: 30, fat: 1, fiber: 2 },
      rice: { calories: 130, protein: 3, carbs: 28, fat: 0, fiber: 1 },
      pasta: { calories: 160, protein: 6, carbs: 32, fat: 1, fiber: 2 },
      bread: { calories: 80, protein: 3, carbs: 15, fat: 1, fiber: 1 },
      noodle: { calories: 140, protein: 5, carbs: 28, fat: 1, fiber: 1 },

      // Vegetables
      vegetable: { calories: 30, protein: 2, carbs: 6, fat: 0, fiber: 2 },
      root: { calories: 50, protein: 1, carbs: 12, fat: 0, fiber: 2 },
      leafy: { calories: 15, protein: 1, carbs: 3, fat: 0, fiber: 1 },

      // Dairy
      dairy: { calories: 100, protein: 5, carbs: 5, fat: 8, fiber: 0 },
      cheese: { calories: 100, protein: 7, carbs: 1, fat: 8, fiber: 0 },
      milk: { calories: 60, protein: 4, carbs: 6, fat: 3, fiber: 0 },
      cream: { calories: 100, protein: 1, carbs: 2, fat: 10, fiber: 0 },

      // Fats
      oil: { calories: 120, protein: 0, carbs: 0, fat: 14, fiber: 0 },
      butter: { calories: 100, protein: 0, carbs: 0, fat: 12, fiber: 0 },
      nut: { calories: 80, protein: 3, carbs: 3, fat: 7, fiber: 1 },

      // Default
      default: { calories: 50, protein: 2, carbs: 8, fat: 2, fiber: 1 },
    };

    let matchCount = 0;

    for (const ingredient of ingredients) {
      const name = ingredient.name.toLowerCase();
      const category = ingredient.category?.toLowerCase() || "";

      // Find matching nutrition estimate
      let nutrition = NUTRITION_ESTIMATES.default;

      for (const [key, est] of Object.entries(NUTRITION_ESTIMATES)) {
        if (name.includes(key) || category.includes(key)) {
          nutrition = est;
          break;
        }
      }

      // Apply amount scaling (simple heuristic)
      const amount =
        typeof ingredient.amount === "number" ? ingredient.amount : 1;
      const scale = amount > 100 ? amount / 100 : amount > 10 ? amount / 50 : 1;

      totals.calories += nutrition.calories * scale;
      totals.protein += nutrition.protein * scale;
      totals.carbs += nutrition.carbs * scale;
      totals.fat += nutrition.fat * scale;
      totals.fiber += nutrition.fiber * scale;
      matchCount++;
    }

    // Calculate per serving
    const perServing = {
      calories: Math.round(totals.calories / servings),
      protein: Math.round(totals.protein / servings),
      carbs: Math.round(totals.carbs / servings),
      fat: Math.round(totals.fat / servings),
      fiber: Math.round(totals.fiber / servings),
    };

    // Determine confidence
    let confidence: "low" | "medium" | "high" = "low";
    if (matchCount >= ingredients.length * 0.8 && ingredients.length >= 5) {
      confidence = "high";
    } else if (
      matchCount >= ingredients.length * 0.5 &&
      ingredients.length >= 3
    ) {
      confidence = "medium";
    }

    return {
      ...perServing,
      confidence,
    };
  }

  /**
   * Determine appropriate meal types
   */
  public determineMealTypes(
    recipe: Partial<Recipe>,
    elementals: ElementalProperties,
  ): string[] {
    const mealTypes: Set<string> = new Set();
    const recipeName = recipe.name?.toLowerCase() || "";
    const recipeDesc = recipe.description?.toLowerCase() || "";

    // Check name and description for meal type indicators
    const breakfastKeywords = [
      "breakfast",
      "morning",
      "brunch",
      "egg",
      "pancake",
      "oatmeal",
      "porridge",
      "cereal",
    ];
    const lunchKeywords = [
      "lunch",
      "sandwich",
      "salad",
      "soup",
      "wrap",
      "light",
    ];
    const dinnerKeywords = [
      "dinner",
      "entree",
      "main course",
      "roast",
      "steak",
      "feast",
    ];
    const snackKeywords = [
      "snack",
      "appetizer",
      "small",
      "bite",
      "finger food",
    ];
    const dessertKeywords = [
      "dessert",
      "sweet",
      "cake",
      "pie",
      "cookie",
      "pudding",
      "ice cream",
    ];

    const combinedText = `${recipeName} ${recipeDesc}`;

    if (breakfastKeywords.some((kw) => combinedText.includes(kw))) {
      mealTypes.add("breakfast");
    }
    if (lunchKeywords.some((kw) => combinedText.includes(kw))) {
      mealTypes.add("lunch");
    }
    if (dinnerKeywords.some((kw) => combinedText.includes(kw))) {
      mealTypes.add("dinner");
    }
    if (snackKeywords.some((kw) => combinedText.includes(kw))) {
      mealTypes.add("snack");
    }
    if (dessertKeywords.some((kw) => combinedText.includes(kw))) {
      mealTypes.add("dessert");
    }

    // Use elemental balance as fallback
    if (mealTypes.size === 0) {
      const dominantElement = this.getDominantElement(elementals);

      switch (dominantElement) {
        case "Fire":
          mealTypes.add("lunch");
          mealTypes.add("dinner");
          break;
        case "Water":
          mealTypes.add("breakfast");
          mealTypes.add("dinner");
          break;
        case "Earth":
          mealTypes.add("dinner");
          break;
        case "Air":
          mealTypes.add("lunch");
          mealTypes.add("snack");
          break;
        default:
          mealTypes.add("lunch");
          mealTypes.add("dinner");
      }
    }

    return Array.from(mealTypes);
  }

  /**
   * Calculate confidence score for enrichment
   */
  private calculateConfidenceScore(
    ingredientCount: number,
    cookingMethodCount: number,
    hasCuisine: boolean,
  ): number {
    let score = 0;

    // Ingredients contribute up to 50%
    if (ingredientCount >= 8) score += 50;
    else if (ingredientCount >= 5) score += 40;
    else if (ingredientCount >= 3) score += 25;
    else if (ingredientCount >= 1) score += 10;

    // Cooking methods contribute up to 30%
    if (cookingMethodCount >= 2) score += 30;
    else if (cookingMethodCount >= 1) score += 20;

    // Cuisine contributes up to 20%
    if (hasCuisine) score += 20;

    return score;
  }

  /**
   * Batch enrich multiple recipes
   */
  public enrichRecipes(
    recipes: Partial<Recipe>[],
  ): Map<string, EnrichmentResult> {
    const results = new Map<string, EnrichmentResult>();

    for (const recipe of recipes) {
      const id = recipe.id || recipe.name || `recipe-${Date.now()}`;
      try {
        results.set(id, this.enrichRecipe(recipe));
      } catch (error) {
        logger.error(`Failed to enrich recipe ${id}:`, error);
      }
    }

    return results;
  }

  /**
   * Check if recipe needs enrichment
   */
  public needsEnrichment(recipe: Partial<Recipe>): boolean {
    // Check for default elemental properties
    const elementals = recipe.elementalProperties;
    if (!elementals) return true;

    const isDefault =
      elementals.Fire === 0.25 &&
      elementals.Water === 0.25 &&
      elementals.Earth === 0.25 &&
      elementals.Air === 0.25;

    if (isDefault) return true;

    // Check for missing data
    if (!recipe.mealType || recipe.mealType.length === 0) return true;
    if (!recipe.season || recipe.season.length === 0) return true;
    if (
      !recipe.astrologicalInfluences ||
      recipe.astrologicalInfluences.length === 0
    )
      return true;

    return false;
  }

  /**
   * Apply enrichment to a recipe
   */
  public applyEnrichment(
    recipe: Partial<Recipe>,
    enrichment: EnrichmentResult,
  ): Recipe {
    return {
      ...recipe,
      elementalProperties: enrichment.elementalProperties,
      astrologicalInfluences: enrichment.planetaryInfluences,
      season: enrichment.seasonalAlignment as any,
      mealType: enrichment.mealTypes as any,
      flavorProfile: enrichment.flavorProfile as any,
      nutrition: {
        calories: enrichment.nutritionEstimate.calories,
        protein: enrichment.nutritionEstimate.protein,
        carbs: enrichment.nutritionEstimate.carbs,
        fat: enrichment.nutritionEstimate.fat,
        fiber: enrichment.nutritionEstimate.fiber,
      },
    } as Recipe;
  }
}

// Export singleton instance
export const recipeDataEnricher = RecipeDataEnricher.getInstance();

// Export convenience functions
export const enrichRecipe = (recipe: Partial<Recipe>) =>
  recipeDataEnricher.enrichRecipe(recipe);

export const enrichRecipes = (recipes: Partial<Recipe>[]) =>
  recipeDataEnricher.enrichRecipes(recipes);

export const needsEnrichment = (recipe: Partial<Recipe>) =>
  recipeDataEnricher.needsEnrichment(recipe);

export const applyEnrichment = (
  recipe: Partial<Recipe>,
  enrichment: EnrichmentResult,
) => recipeDataEnricher.applyEnrichment(recipe, enrichment);
