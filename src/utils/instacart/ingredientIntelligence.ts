/**
 * Ingredient Intelligence Module
 * 
 * Provides sophisticated physical and economic modeling for ingredients:
 * 1. Volume-to-Weight conversion (Density mapping)
 * 2. Price tiering (Essential vs Premium/Organic)
 * 3. Unit normalization for Instacart IDP compatibility
 */

export type PriceTier = "essential" | "premium" | "pantry";

export interface PhysicalProperties {
  density: number; // grams per ml (water = 1.0)
  avgWeightPerEach?: number; // grams for one "piece" (e.g. 1 onion = 150g)
}

/**
 * Density Map (g/ml)
 * Source: Unified Culinary Database 2026 heuristics
 */
const DENSITY_MAP: Record<string, number> = {
  // Liquids
  water: 1.0,
  milk: 1.03,
  broth: 1.0,
  stock: 1.0,
  cream: 0.95,
  vinegar: 1.0,
  "soy sauce": 1.1,
  
  // Fats/Oils (lighter than water)
  oil: 0.9,
  "olive oil": 0.92,
  butter: 0.91,
  
  // Powders/Grains (airy)
  flour: 0.55,
  sugar: 0.85,
  rice: 0.8,
  quinoa: 0.75,
  couscous: 0.7,
  "cornmeal": 0.65,
  "cocoa powder": 0.45,
  "baking powder": 0.9,
  salt: 1.2,
  
  // Spices (very airy)
  spice: 0.4,
  cumin: 0.4,
  paprika: 0.45,
  cinnamon: 0.5,
  
  // Syrups/Thick
  honey: 1.4,
  molasses: 1.4,
  maple: 1.3,
  yogurt: 1.05,
  sauce: 1.1
};

/**
 * Avg Weight per "Each" (grams)
 */
const WEIGHT_PER_PIECE: Record<string, number> = {
  onion: 150,
  garlic: 5, // per clove
  lemon: 100,
  lime: 60,
  apple: 180,
  potato: 200,
  carrot: 75,
  egg: 50,
  tomato: 150,
  cucumber: 300,
  avocado: 200,
  banana: 120,
  orange: 200,
  pepper: 150, // bell pepper
  beet: 150
};

// Conversions to ML (base volume)
const UNIT_TO_ML: Record<string, number> = {
  tsp: 4.93,
  teaspoon: 4.93,
  tbsp: 14.79,
  tablespoon: 14.79,
  cup: 236.59,
  pint: 473.18,
  quart: 946.35,
  gallon: 3785.41,
  ml: 1.0,
  l: 1000,
  liter: 1000,
  "fl oz": 29.57,
  "fluid ounce": 29.57
};

// Conversions to Grams (base weight)
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  kg: 1000,
  kilogram: 1000,
  oz: 28.35,
  ounce: 28.35,
  lb: 453.59,
  pound: 453.59
};

/**
 * Heuristically determines density of an ingredient based on its name
 */
export function getDensity(name: string): number {
  const n = name.toLowerCase();
  for (const [key, value] of Object.entries(DENSITY_MAP)) {
    if (n.includes(key)) return value;
  }
  return 1.0; // Default to water density
}

/**
 * Converts any culinary amount/unit into Grams for pricing
 */
export function convertToGrams(name: string, amount: number, unit: string): number {
  const n = name.toLowerCase();
  const u = unit.toLowerCase().trim();

  // 1. Direct Weight
  if (UNIT_TO_GRAMS[u]) {
    return amount * UNIT_TO_GRAMS[u];
  }

  // 2. Volume to Weight via Density
  if (UNIT_TO_ML[u]) {
    const ml = amount * UNIT_TO_ML[u];
    return ml * getDensity(n);
  }

  // 3. Piece to Weight
  if (u === "each" || u === "piece" || u === "" || u === "head" || u === "bulb" || u === "clove") {
    for (const [key, weight] of Object.entries(WEIGHT_PER_PIECE)) {
      if (n.includes(key)) return amount * weight;
    }
    return amount * 100; // Generic piece weight (100g)
  }

  // 4. Bunch/Pack (approximate)
  if (u === "bunch") return amount * 50;
  if (u === "clove") return amount * 5;
  if (u === "pack" || u === "package" || u === "can" || u === "jar") return amount * 400; // Avg size

  return amount; // Fallback
}

/**
 * Determines if an ingredient is likely a "Pantry" item the user already has
 * (Salt, Pepper, Water, common spices)
 */
export function isPantryItem(name: string): boolean {
  const n = name.toLowerCase();
  const staples = [
    "water", "salt", "pepper", "oil", "sugar", "flour", 
    "baking powder", "baking soda", "vinegar", "soy sauce",
    "dried oregano", "dried basil", "dried thyme", "dried rosemary",
    "cumin", "paprika", "cinnamon", "garlic powder", "onion powder"
  ];
  return staples.some(s => n.includes(s));
}

/**
 * Determines the price tier based on dietary flags and ingredient name
 */
export function getPriceTier(name: string, dietaryFlags: string[] = []): PriceTier {
  if (isPantryItem(name)) return "pantry";
  
  const n = name.toLowerCase();
  const isOrganic = dietaryFlags.includes("organic") || n.includes("organic");
  const isPremium = n.includes("grass-fed") || n.includes("wild-caught") || n.includes("extra virgin");
  
  if (isOrganic || isPremium) return "premium";
  return "essential";
}

/**
 * Normalize ingredient names for fuzzy pantry/inventory matching.
 */
export function normalizeIngredientKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(
      /\b(fresh|dried|organic|large|small|medium|extra|virgin|ground|boneless|skinless|chopped|diced|minced|sliced)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function inventoryMatchesIngredient(
  ingredientName: string,
  inventoryItem: string,
): boolean {
  const ingredientKey = normalizeIngredientKey(ingredientName);
  const inventoryKey = normalizeIngredientKey(inventoryItem);

  if (!ingredientKey || !inventoryKey) {
    return false;
  }

  return (
    ingredientKey === inventoryKey ||
    ingredientKey.includes(inventoryKey) ||
    inventoryKey.includes(ingredientKey)
  );
}

export function splitItemsByInventory<T extends { name: string }>(
  items: T[],
  inventory: string[] = [],
): { included: T[]; excluded: T[] } {
  if (inventory.length === 0) {
    return { included: items, excluded: [] };
  }

  const included: T[] = [];
  const excluded: T[] = [];

  items.forEach((item) => {
    const isInInventory = inventory.some((inventoryItem) =>
      inventoryMatchesIngredient(item.name, inventoryItem),
    );

    if (isInInventory) {
      excluded.push(item);
    } else {
      included.push(item);
    }
  });

  return { included, excluded };
}
