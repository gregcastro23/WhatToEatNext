#!/usr/bin/env ts-node
/**
 * Recipe Data Enrichment Analysis Script
 *
 * This script analyzes the current state of recipe data and generates a report
 * on which recipes need enrichment. It can also perform the enrichment and
 * output the results.
 *
 * Usage:
 *   npx ts-node scripts/enrichRecipeData.ts [--analyze | --enrich | --write]
 *
 * Options:
 *   --analyze  Generate a report of recipes needing enrichment (default)
 *   --enrich   Perform enrichment and output results to console
 *   --write    Perform enrichment and write back to source files
 *
 * @file scripts/enrichRecipeData.ts
 * @created 2026-02-01
 */

import * as fs from "fs";
import * as path from "path";

// Types for the analysis
interface ElementalProperties {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

interface RecipeIngredient {
  name: string;
  amount: string | number;
  unit: string;
  category?: string;
}

interface DishData {
  id?: string;
  name: string;
  description?: string;
  cuisine?: string;
  cookingMethods?: string[];
  ingredients?: RecipeIngredient[];
  elementalProperties?: ElementalProperties;
  season?: string[];
  mealType?: string[];
  astrologicalInfluences?: string[];
  nutrition?: Record<string, number>;
  flavorProfile?: Record<string, any>;
  spiceLevel?: number | string;
  [key: string]: any;
}

interface CuisineData {
  id: string;
  name: string;
  description?: string;
  dishes: {
    breakfast?: Record<string, DishData[]>;
    lunch?: Record<string, DishData[]>;
    dinner?: Record<string, DishData[]>;
    dessert?: Record<string, DishData[]>;
    [key: string]: Record<string, DishData[]> | undefined;
  };
  elementalProperties?: ElementalProperties;
  [key: string]: any;
}

interface AnalysisResult {
  cuisine: string;
  mealType: string;
  season: string;
  recipeName: string;
  hasElementalProperties: boolean;
  isDefault: boolean;
  hasPlanetaryInfluences: boolean;
  hasSeasonData: boolean;
  hasNutrition: boolean;
  needsEnrichment: boolean;
  ingredientCount: number;
}

// Ingredient elemental mappings
const INGREDIENT_ELEMENTAL_MAP: Record<string, ElementalProperties> = {
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
  coconut: { Fire: 0.1, Water: 0.5, Earth: 0.3, Air: 0.1 },
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
  salmon: { Fire: 0.15, Water: 0.5, Earth: 0.25, Air: 0.1 },
  tuna: { Fire: 0.2, Water: 0.5, Earth: 0.2, Air: 0.1 },
  soup: { Fire: 0.15, Water: 0.65, Earth: 0.1, Air: 0.1 },

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
  carrot: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  beet: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  turnip: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  cheese: { Fire: 0.1, Water: 0.2, Earth: 0.6, Air: 0.1 },
  beef: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  pork: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  lamb: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  meat: { Fire: 0.3, Water: 0.2, Earth: 0.4, Air: 0.1 },
  tofu: { Fire: 0.1, Water: 0.4, Earth: 0.4, Air: 0.1 },
  tempeh: { Fire: 0.1, Water: 0.3, Earth: 0.5, Air: 0.1 },
  nut: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },
  egg: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  butter: { Fire: 0.2, Water: 0.2, Earth: 0.5, Air: 0.1 },
  chicken: { Fire: 0.25, Water: 0.25, Earth: 0.35, Air: 0.15 },
  turkey: { Fire: 0.2, Water: 0.25, Earth: 0.4, Air: 0.15 },
  duck: { Fire: 0.3, Water: 0.25, Earth: 0.35, Air: 0.1 },

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
  lemongrass: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  scallion: { Fire: 0.2, Water: 0.2, Earth: 0.1, Air: 0.5 },
  sprout: { Fire: 0.1, Water: 0.3, Earth: 0.1, Air: 0.5 },
  spinach: { Fire: 0.1, Water: 0.3, Earth: 0.2, Air: 0.4 },
  arugula: { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 },
  kale: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  cabbage: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
  broccoli: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },

  // Oils and fats
  oil: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  olive: { Fire: 0.3, Water: 0.1, Earth: 0.4, Air: 0.2 },
  sesame: { Fire: 0.4, Water: 0.1, Earth: 0.3, Air: 0.2 },
  ghee: { Fire: 0.35, Water: 0.15, Earth: 0.35, Air: 0.15 },

  // Sweeteners
  sugar: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
  honey: { Fire: 0.3, Water: 0.3, Earth: 0.3, Air: 0.1 },
  maple: { Fire: 0.25, Water: 0.25, Earth: 0.4, Air: 0.1 },

  // Sauces and condiments
  soy: { Fire: 0.2, Water: 0.4, Earth: 0.3, Air: 0.1 },
  miso: { Fire: 0.2, Water: 0.3, Earth: 0.4, Air: 0.1 },
  tahini: { Fire: 0.2, Water: 0.1, Earth: 0.5, Air: 0.2 },

  // Coffee and tea
  coffee: { Fire: 0.4, Water: 0.3, Earth: 0.2, Air: 0.1 },
  espresso: { Fire: 0.5, Water: 0.3, Earth: 0.15, Air: 0.05 },
  tea: { Fire: 0.2, Water: 0.5, Earth: 0.1, Air: 0.2 },
  matcha: { Fire: 0.25, Water: 0.4, Earth: 0.15, Air: 0.2 },
};

// Cuisine elemental modifiers
const CUISINE_MODIFIERS: Record<string, ElementalProperties> = {
  italian: { Fire: 1.0, Water: 1.0, Earth: 1.2, Air: 1.0 },
  thai: { Fire: 1.3, Water: 1.0, Earth: 0.9, Air: 1.1 },
  indian: { Fire: 1.3, Water: 0.9, Earth: 1.1, Air: 1.0 },
  mexican: { Fire: 1.25, Water: 0.9, Earth: 1.1, Air: 0.95 },
  japanese: { Fire: 0.9, Water: 1.3, Earth: 1.0, Air: 1.0 },
  chinese: { Fire: 1.1, Water: 1.1, Earth: 1.0, Air: 0.95 },
  vietnamese: { Fire: 1.0, Water: 1.2, Earth: 0.9, Air: 1.1 },
  french: { Fire: 0.95, Water: 1.1, Earth: 1.2, Air: 0.95 },
  greek: { Fire: 1.0, Water: 1.0, Earth: 1.1, Air: 1.1 },
  korean: { Fire: 1.2, Water: 1.0, Earth: 1.0, Air: 1.0 },
  american: { Fire: 1.1, Water: 0.95, Earth: 1.15, Air: 0.95 },
  russian: { Fire: 0.9, Water: 1.0, Earth: 1.3, Air: 0.9 },
  african: { Fire: 1.2, Water: 0.9, Earth: 1.1, Air: 1.0 },
  "middle-eastern": { Fire: 1.15, Water: 0.9, Earth: 1.1, Air: 1.05 },
};

// Cooking method modifiers
const COOKING_METHOD_MODIFIERS: Record<string, ElementalProperties> = {
  grilling: { Fire: 1.4, Water: 0.8, Earth: 1.0, Air: 1.1 },
  baking: { Fire: 1.2, Water: 0.9, Earth: 1.2, Air: 1.0 },
  frying: { Fire: 1.3, Water: 0.7, Earth: 1.0, Air: 1.1 },
  steaming: { Fire: 0.8, Water: 1.4, Earth: 0.9, Air: 1.1 },
  boiling: { Fire: 0.9, Water: 1.3, Earth: 0.9, Air: 1.0 },
  simmering: { Fire: 0.95, Water: 1.25, Earth: 1.0, Air: 0.95 },
  roasting: { Fire: 1.3, Water: 0.8, Earth: 1.1, Air: 1.0 },
  sauteing: { Fire: 1.2, Water: 0.9, Earth: 1.0, Air: 1.1 },
  "stir-frying": { Fire: 1.35, Water: 0.85, Earth: 0.95, Air: 1.1 },
  braising: { Fire: 1.1, Water: 1.2, Earth: 1.1, Air: 0.9 },
  poaching: { Fire: 0.8, Water: 1.35, Earth: 0.9, Air: 1.0 },
  fermenting: { Fire: 0.8, Water: 1.1, Earth: 1.3, Air: 1.0 },
  smoking: { Fire: 1.2, Water: 0.8, Earth: 1.0, Air: 1.2 },
  raw: { Fire: 0.7, Water: 1.2, Earth: 0.9, Air: 1.2 },
  marinating: { Fire: 0.9, Water: 1.2, Earth: 1.0, Air: 1.1 },
};

// Planetary influence mappings
const PLANETARY_KEYWORDS: Record<string, string[]> = {
  Sun: ["bright", "vital", "energizing", "golden", "citrus", "saffron", "honey", "breakfast"],
  Moon: ["comfort", "nurturing", "mild", "soft", "cream", "milk", "dairy", "soup", "porridge"],
  Mercury: ["quick", "light", "varied", "diverse", "snack", "appetizer"],
  Venus: ["elegant", "sweet", "beautiful", "dessert", "romantic", "chocolate", "fruit"],
  Mars: ["spicy", "bold", "hot", "pepper", "chili", "grilled", "red", "meat"],
  Jupiter: ["feast", "abundant", "rich", "celebration", "holiday", "traditional"],
  Saturn: ["traditional", "slow", "aged", "fermented", "preserved", "cured"],
};

// Seasonal ingredient mappings
const SEASONAL_INGREDIENTS: Record<string, string[]> = {
  spring: ["asparagus", "pea", "artichoke", "ramp", "radish", "spinach", "arugula", "mint", "lamb", "strawberry"],
  summer: ["tomato", "corn", "zucchini", "eggplant", "pepper", "cucumber", "basil", "watermelon", "berry", "peach"],
  autumn: ["pumpkin", "squash", "apple", "pear", "mushroom", "cranberry", "sweet potato", "brussels", "sage"],
  winter: ["potato", "carrot", "turnip", "citrus", "kale", "cabbage", "leek", "onion", "garlic", "nut"],
};

/**
 * Find matching elemental properties for an ingredient
 */
function findIngredientElementals(ingredientName: string): ElementalProperties | null {
  const name = ingredientName.toLowerCase();

  // Direct match
  if (INGREDIENT_ELEMENTAL_MAP[name]) {
    return INGREDIENT_ELEMENTAL_MAP[name];
  }

  // Partial match
  for (const [key, mapping] of Object.entries(INGREDIENT_ELEMENTAL_MAP)) {
    if (name.includes(key) || key.includes(name)) {
      return mapping;
    }
  }

  return null;
}

/**
 * Calculate elemental properties from ingredients
 */
function calculateElementals(
  ingredients: RecipeIngredient[],
  cookingMethods: string[] = [],
  cuisine: string = ""
): ElementalProperties {
  if (!ingredients || ingredients.length === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  const totals = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let matchCount = 0;

  for (const ingredient of ingredients) {
    const mapping = findIngredientElementals(ingredient.name);
    if (mapping) {
      const amount = typeof ingredient.amount === "number" ? ingredient.amount : 1;
      const weight = Math.log(1 + amount / 10);

      totals.Fire += mapping.Fire * weight;
      totals.Water += mapping.Water * weight;
      totals.Earth += mapping.Earth * weight;
      totals.Air += mapping.Air * weight;
      matchCount++;
    }
  }

  if (matchCount === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  // Apply cooking method modifiers
  for (const method of cookingMethods) {
    const modifier = COOKING_METHOD_MODIFIERS[method.toLowerCase().replace(/\s+/g, "-")];
    if (modifier) {
      totals.Fire *= modifier.Fire;
      totals.Water *= modifier.Water;
      totals.Earth *= modifier.Earth;
      totals.Air *= modifier.Air;
    }
  }

  // Apply cuisine modifiers
  const cuisineKey = cuisine.toLowerCase().replace(/\s+/g, "-");
  const cuisineModifier = CUISINE_MODIFIERS[cuisineKey];
  if (cuisineModifier) {
    totals.Fire *= cuisineModifier.Fire;
    totals.Water *= cuisineModifier.Water;
    totals.Earth *= cuisineModifier.Earth;
    totals.Air *= cuisineModifier.Air;
  }

  // Normalize
  const total = totals.Fire + totals.Water + totals.Earth + totals.Air;
  if (total === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }

  return {
    Fire: Math.round((totals.Fire / total) * 100) / 100,
    Water: Math.round((totals.Water / total) * 100) / 100,
    Earth: Math.round((totals.Earth / total) * 100) / 100,
    Air: Math.round((totals.Air / total) * 100) / 100,
  };
}

/**
 * Determine planetary influences
 */
function determinePlanetaryInfluences(dish: DishData): string[] {
  const influences: Set<string> = new Set();
  const combinedText = `${dish.name || ""} ${dish.description || ""} ${
    dish.ingredients?.map((i) => i.name).join(" ") || ""
  }`.toLowerCase();

  for (const [planet, keywords] of Object.entries(PLANETARY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        influences.add(planet);
        break;
      }
    }
  }

  if (influences.size === 0) {
    influences.add("Sun");
  }

  return Array.from(influences).slice(0, 3);
}

/**
 * Calculate seasonal alignment
 */
function calculateSeasonalAlignment(ingredients: RecipeIngredient[]): string[] {
  const scores: Record<string, number> = { spring: 0, summer: 0, autumn: 0, winter: 0 };

  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase();
    for (const [season, items] of Object.entries(SEASONAL_INGREDIENTS)) {
      for (const item of items) {
        if (name.includes(item) || item.includes(name)) {
          scores[season]++;
          break;
        }
      }
    }
  }

  const matched = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([season]) => season);

  return matched.length > 0 ? matched : ["all"];
}

/**
 * Estimate nutrition
 */
function estimateNutrition(ingredients: RecipeIngredient[], servings: number = 4): Record<string, number> {
  const NUTRITION_BASE: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {
    protein: { calories: 200, protein: 25, carbs: 0, fat: 10 },
    chicken: { calories: 180, protein: 27, carbs: 0, fat: 8 },
    beef: { calories: 250, protein: 26, carbs: 0, fat: 17 },
    fish: { calories: 150, protein: 25, carbs: 0, fat: 5 },
    egg: { calories: 70, protein: 6, carbs: 1, fat: 5 },
    rice: { calories: 130, protein: 3, carbs: 28, fat: 0 },
    pasta: { calories: 160, protein: 6, carbs: 32, fat: 1 },
    bread: { calories: 80, protein: 3, carbs: 15, fat: 1 },
    vegetable: { calories: 30, protein: 2, carbs: 6, fat: 0 },
    cheese: { calories: 100, protein: 7, carbs: 1, fat: 8 },
    milk: { calories: 60, protein: 4, carbs: 6, fat: 3 },
    oil: { calories: 120, protein: 0, carbs: 0, fat: 14 },
    default: { calories: 50, protein: 2, carbs: 8, fat: 2 },
  };

  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase();
    let nutrition = NUTRITION_BASE.default;

    for (const [key, est] of Object.entries(NUTRITION_BASE)) {
      if (name.includes(key)) {
        nutrition = est;
        break;
      }
    }

    const amount = typeof ingredient.amount === "number" ? ingredient.amount : 1;
    const scale = amount > 100 ? amount / 100 : amount > 10 ? amount / 50 : 1;

    totals.calories += nutrition.calories * scale;
    totals.protein += nutrition.protein * scale;
    totals.carbs += nutrition.carbs * scale;
    totals.fat += nutrition.fat * scale;
  }

  return {
    calories: Math.round(totals.calories / servings),
    protein: Math.round(totals.protein / servings),
    carbs: Math.round(totals.carbs / servings),
    fat: Math.round(totals.fat / servings),
  };
}

/**
 * Check if elemental properties are default values
 */
function isDefaultElementals(props: ElementalProperties | undefined): boolean {
  if (!props) return true;
  return props.Fire === 0.25 && props.Water === 0.25 && props.Earth === 0.25 && props.Air === 0.25;
}

/**
 * Enrich a single dish
 */
function enrichDish(dish: DishData, cuisineName: string): DishData {
  const ingredients = dish.ingredients || [];
  const cookingMethods = dish.cookingMethods || [];

  const elementalProperties = calculateElementals(ingredients, cookingMethods, cuisineName);
  const planetaryInfluences = determinePlanetaryInfluences(dish);
  const seasonalAlignment = calculateSeasonalAlignment(ingredients);
  const nutrition = estimateNutrition(ingredients, dish.servingSize || 4);

  return {
    ...dish,
    elementalProperties,
    astrologicalInfluences: planetaryInfluences,
    season: seasonalAlignment,
    nutrition: {
      ...dish.nutrition,
      ...nutrition,
    },
  };
}

/**
 * Analyze all cuisines and generate report
 */
function analyzeCuisines(cuisinesDir: string): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  const cuisineFiles = fs.readdirSync(cuisinesDir).filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "template.ts" && f !== "culinaryTraditions.ts");

  console.log(`\nAnalyzing ${cuisineFiles.length} cuisine files...`);

  for (const file of cuisineFiles) {
    const filePath = path.join(cuisinesDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const cuisineName = file.replace(".ts", "");

    // Parse dishes from file content (simplified parsing)
    const dishMatches = content.matchAll(/{\s*(?:id:\s*["']([^"']+)["'],?\s*)?name:\s*["']([^"']+)["']/g);

    for (const match of dishMatches) {
      const dishName = match[2];

      // Check for elemental properties
      const hasElementals = content.includes(`elementalProperties:`) && content.includes(dishName);
      const hasDefaultElementals = content.includes(`Fire: 0.25`) && content.includes(`Water: 0.25`);
      const hasPlanetary = content.includes(`astrologicalInfluences`) || content.includes(`planetary`);
      const hasSeason = content.includes(`season:`);
      const hasNutrition = content.includes(`nutrition:`);

      // Determine meal type and season from context
      let mealType = "unknown";
      let season = "unknown";

      if (content.includes(`breakfast:`)) mealType = "breakfast";
      else if (content.includes(`lunch:`)) mealType = "lunch";
      else if (content.includes(`dinner:`)) mealType = "dinner";
      else if (content.includes(`dessert:`)) mealType = "dessert";

      results.push({
        cuisine: cuisineName,
        mealType,
        season,
        recipeName: dishName,
        hasElementalProperties: hasElementals,
        isDefault: hasDefaultElementals,
        hasPlanetaryInfluences: hasPlanetary,
        hasSeasonData: hasSeason,
        hasNutrition: hasNutrition,
        needsEnrichment: !hasElementals || hasDefaultElementals || !hasPlanetary,
        ingredientCount: 0,
      });
    }
  }

  return results;
}

/**
 * Generate enrichment report
 */
function generateReport(results: AnalysisResult[]): void {
  const needsEnrichment = results.filter((r) => r.needsEnrichment);
  const hasDefaults = results.filter((r) => r.isDefault);
  const missingElementals = results.filter((r) => !r.hasElementalProperties);
  const missingPlanetary = results.filter((r) => !r.hasPlanetaryInfluences);

  console.log("\n" + "=".repeat(80));
  console.log("RECIPE DATA ENRICHMENT ANALYSIS REPORT");
  console.log("=".repeat(80));

  console.log(`\nTotal Recipes Found: ${results.length}`);
  console.log(`Needs Enrichment: ${needsEnrichment.length} (${((needsEnrichment.length / results.length) * 100).toFixed(1)}%)`);
  console.log(`Has Default Elementals: ${hasDefaults.length}`);
  console.log(`Missing Elemental Properties: ${missingElementals.length}`);
  console.log(`Missing Planetary Influences: ${missingPlanetary.length}`);

  console.log("\n" + "-".repeat(40));
  console.log("By Cuisine:");
  console.log("-".repeat(40));

  const byCuisine: Record<string, { total: number; needsEnrichment: number }> = {};
  for (const result of results) {
    if (!byCuisine[result.cuisine]) {
      byCuisine[result.cuisine] = { total: 0, needsEnrichment: 0 };
    }
    byCuisine[result.cuisine].total++;
    if (result.needsEnrichment) {
      byCuisine[result.cuisine].needsEnrichment++;
    }
  }

  for (const [cuisine, stats] of Object.entries(byCuisine).sort((a, b) => b[1].needsEnrichment - a[1].needsEnrichment)) {
    console.log(`  ${cuisine.padEnd(20)} ${stats.needsEnrichment}/${stats.total} need enrichment`);
  }

  console.log("\n" + "=".repeat(80));
  console.log("RECOMMENDATION:");
  console.log("=".repeat(80));

  if (needsEnrichment.length > 0) {
    console.log(`\nRun 'npx ts-node scripts/enrichRecipeData.ts --write' to enrich ${needsEnrichment.length} recipes.`);
  } else {
    console.log("\nAll recipes have been enriched!");
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const mode = args[0] || "--analyze";

  const cuisinesDir = path.join(process.cwd(), "src", "data", "cuisines");

  if (!fs.existsSync(cuisinesDir)) {
    console.error(`Error: Cuisines directory not found at ${cuisinesDir}`);
    process.exit(1);
  }

  console.log("Recipe Data Enrichment Tool");
  console.log(`Mode: ${mode}`);
  console.log(`Cuisines Directory: ${cuisinesDir}`);

  const results = analyzeCuisines(cuisinesDir);
  generateReport(results);

  if (mode === "--enrich" || mode === "--write") {
    console.log("\nNote: Full enrichment with file writing requires running the writeEnrichedData.ts script.");
    console.log("This script provides analysis only. Run:");
    console.log("  npx ts-node scripts/writeEnrichedData.ts");
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
