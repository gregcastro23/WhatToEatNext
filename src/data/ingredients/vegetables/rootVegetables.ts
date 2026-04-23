import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawRootVegetables = {
  "sweet potato": {
      description: "Sweet Potato is a vegetable ingredient that contributes structure, micronutrients, and a broad range of textures depending on cut and heat level. High heat emphasizes caramelization and sweetness, while gentle cooking preserves water content and delicate notes. Prep consistently so pieces cook evenly and integrate cleanly into the dish.",
    name: "Sweet potato",

    // Base elemental properties (unscaled)
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 114, unit: "g" }, // Standard serving: 1 medium sweet potato
    scaledElemental: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.1,
      Matter: 0.3,
      Substance: 0.4,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.15, forceMagnitude: 1.08 }, // Warming effect, moderate force
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer", "virgo"],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Venus" },
          second: { element: "Water", planet: "Moon" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
    },
    qualities: ["grounding", "warming", "nourishing"],
    season: ["fall", "winter"],
    category: "vegetables",
    subCategory: "root",
    affinities: ["cinnamon", "butter", "maple", "pecans", "coconut"],
    cookingMethods: ["roasted", "steamed", "mashed", "grilled"],
    nutritionalProfile: {
      fiber: "high",
      vitamins: ["a", "c", "b6"],
      minerals: ["potassium", "manganese"],
      calories: 103,
      carbs_g: 24,
      fiber_g: 4,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    preparation: {
      washing: true,
      peeling: "optional",
      cutting: "uniform size for even cooking",
      notes: "Can be pre-cooked and reheated",
    },
    storage: {
      temperature: "cool dark place",
      duration: "3-5 weeks",
      notes: "Do not refrigerate raw",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Sweet Potato is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},

  parsnip: {
      description: "A pale, cream-colored root vegetable (*Pastinaca sativa*) closely related to the carrot. It is profoundly starchy and packs an intense, woody sweetness with distinct notes of nutmeg and spiced cider, making it ideal for roasting until deeply caramelized.",
    name: "Parsnip",
    elementalProperties: { Earth: 0.5, Air: 0.2, Fire: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["virgo", "gemini", "taurus"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["grounding", "warming", "nourishing"],
    season: ["fall", "winter"],
    category: "vegetables",
    subCategory: "root",
    affinities: ["nutmeg", "cream", "maple", "thyme", "apple"],
    cookingMethods: ["roasted", "mashed", "soup", "fried"],
    nutritionalProfile: {
      fiber: "high",
      vitamins: ["c", "e", "k"],
      minerals: ["folate", "potassium", "manganese"],
      calories: 75,
      carbs_g: 18,
      fiber_g: 5,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    preparation: {
      washing: true,
      peeling: "recommended",
      cutting: "uniform pieces",
      notes: "Smaller ones are more tender",
    },
    storage: {
      temperature: "refrigerated",
      duration: "2-3 weeks",
      humidity: "high",
      notes: "Store in plastic bag with holes",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Parsnip is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},

  beet: {
      description: "An earthy, vividly colored root vegetable (*Beta vulgaris*) rich in natural sugars and betalains, the antioxidant pigments responsible for its deep red-purple hue. Its earthy flavor is due to geosmin, an organic compound that pairs exceptionally well with bright acids and rich dairy.",
    name: "Beet",
    elementalProperties: { Earth: 0.6, Fire: 0.2, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["capricorn", "aries", "scorpio"],
      seasonalAffinity: ["fall", "winter"],
    },
    qualities: ["grounding", "building", "cleansing"],
    season: ["fall", "winter"],
    category: "vegetables",
    subCategory: "root",
    affinities: ["goat cheese", "walnuts", "orange", "dill", "balsamic"],
    cookingMethods: ["roasted", "raw", "steamed", "pickled"],
    nutritionalProfile: {
      fiber: "high",
      vitamins: ["c", "b9", "b6"],
      minerals: ["iron", "manganese", "potassium"],
      calories: 43,
      carbs_g: 10,
      fiber_g: 2.8,
      antioxidants: ["betalains", "nitrates"],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    preparation: {
      washing: true,
      peeling: "after cooking",
      roasting: "wrap in foil with olive oil",
      notes: "Wear gloves to prevent staining",
    },
    storage: {
      temperature: "refrigerated",
      duration: "2-3 weeks",
      humidity: "high",
      notes: "Remove greens, store separately",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Beet is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},

  turnip: {
      description: "A round, white root vegetable with a purple top (*Brassica rapa*) belonging to the mustard family. It has a crisp texture and a mild, slightly peppery, cabbage-like flavor that sweetens when cooked, making it an excellent, low-starch alternative to potatoes in purees and stews.",
    name: "Turnip",
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Moon"],
      favorableZodiac: ["capricorn", "cancer", "taurus"],
      seasonalAffinity: ["fall", "winter"],
    },
    qualities: ["cooling", "cleansing"],
    season: ["fall", "winter", "spring"],
    category: "vegetables",
    subCategory: "root",
    affinities: ["butter", "cream", "mustard", "thyme", "bacon"],
    cookingMethods: ["roasted", "mashed", "braised", "raw"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: ["c", "k", "a"],
      minerals: ["calcium", "potassium"],
      calories: 28,
      carbs_g: 6,
      fiber_g: 2,
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    preparation: {
      washing: true,
      peeling: "recommended for larger ones",
      cutting: "uniform pieces",
      notes: "Smaller ones are sweeter",
    },
    storage: {
      temperature: "refrigerated",
      duration: "2-3 weeks",
      humidity: "high",
      notes: "Store in plastic bag with holes",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Turnip is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const _rootVegetables: Record<string, IngredientMapping> =
  fixIngredientMappings(
    rawRootVegetables as Record<string, Partial<IngredientMapping>>,
  );
