import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawStarchy: Record<string, Partial<IngredientMapping>> = {
  potatoes: {
    name: "potatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.12,
      Essence: 0.20,
      Matter: 0.36,
      Substance: 0.32,
    },
    qualities: ["nutritious", "versatile", "fresh", "grounding"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  potato: {
    name: "potato",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.12,
      Essence: 0.20,
      Matter: 0.36,
      Substance: 0.32,
    },
    qualities: ["nutritious", "versatile", "fresh", "grounding"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  russet_potatoes: {
    name: "russet potatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.11,
      Essence: 0.19,
      Matter: 0.37,
      Substance: 0.33,
    },
    qualities: ["nutritious", "versatile", "fresh", "starchy"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  sweet_potato: {
    name: "sweet potato",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.22,
      Matter: 0.34,
      Substance: 0.30,
    },
    qualities: ["nutritious", "versatile", "fresh", "sweet"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  potato_starch: {
    name: "potato starch",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.08,
      Essence: 0.16,
      Matter: 0.40,
      Substance: 0.36,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  sweet_potato_noodles: {
    name: "sweet potato noodles",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.12,
      Essence: 0.20,
      Matter: 0.36,
      Substance: 0.32,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  tapioca_pearls: {
    name: "tapioca pearls",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.18,
      Matter: 0.38,
      Substance: 0.34,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "starchy",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
};

export const starchy: Record<string, IngredientMapping> = fixIngredientMappings(rawStarchy);
