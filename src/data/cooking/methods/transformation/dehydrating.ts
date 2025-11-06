import type { CookingMethodData } from "@/types/cookingMethod";
import type { CookingMethod } from "@/types/shared";

/**
 * Dehydrating: A preservation method that removes moisture from food,
 * concentrating flavors and extending shelf life
 */
export const _dehydrating: CookingMethodData = {
  name: "Dehydrating" as CookingMethod,
  description:
    "A preservation method that removes moisture from food through controlled evaporation, concentrating flavors and nutrients while extending shelf life.",
  elementalEffect: {
    Fire: 0.4,
    Water: 0.1,
    Earth: 0.2,
    Air: 0.9,
  },
  duration: {
    min: 120, // 2 hours
    max: 2880, // 48 hours
  },
  suitable_for: [
    "Fruits",
    "Vegetables",
    "Herbs",
    "Meats",
    "Mushrooms",
    "Flowers",
    "Seeds",
  ],
  benefits: [
    "Preserves most nutrients",
    "Creates lightweight, portable food",
    "No additives or preservatives needed",
    "Concentrates antioxidants and nutrients",
    "Reduces food waste",
  ],
  history:
    "Dehydration is one of humanity's oldest food preservation techniques, dating back to prehistoric times. Sun-drying fruits, vegetables, and meats was practiced across ancient civilizations including Egypt, China, and the Middle East.",
  modernVariations: [
    "Sun drying (traditional method using solar heat)",
    "Air drying (hanging in a cool, dry place)",
    "Oven drying (using low heat in a conventional oven)",
    "Food dehydrator (using specialized equipment)",
    "Freeze-drying (removing water through sublimation)",
  ],
  optimalTemperatures: {
    low: 35, // °C (95°F)
    high: 70, // °C (158°F)
  },
  toolsRequired: [
    "Food dehydrator",
    "Oven",
    "Drying racks",
    "Cheesecloth",
    "Parchment paper",
    "Knife or mandoline for thin slicing",
    "Airtight containers for storage",
  ],
  healthConsiderations: [
    "Concentrated sugars in dried fruits",
    "Potential loss of heat-sensitive vitamins",
    "Proper storage needed to prevent moisture reabsorption",
    "Insufficient drying can lead to mold growth",
  ],
};

export const dehydrating = _dehydrating;
