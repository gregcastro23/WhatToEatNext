import type { IngredientMapping } from "@/types/alchemy";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawFreshHerbs = {
  basil: {
      description: "A tender, aromatic herb (*Ocimum basilicum*) of the mint family, defined by its bright green, delicate leaves. Its complex flavor profile includes notes of anise, clove, and sweet citrus; because its volatile oils evaporate quickly, it should be added at the very end of cooking or used raw.",
    name: "Basil",
    category: "herbs",
    subCategory: "fresh_herb",

    // Base elemental properties (unscaled)
    elementalProperties: { Air: 0.43, Water: 0.27, Fire: 0.22, Earth: 0.08 },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 5, unit: "g" }, // Standard serving: 2 tablespoons chopped
    scaledElemental: { Air: 0.43, Water: 0.27, Fire: 0.22, Earth: 0.08 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.75,
      Essence: 0.80,
      Matter: 0.10,
      Substance: 0.12,
    }, // Independent dimensions (0.0-1.0 each, do not sum to 1.0)
    kineticsImpact: { thermalDirection: 0.12, forceMagnitude: 1.15 }, // Mild warming, high force (concentrated flavor)
    qualities: ["aromatic", "sweet", "peppery", "fresh", "vibrant", "delicate"],
    origin: ["India", "Southeast Asia", "Mediterranean"],

    // Nutritional information (standardized)
    nutritionalProfile: {
      serving_size: "2 tablespoons, chopped (5g)",
      calories: 1,
      macros: {
        protein: 0.2,
        carbs: 0.1,
        fat: 0.0,
        fiber: 0.1,
      },
      vitamins: {
        K: 0.13, // Values as percentage of RDA
        A: 0.03,
        C: 0.02,
        folate: 0.01,
        B6: 0.01,
      },
      minerals: {
        manganese: 0.03,
        calcium: 0.01,
        iron: 0.01,
        magnesium: 0.01,
        potassium: 0.01,
      },
      antioxidants: {
        phenolics: "high",
        flavonoids: "high",
        carotenoids: "moderate",
      },
      source: "USDA FoodData Central",
    },

    // Sensory profile (standardized)
    sensoryProfile: {
      taste: {
        sweet: 0.5,
        salty: 0.0,
        sour: 0.1,
        bitter: 0.2,
        umami: 0.0,
        spicy: 0.2,
      },
      aroma: {
        floral: 0.6,
        fruity: 0.3,
        herbal: 0.9,
        spicy: 0.3,
        earthy: 0.1,
        woody: 0.0,
      },
      texture: {
        crisp: 0.3,
        tender: 0.8,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.1,
      },
    },

    // Storage information (standardized)
    storage: {
      temperature: "room temperature or refrigerated",
      duration: "4-7 days fresh6-12 months dried",
      container: "stem in water like flowers, loosely cover with plastic",
      tips: [
        "Do not refrigerate if possible - causes blackening",
        "Change water daily if storing in water",
        "Wrap in slightly damp paper towel if refrigerating",
        "Freeze whole leaves in olive oil in ice cube trays",
      ],
    },

    // Preparation (standardized)
    preparation: {
      washing: true,
      methods: [
        "fresh",
        "torn",
        "chiffonade",
        "pureed",
        "infused",
        "dried",
        "frozen",
      ],
      processing: {
        washing: "gentle rinse, pat dry with paper towels",
        drying: "air-dry or use lowest setting on dehydrator",
        chopping: "tear by hand or cut with sharp knife just before using",
        preserving: "freeze in oil, infuse in vinegar or oil, dry",
      },
      notes:
        "Turns black when cut with dull knife or exposed to acid for too long add at end of cooking to preserve flavor",
    },

    // Culinary applications (standardized)
    culinaryApplications: {
      commonUses: [
        "pesto",
        "tomato dishes",
        "salads",
        "infused oils",
        "cocktails",
        "desserts",
        "sauces",
      ],
      pairingRecommendations: {
        complementary: [
          "tomato",
          "garlic",
          "olive oil",
          "pine nuts",
          "lemon",
          "mozzarella",
          "pasta",
          "eggplant",
        ],
        contrasting: [
          "strawberry",
          "peach",
          "watermelon",
          "balsamic vinegar",
          "chocolate",
        ],
        toAvoid: ["strong spices", "prolonged cooking", "bitter greens"],
      },
      seasonalPeak: ["summer"],
      techniques: {
        pesto: {
          method: "food processor or mortar and pestle",
          ingredients: ["olive oil", "pine nuts", "parmesan", "garlic", "salt"],
          notes: "Use only the leaves, adjust garlic to taste",
        },
        caprese: {
          method: "layered or arranged",
          ingredients: ["tomato", "mozzarella", "olive oil", "balsamic"],
          notes: "Use whole small leaves, add just before serving",
        },
      },
    },

    // Health benefits (standardized)
    healthBenefits: [
      "Anti-inflammatory properties",
      "Rich in antioxidants",
      "May help lower blood sugar",
      "Supports digestive health",
      "Contains antimicrobial compounds",
      "May help reduce stress",
      "Supports cardiovascular health",
    ],

    // Varieties (standardized)
    varieties: {
      sweet_basil: {
        name: "Sweet Basil (Genovese)",
        appearance: "bright green, rounded leaves",
        aroma: "sweet, slightly clove-like",
        flavor: "sweet with slight peppery notes",
        uses: "Italian cuisine, pesto, tomato dishes",
        oil_content: 0.7, // percentage
      },
      thai_basil: {
        name: "Thai Basil",
        appearance: "narrower leaves, purple stems",
        aroma: "anise-like, spicy",
        flavor: "more stable under high heat than sweet basil",
        uses: "Southeast Asian cuisine, stir-fries, curries",
        oil_content: 0.6,
      },
      holy_basil: {
        name: "Holy Basil (Tulsi)",
        appearance: "fuzzy leaves, often purplish",
        aroma: "spicy, complex",
        flavor: "peppery, clove-like",
        uses: "Indian cuisine, medicinal tea, stir-fries",
        oil_content: 0.8,
      },
      lemon_basil: {
        name: "Lemon Basil",
        appearance: "light green, narrow leaves",
        aroma: "strong citrus scent",
        flavor: "lemony, lighter than sweet basil",
        uses: "Southeast Asian cuisine, seafood, desserts",
      },
    },

    // Category-specific extension: herbs
    potency: 7, // 1-10 scale
    aroma: {
      intensity: 8, // 1-10 scale
      volatility: 9, // How quickly aroma dissipates (1-10)
      mainCompounds: [
        "linalool",
        "eugenol",
        "citral",
        "limonene",
        "methyl chavicol",
      ],
    },
    drying: {
      methods: ["air-drying", "dehydrator", "microwave", "oven"],
      flavorRetention: 0.4, // 40% of flavor retained when dried
      bestPractices: [
        "Harvest before flowering for best flavor",
        "Dry quickly in well-ventilated area",
        "Store in airtight container away from light",
      ],
    },
    timing: {
      addEarly: false,
      addLate: true,
      notes: "Add in last few minutes of cooking or after removing from heat",
    },
    substitutions: ["oregano", "thyme", "tarragon", "mint"],

    // Herb-specific properties
    essentialOilContent: 0.5, // percentage
    aromaticCompounds: [
      {
        name: "Linalool",
        percentage: 40,
        aroma: "floral, fresh",
        properties: ["calming", "anti-inflammatory"],
      },
      {
        name: "Eugenol",
        percentage: 15,
        aroma: "clove-like, spicy",
        properties: ["antiseptic", "analgesic"],
      },
      {
        name: "Estragole (Methyl chavicol)",
        percentage: 30,
        aroma: "anise-like",
        properties: ["stimulant", "digestive aid"],
      },
    ],

    // Herb usage by cuisine type
    culinaryTraditions: {
      vietnamese: {
        name: "rau quế",
        usage: ["pho", "spring rolls", "bánh mì"],
        preparation: "fresh, served raw",
        regional_importance: 7,
      },
    },

    // Seasonal adjustments for herb growing
    seasonality: {
      planting: "after last frost",
      harvesting: "throughout summer until first frost",
      peak_flavor: "mid-summer",
      growth_conditions: {
        soil: "well-draining, pH 6-7",
        sun: "full sun",
        water: "moderate, consistent moisture",
        spacing: "8-12 inches apart",
      },
    },

    // Astrology / (elemental || 1) connections (standardized)
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra", "virgo"],
      elementalAffinity: {
        base: "Air",
        secondary: "Fire",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Fire", planet: "Venus" },
          third: { element: "Water", planet: "Jupiter" },
        },
      },
      lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Air: 0.1, Water: 0.05 },
          preparationTips: ["Harvest in morning", "Gentle processing"],
        },
        fullMoon: {
          elementalBoost: { Air: 0.15, Fire: 0.1 },
          preparationTips: [
            "Enhanced aroma when harvested",
            "Good for infusions",
          ],
        },
      },
      aspectEnhancers: ["Mercury trine Venus", "Jupiter in Libra"],
    },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] }
},

  // More herbs would be added here...
  pork_sausage: {
      description: "An aromatic culinary herb, pork sausage contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "pork sausage",
    // Corrected: pork sausage is a cured meat, not an herb.
    // Fire-dominant (high heat cooking), secondary Earth (rich, dense).
    elementalProperties: { Fire: 0.5, Water: 0.1, Earth: 0.35, Air: 0.05 },
    qualities: ["savory", "rich", "cured", "umami"],
    category: "meats",
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["Aries", "Capricorn", "Scorpio"],
      seasonalAffinity: ["autumn", "winter"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  thyme: {
      description: "A resilient, woody-stemmed herb (*Thymus vulgaris*) featuring tiny leaves packed with the essential oil thymol. Its earthy, slightly floral, and sharp flavor holds up exceptionally well to long, slow cooking, making it a foundational aromatic for stocks, stews, and roasted meats.",
    name: "thyme",
    // Warm, earthy Mediterranean herb. Fire (warming thymol), Air (volatile aromatics), Earth (woody stem).
    elementalProperties: { Fire: 0.30, Water: 0.10, Earth: 0.20, Air: 0.40 },
    qualities: ["aromatic", "warming", "earthy", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mercury"],
      favorableZodiac: ["Taurus", "Libra", "Virgo"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_thyme: {
      description: "An aromatic culinary herb, fresh thyme contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "fresh thyme",
    // Similar to dried thyme but slightly more Water (moisture in fresh leaves).
    elementalProperties: { Fire: 0.25, Water: 0.15, Earth: 0.18, Air: 0.42 },
    qualities: ["aromatic", "fresh", "warming", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mercury"],
      favorableZodiac: ["Taurus", "Libra", "Virgo"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  sage: {
      description: "A hardy herb (*Salvia officinalis*) with velvety, grey-green leaves and a highly assertive, pine-like, and slightly astringent aroma. Because its flavor is so robust and somewhat resinous, it pairs perfectly with fatty meats like pork and sausage, or browned butter sauces.",
    name: "sage",
    // Warm, pungent, slightly bitter. Strong Fire (warming oils), Air (volatile compounds), Earth (grounding).
    elementalProperties: { Fire: 0.35, Water: 0.10, Earth: 0.20, Air: 0.35 },
    qualities: ["warming", "pungent", "savory", "medicinal", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Mercury"],
      favorableZodiac: ["Sagittarius", "Gemini", "Virgo"],
      seasonalAffinity: ["autumn", "winter"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_mint: {
      description: "An aromatic culinary herb, fresh mint contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "fresh mint",
    // Cooling menthol creates a paradoxical sensation: Water (cooling), Air (volatile menthol), minimal Fire/Earth.
    elementalProperties: { Fire: 0.05, Water: 0.40, Earth: 0.05, Air: 0.50 },
    qualities: ["cooling", "refreshing", "menthol", "aromatic", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Libra", "Cancer", "Pisces"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_sage: {
      description: "An aromatic culinary herb, fresh sage contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "fresh sage",
    // Fresh sage: slightly more Water than dried, warm pungent oils still dominate.
    elementalProperties: { Fire: 0.30, Water: 0.15, Earth: 0.20, Air: 0.35 },
    qualities: ["warming", "pungent", "fresh", "savory", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Mercury"],
      favorableZodiac: ["Sagittarius", "Gemini", "Virgo"],
      seasonalAffinity: ["spring", "summer", "autumn"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  bay_leaf: {
      description: "The aromatic leaf of the sweet bay tree (*Laurus nobilis*), typically used dried. When simmered in liquid for an extended period, it releases complex, woodsy, floral, and slightly menthol notes that add essential savory depth to soups, stews, and braises.",
    name: "bay leaf",
    // Subtle, woody background note. Earth (woody structure), Air (slow-release aromatics), mild Fire.
    elementalProperties: { Fire: 0.15, Water: 0.10, Earth: 0.35, Air: 0.40 },
    qualities: ["aromatic", "woody", "subtle", "earthy", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Apollo"],
      favorableZodiac: ["Gemini", "Leo", "Virgo"],
      seasonalAffinity: ["all"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  flat_leaf_parsley: {
      description: "An aromatic culinary herb, flat leaf parsley contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "flat-leaf parsley",
    // Bright, fresh, green. Air (fresh volatile compounds), Water (high moisture, fresh green), minimal Fire/Earth.
    elementalProperties: { Fire: 0.10, Water: 0.35, Earth: 0.10, Air: 0.45 },
    qualities: ["fresh", "bright", "green", "clean", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["Gemini", "Virgo", "Cancer"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  oregano: {
      description: "A robust, highly aromatic herb (*Origanum vulgare*) essential to Mediterranean and Mexican cuisines. Unlike delicate herbs, its pungent, slightly bitter, and peppery flavor actually deepens and improves when dried, making it a powerful seasoning for tomato sauces and grilled meats.",
    name: "oregano",
    // Robust Mediterranean herb. Strong Fire (warming carvacrol), Air (pungent aromatics), Earth (robust drying).
    elementalProperties: { Fire: 0.40, Water: 0.10, Earth: 0.15, Air: 0.35 },
    qualities: ["pungent", "warming", "robust", "aromatic", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Mercury"],
      favorableZodiac: ["Aries", "Gemini", "Scorpio"],
      seasonalAffinity: ["summer", "autumn"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  parsley: {
      description: "A mild, grassy, and slightly bitter herb (*Petroselinum crispum*) available in curly (best for garnishing) and flat-leaf (best for cooking) varieties. Its clean, mineral-rich flavor acts as a culinary palate cleanser, cutting through heavy fats and brightening rich stews and sauces.",
    name: "parsley",
    // Classic culinary parsley. Air dominant (fresh aromatics), Water (moisture-rich leaves).
    elementalProperties: { Fire: 0.10, Water: 0.35, Earth: 0.12, Air: 0.43 },
    qualities: ["fresh", "bright", "mild", "versatile", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["Gemini", "Virgo", "Cancer"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  mint: {
      description: "A rapidly spreading, aromatic herb (*Mentha*) characterized by the cooling compound menthol. It provides a sharp, refreshing contrast to rich or spicy dishes, and is utilized globally in everything from Middle Eastern lamb marinades to Southeast Asian salads and sweet desserts.",
    name: "mint",
    // Cooling, menthol-dominant. Water (cooling effect), Air (extremely volatile menthol compounds).
    elementalProperties: { Fire: 0.05, Water: 0.40, Earth: 0.08, Air: 0.47 },
    qualities: ["cooling", "refreshing", "menthol", "aromatic", "medicinal", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Libra", "Cancer", "Pisces"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  dill: {
      description: "A feathery, delicate herb (*Anethum graveolens*) with a distinctively clean, grassy flavor featuring notes of anise and celery. It pairs classicly with mild, sweet ingredients like seafood, cucumbers, and yogurt, and its seeds are essential for pickling.",
    name: "dill",
    // Feathery, delicate, anise-like. Very Air dominant (extremely aromatic, feathery texture), Water (fresh green).
    elementalProperties: { Fire: 0.05, Water: 0.30, Earth: 0.10, Air: 0.55 },
    qualities: ["delicate", "feathery", "anise-like", "fresh", "aromatic", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["Gemini", "Cancer", "Pisces"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  bay_leaves: {
      description: "An aromatic culinary herb, bay leaves contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "bay leaves",
    // Same profile as bay_leaf (plural form, same ingredient).
    elementalProperties: { Fire: 0.15, Water: 0.10, Earth: 0.35, Air: 0.40 },
    qualities: ["aromatic", "woody", "subtle", "earthy", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Apollo"],
      favorableZodiac: ["Gemini", "Leo", "Virgo"],
      seasonalAffinity: ["all"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  rosemary: {
      description: "A fragrant, evergreen shrub (*Salvia rosmarinus*) of the mint family known for its needle-like leaves and robust, pine-and-citrus aroma. Its essential oils contain rosmarinic acid, a powerful antioxidant that helps preserve the flavor and freshness of the foods it's cooked with, making it a classic pairing for roasted meats and root vegetables.\\n\\n",
    name: "rosemary",
    // Piney, resinous, powerful. Fire dominant (warming terpenes, resinous oils), Air (piney volatile aroma).
    elementalProperties: { Fire: 0.45, Water: 0.10, Earth: 0.15, Air: 0.30 },
    qualities: ["piney", "resinous", "warming", "robust", "aromatic", "medicinal", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mars"],
      favorableZodiac: ["Leo", "Aries", "Capricorn"],
      seasonalAffinity: ["year-round"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  mint_leaves: {
      description: "An aromatic culinary herb, mint leaves contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "mint leaves",
    // Mint leaves — same cooling profile as mint.
    elementalProperties: { Fire: 0.05, Water: 0.40, Earth: 0.08, Air: 0.47 },
    qualities: ["cooling", "refreshing", "aromatic", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Libra", "Cancer", "Pisces"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_basil: {
      description: "An aromatic culinary herb, fresh basil contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "fresh basil",
    // Fresh basil shares the profile of the detailed basil entry above: Air dominant, sweet/warm.
    elementalProperties: { Fire: 0.22, Water: 0.27, Earth: 0.08, Air: 0.43 },
    qualities: ["aromatic", "sweet", "fresh", "warm", "culinary"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Libra", "Virgo"],
      seasonalAffinity: ["summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  cilantro: {
      description: "A delicate, leafy green herb (*Coriandrum sativum*) known for its bright, citrusy, and slightly peppery flavor (though a genetic trait makes it taste like soap to some). It loses its flavor entirely when cooked, so it is used exclusively as a fresh garnish or pounded into raw salsas and chutneys.",
    name: "cilantro",
    // Bright, citrusy-soapy. Air very dominant (highly volatile aldehydes), Water (fresh green moisture).
    elementalProperties: { Fire: 0.08, Water: 0.32, Earth: 0.10, Air: 0.50 },
    qualities: ["citrusy", "fresh", "aromatic", "bright", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Libra", "Aquarius"],
      seasonalAffinity: ["spring", "summer"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
};

// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const freshHerbs = fixIngredientMappings(
  rawFreshHerbs as unknown as Record<string, Partial<IngredientMapping>>,
);

export default freshHerbs;
