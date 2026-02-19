import type { CookingMethodData } from "@/types/cookingMethod";
import type { CookingMethod } from "@/types/shared";

/**
 * Curing: A food preservation method that removes moisture and enhances flavor
 * through the addition of salt, sugar, nitrates, or other compounds
 */
export const curing: CookingMethodData = {
  name: "Curing" as CookingMethod,
  description:
    "A preservation technique that draws moisture out of food through the use of salt, sugar, nitrates, or other compounds, thereby inhibiting bacterial growth and enhancing flavor.",
  elementalEffect: {
    Fire: 0.1,
    Water: 0.2,
    Earth: 0.8,
    Air: 0.3,
  },
  duration: {
    min: 180, // 3 hours
    max: 8640, // 6 months (in minutes)
  },
  suitable_for: ["Meats", "Fish", "Vegetables", "Eggs", "Citrus peels"],
  benefits: [
    "Preservation without artificial additives",
    "Enhanced flavor development",
    "Some fermented cured products contain beneficial probiotics",
  ],
  history:
    "Curing dates back to ancient civilizations where salt was used to preserve meat and fish. It was essential for food preservation before refrigeration and allowed food to be stored and transported over long distances.",
  modernVariations: [
    "Dry curing (with salt and spices)",
    "Wet curing/brining (submerged in salt solution)",
    "Equilibrium curing (precise salt percentage)",
    "Sugar curing (using sugar as primary agent)",
    "Nitrate/nitrite curing (using pink salt)",
  ],
  optimalTemperatures: {
    refrigeration: 1, // °C (refrigeration temperature)
    cool: 18, // °C (cool room temperature)
  },
  toolsRequired: [
    "Salt",
    "Curing salts",
    "Airtight containers",
    "Cheesecloth",
    "Hooks for hanging",
    "Weights for pressing",
    "Refrigerator or cool storage",
  ],
  healthConsiderations: [
    "High sodium content",
    "Nitrates and nitrites used in some curing may form nitrosamines",
    "Proper technique is essential to prevent harmful bacterial growth",
  ],
  thermodynamicProperties: {
    heat: 0.2, // Low heat, mostly time-based transformation
    entropy: 0.45, // Moderate preservation transformation
    reactivity: 0.35, // Slow chemical changes
    gregsEnergy: 0.0425, // heat - (entropy × reactivity)
  } as any,

  kineticProfile: {
    voltage: 0.10,            // Ambient or cold temp — osmotic pressure, not heat
    current: 0.12,            // Salt/sugar osmosis — extremely slow molecular transfer
    resistance: 0.80,         // Very high — cellular membranes resist salt penetration
    velocityFactor: 0.08,     // Slowest method — days to weeks for full cure
    momentumRetention: 0.95,  // Highest of all methods — cured food lasts months/years
    forceImpact: 0.60,        // Significant — dehydration and protein cross-linking
  },
};
