import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawRootVegetables: Record<string, Partial<IngredientMapping>> = {
  heirloom_carrot: {
    name: "Heirloom Carrot",
    elementalProperties: { Earth: 0.5, Fire: 0.3, Water: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["Taurus", "Virgo", "Capricorn"],
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
  },
  black_radish: {
    name: "Black Radish",
    elementalProperties: { Earth: 0.6, Fire: 0.25, Air: 0.1, Water: 0.05 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["Scorpio", "Capricorn", "Aquarius"],
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
      taste: {
        sweet: 0.7,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.1,
        umami: 0.1,
        spicy: 0.0,
      },
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
      favorableZodiac: ["Capricorn", "Virgo", "Taurus", "Cancer"],
      seasonalAffinity: ["fall", "winter", "summer"],
    },
  },
  ginger: {
    name: "Ginger",
    elementalProperties: { Fire: 0.6, Earth: 0.2, Air: 0.1, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["Aries", "Leo"],
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
  },
  jerusalem_artichoke: {
    name: "Jerusalem Artichoke",
    elementalProperties: { Earth: 0.55, Water: 0.25, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Taurus", "Virgo"],
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
  },
  carrots: {
    name: "carrots",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "root_vegetable",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  parsnips: {
    name: "parsnips",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "root_vegetable",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const roots: Record<string, IngredientMapping> = fixIngredientMappings(
  rawRootVegetables,
);
// For backwards compatibility
export const _rootVegetables = roots;
