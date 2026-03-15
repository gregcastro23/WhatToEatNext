import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawFungi: Record<string, Partial<IngredientMapping>> = {
  mushrooms: {
    name: "mushrooms",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.22,
      Essence: 0.24,
      Matter: 0.30,
      Substance: 0.24,
    },
    qualities: ["nutritious", "versatile", "fresh", "umami"],
    category: "vegetables",
    subcategory: "fungi",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  cremini_mushrooms: {
    name: "cremini mushrooms",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.22,
      Essence: 0.24,
      Matter: 0.30,
      Substance: 0.24,
    },
    qualities: ["nutritious", "versatile", "fresh", "umami"],
    category: "vegetables",
    subcategory: "fungi",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
};

export const fungi: Record<string, IngredientMapping> = fixIngredientMappings(rawFungi);
