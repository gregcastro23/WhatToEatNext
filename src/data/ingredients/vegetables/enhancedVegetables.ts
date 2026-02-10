import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

/**
 * ENHANCED VEGETABLES DATA
 * Each vegetable has been researched for accurate, unique properties
 * Data sources: USDA FoodData Central, culinary references, astrological correspondences
 * Format inspired by "On Cooking" textbook principles
 */

const rawEnhancedVegetables: Record<string, Partial<IngredientMapping>> = {
  tomato: {
    name: "tomato",
    category: "vegetables",
    subcategory: "nightshade_fruit",

    // Juicy, balanced, slightly acidic
    elementalProperties: { Water: 0.50, Fire: 0.25, Earth: 0.15, Air: 0.10 },

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
        A: 0.20, // 20% RDA - beta-carotene
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
      toAvoid: ["milk (can curdle)", "delicate fish raw"],
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
    ],

    healthBenefits: [
      "Rich in lycopene - prostate and heart health",
      "High in vitamin C - immune support",
      "Contains potassium - blood pressure regulation",
      "Antioxidant properties",
      "May reduce cancer risk",
      "Supports skin health",
    ],

    seasonality: ["summer"],

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Cancer", "Taurus", "Libra"],
      seasonalAffinity: ["summer"],
    },
  },

  onion: {
    name: "onion",
    category: "vegetables",
    subcategory: "allium_bulb",

    // Pungent, tear-inducing, transformative
    elementalProperties: { Earth: 0.40, Fire: 0.30, Water: 0.20, Air: 0.10 },

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

    seasonality: ["year-round", "peak: fall harvest"],

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
    elementalProperties: { Fire: 0.45, Earth: 0.30, Air: 0.15, Water: 0.10 },

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

    seasonality: ["year-round", "fresh: summer"],

    astrologicalProfile: {
      rulingPlanets: ["Mars", "Pluto"],
      favorableZodiac: ["Aries", "Scorpio", "Sagittarius"],
      seasonalAffinity: ["year-round"],
    },
  },

  bell_pepper: {
    name: "bell pepper",
    category: "vegetables",
    subcategory: "nightshade_fruit",

    // Sweet, crisp, vibrant
    elementalProperties: { Fire: 0.30, Water: 0.35, Earth: 0.20, Air: 0.15 },

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
        B6: 0.20, // 20% RDA
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

    seasonality: ["summer", "fall"],

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Venus"],
      favorableZodiac: ["Leo", "Taurus", "Libra"],
      seasonalAffinity: ["summer"],
    },
  },

  carrot: {
    name: "carrot",
    category: "vegetables",
    subcategory: "root_vegetable",

    // Sweet, earthy, grounding
    elementalProperties: { Earth: 0.50, Water: 0.25, Fire: 0.15, Air: 0.10 },

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
        "cumin",
        "dill",
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

    seasonality: ["year-round", "peak: fall through winter"],

    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mercury"],
      favorableZodiac: ["Capricorn", "Virgo", "Taurus"],
      seasonalAffinity: ["fall", "winter"],
    },
  },

  broccoli: {
    name: "broccoli",
    category: "vegetables",
    subcategory: "cruciferous",

    // Slightly bitter, nutritious, complex
    elementalProperties: { Earth: 0.40, Air: 0.30, Water: 0.20, Fire: 0.10 },

    nutritionalProfile: {
      serving_size: "1 cup chopped (91g)",
      calories: 31,
      macros: {
        protein: 2.5,
        carbs: 6.0,
        fat: 0.3,
        fiber: 2.4,
        saturatedFat: 0.1,
        sugar: 1.7,
        potassium: 316,
        sodium: 33,
      },
      vitamins: {
        C: 1.35, // 135% RDA
        K: 1.16, // 116% RDA
        A: 0.12,
        folate: 0.14,
        B6: 0.09,
      },
      minerals: {
        potassium: 0.09,
        manganese: 0.10,
        iron: 0.04,
      },
      antioxidants: {
        sulforaphane:
          "very high - powerful anti-cancer compound, enhanced by chewing raw",
        indole_3_carbinol: "high - hormone balance and cancer prevention",
        lutein: "moderate - eye health",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.3,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.5,
        umami: 0.3,
        spicy: 0.2, // Slight pungency
      },
      aroma: {
        floral: 0.1,
        fruity: 0.0,
        herbal: 0.6,
        spicy: 0.3,
        earthy: 0.7,
        woody: 0.3,
      },
      texture: {
        crisp: 0.7,
        tender: 0.6, // When properly cooked
        creamy: 0.2, // In purees
        chewy: 0.3,
        crunchy: 0.8,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "refrigerate 32-35°F",
      duration: "7-10 days",
      container: "plastic bag in crisper drawer, unwashed",
      tips: [
        "Store unwashed with tight florets",
        "Wrap loosely in damp paper towel",
        "Yellow florets indicate age - use immediately",
        "Can blanch and freeze for up to 12 months",
      ],
    },

    preparation: {
      methods: [
        "Cut into florets",
        "Peel and slice stems (equally delicious)",
        "Blanch in boiling salted water 2-3 minutes",
        "Chop raw for salads",
      ],
      tips: [
        "Don't discard stems - peel and slice for cooking",
        "Blanch then shock in ice water for vibrant color",
        "Roast at high heat for caramelized edges",
        "Raw broccoli has more sulforaphane than cooked",
      ],
      yields: "1 medium head = 3-4 cups florets",
    },

    recommendedCookingMethods: [
      "steaming",
      "roasting",
      "stir-frying",
      "blanching",
      "raw in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "lemon",
        "parmesan",
        "olive oil",
        "ginger",
        "soy sauce",
        "cheddar cheese",
      ],
      contrasting: ["chili flakes", "anchovies", "mustard"],
      toAvoid: ["overly sweet sauces", "prolonged cooking"],
    },

    description:
      "Broccoli is a cruciferous vegetable packed with nutrients and cancer-fighting compounds. The edible flower buds and stems offer a slightly bitter, earthy flavor that becomes nutty and sweet when roasted. Rich in sulforaphane—a potent antioxidant formed when broccoli is chopped or chewed. Both the florets and stems are edible and nutritious.",

    origin: ["Italy (Mediterranean)", "Cultivated globally"],

    qualities: [
      "nutritious",
      "cruciferous",
      "slightly bitter",
      "versatile",
      "healthful",
      "fibrous",
    ],

    healthBenefits: [
      "High in sulforaphane - powerful anti-cancer properties",
      "Rich in vitamins C and K",
      "Supports detoxification",
      "Anti-inflammatory effects",
      "Supports heart health",
      "May improve bone health",
    ],

    seasonality: ["fall", "winter", "spring"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Virgo", "Gemini"],
      seasonalAffinity: ["fall", "winter"],
    },
  },

  spinach: {
    name: "spinach",
    category: "vegetables",
    subcategory: "leafy_green",

    // Mineral-rich, slightly bitter, nourishing
    elementalProperties: { Water: 0.45, Earth: 0.30, Air: 0.15, Fire: 0.10 },

    nutritionalProfile: {
      serving_size: "1 cup raw (30g)",
      calories: 7,
      macros: {
        protein: 0.9,
        carbs: 1.1,
        fat: 0.1,
        fiber: 0.7,
        saturatedFat: 0,
        sugar: 0.4,
        potassium: 170,
        sodium: 3,
      },
      vitamins: {
        K: 1.81, // 181% RDA - extremely high!
        A: 0.56, // 56% RDA
        C: 0.14,
        folate: 0.15,
        B6: 0.03,
      },
      minerals: {
        iron: 0.15, // Note: non-heme, less absorbable
        calcium: 0.03,
        magnesium: 0.20,
        potassium: 0.05,
        manganese: 0.45,
      },
      antioxidants: {
        lutein_zeaxanthin: "very high - eye health, macular degeneration prevention",
        kaempferol: "high - anti-inflammatory and anti-cancer",
        quercetin: "moderate - antioxidant",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.0,
        sour: 0.1,
        bitter: 0.4,
        umami: 0.2,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.7,
        spicy: 0.0,
        earthy: 0.6,
        woody: 0.0,
      },
      texture: {
        crisp: 0.4, // Baby spinach
        tender: 0.9,
        creamy: 0.2, // When creamed
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.7, // Wilted
      },
    },

    storage: {
      temperature: "refrigerate 35-40°F",
      duration: "5-7 days",
      container: "original container or plastic bag with paper towel",
      tips: [
        "Store unwashed until ready to use",
        "Place paper towel in bag to absorb excess moisture",
        "Remove any slimy or yellowed leaves immediately",
        "Baby spinach more delicate than mature leaves",
      ],
    },

    preparation: {
      methods: [
        "Wash thoroughly in cold water (sandy!)",
        "Remove thick stems from mature leaves",
        "Tear or chop for salads",
        "Wilt in pan with garlic",
      ],
      tips: [
        "Wash just before use, not before storing",
        "Baby spinach tender enough for stems",
        "Spinach wilts dramatically - 1 lb fresh = 1 cup cooked",
        "Add lemon or vitamin C to improve iron absorption",
      ],
      yields: "1 lb fresh = 1 cup cooked",
    },

    recommendedCookingMethods: [
      "sautéing",
      "steaming",
      "wilting",
      "raw in salads",
      "blending in smoothies",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "lemon",
        "butter",
        "nutmeg",
        "feta cheese",
        "eggs",
        "cream",
        "pine nuts",
      ],
      contrasting: ["bacon", "parmesan", "vinegar"],
      toAvoid: ["overly sweet dressings"],
    },

    description:
      "Spinach is a nutrient-dense leafy green packed with vitamins, minerals, and antioxidants. Baby spinach is tender and mild, perfect for salads, while mature spinach has heartier leaves ideal for cooking. Extremely high in vitamin K and a good source of plant-based iron (though less bioavailable than animal sources). Wilts dramatically when cooked, reducing in volume by 90%.",

    origin: ["Persia (Iran)", "Cultivated globally"],

    qualities: [
      "nutrient-dense",
      "iron-rich",
      "versatile",
      "mild",
      "healthful",
      "tender",
    ],

    healthBenefits: [
      "Extremely high in vitamin K - bone health",
      "Rich in antioxidants - eye health (lutein)",
      "Plant-based iron (enhanced absorption with vitamin C)",
      "May reduce blood pressure",
      "Anti-inflammatory properties",
      "Supports digestive health",
    ],

    seasonality: ["spring", "fall"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Virgo", "Pisces"],
      seasonalAffinity: ["spring"],
    },
  },

  asparagus: {
    name: "asparagus",
    category: "vegetables",
    subcategory: "shoot",

    // Delicate, slightly bitter, refined
    elementalProperties: { Water: 0.40, Air: 0.30, Earth: 0.20, Fire: 0.10 },

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
        K: 0.70, // 70% RDA
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

    seasonality: ["spring"],

    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter"],
      favorableZodiac: ["Gemini", "Virgo", "Sagittarius"],
      seasonalAffinity: ["spring"],
    },
  },
};

// Export processed ingredients
export const enhancedVegetablesIngredients = fixIngredientMappings(
  rawEnhancedVegetables,
);
