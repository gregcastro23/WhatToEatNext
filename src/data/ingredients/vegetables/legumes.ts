import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawLegumes: Record<string, Partial<IngredientMapping>> = {
  chickpeas: {
    name: "chickpeas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["hearty", "protein-rich", "versatile"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["all"],
    },
    nutritionalProfile: {
      serving_size: "1 cup cooked (164g)",
      calories: 269,
      macros: {
        protein: 15,
        carbs: 45,
        fat: 4.2,
        fiber: 12.5,
        saturatedFat: 0.4,
        sugar: 8,
        potassium: 477,
        sodium: 11,
      },
      vitamins: { folate: 0.71, B6: 0.11, thiamin: 0.12, C: 0.04 },
      minerals: {
        manganese: 0.84,
        copper: 0.29,
        phosphorus: 0.28,
        iron: 0.26,
        zinc: 0.17,
        magnesium: 0.19,
      },
    },
  },
  dried_chickpeas: {
    name: "dried chickpeas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  peanuts: {
    name: "peanuts",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  crushed_peanuts: {
    name: "crushed peanuts",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
};

export const legumes: Record<string, IngredientMapping> = fixIngredientMappings(rawLegumes);
