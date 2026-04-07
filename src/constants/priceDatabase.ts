/**
 * Price Database 2026 (US Market Average)
 * 
 * Each entry provides:
 * - basePrice: USD per unit
 * - unit: gram | ml | each | bunch | bulb | clove
 * - tier: essential | premium | pantry
 */

export interface PricePoint {
  basePrice: number;
  unit: "gram" | "ml" | "each" | "bunch" | "bulb" | "clove" | "pack";
  tier?: "essential" | "premium" | "pantry";
}

export const PRICE_DATABASE: Record<string, PricePoint> = {
  // --- PROTEIN (Price per gram) ---
  "chicken breast": { basePrice: 0.013, unit: "gram" }, // $5.99/lb
  "chicken thigh": { basePrice: 0.010, unit: "gram" }, // $4.49/lb
  "ground beef": { basePrice: 0.015, unit: "gram" }, // $6.99/lb
  "steak": { basePrice: 0.033, unit: "gram" }, // $14.99/lb
  "lamb": { basePrice: 0.026, unit: "gram" }, // $11.99/lb
  "pork": { basePrice: 0.009, unit: "gram" }, // $3.99/lb
  "salmon": { basePrice: 0.028, unit: "gram" }, // $12.99/lb
  "shrimp": { basePrice: 0.022, unit: "gram" }, // $9.99/lb
  "tuna": { basePrice: 0.018, unit: "gram" }, // $7.99/lb
  "cod": { basePrice: 0.020, unit: "gram" }, // $8.99/lb
  "tofu": { basePrice: 0.006, unit: "gram" }, // $2.75 / 14oz
  "tempeh": { basePrice: 0.011, unit: "gram" },
  "turkey": { basePrice: 0.009, unit: "gram" },
  "duck": { basePrice: 0.022, unit: "gram" },
  "chickpeas": { basePrice: 0.003, unit: "gram" }, // $1.25 per 15oz can
  "lentils": { basePrice: 0.004, unit: "gram" },
  "black beans": { basePrice: 0.003, unit: "gram" },

  // --- PRODUCE (Price per piece/each) ---
  "onion": { basePrice: 0.15, unit: "each" },
  "garlic": { basePrice: 0.10, unit: "clove" },
  "ginger": { basePrice: 0.50, unit: "each" }, // per knob
  "lemon": { basePrice: 0.89, unit: "each" },
  "lime": { basePrice: 0.69, unit: "each" },
  "avocado": { basePrice: 1.99, unit: "each" },
  "apple": { basePrice: 1.25, unit: "each" },
  "banana": { basePrice: 0.29, unit: "each" },
  "orange": { basePrice: 1.10, unit: "each" },
  "bell pepper": { basePrice: 1.50, unit: "each" },
  "potato": { basePrice: 0.75, unit: "each" },
  "sweet potato": { basePrice: 1.25, unit: "each" },
  "carrot": { basePrice: 0.50, unit: "each" },
  "celery": { basePrice: 2.99, unit: "each" }, // per stalk/bunch
  "tomato": { basePrice: 0.99, unit: "each" },
  "cucumber": { basePrice: 1.25, unit: "each" },
  "broccoli": { basePrice: 2.49, unit: "each" }, // per head
  "cauliflower": { basePrice: 3.99, unit: "each" },
  "cabbage": { basePrice: 2.50, unit: "each" },
  "lettuce": { basePrice: 2.25, unit: "each" },
  "spinach": { basePrice: 0.015, unit: "gram" }, // $4.49 for 10oz
  "kale": { basePrice: 2.99, unit: "bunch" },
  "parsley": { basePrice: 1.50, unit: "bunch" },
  "cilantro": { basePrice: 1.25, unit: "bunch" },
  "basil": { basePrice: 2.99, unit: "bunch" },
  "mint": { basePrice: 2.50, unit: "bunch" },
  "thyme": { basePrice: 2.50, unit: "bunch" },
  "rosemary": { basePrice: 2.50, unit: "bunch" },
  "scallion": { basePrice: 1.25, unit: "bunch" },
  "mushroom": { basePrice: 0.012, unit: "gram" },

  // --- DAIRY & EGGS ---
  "milk": { basePrice: 0.001, unit: "ml" }, // $3.99/gallon
  "cream": { basePrice: 0.008, unit: "ml" }, // $3.99/pint
  "butter": { basePrice: 0.013, unit: "gram" }, // $5.99/lb
  "egg": { basePrice: 0.35, unit: "each" }, // $4.20/dozen
  "yogurt": { basePrice: 0.008, unit: "gram" },
  "cheddar": { basePrice: 0.018, unit: "gram" },
  "parmesan": { basePrice: 0.022, unit: "gram" },
  "mozzarella": { basePrice: 0.015, unit: "gram" },
  "feta": { basePrice: 0.018, unit: "gram" },
  "sour cream": { basePrice: 0.006, unit: "gram" },

  // --- PANTRY (Grains, Oils, Spices) ---
  "rice": { basePrice: 0.0016, unit: "gram" }, // $3.49 / 2kg
  "flour": { basePrice: 0.0007, unit: "gram" }, // $3.49 / 5lb
  "quinoa": { basePrice: 0.008, unit: "gram" },
  "couscous": { basePrice: 0.006, unit: "gram" },
  "pasta": { basePrice: 0.003, unit: "gram" }, // $1.49 / 500g
  "noodle": { basePrice: 0.005, unit: "gram" },
  "olive oil": { basePrice: 0.012, unit: "ml" }, // $8.99 / 750ml
  "vegetable oil": { basePrice: 0.004, unit: "ml" },
  "soy sauce": { basePrice: 0.008, unit: "ml" },
  "honey": { basePrice: 0.015, unit: "gram" },
  "sugar": { basePrice: 0.001, unit: "gram" },
  "coconut milk": { basePrice: 0.006, unit: "ml" }, // $2.49 / 400ml
  "broth": { basePrice: 0.003, unit: "ml" }, // $2.99 / 1L
  "stock": { basePrice: 0.004, unit: "ml" },
  "saffron": { basePrice: 12.00, unit: "gram" }, // Very expensive!
  "cumin": { basePrice: 0.025, unit: "gram" },
  "paprika": { basePrice: 0.020, unit: "gram" },
  "salt": { basePrice: 0.0005, unit: "gram" },
  "pepper": { basePrice: 0.015, unit: "gram" },
  "bread": { basePrice: 3.99, unit: "pack" },

  // --- SPECIALTY (Add more as needed) ---
  "truffle": { basePrice: 5.00, unit: "gram" },
  "caviar": { basePrice: 15.00, unit: "gram" },
  "parma ham": { basePrice: 0.06, unit: "gram" },
  "pine nuts": { basePrice: 0.05, unit: "gram" }
};

/**
 * Gets the price for an ingredient by name, with fuzzy matching
 */
export function getPricePoint(name: string): PricePoint | undefined {
  const n = name.toLowerCase();
  
  // Try exact match first
  if (PRICE_DATABASE[n]) return PRICE_DATABASE[n];
  
  // Fuzzy match (contains)
  for (const [key, value] of Object.entries(PRICE_DATABASE)) {
    if (n.includes(key)) return value;
  }
  
  return undefined;
}

/**
 * General category baseline prices per gram (for unknown items)
 */
export const CATEGORY_BASELINES: Record<string, number> = {
  meat_seafood: 0.020,
  produce: 0.005,
  dairy_eggs: 0.008,
  pantry: 0.004,
  grains: 0.003,
  herbs_spices: 0.015,
  oils_condiments: 0.008,
  beverages: 0.002,
  other: 0.005
};
