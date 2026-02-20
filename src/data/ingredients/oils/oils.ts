import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

/**
 * COMPREHENSIVE OILS DATA
 * Consolidated from seasonings/oils.ts and enhanced with sensoryProfile and pairingRecommendations
 * Each oil includes elemental properties, smoke points, nutritional profiles, and culinary guidance
 */

const rawOils: Record<string, Partial<IngredientMapping>> = {
  olive_oil: {
    name: "Olive Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 207, fahrenheit: 405 },
    qualities: ["healthy", "versatile", "rich"],
    nutritionalProfile: {
      calories: 119,
      fat_g: 13.5,
      saturated_fat_g: 1.9,
      monounsaturated_fat_g: 9.9,
      polyunsaturated_fat_g: 1.4,
      omega_3_g: 0.1,
      omega_6_g: 1.3,
      omega_9_g: 9.9,
      vitamins: ["e", "k"],
      antioxidants: ["oleocanthal", "oleuropein", "hydroxytyrosol"],
      notes: "Rich in monounsaturated fats and antioxidants",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.0,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.2,
        spicy: 0.1,
      },
      aroma: {
        floral: 0.2,
        fruity: 0.7,
        herbal: 0.4,
        spicy: 0.2,
        earthy: 0.3,
        woody: 0.1,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.8,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9,
      },
    },
    pairingRecommendations: {
      complementary: [
        "lemon",
        "garlic",
        "basil",
        "tomato",
        "bread",
        "pasta",
        "fish",
        "vegetables",
      ],
      contrasting: ["vinegar", "citrus", "mustard"],
      toAvoid: ["delicate desserts", "subtle fish like flounder"],
    },
    preparation: {
      fresh: {
        duration: "2 years",
        storage: "cool, dark place",
        tips: ["avoid direct sunlight", "keep sealed"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "keep away from heat sources",
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["taurus", "leo"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Earth", planet: "Venus" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
      lunarPhaseModifiers: {
        firstQuarter: {
          elementalBoost: { Fire: 0.1, Earth: 0.1 },
          preparationTips: ["Best for dressings"],
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Ideal for finishing dishes"],
        },
      },
    },
  },

  coconut_oil: {
    name: "Coconut Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 177, fahrenheit: 350 },
    qualities: ["sweet", "tropical", "solid"],
    nutritionalProfile: {
      calories: 121,
      fat_g: 13.5,
      saturated_fat_g: 11.2,
      monounsaturated_fat_g: 0.8,
      polyunsaturated_fat_g: 0.2,
      omega_3_g: 0,
      omega_6_g: 0.2,
      omega_9_g: 0.8,
      vitamins: [],
      notes: "High in medium-chain triglycerides (MCTs)",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.4,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.1,
        fruity: 0.8,
        herbal: 0.0,
        spicy: 0.0,
        earthy: 0.0,
        woody: 0.2,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.9,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.7,
      },
    },
    pairingRecommendations: {
      complementary: [
        "curry",
        "tropical fruits",
        "chocolate",
        "baking",
        "asian dishes",
        "rice",
      ],
      contrasting: ["lemon", "lime", "ginger"],
      toAvoid: ["delicate herbs", "light vinaigrettes"],
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: ["melts at 24°C / 76°F", "good for medium-heat cooking"],
      },
    },
    storage: {
      container: "glass jar",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Solidifies below room temperature",
    },
  },

  sesame_oil: {
    name: "Sesame Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 210, fahrenheit: 410 },
    qualities: ["nutty", "aromatic", "warming"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.9,
      monounsaturated_fat_g: 5.4,
      polyunsaturated_fat_g: 5.6,
      omega_3_g: 0.4,
      omega_6_g: 5.2,
      omega_9_g: 5.4,
      vitamins: ["e", "k", "b6"],
      minerals: ["calcium", "iron", "zinc"],
      antioxidants: ["sesamol", "sesamin", "sesamolin"],
      notes: "Distinctive nutty flavor, common in Asian cuisine",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.1,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.2,
        umami: 0.5,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.1,
        herbal: 0.2,
        spicy: 0.3,
        earthy: 0.6,
        woody: 0.4,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.7,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9,
      },
    },
    pairingRecommendations: {
      complementary: [
        "soy sauce",
        "ginger",
        "garlic",
        "noodles",
        "stir-fry",
        "rice",
        "seaweed",
      ],
      contrasting: ["citrus", "vinegar", "honey"],
      toAvoid: ["delicate fish", "mild cheeses"],
    },
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated after opening",
        tips: ["use sparingly", "toast for enhanced flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "cool, dark place",
      notes: "Refrigerate after opening",
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "cancer"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mercury" },
          second: { element: "Earth", planet: "Moon" },
          third: { element: "Air", planet: "Venus" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Fire: 0.1, Air: 0.1 },
          preparationTips: ["Best for stir-frying"],
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Ideal for finishing dishes"],
        },
      },
    },
  },

  ghee: {
    name: "Ghee",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.25, Air: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["Taurus", "Libra", "Leo"],
      seasonalAffinity: ["all"],
    },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 250, fahrenheit: 482 },
    qualities: ["rich", "nutty", "clarified"],
    nutritionalProfile: {
      calories: 123,
      fat_g: 13.9,
      saturated_fat_g: 8.7,
      monounsaturated_fat_g: 3.7,
      polyunsaturated_fat_g: 0.5,
      omega_3_g: 0.1,
      omega_6_g: 0.4,
      omega_9_g: 3.7,
      vitamins: ["a", "d", "e", "k"],
      notes: "Clarified butter with high smoke point",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.1,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.4,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.1,
        fruity: 0.2,
        herbal: 0.0,
        spicy: 0.2,
        earthy: 0.4,
        woody: 0.3,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.9,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.8,
      },
    },
    pairingRecommendations: {
      complementary: [
        "curry",
        "rice",
        "lentils",
        "vegetables",
        "indian spices",
        "bread",
      ],
      contrasting: ["lemon", "yogurt", "tamarind"],
      toAvoid: ["delicate herbs", "light fish"],
    },
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "room temperature",
        tips: ["strain thoroughly", "heat until golden"],
      },
    },
    storage: {
      container: "glass jar",
      duration: "12 months",
      temperature: "room temperature",
      notes: "No refrigeration needed",
    },
  },

  avocado_oil: {
    name: "Avocado Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["Taurus", "Libra", "Leo"],
      seasonalAffinity: ["all"],
    },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 271, fahrenheit: 520 },
    qualities: ["buttery", "neutral", "high-heat"],
    nutritionalProfile: {
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.6,
      monounsaturated_fat_g: 9.9,
      polyunsaturated_fat_g: 1.9,
      omega_3_g: 0.1,
      omega_6_g: 1.8,
      omega_9_g: 9.9,
      vitamins: ["e"],
      antioxidants: ["lutein"],
      notes: "High smoke point and neutral flavor",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.0,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.1,
        umami: 0.2,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.4,
        herbal: 0.2,
        spicy: 0.0,
        earthy: 0.3,
        woody: 0.1,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.9,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9,
      },
    },
    pairingRecommendations: {
      complementary: [
        "steak",
        "vegetables",
        "salads",
        "high-heat cooking",
        "grilling",
      ],
      contrasting: ["citrus", "vinegar", "herbs"],
      toAvoid: ["delicate pastries", "light desserts"],
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["excellent for high-heat cooking", "good for searing"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store away from direct light and heat",
    },
  },

  walnut_oil: {
    name: "Walnut Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["nutty", "delicate", "rich"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.2,
      monounsaturated_fat_g: 3.1,
      polyunsaturated_fat_g: 8.7,
      omega_3_g: 1.4,
      omega_6_g: 7.3,
      omega_9_g: 3.1,
      vitamins: ["e", "k"],
      notes: "Excellent omega-3 to omega-6 ratio, rich nutty flavor",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.3,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.2,
        herbal: 0.1,
        spicy: 0.1,
        earthy: 0.7,
        woody: 0.6,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.8,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9,
      },
    },
    pairingRecommendations: {
      complementary: [
        "salads",
        "cheese",
        "apples",
        "pears",
        "beets",
        "vinaigrettes",
      ],
      contrasting: ["citrus", "honey", "balsamic"],
      toAvoid: ["high-heat cooking", "frying"],
    },
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["best unheated", "use for finishing"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6-12 months",
      temperature: "refrigerated",
      notes: "Goes rancid quickly if not refrigerated",
    },
  },

  flaxseed_oil: {
    name: "Flaxseed Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 107, fahrenheit: 225 },
    qualities: ["nutty", "earthy", "delicate"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.2,
      monounsaturated_fat_g: 2.5,
      polyunsaturated_fat_g: 9.2,
      omega_3_g: 7.3,
      omega_6_g: 1.9,
      omega_9_g: 2.5,
      vitamins: ["e", "k"],
      notes: "Highest plant source of omega-3 fatty acids, never heat this oil",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.0,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.4,
        umami: 0.2,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.1,
        herbal: 0.3,
        spicy: 0.0,
        earthy: 0.8,
        woody: 0.3,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.7,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9,
      },
    },
    pairingRecommendations: {
      complementary: [
        "salad dressings",
        "smoothies",
        "yogurt",
        "oatmeal",
        "vegetables",
      ],
      contrasting: ["citrus", "honey", "spices"],
      toAvoid: ["any heating", "cooking", "frying"],
    },
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["never heat", "use in dressings", "shake before use"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "4-6 months",
      temperature: "refrigerated",
      notes: "Highly perishable, keep refrigerated",
    },
  },

  peanut_oil: {
    name: "Peanut Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["nutty", "neutral", "high-heat"],
    nutritionalProfile: {
      calories: 119,
      fat_g: 13.5,
      saturated_fat_g: 2.3,
      monounsaturated_fat_g: 6.2,
      polyunsaturated_fat_g: 4.3,
      omega_3_g: 0,
      omega_6_g: 4.3,
      omega_9_g: 6.2,
      vitamins: ["e"],
      notes: "High smoke point, good for frying",
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for deep frying", "neutral taste"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store away from heat and light",
    },
  },

  mustard_oil: {
    name: "Mustard Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 254, fahrenheit: 490 },
    qualities: ["pungent", "spicy", "strong"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["use sparingly", "traditional in Indian cuisine"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed",
    },
  },

  rice_bran_oil: {
    name: "Rice Bran Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["mild", "neutral", "versatile"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for high-heat cooking", "neutral flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  chili_oil: {
    name: "Chili Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.6, Water: 0.1, Earth: 0.2, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 215, fahrenheit: 420 },
    qualities: ["spicy", "aromatic", "intense"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "room temperature",
        tips: ["use sparingly", "shake before use"],
      },
    },
    storage: {
      container: "glass jar",
      duration: "6 months",
      temperature: "room temperature",
      notes: "Keep away from direct sunlight",
    },
  },

  perilla_oil: {
    name: "Perilla Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 165, fahrenheit: 330 },
    qualities: ["nutty", "grassy", "complex"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use for finishing", "common in Korean cuisine"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated to prevent rancidity",
    },
  },

  camellia_oil: {
    name: "Camellia Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 245, fahrenheit: 473 },
    qualities: ["light", "clean", "delicate"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["traditional in Japanese cuisine", "good for light frying"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  grapeseed_oil: {
    name: "Grapeseed Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 216, fahrenheit: 421 },
    qualities: ["light", "clean", "versatile"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.3,
      monounsaturated_fat_g: 2.2,
      polyunsaturated_fat_g: 9.5,
      omega_3_g: 0.1,
      omega_6_g: 9.4,
      omega_9_g: 2.2,
      vitamins: ["e"],
      antioxidants: ["proanthocyanidins"],
      notes: "Light flavor and high smoke point",
    },
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["good for vinaigrettes", "neutral flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "room temperature",
      notes: "Can go rancid quickly if not stored properly",
    },
  },

  macadamia_oil: {
    name: "Macadamia Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 210, fahrenheit: 410 },
    qualities: ["buttery", "rich", "smooth"],
    preparation: {
      fresh: {
        duration: "4 months",
        storage: "cool, dark place",
        tips: ["great for salad dressings", "light sautéing"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  palm_oil: {
    name: "Palm Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 235, fahrenheit: 455 },
    qualities: ["rich", "heavy", "stable"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: ["common in African cuisine", "good for deep frying"],
      },
    },
    storage: {
      container: "opaque container",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Solid at room temperature",
    },
  },

  tea_seed_oil: {
    name: "Tea Seed Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 252, fahrenheit: 485 },
    qualities: ["light", "clean", "subtle"],
    preparation: {
      fresh: {
        duration: "4 months",
        storage: "cool, dark place",
        tips: ["traditional in Chinese cuisine", "good for stir-frying"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "18 months",
      temperature: "room temperature",
      notes: "Keep away from direct light",
    },
  },

  shiso_oil: {
    name: "Shiso Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.2, Air: 0.4 },
    seasonality: ["summer", "fall"],
    smokePoint: { celsius: 170, fahrenheit: 338 },
    qualities: ["herbaceous", "aromatic", "delicate"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use as finishing oil", "infuse with fresh shiso"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "3 months",
      temperature: "refrigerated",
      notes: "Best used fresh, store cold",
    },
  },

  argan_oil: {
    name: "Argan Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 185, fahrenheit: 365 },
    qualities: ["nutty", "rich", "exotic"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["traditional in Moroccan cuisine", "use as finishing oil"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed in dark place",
    },
  },

  hazelnut_oil: {
    name: "Hazelnut Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.4, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 221, fahrenheit: 430 },
    qualities: ["nutty", "sweet", "aromatic"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["best for finishing", "drizzle on desserts"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "8 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated to prevent rancidity",
    },
  },

  pistachio_oil: {
    name: "Pistachio Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.2, Water: 0.2, Earth: 0.3, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["nutty", "delicate", "distinctive"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use as finishing oil", "perfect for desserts"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Store in refrigerator after opening",
    },
  },

  hemp_seed_oil: {
    name: "Hemp Seed Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 165, fahrenheit: 330 },
    qualities: ["grassy", "nutty", "earthy"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["do not heat", "use for dressings"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Very sensitive to heat and light",
    },
  },

  black_seed_oil: {
    name: "Black Seed Oil",
    category: "oils",
    subCategory: "specialty",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 177, fahrenheit: 350 },
    qualities: ["pungent", "bitter", "medicinal"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "cool, dark place",
        tips: ["use sparingly", "traditional in Middle Eastern cuisine"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed in dark place",
    },
  },

  almond_oil: {
    name: "Almond Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 216, fahrenheit: 420 },
    qualities: ["sweet", "delicate", "nutty"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.1,
      monounsaturated_fat_g: 9.7,
      polyunsaturated_fat_g: 2.3,
      omega_3_g: 0,
      omega_6_g: 2.3,
      omega_9_g: 9.7,
      vitamins: ["e"],
      minerals: ["magnesium", "phosphorus"],
      notes: "Rich in vitamin E and monounsaturated fats",
    },
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["great for baking", "use in desserts"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated after opening",
    },
  },

  sunflower_oil: {
    name: "Sunflower Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["light", "neutral", "versatile"],
    nutritionalProfile: {
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.4,
      monounsaturated_fat_g: 2.7,
      polyunsaturated_fat_g: 9.2,
      omega_3_g: 0,
      omega_6_g: 9.2,
      omega_9_g: 2.7,
      vitamins: ["e"],
      notes: "High in vitamin E and polyunsaturated fats",
    },
    preparation: {
      fresh: {
        duration: "4 months",
        storage: "cool, dark place",
        tips: ["good for frying", "neutral cooking oil"],
      },
    },
    storage: {
      container: "plastic or glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  safflower_oil: {
    name: "Safflower Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 266, fahrenheit: 510 },
    qualities: ["neutral", "light", "high-heat"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: [
          "excellent for high-heat cooking",
          "good substitute for vegetable oil",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store away from direct light",
    },
  },

  white_truffle_oil: {
    name: "White Truffle Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.4, Air: 0.3 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["intense", "earthy", "aromatic"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use sparingly", "finishing oil only", "never heat"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Use within 6 months of opening",
    },
  },

  red_palm_oil: {
    name: "Red Palm Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.4, Water: 0.1, Earth: 0.4, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 235, fahrenheit: 455 },
    qualities: ["rich", "earthy", "robust"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: ["traditional in West African cuisine", "adds color to dishes"],
      },
    },
    storage: {
      container: "opaque container",
      duration: "24 months",
      temperature: "room temperature",
      notes: "May solidify at cooler temperatures",
    },
  },

  roasted_pumpkin_seed_oil: {
    name: "Roasted Pumpkin Seed Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["nutty", "rich", "dark"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: [
          "use as finishing oil",
          "great for salads",
          "traditional in Austrian cuisine",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated after opening",
    },
  },

  mustard_seed_oil: {
    name: "Mustard Seed Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.2, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 254, fahrenheit: 490 },
    qualities: ["pungent", "sharp", "intense"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: [
          "traditional in Bengali cuisine",
          "heat before use",
          "strong flavor",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  babassu_oil: {
    name: "Babassu Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["mild", "nutty", "light"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: [
          "similar to coconut oil",
          "good for frying",
          "traditional in Brazilian cuisine",
        ],
      },
    },
    storage: {
      container: "glass jar",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Solid at room temperature",
    },
  },

  apricot_kernel_oil: {
    name: "Apricot Kernel Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 204, fahrenheit: 400 },
    qualities: ["sweet", "nutty", "delicate"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["good for skin care", "use in desserts", "light cooking"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep away from direct light",
    },
  },

  canola_oil: {
    name: "Canola Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 204, fahrenheit: 400 },
    qualities: ["neutral", "versatile", "heart-healthy"],
    nutritionalProfile: {
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.0,
      monounsaturated_fat_g: 8.8,
      polyunsaturated_fat_g: 4.2,
      omega_3_g: 1.2,
      omega_6_g: 3.0,
      omega_9_g: 8.8,
      vitamins: ["e", "k"],
      notes: "Low in saturated fats, good source of omega-3 fatty acids",
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["versatile for cooking and baking", "neutral flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store away from direct light and heat",
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter"],
      favorableZodiac: ["gemini", "sagittarius"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Fire", planet: "Jupiter" },
          third: { element: "Air", planet: "Saturn" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Air: 0.1, Fire: 0.1 },
          preparationTips: ["Good for light sautéing"],
        },
        fullMoon: {
          elementalBoost: { Air: 0.15 },
          preparationTips: ["Best for baking"],
        },
      },
    },
  },

  mct_oil: {
    name: "MCT Oil",
    category: "oils",
    subCategory: "specialty",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["neutral", "odorless", "liquid"],
    nutritionalProfile: {
      calories: 130,
      fat_g: 14,
      saturated_fat_g: 14,
      monounsaturated_fat_g: 0,
      polyunsaturated_fat_g: 0,
      medium_chain_triglycerides_g: 14,
      notes:
        "Contains only medium-chain triglycerides, rapidly metabolized by the body",
    },
    preparation: {
      fresh: {
        duration: "12 months",
        storage: "cool, dark place",
        tips: [
          "add to coffee or smoothies",
          "avoid high-heat cooking",
          "tasteless when mixed with foods",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Does not require refrigeration",
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["aries", "leo"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Fire", planet: "Sun" },
          third: { element: "Air", planet: "Jupiter" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Best added to morning beverages"],
        },
        newMoon: {
          elementalBoost: { Fire: 0.15, Air: 0.1 },
          preparationTips: ["Ideal for fasting periods"],
        },
      },
    },
  },

  vegetable_oil: {
    name: "Vegetable Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.35, Water: 0.35, Earth: 0.2, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["neutral", "versatile", "economical"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["all-purpose cooking oil", "neutral flavor"],
      },
    },
    storage: {
      container: "plastic or glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus"],
      favorableZodiac: ["leo", "libra", "taurus"],
      seasonalAffinity: ["all"],
    },
  },

  // NEW OILS BELOW

  basil_infused_olive_oil: {
    name: "Basil-Infused Olive Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer"],
    smokePoint: { celsius: 190, fahrenheit: 374 },
    qualities: ["aromatic", "herbal", "fresh"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use as finishing oil", "never heat", "shake before use"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "3 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated to prevent spoilage",
    },
  },

  garlic_infused_olive_oil: {
    name: "Garlic-Infused Olive Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 190, fahrenheit: 374 },
    qualities: ["savory", "aromatic", "pungent"],
    preparation: {
      fresh: {
        duration: "2 weeks",
        storage: "refrigerated",
        tips: [
          "use within 2 weeks",
          "never heat",
          "commercial versions safer than homemade",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "3 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated to prevent botulism",
    },
  },

  lemon_infused_olive_oil: {
    name: "Lemon-Infused Olive Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer"],
    smokePoint: { celsius: 190, fahrenheit: 374 },
    qualities: ["bright", "citrus", "fresh"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: [
          "use as finishing oil",
          "great for seafood",
          "drizzle on salads",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated after opening",
    },
  },

  black_truffle_oil: {
    name: "Black Truffle Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.1, Water: 0.2, Earth: 0.5, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["intense", "earthy", "luxurious"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use sparingly", "finishing oil only", "never heat"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Use within 6 months of opening",
    },
  },

  pumpkin_seed_oil: {
    name: "Pumpkin Seed Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["nutty", "rich", "dark green"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["use as finishing oil", "great for salads", "don't heat"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated after opening",
    },
  },

  chia_seed_oil: {
    name: "Chia Seed Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.1, Water: 0.3, Earth: 0.3, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 107, fahrenheit: 225 },
    qualities: ["mild", "nutty", "omega-rich"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.5,
      monounsaturated_fat_g: 2.0,
      polyunsaturated_fat_g: 9.8,
      omega_3_g: 7.5,
      omega_6_g: 2.3,
      vitamins: ["e"],
      notes: "Very high in omega-3 fatty acids, never heat",
    },
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["never heat", "use in smoothies", "add to dressings"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Highly perishable, keep refrigerated",
    },
  },

  moringa_oil: {
    name: "Moringa Oil",
    category: "oils",
    subCategory: "specialty",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 190, fahrenheit: 374 },
    qualities: ["light", "sweet", "stable"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for cooking", "very stable oil", "mild flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Very stable, long shelf life",
    },
  },

  neem_oil: {
    name: "Neem Oil (Culinary Grade)",
    category: "oils",
    subCategory: "specialty",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.3, Air: 0.1 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 177, fahrenheit: 350 },
    qualities: ["bitter", "pungent", "medicinal"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: [
          "use very sparingly",
          "traditional in Indian cuisine",
          "bitter flavor",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed",
    },
  },

  cottonseed_oil: {
    name: "Cottonseed Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 216, fahrenheit: 420 },
    qualities: ["neutral", "light", "stable"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for frying", "neutral flavor", "stable at high heat"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  soybean_oil: {
    name: "Soybean Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["neutral", "versatile", "economical"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 2.0,
      monounsaturated_fat_g: 3.1,
      polyunsaturated_fat_g: 7.9,
      omega_3_g: 0.9,
      omega_6_g: 7.0,
      vitamins: ["e", "k"],
      notes: "Good source of omega-3 and omega-6 fatty acids",
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["all-purpose cooking", "good for baking", "neutral flavor"],
      },
    },
    storage: {
      container: "plastic or glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  corn_oil: {
    name: "Corn Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 232, fahrenheit: 450 },
    qualities: ["neutral", "light", "versatile"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.8,
      monounsaturated_fat_g: 3.8,
      polyunsaturated_fat_g: 7.4,
      omega_3_g: 0.1,
      omega_6_g: 7.3,
      vitamins: ["e"],
      notes: "High in polyunsaturated fats and vitamin E",
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for frying", "baking", "neutral flavor"],
      },
    },
    storage: {
      container: "plastic or glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
  },

  rapeseed_oil: {
    name: "Rapeseed Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 204, fahrenheit: 400 },
    qualities: ["neutral", "versatile", "healthy"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: [
          "similar to canola oil",
          "good for cooking and baking",
          "neutral flavor",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store away from direct light and heat",
    },
  },

  sacha_inchi_oil: {
    name: "Sacha Inchi Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.2, Water: 0.3, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 107, fahrenheit: 225 },
    qualities: ["nutty", "rich", "omega-rich"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.0,
      monounsaturated_fat_g: 1.5,
      polyunsaturated_fat_g: 10.5,
      omega_3_g: 6.5,
      omega_6_g: 4.0,
      vitamins: ["e"],
      notes: "Very high in omega-3 fatty acids, from Peruvian Amazon",
    },
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "refrigerated",
        tips: ["never heat", "use in dressings", "add to smoothies"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Highly perishable, keep refrigerated",
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const oilsIngredients: Record<string, IngredientMapping> =
  fixIngredientMappings(rawOils);
