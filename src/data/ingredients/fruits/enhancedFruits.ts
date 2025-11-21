import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

/**
 * ENHANCED FRUITS DATA
 * Each fruit has been researched for accurate, unique properties
 * Data sources: USDA FoodData Central, culinary references, astrological correspondences
 * Format inspired by "On Cooking" textbook principles
 */

const rawEnhancedFruits: Record<string, Partial<IngredientMapping>> = {
  lemon: {
    name: "lemon",
    category: "fruits",
    subcategory: "citrus",

    // Acidic, bright, cleansing
    elementalProperties: { Air: 0.45, Fire: 0.30, Water: 0.15, Earth: 0.10 },

    nutritionalProfile: {
      serving_size: "1 medium (58g)",
      calories: 17,
      macros: {
        protein: 0.6,
        carbs: 5.4,
        fat: 0.2,
        fiber: 1.6,
      },
      vitamins: {
        C: 0.51, // 51% RDA
        folate: 0.03,
        B6: 0.04,
      },
      minerals: {
        potassium: 0.04,
        calcium: 0.02,
      },
      antioxidants: {
        limonene:
          "very high - in peel, anti-cancer and mood-enhancing properties",
        citric_acid: "high - provides tartness and preservative qualities",
        flavonoids: "high - especially in peel and pith",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.1,
        salty: 0.0,
        sour: 1.0, // Maximum acidity
        bitter: 0.3, // Especially peel
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.4,
        fruity: 0.7,
        herbal: 0.2,
        spicy: 0.1,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.7, // Flesh segments
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.3,
      },
    },

    storage: {
      temperature: "room temperature for 1 week, refrigerate for 2-4 weeks",
      duration: "1 week at room temp, 2-4 weeks refrigerated",
      container: "open air or plastic bag in crisper",
      tips: [
        "Room temperature lemons yield more juice",
        "Zest before juicing - easier when whole",
        "Can freeze whole, zest, or juice",
        "Meyer lemons are sweeter, shorter shelf life",
      ],
    },

    preparation: {
      methods: [
        "Roll firmly on counter before juicing",
        "Zest with microplane (avoid white pith)",
        "Slice into wheels for garnish",
        "Juice by hand or with citrus reamer",
      ],
      tips: [
        "1 lemon = 2-3 tbsp juice, 1 tbsp zest",
        "Warm lemon yields more juice",
        "Use vegetable peeler for wide zest strips",
        "Always zest before juicing",
      ],
      yields: "1 lemon = 2-3 tbsp juice, 1 tbsp zest",
    },

    recommendedCookingMethods: [
      "juicing",
      "zesting",
      "preserving",
      "in dressings",
      "in baking",
    ],

    pairingRecommendations: {
      complementary: [
        "fish",
        "chicken",
        "garlic",
        "olive oil",
        "butter",
        "herbs",
        "berries",
        "cream",
      ],
      contrasting: ["sugar", "honey", "salt"],
      toAvoid: ["milk (can curdle)", "baking soda (neutralizes)"],
    },

    description:
      "Lemons are the most versatile citrus fruit, providing bright acidity and aromatic complexity to both savory and sweet dishes. The juice, zest, and even preserved peel are culinary essentials. Rich in vitamin C and flavonoids, lemons have been valued for centuries for both culinary and medicinal purposes. Meyer lemons are sweeter and more fragrant than standard Eureka lemons.",

    origin: ["Asia (native)", "Mediterranean (cultivation)", "Global"],

    qualities: [
      "acidic",
      "bright",
      "aromatic",
      "versatile",
      "cleansing",
      "essential",
    ],

    healthBenefits: [
      "High in vitamin C - immune support",
      "Aids digestion and liver function",
      "Alkalizing despite acidity",
      "Antibacterial properties",
      "May support heart health",
      "Antioxidant properties",
    ],

    seasonality: ["year-round", "peak: winter-spring"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["Cancer", "Gemini", "Virgo"],
      seasonalAffinity: ["winter", "spring"],
    },
  },

  apple: {
    name: "apple",
    category: "fruits",
    subcategory: "pome",

    // Crisp, balanced, wholesome
    elementalProperties: { Earth: 0.35, Air: 0.30, Water: 0.25, Fire: 0.10 },

    nutritionalProfile: {
      serving_size: "1 medium (182g)",
      calories: 95,
      macros: {
        protein: 0.5,
        carbs: 25.0,
        fat: 0.3,
        fiber: 4.4,
      },
      vitamins: {
        C: 0.14, // 14% RDA
        K: 0.04,
      },
      minerals: {
        potassium: 0.06,
      },
      antioxidants: {
        quercetin: "high - especially in peel, anti-inflammatory",
        catechin: "moderate - antioxidant",
        chlorogenic_acid: "moderate - may help regulate blood sugar",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.7,
        salty: 0.0,
        sour: 0.3, // Varies by variety
        bitter: 0.0,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.4,
        fruity: 0.9,
        herbal: 0.1,
        spicy: 0.2, // Warm varieties
        earthy: 0.2,
        woody: 0.1,
      },
      texture: {
        crisp: 0.9, // Fresh apple
        tender: 0.4, // Cooked
        creamy: 0.3, // Applesauce
        chewy: 0.0,
        crunchy: 0.9,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "refrigerate 30-35°F",
      duration: "1-2 months refrigerated, 1 week at room temp",
      container: "plastic bag with holes in crisper drawer",
      tips: [
        "Store away from other produce - high ethylene producer",
        "One bad apple spoils the bunch - remove damaged fruit",
        "Refrigeration maintains crispness much longer",
        "Different varieties have different storage lives",
      ],
    },

    preparation: {
      methods: [
        "Core with apple corer or knife",
        "Peel with vegetable peeler if desired",
        "Slice and toss with lemon juice to prevent browning",
        "Dice for baking",
      ],
      tips: [
        "Granny Smith for baking - holds shape",
        "Honeycrisp for eating fresh - sweet and crisp",
        "Fuji for salads - won't brown quickly",
        "Mix varieties for complex flavor in pies",
      ],
      yields: "1 lb = 3 medium = 3 cups sliced",
    },

    recommendedCookingMethods: [
      "baking",
      "sautéing",
      "roasting",
      "stewing",
      "raw in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "cinnamon",
        "nutmeg",
        "butter",
        "brown sugar",
        "vanilla",
        "cheese",
        "pork",
        "walnuts",
      ],
      contrasting: ["sharp cheddar", "blue cheese", "caramel", "lemon"],
      toAvoid: ["overly complex spicing"],
    },

    description:
      "Apples are one of the most widely cultivated fruits, with thousands of varieties ranging from tart to sweet. Crisp and refreshing raw, they transform beautifully when cooked, breaking down into tender sweetness. The saying 'an apple a day keeps the doctor away' reflects their reputation as a healthful food. Choose firm apples with smooth, unblemished skin.",

    origin: ["Kazakhstan (native)", "Cultivated globally"],

    qualities: [
      "crisp",
      "sweet",
      "wholesome",
      "versatile",
      "seasonal",
      "balanced",
    ],

    healthBenefits: [
      "High in fiber - digestive and heart health",
      "Rich in antioxidants (especially in peel)",
      "May help regulate blood sugar",
      "Supports heart health",
      "May reduce cancer risk",
      "Promotes gut health (prebiotic fiber)",
    ],

    seasonality: ["fall", "winter"],

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Taurus", "Libra", "Cancer"],
      seasonalAffinity: ["fall"],
    },
  },

  banana: {
    name: "banana",
    category: "fruits",
    subcategory: "tropical",

    // Sweet, creamy, energizing
    elementalProperties: { Earth: 0.40, Water: 0.30, Fire: 0.20, Air: 0.10 },

    nutritionalProfile: {
      serving_size: "1 medium (118g)",
      calories: 105,
      macros: {
        protein: 1.3,
        carbs: 27.0,
        fat: 0.4,
        fiber: 3.1,
      },
      vitamins: {
        B6: 0.33, // 33% RDA - excellent source!
        C: 0.17,
        folate: 0.06,
      },
      minerals: {
        potassium: 0.12, // 12% RDA
        magnesium: 0.08,
        manganese: 0.14,
      },
      antioxidants: {
        dopamine: "moderate - not crossing blood-brain barrier but antioxidant",
        catechin: "moderate",
        resistant_starch: "high in green bananas - prebiotic benefits",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.9,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.0,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.2,
        fruity: 0.9,
        herbal: 0.0,
        spicy: 0.1,
        earthy: 0.1,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.6,
        creamy: 0.9, // Very creamy
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.7,
      },
    },

    storage: {
      temperature: "room temperature 60-70°F, NEVER refrigerate unripe",
      duration: "3-7 days at room temp depending on ripeness",
      container: "open air, separate from other fruit if you want slow ripening",
      tips: [
        "Store at room temperature - refrigeration turns skin black",
        "Hang on banana hanger to prevent bruising",
        "Separate from bunch to slow ripening",
        "Freeze overripe bananas for smoothies or baking",
      ],
    },

    preparation: {
      methods: [
        "Peel and eat fresh",
        "Slice for cereal or yogurt",
        "Mash for baking",
        "Freeze for nice cream",
      ],
      tips: [
        "Green bananas: starchy, great for cooking",
        "Yellow bananas: sweet, perfect for eating",
        "Spotted bananas: very sweet, ideal for baking",
        "Black bananas: overripe but perfect for banana bread",
      ],
      yields: "1 medium = 1/2 cup mashed",
    },

    recommendedCookingMethods: [
      "eating fresh",
      "baking",
      "blending",
      "grilling",
      "caramelizing",
    ],

    pairingRecommendations: {
      complementary: [
        "chocolate",
        "peanut butter",
        "vanilla",
        "cinnamon",
        "honey",
        "yogurt",
        "oats",
        "nuts",
      ],
      contrasting: ["citrus", "berries", "caramel"],
      toAvoid: ["strongly acidic foods"],
    },

    description:
      "Bananas are the world's most popular fruit, prized for their convenience, sweetness, and energy-providing carbohydrates. Available year-round, they ripen naturally after harvest, becoming sweeter as starches convert to sugars. The Cavendish variety dominates commercial production. Rich in potassium and vitamin B6, bananas are a perfect portable snack and versatile cooking ingredient.",

    origin: ["Southeast Asia", "Cultivated in tropical regions globally"],

    qualities: [
      "sweet",
      "creamy",
      "convenient",
      "energizing",
      "mild",
      "versatile",
    ],

    healthBenefits: [
      "Excellent source of potassium - heart and muscle health",
      "High in vitamin B6 - brain health",
      "Provides quick energy from natural sugars",
      "Supports digestive health (resistant starch)",
      "May help regulate blood pressure",
      "Mood-boosting properties",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Venus"],
      favorableZodiac: ["Sagittarius", "Taurus", "Libra"],
      seasonalAffinity: ["year-round"],
    },
  },

  strawberry: {
    name: "strawberry",
    category: "fruits",
    subcategory: "berry",

    // Sweet, aromatic, delicate
    elementalProperties: { Water: 0.40, Air: 0.30, Fire: 0.20, Earth: 0.10 },

    nutritionalProfile: {
      serving_size: "1 cup whole (152g)",
      calories: 49,
      macros: {
        protein: 1.0,
        carbs: 11.7,
        fat: 0.5,
        fiber: 3.0,
      },
      vitamins: {
        C: 1.49, // 149% RDA - extremely high!
        folate: 0.09,
        K: 0.04,
      },
      minerals: {
        manganese: 0.29,
        potassium: 0.07,
      },
      antioxidants: {
        anthocyanins: "very high - red pigment, powerful antioxidants",
        ellagic_acid: "high - may have anti-cancer properties",
        quercetin: "moderate - anti-inflammatory",
      },
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
        floral: 0.7,
        fruity: 1.0, // Maximum fruitiness
        herbal: 0.1,
        spicy: 0.0,
        earthy: 0.1,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.8,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.2, // Seeds
        silky: 0.4,
      },
    },

    storage: {
      temperature: "refrigerate 32-36°F",
      duration: "3-5 days",
      container: "original container or single layer on paper towels",
      tips: [
        "Store unwashed with hulls attached",
        "Remove any moldy berries immediately",
        "Best eaten within 1-2 days of purchase",
        "Can freeze on baking sheet, then bag for up to 6 months",
      ],
    },

    preparation: {
      methods: [
        "Rinse gently just before eating",
        "Hull with paring knife or strawberry huller",
        "Slice for desserts",
        "Puree for sauces and smoothies",
      ],
      tips: [
        "Leave hulls on until ready to eat",
        "Don't soak - absorbs water and loses flavor",
        "Macerate with sugar to draw out juices",
        "Room temperature berries have best flavor",
      ],
      yields: "1 pint = 2 cups whole = 1.5 cups sliced",
    },

    recommendedCookingMethods: [
      "eating fresh",
      "macerating",
      "baking",
      "making jam",
      "blending",
    ],

    pairingRecommendations: {
      complementary: [
        "cream",
        "chocolate",
        "vanilla",
        "lemon",
        "mint",
        "balsamic vinegar",
        "basil",
        "yogurt",
      ],
      contrasting: ["black pepper", "goat cheese", "arugula"],
      toAvoid: ["overly spicy foods", "strong fish"],
    },

    description:
      "Strawberries are beloved for their bright red color, juicy texture, and sweet-tart flavor. Unlike most fruits, the seeds are on the outside. Peak season berries are incomparably sweet and aromatic compared to off-season varieties. Extremely high in vitamin C and antioxidants. Choose berries that are uniformly red with fresh green hulls.",

    origin: ["Hybrid of North and South American species", "Cultivated globally"],

    qualities: [
      "sweet",
      "aromatic",
      "juicy",
      "delicate",
      "vitamin-rich",
      "seasonal",
    ],

    healthBenefits: [
      "Extremely high in vitamin C - immune support",
      "Rich in anthocyanins - heart health",
      "May improve blood sugar regulation",
      "Anti-inflammatory properties",
      "Supports brain health",
      "May reduce cancer risk",
    ],

    seasonality: ["spring", "summer"],

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Taurus", "Cancer", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
  },

  avocado: {
    name: "avocado",
    category: "fruits",
    subcategory: "tropical_berry",

    // Creamy, rich, nourishing
    elementalProperties: { Earth: 0.45, Water: 0.30, Fire: 0.15, Air: 0.10 },

    nutritionalProfile: {
      serving_size: "1/2 medium (68g)",
      calories: 114,
      macros: {
        protein: 1.3,
        carbs: 6.0,
        fat: 10.5, // Mostly monounsaturated
        fiber: 4.6,
      },
      vitamins: {
        K: 0.18,
        folate: 0.15,
        C: 0.11,
        B6: 0.13,
        E: 0.14,
      },
      minerals: {
        potassium: 0.14, // More than bananas!
        magnesium: 0.07,
        copper: 0.10,
      },
      antioxidants: {
        lutein_zeaxanthin: "high - eye health",
        beta_sitosterol: "high - may lower cholesterol",
        glutathione: "moderate - powerful antioxidant",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.1,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.1,
        umami: 0.4, // Savory richness
        spicy: 0.0,
      },
      aroma: {
        floral: 0.1,
        fruity: 0.4,
        herbal: 0.3,
        spicy: 0.0,
        earthy: 0.6,
        woody: 0.2,
      },
      texture: {
        crisp: 0.0,
        tender: 0.6,
        creamy: 1.0, // Maximum creaminess
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.8,
      },
    },

    storage: {
      temperature: "ripen at room temp, refrigerate when ripe",
      duration: "3-5 days at room temp to ripen, 3-5 days refrigerated when ripe",
      container: "open air until ripe, then refrigerate",
      tips: [
        "Ripen in paper bag with banana or apple",
        "Yields to gentle pressure when ripe",
        "Refrigerate ripe avocados to slow further ripening",
        "Brush cut surfaces with lemon juice to prevent browning",
      ],
    },

    preparation: {
      methods: [
        "Cut lengthwise around pit, twist to separate halves",
        "Remove pit by striking with knife and twisting",
        "Scoop flesh with spoon",
        "Mash for guacamole or slice for toast",
      ],
      tips: [
        "Hass avocados best for flavor and creaminess",
        "Leave pit in unused half to reduce browning",
        "Add acid (lemon, lime) to prevent oxidation",
        "Slightly underripe for slicing, perfectly ripe for mashing",
      ],
      yields: "1 medium = 1 cup cubed",
    },

    recommendedCookingMethods: [
      "eating raw",
      "mashing",
      "grilling",
      "blending",
      "in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "lime",
        "cilantro",
        "tomatoes",
        "onions",
        "salt",
        "chili",
        "eggs",
        "toast",
      ],
      contrasting: ["seafood", "bacon", "cheese", "pomegranate"],
      toAvoid: ["prolonged cooking", "extremely acidic dressings"],
    },

    description:
      "Avocados are unique fruits prized for their buttery texture and rich, mild flavor. Unlike most fruits, they're high in healthy fats—primarily monounsaturated oleic acid. Native to Mexico, avocados (also called alligator pears) are now cultivated in warm climates worldwide. Hass avocados with pebbly dark skin are most prized for eating. Ripe avocados yield to gentle pressure.",

    origin: ["Mexico and Central America", "Cultivated in warm climates globally"],

    qualities: [
      "creamy",
      "rich",
      "nutritious",
      "versatile",
      "heart-healthy",
      "satisfying",
    ],

    healthBenefits: [
      "High in heart-healthy monounsaturated fats",
      "Rich in potassium - more than bananas",
      "Supports nutrient absorption (fat-soluble vitamins)",
      "High in fiber - digestive health",
      "May lower cholesterol",
      "Supports eye health (lutein)",
    ],

    seasonality: ["year-round", "peak: spring-summer"],

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["Taurus", "Libra", "Cancer"],
      seasonalAffinity: ["spring", "summer"],
    },
  },

  blueberry: {
    name: "blueberry",
    category: "fruits",
    subcategory: "berry",

    // Sweet, delicate, antioxidant-rich
    elementalProperties: { Water: 0.40, Air: 0.30, Earth: 0.20, Fire: 0.10 },

    nutritionalProfile: {
      serving_size: "1 cup (148g)",
      calories: 84,
      macros: {
        protein: 1.1,
        carbs: 21.5,
        fat: 0.5,
        fiber: 3.6,
      },
      vitamins: {
        K: 0.36,
        C: 0.24,
        B6: 0.05,
      },
      minerals: {
        manganese: 0.25,
      },
      antioxidants: {
        anthocyanins:
          "extremely high - highest of common fruits, brain and heart health",
        pterostilbene: "high - similar to resveratrol, anti-aging",
        quercetin: "moderate - anti-inflammatory",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.7,
        salty: 0.0,
        sour: 0.2,
        bitter: 0.0,
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.5,
        fruity: 0.9,
        herbal: 0.0,
        spicy: 0.0,
        earthy: 0.2,
        woody: 0.1,
      },
      texture: {
        crisp: 0.0,
        tender: 0.8,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.3,
      },
    },

    storage: {
      temperature: "refrigerate 32-35°F",
      duration: "10-14 days",
      container: "original container, single layer preferred",
      tips: [
        "Do not wash until ready to eat",
        "Remove any moldy berries immediately",
        "Freeze on baking sheet, then bag for up to 12 months",
        "Wild blueberries more intense flavor than cultivated",
      ],
    },

    preparation: {
      methods: [
        "Rinse gently in colander just before using",
        "Pick through and remove stems",
        "Use fresh or frozen interchangeably in most recipes",
        "Toss with flour before baking to prevent sinking",
      ],
      tips: [
        "Wild blueberries smaller but more flavorful",
        "Frozen berries work great in baking",
        "Add to pancakes/muffins while batter is in pan",
        "Bloom on berries is natural protective coating - don't wash off until eating",
      ],
      yields: "1 pint = 2 cups",
    },

    recommendedCookingMethods: [
      "eating fresh",
      "baking",
      "making jam",
      "blending",
      "in compotes",
    ],

    pairingRecommendations: {
      complementary: [
        "lemon",
        "vanilla",
        "cream",
        "maple syrup",
        "yogurt",
        "oats",
        "almonds",
        "mint",
      ],
      contrasting: ["lavender", "goat cheese", "balsamic vinegar"],
      toAvoid: ["overpowering spices"],
    },

    description:
      "Blueberries are small, round berries with deep blue-purple skin and a silvery bloom. One of the few fruits native to North America, blueberries are prized for their sweet flavor and extraordinary antioxidant content—among the highest of all common fruits. Wild blueberries are smaller and more intensely flavored than cultivated varieties. Fresh blueberries should be firm, plump, and deeply colored.",

    origin: ["North America (native)", "Cultivated globally"],

    qualities: [
      "sweet",
      "antioxidant-rich",
      "delicate",
      "versatile",
      "healthful",
      "flavorful",
    ],

    healthBenefits: [
      "Extremely high in antioxidants - among highest of all fruits",
      "Supports brain health and memory",
      "May reduce heart disease risk",
      "Anti-inflammatory properties",
      "May improve insulin sensitivity",
      "Supports eye health",
    ],

    seasonality: ["summer"],

    astrologicalProfile: {
      rulingPlanets: ["Moon", "Jupiter"],
      favorableZodiac: ["Cancer", "Pisces", "Sagittarius"],
      seasonalAffinity: ["summer"],
    },
  },

  orange: {
    name: "orange",
    category: "fruits",
    subcategory: "citrus",

    // Sweet, juicy, refreshing
    elementalProperties: { Water: 0.40, Fire: 0.30, Air: 0.20, Earth: 0.10 },

    nutritionalProfile: {
      serving_size: "1 medium (131g)",
      calories: 62,
      macros: {
        protein: 1.2,
        carbs: 15.4,
        fat: 0.2,
        fiber: 3.1,
      },
      vitamins: {
        C: 0.93, // 93% RDA - excellent source!
        folate: 0.10,
        thiamin: 0.08,
        A: 0.05,
      },
      minerals: {
        potassium: 0.07,
        calcium: 0.05,
      },
      antioxidants: {
        hesperidin: "very high - flavonoid that reduces inflammation",
        vitamin_c: "extremely high - immune support",
        carotenoids: "moderate - especially in blood oranges",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.8,
        salty: 0.0,
        sour: 0.3,
        bitter: 0.1, // Pith
        umami: 0.0,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.6,
        fruity: 0.9,
        herbal: 0.1,
        spicy: 0.0,
        earthy: 0.0,
        woody: 0.0,
      },
      texture: {
        crisp: 0.0,
        tender: 0.7,
        creamy: 0.0,
        chewy: 0.3, // Membranes
        crunchy: 0.0,
        silky: 0.4,
      },
    },

    storage: {
      temperature: "room temperature for 1 week, refrigerate for 2-3 weeks",
      duration: "1 week at room temp, 2-3 weeks refrigerated",
      container: "open air or fruit bowl, crisper if refrigerating",
      tips: [
        "Room temperature for best juice yield",
        "Heavy oranges = juicy oranges",
        "Avoid soft spots or mold",
        "Zest can be frozen for later use",
      ],
    },

    preparation: {
      methods: [
        "Peel with hands or knife",
        "Supreme (segment without membranes)",
        "Juice with citrus reamer",
        "Zest with microplane",
      ],
      tips: [
        "1 medium orange = 1/3-1/2 cup juice",
        "Roll firmly on counter before juicing",
        "Navel oranges for eating, Valencia for juicing",
        "Blood oranges have raspberry notes and burgundy flesh",
      ],
      yields: "1 medium = 1/3-1/2 cup juice, 1-2 tbsp zest",
    },

    recommendedCookingMethods: [
      "eating fresh",
      "juicing",
      "segmenting",
      "zesting",
      "in salads",
    ],

    pairingRecommendations: {
      complementary: [
        "fennel",
        "olives",
        "chocolate",
        "vanilla",
        "cinnamon",
        "ginger",
        "duck",
        "almonds",
      ],
      contrasting: ["beets", "arugula", "blue cheese", "chili"],
      toAvoid: ["milk (wait 30 min)", "overly acidic combinations"],
    },

    description:
      "Oranges are the world's most popular citrus fruit, prized for sweet juice and bright flavor. Navel oranges are ideal for eating fresh with their thick, easy-to-peel skin and seedless flesh. Valencia oranges are juicier and preferred for juice. Blood oranges have distinctive burgundy flesh and berry-like notes. Choose firm, heavy oranges with smooth skin.",

    origin: ["Southeast Asia (native)", "Cultivated in warm climates globally"],

    qualities: [
      "sweet",
      "juicy",
      "refreshing",
      "vitamin-rich",
      "aromatic",
      "versatile",
    ],

    healthBenefits: [
      "Excellent source of vitamin C - immune support",
      "Rich in flavonoids - heart health",
      "May reduce inflammation",
      "Supports skin health",
      "May help prevent kidney stones",
      "Good source of fiber",
    ],

    seasonality: ["winter", "spring"],

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["Leo", "Sagittarius", "Gemini"],
      seasonalAffinity: ["winter"],
    },
  },
};

// Export processed ingredients
export const enhancedFruitsIngredients =
  fixIngredientMappings(rawEnhancedFruits);
