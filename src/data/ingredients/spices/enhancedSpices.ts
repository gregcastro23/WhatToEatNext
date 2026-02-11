import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

/**
 * ENHANCED SPICES DATA
 * Each spice has been researched for accurate, unique properties
 * Data sources: USDA FoodData Central, culinary references, astrological correspondences
 * Format inspired by "On Cooking" textbook principles
 */

const rawEnhancedSpices: Record<string, Partial<IngredientMapping>> = {
  black_pepper: {
    name: "black pepper",
    category: "spices",
    subcategory: "peppercorn",

    // Unique elemental properties - pungent, warming, penetrating
    elementalProperties: { Fire: 0.55, Air: 0.3, Earth: 0.1, Water: 0.05 },

    // Nutritional profile (per 1 tsp / 2.3g ground)
    nutritionalProfile: {
      serving_size: "1 teaspoon ground (2.3g)",
      calories: 6,
      macros: {
        protein: 0.2,
        carbs: 1.5,
        fat: 0.1,
        fiber: 0.6,
      },
      vitamins: {
        K: 0.04, // 4% RDA
        C: 0.01,
        A: 0.01,
      },
      minerals: {
        iron: 0.03,
        manganese: 0.08,
        calcium: 0.01,
      },
      antioxidants: {
        piperine:
          "high - responsible for pungency and bioavailability enhancement",
        phenolics: "moderate",
      },
      source: "USDA FoodData Central",
    },

    // Sensory profile
    sensoryProfile: {
      taste: {
        sweet: 0.0,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.1,
        spicy: 0.9, // Very pungent
      },
      aroma: {
        floral: 0.1,
        fruity: 0.1,
        herbal: 0.2,
        spicy: 0.9,
        earthy: 0.5,
        woody: 0.6,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.8, // Whole peppercorns
        silky: 0.0,
      },
    },

    // Storage
    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "whole: 3-4 years, ground: 6-12 months",
      container: "airtight container in dark, cool, dry place",
      tips: [
        "Buy whole peppercorns and grind fresh for maximum flavor",
        "Ground pepper loses potency quickly - replace every 6 months",
        "Store away from heat and light to preserve essential oils",
        "Use a pepper mill for best results",
      ],
    },

    // Preparation
    preparation: {
      methods: [
        "Grind whole peppercorns in pepper mill",
        "Toast whole peppercorns before grinding for deeper flavor",
        "Crack with knife for coarse texture",
        "Add whole to stocks and braises",
      ],
      tips: [
        "Add at end of cooking to preserve volatile oils",
        "Freshly cracked pepper is 10x more aromatic than pre-ground",
        "White pepper for light-colored sauces",
        "Black pepper for most savory applications",
      ],
      yields: "1 tbsp whole peppercorns = 1 tsp ground",
    },

    // Culinary uses
    recommendedCookingMethods: [
      "grinding",
      "toasting",
      "cracking",
      "infusing",
      "seasoning",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "onion",
        "lemon",
        "olive oil",
        "butter",
        "salt",
        "rosemary",
        "thyme",
      ],
      contrasting: ["sweet fruits", "honey", "chocolate", "strawberries"],
      toAvoid: ["delicate fish raw", "mild dairy desserts"],
    },

    description:
      "Black pepper (Piper nigrum) is the world's most traded spice, prized for its sharp, pungent flavor and aromatic complexity. The peppercorns are the dried, unripe fruits of the pepper vine. Its heat comes from piperine, which also enhances the bioavailability of other nutrients. Essential in virtually all savory cooking, pepper is a foundational seasoning in global cuisine.",

    origin: ["India (Malabar Coast)", "Vietnam", "Indonesia", "Brazil"],

    qualities: [
      "pungent",
      "warming",
      "aromatic",
      "sharp",
      "penetrating",
      "universal",
    ],

    healthBenefits: [
      "Enhances nutrient absorption (especially curcumin)",
      "Improves digestion and gut health",
      "Antioxidant properties",
      "May improve blood sugar control",
      "Anti-inflammatory effects",
      "Cognitive enhancement potential",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mars"],
      favorableZodiac: ["Aries", "Scorpio", "Sagittarius"],
      seasonalAffinity: ["winter", "fall"],
    },
  },

  cinnamon: {
    name: "cinnamon",
    category: "spices",
    subcategory: "bark",

    // Sweet, warming, aromatic
    elementalProperties: { Fire: 0.4, Air: 0.35, Earth: 0.15, Water: 0.1 },

    nutritionalProfile: {
      serving_size: "1 teaspoon ground (2.6g)",
      calories: 6,
      macros: {
        protein: 0.1,
        carbs: 2.1,
        fat: 0.0,
        fiber: 1.4,
      },
      vitamins: {
        K: 0.01,
        A: 0.01,
      },
      minerals: {
        calcium: 0.03,
        iron: 0.02,
        manganese: 0.22, // 22% RDA - excellent source
      },
      antioxidants: {
        cinnamaldehyde:
          "very high - responsible for flavor and medicinal properties",
        polyphenols: "extremely high - more than most herbs/spices",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.7,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.2,
        umami: 0.0,
        spicy: 0.6, // Warm spice
      },
      aroma: {
        floral: 0.3,
        fruity: 0.2,
        herbal: 0.1,
        spicy: 0.9,
        earthy: 0.2,
        woody: 0.8,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.6, // Stick form
        silky: 0.7, // Ground form
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "sticks: 3-4 years, ground: 6-12 months",
      container: "airtight container in dark, cool place",
      tips: [
        "Cinnamon sticks retain flavor much longer than ground",
        "Store away from moisture to prevent clumping",
        "Ceylon cinnamon is sweeter and more delicate than Cassia",
        "Ground cinnamon loses potency after 6 months",
      ],
    },

    preparation: {
      methods: [
        "Grind sticks in spice grinder",
        "Toast whole sticks before grinding",
        "Infuse whole sticks in liquids",
        "Use stick as stirrer for beverages",
      ],
      tips: [
        "Ceylon cinnamon (true cinnamon) is preferred for delicate applications",
        "Cassia cinnamon has stronger, more assertive flavor",
        "Toast briefly in dry pan to intensify aroma",
        "Remove sticks before serving when used whole",
      ],
      yields: "1 cinnamon stick = 1/2 tsp ground",
    },

    recommendedCookingMethods: [
      "baking",
      "simmering",
      "infusing",
      "toasting",
      "grinding",
    ],

    pairingRecommendations: {
      complementary: [
        "apples",
        "vanilla",
        "nutmeg",
        "cloves",
        "ginger",
        "cardamom",
        "chocolate",
        "coffee",
      ],
      contrasting: ["citrus", "chili", "cumin", "lamb", "squash"],
      toAvoid: ["raw fish", "delicate herbs like basil"],
    },

    description:
      "Cinnamon is the dried inner bark of Cinnamomum trees, available primarily as Ceylon (true cinnamon) or Cassia varieties. Sweet, warm, and woody, it's essential in baking and desserts but also stars in savory applications across Middle Eastern, Indian, and North African cuisines. The complex aroma comes from cinnamaldehyde in its essential oils.",

    origin: ["Sri Lanka (Ceylon)", "Indonesia", "China (Cassia)", "Vietnam"],

    qualities: [
      "sweet",
      "warming",
      "aromatic",
      "woody",
      "comforting",
      "versatile",
    ],

    healthBenefits: [
      "Blood sugar regulation - improves insulin sensitivity",
      "Powerful antioxidant - highest ORAC value among spices",
      "Anti-inflammatory properties",
      "Heart health support",
      "Antimicrobial effects",
      "May improve cognitive function",
    ],

    seasonality: ["year-round", "peak: fall-winter"],

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["Leo", "Sagittarius", "Aries"],
      seasonalAffinity: ["winter", "fall"],
    },
  },

  cumin: {
    name: "cumin",
    category: "spices",
    subcategory: "seed",

    // Earthy, warming, grounding
    elementalProperties: { Earth: 0.45, Fire: 0.3, Air: 0.2, Water: 0.05 },

    nutritionalProfile: {
      serving_size: "1 teaspoon seeds (2.1g)",
      calories: 8,
      macros: {
        protein: 0.4,
        carbs: 0.9,
        fat: 0.5,
        fiber: 0.2,
      },
      vitamins: {
        A: 0.01,
        C: 0.01,
        E: 0.02,
      },
      minerals: {
        iron: 0.22, // 22% RDA - excellent source
        manganese: 0.07,
        calcium: 0.02,
        magnesium: 0.02,
      },
      antioxidants: {
        cuminaldehyde: "high - primary flavor compound",
        thymol: "moderate - antimicrobial properties",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.1,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.4,
        umami: 0.3,
        spicy: 0.5,
      },
      aroma: {
        floral: 0.0,
        fruity: 0.0,
        herbal: 0.3,
        spicy: 0.6,
        earthy: 0.9, // Very earthy
        woody: 0.5,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.7, // Whole seeds
        silky: 0.0,
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "whole seeds: 3-4 years, ground: 6-12 months",
      container: "airtight container in dark place",
      tips: [
        "Buy whole seeds and grind as needed for best flavor",
        "Toasting releases incredible aroma - essential step",
        "Store away from light to preserve essential oils",
        "Seeds should smell fresh and pungent, not musty",
      ],
    },

    preparation: {
      methods: [
        "Toast whole seeds in dry pan until fragrant (30-60 seconds)",
        "Grind toasted seeds in spice grinder",
        "Bloom in oil at start of cooking",
        "Use whole in pickles and spice blends",
      ],
      tips: [
        "ALWAYS toast cumin seeds before using for maximum flavor",
        "Watch carefully when toasting - burns quickly",
        "Blooming in oil releases fat-soluble flavor compounds",
        "Freshly ground cumin is 5x more potent than pre-ground",
      ],
      yields: "1 tbsp seeds = 1.5 tsp ground",
    },

    recommendedCookingMethods: [
      "toasting",
      "grinding",
      "blooming in oil",
      "tempering",
      "braising",
    ],

    pairingRecommendations: {
      complementary: [
        "coriander",
        "chili",
        "garlic",
        "onion",
        "turmeric",
        "ginger",
        "lamb",
        "lentils",
        "chickpeas",
      ],
      contrasting: ["citrus", "yogurt", "tomatoes", "mint"],
      toAvoid: ["delicate fish", "subtle desserts", "mild dairy"],
    },

    description:
      "Cumin (Cuminum cyminum) is one of the world's most popular spices, second only to black pepper. The small, elongated seeds have a distinctive earthy, warming flavor that's essential in Indian, Middle Eastern, Mexican, and North African cuisines. When toasted, cumin develops a nutty complexity that transforms any dish.",

    origin: ["India", "Iran", "Turkey", "Syria", "Mexico"],

    qualities: [
      "earthy",
      "warming",
      "nutty",
      "savory",
      "pungent",
      "foundational",
    ],

    healthBenefits: [
      "Aids digestion and reduces bloating",
      "Rich in iron - supports blood health",
      "Antioxidant properties",
      "May improve blood sugar control",
      "Anti-inflammatory effects",
      "Supports immune function",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["Aries", "Capricorn", "Scorpio"],
      seasonalAffinity: ["fall", "winter"],
    },
  },

  turmeric: {
    name: "turmeric",
    category: "spices",
    subcategory: "rhizome",

    // Earthy, bitter, warm
    elementalProperties: { Earth: 0.5, Fire: 0.25, Water: 0.15, Air: 0.1 },

    nutritionalProfile: {
      serving_size: "1 teaspoon ground (3g)",
      calories: 9,
      macros: {
        protein: 0.3,
        carbs: 2.0,
        fat: 0.3,
        fiber: 0.7,
      },
      vitamins: {
        C: 0.01,
        B6: 0.01,
      },
      minerals: {
        iron: 0.16, // 16% RDA
        manganese: 0.11,
        potassium: 0.01,
      },
      antioxidants: {
        curcumin:
          "very high - powerful anti-inflammatory, enhanced by black pepper",
        turmerones: "moderate - aromatic compounds",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.0,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.7,
        umami: 0.2,
        spicy: 0.3,
      },
      aroma: {
        floral: 0.1,
        fruity: 0.0,
        herbal: 0.4,
        spicy: 0.4,
        earthy: 0.9,
        woody: 0.6,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9, // Very fine powder
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "fresh root: 2-3 weeks refrigerated, ground: 1 year",
      container: "airtight container in dark place",
      tips: [
        "Fresh turmeric root can be frozen for long-term storage",
        "Stains everything - handle with care",
        "Store in dark container as light degrades curcumin",
        "Ground turmeric loses potency after 1 year",
      ],
    },

    preparation: {
      methods: [
        "Grate fresh root with microplane",
        "Bloom ground turmeric in oil",
        "Add to dishes early in cooking",
        "Combine with black pepper to enhance absorption",
      ],
      tips: [
        "Add black pepper to increase curcumin absorption by 2000%",
        "Combine with fats (oil, coconut milk) for better absorption",
        "Use gloves when handling fresh - stains hands yellow",
        "Fresh turmeric has brighter, more complex flavor than dried",
      ],
      yields: "1 inch fresh root = 1 tsp ground",
    },

    recommendedCookingMethods: [
      "sautéing",
      "simmering",
      "blooming in oil",
      "curry-making",
      "pickling",
    ],

    pairingRecommendations: {
      complementary: [
        "black pepper",
        "ginger",
        "garlic",
        "coconut milk",
        "cumin",
        "coriander",
        "mustard seeds",
      ],
      contrasting: ["lemon", "yogurt", "tomatoes"],
      toAvoid: ["delicate seafood raw", "mild desserts"],
    },

    description:
      "Turmeric (Curcuma longa) is a rhizome in the ginger family, prized for its golden color and earthy, slightly bitter flavor. Essential in curry powders and Indian cuisine, it's also valued for extraordinary medicinal properties. The active compound curcumin is a powerful anti-inflammatory whose bioavailability is greatly enhanced by black pepper.",

    origin: ["India", "Indonesia", "Bangladesh", "Thailand"],

    qualities: [
      "earthy",
      "bitter",
      "warming",
      "golden",
      "medicinal",
      "essential",
    ],

    healthBenefits: [
      "Powerful anti-inflammatory (curcumin)",
      "Strong antioxidant properties",
      "May reduce arthritis symptoms",
      "Supports brain health and memory",
      "May help prevent cancer",
      "Aids digestion and gut health",
    ],

    seasonality: ["year-round", "fresh: winter-spring"],

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mars"],
      favorableZodiac: ["Leo", "Aries", "Sagittarius"],
      seasonalAffinity: ["winter", "spring"],
    },
  },

  ginger: {
    name: "ginger",
    category: "spices",
    subcategory: "rhizome",

    // Pungent, warming, sharp
    elementalProperties: { Fire: 0.5, Air: 0.25, Earth: 0.15, Water: 0.1 },

    nutritionalProfile: {
      serving_size: "1 tablespoon fresh grated (6g)",
      calories: 5,
      macros: {
        protein: 0.1,
        carbs: 1.1,
        fat: 0.0,
        fiber: 0.1,
      },
      vitamins: {
        C: 0.01,
        B6: 0.01,
      },
      minerals: {
        potassium: 0.01,
        magnesium: 0.01,
        manganese: 0.01,
      },
      antioxidants: {
        gingerol: "very high - responsible for pungency and health benefits",
        shogaol: "high in dried ginger - more pungent than gingerol",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.0,
        sour: 0.1,
        bitter: 0.2,
        umami: 0.0,
        spicy: 0.9, // Very pungent
      },
      aroma: {
        floral: 0.3,
        fruity: 0.4,
        herbal: 0.2,
        spicy: 0.9,
        earthy: 0.4,
        woody: 0.5,
      },
      texture: {
        crisp: 0.6, // Fresh ginger
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.5, // Fibrous
        crunchy: 0.7,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "refrigerated (45-50°F) or room temp for short periods",
      duration: "fresh: 2-3 weeks refrigerated, frozen: 6 months",
      container:
        "paper bag in crisper, or wrap in paper towel then plastic bag",
      tips: [
        "Unpeeled ginger lasts longer than peeled",
        "Freeze ginger and grate from frozen - easier to handle",
        "Store in dry place if keeping at room temp (up to 1 week)",
        "Look for firm, smooth skin - avoid wrinkled or moldy pieces",
      ],
    },

    preparation: {
      methods: [
        "Peel with spoon edge (not knife)",
        "Grate with microplane for paste",
        "Slice thinly for stir-fries",
        "Julienne for garnish",
        "Juice for beverages",
      ],
      tips: [
        "Freeze ginger and grate from frozen - no need to peel",
        "Younger ginger has thinner skin and milder flavor",
        "Add early in cooking for mellow flavor, late for punch",
        "Crush slices to release more flavor in broths",
      ],
      yields: "1 inch fresh = 1 tbsp grated = 1/4 tsp ground",
    },

    recommendedCookingMethods: [
      "stir-frying",
      "simmering",
      "steaming",
      "pickling",
      "juicing",
      "baking",
    ],

    pairingRecommendations: {
      complementary: [
        "garlic",
        "soy sauce",
        "sesame oil",
        "scallions",
        "citrus",
        "honey",
        "turmeric",
        "lemongrass",
      ],
      contrasting: ["coconut", "chili", "vinegar", "brown sugar"],
      toAvoid: ["mild dairy desserts", "delicate greens"],
    },

    description:
      "Ginger (Zingiber officinale) is a rhizome with a sharp, warming flavor that's both sweet and pungent. Indispensable in Asian cuisines and increasingly popular in Western cooking, it adds depth to both savory and sweet dishes. Fresh ginger is preferred for most applications, while dried ground ginger is traditional in baking.",

    origin: ["India", "China", "Jamaica", "Nigeria", "Thailand"],

    qualities: [
      "pungent",
      "warming",
      "sharp",
      "aromatic",
      "versatile",
      "medicinal",
    ],

    healthBenefits: [
      "Relieves nausea and motion sickness",
      "Anti-inflammatory properties (gingerol)",
      "Aids digestion and reduces bloating",
      "May reduce muscle pain and soreness",
      "Immune system support",
      "May lower blood sugar levels",
    ],

    seasonality: ["year-round", "young ginger: spring"],

    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["Aries", "Leo", "Sagittarius"],
      seasonalAffinity: ["winter", "fall"],
    },
  },

  paprika: {
    name: "paprika",
    category: "spices",
    subcategory: "ground pepper",

    // Sweet, mild, earthy
    elementalProperties: { Fire: 0.35, Air: 0.3, Earth: 0.25, Water: 0.1 },

    nutritionalProfile: {
      serving_size: "1 teaspoon (2.3g)",
      calories: 6,
      macros: {
        protein: 0.3,
        carbs: 1.2,
        fat: 0.3,
        fiber: 0.8,
      },
      vitamins: {
        A: 0.19, // 19% RDA - excellent source
        E: 0.07,
        B6: 0.04,
      },
      minerals: {
        iron: 0.03,
        potassium: 0.01,
      },
      antioxidants: {
        carotenoids: "very high - especially beta-carotene",
        capsanthin: "high - red pigment with antioxidant properties",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.6,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.1,
        umami: 0.2,
        spicy: 0.3, // Mild heat (varies by type)
      },
      aroma: {
        floral: 0.2,
        fruity: 0.5,
        herbal: 0.1,
        spicy: 0.4,
        earthy: 0.6,
        woody: 0.2,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.9, // Very fine powder
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "6-12 months",
      container: "airtight container in dark place",
      tips: [
        "Store away from heat and light - degrades quickly",
        "Hungarian paprika generally has better flavor retention",
        "Refrigeration can extend shelf life to 18 months",
        "Replace if color fades to brownish",
      ],
    },

    preparation: {
      methods: [
        "Bloom in oil or butter at low heat",
        "Dust on foods before roasting",
        "Mix into spice rubs",
        "Garnish finished dishes",
      ],
      tips: [
        "Never let paprika burn - turns bitter immediately",
        "Use low heat when blooming in oil",
        "Hungarian paprika is sweeter; Spanish is smokier (pimentón)",
        "Hot paprika adds color and mild heat",
      ],
      yields: "Use as needed - primarily for color and mild flavor",
    },

    recommendedCookingMethods: [
      "blooming in fat",
      "roasting",
      "grilling",
      "stewing",
      "garnishing",
    ],

    pairingRecommendations: {
      complementary: [
        "onions",
        "garlic",
        "sour cream",
        "chicken",
        "potatoes",
        "eggs",
        "tomatoes",
      ],
      contrasting: ["lemon", "vinegar", "cumin", "coriander"],
      toAvoid: ["delicate fish", "subtle desserts"],
    },

    description:
      "Paprika is ground dried peppers (Capsicum annuum), ranging from sweet and mild to hot. Hungarian paprika is prized for its vibrant red color and sweet flavor, while Spanish pimentón offers smoky depth from being dried over oak fires. Essential in Hungarian goulash and Spanish chorizo, paprika adds both flavor and brilliant color.",

    origin: ["Hungary", "Spain", "California", "South America"],

    qualities: ["sweet", "mild", "colorful", "earthy", "fruity", "versatile"],

    healthBenefits: [
      "Rich in vitamin A - supports eye health",
      "High in antioxidants (carotenoids)",
      "Anti-inflammatory properties",
      "May improve circulation",
      "Supports immune function",
      "Contains capsaicin (in hot varieties) - metabolism boost",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mars", "Venus"],
      favorableZodiac: ["Aries", "Leo", "Taurus"],
      seasonalAffinity: ["summer", "fall"],
    },
  },

  cardamom: {
    name: "cardamom",
    category: "spices",
    subcategory: "pod",

    // Aromatic, sweet, complex
    elementalProperties: { Air: 0.45, Fire: 0.3, Water: 0.15, Earth: 0.1 },

    nutritionalProfile: {
      serving_size: "1 teaspoon ground (2g)",
      calories: 6,
      macros: {
        protein: 0.2,
        carbs: 1.4,
        fat: 0.1,
        fiber: 0.6,
      },
      vitamins: {
        C: 0.01,
      },
      minerals: {
        manganese: 0.04,
        iron: 0.01,
        magnesium: 0.01,
      },
      antioxidants: {
        cineole: "high - provides eucalyptus-like aroma",
        limonene: "moderate - citrus notes",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.7,
        salty: 0.0,
        sour: 0.1,
        bitter: 0.2,
        umami: 0.0,
        spicy: 0.5,
      },
      aroma: {
        floral: 0.8,
        fruity: 0.6,
        herbal: 0.5,
        spicy: 0.7,
        earthy: 0.1,
        woody: 0.3,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.6, // Whole pods
        silky: 0.7, // Ground seeds
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "whole pods: 2-3 years, ground: 6 months",
      container: "airtight container in dark place",
      tips: [
        "Buy whole pods and grind seeds as needed for maximum flavor",
        "Green cardamom is most common; black is smokier",
        "Pods protect volatile oils - much longer shelf life than ground",
        "Store away from moisture to prevent mold",
      ],
    },

    preparation: {
      methods: [
        "Crush pods to release seeds",
        "Grind seeds in spice grinder or mortar",
        "Toast whole pods before using",
        "Infuse whole pods in liquids",
      ],
      tips: [
        "Use only the seeds, discard papery pods",
        "Lightly crush pods before adding to dishes whole",
        "Grind fresh for each use - loses flavor rapidly",
        "A little goes a long way - very aromatic",
      ],
      yields: "10 pods = 1.5 tsp seeds = 1 tsp ground",
    },

    recommendedCookingMethods: [
      "baking",
      "brewing",
      "simmering",
      "infusing",
      "grinding",
    ],

    pairingRecommendations: {
      complementary: [
        "cinnamon",
        "cloves",
        "coffee",
        "milk",
        "rose water",
        "saffron",
        "pistachios",
        "vanilla",
      ],
      contrasting: ["citrus", "ginger", "black pepper", "savory meats"],
      toAvoid: ["raw fish", "delicate vegetables"],
    },

    description:
      "Cardamom is the seed pod of a plant in the ginger family, considered the 'Queen of Spices'. Green cardamom is floral and sweet with notes of eucalyptus and mint. Black cardamom is smokier and more robust. Essential in chai, Indian sweets, and Scandinavian baking, cardamom is one of the world's most expensive spices after saffron and vanilla.",

    origin: ["India (Western Ghats)", "Guatemala", "Sri Lanka", "Tanzania"],

    qualities: [
      "aromatic",
      "sweet",
      "complex",
      "floral",
      "luxurious",
      "warming",
    ],

    healthBenefits: [
      "Aids digestion and reduces bloating",
      "Freshens breath naturally",
      "May lower blood pressure",
      "Antioxidant properties",
      "Anti-inflammatory effects",
      "May have anti-cancer properties",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mercury"],
      favorableZodiac: ["Libra", "Gemini", "Taurus"],
      seasonalAffinity: ["winter", "fall"],
    },
  },

  coriander: {
    name: "coriander",
    category: "spices",
    subcategory: "seed",

    // Sweet, citrusy, warm
    elementalProperties: { Air: 0.4, Fire: 0.25, Earth: 0.2, Water: 0.15 },

    nutritionalProfile: {
      serving_size: "1 teaspoon seeds (1.8g)",
      calories: 5,
      macros: {
        protein: 0.2,
        carbs: 1.0,
        fat: 0.3,
        fiber: 0.8,
      },
      vitamins: {
        C: 0.01,
        K: 0.01,
      },
      minerals: {
        iron: 0.02,
        manganese: 0.04,
        calcium: 0.01,
      },
      antioxidants: {
        linalool: "very high - floral, citrus aroma compound",
        phenolics: "moderate",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.5,
        salty: 0.0,
        sour: 0.2,
        bitter: 0.1,
        umami: 0.1,
        spicy: 0.3,
      },
      aroma: {
        floral: 0.7,
        fruity: 0.6,
        herbal: 0.4,
        spicy: 0.5,
        earthy: 0.3,
        woody: 0.2,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.7, // Whole seeds
        silky: 0.6, // Ground
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "whole seeds: 3-4 years, ground: 1 year",
      container: "airtight container in dark place",
      tips: [
        "Buy whole seeds for better flavor retention",
        "Toast before grinding to enhance citrus notes",
        "Store away from light to preserve essential oils",
        "Seeds should have pleasant citrus aroma, not musty",
      ],
    },

    preparation: {
      methods: [
        "Toast whole seeds until fragrant",
        "Grind in spice grinder or mortar",
        "Crush lightly for pickling",
        "Use whole in spice blends",
      ],
      tips: [
        "Toasting is essential - brings out sweet, nutty notes",
        "Pairs perfectly with cumin (classic combination)",
        "Freshly ground coriander is much more aromatic",
        "Great for pickling and brining",
      ],
      yields: "1 tbsp seeds = 1.25 tsp ground",
    },

    recommendedCookingMethods: [
      "toasting",
      "grinding",
      "pickling",
      "curry-making",
      "baking",
    ],

    pairingRecommendations: {
      complementary: [
        "cumin",
        "turmeric",
        "chili",
        "garlic",
        "ginger",
        "lemon",
        "cilantro",
        "coconut",
      ],
      contrasting: ["sweet fruits", "chocolate", "vanilla"],
      toAvoid: ["delicate fish", "mild dairy"],
    },

    description:
      "Coriander seeds come from the same plant as cilantro (Coriandrum sativum), but taste completely different - sweet, citrusy, and warming rather than fresh and herbaceous. Essential in curry powders, pickling spices, and Middle Eastern cuisine. The seeds develop their characteristic flavor when toasted, releasing aromatic linalool.",

    origin: ["India", "Morocco", "Russia", "Mediterranean"],

    qualities: [
      "citrusy",
      "sweet",
      "warming",
      "aromatic",
      "versatile",
      "bright",
    ],

    healthBenefits: [
      "Aids digestion and reduces gas",
      "May lower blood sugar levels",
      "Anti-inflammatory properties",
      "Rich in antioxidants",
      "May support heart health",
      "Antimicrobial effects",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Mars"],
      favorableZodiac: ["Gemini", "Aries", "Virgo"],
      seasonalAffinity: ["spring", "summer"],
    },
  },

  nutmeg: {
    name: "nutmeg",
    category: "spices",
    subcategory: "seed",

    // Warm, sweet, aromatic
    elementalProperties: { Fire: 0.35, Air: 0.35, Earth: 0.2, Water: 0.1 },

    nutritionalProfile: {
      serving_size: "1 teaspoon ground (2.2g)",
      calories: 12,
      macros: {
        protein: 0.1,
        carbs: 1.1,
        fat: 0.8,
        fiber: 0.5,
      },
      vitamins: {
        A: 0.01,
      },
      minerals: {
        manganese: 0.09,
        copper: 0.03,
        magnesium: 0.01,
      },
      antioxidants: {
        myristicin: "high - psychoactive in large doses, aromatic",
        eugenol: "moderate - also found in cloves",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.6,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.0,
        spicy: 0.5,
      },
      aroma: {
        floral: 0.4,
        fruity: 0.3,
        herbal: 0.2,
        spicy: 0.8,
        earthy: 0.4,
        woody: 0.7,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.8, // Whole nutmeg
        silky: 0.7, // Freshly grated
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "whole: 4+ years, ground: 6 months",
      container: "airtight container in dark place",
      tips: [
        "Buy whole nutmeg and grate fresh - incomparably better flavor",
        "Whole nutmeg lasts almost indefinitely",
        "Use a microplane or dedicated nutmeg grater",
        "Pre-ground nutmeg loses flavor very quickly",
      ],
    },

    preparation: {
      methods: [
        "Grate whole nutmeg with microplane",
        "Use dedicated nutmeg grater",
        "Add at end of cooking for most aroma",
      ],
      tips: [
        "A little goes a long way - very potent",
        "Freshly grated is 10x more aromatic than pre-ground",
        "Toxic in large quantities - use sparingly",
        "Pairs beautifully with dairy and cream",
      ],
      yields: "1 whole nutmeg = 2-3 tsp grated",
    },

    recommendedCookingMethods: [
      "grating fresh",
      "baking",
      "in cream sauces",
      "in egg dishes",
      "in beverages",
    ],

    pairingRecommendations: {
      complementary: [
        "cinnamon",
        "cloves",
        "allspice",
        "cream",
        "milk",
        "cheese",
        "eggs",
        "spinach",
        "pumpkin",
      ],
      contrasting: ["citrus", "chili", "ginger"],
      toAvoid: ["raw fish", "acidic dishes"],
    },

    description:
      "Nutmeg is the seed of Myristica fragrans, encased in mace (another spice). It has a warm, sweet, slightly hallucinogenic aroma that's essential in baking, cream sauces, and eggnogs. Widely used in both sweet and savory applications across European, Middle Eastern, and Caribbean cuisines. The complex flavor comes from myristicin and eugenol in its essential oils.",

    origin: ["Indonesia (Banda Islands)", "Grenada", "India", "Sri Lanka"],

    qualities: [
      "warming",
      "sweet",
      "aromatic",
      "complex",
      "woody",
      "luxurious",
    ],

    healthBenefits: [
      "May aid sleep and reduce insomnia",
      "Digestive aid - reduces gas and bloating",
      "Anti-inflammatory properties",
      "Pain relief potential",
      "Antibacterial effects",
      "WARNING: Toxic in large doses (>5g)",
    ],

    seasonality: ["year-round", "peak: fall-winter"],

    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Sun"],
      favorableZodiac: ["Sagittarius", "Leo", "Pisces"],
      seasonalAffinity: ["winter", "fall"],
    },
  },

  chili_powder: {
    name: "chili powder",
    category: "spices",
    subcategory: "blend",

    // Hot, earthy, complex
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.15, Water: 0.05 },

    nutritionalProfile: {
      serving_size: "1 teaspoon (2.6g)",
      calories: 8,
      macros: {
        protein: 0.3,
        carbs: 1.4,
        fat: 0.4,
        fiber: 0.9,
      },
      vitamins: {
        A: 0.09, // 9% RDA
        C: 0.02,
        B6: 0.02,
      },
      minerals: {
        iron: 0.04,
        potassium: 0.01,
      },
      antioxidants: {
        capsaicin: "high - provides heat and metabolism boost",
        carotenoids: "moderate",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.2,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.3,
        umami: 0.3,
        spicy: 0.8,
      },
      aroma: {
        floral: 0.1,
        fruity: 0.2,
        herbal: 0.3,
        spicy: 0.9,
        earthy: 0.7,
        woody: 0.4,
      },
      texture: {
        crisp: 0.0,
        tender: 0.0,
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.8,
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "6-12 months",
      container: "airtight container in dark place",
      tips: [
        "Make your own blend for better flavor control",
        "Store away from heat and light",
        "Replace every 6 months for optimal flavor",
        "Note: chili powder vs. pure ground chili - different products",
      ],
    },

    preparation: {
      methods: [
        "Bloom in oil at start of cooking",
        "Mix into spice rubs",
        "Add to stews and braises",
        "Make custom blends",
      ],
      tips: [
        "Chili powder is a blend (chili, cumin, garlic, oregano)",
        "Ground chili is pure dried chili",
        "Blooming in fat releases fat-soluble capsaicin",
        "Add early for integrated heat, late for fresh spice flavor",
      ],
      yields: "Use as needed - typically 1-3 tsp per dish",
    },

    recommendedCookingMethods: [
      "blooming in oil",
      "making rubs",
      "in stews",
      "in chili",
      "in marinades",
    ],

    pairingRecommendations: {
      complementary: [
        "cumin",
        "garlic",
        "onion",
        "tomatoes",
        "beef",
        "beans",
        "chocolate",
        "lime",
      ],
      contrasting: ["sour cream", "cheese", "avocado", "cilantro"],
      toAvoid: ["delicate fish", "mild desserts"],
    },

    description:
      "Chili powder is a spice blend typically containing ground dried chiles, cumin, garlic powder, oregano, and sometimes paprika. Different from pure ground chile peppers, it's designed as an all-in-one seasoning for chili con carne and Tex-Mex dishes. Heat levels vary by brand and chile types used.",

    origin: ["Mexico", "Southwestern USA", "South America"],

    qualities: ["hot", "earthy", "complex", "savory", "warming", "bold"],

    healthBenefits: [
      "Metabolism boost from capsaicin",
      "May aid weight loss",
      "Anti-inflammatory properties",
      "Pain relief potential",
      "Rich in antioxidants",
      "May improve heart health",
    ],

    seasonality: ["year-round"],

    astrologicalProfile: {
      rulingPlanets: ["Mars"],
      favorableZodiac: ["Aries", "Scorpio", "Sagittarius"],
      seasonalAffinity: ["winter", "fall"],
    },
  },

  saffron: {
    name: "saffron",
    category: "spices",
    subcategory: "stigma",

    // Delicate, floral, complex
    elementalProperties: { Air: 0.5, Fire: 0.25, Water: 0.15, Earth: 0.1 },

    nutritionalProfile: {
      serving_size: "1 pinch / 0.02g (typical serving)",
      calories: 0,
      macros: {
        protein: 0.0,
        carbs: 0.0,
        fat: 0.0,
        fiber: 0.0,
      },
      vitamins: {
        C: 0.0, // Negligible due to tiny serving size
        B6: 0.0,
      },
      minerals: {
        manganese: 0.0,
        iron: 0.0,
      },
      antioxidants: {
        crocin: "very high - provides golden color and antioxidant benefits",
        safranal: "high - distinctive aroma and potential mood benefits",
        picrocrocin: "moderate - bitter taste compound",
      },
      source: "USDA FoodData Central",
    },

    sensoryProfile: {
      taste: {
        sweet: 0.5,
        salty: 0.0,
        sour: 0.0,
        bitter: 0.4,
        umami: 0.1,
        spicy: 0.0,
      },
      aroma: {
        floral: 0.9,
        fruity: 0.4,
        herbal: 0.6,
        spicy: 0.3,
        earthy: 0.5,
        woody: 0.2,
      },
      texture: {
        crisp: 0.0,
        tender: 0.9, // Delicate threads
        creamy: 0.0,
        chewy: 0.0,
        crunchy: 0.0,
        silky: 0.0,
      },
    },

    storage: {
      temperature: "room temperature (60-70°F)",
      duration: "2-3 years in airtight container",
      container: "airtight, opaque container away from light",
      tips: [
        "Store in dark container - light degrades color and flavor",
        "Keep threads whole until ready to use",
        "Never buy saffron powder - easily adulterated",
        "Genuine saffron is expensive ($500-5000/pound)",
      ],
    },

    preparation: {
      methods: [
        "Steep threads in warm liquid 10-20 minutes",
        "Toast lightly and crush before steeping",
        "Add threads directly to rice dishes",
        "Grind with sugar for even distribution",
      ],
      tips: [
        "A little goes a long way - use 10-20 threads per serving",
        "Steep in warm water, milk, or stock before adding",
        "Toast threads briefly to intensify flavor",
        "Adds both color and distinctive hay-like, floral flavor",
      ],
      yields: "1 pinch (20 threads) per 4 servings typical",
    },

    recommendedCookingMethods: [
      "steeping",
      "infusing",
      "in rice dishes",
      "in desserts",
      "in seafood",
    ],

    pairingRecommendations: {
      complementary: [
        "rice",
        "seafood",
        "cardamom",
        "rose water",
        "almonds",
        "pistachios",
        "honey",
        "cream",
      ],
      contrasting: ["tomatoes", "citrus", "white wine"],
      toAvoid: ["strong spices that overpower", "heavily seasoned meats"],
    },

    description:
      "Saffron consists of the dried stigmas of Crocus sativus flowers, hand-harvested and the world's most expensive spice by weight. Each flower yields only 3 stigmas, requiring 75,000 flowers for one pound of saffron. It imparts a distinctive golden color, subtle floral flavor, and hay-like aroma to dishes. Essential in paella, risotto Milanese, and Persian rice.",

    origin: ["Iran (90% of world supply)", "Kashmir", "Spain", "Greece"],

    qualities: [
      "luxurious",
      "delicate",
      "floral",
      "distinctive",
      "precious",
      "aromatic",
    ],

    healthBenefits: [
      "May improve mood and reduce depression",
      "Strong antioxidant properties",
      "May enhance memory and learning",
      "May reduce PMS symptoms",
      "Anti-inflammatory effects",
      "May suppress appetite and aid weight loss",
    ],

    seasonality: ["year-round", "harvest: fall"],

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["Leo", "Sagittarius", "Pisces"],
      seasonalAffinity: ["fall", "winter"],
    },
  },
};

// Export processed ingredients
export const enhancedSpicesIngredients =
  fixIngredientMappings(rawEnhancedSpices);
