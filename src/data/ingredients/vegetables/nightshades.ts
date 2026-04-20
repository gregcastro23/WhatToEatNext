import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawNightshades: Record<string, Partial<IngredientMapping>> = {
  tomato: {
    name: "tomato",
    category: "vegetables",
    subcategory: "nightshade_fruit",

    // Juicy, balanced, slightly acidic
    elementalProperties: { Water: 0.5, Fire: 0.25, Earth: 0.15, Air: 0.1 },
    alchemicalProperties: {
      Spirit: 0.30,
      Essence: 0.70,
      Matter: 0.35,
      Substance: 0.30,
    },

    nutritionalProfile: {
      serving_size: "1 medium (123g)",
      calories: 22,
      macros: {
        protein: 1.1,
        carbs: 4.8,
        fat: 0.2,
        fiber: 1.5,
        saturatedFat: 0,
        sugar: 3.2,
        potassium: 292,
        sodium: 6,
      },
      vitamins: {
        C: 0.28, // 28% RDA
        K: 0.12,
        A: 0.2, // 20% RDA - beta-carotene
        folate: 0.05,
        B6: 0.04,
      },
      minerals: {
        potassium: 0.07,
        manganese: 0.06,
      },
      antioxidants: {
        lycopene:
          "very high - powerful antioxidant, enhanced by cooking and oil",
        beta_carotene: "high - converted to vitamin A",
        flavonoids: "moderate - especially in skin",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.5,
        salty: 0.0,
        sour: 0.4,
        bitter: 0.1,
        umami: 0.6, // High umami from glutamates
        spicy: 0.0,
      },
      aroma: {
        floral: 0.2,
        fruity: 0.7,
        herbal: 0.5, // Tomato leaves aroma
        spicy: 0.0,
        earthy: 0.3,
        woody: 0.1,
      },
      texture: {
        crisp: 0.3, // Fresh tomato
        tender: 0.7,
        creamy: 0.2, // Cooked/pureed
        chewy: 0.1,
        crunchy: 0.0,
        silky: 0.0,
      },
    },

    storage: {
      temperature:
        "room temperature until ripe, then refrigerate 45-50°F for up to 1 week",
      duration: "5-7 days at room temp when ripe, 1-2 weeks refrigerated",
      container: "open air, stem side down",
      tips: [
        "NEVER refrigerate unripe tomatoes - halts ripening",
        "Store stem side down to prevent moisture loss",
        "Keep at room temperature for best flavor",
        "Separate from ethylene-sensitive produce",
      ],
    },

    preparation: {
      methods: [
        "Core with paring knife",
        "Score X on bottom, blanch 30 sec, peel",
        "Seed by halving and squeezing",
        "Dice, slice, or quarter as needed",
      ],
      tips: [
        "Roma tomatoes best for sauces (less water)",
        "Heirloom varieties for eating fresh",
        "Cherry/grape tomatoes for roasting",
        "Always season tomatoes with salt to enhance flavor",
      ],
      yields: "1 lb fresh = 1.5 cups chopped",
    },

    recommendedCookingMethods: [
      "roasting",
      "sautéing",
      "simmering",
      "grilling",
      "raw in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "basil",
        "garlic",
        "olive oil",
        "mozzarella",
        "onions",
        "oregano",
        "balsamic vinegar",
      ],
      contrasting: ["feta cheese", "olives", "capers", "anchovies"],
      toAvoid: ["milk (curdle)", "delicate fish raw"],
    },

    description:
      "Tomatoes are technically fruits but culinarily treated as vegetables. Available in countless varieties from tiny cherry tomatoes to massive beefsteaks, they're fundamental to cuisines worldwide. Rich in lycopene (especially when cooked), tomatoes provide umami depth and bright acidity. Peak season summer tomatoes are incomparably sweet and complex compared to winter greenhouse varieties.",

    origin: ["South America (native)", "Italy (culinary tradition)", "Global"],

    qualities: [
      "umami-rich",
      "acidic",
      "juicy",
      "versatile",
      "sweet",
      "seasonal",
      "nutritious",
      "fresh",
    ],

    healthBenefits: [
      "Rich in lycopene - prostate and heart health",
      "High in vitamin C - immune support",
      "Contains potassium - blood pressure regulation",
      "Antioxidant properties",
      "May reduce cancer risk",
      "Supports skin health",
    ],

    season: ["summer"],

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Libra", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},

  bell_pepper: {
    name: "bell pepper",
    category: "vegetables",
    subcategory: "nightshade_fruit",

    // Sweet, crisp, vibrant
    elementalProperties: { Fire: 0.3, Water: 0.35, Earth: 0.2, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.25,
      Essence: 0.65,
      Matter: 0.35,
      Substance: 0.30,
    },

    nutritionalProfile: {
      serving_size: "1 medium (119g)",
      calories: 25,
      macros: {
        protein: 1.0,
        carbs: 6.0,
        fat: 0.2,
        fiber: 2.0,
        saturatedFat: 0,
        sugar: 2.5,
        potassium: 305,
        sodium: 30,
      },
      vitamins: {
        C: 1.69, // 169% RDA - one of the richest sources!
        A: 0.11,
        B6: 0.2, // 20% RDA
        folate: 0.12,
        K: 0.07,
      },
      minerals: {
        potassium: 0.06,
        manganese: 0.06,
      },
      antioxidants: {
        carotenoids: "very high - beta-carotene, lutein, zeaxanthin",
        flavonoids: "high - quercetin and luteolin",
        vitamin_c: "extremely high - more than oranges per serving",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.8, // Especially red peppers
        salty: 0.0,
        sour: 0.0,
        bitter: 0.1,
        umami: 0.1,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.2,
        fruity: 0.6,
        herbal: 0.3,
        spicy: 0.0,
        earthy: 0.3,
        woody: 0.0,
      },
      texture: {
        crisp: 0.9, // Very crisp raw
        tender: 0.5, // Cooked
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.9,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "refrigerate 40-45°F",
      duration: "1-2 weeks",
      container: "crisper drawer in plastic bag with holes",
      tips: [
        "Red, yellow, orange peppers sweeter than green (riper)",
        "Store unwashed until ready to use",
        "Keep dry - moisture causes decay",
        "Can freeze roasted peppers for up to 6 months",
      ],
    },

    preparation: {
      methods: [
        "Remove stem, seeds, and white ribs",
        "Slice into strips for stir-fries",
        "Dice for salsas and salads",
        "Roast whole, then peel for silky texture",
      ],
      tips: [
        "Green = unripe, red/yellow/orange = ripe and sweeter",
        "Roast over open flame or under broiler for charred flavor",
        "Peel easily after roasting in covered bowl 10 minutes",
        "Raw in salads for maximum vitamin C",
      ],
      yields: "1 medium = 1 cup chopped",
    },

    recommendedCookingMethods: [
      "roasting",
      "grilling",
      "sautéing",
      "stuffing and baking",
      "raw in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "onions",
        "garlic",
        "tomatoes",
        "olive oil",
        "feta cheese",
        "basil",
        "oregano",
      ],
      contrasting: ["soy sauce", "ginger", "chili", "balsamic vinegar"],
      toAvoid: ["delicate fish", "mild dairy"],
    },

    description:
      "Bell peppers are sweet, mild members of the Capsicum family (unlike their spicy cousins). They're actually unripe (green) or ripe (red, yellow, orange) fruits of the same plant. Red peppers are the sweetest as they're fully ripened. Extremely high in vitamin C—one medium red pepper provides 169% of the daily value. Essential in Mediterranean, Asian, and Latin American cuisines.",

    origin: ["Central and South America", "Cultivated globally"],

    qualities: [
      "sweet",
      "crisp",
      "colorful",
      "vitamin-rich",
      "versatile",
      "mild",
    ],

    healthBenefits: [
      "Extremely high in vitamin C - immune support",
      "Rich in antioxidants - eye health",
      "May reduce inflammation",
      "Supports heart health",
      "Low calorie, high nutrient density",
      "Contains carotenoids for skin health",
    ],

    season: ["summer", "fall"],

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus", "Moon", "Saturn"],
      favorableZodiac: ["Leo", "Taurus", "Libra", "Cancer", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},

  eggplant: {
      description: "A spongy, absorbent nightshade fruit (*Solanum melongena*) with a slightly bitter, complex flavor and a texture that ranges from meaty to silkily creamy when cooked. Its cellular structure acts like a sponge, readily soaking up cooking oils and rich sauces in dishes like curries and parmigianas.",
    name: "eggplant",
    category: "vegetables",
    subcategory: "nightshade",
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.45,
      Matter: 0.55,
      Substance: 0.40,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
    qualities: ["cooling", "moistening", "nutritious", "versatile", "fresh"],
    season: ["summer", "fall"],
    affinities: ["garlic", "basil", "tomato", "olive oil", "miso"],
    cookingMethods: ["grilled", "roasted", "fried", "braised"],
    nutritionalProfile: {
      fiber: "moderate",
      vitamins: { B1: 0.05, B6: 0.05, K: 0.03 },
      minerals: { manganese: 0.09, copper: 0.09 },
      calories: 35,
      macros: { protein: 1, fiber: 3 },
    },
    preparation: {
      methods: ["washing", "salting", "cutting"],
      tips: ["Salt and drain before cooking to remove bitterness"],
    },
    storage: {
      temperature: "cool room temp or refrigerated",
      duration: "5-7 days",
      notes: "Sensitive to ethylene gas",
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] }
},

  tomato_paste: {
      description: "A fresh plant food, tomato paste offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "tomato paste",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.40,
      Essence: 0.50,
      Matter: 0.70,
      Substance: 0.55,
    },
    qualities: ["nutritious", "versatile", "concentrated"],
    category: "vegetables",
    subcategory: "nightshade_fruit",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp (16g)",
      calories: 13,
      macros: {
        protein: 0.7,
        carbs: 3,
        fat: 0.1,
        fiber: 0.5,
        saturatedFat: 0,
        sugar: 2,
        potassium: 162,
        sodium: 9,
      },
      vitamins: { A: 0.04, C: 0.04 },
      minerals: { iron: 0.03, potassium: 0.05 },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  cherry_tomatoes: {
      description: "A fresh plant food, cherry tomatoes offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "cherry tomatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.32,
      Essence: 0.72,
      Matter: 0.25,
      Substance: 0.25,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "nightshade_fruit",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  tomato_sauce: {
      description: "A fresh plant food, tomato sauce offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "tomato sauce",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.28,
      Essence: 0.55,
      Matter: 0.40,
      Substance: 0.35,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "nightshade_fruit",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  eggplants: {
      description: "A fresh plant food, eggplants offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "eggplants",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.45,
      Matter: 0.55,
      Substance: 0.40,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "nightshade",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  large_eggplant: {
      description: "A fresh plant food, large eggplant offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "large eggplant",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.45,
      Matter: 0.55,
      Substance: 0.40,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "nightshade",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  tomatoes: {
      description: "The fruit of *Solanum lycopersicum*, botanically a berry, culinarily a vegetable — packed with glutamic acid that makes them the umami champion among garden produce. Flavor peaks when fully ripe and at room temperature; refrigeration below 55°F permanently damages aromatic compounds. Paste and plum varieties reduce well into sauces; beefsteak and heirloom eat best raw; cherry and grape tomatoes caramelize beautifully whole. Salt sliced tomatoes 20 min before serving to draw out water and concentrate flavor.",
    name: "tomatoes",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.30,
      Essence: 0.70,
      Matter: 0.35,
      Substance: 0.30,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "nightshade_fruit",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  bell_peppers: {
      description: "A fresh plant food, bell peppers offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "bell peppers",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.22,
      Essence: 0.62,
      Matter: 0.35,
      Substance: 0.30,
    },
    qualities: ["sweet", "colorful", "crunchy"],
    category: "vegetables",
    subcategory: "nightshade_fruit",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
    nutritionalProfile: {
      serving_size: "1 medium (119g)",
      calories: 31,
      macros: {
        protein: 1,
        carbs: 6,
        fat: 0.3,
        fiber: 2.1,
        saturatedFat: 0.1,
        sugar: 4.2,
        potassium: 210,
        sodium: 4,
      },
      vitamins: { C: 1.69, A: 0.11, B6: 0.17, folate: 0.11 },
      minerals: { potassium: 0.06 },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},

  green_peppers: {
      description: "A fresh plant food, green peppers offers fiber, micronutrients, and a characteristic texture-flavor profile that changes dramatically with preparation method — from crisp and raw to tender and caramelized.",
    name: "green peppers",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.22,
      Essence: 0.62,
      Matter: 0.35,
      Substance: 0.30,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "nightshade_fruit",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
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
export const nightshades: Record<string, IngredientMapping> =
  fixIngredientMappings(rawNightshades);

// For backwards compatibility
export const _nightshades = nightshades;
