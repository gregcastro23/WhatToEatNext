import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawCruciferous: Record<string, Partial<IngredientMapping>> = {
  cauliflower: {
      image_url: "ingredients/cauliflower.png",
    description: "A versatile, mildly sweet cruciferous vegetable (*Brassica oleracea var. botrytis*) composed of undeveloped flower buds. Its neutral flavor and dense structure make it a culinary chameleon, easily absorbing strong spices, roasting to a nutty caramelization, or pureeing into a creamy, starch-free mash.",
    name: "Cauliflower",
    origin: ["Cultivated worldwide"],

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
      culinaryProfile: {
        flavorProfile: {
          primary: ["nutty", "mild"],
          secondary: ["sweet", "cabbage-like"],
          notes: "Sweetens and turns nutty when roasted; can taste sulfurous if overcooked.",
        },
        cookingMethods: ["roast", "steam", "saute", "rice", "mash"],
        cuisineAffinity: ["Indian", "Mediterranean", "American", "European"],
        preparationTips: [
          "Cut out the dense core, then break or cut the head into even florets.",
          "Slice through the core into thick 'steaks' for roasting or searing.",
          "Pulse florets in a food processor to make cauliflower 'rice'.",
        ],
      }
},
  broccoli: {
      image_url: "ingredients/broccoli.png",
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
      image_url: "ingredients/cabbage.png",
    description: "A tightly packed, leafy biennial (*Brassica oleracea*) that is a cornerstone of global preservation through fermentation (like sauerkraut and kimchi). Rich in sulfur compounds, it transforms from crisp and peppery when raw to profoundly sweet and tender when slowly braised or roasted.",
    name: "cabbage",
    origin: ["Cultivated worldwide"],
    season: ["varies by variety"],
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
      image_url: "ingredients/napa_cabbage.png",
    description: "A tightly packed, leafy biennial (*Brassica oleracea*) that is a cornerstone of global preservation through fermentation (like sauerkraut and kimchi). Rich in sulfur compounds, it transforms from crisp and peppery when raw to profoundly sweet and tender when slowly braised or roasted.\n\n**Selection & Storage:** Select heads that feel heavy for their size with tight, unblemished outer leaves. Whole cabbage is remarkably resilient and can be stored loose in the crisper drawer for several weeks.",
    name: "napa cabbage",
    origin: ["China (Beijing region)"],
    season: ["fall", "winter"],
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
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
  },
  brussels_sprouts: {
    image_url: "ingredients/brussels_sprouts.png",
    description: "Miniature, cabbage-like buds (Brassica oleracea var. gemmifera) that grow tightly clustered along a thick central stalk. Halving and high-heat roasting transforms them, caramelizing natural sugars into crispy, nutty, deeply savory layers.",
    name: "Brussels Sprouts",
    aliases: ["brussels sprouts", "brussels sprout", "brussel sprouts", "brussel sprout"],
    origin: ["Belgium", "Mediterranean"],
    season: ["fall", "winter"],
    elementalProperties: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    scaledElemental: { Earth: 0.4, Air: 0.3, Water: 0.2, Fire: 0.1 },
    quantityBase: { amount: 100, unit: "g" },
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.5,
      Matter: 0.55,
      Substance: 0.45,
    },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.85 },
    qualities: ["nutritious", "earthy", "crisp", "dense", "savory"],
    category: "vegetable",
    subCategory: "cruciferous",
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["capricorn", "scorpio", "virgo"],
      seasonalAffinity: ["fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (88g)",
      calories: 38,
      macros: {
        protein: 3.0,
        carbs: 8.0,
        fat: 0.3,
        fiber: 3.3,
        saturatedFat: 0.1,
        sugar: 1.9,
        potassium: 342,
        sodium: 22,
      },
      vitamins: { C: 0.94, K: 1.5, folate: 0.15, A: 0.13, B6: 0.1 },
      minerals: { manganese: 0.15, potassium: 0.08, iron: 0.08, calcium: 0.04 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.25, umami: 0.15, spicy: 0.0 },
      aroma: { vegetal: 0.7, earthy: 0.5, roasted: 0.6 },
      texture: { crisp: 0.7, tender: 0.5, dense: 0.6 },
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["earthy", "nutty"],
        secondary: ["sweet", "bittersweet"],
        notes: "High-heat roasting or searing caramelizes sugars and suppresses harsh sulfur notes.",
      },
      cookingMethods: ["roast", "saute", "shave", "char", "braise"],
      cuisineAffinity: ["European", "American", "British", "Modern Western"],
      preparationTips: [
        "Trim the stem end and slice in half lengthwise through the core.",
        "Roast cut-side down on a preheated sheet pan for maximum browning.",
      ],
    },
    pairingRecommendations: {
      complementary: ["bacon", "pancetta", "parmesan", "balsamic vinegar", "garlic", "pecans", "maple syrup", "mustard"],
      contrasting: ["lemon", "pomegranate"],
      toAvoid: [],
    },
    storage: {
      refrigerated: "Store in produce bag in crisper drawer for up to 1-2 weeks.",
      notes: "Do not wash until ready to prepare.",
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const cruciferous: Record<string, IngredientMapping> =
  fixIngredientMappings(rawCruciferous);
