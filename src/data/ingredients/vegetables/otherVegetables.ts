import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawOtherVegetables: Record<string, Partial<IngredientMapping>> = {

  kombu: {
    image_url: "ingredients/kombu.png",
    name: "kombu",
    category: "vegetable",
    subcategory: "sea_vegetable",
    description: "Thick, dried deep-ocean kelp (*Saccharina japonica*) that acts as the cornerstone of Japanese dashi broth. Packed with natural glutamic acid (umami), it physically tenderizes beans and adds unparalleled mineral richness to cooking liquids. Dominant in Water and Earth alchemical properties.",
    elementalProperties: { Water: 0.55, Earth: 0.35, Air: 0.05, Fire: 0.05 },
    qualities: ["umami-rich", "saline", "leathery", "flavor-enhancer"],
    astrologicalProfile: {
      rulingPlanets: ["Neptune", "Moon"],
      favorableZodiac: ["pisces", "cancer"],
      seasonalAffinity: ["winter"],
    },
    nutritionalProfile: {
      serving_size: "1 strip (5g)",
      calories: 10,
      macros: { protein: 0.5, carbs: 2.5, fat: 0.1, fiber: 1.5, sugar: 0, sodium: 0.12 },
      vitamins: { K: 0.05 },
      minerals: { iodine: 1.5, calcium: 0.02, magnesium: 0.03 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.1,
      salt: 0.5,
      salty: 0.5,
      sour: 0.05,
      bitter: 0.1,
      umami: 0.9,
      spicy: 0.0,
      aromatic: 0.3
    },
    sensoryProfile: { 
      taste: { sweet: 0.1, salty: 0.5, sour: 0.05, bitter: 0.1, umami: 0.9, spicy: 0.0 }, 
      aroma: { oceanic: 0.8, briny: 0.7 }, 
      texture: { firm: 0.7, chewy: 0.6 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["umami", "briny"], secondary: ["oceanic", "savory"], notes: "Provides unmatched umami depth to broths and grain cooking liquids." }, 
      cookingMethods: ["simmer", "steep", "boil", "infuse"], 
      cuisineAffinity: ["Japanese", "macrobiotic", "Asian"], 
      preparationTips: ["Do not wash off the white powder on the surface — it is mannitol, which holds concentrated umami.", "Remove kombu from boiling broth right before it boils to avoid bitter, slimy textures."] 
    },
    pairingRecommendations: { complementary: ["shoyu", "ginger", "shiitake", "beans", "tofu", "mirin"], contrasting: ["citrus"], toAvoid: [] },
    storage: { pantry: "Store in a dry, cool pantry.", notes: "Will keep indefinitely if kept away from humidity." }
  },
  arame: {
    image_url: "ingredients/arame.png",
    name: "arame",
    category: "vegetable",
    subcategory: "sea_vegetable",
    description: "A mild, sweet, dark-brown sea vegetable (*Eisenia bicyclis*) pre-shredded into delicate threads. Its gentle flavor and soft, yielding texture make it the ideal starter sea vegetable for salads, side dishes, and grain bowls. Highly supportive of Water and Earth.",
    elementalProperties: { Water: 0.45, Earth: 0.40, Air: 0.10, Fire: 0.05 },
    qualities: ["sweet", "mild", "shredded", "saline"],
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "pisces"],
      seasonalAffinity: ["summer"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup dry (5g)",
      calories: 12,
      macros: { protein: 0.6, carbs: 2.8, fat: 0.1, fiber: 1.8, sugar: 0.2, sodium: 0.15 },
      vitamins: {},
      minerals: { iron: 0.02, calcium: 0.03, magnesium: 0.02 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.25,
      salt: 0.3,
      salty: 0.3,
      sour: 0.0,
      bitter: 0.1,
      umami: 0.4,
      spicy: 0.0,
      aromatic: 0.2
    },
    sensoryProfile: { 
      taste: { sweet: 0.25, salty: 0.3, sour: 0.0, bitter: 0.1, umami: 0.4, spicy: 0.0 }, 
      aroma: { briny: 0.5, mild: 0.6 }, 
      texture: { soft: 0.7, shredded: 0.8 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["briny", "sweet"], secondary: ["mild", "earthy"], notes: "Extremely delicate and quick to prepare, sweet and oceanic." }, 
      cookingMethods: ["soak", "sauté", "simmer", "toss"], 
      cuisineAffinity: ["Japanese", "macrobiotic"], 
      preparationTips: ["Soaks in cold water in just 5-10 minutes, expanding dramatically.", "Sauté briefly with sesame oil and mirin before simmering for a delicious side dish."] 
    },
    pairingRecommendations: { complementary: ["carrots", "onions", "sesame seeds", "sesame oil", "soy sauce", "mirin"], contrasting: ["rice vinegar"], toAvoid: [] },
    storage: { pantry: "Keep dry in airtight bags.", notes: "Check for moisture occasionally." }
  },
  hijiki: {
    image_url: "ingredients/hijiki.png",
    name: "hijiki",
    category: "vegetable",
    subcategory: "sea_vegetable",
    description: "A highly traditional, thick, black twig-like sea vegetable (*Sargassum fusiforme*). When rehydrated and simmered, it develops a deep, earthy texture and rich mineral taste. It is commonly prepared with root vegetables and soy sauce. Grounding Earth-Water energy.",
    elementalProperties: { Earth: 0.45, Water: 0.40, Air: 0.10, Fire: 0.05 },
    qualities: ["saline", "earthy", "textured", "nutrient-dense"],
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Moon"],
      favorableZodiac: ["capricorn", "scorpio"],
      seasonalAffinity: ["fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup dry (5g)",
      calories: 11,
      macros: { protein: 0.5, carbs: 3.0, fat: 0.1, fiber: 2.2, sugar: 0, sodium: 0.18 },
      vitamins: {},
      minerals: { iron: 0.05, calcium: 0.07, magnesium: 0.03 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.1,
      salt: 0.4,
      salty: 0.4,
      sour: 0.0,
      bitter: 0.2,
      umami: 0.5,
      spicy: 0.0,
      aromatic: 0.15
    },
    sensoryProfile: { 
      taste: { sweet: 0.1, salty: 0.4, sour: 0.0, bitter: 0.2, umami: 0.5, spicy: 0.0 }, 
      aroma: { earthy: 0.6, briny: 0.5 }, 
      texture: { chewy: 0.8, firm: 0.7 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["earthy", "briny"], secondary: ["savory", "bitter"], notes: "Has a robust, almost wood-like integrity that holds up to long braising." }, 
      cookingMethods: ["soak", "simmer", "sauté", "braise"], 
      cuisineAffinity: ["Japanese", "macrobiotic"], 
      preparationTips: ["Requires soaking for 15-20 minutes in cold water, expanding up to five times in volume.", "Braise with carrots, lotus root, and fried tofu for a classic Japanese preparation."] 
    },
    pairingRecommendations: { complementary: ["carrots", "aburaage", "soy sauce", "sake", "mirin", "lotus root"], contrasting: [], toAvoid: [] },
    storage: { pantry: "Store dry, away from humidity.", notes: "Extremely stable shelf life." }
  },
  dulse: {
    image_url: "ingredients/dulse.png",
    name: "dulse",
    category: "vegetable",
    subcategory: "sea_vegetable",
    description: "A vibrant red, leafy sea vegetable (*Palmaria palmata*) with a distinctively savory, smoky flavor. Often referred to as 'sea bacon,' it can be fried until crisp or crumbled raw onto dishes to add saltiness and deep ocean umami. Harmonizes Water, Earth, and Fire.",
    elementalProperties: { Water: 0.35, Earth: 0.35, Fire: 0.20, Air: 0.10 },
    qualities: ["smoky", "saline", "chewy", "savory"],
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Neptune"],
      favorableZodiac: ["scorpio", "pisces"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "2 tbsp (7g)",
      calories: 18,
      macros: { protein: 1.5, carbs: 3.0, fat: 0.1, fiber: 1.2, sugar: 0.1, sodium: 0.25 },
      vitamins: { B6: 0.05, B12: 0.01 },
      minerals: { iron: 0.03, potassium: 0.28, iodine: 0.08 },
      source: "USDA FoodData Central",
    },
    flavorProfile: {
      sweet: 0.1,
      salt: 0.5,
      salty: 0.5,
      sour: 0.05,
      bitter: 0.15,
      umami: 0.7,
      spicy: 0.05,
      aromatic: 0.4
    },
    sensoryProfile: { 
      taste: { sweet: 0.1, salty: 0.5, sour: 0.05, bitter: 0.15, umami: 0.7, spicy: 0.05 }, 
      aroma: { smoky: 0.6, oceanic: 0.6, savory: 0.5 }, 
      texture: { thin: 0.8, crispy: 0.7 } 
    },
    culinaryProfile: { 
      flavorProfile: { primary: ["smoky", "salty"], secondary: ["umami", "oceanic"], notes: "Unique amongst sea greens for its distinctively smoky, bacon-like qualities when cooked." }, 
      cookingMethods: ["pan-fry", "bake", "crumble", "soak"], 
      cuisineAffinity: ["Atlantic Canadian", "Irish", "macrobiotic", "global"], 
      preparationTips: ["Toast dry in a hot skillet for 2-3 minutes until green and crispy to release a bacon-like flavor.", "Crumble raw flakes directly over salads, grains, or popcorn."] 
    },
    pairingRecommendations: { complementary: ["potatoes", "butter", "olive oil", "avocado", "lemon", "grains"], contrasting: ["sweet apples", "maple"], toAvoid: [] },
    storage: { pantry: "Keep in a cool, dark cabinet in a sealed bag.", notes: "Check for mineral salt crystal deposits on leaves, which is natural." }
  },
  asparagus: {
      image_url: "ingredients/asparagus.png",
    name: "asparagus",
    category: "vegetable",
    subcategory: "shoot",

    // Delicate, slightly bitter, refined
    elementalProperties: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 },
    alchemicalProperties: {
      Spirit: 0.18,
      Essence: 0.29,
      Matter: 0.26,
      Substance: 0.27,
    },

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
        K: 0.7, // 70% RDA
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

    season: ["spring"],

    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter", "Moon", "Saturn"],
      favorableZodiac: ["gemini", "virgo", "sagittarius", "cancer", "taurus", "capricorn"],
      seasonalAffinity: ["spring"],
    },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] }
},
  artichoke: {
      image_url: "ingredients/artichoke.png",
    description: "The large, unopened flower bud of a thistle plant (*Cynara cardunculus*). Harvesting the tender, meaty 'heart' requires navigating tough, fibrous outer leaves and a fuzzy 'choke.' They contain cynarin, a unique compound that inhibits sweet receptors on the tongue, making water and subsequently eaten foods taste artificially sweet.",
    name: "artichoke",
    origin: ["Mediterranean (North Africa)"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.7,
      Earth: 0.15,
      Air: 0.05,
    },
    alchemicalProperties: {
      Spirit: 0.08,
      Essence: 0.39,
      Matter: 0.31,
      Substance: 0.22,
    },
    category: "vegetable",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 3.27, carbs: 10.51, fiber: 5.4 },
      calories: 47,
        vitamins: {},
        minerals: {}
    },
    season: ["spring"],
    cookingMethods: ["steam", "boil", "grill", "roast"],
      qualities: ["fresh", "nutrient-dense", "versatile"],
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["nutty", "earthy"],
          secondary: ["sweet", "mineral"],
          notes: "Subtly sweet and nutty; cut surfaces oxidize and brown quickly.",
        },
        cookingMethods: ["steam", "braise", "grill", "boil"],
        cuisineAffinity: ["Italian", "French", "Mediterranean"],
        preparationTips: [
          "Snap off the tough outer leaves and trim the spiky tips and stem.",
          "Rub every cut surface with lemon to stop it browning.",
          "Scoop out the fuzzy inner choke before cooking or serving.",
        ],
      }
},
  cucumber: {
      image_url: "ingredients/cucumber.png",
    description: "A cylindrical, water-dense fruit (*Cucumis sativus*) eaten as a culinary vegetable. Composed of over 95% water, cucumbers provide essential crispness, hydration, and a cooling, melon-like aroma to salads, cold soups, and pickles. English and Persian varieties are bred to have thin, edible skins and fewer seeds, whereas standard slicing cucumbers have thicker, waxy skins that often benefit from peeling. Salting them before use draws out excess water and concentrates their flavor.",
    name: "cucumber",
    origin: ["South Asia (India)"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.8,
      Earth: 0.05,
      Air: 0.05,
    },
    alchemicalProperties: {
      Spirit: 0.08,
      Essence: 0.43,
      Matter: 0.28,
      Substance: 0.21,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "pisces", "taurus", "capricorn"],
    },
    category: "vegetable",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 0.6, carbs: 2.2, fiber: 0.7 },
      calories: 12,
        vitamins: {},
        minerals: {}
    },
    season: ["summer"],
    cookingMethods: ["raw", "pickle"],
      qualities: ["fresh", "nutrient-dense", "versatile"],
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["fresh", "watery"],
          secondary: ["grassy", "mild"],
          notes: "Cool and crisp; mostly water, so it favors raw and quick preparations.",
        },
        cookingMethods: ["raw", "pickle", "quick-saute"],
        cuisineAffinity: ["Mediterranean", "Middle-Eastern", "Asian"],
        preparationTips: [
          "Peel if the skin is waxed or thick; leave it on for color and crunch.",
          "Halve lengthwise and scoop out the seeds when you want less water.",
          "Slice, salt, and drain 15 minutes before dressing for crisp salads.",
        ],
      }
},
  okra: {
      image_url: "ingredients/okra.png",
    description: "A warm-season vegetable (*Abelmoschus esculentus*) known for its edible green seed pods. It is famous (or infamous) for its mucilaginous interior, which naturally thickens complex stews like gumbo; high-heat applications like deep-frying or roasting effectively eliminate this slick texture while retaining a mild, grassy flavor.",
    name: "okra",
    origin: ["Africa (Ethiopia region)"],
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1,
    },
    alchemicalProperties: {
      Spirit: 0.16,
      Essence: 0.23,
      Matter: 0.37,
      Substance: 0.24,
    },
    category: "vegetable",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 1.9, carbs: 7.5, fiber: 3.2 },
      calories: 33,
        vitamins: {},
        minerals: {}
    },
    season: ["summer"],
    cookingMethods: ["fry", "saute", "stew", "roast"],
      qualities: ["fresh", "nutrient-dense", "versatile"],
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["grassy", "mild"],
          secondary: ["earthy", "green"],
          notes: "Releases a thickening mucilage when cut and stewed; high, dry heat keeps it crisp.",
        },
        cookingMethods: ["fry", "roast", "grill", "stew"],
        cuisineAffinity: ["Southern-US", "Indian", "African", "Cajun"],
        preparationTips: [
          "Keep the pods whole or cut them large to limit the slippery texture.",
          "Pat the pods completely dry; surface moisture increases sliminess.",
          "Cook hot and fast — roast, grill, or fry — or pair with acid like tomato.",
        ],
      }
},
  zucchini: {
      image_url: "ingredients/zucchini.png",
    description: "A fast-growing summer squash (*Cucurbita pepo*) with a thin, edible dark green skin and high water content. Its mild, slightly sweet flavor makes it highly versatile, suitable for raw ribbons in salads, quick sautéing, or baking into moist breads.",
    name: "zucchini",
    origin: ["Mesoamerica", "Italy (modern variety)"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.7,
      Earth: 0.1,
      Air: 0.1,
    },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.38,
      Matter: 0.28,
      Substance: 0.24,
    },
    category: "vegetable",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 1.2, carbs: 3.1, fiber: 1.0 },
      calories: 17,
        vitamins: {},
        minerals: {}
    },
    season: ["summer"],
    cookingMethods: ["saute", "grill", "roast", "steam"],
      qualities: ["fresh", "nutrient-dense", "versatile"],
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["mild", "fresh"],
          secondary: ["grassy", "delicate"],
          notes: "Delicate and watery; high heat keeps it from turning soggy.",
        },
        cookingMethods: ["saute", "grill", "roast", "raw", "spiralize"],
        cuisineAffinity: ["Italian", "Mediterranean", "French"],
        preparationTips: [
          "Trim both ends; there is no need to peel it.",
          "Cut into even coins, half-moons, or planks, then salt and blot to shed water.",
          "Cook quickly over high heat to avoid a mushy texture.",
        ],
      }
},
  fennel: {
      image_url: "ingredients/fennel.png",
    description: "A bulbous, layered vegetable (*Foeniculum vulgare*) of the carrot family with feathery fronds. It offers a crisp texture and a sweet, distinctively anise or licorice-like flavor that mellows and caramelizes beautifully when braised or roasted, pairing exceptionally well with seafood.",
    name: "fennel",
    origin: ["Mediterranean"],
    elementalProperties: {
      Fire: 0.1,
      Water: 0.3,
      Earth: 0.25,
      Air: 0.35,
    },
    alchemicalProperties: {
      Spirit: 0.20,
      Essence: 0.23,
      Matter: 0.27,
      Substance: 0.30,
    },
    category: "vegetable",
    subCategory: "other",
    nutritionalProfile: {
      macros: { protein: 1.2, carbs: 7.3, fiber: 3.1 },
      calories: 31,
        vitamins: {},
        minerals: {}
    },
    season: ["fall", "winter", "spring"],
    cookingMethods: ["roast", "saute", "raw", "braise"],
      qualities: ["fresh", "nutrient-dense", "versatile"],
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." },
      culinaryProfile: {
        flavorProfile: {
          primary: ["anise", "sweet"],
          secondary: ["fresh", "licorice"],
          notes: "Crisp and anise-like raw; roasting mellows it into a soft, gentle sweetness.",
        },
        cookingMethods: ["raw", "roast", "braise", "grill"],
        cuisineAffinity: ["Italian", "Mediterranean", "French"],
        preparationTips: [
          "Trim the stalks and base, and reserve the feathery fronds as a herb.",
          "Halve through the core and slice thin against the grain for salads.",
          "Cut into wedges through the core so they hold together when roasted.",
        ],
      }
},
  celery: {
      image_url: "ingredients/celery.png",
    description: "A crunchy, fibrous marshland plant (*Apium graveolens*) known for its high water content and distinctively vegetal, slightly salty flavor. As a core component of the classic French mirepoix and Cajun holy trinity, it provides essential aromatic depth to stocks, soups, and braises.",
    name: "celery",
    origin: ["Mediterranean"],
    season: ["summer", "fall"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.15,
      Essence: 0.28,
      Matter: 0.31,
      Substance: 0.26,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  peas: {
      image_url: "ingredients/peas.png",
    description: "Small, spherical, sweet seeds (*Pisum sativum*) grown inside a pod. Garden peas (or English peas) are shelled for their starchy, incredibly sweet interior, which degrades rapidly into bland starches after picking, making frozen peas generally superior to out-of-season fresh ones.\n\n**Selection & Storage:** For fresh peas, choose firm, bright green, and plump pods. Keep unwashed pods in a perforated plastic bag in the refrigerator and shell them immediately before use.",
    name: "peas",
    origin: ["Mediterranean"],
    season: ["spring"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.22,
      Matter: 0.34,
      Substance: 0.30,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  fresh_peas: {
      image_url: "ingredients/fresh_peas.png",
    description: "Small, spherical, sweet seeds (*Pisum sativum*) grown inside a pod. Garden peas (or English peas) are shelled for their starchy, incredibly sweet interior, which degrades rapidly into bland starches after picking, making frozen peas generally superior to out-of-season fresh ones.\n\n**Selection & Storage:** For fresh peas, choose firm, bright green, and plump pods. Keep unwashed pods in a perforated plastic bag in the refrigerator and shell them immediately before use.",
    name: "fresh peas",
    origin: ["Mediterranean"],
    season: ["spring"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.24,
      Matter: 0.33,
      Substance: 0.29,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  sweet_corn: {
      image_url: "ingredients/sweet_corn.png",
    description: "A large grain plant (*Zea mays*) primarily consumed as a sweet vegetable when picked young (sweet corn). Its kernels are packed with natural sugars that immediately begin converting to complex starches upon harvesting, which is why fresh, seasonal corn has an unparalleled, milky sweetness.\n\n**Selection & Storage:** Look for husks that are bright green and tightly wrapped, with pale, slightly sticky silk. Eat as soon as possible after purchasing, storing unhusked in the refrigerator in the meantime.",
    name: "sweet corn",
    origin: ["Mesoamerica"],
    season: ["summer"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.22,
      Matter: 0.34,
      Substance: 0.30,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  corn_on_the_cob: {
      image_url: "ingredients/corn_on_the_cob.png",
    description: "A large grain plant (*Zea mays*) primarily consumed as a sweet vegetable when picked young (sweet corn). Its kernels are packed with natural sugars that immediately begin converting to complex starches upon harvesting, which is why fresh, seasonal corn has an unparalleled, milky sweetness.\n\n**Selection & Storage:** Look for husks that are bright green and tightly wrapped, with pale, slightly sticky silk. Eat as soon as possible after purchasing, storing unhusked in the refrigerator in the meantime.",
    name: "corn on the cob",
    origin: ["Mesoamerica"],
    season: ["summer"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.22,
      Matter: 0.34,
      Substance: 0.30,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  green_beans: {
      image_url: "ingredients/green_beans.png",
    description: "Also known as string beans or snap beans (*Phaseolus vulgaris*), these are unripe, tender pods enclosing small, immature seeds. They have a fresh, grassy sweetness and a firm snap that is best preserved through quick cooking methods like blanching or stir-frying.\n\n**Selection & Storage:** Look for vibrant green beans that snap cleanly when bent. Store them unwashed in a plastic bag or container in the crisper drawer for up to a week.",
    name: "green beans",
    origin: ["Central and South America"],
    season: ["summer"],
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.15,
      Essence: 0.26,
      Matter: 0.32,
      Substance: 0.27,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetable",
    subcategory: "other",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "taurus", "capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  bean_sprouts: {
    image_url: "ingredients/bean_sprouts.png",
    description: "Crisp, pale shoots germinated from mung beans (*Vigna radiata*), harvested within days of sprouting. Sprouting converts the bean's starches into simpler sugars and boosts vitamin C, giving a juicy, snappy texture with a clean, faintly nutty flavor. Essential in pad thai, spring rolls, pho garnishes, and stir-fries — add in the final moments of cooking so they keep their crunch. Choose plump white sprouts with pale tips; avoid slimy or browning ones and use within a couple of days.",
    name: "Bean Sprouts",
    aliases: ["mung bean sprouts", "beansprouts"],
    origin: ["East Asia", "Southeast Asia"],
    season: ["spring", "summer", "fall", "winter"],
    elementalProperties: { Fire: 0.05, Water: 0.45, Earth: 0.2, Air: 0.3 },
    qualities: ["crisp", "fresh", "light", "hydrating"],
    category: "vegetable",
    subcategory: "sprout",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "gemini", "virgo"],
      seasonalAffinity: ["spring"],
    },
      sensoryProfile: { taste: { sweet: 0.15, salty: 0.0, sour: 0.05, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.6, grassy: 0.4, fresh: 0.5 }, texture: { crisp: 0.9, juicy: 0.6, tender: 0.2 } },
      nutritionalProfile: { serving_size: "1 cup (104g)", calories: 31, macros: { protein: 3.2, carbs: 6.2, fat: 0.2, fiber: 1.9 }, vitamins: { C: 0.15, K: 0.29, folate: 0.16 }, minerals: { copper: 0.09, manganese: 0.1, potassium: 0.05 }, source: "USDA FoodData Central" },
      culinaryProfile: { flavorProfile: { primary: ["fresh", "vegetal"], secondary: ["nutty", "sweet"], notes: "Prized for texture more than flavor; wilts in seconds over high heat." }, cookingMethods: ["stir-fry", "blanch", "raw", "steam"], cuisineAffinity: ["Chinese", "Thai", "Vietnamese", "Korean", "Japanese"], preparationTips: ["Rinse well and drain thoroughly before stir-frying.", "Add in the last 30-60 seconds of cooking to preserve crunch.", "Blanch briefly and shock in ice water for salads and garnishes."] },
      pairingRecommendations: { complementary: ["soy sauce", "garlic", "ginger", "scallions", "sesame oil", "rice noodles"], contrasting: ["chili", "lime", "peanuts"], toAvoid: [] },
      storage: { refrigerated: "1-2 days in a breathable container.", notes: "Highly perishable; buy close to use and keep cold." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const _otherVegetables: Record<string, IngredientMapping> =
  fixIngredientMappings(rawOtherVegetables);

export const otherVegetables = _otherVegetables;
