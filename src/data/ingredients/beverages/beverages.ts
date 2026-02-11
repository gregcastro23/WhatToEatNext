import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Beverages ingredients extracted from cuisine files
const rawBeverages: Record<string, Partial<IngredientMapping>> = {
  red_wine_vinaigrette: {
    name: "red wine vinaigrette",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "15ml",
      calories: 45,
      macros: { protein: 0, carbs: 1, fat: 4.5, fiber: 0 },
      vitamins: {},
      minerals: { sodium: 200, potassium: 10 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  clam_juice: {
    name: "clam juice",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "240ml",
      calories: 5,
      macros: { protein: 1, carbs: 0, fat: 0, fiber: 0 },
      vitamins: { B12: 0.01 },
      minerals: { sodium: 560, iron: 11.9, potassium: 300 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  white_wine: {
    name: "white wine",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "150ml",
      calories: 121,
      macros: { protein: 0.1, carbs: 3.8, fat: 0, fiber: 0 },
      vitamins: { B2: 0.02, B6: 0.05 },
      minerals: { potassium: 104, phosphorus: 18, magnesium: 10 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  red_wine: {
    name: "red wine",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "150ml",
      calories: 125,
      macros: { protein: 0.1, carbs: 3.8, fat: 0, fiber: 0 },
      vitamins: { B2: 0.03, B6: 0.06 },
      minerals: { potassium: 187, phosphorus: 23, magnesium: 15, iron: 0.7 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  turkey_stock: {
    name: "turkey stock",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "240ml",
      calories: 10,
      macros: { protein: 1, carbs: 1, fat: 0.2, fiber: 0 },
      vitamins: {},
      minerals: { sodium: 480, potassium: 210 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  water: {
    name: "Water",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "240ml",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: { calcium: 7, magnesium: 2, potassium: 0 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  baking_soda: {
    name: "baking soda",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "5g",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: { sodium: 1259 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  coffee: {
    name: "coffee",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "240ml",
      calories: 2,
      macros: { protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
      vitamins: { B2: 0.18, B3: 0.45, B5: 0.6 },
      minerals: { potassium: 116, magnesium: 7, manganese: 0.05 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  dry_white_wine: {
    name: "dry white wine",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "150ml",
      calories: 118,
      macros: { protein: 0.1, carbs: 2.9, fat: 0, fiber: 0 },
      vitamins: { B2: 0.02 },
      minerals: { potassium: 104, phosphorus: 18 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  white_wine_vinegar: {
    name: "white wine vinegar",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "15ml",
      calories: 3,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: { potassium: 2, sodium: 1, calcium: 1 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  tea_bags: {
    name: "tea bags",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "240ml",
      calories: 2,
      macros: { protein: 0, carbs: 0.5, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: { potassium: 87, manganese: 0.52, magnesium: 3 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  rose_water: {
    name: "rose water",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "15ml",
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      vitamins: {},
      minerals: {},
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
  water_chestnuts: {
    name: "water chestnuts",
    elementalProperties: { Fire: 0.1, Water: 0.6, Earth: 0.1, Air: 0.2 },
    nutritionalProfile: {
      serving_size: "100g",
      calories: 97,
      macros: { protein: 1.4, carbs: 23.9, fat: 0.1, fiber: 3 },
      vitamins: { B6: 0.33, C: 4, B2: 0.2 },
      minerals: { potassium: 584, manganese: 0.33, copper: 0.33, phosphorus: 63 },
    },
    qualities: ["hydrating", "flavorful", "versatile"],
    category: "beverages",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Pisces"],
      seasonalAffinity: ["all"],
    },
  },
};

// Export processed ingredients
export const beveragesIngredients = fixIngredientMappings(rawBeverages);
