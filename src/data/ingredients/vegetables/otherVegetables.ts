import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawOtherVegetables = {
  asparagus: {
    name: "asparagus",

    elementalProperties: {
      Fire: 0.7644171899336816,
      Water: 0.20342270505373083,
      Earth: 0.025567430424262617,
      Air: 0.006592674588325188,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 3.88,
      calories: 20,
      fiber_g: 2.1,
      protein_g: 2.2,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    sensoryProfile: {
      taste: ["Mild"],
      aroma: ["Fresh"],
      texture: ["Standard"],
      notes: "Characteristic asparagus profile",
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for asparagus",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  artichoke: {
    name: "artichoke",

    elementalProperties: {
      Fire: 0.12620732804129353,
      Water: 0.7539592539005983,
      Earth: 0.09658624330348414,
      Air: 0.023247174754624015,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 10.51,
      calories: 47,
      fiber_g: 5.4,
      protein_g: 3.27,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    sensoryProfile: {
      taste: ["Mild"],
      aroma: ["Fresh"],
      texture: ["Standard"],
      notes: "Characteristic artichoke profile",
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for artichoke",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  cucumber: {
    name: "cucumber",

    elementalProperties: {
      Fire: 0.34993398250536384,
      Water: 0.5760851625680805,
      Earth: 0.060653573196897174,
      Air: 0.013327281729658358,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["Virgo", "Gemini", "Cancer"],
      seasonalAffinity: ["all"],
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 2.16,
      calories: 12,
      fiber_g: 0.7,
      protein_g: 0.59,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for cucumber",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},
  },
  okra: {
    name: "okra",

    elementalProperties: {
      Fire: 0.6419553778871122,
      Water: 0.2653922372557059,
      Earth: 0.07277572775727757,
      Air: 0.019876657099904334,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 7.45,
      calories: 33,
      fiber_g: 3.2,
      protein_g: 1.93,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for okra",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  zucchini: {
    name: "zucchini",

    elementalProperties: {
      Fire: 0.4204917086683852,
      Water: 0.5121388172829056,
      Earth: 0.032703628178985034,
      Air: 0.034665845869724134,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 3.1,
      calories: 17,
      fiber_g: 1,
      protein_g: 1.2,
      vitamins: ["a", "c", "k", "b6"],
      minerals: ["potassium", "manganese", "magnesium"],
      fat_g: 0.3,
      sugar_g: 2.5,
      glycemic_index: 15,
      notes: "Low calorie and nutrient-dense",
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for zucchini",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  peas: {
    name: "petite peas",

    elementalProperties: {
      Fire: 0.7162207554458272,
      Water: 0.2242992223845753,
      Earth: 0.025780554575838496,
      Air: 0.03369946759375892,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 14.4,
      calories: 81,
      fiber_g: 5.7,
      protein_g: 5.42,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for peas",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  green_beans: {
    name: "green beans",

    elementalProperties: {
      Fire: 0.7250127703047846,
      Water: 0.22259392433970013,
      Earth: 0.0397632235254054,
      Air: 0.012630081830109875,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 6.97,
      calories: 31,
      fiber_g: 2.7,
      protein_g: 1.83,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for green_beans",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  celery: {
    name: "celery",

    elementalProperties: {
      Fire: 0.5999612002069322,
      Water: 0.34187790998448014,
      Earth: 0.0538023797206415,
      Air: 0.004358510087946198,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 2.97,
      calories: 14,
      fiber_g: 1.6,
      protein_g: 0.69,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for celery",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  fennel: {
    name: "fennel",

    // Fennel: anise-like aromatic vegetable. Air (licorice/anise volatile aromatics, feathery fronds),
    // Water (crisp, high-moisture bulb), Earth (root-like grounding), mild Fire (warming seeds).
    elementalProperties: {
      Fire: 0.10,
      Water: 0.30,
      Earth: 0.25,
      Air: 0.35,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 7.3,
      calories: 31,
      fiber_g: 3.1,
      protein_g: 1.24,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["aromatic", "anise-like", "crisp", "nutritious", "fresh"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for fennel",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  kohlrabi: {
    name: "kohlrabi",

    elementalProperties: {
      Fire: 0.12665862484921594,
      Water: 0.6980816374177985,
      Earth: 0.05369858749367681,
      Air: 0.12156115023930894,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 6.2,
      calories: 27,
      fiber_g: 3.6,
      protein_g: 1.7,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for kohlrabi",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  bok_choy: {
    name: "bok choy",

    elementalProperties: {
      Fire: 0.9168771409581267,
      Water: 0.05222352881026636,
      Earth: 0.02167799989774528,
      Air: 0.009221330333861648,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 2.18,
      calories: 13,
      fiber_g: 1,
      protein_g: 1.5,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for bok_choy",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  endive: {
    name: "escarole",

    elementalProperties: {
      Fire: 0.8520337371186256,
      Water: 0.12378591584428543,
      Earth: 0.021475453284068413,
      Air: 0.002704893753020595,
    },

    category: "vegetables",
    subCategory: "other",

    nutritionalProfile: {
      carbs_g: 3.35,
      calories: 17,
      fiber_g: 3.1,
      protein_g: 1.25,
      vitamins: ["k", "d", "c", "e", "a", "b3", "b6", "b12", "b2", "b5", "b1"],
      minerals: ["zinc", "magnesium", "iron", "potassium", "calcium"],
    },

    season: ["spring", "summer", "fall", "winter"],

    cookingMethods: ["roast", "boil", "steam", "saute"],

    qualities: ["nutritious"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    origin: ["Unknown"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for endive",
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: [],
      favorableZodiac: [],
    },
  },
  tomato_paste: {
    name: "tomato paste",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  onions: {
    name: "onions",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  bell_peppers: {
    name: "bell peppers",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  garlic: {
    name: "garlic",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  red_pepper_flakes: {
    name: "red pepper flakes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  black_pepper: {
    name: "black pepper",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
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
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  chia_seeds: {
    name: "chia seeds",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  lettuce: {
    name: "lettuce",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  tomato: {
    name: "tomato",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  onion: {
    name: "onion",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  romaine_lettuce: {
    name: "romaine lettuce",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  cherry_tomatoes: {
    name: "cherry tomatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  potatoes: {
    name: "potatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  russet_potatoes: {
    name: "russet potatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  garlic_powder: {
    name: "garlic powder",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
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
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  carrots: {
    name: "carrots",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
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
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  white_pepper: {
    name: "white pepper",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  tomatoes: {
    name: "tomatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  yellow_onions: {
    name: "yellow onions",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  cremini_mushrooms: {
    name: "cremini mushrooms",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
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
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  green_peppers: {
    name: "green peppers",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  eggplants: {
    name: "eggplants",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  chickpeas: {
    name: "chickpeas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  peanuts: {
    name: "peanuts",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  spinach: {
    name: "spinach",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  large_eggplant: {
    name: "large eggplant",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  tomato_sauce: {
    name: "tomato sauce",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  eggplant: {
    name: "eggplant",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  potato: {
    name: "potato",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  carrot: {
    name: "carrot",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  cabbage: {
    name: "cabbage",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  potato_starch: {
    name: "potato starch",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  lettuce_leaves: {
    name: "lettuce leaves",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  mushrooms: {
    name: "mushrooms",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  asian_pear: {
    name: "asian pear",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  sweet_potato: {
    name: "sweet potato",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  napa_cabbage: {
    name: "napa cabbage",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  radish_kimchi: {
    name: "radish kimchi",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  sweet_potato_noodles: {
    name: "sweet potato noodles",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  dried_chickpeas: {
    name: "dried chickpeas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  cauliflower: {
    name: "cauliflower",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  black_peppercorns: {
    name: "black peppercorns",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
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
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  tapioca_pearls: {
    name: "tapioca pearls",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
  },
  crushed_peanuts: {
    name: "crushed peanuts",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
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
