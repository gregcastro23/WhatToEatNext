import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Phase 2: Enhanced Seafood with Quantity Scaling Metadata
// Generated: 2025-01-24
const rawSeafood: Record<string, Partial<IngredientMapping>> = {
  atlantic_salmon: {
    name: "Salmon",
    description:
      "Oily cold-water fish (*Salmo salar*, Atlantic) prized for its rich orange flesh, generous omega-3 fats, and forgiving, flaky texture. Farmed salmon from Norway, Scotland, and Chile supplies most of the world market; wild Atlantic stocks are heavily restricted. Flavor ranges from buttery and mild (farmed) to deeply savory and almost meaty (wild). Essential in everything from Scandinavian cured gravlax to Japanese sushi, French en papillote, and American cedar-plank grilling.",
    regionalOrigins: ["northern_europe", "north_america", "south_america"],
    sustainabilityScore: 6,
    season: ["spring", "summer", "autumn"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.6, Earth: 0.2, Fire: 0.1, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 170, unit: "g" }, // Standard serving: 6oz fillet
    scaledElemental: { Water: 0.58, Earth: 0.21, Fire: 0.11, Air: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.20,
      Essence: 0.75,
      Matter: 0.55,
      Substance: 0.60,
    },
    kineticsImpact: { thermalDirection: -0.1, forceMagnitude: 1.05 }, // Cooling effect, moderate force

    qualities: [
      "omega-rich",
      "flaky",
      "buttery",
      "mild",
      "versatile",
      "nutrient-dense",
    ],
    origin: ["Norway", "Scotland", "Chile", "Canada", "United States"],

    // Nutritional information (standardized)
    nutritionalProfile: {
      serving_size: "3 oz (85g)",
      calories: 206,
      macros: {
        protein: 22,
        carbs: 0,
        fat: 12,
        fiber: 0,
        saturatedFat: 2.5,
        sugar: 0,
        potassium: 326,
        sodium: 50,
      },
      vitamins: {
        B12: 1.17, // Values as percentage of RDA
        D: 0.66,
        niacin: 0.5,
        B6: 0.38,
        pantothenic_acid: 0.3,
        thiamine: 0.28,
      },
      minerals: {
        selenium: 0.75,
        phosphorus: 0.2,
        potassium: 0.08,
      },
      omega3: 1.8, // grams per serving
      source: "USDA FoodData Central",
    },

    // Sensory profile (standardized)
    sensoryProfile: {
      taste: {
        sweet: 0.3,
        salty: 0.2,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.8,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.0,
        spicy: 0.0,
        earthy: 0.3,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.7,
        creamy: 0.4,
        chewy: 0.2,
        crunchy: 0.0,
        silky: 0.7,
      },
    },

    // Storage information (standardized)
    storage: {
      temperature: {
        fahrenheit: 32,
        celsius: 0,
      },
      duration: "1-2 days (fresh), 2-3 months (frozen)",
      container: "airtight wrapping",
      tips: [
        "Keep in coldest part of refrigerator",
        "Use within 24 hours of purchase for best flavor",
        "Wrap in moisture-proof paper or plastic before freezing",
      ],
    },

    // Preparation (standardized)
    preparation: {
      methods: [
        "grill",
        "bake",
        "pan-sear",
        "poach",
        "steam",
        "smoke",
        "raw (sushi-grade)",
      ],
      washing: false,
      notes:
        "Leave skin on during cooking for easier handling and extra nutrients",
    },

    // Health benefits (standardized)
    healthBenefits: [
      "Heart health (reduces blood pressure and inflammation)",
      "Brain function (enhances memory and cognitive performance)",
      "Joint health (reduces stiffness and arthritis symptoms)",
      "Weight management (protein-rich and satiating)",
      "Thyroid health (good source of selenium)",
      "Bone health (contains vitamin D and phosphorus)",
      "Mental well-being (omega-3s may help reduce depression symptoms)",
    ],

    // Culinary applications (standardized)
    culinaryApplications: {
      commonUses: [
        "entrees",
        "salads",
        "sushi",
        "appetizers",
        "sandwiches",
        "breakfast dishes",
      ],
      pairingRecommendations: {
        complementary: [
          "lemon",
          "dill",
          "capers",
          "butter",
          "olive oil",
          "garlic",
          "white wine",
          "fennel",
        ],
        contrasting: [
          "dijon mustard",
          "maple syrup",
          "soy sauce",
          "ginger",
          "cucumber",
        ],
        toAvoid: [
          "strong cheeses",
          "chocolate",
          "most red wine",
          "very spicy peppers",
        ],
      },
      seasonalPeak: ["spring", "summer"],
      techniques: {
        grill: {
          method: "direct heat, medium-high",
          temperature: { celsius: 190, fahrenheit: 375 },
          timing: "4-5 minutes per side",
          ingredients: ["butter", "garlic", "dill", "lemon zest"],
          notes: "Cedar plank adds smoky flavor",
        },
        pan_sear: {
          method: "high heat, skin-on",
          timing: "4-5 minutes skin side, 2-3 minutes flesh side",
          ingredients: ["butter", "thyme", "garlic", "lemon"],
          notes: "Start with very hot pan, cook skin side first until crispy",
        },
      },
    },

    // Varieties (standardized)
    varieties: {
      "Farm Raised": {
        name: "Farm Raised",
        appearance: "light orange-pink",
        texture: "fatty, soft",
        flavor: "mild, buttery",
        uses: "all-purpose",
      },
    },

    // Category-specific extension: proteins
    cuts: {
      fillet: {
        description: "boneless side",
        weight: "6-8 oz per serving",
        notes: "most versatile",
        cookingMethods: ["grill", "bake", "pan-sear", "poach"],
      },
      steak: {
        description: "cross-section cut",
        weight: "8-10 oz",
        notes: "good for grilling",
        cookingMethods: ["grill", "bake"],
      },
      whole_side: {
        description: "entire fillet",
        weight: "2-4 lbs",
        notes: "ideal for large gatherings",
        cookingMethods: ["bake", "smoke", "grill"],
      },
    },

    cookingTips: {
      internalTemperature: {
        medium: { fahrenheit: 125, celsius: 52 },
        mediumWell: { fahrenheit: 135, celsius: 57 },
        safe: { fahrenheit: 145, celsius: 63 },
      },
      restingTime: "3-5 minutes",
      commonMistakes: [
        "Overcooking (becomes dry)",
        "Starting in a cold pan (causes sticking)",
        "Removing skin (provides barrier during cooking)",
        "Cooking straight from refrigerator (uneven cooking)",
      ],
    },

    sustainability: {
      rating: "Variable",
      considerations: [
        "Farming methods impact environmental footprint",
        "Look for ASC or MSC certification",
        "Closed containment farming reduces environmental impact",
      ],
      alternatives: [
        "Arctic char",
        "Rainbow trout",
        "MSC-certified wild salmon",
      ],
    },

    // Protein-specific properties
    proteinContent: 22, // grams per 3oz serving
    fatProfile: {
      saturated: 3, // grams per 3oz serving
      omega3: 1.8,
    },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] }
},

  // Phase 2: Additional Seafood with Quantity Scaling
  tuna: {
    name: "Tuna",
    description:
      "Large, fast-swimming pelagic fish (*Thunnus spp.*) with dense, meaty red flesh, frequently compared to beef. Yellowfin (ahi) and bigeye are prized raw for sushi and sashimi; bluefin (the most prized and most endangered) delivers the fattest toro belly cuts; skipjack dominates canning. Sears beautifully with a rare center; overcooks quickly to chalky dryness. Buy only from sources rated Best Choice or Good Alternative by Seafood Watch — some populations are severely overfished.",
    regionalOrigins: ["pacific", "atlantic", "indian_ocean", "mediterranean"],
    sustainabilityScore: 4,
    season: ["spring", "summer", "autumn"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    // Base elemental properties (unscaled)
    elementalProperties: { Fire: 0.3, Water: 0.4, Air: 0.2, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 150, unit: "g" }, // Standard serving: 5oz steak
    scaledElemental: { Fire: 0.29, Water: 0.41, Air: 0.2, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.60,
      Matter: 0.65,
      Substance: 0.70,
    },
    kineticsImpact: { thermalDirection: 0.15, forceMagnitude: 1.12 }, // Warming effect, strong force

    qualities: ["meaty", "firm", "versatile", "protein-rich", "omega-3"],
    origin: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean"],

    nutritionalProfile: {
      serving_size: "4 oz (113g)",
      calories: 184,
      macros: {
        protein: 42,
        carbs: 0,
        fat: 1,
        fiber: 0,
        saturatedFat: 0.3,
        sugar: 0,
        potassium: 444,
        sodium: 50,
      },
      vitamins: { B12: 1.5, D: 0.4, niacin: 0.8 },
      minerals: { selenium: 0.9, phosphorus: 0.3 },
      omega3: 2.1,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["sear", "grill", "raw (sashimi)", "canned"],
      washing: false,
      notes: "Can be eaten raw or cooked to desired doneness",
    },

    healthBenefits: [
      "High-quality protein",
      "Omega-3 fatty acids",
      "Heart health",
    ],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  shrimp: {
    name: "Shrimp",
    description:
      "Small decapod crustaceans (*Penaeidae, Pandalidae*) harvested worldwide — the most consumed seafood in the United States. Sweet, briny flesh that turns from translucent grey-blue to opaque pink in seconds. Sold by count-per-pound (U-15 jumbo down to 61/70 small). Prawns are similar and often used interchangeably. Star in shrimp scampi, Thai tom yum, Spanish gambas al ajillo, Cajun étouffée, and Southeast Asian curries.",
    regionalOrigins: ["gulf_of_mexico", "pacific", "atlantic", "southeast_asia"],
    sustainabilityScore: 5,
    season: ["all"],
    seasonality: ["spring", "summer", "autumn", "winter"],
    category: "proteins",
    subCategory: "seafood",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 100, unit: "g" }, // Standard serving: 3.5oz
    scaledElemental: { Water: 0.49, Air: 0.31, Fire: 0.1, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.20,
      Essence: 0.65,
      Matter: 0.35,
      Substance: 0.45,
    },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.95 }, // Mild warming, gentle force

    qualities: ["sweet", "tender", "versatile", "quick-cooking", "low-calorie"],
    origin: ["Gulf of Mexico", "Pacific Ocean", "Atlantic Ocean"],

    nutritionalProfile: {
      serving_size: "7 large (100g)",
      calories: 85,
      macros: {
        protein: 20,
        carbs: 0,
        fat: 1,
        fiber: 0,
        saturatedFat: 0.2,
        sugar: 0,
        potassium: 220,
        sodium: 292,
      },
      vitamins: { B12: 1.1, niacin: 0.2 },
      minerals: { selenium: 0.4, phosphorus: 0.2 },
      omega3: 0.3,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["sauté", "grill", "boil", "steam", "raw"],
      washing: true,
      notes: "Thaw frozen shrimp before cooking",
    },

    healthBenefits: ["High protein", "Low fat", "Good source of selenium"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  cod: {
    name: "Cod",
    description:
      "Lean, flaky white fish (*Gadus morhua* Atlantic, *G. macrocephalus* Pacific) with large, moist flakes and a mild, slightly sweet flavor. The fish that built global fisheries — cornerstone of British fish and chips, Portuguese bacalhau, Spanish brandada, and Scandinavian lutefisk. Overfishing collapsed Atlantic stocks in the 1990s; Pacific and Icelandic cod are now more sustainable alternatives. Rich in protein and B12, low in fat, takes any seasoning beautifully.",
    regionalOrigins: ["north_atlantic", "north_pacific", "iceland", "norway"],
    sustainabilityScore: 6,
    season: ["winter", "spring"],
    seasonality: ["winter", "spring", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.6, Air: 0.2, Earth: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 140, unit: "g" }, // Standard serving: 5oz fillet
    scaledElemental: { Water: 0.58, Air: 0.21, Earth: 0.11, Fire: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.55,
      Matter: 0.45,
      Substance: 0.50,
    },
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 1.02 }, // Cooling effect, slight force

    qualities: ["mild", "flaky", "lean", "versatile", "sustainable"],
    origin: ["North Atlantic", "Pacific Ocean"],

    nutritionalProfile: {
      serving_size: "5 oz (142g)",
      calories: 119,
      macros: {
        protein: 26,
        carbs: 0,
        fat: 1,
        fiber: 0,
        saturatedFat: 0.1,
        sugar: 0,
        potassium: 439,
        sodium: 78,
      },
      vitamins: { B12: 1.2, D: 0.3 },
      minerals: { selenium: 0.5, phosphorus: 0.3 },
      omega3: 0.2,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["bake", "pan-fry", "poach", "steam"],
      washing: false,
      notes: "Delicate texture, avoid overcooking",
    },

    healthBenefits: ["Lean protein", "Vitamin B12", "Omega-3 fatty acids"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  halibut: {
    name: "Halibut",
    description:
      "Massive flatfish (*Hippoglossus spp.*) found in cold North Pacific and North Atlantic waters, sometimes growing over 300 pounds. Firm, snow-white flesh forms unusually thick, meaty flakes with a clean, sweet, almost buttery flavor. Premium Pacific halibut is MSC-certified and well-managed; Atlantic stocks are critically depleted and should be avoided. Outstanding on the grill, in ceviche, or roasted whole; its firm texture stands up to robust sauces and olive-oil poaching.",
    regionalOrigins: ["north_pacific", "north_atlantic", "alaska"],
    sustainabilityScore: 7,
    season: ["spring", "summer"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 160, unit: "g" }, // Standard serving: 6oz fillet
    scaledElemental: { Water: 0.39, Air: 0.31, Earth: 0.2, Fire: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.15,
      Essence: 0.60,
      Matter: 0.60,
      Substance: 0.65,
    },
    kineticsImpact: { thermalDirection: 0.02, forceMagnitude: 1.08 }, // Neutral temperature, moderate force

    qualities: ["firm", "meaty", "mild", "versatile", "premium"],
    origin: ["North Pacific", "North Atlantic"],

    nutritionalProfile: {
      serving_size: "6 oz (170g)",
      calories: 223,
      macros: {
        protein: 43,
        carbs: 0,
        fat: 5,
        fiber: 0,
        saturatedFat: 0.7,
        sugar: 0,
        potassium: 576,
        sodium: 87,
      },
      vitamins: { B12: 2.1, D: 0.8, niacin: 0.6 },
      minerals: { selenium: 0.8, phosphorus: 0.4 },
      omega3: 0.5,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["grill", "bake", "pan-sear", "poach"],
      washing: false,
      notes: "Thick fillets, cook to medium doneness",
    },

    healthBenefits: ["High protein", "Vitamin B12", "Selenium"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  scallops: {
    name: "Scallops",
    description:
      "Sweet, tender adductor muscles of marine bivalves (*Pectinidae*), the part of the scallop that opens and closes the shell. Sea scallops (large, 10–30 per pound) are ideal for searing to a deep golden crust; bay scallops (tiny, 60–100 per pound) are best quickly sautéed or used raw in crudo. Insist on 'dry' or 'day boat' scallops — 'wet' scallops are soaked in tripolyphosphate preservative that prevents browning and waters down flavor. Cook hot and fast: 90 seconds per side for perfect caramelization.",
    regionalOrigins: ["north_atlantic", "pacific", "japan"],
    sustainabilityScore: 7,
    season: ["winter", "spring"],
    seasonality: ["winter", "spring", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    // Base elemental properties (unscaled)
    elementalProperties: { Water: 0.5, Air: 0.3, Fire: 0.1, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 80, unit: "g" }, // Standard serving: 4 large scallops
    scaledElemental: { Water: 0.49, Air: 0.31, Fire: 0.1, Earth: 0.1 }, // Scaled for harmony
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.70,
      Matter: 0.30,
      Substance: 0.40,
    },
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 0.92 }, // Mild warming, gentle force

    qualities: ["sweet", "tender", "succulent", "briny", "luxurious"],
    origin: ["Atlantic Ocean", "Pacific Ocean"],

    nutritionalProfile: {
      serving_size: "4 large (80g)",
      calories: 94,
      macros: {
        protein: 21,
        carbs: 3,
        fat: 1,
        fiber: 0,
        saturatedFat: 0.1,
        sugar: 0,
        potassium: 314,
        sodium: 392,
      },
      vitamins: { B12: 1.8, niacin: 0.3 },
      minerals: { selenium: 0.3, phosphorus: 0.2 },
      omega3: 0.2,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["sauté", "grill", "sear", "raw"],
      washing: true,
      notes: "Remove tough side muscle, pat dry before cooking",
    },

    healthBenefits: ["Lean protein", "Vitamin B12", "Low fat"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  tilapia: {
    name: "Tilapia",
    description:
      "Affordable, fast-growing farmed freshwater fish (*Oreochromis spp.*), the fourth-most-consumed seafood in the U.S. Mild, neutral-flavored white flesh that readily absorbs marinades and sauces. Quality varies dramatically by farm — U.S., Ecuador, and Peru farms rank as Best Choice; some Asian producers are flagged for environmental practices. Best for busy weeknight cooking: pan-fried with lemon and capers, baked with salsa, or battered for fish tacos.",
    regionalOrigins: ["central_america", "south_america", "asia", "africa"],
    sustainabilityScore: 6,
    season: ["all"],
    seasonality: ["spring", "summer", "autumn", "winter"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.5, Air: 0.25, Earth: 0.15, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["all"],
    },

    quantityBase: { amount: 140, unit: "g" },
    scaledElemental: { Water: 0.49, Air: 0.26, Earth: 0.15, Fire: 0.1 },
    alchemicalProperties: {
      Spirit: 0.08,
      Essence: 0.50,
      Matter: 0.45,
      Substance: 0.50,
    },
    kineticsImpact: { thermalDirection: -0.03, forceMagnitude: 0.95 },

    qualities: ["mild", "affordable", "versatile", "lean", "sustainable"],
    origin: ["Africa", "Asia", "Americas"],

    nutritionalProfile: {
      serving_size: "5 oz (140g)",
      calories: 145,
      macros: {
        protein: 30,
        carbs: 0,
        fat: 3,
        fiber: 0,
        saturatedFat: 0.6,
        sugar: 0,
        potassium: 380,
        sodium: 56,
      },
      vitamins: { B12: 0.8, niacin: 0.3 },
      minerals: { selenium: 0.4, phosphorus: 0.3 },
      omega3: 0.2,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["bake", "pan-fry", "grill", "steam"],
      washing: false,
      notes: "Mild flavor, absorbs marinades well",
    },

    healthBenefits: ["Lean protein", "Low calorie", "Affordable"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  trout: {
    name: "Trout",
    description:
      "Freshwater and anadromous salmonids (*Oncorhynchus mykiss* rainbow, *Salvelinus fontinalis* brook, *Salmo trutta* brown) prized for delicate pink-to-red flesh, clean flavor, and small-plate size ideal for whole-fish preparations. Farmed rainbow trout is one of the most sustainable protein choices available. Classic preparations include meunière (brown-butter and lemon), smoked trout with horseradish cream, and almondine. Sweet, mild, less oily than salmon.",
    regionalOrigins: ["north_america", "europe", "global_farmed"],
    sustainabilityScore: 8,
    season: ["spring", "summer", "autumn"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.55, Earth: 0.2, Air: 0.15, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["spring", "summer"],
    },

    quantityBase: { amount: 150, unit: "g" },
    scaledElemental: { Water: 0.54, Earth: 0.21, Air: 0.15, Fire: 0.1 },
    alchemicalProperties: {
      Spirit: 0.18,
      Essence: 0.65,
      Matter: 0.50,
      Substance: 0.55,
    },
    kineticsImpact: { thermalDirection: -0.08, forceMagnitude: 1.0 },

    qualities: ["delicate", "freshwater", "omega-rich", "flaky", "clean"],
    origin: ["North America", "Europe", "New Zealand"],

    nutritionalProfile: {
      serving_size: "5 oz (150g)",
      calories: 190,
      macros: {
        protein: 26,
        carbs: 0,
        fat: 9,
        fiber: 0,
        saturatedFat: 1.8,
        sugar: 0,
        potassium: 414,
        sodium: 57,
      },
      vitamins: { B12: 1.3, D: 0.5 },
      minerals: { selenium: 0.6, phosphorus: 0.3 },
      omega3: 1.1,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["pan-fry", "bake", "grill", "smoke"],
      washing: false,
      notes: "Delicate flesh, cook skin-side first",
    },

    healthBenefits: ["Omega-3", "Vitamin D", "Heart health"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  sardines: {
    name: "Sardines",
    description:
      "Small, oily schooling fish (*Sardina pilchardus* and related species) prized for their rich flavor, exceptional omega-3 content, and unmatched sustainability — they reproduce quickly and sit low on the food chain. Fresh sardines are a Mediterranean staple grilled with lemon and olive oil; tinned sardines (in olive oil, tomato, or piri-piri) are a pantry superfood. Edible bones add calcium. A genuine case of 'eat more seafood, eat lower on the food chain.'",
    regionalOrigins: ["mediterranean", "atlantic", "portugal", "morocco"],
    sustainabilityScore: 9,
    season: ["spring", "summer", "autumn"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.5, Fire: 0.2, Earth: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Pisces", "Gemini"],
      seasonalAffinity: ["all"],
    },

    quantityBase: { amount: 85, unit: "g" },
    scaledElemental: { Water: 0.49, Fire: 0.2, Earth: 0.21, Air: 0.1 },
    alchemicalProperties: {
      Spirit: 0.30,
      Essence: 0.60,
      Matter: 0.55,
      Substance: 0.65,
    },
    kineticsImpact: { thermalDirection: 0.05, forceMagnitude: 0.98 },

    qualities: ["nutritious", "affordable", "sustainable", "briny", "bold"],
    origin: ["Mediterranean", "Atlantic", "Pacific"],

    nutritionalProfile: {
      serving_size: "3 oz (85g)",
      calories: 177,
      macros: {
        protein: 21,
        carbs: 0,
        fat: 10,
        fiber: 0,
        saturatedFat: 2.4,
        sugar: 0,
        potassium: 340,
        sodium: 307,
      },
      vitamins: { B12: 3.0, D: 0.7, niacin: 0.4 },
      minerals: { selenium: 0.7, calcium: 0.35, phosphorus: 0.4 },
      omega3: 1.4,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["grill", "pan-fry", "bake", "raw"],
      washing: false,
      notes: "Can be eaten whole including bones",
    },

    healthBenefits: ["Omega-3", "Calcium", "Vitamin B12", "Sustainable"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  mackerel: {
    name: "Mackerel",
    description:
      "Fast-swimming pelagic fish (*Scomber scombrus* Atlantic, *S. japonicus* chub) with dark, oily flesh and a distinctively rich, pronounced flavor. Among the most omega-3-dense fish available. Atlantic mackerel is a Seafood Watch Best Choice; king mackerel contains high mercury and should be limited. Excellent grilled over high heat, smoked, or cured (Japanese shime saba, Scandinavian soused mackerel). The bold flavor stands up to assertive sauces — mustard, horseradish, gooseberry.",
    regionalOrigins: ["north_atlantic", "pacific", "japan", "scandinavia"],
    sustainabilityScore: 8,
    season: ["summer", "autumn"],
    seasonality: ["summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.45, Fire: 0.25, Earth: 0.15, Air: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mars"],
      favorableZodiac: ["Cancer", "Scorpio", "Aries"],
      seasonalAffinity: ["all"],
    },

    quantityBase: { amount: 140, unit: "g" },
    scaledElemental: { Water: 0.44, Fire: 0.26, Earth: 0.15, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.35,
      Essence: 0.65,
      Matter: 0.55,
      Substance: 0.60,
    },
    kineticsImpact: { thermalDirection: 0.08, forceMagnitude: 1.08 },

    qualities: ["oily", "bold", "omega-rich", "sustainable", "flavorful"],
    origin: ["Atlantic", "Pacific", "Mediterranean"],

    nutritionalProfile: {
      serving_size: "5 oz (140g)",
      calories: 262,
      macros: {
        protein: 24,
        carbs: 0,
        fat: 18,
        fiber: 0,
        saturatedFat: 4.2,
        sugar: 0,
        potassium: 401,
        sodium: 83,
      },
      vitamins: { B12: 2.5, D: 0.9 },
      minerals: { selenium: 0.8, phosphorus: 0.3 },
      omega3: 2.5,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["grill", "smoke", "bake", "pan-sear"],
      washing: false,
      notes: "Strong flavor, pairs with bold ingredients",
    },

    healthBenefits: ["Highest omega-3", "Heart health", "Brain function"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  crab: {
    name: "Crab",
    description:
      "Short-tailed decapod crustaceans valued worldwide for sweet, delicate, white meat. Major commercial species include blue crab (*Callinectes sapidus*, Chesapeake Bay), Dungeness (*Metacarcinus magister*, Pacific), Alaskan king, snow, stone, and soft-shell (blue crabs post-molt). Star of Maryland crab cakes, Singaporean chili crab, Japanese kani, and San Francisco cioppino. Sold live, fresh-cooked, pasteurized, or frozen. Hand-pick meat to remove shell fragments — essential for any crab cake.",
    regionalOrigins: ["chesapeake_bay", "pacific_northwest", "alaska", "southeast_asia"],
    sustainabilityScore: 6,
    season: ["spring", "summer"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.55, Earth: 0.2, Air: 0.15, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon"],
      favorableZodiac: ["Cancer"],
      seasonalAffinity: ["spring", "summer"],
    },

    quantityBase: { amount: 100, unit: "g" },
    scaledElemental: { Water: 0.54, Earth: 0.21, Air: 0.15, Fire: 0.1 },
    alchemicalProperties: {
      Spirit: 0.22,
      Essence: 0.70,
      Matter: 0.40,
      Substance: 0.50,
    },
    kineticsImpact: { thermalDirection: -0.05, forceMagnitude: 0.98 },

    qualities: ["sweet", "delicate", "luxurious", "briny", "tender"],
    origin: ["Atlantic", "Pacific", "Alaska", "Maryland"],

    nutritionalProfile: {
      serving_size: "3.5 oz (100g)",
      calories: 97,
      macros: {
        protein: 19,
        carbs: 0,
        fat: 2,
        fiber: 0,
        saturatedFat: 0.2,
        sugar: 0,
        potassium: 329,
        sodium: 395,
      },
      vitamins: { B12: 1.8, niacin: 0.3 },
      minerals: { selenium: 0.5, zinc: 0.4, copper: 0.5 },
      omega3: 0.4,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["steam", "boil", "bake", "sauté"],
      washing: true,
      notes: "Clean thoroughly, extract meat carefully",
    },

    healthBenefits: ["Lean protein", "Zinc", "Vitamin B12"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  lobster: {
    name: "Lobster",
    description:
      "Large marine crustaceans (*Homarus americanus* American/Maine, *H. gammarus* European, *Panulirus spp.* spiny/rock) prized for firm, sweet, luxurious white tail and claw meat. American lobster from Maine and Atlantic Canada is the gold standard — MSC-certified and abundantly managed. Cooked methods range from the classic New England boil with drawn butter, to grilled split tails, bisque, lobster rolls, and thermidor. Traditionally killed by plunging headfirst into boiling water; some chefs now use the more humane ikejime or rapid-chill methods.",
    regionalOrigins: ["north_atlantic", "maine", "atlantic_canada", "mediterranean"],
    sustainabilityScore: 7,
    season: ["summer", "autumn"],
    seasonality: ["summer", "autumn", "winter"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.5, Fire: 0.2, Earth: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      favorableZodiac: ["Cancer", "Taurus", "Libra"],
      seasonalAffinity: ["summer"],
    },

    quantityBase: { amount: 145, unit: "g" },
    scaledElemental: { Water: 0.49, Fire: 0.2, Earth: 0.21, Air: 0.1 },
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.72,
      Matter: 0.50,
      Substance: 0.55,
    },
    kineticsImpact: { thermalDirection: 0.02, forceMagnitude: 1.02 },

    qualities: ["luxurious", "sweet", "tender", "briny", "festive"],
    origin: ["Maine", "Canada", "Europe"],

    nutritionalProfile: {
      serving_size: "5 oz (145g)",
      calories: 129,
      macros: {
        protein: 27,
        carbs: 0,
        fat: 1,
        fiber: 0,
        saturatedFat: 0.2,
        sugar: 0,
        potassium: 352,
        sodium: 486,
      },
      vitamins: { B12: 1.5, niacin: 0.2 },
      minerals: { selenium: 0.9, zinc: 0.4, copper: 0.8 },
      omega3: 0.3,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["boil", "steam", "grill", "bake"],
      washing: true,
      notes: "Cook live for freshness, avoid overcooking",
    },

    healthBenefits: ["Lean protein", "Selenium", "Low fat"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  mussels: {
    name: "Mussels",
    description:
      "Dark-shelled bivalve mollusks (*Mytilus edulis* blue, *M. galloprovincialis* Mediterranean) with tender, mildly briny meat. Farmed mussels are among the most sustainable seafood in existence — they feed by filtering water, actually improving marine ecosystems, and require no added feed. Discard any that stay open when tapped before cooking, or stay closed after cooking. Classic moules marinière (white wine, shallots, parsley, butter) cooks in under 5 minutes; Belgian, Italian, Spanish, and Thai traditions all shine.",
    regionalOrigins: ["atlantic_europe", "mediterranean", "pacific_northwest", "new_zealand"],
    sustainabilityScore: 10,
    season: ["autumn", "winter", "spring"],
    seasonality: ["autumn", "winter", "spring"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.6, Earth: 0.2, Air: 0.1, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["Cancer", "Pisces", "Scorpio"],
      seasonalAffinity: ["autumn", "winter"],
    },

    quantityBase: { amount: 150, unit: "g" },
    scaledElemental: { Water: 0.59, Earth: 0.21, Air: 0.1, Fire: 0.1 },
    alchemicalProperties: {
      Spirit: 0.15,
      Essence: 0.68,
      Matter: 0.45,
      Substance: 0.50,
    },
    kineticsImpact: { thermalDirection: -0.08, forceMagnitude: 0.95 },

    qualities: ["briny", "sustainable", "affordable", "tender", "flavorful"],
    origin: ["Atlantic", "Mediterranean", "Pacific"],

    nutritionalProfile: {
      serving_size: "5 oz (150g)",
      calories: 146,
      macros: {
        protein: 20,
        carbs: 6,
        fat: 4,
        fiber: 0,
        saturatedFat: 0.8,
        sugar: 0,
        potassium: 320,
        sodium: 369,
      },
      vitamins: { B12: 4.0, niacin: 0.3 },
      minerals: { selenium: 0.9, iron: 0.4, zinc: 0.3 },
      omega3: 0.7,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["steam", "bake", "sauté"],
      washing: true,
      notes: "Discard any that don't open after cooking",
    },

    healthBenefits: ["Iron", "Vitamin B12", "Sustainable protein"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  squid: {
    name: "Squid",
    description:
      "Cephalopod mollusks (*Loligo spp.*, *Doryteuthis pealeii*) with firm, white flesh and a clean, slightly sweet flavor that turns rubbery if cooked in the awkward middle temperature range. The rule: cook 2 minutes or more than 20 — anything in between is tough. Fried calamari is the universal crowd-pleaser; Mediterranean stuffed squid, Spanish chipirones, Korean ojingeo bokkeum, and Japanese ika sashimi showcase the range. Ink is a prized culinary ingredient for pasta and risotto nero.",
    regionalOrigins: ["mediterranean", "pacific", "atlantic", "east_asia"],
    sustainabilityScore: 7,
    season: ["all"],
    seasonality: ["spring", "summer", "autumn", "winter"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.5, Air: 0.25, Fire: 0.15, Earth: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Pisces", "Gemini"],
      seasonalAffinity: ["all"],
    },

    quantityBase: { amount: 100, unit: "g" },
    scaledElemental: { Water: 0.49, Air: 0.26, Fire: 0.15, Earth: 0.1 },
    alchemicalProperties: {
      Spirit: 0.20,
      Essence: 0.55,
      Matter: 0.40,
      Substance: 0.45,
    },
    kineticsImpact: { thermalDirection: 0.03, forceMagnitude: 0.98 },

    qualities: ["tender", "versatile", "mild", "quick-cooking", "affordable"],
    origin: ["Mediterranean", "Pacific", "Atlantic"],

    nutritionalProfile: {
      serving_size: "3.5 oz (100g)",
      calories: 92,
      macros: {
        protein: 18,
        carbs: 3,
        fat: 1,
        fiber: 0,
        saturatedFat: 0.4,
        sugar: 0,
        potassium: 246,
        sodium: 44,
      },
      vitamins: { B12: 1.3, niacin: 0.2 },
      minerals: { selenium: 0.6, phosphorus: 0.3, copper: 0.3 },
      omega3: 0.2,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["fry", "grill", "sauté", "braise"],
      washing: true,
      notes: "Cook very briefly or very long - nothing in between",
    },

    healthBenefits: ["Lean protein", "Low calorie", "Selenium"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},

  anchovies: {
    name: "Anchovies",
    description:
      "Tiny oily fish (*Engraulis encrasicolus* European, *E. ringens* Peruvian) cured in salt and oil to become one of cooking's most concentrated sources of umami. A few fillets melted into warm olive oil or butter silently transform pasta, vinaigrettes, and braises. Salt-packed anchovies from Cantabrian Spain (Boquerones) and Sicilian anchovies in olive oil are the gold standard. Fresh boquerones (vinegar-cured) are a Spanish tapas classic. Among the most sustainable wild-caught fish.",
    regionalOrigins: ["mediterranean", "atlantic", "pacific", "peru"],
    sustainabilityScore: 9,
    season: ["spring", "summer"],
    seasonality: ["spring", "summer", "autumn"],
    category: "proteins",
    subCategory: "seafood",

    elementalProperties: { Water: 0.4, Fire: 0.3, Earth: 0.2, Air: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mars"],
      favorableZodiac: ["Cancer", "Scorpio", "Aries"],
      seasonalAffinity: ["all"],
    },

    quantityBase: { amount: 30, unit: "g" },
    scaledElemental: { Water: 0.39, Fire: 0.31, Earth: 0.2, Air: 0.1 },
    alchemicalProperties: {
      Spirit: 0.55,
      Essence: 0.50,
      Matter: 0.45,
      Substance: 0.60,
    },
    kineticsImpact: { thermalDirection: 0.1, forceMagnitude: 1.05 },

    qualities: ["salty", "umami", "pungent", "bold", "intensifying"],
    origin: ["Mediterranean", "Atlantic", "Pacific"],

    nutritionalProfile: {
      serving_size: "1 oz (30g)",
      calories: 60,
      macros: {
        protein: 8,
        carbs: 0,
        fat: 3,
        fiber: 0,
        saturatedFat: 0.6,
        sugar: 0,
        potassium: 135,
        sodium: 1040,
      },
      vitamins: { B12: 0.6, niacin: 0.4 },
      minerals: { selenium: 0.4, calcium: 0.1 },
      omega3: 0.6,
      source: "USDA FoodData Central",
    },

    preparation: {
      methods: ["raw", "fry", "bake"],
      washing: false,
      notes: "Use as flavor enhancer, melt into sauces",
    },

    healthBenefits: ["Omega-3", "Calcium", "Umami source"],
      sensoryProfile: { taste: { sweet: 0.05, salty: 0.1, sour: 0.0, bitter: 0.1, umami: 0.6, spicy: 0.0 }, aroma: { savory: 0.8, rich: 0.6, roasted: 0.5 }, texture: { firm: 0.6, tender: 0.5, juicy: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "rich"], notes: "Brown in dry heat for Maillard, then finish gently to stay tender." }, cookingMethods: ["sear", "roast", "braise", "poach", "grill"], cuisineAffinity: ["global"], preparationTips: ["Salt 40 min before cooking for well-seasoned result.", "Rest after cooking to redistribute juices."] },
      pairingRecommendations: { complementary: ["salt", "fat", "acid", "herbs", "garlic"], contrasting: ["citrus", "spicy", "bitter greens"], toAvoid: [] },
      storage: { refrigerated: "35-40°F, 1-3 days fresh; freeze for longer.", notes: "Thaw in refrigerator — never at room temperature." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const seafood: Record<string, IngredientMapping> =
  fixIngredientMappings(rawSeafood);

// Create a collection of all seafood for export
export const _allSeafood = Object.values(seafood);

export default seafood;
