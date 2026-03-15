import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawOtherVegetables: Record<string, Partial<IngredientMapping>> = {
  asparagus: {
    name: "asparagus",
    category: "vegetables",
    subcategory: "shoot",

    // Delicate, slightly bitter, refined
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },

    nutritionalProfile: {
      serving_size: "1 cup (134g)",
      calories: 27,
      macros: {
        protein: 3.0,
        carbs: 5.2,
        fat: 0.2,
        fiber: 2.8,
        saturatedFat: 0,
        sugar: 0.8,
        potassium: 271,
        sodium: 25,
      },
      vitamins: {
        K: 0.7, // 70% RDA
        folate: 0.34, // 34% RDA
        A: 0.18,
        C: 0.12,
        E: 0.08,
      },
      minerals: {
        iron: 0.15,
        potassium: 0.06,
      },
      antioxidants: {
        glutathione: "high - powerful antioxidant and detoxifier",
        rutin: "moderate - anti-inflammatory",
        saponins: "moderate - immune support",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.4,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.4,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.2,
        fruity: 0.1,
        herbal: 0.6,
        spicy: 0.0,
        earthy: 0.7,
        woody: 0.3,
      },
      texture: {
        crisp: 0.7, // Properly cooked
        tender: 0.8,
        creamy: 0.2,
        chewy: 0.2,
        crunchy: 0.0,
        silky: 0.4,
      },
    },

    storage: {
      temperature: "refrigerate 32-36°F",
      duration: "3-4 days",
      container: "upright in jar with 1 inch water, covered with plastic bag",
      tips: [
        "Store like flowers - upright in water",
        "Trim ends before storing",
        "Use within 3-4 days for best flavor",
        "Can blanch and freeze for up to 8 months",
      ],
    },

    preparation: {
      methods: [
        "Snap or cut off woody ends (bottom 1-2 inches)",
        "Peel thick stalks with vegetable peeler",
        "Blanch 2-3 minutes for tender-crisp",
        "Roast at high heat for caramelization",
      ],
      tips: [
        "Bend stalks to find natural breaking point",
        "Thin asparagus cooks faster than thick",
        "Thick asparagus has more flavor, thin more tender",
        "Shave raw into ribbons for salads",
      ],
      yields: "1 lb = 3-4 servings",
    },

    recommendedCookingMethods: [
      "roasting",
      "grilling",
      "steaming",
      "sautéing",
      "blanching",
    ],

    pairingRecommendations: {
      complementary: [
        "lemon",
        "butter",
        "parmesan",
        "eggs",
        "garlic",
        "olive oil",
        "prosciutto",
      ],
      contrasting: ["balsamic vinegar", "hollandaise", "mustard"],
      toAvoid: ["overly sweet sauces", "overpowering spices"],
    },

    description:
      "Asparagus is a spring vegetable prized for its delicate flavor and tender texture. The edible shoots range from pencil-thin to thumb-thick, with thicker spears generally having more flavor. Green asparagus is most common, while white asparagus (grown underground) is prized in Europe for its mild, refined flavor. Purple varieties are sweeter but turn green when cooked.",

    origin: ["Mediterranean", "Cultivated globally"],

    qualities: [
      "delicate",
      "seasonal",
      "refined",
      "slightly bitter",
      "tender",
      "elegant",
    ],

    healthBenefits: [
      "Rich in folate - important for pregnancy",
      "Natural diuretic",
      "High in antioxidants (glutathione)",
      "Supports digestive health (prebiotic fiber)",
      "May help regulate blood sugar",
      "Anti-inflammatory properties",
    ],

    season: ["spring"],

    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter", "Moon", "Saturn"],
      favorableZodiac: ["Gemini", "Virgo", "Sagittarius", "Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["spring"],
    },
  },
  artichoke: {
    name: "artichoke",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.7,
      Earth: 0.15,
      Air: 0.05,
    },
    category: "vegetables",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 3.27, carbs: 10.51, fiber: 5.4 },
      calories: 47,
    },
    season: ["spring"],
    cookingMethods: ["steam", "boil", "grill", "roast"],
  },
  cucumber: {
    name: "cucumber",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.8,
      Earth: 0.05,
      Air: 0.05,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Pisces", "Taurus", "Capricorn"],
    },
    category: "vegetables",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 0.6, carbs: 2.2, fiber: 0.7 },
      calories: 12,
    },
    season: ["summer"],
    cookingMethods: ["raw", "pickle"],
  },
  okra: {
    name: "okra",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1,
    },
    category: "vegetables",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 1.9, carbs: 7.5, fiber: 3.2 },
      calories: 33,
    },
    season: ["summer"],
    cookingMethods: ["fry", "saute", "stew", "roast"],
  },
  zucchini: {
    name: "zucchini",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.7,
      Earth: 0.1,
      Air: 0.1,
    },
    category: "vegetables",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 1.2, carbs: 3.1, fiber: 1.0 },
      calories: 17,
    },
    season: ["summer"],
    cookingMethods: ["saute", "grill", "roast", "steam"],
  },
  fennel: {
    name: "fennel",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.3,
      Earth: 0.25,
      Air: 0.35,
    },
    category: "vegetables",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 1.2, carbs: 7.3, fiber: 3.1 },
      calories: 31,
    },
    season: ["fall", "winter", "spring"],
    cookingMethods: ["roast", "saute", "raw", "braise"],
  },
  celery: {
    name: "celery",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  peas: {
    name: "peas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  fresh_peas: {
    name: "fresh peas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  sweet_corn: {
    name: "sweet corn",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  corn_on_the_cob: {
    name: "corn on the cob",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  green_beans: {
    name: "green beans",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const _otherVegetables: Record<string, IngredientMapping> =
  fixIngredientMappings(rawOtherVegetables);

export const otherVegetables = _otherVegetables;
