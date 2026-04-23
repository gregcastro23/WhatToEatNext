import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawRootVegetables: Record<string, Partial<IngredientMapping>> = {
  heirloom_carrot: {
      description: "A sweet, crunchy root vegetable (*Daucus carota*) renowned for its high beta-carotene content, which the body converts into Vitamin A. Its natural sugars concentrate during roasting or caramelizing, making it a versatile foundational ingredient for mirepoix and sweet baking alike. Look for firm, brightly colored carrots with smooth skin; if green tops are attached, they should be fresh and vibrant. Remove tops before storing — they draw moisture from the root — and keep in plastic in the crisper drawer up to three weeks.",
    name: "Heirloom Carrot",
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["taurus", "virgo", "capricorn"],
      elementalAffinity: {
        base: "Earth",
      },
    },
    subCategory: "root",
    season: ["summer", "fall"],
    category: "vegetables",
    cookingMethods: ["roast", "saute", "steam", "raw"],
    qualities: ["grounding", "nourishing", "sweet"],
    affinities: ["ginger", "cumin", "thyme", "orange", "maple"],
    nutritionalProfile: {
      fiber: "high",
      vitamins: { A: 1.0, K: 0.5, C: 0.2 },
      minerals: { potassium: 0.08, magnesium: 0.08 },
      calories: 41,
      macros: { carbs: 9.6, fiber: 2.8 },
    },
    preparation: {
      methods: ["washing", "peeling"],
      notes: "Can be used whole for presentation",
    },
    storage: {
      temperature: "refrigerated",
      duration: "2-3 weeks",
      notes: "Remove greens before storing",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Heirloom Carrot is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  black_radish: {
      description: "A large, winter root vegetable (*Raphanus sativus var. niger*) with a tough, coal-black exterior and a stark white interior. It possesses a remarkably sharp, aggressively spicy, and pungent bite when raw, which mellows dramatically into a sweet, earthy flavor when roasted or braised.",
    name: "Black Radish",
    elementalProperties: { Earth: 0.6, Fire: 0.25, Air: 0.1, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["scorpio", "capricorn", "aquarius"],
      elementalAffinity: {
        base: "Earth",
      },
    },
    subCategory: "root",
    season: ["fall", "winter"],
    category: "vegetables",
    cookingMethods: ["roast", "pickle", "raw"],
    qualities: ["warming", "pungent", "cleansing"],
    affinities: ["apple", "horseradish", "dill", "vinegar", "caraway"],
    nutritionalProfile: {
      fiber: "high",
      vitamins: { C: 0.2, B6: 0.1 },
      minerals: { potassium: 0.05, phosphorus: 0.05 },
      calories: 20,
      macros: { carbs: 4.2, fiber: 1.6 },
    },
    preparation: {
      methods: ["washing", "peeling"],
      notes: "Soak in cold water to reduce pungency",
    },
    storage: {
      temperature: "refrigerated",
      duration: "2-3 weeks",
      notes: "Store in plastic bag with moisture",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Black Radish is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  carrot: {
    name: "carrot",
    category: "vegetables",
    subcategory: "root_vegetable",

    // Sweet, earthy, grounding
    elementalProperties: { Earth: 0.5, Water: 0.25, Fire: 0.15, Air: 0.1 },

    nutritionalProfile: {
      serving_size: "1 medium (61g)",
      calories: 25,
      macros: {
        protein: 0.6,
        carbs: 6.0,
        fat: 0.1,
        fiber: 1.7,
        saturatedFat: 0,
        sugar: 2.3,
        potassium: 222,
        sodium: 16,
      },
      vitamins: {
        A: 2.04, // 204% RDA - one of the richest sources!
        K: 0.08,
        C: 0.06,
        B6: 0.04,
      },
      minerals: {
        potassium: 0.08,
        manganese: 0.07,
      },
      antioxidants: {
        beta_carotene:
          "extremely high - converted to vitamin A, orange pigment",
        alpha_carotene: "high - additional provitamin A",
        lutein: "moderate - eye health",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: { spicy: 0, sweet: 0.7, sour: 0.1, bitter: 0.1, salty: 0, umami: 0.2 },
      aroma: {
        floral: 0.1,
        fruity: 0.3,
        herbal: 0.2,
        spicy: 0.0,
        earthy: 0.8,
        woody: 0.4,
      },
      texture: {
        crisp: 0.9, // Raw
        tender: 0.7, // Cooked
        creamy: 0.3, // Pureed
        chewy: 0.0,
        crunchy: 0.9,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "refrigerate 32-40°F",
      duration: "3-4 weeks",
      container: "plastic bag in crisper drawer",
      tips: [
        "Remove green tops before storing - draws moisture from roots",
        "Store in perforated plastic bag",
        "Keep away from apples and pears (ethylene producers)",
        "Baby carrots dry out faster - use within 1-2 weeks",
      ],
    },

    preparation: {
      methods: [
        "Peel with vegetable peeler (or scrub well if organic)",
        "Slice into rounds",
        "Cut into matchsticks (julienne) for salads",
        "Chop for mirepoix and soups",
      ],
      tips: [
        "Young carrots don't need peeling - just scrub",
        "Cut into even sizes for uniform cooking",
        "Cook with fat to increase beta-carotene absorption",
        "Roasting concentrates sweetness",
      ],
      yields: "1 medium = 1/2 cup chopped",
    },

    recommendedCookingMethods: [
      "roasting",
      "steaming",
      "braising",
      "raw in salads",
      "juicing",
    ],

    pairingRecommendations: {
      complementary: [
        "butter",
        "honey",
        "ginger",
        "onions",
        "tomatoes",
        "lemon",
        "parsley",
        "orange",
        "thyme",
      ],
      contrasting: ["lemon", "vinegar", "mustard"],
      toAvoid: ["overly acidic preparations"],
    },

    description:
      "Carrots are root vegetables prized for their sweet flavor and vibrant orange color from beta-carotene. While orange is most common, carrots come in purple, yellow, red, and white varieties. A staple in mirepoix and other aromatic bases, carrots are equally delicious raw or cooked. The beta-carotene becomes more bioavailable when cooked with fat.",

    origin: ["Afghanistan (native)", "Cultivated globally"],

    qualities: [
      "sweet",
      "crunchy",
      "earthy",
      "vitamin-rich",
      "versatile",
      "colorful",
    ],

    healthBenefits: [
      "Extremely high in beta-carotene - eye health",
      "Supports immune function",
      "May reduce cancer risk",
      "Promotes healthy skin",
      "Supports digestive health (fiber)",
      "Heart health benefits",
    ],

    season: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury", "Moon"],
      favorableZodiac: ["capricorn", "virgo", "taurus", "cancer"],
      seasonalAffinity: ["fall", "winter", "summer"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},
  ginger: {
      description: "A knobby, fibrous rhizome (*Zingiber officinale*) prized for its warm, spicy, and slightly citrusy bite. The active compound gingerol provides its signature sharp heat, which mellows and deepens into a warming aromatic when cooked.",
    name: "Ginger",
    elementalProperties: { Fire: 0.6, Earth: 0.2, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["aries", "leo"],
      elementalAffinity: {
        base: "Fire",
      },
    },
    subCategory: "root",
    season: ["fall", "winter"],
    category: "spices",
    cookingMethods: ["grate", "sliced", "juiced", "infused"],
    qualities: ["warming", "spicy", "aromatic"],
    affinities: ["garlic", "lemon", "honey", "soy sauce", "turmeric"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: { B6: 0.1, C: 0.1 },
      minerals: { magnesium: 0.1, potassium: 0.1 },
      calories: 80,
      macros: { carbs: 17.8, fiber: 2 },
    },
    preparation: {
      methods: ["peeling", "grating"],
      notes: "Can be frozen for longer storage",
    },
    storage: {
      temperature: "room temperature or refrigerated",
      duration: "3-4 weeks",
      notes: "Store in dry place or refrigerate in paper bag",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Ginger is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  jerusalem_artichoke: {
      description: "Also known as a sunchoke, this lumpy tuber (*Helianthus tuberosus*) is actually the root of a species of sunflower. It provides a sweet, intensely nutty flavor and a texture that ranges from water-chestnut crunchy when raw, to remarkably creamy and silken when roasted or pureed.",
    name: "Jerusalem Artichoke",
    elementalProperties: { Earth: 0.55, Water: 0.25, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "virgo"],
      elementalAffinity: {
        base: "Earth",
      },
    },
    subCategory: "root",
    season: ["fall", "winter"],
    category: "vegetables",
    cookingMethods: ["roast", "boil", "fry", "raw"],
    qualities: ["grounding", "sweet", "nutty"],
    affinities: ["thyme", "lemon", "butter", "sage", "parsley"],
    nutritionalProfile: {
      fiber: "high",
      vitamins: { thiamine: 0.1, niacin: 0.1 },
      minerals: { iron: 0.1, potassium: 0.1 },
      calories: 73,
      macros: { carbs: 17, fiber: 1.6 },
    },
    preparation: {
      methods: ["washing", "peeling"],
      notes: "Soak in water with lemon juice to prevent browning",
    },
    storage: {
      temperature: "refrigerated",
      duration: "1-2 weeks",
      notes: "Store in paper bag in crisper drawer",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      culinaryProfile: {"flavorProfile":{"primary":["balanced"],"secondary":["supporting"],"notes":"Jerusalem Artichoke is used to support structure, aroma, and balance in context-specific recipes."},"cookingMethods":["mix","saute","simmer"],"cuisineAffinity":["global"],"preparationTips":["Adjust quantity to taste and recipe context.","Add in stages to control extraction and final balance."]}
},
  carrots: {
      description: "A sweet, crunchy root vegetable (*Daucus carota*) renowned for its high beta-carotene content, which the body converts into Vitamin A. Its natural sugars concentrate during roasting or caramelizing, making it a versatile foundational ingredient for mirepoix and sweet baking alike. Look for firm, brightly colored carrots with smooth skin; if green tops are attached, they should be fresh and vibrant. Remove tops before storing — they draw moisture from the root — and keep in plastic in the crisper drawer up to three weeks.",
    name: "carrots",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "root_vegetable",
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
  parsnips: {
      description: "A pale, cream-colored root vegetable (*Pastinaca sativa*) closely related to the carrot. It is profoundly starchy and packs an intense, woody sweetness with distinct notes of nutmeg and spiced cider, making it ideal for roasting until deeply caramelized.\n\n**Selection & Storage:** Choose small to medium parsnips; very large ones often have a tough, woody core that must be removed. Store unwashed in a plastic bag in the refrigerator.",
    name: "parsnips",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "root_vegetable",
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
export const roots: Record<string, IngredientMapping> = fixIngredientMappings(
  rawRootVegetables,
);
// For backwards compatibility
export const _rootVegetables = roots;
