import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Oils ingredients extracted from cuisine files
const rawOils: Record<string, Partial<IngredientMapping>> = {
  vegetable_oil: {
    name: "vegetable oil",
    elementalProperties: { Fire: 0.35, Water: 0.35, Earth: 0.2, Air: 0.1 },
    qualities: ["fatty", "flavor-enhancer", "versatile"],
    category: "oils",
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus"],
      favorableZodiac: ["Leo", "Libra", "Taurus"],
      seasonalAffinity: ["all"],
    },
  },
  sesame_oil: {
    name: "sesame oil",
    elementalProperties: { Fire: 0.35, Water: 0.35, Earth: 0.2, Air: 0.1 },
    qualities: ["fatty", "flavor-enhancer", "versatile"],
    category: "oils",
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus"],
      favorableZodiac: ["Leo", "Libra", "Taurus"],
      seasonalAffinity: ["all"],
    },
  },
};

// Export processed ingredients
export const oilsIngredients = fixIngredientMappings(rawOils);
