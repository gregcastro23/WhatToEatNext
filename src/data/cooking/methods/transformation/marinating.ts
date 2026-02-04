import type { CookingMethodData } from "@/types/cookingMethod";
import type { CookingMethod } from "@/types/shared";

/**
 * Marinating: A technique that soaks food in a flavorful liquid to enhance taste,
 * tenderize, and sometimes partially preserve it
 */
export const _marinating: CookingMethodData = {
  name: "Marinating" as CookingMethod,
  description:
    "A technique that immerses food in a seasoned liquid mixture to enhance flavor, tenderize textures, and sometimes begin the preservation or cooking process.",
  elementalEffect: {
    Fire: 0.2,
    Water: 0.7,
    Earth: 0.3,
    Air: 0.1,
  },
  duration: {
    min: 15, // 15 minutes
    max: 1440, // 24 hours
  },
  suitable_for: [
    "Meats",
    "Poultry",
    "Fish",
    "Seafood",
    "Vegetables",
    "Tofu",
    "Fruits",
  ],
  benefits: [
    "Can infuse foods with antioxidants from herbs and spices",
    "Reduces formation of harmful compounds during high-heat cooking",
    "Tenderizes tough cuts of meat without mechanical processing",
    "Can reduce salt needed for flavoring",
  ],
  history:
    "Marinating has been practiced for thousands of years, originally as a preservation method using acidic liquids like vinegar or citrus juice. The technique evolved across cultures, with each developing unique marinades reflecting local ingredients and tastes.",
  modernVariations: [
    "Acid-based marinades (with vinegar, citrus, wine)",
    "Enzyme-based marinades (with pineapple, papaya, yogurt)",
    "Oil-based marinades (with herbs and spices in oil)",
    "Dry marinades/rubs (with salt and spices)",
    "Brines (salt water solutions)",
    "Ceviche (acid 'cooking' of fish)",
  ],
  optimalTemperatures: {
    refrigeration: 1, // °C (refrigeration temperature)
    storage: 4, // °C (safe refrigeration)
  },
  toolsRequired: [
    "Non-reactive containers (glass, ceramic, plastic)",
    "Resealable bags",
    "Whisk",
    "Measuring tools",
    "Refrigerator",
    "Plastic wrap",
    "Timer",
  ],
  healthConsiderations: [
    "Marinades that contain raw meat should not be reused without cooking",
    "Acidic marinades can 'cook' seafood if left too long",
    "Some marinades contain high amounts of sodium, sugar, or fat",
    "Proper refrigeration is essential for food safety",
  ],
  thermodynamicProperties: {
    heat: 0.1, // No heat, cold marination
    entropy: 0.25, // Low structural change
    reactivity: 0.5, // Moderate flavor penetration
    gregsEnergy: -0.025, // heat - (entropy × reactivity)
  } as any,
};

export const marinating = _marinating;
