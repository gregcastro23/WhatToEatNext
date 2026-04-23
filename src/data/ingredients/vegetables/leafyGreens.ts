import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Helper function for generating consistent numeric values
const generateVegetableAttributes = (vegData: {
  water: number; // water content percentage (0-100)
  fiber: number; // fiber content (0-10 scale)
  bitterness: number; // bitterness level (0-10 scale)
  cooking_time: number; // typical cooking time in minutes
}) => ({
  water_content: vegData.water,
  fiber_density: vegData.fiber,
  bitterness: vegData.bitterness,
  cooking_time_minutes: vegData.cooking_time,
  volume_reduction: Math.round((vegData.water || 0) * 0.2) / 10, // How much it shrinks when cooked (1-10 scale)
  cell_wall_strength: Math.round(10 - vegData.water / 10 + vegData.fiber / 2), // Structural integrity when cooked
  nutrient_density: Math.round(
    (vegData.fiber || 0) * 0.2 +
      (100 - vegData.water) * 0.05 +
      Math.min(7, vegData.bitterness) * 0.3,
  ),
});

const rawLeafyGreens: Record<string, Partial<IngredientMapping>> = {
  kale: {
      description: "A robust, hardy member of the cabbage family (*Brassica oleracea var. sabellica*) known for its dense texture and earthy, slightly bitter flavor. Its tough cellulose structure requires massaging with oil or acid when eaten raw, but allows it to hold up beautifully to long braising or roasting.",
    name: "Kale",
    category: "vegetables",
    subCategory: "leafy_green",

    // Base elemental properties (unscaled)
    elementalProperties: { Air: 0.38, Earth: 0.34, Water: 0.22, Fire: 0.06 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 67, unit: "g" }, // Standard serving: 1 cup chopped
    scaledElemental: { Air: 0.38, Earth: 0.34, Water: 0.22, Fire: 0.06 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.70,
      Matter: 0.30,
      Substance: 0.35,
    }, // Independent dimensions (0.0-1.0 each)
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.95 }, // Mild warming, gentle force
    qualities: [
      "cleansing",
      "strengthening",
      "cooling",
      "grounding",
      "resilient",
      "bitter",
      "hardy",
    ],
    origin: ["Mediterranean", "Northern Europe"],
    season: ["fall", "winter", "early spring"],
    affinities: [
      "garlic",
      "olive oil",
      "lemon",
      "pine nuts",
      "chili",
      "tahini",
      "mushrooms",
      "apple",
    ],
    cookingMethods: [
      "raw",
      "steamed",
      "sautéed",
      "baked",
      "braised",
      "fermented",
      "juiced",
      "soup",
    ],
    ...generateVegetableAttributes({
      water: 84,
      fiber: 9,
      bitterness: 7,
      cooking_time: 8,
    }),
    nutritionalProfile: {
      serving_size: "1 cup, raw (67g)",
      calories: 33,
      macros: {
        protein: 3,
        carbs: 6.7,
        fat: 0.5,
        fiber: 2.5,
      },
      vitamins: {
        A: 0.206, // Values as percentage of RDA
        C: 0.134,
        K: 0.684,
        B6: 0.14,
        E: 0.1,
        folate: 0.07,
        B2: 0.09,
      },
      minerals: {
        calcium: 0.15,
        potassium: 0.08,
        magnesium: 0.09,
        manganese: 0.32,
        copper: 0.11,
        iron: 0.06,
      },
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["virgo", "capricorn"],
      elementalAffinity: {
        base: "Air",
      },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Kale is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  spinach: {
    name: "spinach",
    category: "vegetables",
    subcategory: "leafy_green",

    // Mineral-rich, slightly bitter, nourishing
    elementalProperties: { Water: 0.45, Earth: 0.3, Air: 0.15, Fire: 0.1 },

    nutritionalProfile: {
      serving_size: "1 cup raw (30g)",
      calories: 7,
      macros: {
        protein: 0.9,
        carbs: 1.1,
        fat: 0.1,
        fiber: 0.7,
        saturatedFat: 0,
        sugar: 0.4,
        potassium: 170,
        sodium: 3,
      },
      vitamins: {
        K: 1.81, // 181% RDA - extremely high!
        A: 0.56, // 56% RDA
        C: 0.14,
        folate: 0.15,
        B6: 0.03,
      },
      minerals: {
        iron: 0.15, // Note: non-heme, less absorbable
        calcium: 0.03,
        magnesium: 0.2,
        potassium: 0.05,
        manganese: 0.45,
      },
      antioxidants: {
        lutein_zeaxanthin:
          "very high - eye health, macular degeneration prevention",
        kaempferol: "high - anti-inflammatory and anti-cancer",
        quercetin: "moderate - antioxidant",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: { spicy: 0, sweet: 0.1, sour: 0.1, bitter: 0.5, salty: 0.1, umami: 0.3 },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.7,
        spicy: 0.0,
        earthy: 0.6,
        woody: 0.0,
      },
      texture: {
        crisp: 0.4, // Baby spinach
        tender: 0.9,
        creamy: 0.2, // When creamed
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.7, // Wilted
      },
    },

    storage: {
      temperature: "refrigerate 35-40°F",
      duration: "5-7 days",
      container: "original container or plastic bag with paper towel",
      tips: [
        "Store unwashed until ready to use",
        "Place paper towel in bag to absorb excess moisture",
        "Remove any slimy or yellowed leaves immediately",
        "Baby spinach more delicate than mature leaves",
      ],
    },

    preparation: {
      methods: [
        "Wash thoroughly in cold water (sandy!)",
        "Remove thick stems from mature leaves",
        "Tear or chop for salads",
        "Wilt in pan with garlic",
      ],
      tips: [
        "Wash just before use, not before storing",
        "Baby spinach tender enough for stems",
        "Spinach wilts dramatically - 1 lb fresh = 1 cup cooked",
        "Add lemon or vitamin C to improve iron absorption",
      ],
      yields: "1 lb fresh = 1 cup cooked",
    },

    recommendedCookingMethods: [
      "sautéing",
      "steaming",
      "wilting",
      "raw in salads",
      "blending in smoothies",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "lemon",
        "butter",
        "nutmeg",
        "feta cheese",
        "eggs",
        "cream",
        "pine nuts",
      ],
      contrasting: ["bacon", "parmesan", "vinegar"],
      toAvoid: ["overly sweet dressings"],
    },

    description:
      "Spinach is a nutrient-dense leafy green packed with vitamins, minerals, and antioxidants. Baby spinach is tender and mild, perfect for salads, while mature spinach has heartier leaves ideal for cooking. Extremely high in vitamin K and a good source of plant-based iron (though less bioavailable than animal sources). Wilts dramatically when cooked, reducing in volume by 90%.",

    origin: ["Persia (Iran)", "Cultivated globally"],

    qualities: [
      "nutrient-dense",
      "iron-rich",
      "versatile",
      "mild",
      "healthful",
      "tender",
    ],

    healthBenefits: [
      "Extremely high in vitamin K - bone health",
      "Rich in antioxidants - eye health (lutein)",
      "Plant-based iron (enhanced absorption with vitamin C)",
      "May reduce blood pressure",
      "Anti-inflammatory properties",
      "Supports digestive health",
    ],

    season: ["spring", "fall"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "virgo", "pisces"],
      seasonalAffinity: ["spring"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},
  "swiss chard": {
      description: "Swiss Chard is a vegetable ingredient that contributes structure, micronutrients, and a broad range of textures depending on cut and heat level. High heat emphasizes caramelization and sweetness, while gentle cooking preserves water content and delicate notes. Prep consistently so pieces cook evenly and integrate cleanly into the dish.",
    name: "Swiss chard",
    elementalProperties: { Water: 0.39, Earth: 0.33, Air: 0.21, Fire: 0.07 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["taurus", "capricorn", "libra"],
      elementalAffinity: {
        base: "Water",
      },
    },
    qualities: ["cooling", "cleansing"],
    season: ["summer", "fall"],
    category: "vegetables",
    subCategory: "leafy green",
    affinities: ["garlic", "beans", "lemon", "pine nuts"],
    cookingMethods: ["steamed", "sautéed", "braised"],
    ...generateVegetableAttributes({
      water: 87,
      fiber: 7,
      bitterness: 5,
      cooking_time: 5,
    }),
    nutritionalProfile: {
      fiber: "high",
      vitamins: { K: 1.0, A: 1.0, C: 0.5 },
      minerals: { magnesium: 0.1, potassium: 0.1, iron: 0.1 },
      calories: 19,
      macros: { protein: 1.8, fiber: 1.9 },
    },
    preparation: {
      methods: ["washing", "stemming"],
      tips: ["Cook stems longer than leaves"],
    },
    storage: {
      temperature: "refrigerated",
      duration: "3-5 days",
      notes: "Wrap in damp paper towel",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Swiss Chard is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  lettuce: {
      description: "A leafy herbaceous plant (*Lactuca sativa*), primarily cultivated for its crisp, hydrating leaves. Iceberg and romaine varieties provide high water content and structural crunch that resists wilting under heavy dressings, while butterhead and loose-leaf types offer delicate, tender textures. Although typically consumed raw in salads or as a cooling counterpoint in sandwiches, hearty varieties like romaine can be lightly grilled or braised to develop surprising smoky depth.",
    name: "lettuce",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "leafy_green",
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
  romaine_lettuce: {
      description: "A leafy herbaceous plant (*Lactuca sativa*), primarily cultivated for its crisp, hydrating leaves. Iceberg and romaine varieties provide high water content and structural crunch that resists wilting under heavy dressings, while butterhead and loose-leaf types offer delicate, tender textures. Although typically consumed raw in salads or as a cooling counterpoint in sandwiches, hearty varieties like romaine can be lightly grilled or braised to develop surprising smoky depth.",
    name: "romaine lettuce",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "leafy_green",
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
  lettuce_leaves: {
      description: "A leafy herbaceous plant (*Lactuca sativa*), primarily cultivated for its crisp, hydrating leaves. Iceberg and romaine varieties provide high water content and structural crunch that resists wilting under heavy dressings, while butterhead and loose-leaf types offer delicate, tender textures. Although typically consumed raw in salads or as a cooling counterpoint in sandwiches, hearty varieties like romaine can be lightly grilled or braised to develop surprising smoky depth.",
    name: "lettuce leaves",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "leafy_green",
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
export const leafyGreens: Record<string, IngredientMapping> =
  fixIngredientMappings(rawLeafyGreens);

export default leafyGreens;
