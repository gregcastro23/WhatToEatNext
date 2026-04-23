import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawCruciferous: Record<string, Partial<IngredientMapping>> = {
  cauliflower: {
      description: "A versatile, mildly sweet cruciferous vegetable (*Brassica oleracea var. botrytis*) composed of undeveloped flower buds. Its neutral flavor and dense structure make it a culinary chameleon, easily absorbing strong spices, roasting to a nutty caramelization, or pureeing into a creamy, starch-free mash.",
    name: "Cauliflower",

    // Base elemental properties (unscaled)
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 100, unit: "g" }, // Standard serving: 1 cup chopped
    scaledElemental: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.15,
      Essence: 0.55,
      Matter: 0.50,
      Substance: 0.45,
    }, // Independent dimensions (0.0-1.0 each)
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 0.95 }, // Cooling effect, gentle force
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn", "Moon"],
      favorableZodiac: ["virgo", "capricorn", "cancer", "taurus"],
      elementalAffinity: {
        base: "Air",
      },
      seasonalAffinity: ["fall", "winter", "summer"],
    },
    qualities: ["cooling", "drying", "light", "versatile", "transformative", "nutritious", "fresh"],
    season: ["fall", "winter"],
    category: "vegetable",
    subCategory: "cruciferous",
    affinities: [
      "cumin",
      "turmeric",
      "garlic",
      "tahini",
      "lemon",
      "nutritional yeast",
      "curry spices",
    ],
    cookingMethods: [
      "roasted",
      "steamed",
      "raw",
      "riced",
      "mashed",
      "grilled",
      "pickled",
    ],
    nutritionalProfile: {
      fiber: "high",
      vitamins: { C: 1.0, K: 1.0, B6: 0.1, folate: 0.1, B5: 0.1 },
      minerals: {
        potassium: 0.1,
        magnesium: 0.1,
        phosphorus: 0.1,
        manganese: 0.1,
      },
      calories: 25,
      macros: { protein: 2, fiber: 3, fat: 0.3, sugar: 1.7 },
      antioxidants: [
        "glucosinolates",
        "flavonoids",
        "carotenoids",
        "isothiocyanates",
      ],
    },
    preparation: {
      methods: ["washing", "cutting", "drying"],
      tips: [
        "Can be processed into rice substitute or mashed as potato replacement",
      ],
    },
    varieties: {
      romanesco: {
        characteristics: "lime green, fractal pattern, nutty flavor",
        popular_types: ["standard romanesco"],
      },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Cauliflower is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  broccoli: {
    name: "broccoli",
    category: "vegetable",
    subcategory: "cruciferous",

    // Slightly bitter, nutritious, complex
    elementalProperties: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },

    nutritionalProfile: {
      serving_size: "1 cup chopped (91g)",
      calories: 31,
      macros: {
        protein: 2.5,
        carbs: 6.0,
        fat: 0.3,
        fiber: 2.4,
        saturatedFat: 0.1,
        sugar: 1.7,
        potassium: 316,
        sodium: 33,
      },
      vitamins: {
        C: 1.35, // 135% RDA
        K: 1.16, // 116% RDA
        A: 0.12,
        folate: 0.14,
        B6: 0.09,
      },
      minerals: {
        potassium: 0.09,
        manganese: 0.1,
        iron: 0.04,
      },
      antioxidants: {
        sulforaphane:
          "very high - powerful anti-cancer compound, enhanced by chewing raw",
        indole_3_carbinol: "high - hormone balance and cancer prevention",
        lutein: "moderate - eye health",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.3,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.5,
        umami: 0.3,
        spicy: 0.2, // Slight pungency
      },
      aroma: {
        floral: 0.1,
        fruity: 0.0,
        herbal: 0.6,
        spicy: 0.3,
        earthy: 0.7,
        woody: 0.3,
      },
      texture: {
        crisp: 0.7,
        tender: 0.6, // When properly cooked
        creamy: 0.2, // In purees
        chewy: 0.3,
        crunchy: 0.8,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "refrigerate 32-35°F",
      duration: "7-10 days",
      container: "plastic bag in crisper drawer, unwashed",
      tips: [
        "Store unwashed with tight florets",
        "Wrap loosely in damp paper towel",
        "Yellow florets indicate age - use immediately",
        "Can blanch and freeze for up to 12 months",
      ],
    },

    preparation: {
      methods: [
        "Cut into florets",
        "Peel and slice stems (equally delicious)",
        "Blanch in boiling salted water 2-3 minutes",
        "Chop raw for salads",
      ],
      tips: [
        "Don't discard stems - peel and slice for cooking",
        "Blanch then shock in ice water for vibrant color",
        "Roast at high heat for caramelized edges",
        "Raw broccoli has more sulforaphane than cooked",
      ],
      yields: "1 medium head = 3-4 cups florets",
    },

    recommendedCookingMethods: [
      "steaming",
      "roasting",
      "stir-frying",
      "blanching",
      "raw in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "lemon",
        "parmesan",
        "olive oil",
        "ginger",
        "soy sauce",
        "cheddar cheese",
      ],
      contrasting: ["chili flakes", "anchovies", "mustard"],
      toAvoid: ["overly sweet sauces", "prolonged cooking"],
    },

    description:
      "Broccoli is a cruciferous vegetable packed with nutrients and cancer-fighting compounds. The edible flower buds and stems offer a slightly bitter, earthy flavor that becomes nutty and sweet when roasted. Rich in sulforaphane—a potent antioxidant formed when broccoli is chopped or chewed. Both the florets and stems are edible and nutritious.",

    origin: ["Italy (Mediterranean)", "Cultivated globally"],

    qualities: [
      "nutritious",
      "cruciferous",
      "slightly bitter",
      "versatile",
      "healthful",
      "fibrous",
    ],

    healthBenefits: [
      "High in sulforaphane - powerful anti-cancer properties",
      "Rich in vitamins C and K",
      "Supports detoxification",
      "Anti-inflammatory effects",
      "Supports heart health",
      "May improve bone health",
    ],

    season: ["fall", "winter", "spring"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "virgo", "gemini"],
      seasonalAffinity: ["fall", "winter"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},
  cabbage: {
      description: "A tightly packed, leafy biennial (*Brassica oleracea*) that is a cornerstone of global preservation through fermentation (like sauerkraut and kimchi). Rich in sulfur compounds, it transforms from crisp and peppery when raw to profoundly sweet and tender when slowly braised or roasted.",
    name: "cabbage",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["crunchy", "mild", "versatile"],
    category: "vegetable",
    subcategory: "cruciferous",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup shredded (89g)",
      calories: 22,
      macros: {
        protein: 1.1,
        carbs: 5.2,
        fat: 0.1,
        fiber: 2.2,
        saturatedFat: 0,
        sugar: 2.9,
        potassium: 151,
        sodium: 16,
      },
      vitamins: { C: 0.54, K: 0.68, folate: 0.1 },
      minerals: { manganese: 0.07, potassium: 0.04 },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  napa_cabbage: {
      description: "A tightly packed, leafy biennial (*Brassica oleracea*) that is a cornerstone of global preservation through fermentation (like sauerkraut and kimchi). Rich in sulfur compounds, it transforms from crisp and peppery when raw to profoundly sweet and tender when slowly braised or roasted.\n\n**Selection & Storage:** Select heads that feel heavy for their size with tight, unblemished outer leaves. Whole cabbage is remarkably resilient and can be stored loose in the crisper drawer for several weeks.",
    name: "napa cabbage",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "cruciferous",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const cruciferous: Record<string, IngredientMapping> =
  fixIngredientMappings(rawCruciferous);
