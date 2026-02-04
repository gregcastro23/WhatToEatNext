import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawCitrus: Record<string, Partial<IngredientMapping>> = {
  lemon: {
    name: "Lemon",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 60, unit: "g" }, // Standard serving: 1 medium lemon
    scaledElemental: { Water: 0.39, Air: 0.31, Fire: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.345,
      Matter: 0.1,
      Substance: 0.205,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.08, forceMagnitude: 0.88 }, // Cooling effect, gentle force
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "cancer"],
      elementalAffinity: {
        base: "Water",
        decanModifiers: {
          first: { element: "Water", planet: "Mercury" },
          second: { element: "Air", planet: "Moon" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
    },
    qualities: ["sour", "cooling", "cleansing"],
    season: ["winter", "spring"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["honey", "ginger", "mint", "thyme", "lavender"],
    cookingMethods: ["raw", "juiced", "preserved", "zested"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: ["c", "b6", "folate"],
      minerals: ["potassium", "calcium"],
      calories: 29,
      carbs_g: 9,
      fiber_g: 2.8,
      antioxidants: ["flavonoids", "limonoids"],
    },
    preparation: {
      washing: true,
      zesting: "before juicing",
      juicing: "room temperature yields more juice",
      notes: "Roll on counter before juicing",
    },
    storage: {
      temperature: "room temp or refrigerated",
      duration: "1-2 weeks",
      notes: "Will continue to ripen at room temperature",
    },
  },

  orange: {
    name: "Orange",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 130, unit: "g" }, // Standard serving: 1 medium orange
    scaledElemental: { Water: 0.39, Fire: 0.31, Air: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.345,
      Matter: 0.155,
      Substance: 0.1,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 1.02 }, // Warming effect, moderate force
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus"],
      favorableZodiac: ["leo", "taurus"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Earth", planet: "Venus" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
    },
    qualities: ["sweet", "warming", "nourishing"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["vanilla", "cinnamon", "chocolate", "cranberry", "dates"],
    cookingMethods: ["raw", "juiced", "zested", "candied"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: ["c", "a", "b1"],
      minerals: ["calcium", "potassium"],
      calories: 62,
      carbs_g: 15,
      fiber_g: 3.1,
      antioxidants: ["hesperidin", "beta-cryptoxanthin"],
    },
    preparation: {
      washing: true,
      peeling: "remove white pith",
      sectioning: "remove membranes if desired",
      notes: "Supreme for salads",
    },
    storage: {
      temperature: "cool room temp or refrigerated",
      duration: "2-3 weeks",
      notes: "Keep away from apples and bananas",
    },
  },

  lime: {
    name: "Lime",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 67, unit: "g" }, // Standard serving: 1 medium lime
    scaledElemental: { Water: 0.49, Air: 0.21, Fire: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.205,
      Essence: 0.395,
      Matter: 0.1,
      Substance: 0.2,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.12, forceMagnitude: 0.85 }, // Cooling effect, gentle force

    qualities: ["sour", "cooling", "refreshing"],
    season: ["year-round"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["mint", "coconut", "chili", "cilantro", "ginger"],
    cookingMethods: ["raw", "juiced", "zested", "preserved"],
    nutritionalProfile: {
      vitamins: ["c", "b6"],
      minerals: ["potassium", "calcium"],
      calories: 20,
      carbs_g: 7,
      fiber_g: 1.9,
    },
    preparation: {
      washing: true,
      rolling: "before juicing",
      zesting: "before juicing",
      notes: "Warm slightly for more juice",
    },
    storage: {
      temperature: "room temp or refrigerated",
      duration: "1-2 weeks",
      notes: "Will continue to yellow over time",
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "gemini", "virgo"],
      elementalAffinity: {
        base: "Water",
        decanModifiers: {
          first: { element: "Water", planet: "Moon", influence: 0.8 },
          second: { element: "Air", planet: "Mercury", influence: 0.6 },
          third: { element: "Water", planet: "Moon", influence: 0.7 },
        },
      },
    },
  },

  grapefruit: {
    name: "Grapefruit",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 230, unit: "g" }, // Standard serving: 1 medium grapefruit
    scaledElemental: { Water: 0.39, Air: 0.31, Fire: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.345,
      Matter: 0.155,
      Substance: 0.1,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.95 }, // Mild warming, balanced force

    qualities: ["bitter-sweet", "tart", "refreshing"],
    season: ["winter", "spring"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["mint", "honey", "avocado", "fennel", "rosemary"],
    cookingMethods: ["raw", "juiced", "broiled", "preserved"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: ["c", "a", "b6"],
      minerals: ["potassium", "magnesium"],
      calories: 42,
      carbs_g: 11,
      fiber_g: 1.6,
      antioxidants: ["lycopene", "beta-carotene", "naringin"],
    },
    preparation: {
      washing: true,
      peeling: "remove pith if eating segments",
      sectioning: "remove membranes for supreme",
      notes: "Pink varieties are sweeter than white",
    },
    storage: {
      temperature: "refrigerated",
      duration: "2-3 weeks",
      humidity: "moderate",
      notes: "Check for soft spots regularly",
    },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius", "aries"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun", influence: 0.8 },
          second: { element: "Water", planet: "Jupiter", influence: 0.7 },
          third: { element: "Fire", planet: "Sun", influence: 0.6 },
        },
      },
    },
  },

  mandarin: {
    name: "Mandarin",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mercury"],
      favorableZodiac: ["Leo", "Gemini", "Sagittarius"],
      seasonalAffinity: ["winter", "spring"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 88, unit: "g" }, // Standard serving: 1 medium mandarin
    scaledElemental: { Water: 0.39, Fire: 0.31, Air: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.345,
      Matter: 0.155,
      Substance: 0.1,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 0.9 }, // Mild warming, gentle force

    qualities: ["sweet", "delicate", "aromatic"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["chocolate", "vanilla", "ginger", "cinnamon", "almond"],
    cookingMethods: ["raw", "juiced", "preserved", "candied"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: ["c", "a"],
      minerals: ["potassium"],
      calories: 53,
      carbs_g: 13,
      fiber_g: 1.8,
      antioxidants: ["beta-carotene", "flavonoids"],
    },
    preparation: {
      washing: true,
      peeling: "easy to peel",
      sectioning: "natural segments",
      notes: "Very easy to eat out of hand",
    },
    storage: {
      temperature: "room temp or refrigerated",
      duration: "1-2 weeks",
      notes: "Keep in cool, dry place",
    },
  },

  clementine: {
    name: "Clementine",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 74, unit: "g" }, // Standard serving: 1 medium clementine
    scaledElemental: { Water: 0.39, Fire: 0.31, Air: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.345,
      Matter: 0.155,
      Substance: 0.1,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.88 }, // Mild warming, gentle force

    qualities: ["sweet", "juicy", "easy-to-peel", "seedless"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["honey", "vanilla", "mint", "cinnamon"],
    cookingMethods: ["raw", "juiced", "preserved"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: ["c", "a", "b1"],
      minerals: ["potassium", "calcium"],
      calories: 47,
      carbs_g: 12,
      fiber_g: 1.7,
      antioxidants: ["beta-carotene", "flavonoids"],
    },
    preparation: {
      washing: true,
      peeling: "very easy to peel",
      notes: "Perfect for snacking",
    },
    storage: {
      temperature: "room temp or refrigerated",
      duration: "1-2 weeks",
      notes: "Store loose in fruit bowl",
    },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus"],
      favorableZodiac: ["leo", "libra", "taurus"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun", influence: 0.8 },
          second: { element: "Water", planet: "Venus", influence: 0.6 },
          third: { element: "Air", planet: "Mercury", influence: 0.7 },
        },
      },
    },
  },

  pomelo: {
    name: "Pomelo",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.2, Fire: 0.2, Earth: 0.1 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 609, unit: "g" }, // Standard serving: 1/4 large pomelo
    scaledElemental: { Water: 0.49, Air: 0.21, Fire: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.205,
      Essence: 0.395,
      Matter: 0.1,
      Substance: 0.2,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 1.05 }, // Cooling effect, moderate force

    qualities: ["mild", "sweet", "aromatic", "large", "juicy"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    affinities: ["mint", "honey", "ginger", "cinnamon"],
    cookingMethods: ["raw", "juiced", "salads"],
    nutritionalProfile: {
      serving_size: "1 cup sections (190g)",
      calories: 72,
      macros: { protein: 1.4, carbs: 18.0, fat: 0.1, fiber: 2.6 },
      vitamins: { C: 1.93, folate: 0.06 },
      minerals: { potassium: 0.12 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.7,
        salty: 0.0,
        sour: 0.4,
        bitter: 0.2,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.6,
        fruity: 0.8,
        herbal: 0.1,
        spicy: 0.0,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.8,
        creamy: 0.0,
        chewy: 0.3,
        crunchy: 0.0,
        silky: 0.4,
      },
    },
    pairingRecommendations: {
      complementary: ["mint", "honey", "ginger", "seafood", "avocado"],
      contrasting: ["chili", "salty foods"],
      toAvoid: ["overly sweet combinations"],
    },
    preparation: {
      washing: true,
      peeling: "thick rind, easy to peel when scored",
      sectioning: "large segments, easy to separate",
      notes: "Remove bitter membrane from segments",
    },
    storage: {
      temperature: "room temp or refrigerated",
      duration: "2-3 weeks",
      notes: "Very large fruit, may need refrigeration",
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Jupiter"],
      favorableZodiac: ["cancer", "pisces", "sagittarius"],
      elementalAffinity: {
        base: "Water",
        decanModifiers: {
          first: { element: "Water", planet: "Moon", influence: 0.8 },
          second: { element: "Air", planet: "Jupiter", influence: 0.6 },
          third: { element: "Earth", planet: "Saturn", influence: 0.7 },
        },
      },
    },
  },

  yuzu: {
    name: "Yuzu",
    elementalProperties: { Water: 0.4, Air: 0.4, Fire: 0.1, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "cancer"],
      elementalAffinity: {
        base: "Air",
        secondary: "Water",
      },
    },
    qualities: ["aromatic", "tart", "floral", "complex"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    nutritionalProfile: {
      serving_size: "1 fruit juice (30ml)",
      calories: 9,
      macros: { protein: 0.2, carbs: 2.1, fat: 0.0, fiber: 0.1 },
      vitamins: { C: 0.13 },
      minerals: { potassium: 0.02 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.0,
        sour: 0.9,
        bitter: 0.4,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.9,
        fruity: 0.8,
        herbal: 0.3,
        spicy: 0.1,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.6,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.3,
      },
    },
    pairingRecommendations: {
      complementary: ["fish", "soy sauce", "honey", "sake", "ginger"],
      contrasting: ["rich meats", "cream"],
      toAvoid: ["delicate flavors that get overwhelmed"],
    },
    cookingMethods: ["zested", "juiced", "preserved", "infused"],
    storage: {
      temperature: "refrigerate",
      duration: "2-3 weeks",
      notes: "Highly aromatic and prized in Japanese cuisine",
    },
  },

  bergamot: {
    name: "Bergamot",
    elementalProperties: { Water: 0.3, Air: 0.4, Fire: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra"],
      elementalAffinity: {
        base: "Air",
        secondary: "Fire",
      },
    },
    qualities: ["aromatic", "bitter", "floral", "perfumed"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    nutritionalProfile: {
      serving_size: "1 tsp zest (2g)",
      calories: 0,
      macros: { protein: 0.0, carbs: 0.1, fat: 0.0, fiber: 0.1 },
      vitamins: { C: 0.01 },
      minerals: {},
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.1,
        salty: 0.0,
        sour: 0.7,
        bitter: 0.8,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 1.0,
        fruity: 0.7,
        herbal: 0.4,
        spicy: 0.2,
        earthy: 0.0,
        woody: 0.1,
      },
      texture: {
        crisp: 0.0,
        tender: 0.5,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.2,
      },
    },
    pairingRecommendations: {
      complementary: ["tea", "chocolate", "vanilla", "lavender"],
      contrasting: ["sugar", "honey"],
      toAvoid: ["most savory applications"],
    },
    cookingMethods: ["zested", "oil extraction", "tea flavoring", "marmalade"],
    storage: {
      temperature: "refrigerate",
      duration: "2 weeks",
      notes: "Primarily used for zest and oil in Earl Grey tea",
    },
  },

  kumquat: {
    name: "Kumquat",
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mercury"],
      favorableZodiac: ["leo", "gemini"],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      },
    },
    qualities: ["sweet-tart", "tiny", "edible peel", "intense"],
    season: ["winter", "spring"],
    category: "fruits",
    subCategory: "citrus",
    nutritionalProfile: {
      serving_size: "5 fruits (95g)",
      calories: 71,
      macros: { protein: 1.9, carbs: 15.9, fat: 0.9, fiber: 6.5 },
      vitamins: { C: 0.73 },
      minerals: { calcium: 0.06 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.6,
        salty: 0.0,
        sour: 0.7,
        bitter: 0.3,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.6,
        fruity: 0.9,
        herbal: 0.1,
        spicy: 0.1,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.6,
        tender: 0.7,
        creamy: 0.0,
        chewy: 0.4,
        crunchy: 0.0,
        silky: 0.0,
      },
    },
    pairingRecommendations: {
      complementary: ["ginger", "honey", "duck", "pork", "chocolate"],
      contrasting: ["cream", "sweet desserts"],
      toAvoid: ["overly acidic combinations"],
    },
    cookingMethods: ["raw whole", "candied", "preserved", "marmalade"],
    storage: {
      temperature: "room temp or refrigerate",
      duration: "2 weeks",
      notes: "Eat whole - sweet peel, tart flesh",
    },
  },

  finger_lime: {
    name: "Finger Lime",
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "gemini"],
      elementalAffinity: {
        base: "Water",
        secondary: "Air",
      },
    },
    qualities: ["tart", "caviar-like", "elegant", "unique"],
    season: ["summer", "fall"],
    category: "fruits",
    subCategory: "citrus",
    nutritionalProfile: {
      serving_size: "1 fruit (15g)",
      calories: 5,
      macros: { protein: 0.1, carbs: 1.2, fat: 0.0, fiber: 0.3 },
      vitamins: { C: 0.08 },
      minerals: { potassium: 0.01 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.0,
        sour: 0.9,
        bitter: 0.2,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.5,
        fruity: 0.8,
        herbal: 0.3,
        spicy: 0.0,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.9,
        silky: 0.0,
      },
    },
    pairingRecommendations: {
      complementary: ["seafood", "oysters", "champagne", "sushi", "ceviche"],
      contrasting: ["rich sauces", "cream"],
      toAvoid: ["overpowering flavors"],
    },
    cookingMethods: ["raw", "garnish", "cocktails", "seafood topping"],
    storage: {
      temperature: "refrigerate",
      duration: "2-3 weeks",
      notes: "Caviar-like pearls burst with flavor",
    },
  },

  blood_orange: {
    name: "Blood Orange",
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["aries", "leo"],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      },
    },
    qualities: ["sweet", "berry-like", "red flesh", "aromatic"],
    season: ["winter", "spring"],
    category: "fruits",
    subCategory: "citrus",
    nutritionalProfile: {
      serving_size: "1 medium (131g)",
      calories: 70,
      macros: { protein: 1.3, carbs: 17.6, fat: 0.3, fiber: 2.8 },
      vitamins: { C: 0.88, folate: 0.09 },
      minerals: { potassium: 0.08, calcium: 0.05 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.8,
        salty: 0.0,
        sour: 0.4,
        bitter: 0.1,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.7,
        fruity: 1.0,
        herbal: 0.0,
        spicy: 0.1,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.8,
        creamy: 0.0,
        chewy: 0.2,
        crunchy: 0.0,
        silky: 0.5,
      },
    },
    pairingRecommendations: {
      complementary: ["fennel", "olives", "chocolate", "vanilla", "arugula"],
      contrasting: ["beets", "blue cheese", "avocado"],
      toAvoid: ["milk (wait 30 min)"],
    },
    cookingMethods: ["raw", "juiced", "segmented", "salads"],
    storage: {
      temperature: "room temp or refrigerate",
      duration: "1-2 weeks",
      notes: "Distinctive raspberry-like flavor, burgundy flesh",
    },
  },

  tangerine: {
    name: "Tangerine",
    elementalProperties: { Water: 0.4, Fire: 0.3, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mercury"],
      favorableZodiac: ["leo", "gemini"],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      },
    },
    qualities: ["sweet", "easy-peel", "aromatic", "bright"],
    season: ["winter"],
    category: "fruits",
    subCategory: "citrus",
    nutritionalProfile: {
      serving_size: "1 medium (88g)",
      calories: 47,
      macros: { protein: 0.7, carbs: 11.7, fat: 0.3, fiber: 1.6 },
      vitamins: { C: 0.44, A: 0.14 },
      minerals: { potassium: 0.05 },
      source: "USDA FoodData Central",
    },
    sensoryProfile: {
      taste: {
        sweet: 0.8,
        salty: 0.0,
        sour: 0.3,
        bitter: 0.0,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.6,
        fruity: 0.9,
        herbal: 0.0,
        spicy: 0.0,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.8,
        creamy: 0.0,
        chewy: 0.1,
        crunchy: 0.0,
        silky: 0.6,
      },
    },
    pairingRecommendations: {
      complementary: ["chocolate", "vanilla", "ginger", "honey", "mint"],
      contrasting: ["fennel", "olives"],
      toAvoid: ["overly acidic combinations"],
    },
    cookingMethods: ["raw", "juiced", "zested", "preserved"],
    storage: {
      temperature: "room temp or refrigerate",
      duration: "1-2 weeks",
      notes: "Very easy to peel and segment",
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const citrus: Record<string, IngredientMapping> =
  fixIngredientMappings(rawCitrus);
