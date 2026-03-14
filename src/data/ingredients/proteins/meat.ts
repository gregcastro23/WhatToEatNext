import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawMeats: Record<string, Partial<IngredientMapping>> = {
  beef: {
    name: "Beef",
    description:
      "Red meat from cattle, available in various cuts with different properties.",
    category: "proteins",
    qualities: ["robust", "rich", "substantial"],
    sustainabilityScore: 2,
    season: ["all"],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.7, Water: 0.1, Earth: 0.2, Air: 0.0 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["Aries", "Taurus", "Capricorn"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 200, unit: "g" }, // Standard serving: 7oz steak
    scaledElemental: { Fire: 0.67, Water: 0.11, Earth: 0.22, Air: 0.0 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.335,
      Essence: 0.055,
      Matter: 0.11,
      Substance: 0.22,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.25, forceMagnitude: 1.18 }, // Strong warming, high force
    nutritionalProfile: {
      serving_size: "3 oz (85g)",
      calories: 213,
      macros: {
        protein: 22,
        carbs: 0,
        fat: 13,
        fiber: 0,
        saturatedFat: 5,
        sugar: 0,
        potassium: 270,
        sodium: 60,
      },
      vitamins: {
        B12: 1.04,
        B6: 0.29,
        niacin: 0.36,
        riboflavin: 0.12,
        thiamin: 0.05,
      },
      minerals: {
        zinc: 0.47,
        iron: 0.14,
        phosphorus: 0.18,
        selenium: 0.33,
        magnesium: 0.05,
      },
    },
    sensoryProfile: {
      taste: ["Mild", "Balanced", "Natural"],
      aroma: ["Fresh", "Clean", "Subtle"],
      texture: ["Pleasant", "Smooth", "Appealing"],
      notes: "Characteristic beef profile",
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
        secondary: ["versatile"],
        notes: "Versatile beef for various uses",
      },
      cookingMethods: ["grilling", "roasting", "braising"],
      cuisineAffinity: ["american", "european"],
      preparationTips: [
        "allow to reach room temperature before cooking",
        "season generously",
      ],
    },
  },
  // chicken removed — canonical definition is in poultry.ts
  pork: {
    name: "Pork",
    description: "Meat from pigs, known for its rich flavor and versatility.",
    category: "proteins",
    qualities: ["rich", "savory", "versatile"],
    sustainabilityScore: 3,
    season: ["all"],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.4, Water: 0.4, Earth: 0.2, Air: 0.0 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Jupiter"],
      favorableZodiac: ["Taurus", "Sagittarius", "Libra"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 180, unit: "g" }, // Standard serving: 6oz chop
    scaledElemental: { Fire: 0.39, Water: 0.41, Earth: 0.2, Air: 0.0 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.195,
      Essence: 0.305,
      Matter: 0.205,
      Substance: 0.1,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.18, forceMagnitude: 1.08 }, // Moderate warming, moderate force
    nutritionalProfile: {
      serving_size: "3 oz (85g)",
      calories: 206,
      macros: {
        protein: 23,
        carbs: 0,
        fat: 12,
        fiber: 0,
        saturatedFat: 4.4,
        sugar: 0,
        potassium: 292,
        sodium: 48,
      },
      vitamins: {
        thiamin: 0.54,
        B6: 0.21,
        niacin: 0.28,
        B12: 0.25,
        riboflavin: 0.15,
      },
      minerals: {
        selenium: 0.47,
        zinc: 0.15,
        phosphorus: 0.19,
        iron: 0.05,
        potassium: 0.08,
      },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory", "umami"],
        secondary: ["sweet"],
        notes: "Excellent with fruits like apple and cherry.",
      },
      cookingMethods: ["roasting", "braising", "grilling", "smoking"],
      cuisineAffinity: ["asian", "american", "german"],
      preparationTips: [
        "Do not overcook.",
        "Works well with rubs and marinades.",
      ],
    },
  },
  lamb: {
    name: "Lamb",
    description:
      "Meat from young sheep, with a distinct, slightly gamy flavor.",
    category: "proteins",
    qualities: ["tender", "gamy", "distinctive"],
    sustainabilityScore: 4,
    season: ["spring"],

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0.0 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 160, unit: "g" }, // Standard serving: 5.5oz chop
    scaledElemental: { Fire: 0.58, Earth: 0.31, Air: 0.11, Water: 0.0 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.345,
      Essence: 0.0,
      Matter: 0.155,
      Substance: 0.31,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.22, forceMagnitude: 1.15 }, // Strong warming, high force
    nutritionalProfile: {
      serving_size: "3 oz (85g)",
      calories: 175,
      macros: {
        protein: 24,
        carbs: 0,
        fat: 8,
        fiber: 0,
        saturatedFat: 3,
        sugar: 0,
        potassium: 264,
        sodium: 56,
      },
      vitamins: {
        B12: 0.93,
        niacin: 0.34,
        B6: 0.07,
        riboflavin: 0.13,
        pantothenic_acid: 0.08,
      },
      minerals: {
        zinc: 0.3,
        selenium: 0.37,
        phosphorus: 0.16,
        iron: 0.1,
        copper: 0.06,
      },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["gamy", "earthy"],
        secondary: ["herbaceous"],
        notes: "Complemented by herbs like rosemary and mint.",
      },
      cookingMethods: ["roasting", "grilling", "braising"],
      cuisineAffinity: ["mediterranean", "middle_eastern"],
      preparationTips: [
        "Best served medium-rare.",
        "Fat carries a lot of the flavor.",
      ],
    },
  },
};

export const _meats: Record<string, IngredientMapping> =
  fixIngredientMappings(rawMeats);
export const _meatNames = Object.keys(rawMeats);
