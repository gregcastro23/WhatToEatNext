import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawPoultry: Record<string, Partial<IngredientMapping>> = {
  turkey: {
    name: "Turkey",
    category: "poultry",

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.15, Water: 0.35, Air: 0.35, Earth: 0.15 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 170, unit: "g" }, // Standard serving: 6oz
    scaledElemental: { Fire: 0.14, Water: 0.36, Air: 0.36, Earth: 0.14 },
    alchemicalProperties: {
      Spirit: 0.255,
      Essence: 0.25,
      Matter: 0.07,
      Substance: 0.18,
    },
    kineticsImpact: { thermalDirection: 0.02, forceMagnitude: 0.88 },
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Mercury"],
      favorableZodiac: ["sagittarius", "virgo"],
      elementalAffinity: {
        base: "Air",
        secondary: "Water",
      } as any,
    },
    qualities: [
      "lean",
      "mild",
      "versatile",
      "nutritious",
      "festive",
      "high-protein",
    ],
    origin: ["North America", "domesticated worldwide"],
    sensoryProfile: {
      taste: ["Mild", "Savory", "Clean"],
      aroma: ["Fresh", "Clean", "Light"],
      texture: ["Tender", "Lean", "Firm"],
      notes: "Leaner than chicken with a slightly gamier flavor",
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["mild", "savory"],
        secondary: ["slightly sweet"],
        notes: "Versatile protein, excellent for holidays",
      },
      cookingMethods: ["roasting", "grilling", "smoking", "braising"],
      cuisineAffinity: ["American", "Mediterranean", "International"],
      preparationTips: ["Brine for moisture", "Don't overcook - use thermometer"],
    },
    season: ["year-round"],
    nutritionalProfile: {
      serving_size: "6 oz (170g)",
      calories: 153,
      macros: { protein: 29, carbs: 0, fat: 3.2, fiber: 0, saturatedFat: 1.0, sugar: 0, potassium: 298, sodium: 65 },
      vitamins: { B6: 0.4, niacin: 0.6, B12: 0.5 },
      minerals: { selenium: 0.5, phosphorus: 0.3, zinc: 0.2 },
      source: "USDA FoodData Central",
    },
    preparation: {
      methods: ["roast", "grill", "smoke", "braise"],
      timing: "varies by cut",
      notes: "Internal temperature 165°F (74°C)",
    },
  },

  duck: {
    name: "Duck",
    category: "poultry",

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.35, Water: 0.25, Air: 0.25, Earth: 0.15 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 150, unit: "g" }, // Standard serving: 5oz
    scaledElemental: { Fire: 0.34, Water: 0.26, Air: 0.26, Earth: 0.14 },
    alchemicalProperties: {
      Spirit: 0.30,
      Essence: 0.20,
      Matter: 0.07,
      Substance: 0.26,
    },
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 1.05 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Jupiter"],
      favorableZodiac: ["taurus", "libra", "sagittarius"],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      } as any,
    },
    qualities: [
      "rich",
      "luxurious",
      "gamey",
      "fatty",
      "flavorful",
      "succulent",
    ],
    origin: ["China", "France", "domesticated worldwide"],
    sensoryProfile: {
      taste: ["Rich", "Savory", "Gamey"],
      aroma: ["Aromatic", "Complex", "Earthy"],
      texture: ["Succulent", "Tender", "Crispy skin"],
      notes: "Rich flavor with prized crispy skin",
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["rich", "savory", "umami"],
        secondary: ["sweet"],
        notes: "Pairs well with fruits like orange, cherry",
      },
      cookingMethods: ["roasting", "confit", "grilling", "pan-searing"],
      cuisineAffinity: ["French", "Chinese", "Asian"],
      preparationTips: ["Score the skin", "Render the fat", "Rest before carving"],
    },
    season: ["autumn", "winter"],
    nutritionalProfile: {
      serving_size: "5 oz (150g)",
      calories: 337,
      macros: { protein: 19, carbs: 0, fat: 28, fiber: 0, saturatedFat: 9.7, sugar: 0, potassium: 209, sodium: 59 },
      vitamins: { B6: 0.2, niacin: 0.4, B12: 0.3 },
      minerals: { selenium: 0.4, iron: 0.3, zinc: 0.2 },
      source: "USDA FoodData Central",
    },
    preparation: {
      methods: ["roast", "confit", "pan-sear", "smoke"],
      timing: "medium-rare to medium for breast",
      notes: "Score skin to render fat properly",
    },
  },

  chicken: {
    name: "Chicken",

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.2, Water: 0.3, Air: 0.3, Earth: 0.2 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 150, unit: "g" }, // Standard serving: 5oz breast
    scaledElemental: { Fire: 0.19, Water: 0.31, Air: 0.31, Earth: 0.19 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.245,
      Matter: 0.095,
      Substance: 0.19,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.92 }, // Mild warming, gentle force
    astrologicalProfile: {
      rulingPlanets: ["Mercury"],
      favorableZodiac: ["virgo"],
      elementalAffinity: {
        base: "Air",
        secondary: "Water",
        sensoryProfile: {
          taste: ["Mild", "Balanced", "Natural"],
          aroma: ["Fresh", "Clean", "Subtle"],
          texture: ["Pleasant", "Smooth", "Appealing"],
          notes: "Characteristic chicken profile",
        },
        culinaryProfile: {
          flavorProfile: {
            primary: ["balanced"],
            secondary: ["versatile"],
            notes: "Versatile chicken for various uses",
          },
          cookingMethods: ["sautéing", "steaming", "roasting"],
          cuisineAffinity: ["Global", "International"],
          preparationTips: ["Use as needed", "Season to taste"],
        },
        season: ["year-round"],
      } as any,
    },
    qualities: [
      "adaptable",
      "mild",
      "versatile",
      "light",
      "neutral",
      "balancing",
    ],
    category: "poultry",
    origin: [
      "domesticated worldwide",
      "ancestor is the red junglefowl of Southeast Asia",
    ],
    varieties: {
      broiler: {
        name: "Broiler / Fryer",
        characteristics: "young and tender, usually 7-10 weeks old, 2-5 pounds",
        best_cooking_methods: ["roasting", "frying", "grilling", "sautéing"],
        notes: "Most common commercial chicken, versatile for most recipes",
      },
    },
    sensoryProfile: {
      taste: ["Mild", "Balanced", "Natural"],
      aroma: ["Fresh", "Clean", "Subtle"],
      texture: ["Pleasant", "Smooth", "Appealing"],
      notes: "Characteristic chicken profile",
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
        secondary: ["versatile"],
        notes: "Versatile chicken for various uses",
      },
      cookingMethods: ["sautéing", "steaming", "roasting"],
      cuisineAffinity: ["Global", "International"],
      preparationTips: ["Use as needed", "Season to taste"],
    },
    season: ["year-round"],
    nutritionalProfile: {
      serving_size: "5 oz (150g)",
      calories: 165,
      macros: { protein: 31, carbs: 0, fat: 3.6, fiber: 0, saturatedFat: 1.0, sugar: 0, potassium: 256, sodium: 74 },
      vitamins: { B6: 0.5, niacin: 0.7, B12: 0.3 },
      minerals: { selenium: 0.4, phosphorus: 0.3, zinc: 0.1 },
      source: "USDA FoodData Central",
    },
    preparation: {
      methods: ["standard preparation"],
      timing: "as needed",
      notes: "Standard preparation for chicken",
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const poultry: Record<string, IngredientMapping> =
  fixIngredientMappings(rawPoultry);

// Create a collection of all poultry items
export const _allPoultry = Object.values(poultry);

export default poultry;
