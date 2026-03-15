import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawAlliums: Record<string, Partial<IngredientMapping>> = {
  onion: {
    name: "onion",
    category: "vegetables",
    subcategory: "allium_bulb",

    // Pungent, tear-inducing, transformative
    elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },

    nutritionalProfile: {
      serving_size: "1 medium (110g)",
      calories: 44,
      macros: {
        protein: 1.2,
        carbs: 10.3,
        fat: 0.1,
        fiber: 1.9,
        saturatedFat: 0,
        sugar: 4.7,
        potassium: 325,
        sodium: 4,
      },
      vitamins: {
        C: 0.13, // 13% RDA
        B6: 0.08,
        folate: 0.05,
      },
      minerals: {
        potassium: 0.04,
        manganese: 0.06,
      },
      antioxidants: {
        quercetin: "very high - especially in red onions, anti-inflammatory",
        anthocyanins: "high in red onions - heart health",
        sulfur_compounds: "high - antimicrobial, responsible for pungency",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.6, // When cooked
        salty: 0.0,
        sour: 0.0,
        bitter: 0.2,
        umami: 0.3,
        spicy: 0.7, // Raw pungency
      },
      aroma: {
        floral: 0.1,
        fruity: 0.2,
        herbal: 0.0,
        spicy: 0.8,
        earthy: 0.6,
        woody: 0.1,
      },
      texture: {
        crisp: 0.8, // Raw
        tender: 0.6, // Cooked
        creamy: 0.4, // Caramelized
        chewy: 0.0,
        crunchy: 0.7,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "cool, dark, dry place (50-60°F)",
      duration: "2-3 months whole, 7-10 days cut (refrigerated)",
      container: "open air mesh bag or basket, not plastic",
      tips: [
        "Store in well-ventilated area away from potatoes",
        "Never refrigerate whole onions - causes softening",
        "Once cut, wrap tightly and refrigerate",
        "Remove any sprouting or soft onions immediately",
      ],
    },

    preparation: {
      methods: [
        "Halve from root to stem, peel, leave root intact",
        "Slice pole to pole for even cooking",
        "Dice by making horizontal and vertical cuts",
        "Chill before cutting to reduce tears",
      ],
      tips: [
        "Sharp knife reduces cell damage and fewer tears",
        "Yellow onions for general cooking",
        "Red onions for raw applications",
        "Sweet onions (Vidalia, Walla Walla) for mild flavor",
        "The longer you cook, the sweeter they become",
      ],
      yields: "1 medium = 1 cup chopped",
    },

    recommendedCookingMethods: [
      "caramelizing",
      "sautéing",
      "roasting",
      "grilling",
      "raw in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "butter",
        "olive oil",
        "thyme",
        "beef",
        "mushrooms",
        "wine",
        "vinegar",
      ],
      contrasting: ["sweet peppers", "tomatoes", "citrus"],
      toAvoid: ["delicate fish", "mild dairy"],
    },

    description:
      "Onions are fundamental aromatics in virtually every world cuisine. From the French mirepoix to the Cajun 'holy trinity,' onions form the flavor foundation of countless dishes. Raw, they're pungent and sharp; cooked slowly, they transform into sweet, caramelized magic. The sulfur compounds that make you cry also provide significant health benefits.",

    origin: ["Central Asia", "Cultivated globally"],

    qualities: [
      "foundational",
      "pungent",
      "sweet when cooked",
      "layered",
      "versatile",
      "transformative",
    ],

    healthBenefits: [
      "High in quercetin - powerful antioxidant",
      "May reduce cancer risk",
      "Supports heart health",
      "Anti-inflammatory properties",
      "Antibacterial and antimicrobial",
      "May improve bone density",
    ],

    season: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["Aries", "Capricorn", "Scorpio"],
      seasonalAffinity: ["fall", "winter"],
    },
  },

  garlic: {
    name: "garlic",
    category: "vegetables",
    subcategory: "allium_bulb",

    // Pungent, powerful, transformative
    elementalProperties: { Fire: 0.45, Earth: 0.3, Air: 0.15, Water: 0.1 },

    nutritionalProfile: {
      serving_size: "3 cloves (9g)",
      calories: 13,
      macros: {
        protein: 0.6,
        carbs: 3.0,
        fat: 0.0,
        fiber: 0.2,
        saturatedFat: 0,
        sugar: 2.0,
        potassium: 147,
        sodium: 2,
      },
      vitamins: {
        C: 0.05,
        B6: 0.06,
      },
      minerals: {
        manganese: 0.08,
        selenium: 0.01,
      },
      antioxidants: {
        allicin:
          "very high - forms when garlic is crushed, powerful antimicrobial",
        s_allyl_cysteine: "high - heart health benefits",
        diallyl_disulfide: "moderate - cancer prevention potential",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.3, // When roasted
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.4,
        spicy: 0.9, // Very pungent raw
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.3,
        spicy: 1.0, // Extremely pungent
        earthy: 0.5,
        woody: 0.2,
      },
      texture: {
        crisp: 0.6, // Raw
        tender: 0.8, // Cooked
        creamy: 0.7, // Roasted
        chewy: 0.0,
        crunchy: 0.4,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "cool, dark, dry place (60-65°F)",
      duration: "3-6 months whole, 7-10 days peeled (refrigerated)",
      container: "open air basket or mesh bag, not plastic",
      tips: [
        "Store whole bulbs in open air, never refrigerate",
        "Keep away from moisture to prevent mold",
        "Once separated into cloves, use within 10 days",
        "Peeled cloves can be refrigerated in olive oil (use within 1 week)",
      ],
    },

    preparation: {
      methods: [
        "Crush with side of knife to remove skin easily",
        "Mince finely for maximum allicin release",
        "Slice thinly for chips/garnish",
        "Roast whole heads for mild, sweet flavor",
      ],
      tips: [
        "Let crushed garlic sit 10 minutes before cooking for maximum health benefits",
        "Remove green germ from center if sprouting (bitter)",
        "Add early for mellow flavor, late for punch",
        "Burnt garlic is bitter - watch carefully when sautéing",
      ],
      yields: "1 clove = 1/2 tsp minced",
    },

    recommendedCookingMethods: [
      "sautéing",
      "roasting",
      "confit",
      "raw in aioli",
      "pickling",
    ],

    pairingRecommendations: {
      complementary: [
        "olive oil",
        "butter",
        "ginger",
        "onions",
        "tomatoes",
        "lemon",
        "parsley",
        "chili",
      ],
      contrasting: ["honey", "soy sauce", "vinegar", "wine"],
      toAvoid: ["delicate desserts", "subtle fish preparations"],
    },

    description:
      "Garlic is one of the most important ingredients in global cuisine, used in virtually every savory culinary tradition. A member of the allium family with onions and leeks, garlic transforms dramatically based on preparation: raw it's intensely pungent, sautéed it's mellow and aromatic, roasted it's sweet and creamy. The health benefits are legendary, with allicin providing powerful antimicrobial properties.",

    origin: ["Central Asia", "Mediterranean (culinary tradition)", "Global"],

    qualities: [
      "pungent",
      "aromatic",
      "medicinal",
      "transformative",
      "foundational",
      "powerful",
    ],

    healthBenefits: [
      "Powerful antibacterial and antiviral properties",
      "May lower blood pressure and cholesterol",
      "Supports immune function",
      "May reduce cancer risk",
      "Anti-inflammatory effects",
      "Improves heart health",
    ],

    season: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mars", "Pluto"],
      favorableZodiac: ["Aries", "Scorpio", "Sagittarius"],
      seasonalAffinity: ["year-round"],
    },
    varieties: {
      hardneck: {
        characteristics: "harder central stem, fewer but larger cloves",
        flavor: "complex, often spicier, better for raw applications",
        storage: "shorter shelf life, 3-4 months",
        popular_types: ["Rocambole", "Purple Stripe", "Porcelain"],
      },
    },
  },

  onions: {
    name: "onions",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["pungent", "aromatic", "versatile"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn", "Moon"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn", "Aries", "Scorpio"],
      seasonalAffinity: ["summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 medium (110g)",
      calories: 44,
      macros: {
        protein: 1.2,
        carbs: 10,
        fat: 0.1,
        fiber: 1.9,
        saturatedFat: 0,
        sugar: 4.7,
        potassium: 161,
        sodium: 4,
      },
      vitamins: { C: 0.13, B6: 0.06, folate: 0.05 },
      minerals: { manganese: 0.06, potassium: 0.05 },
    },
  },

  yellow_onions: {
    name: "yellow onions",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },

  pearl_onions: {
    name: "pearl onions",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },

  shallots: {
    name: "shallots",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },

  green_onions: {
    name: "green onions",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },

  yellow_onion: {
    name: "yellow onion",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },

  red_onion: {
    name: "red onion",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "allium_bulb",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const alliums: Record<string, IngredientMapping> =
  fixIngredientMappings(rawAlliums);

// For backwards compatibility
export const _alliums = alliums;
