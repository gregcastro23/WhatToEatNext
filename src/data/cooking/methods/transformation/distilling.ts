import type { CookingMethodData } from "@/types/cookingMethod";
import type { CookingMethod } from "@/types/shared";

/**
 * Distilling: A process that separates and concentrates flavors, aromas, and other
 * compounds through evaporation and condensation
 */
export const _distilling: CookingMethodData = {
  name: "Distilling" as CookingMethod,
  description:
    "A process that separates and concentrates volatile compounds by vaporizing them and then recondensing the vapor, used to extract essential flavors, aromas, and alcohols.",
  elementalEffect: {
    Fire: 0.8,
    Water: 0.3,
    Earth: 0.1,
    Air: 0.6,
  },
  duration: {
    min: 60, // 1 hour
    max: 480, // 8 hours
  },
  suitable_for: [
    "Herbs",
    "Flowers",
    "Fruits",
    "Grains",
    "Spices",
    "Fermented liquids",
  ],
  benefits: [
    "Creates concentrated extracts with medicinal properties",
    "Removes impurities from volatile compounds",
    "Preserves delicate aromas that might be lost in other extraction methods",
  ],
  history:
    "Distillation has ancient origins, with evidence of the technique dating back to at least 3000 BCE in Mesopotamia. It was further developed by alchemists and has been crucial in perfumery, medicine, and spirits production throughout history.",
  modernVariations: [
    "Simple distillation (single vaporization and condensation)",
    "Fractional distillation (multiple vaporization-condensation cycles)",
    "Steam distillation (for heat-sensitive plant materials)",
    "Vacuum distillation (at lower temperatures)",
    "Molecular distillation (for specific compounds at very low pressures)",
  ],
  optimalTemperatures: {
    ethanol: 78, // °C (ethanol boiling point)
    essential: 200, // °C (for higher boiling point compounds)
  },
  toolsRequired: [
    "Still (pot still or column still)",
    "Condenser",
    "Collection vessel",
    "Heat source",
    "Thermometer",
    "Cooling system",
    "Hydrometer (for measuring alcohol content)",
  ],
  healthConsiderations: [
    "Home distillation of alcohol is illegal in many places",
    "Improperly distilled spirits can contain harmful compounds like methanol",
    "Concentrated plant compounds can be toxic if not properly identified",
    "High proof spirits should be consumed in moderation",
  ],
  thermodynamicProperties: {
    heat: 0.9, // High heat for vaporization
    entropy: 0.85, // Very high transformation through phase change
    reactivity: 0.85, // High chemical transformation
    gregsEnergy: 0.1775, // heat - (entropy × reactivity)
  } as any,

  kineticProfile: {
    voltage: 0.88,            // 173-212°F — high heat for vaporization
    current: 0.55,            // Phase-change transfer — energy absorbed by evaporation
    resistance: 0.45,         // Moderate — condenser efficiency determines output
    velocityFactor: 0.40,     // Moderate — continuous process but slow collection
    momentumRetention: 0.80,  // High — distilled product is concentrated and stable
    forceImpact: 0.90,        // Maximum — complete molecular separation
  },
};

export const distilling = _distilling;
