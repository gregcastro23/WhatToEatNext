import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Herbs ingredients extracted from cuisine files
const rawHerbs: Record<string, Partial<IngredientMapping>> = {
  pork_sausage: {
    name: "pork sausage",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  thyme: {
    name: "thyme",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  fresh_thyme: {
    name: "fresh thyme",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  sage: {
    name: "sage",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  fresh_mint: {
    name: "fresh mint",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  fresh_sage: {
    name: "fresh sage",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  bay_leaf: {
    name: "bay leaf",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  flat_leaf_parsley: {
    name: "flat-leaf parsley",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  oregano: {
    name: "oregano",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  parsley: {
    name: "parsley",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  mint: {
    name: "mint",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  dill: {
    name: "dill",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  bay_leaves: {
    name: "bay leaves",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  rosemary: {
    name: "rosemary",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  mint_leaves: {
    name: "mint leaves",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  fresh_basil: {
    name: "fresh basil",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
  cilantro: {
    name: "cilantro",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },
};

// Export processed ingredients
export const herbsIngredients = fixIngredientMappings(rawHerbs);
