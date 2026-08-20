import type { IngredientMapping } from "@/data/ingredients/types";

/**
 * Cooking staples — stocks, broths, and pantry liquids/binders that recipes
 * reference constantly but were absent from the unified catalog, capping recipe
 * nutrition coverage and ESMS `matchRate`.
 *
 * Every entry is real, curated data: a sensible (non-uniform) elemental
 * signature so `deriveAlchemicalFromElemental` produces real ESMS, a real
 * per-serving `nutritionalProfile` (USDA-aligned; `fish sauce` and `beef stock`
 * carry the values previously stranded in the orphaned `proteins.ts` monolith),
 * and a real description. Wired into `unifiedIngredients` and the
 * `UnifiedIngredientService` cache.
 */
export const cookingStaples: Record<string, Partial<IngredientMapping>> = {
  fish_sauce: {
    name: "fish sauce",
    category: "seasoning",
    provenance: "manual",
    origin: ["Southeast Asia"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/fish_sauce.png",
    description:
      "An amber-colored liquid condiment derived from fish (usually anchovies) salted and fermented for up to two years. It delivers an intense, pungent burst of pure umami and salt that mellows into deep savory backbone when cooked into Southeast Asian curries, dressings, and stir-fries.",
    elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ["umami", "salty", "pungent", "fermented"],
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["cancer", "pisces"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp (18g)",
      calories: 6,
      macros: { protein: 0.9, carbs: 0.7, fat: 0, fiber: 0, sugar: 0.7, sodium: 1400 },
      source: "USDA",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.8, sour: 0.0, bitter: 0.0, umami: 0.9, spicy: 0.0 },
      aroma: { warm: 0.3, earthy: 0.4, pungent: 0.8, savory: 0.9, fishy: 0.7 },
      texture: { liquid: 0.9 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["umami", "salty"],
        secondary: ["savory"],
        notes: "Provides instant savory depth. Bloom in fat or stir into sauces; smell dissipates when heated."
      },
      cookingMethods: ["stir-fry", "simmer", "finish"],
      cuisineAffinity: ["Southeast Asian", "Vietnamese", "Thai"],
      preparationTips: [
        "Use sparingly; a small amount provides a massive umami boost.",
        "Add at the end of stir-fries to retain bright salinity."
      ]
    },
    pairingRecommendations: {
      complementary: ["lime", "chili", "sugar", "garlic", "cilantro", "ginger"],
      contrasting: ["dairy"],
      toAvoid: []
    },
    storage: {
      pantry: "Store in a cool, dark pantry. Keeps indefinitely due to high salt content.",
      notes: "Salt crystals may form over time, which is normal."
    }
  },
  chicken_stock: {
    name: "chicken stock",
    category: "protein",
    provenance: "manual",
    origin: ["Worldwide"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/chicken_stock.png",
    description:
      "A savory liquid simmered from chicken bones, aromatics, and water. Richer and more gelatinous than broth thanks to collagen extracted from the bones, it forms the base of countless soups, braises, risottos, and pan sauces.",
    elementalProperties: { Water: 0.5, Earth: 0.2, Fire: 0.2, Air: 0.1 },
    qualities: ["savory", "nourishing", "base"],
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Jupiter"],
      favorableZodiac: ["cancer", "pisces"],
      seasonalAffinity: ["fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 86,
      macros: { protein: 6, carbs: 8.5, fat: 2.9, fiber: 0, sodium: 343 },
      source: "USDA (home-prepared)",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.3, sour: 0.0, bitter: 0.0, umami: 0.6, spicy: 0.0 },
      aroma: { warm: 0.4, savory: 0.7, meaty: 0.6 },
      texture: { liquid: 0.8 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory"],
        secondary: ["meaty"],
        notes: "Forms a rich, supportive background body for soups and reductions."
      },
      cookingMethods: ["simmer", "reduction", "braise"],
      cuisineAffinity: ["European", "American", "Asian"],
      preparationTips: [
        "Reduce to concentrate body and gelatin.",
        "Skim fat if a clean appearance is needed."
      ]
    },
    pairingRecommendations: {
      complementary: ["carrot", "celery", "onion", "thyme", "parsley", "garlic"],
      contrasting: ["heavy acid"],
      toAvoid: []
    },
    storage: {
      pantry: "Unopened canned/cartoned stock stores in pantry 1-2 years.",
      notes: "Once opened, refrigerate and use within 4-5 days, or freeze."
    }
  },
  chicken_broth: {
    name: "chicken broth",
    category: "protein",
    provenance: "manual",
    origin: ["Worldwide"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/chicken_broth.png",
    description:
      "A light, seasoned liquid simmered from chicken meat and aromatics. Thinner and more delicately flavored than stock, it is used as a cooking liquid, soup base, and a low-fat way to add savory depth.",
    elementalProperties: { Water: 0.55, Earth: 0.15, Fire: 0.2, Air: 0.1 },
    qualities: ["savory", "light", "base"],
    astrologicalProfile: {
      rulingPlanets: ["Moon"],
      favorableZodiac: ["cancer"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 38,
      macros: { protein: 5, carbs: 3, fat: 1.3, fiber: 0, sodium: 860 },
      source: "USDA (ready-to-serve)",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.4, sour: 0.0, bitter: 0.0, umami: 0.5, spicy: 0.0 },
      aroma: { warm: 0.3, savory: 0.6, herbal: 0.3 },
      texture: { liquid: 0.9 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory", "salty"],
        secondary: ["light"],
        notes: "Delivers flavor with less gelatin/body than stock."
      },
      cookingMethods: ["simmer", "boil"],
      cuisineAffinity: ["European", "American"],
      preparationTips: [
        "Use as a direct base for quick soups.",
        "Great for boiling grains to add extra flavor."
      ]
    },
    pairingRecommendations: {
      complementary: ["ginger", "scallions", "rice", "noodles", "lemon"],
      contrasting: [],
      toAvoid: []
    },
    storage: {
      pantry: "Store unopened in pantry up to 1 year.",
      notes: "Refrigerate opened broth and use within 7 days."
    }
  },
  beef_stock: {
    name: "beef stock",
    category: "protein",
    provenance: "manual",
    origin: ["Worldwide pastoral cultures"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/beef_stock.png",
    description:
      "A deeply savory liquid simmered from roasted beef bones, aromatics, and water. Long extraction of collagen and marrow yields a rich, gelatinous base for stews, gravies, French onion soup, and braises.",
    elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
    qualities: ["savory", "rich", "nourishing", "base"],
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["aries", "taurus", "capricorn"],
      seasonalAffinity: ["fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 31,
      macros: { protein: 4.7, carbs: 2.8, fat: 0.2, fiber: 0, sodium: 475 },
      source: "USDA (home-prepared)",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.3, sour: 0.0, bitter: 0.1, umami: 0.8, spicy: 0.0 },
      aroma: { warm: 0.4, earthy: 0.3, roasted: 0.8, meaty: 0.8 },
      texture: { liquid: 0.8 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory", "roasted"],
        secondary: ["rich"],
        notes: "A heavy, robust background body that stands up to red wine and strong herbs."
      },
      cookingMethods: ["simmer", "reduction", "braise"],
      cuisineAffinity: ["French", "Western"],
      preparationTips: [
        "Roast bones deeply before simmering to build color and flavor.",
        "Reduce heavily for demiglace."
      ]
    },
    pairingRecommendations: {
      complementary: ["red wine", "thyme", "rosemary", "onion", "mushrooms", "beef"],
      contrasting: ["citrus"],
      toAvoid: []
    },
    storage: {
      pantry: "Store unopened in pantry up to 1-2 years.",
      notes: "Refrigerate opened stock and use within 4-5 days."
    }
  },
  beef_broth: {
    name: "beef broth",
    category: "protein",
    provenance: "manual",
    origin: ["Worldwide"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/beef_broth.png",
    description:
      "A light, seasoned beef liquid, thinner than stock. Used as a cooking liquid and soup base where a clean beef savor is wanted without the body of a long-simmered stock.",
    elementalProperties: { Earth: 0.35, Fire: 0.3, Water: 0.25, Air: 0.1 },
    qualities: ["savory", "light", "base"],
    astrologicalProfile: {
      rulingPlanets: ["Mars"],
      favorableZodiac: ["aries", "capricorn"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 17,
      macros: { protein: 2.7, carbs: 0.1, fat: 0.5, fiber: 0, sodium: 893 },
      source: "USDA (ready-to-serve)",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.4, sour: 0.0, bitter: 0.0, umami: 0.6, spicy: 0.0 },
      aroma: { warm: 0.3, meaty: 0.6 },
      texture: { liquid: 0.9 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["savory"],
        secondary: ["light-meaty"],
        notes: "Provides beefy notes without heavy mouthfeel."
      },
      cookingMethods: ["simmer", "deglaze"],
      cuisineAffinity: ["Western", "Asian"],
      preparationTips: [
        "Perfect for deglazing pans after searing beef.",
        "Use to thin out heavy stews."
      ]
    },
    pairingRecommendations: {
      complementary: ["soy sauce", "garlic", "shallot", "sherry", "black pepper"],
      contrasting: [],
      toAvoid: []
    },
    storage: {
      pantry: "Store unopened in pantry up to 1 year.",
      notes: "Refrigerate opened broth and use within 5-7 days."
    }
  },
  dashi_stock: {
    name: "dashi stock",
    category: "seasoning",
    provenance: "manual",
    origin: ["Japan"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/dashi_stock.png",
    description:
      "The foundational Japanese stock, infused from kombu (kelp) and katsuobushi (bonito flakes). Clean, light, and intensely umami, it underpins miso soup, simmered dishes, noodle broths, and sauces.",
    elementalProperties: { Water: 0.55, Earth: 0.2, Fire: 0.15, Air: 0.1 },
    qualities: ["umami", "light", "base"],
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["cancer", "pisces"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (240ml)",
      calories: 12,
      macros: { protein: 1.3, carbs: 1.4, fat: 0, fiber: 0, sodium: 705 },
      source: "USDA approximate",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.3, sour: 0.0, bitter: 0.0, umami: 0.9, spicy: 0.0 },
      aroma: { warm: 0.2, smoky: 0.6, "sea-like": 0.5 },
      texture: { liquid: 0.9 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["umami", "sea-like"],
        secondary: ["smoky"],
        notes: "A highly delicate, savory base that highlights rather than masks ingredients."
      },
      cookingMethods: ["simmer", "steep"],
      cuisineAffinity: ["Japanese"],
      preparationTips: [
        "Do not boil kombu, or it will become slimy.",
        "Steep katsuobushi briefly and strain immediately."
      ]
    },
    pairingRecommendations: {
      complementary: ["miso", "soy sauce", "mirin", "sake", "scallions", "tofu"],
      contrasting: ["strong dairy"],
      toAvoid: []
    },
    storage: {
      pantry: "Dry ingredients (kombu/bonito) store in pantry indefinitely.",
      notes: "Prepared dashi keeps in the refrigerator for up to 3 days, or freeze."
    }
  },
  panko: {
    name: "panko",
    category: "grain",
    provenance: "manual",
    origin: ["Japan"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/panko.png",
    description:
      "Japanese-style breadcrumbs made from crustless white bread, coarse and flaky. They fry up exceptionally light and crisp, used for katsu, croquettes, and crunchy gratin and casserole toppings.",
    elementalProperties: { Earth: 0.45, Air: 0.3, Fire: 0.15, Water: 0.1 },
    qualities: ["crisp", "dry", "neutral"],
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["virgo", "capricorn"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup (15g)",
      calories: 55,
      macros: { protein: 1.8, carbs: 11, fat: 0.4, fiber: 0.5, sodium: 100 },
      source: "USDA approximate",
    },
    sensoryProfile: {
      taste: { sweet: 0.1, salty: 0.1, sour: 0.0, bitter: 0.0, umami: 0.0, spicy: 0.0 },
      aroma: { bready: 0.4, neutral: 0.6 },
      texture: { dry: 0.9, crunchy: 0.9 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["neutral"],
        secondary: ["crispy"],
        notes: "Provides texture and crunch without adding distinct flavor."
      },
      cookingMethods: ["fry", "bake", "toast"],
      cuisineAffinity: ["Japanese", "Modern Western"],
      preparationTips: [
        "Press onto food firmly before frying to ensure adherence.",
        "Mix with melted butter before baking for gratin toppings."
      ]
    },
    pairingRecommendations: {
      complementary: ["oil", "butter", "cheese", "herbs", "chicken", "seafood"],
      contrasting: ["wet sauce (soggies)"],
      toAvoid: []
    },
    storage: {
      pantry: "Store in a cool, dry pantry in an airtight container.",
      notes: "Keep dry; humidity ruins the crispy texture."
    }
  },
  brown_rice_syrup: {
    name: "brown rice syrup",
    category: "seasoning",
    provenance: "manual",
    origin: ["East Asia"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/brown_rice_syrup.png",
    description:
      "A thick, mild sweetener made by fermenting cooked brown rice to break its starches into sugars. Less sweet than honey with a gentle butterscotch note, used in granola bars, baking, and glazes.",
    elementalProperties: { Earth: 0.4, Water: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ["sweet", "mild", "sticky"],
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Jupiter"],
      favorableZodiac: ["taurus", "libra"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp (21g)",
      calories: 55,
      macros: { protein: 0.1, carbs: 14, fat: 0, fiber: 0, sugar: 11 },
      source: "USDA approximate",
    },
    sensoryProfile: {
      taste: { sweet: 0.6, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.0, spicy: 0.0 },
      aroma: { warm: 0.3, nutty: 0.4, sweet: 0.5 },
      texture: { sticky: 0.9 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["sweet"],
        secondary: ["toasty"],
        notes: "Provides a slow-burning sweetness with a high viscosity ideal for binding."
      },
      cookingMethods: ["mix", "bake", "glaze"],
      cuisineAffinity: ["East Asian", "Macrobiotic", "Health Food"],
      preparationTips: [
        "Warm slightly to make pouring and mixing easier.",
        "Use as a vegan alternative to honey or corn syrup."
      ]
    },
    pairingRecommendations: {
      complementary: ["soy sauce", "ginger", "sesame", "nuts", "oats"],
      contrasting: ["acid"],
      toAvoid: []
    },
    storage: {
      pantry: "Store in a cool, dark pantry. Keeps for 1-2 years.",
      notes: "Do not refrigerate, as it will crystallize and become impossible to pour."
    }
  },
  agave_syrup: {
    name: "agave syrup",
    aliases: ["agave"],
    category: "seasoning",
    provenance: "manual",
    origin: ["Mexico"],
    season: ["spring", "summer", "fall", "winter"],
    image_url: "ingredients/agave_syrup.png",
    description:
      "A thin, fast-dissolving sweetener pressed and filtered from the agave plant (agave nectar). Sweeter than sugar with a neutral flavor, it dissolves readily in cold drinks, dressings, and baking.",
    elementalProperties: { Water: 0.4, Earth: 0.3, Fire: 0.2, Air: 0.1 },
    qualities: ["sweet", "neutral", "liquid"],
    astrologicalProfile: {
      rulingPlanets: ["Venus"],
      favorableZodiac: ["taurus", "libra"],
      seasonalAffinity: ["spring", "summer", "fall", "winter"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp (21g)",
      calories: 60,
      macros: { protein: 0, carbs: 16, fat: 0, fiber: 0, sugar: 14 },
      source: "USDA",
    },
    sensoryProfile: {
      taste: { sweet: 0.8, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.0, spicy: 0.0 },
      aroma: { neutral: 0.6, sweet: 0.4 },
      texture: { liquid: 0.6 }
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["sweet"],
        secondary: ["neutral"],
        notes: "A highly soluble sweetener with a low glycemic index and clean sweet profile."
      },
      cookingMethods: ["mix", "shake", "bake"],
      cuisineAffinity: ["Mexican", "Modern Western"],
      preparationTips: [
        "Ideal for sweetening cold beverages and cocktails.",
        "Reduce oven temperature by 25°F when baking with agave to prevent over-browning."
      ]
    },
    pairingRecommendations: {
      complementary: ["lime", "lemon", "tequila", "berries", "mint", "fruit"],
      contrasting: [],
      toAvoid: []
    },
    storage: {
      pantry: "Store in a cool, dark pantry. Keeps for 2 years.",
      notes: "Wipe the cap threads to prevent the lid from sticking."
    }
  },
  stock: {
    "name": "stock",
    "aliases": [
      "stock",
      "cooking stock",
      "6 cups stock",
      "cups stock",
      "vegetable stock",
      "court bouillon"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Worldwide"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/stock.png",
    "description": "A foundational culinary liquid prepared by gently simmering bones, meat, or vegetables with aromatics and herbs. It supplies a savory backbone, rich mouthfeel, and balanced moisture to soups, sauces, grains, and braises.",
    "elementalProperties": {
      "Water": 0.5,
      "Earth": 0.25,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "savory",
      "nourishing",
      "foundational",
      "versatile"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Jupiter"
      ],
      "favorableZodiac": [
        "cancer",
        "pisces",
        "taurus"
      ],
      "seasonalAffinity": [
        "fall",
        "winter",
        "spring",
        "summer"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup (240ml)",
      "calories": 20,
      "macros": {
        "protein": 2,
        "carbs": 2,
        "fat": 0.5,
        "fiber": 0,
        "sodium": 450
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0.3,
        "sour": 0,
        "bitter": 0,
        "umami": 0.6,
        "spicy": 0
      },
      "aroma": {
        "warm": 0.4,
        "savory": 0.7,
        "herbal": 0.3
      },
      "texture": {
        "liquid": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "savory"
        ],
        "secondary": [
          "umami",
          "herbal"
        ],
        "notes": "Provides essential depth and body without overwhelming headline ingredients."
      },
      "cookingMethods": [
        "simmer",
        "braise",
        "reduce",
        "deglaze"
      ],
      "cuisineAffinity": [
        "European",
        "American",
        "Asian",
        "Global"
      ],
      "preparationTips": [
        "Simmer gently without boiling to keep the liquid clear.",
        "Skim any impurities from the surface during early cooking."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "onion",
        "carrot",
        "celery",
        "thyme",
        "garlic",
        "bay leaf"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store unopened stock in a cool, dry pantry for up to 1-2 years.",
      "notes": "Refrigerate after opening and use within 4-5 days, or freeze."
    }
  },

  sherry: {
    "name": "sherry",
    "aliases": [
      "sherry",
      "dry sherry",
      "cooking sherry",
      "fino sherry",
      "oloroso sherry",
      "sherry wine"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Jerez, Spain"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/sherry.png",
    "description": "A fortified Spanish wine from Jerez produced under a protective veil of flor yeast or through oxidative barrel aging. It delivers dry, nutty, savory, and brine-like complexity that cuts through rich meats and mushrooms.",
    "elementalProperties": {
      "Fire": 0.35,
      "Water": 0.35,
      "Earth": 0.15,
      "Air": 0.15
    },
    "qualities": [
      "nutty",
      "complex",
      "savory",
      "warming"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Jupiter"
      ],
      "favorableZodiac": [
        "sagittarius",
        "leo",
        "aries"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 fl oz (60ml)",
      "calories": 75,
      "macros": {
        "protein": 0.2,
        "carbs": 2.5,
        "fat": 0,
        "fiber": 0,
        "sugar": 1,
        "sodium": 5
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.15,
        "salty": 0.1,
        "sour": 0.25,
        "bitter": 0.1,
        "umami": 0.3,
        "spicy": 0
      },
      "aroma": {
        "nutty": 0.8,
        "oxidized": 0.7,
        "fruity": 0.4,
        "warm": 0.6
      },
      "texture": {
        "liquid": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "nutty",
          "oxidized"
        ],
        "secondary": [
          "tangy",
          "yeasty"
        ],
        "notes": "Deglazing pan drippings with dry sherry unlocks aromatic caramelized fond."
      },
      "cookingMethods": [
        "deglaze",
        "flambe",
        "simmer",
        "macerate"
      ],
      "cuisineAffinity": [
        "Spanish",
        "French",
        "British",
        "Modern Western"
      ],
      "preparationTips": [
        "Use drinkable dry fino or oloroso rather than sodium-laden cooking sherry.",
        "Add early in cooking to burn off raw alcohol while preserving aroma."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "mushrooms",
        "shallots",
        "butter",
        "chicken liver",
        "walnuts",
        "pork"
      ],
      "contrasting": [
        "cream"
      ],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store unopened bottles in a cool, dark place.",
      "refrigerated": "Keep opened dry sherry tightly capped in the refrigerator up to 1 month.",
      "notes": "Fino oxidizes quickly; use promptly once uncorked."
    }
  },

  brandy: {
    "name": "brandy",
    "aliases": [
      "brandy",
      "cognac",
      "armagnac",
      "brandy or rum"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "France",
      "Western Europe"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/brandy.png",
    "description": "A distilled spirit produced by concentrating fermented grape wine or fruit mash and maturing it in oak casks. It imparts resonant notes of dried fruit, vanilla, toasted wood, and mellow warmth to desserts, pan sauces, and pâtés.",
    "elementalProperties": {
      "Fire": 0.5,
      "Air": 0.25,
      "Water": 0.15,
      "Earth": 0.1
    },
    "qualities": [
      "warming",
      "aromatic",
      "spirituous",
      "rich"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Mars"
      ],
      "favorableZodiac": [
        "leo",
        "aries",
        "sagittarius"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 fl oz (30ml)",
      "calories": 65,
      "macros": {
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0.05,
        "bitter": 0.05,
        "umami": 0,
        "spicy": 0.2
      },
      "aroma": {
        "warm": 0.8,
        "oaked": 0.7,
        "fruity": 0.6,
        "boozy": 0.8
      },
      "texture": {
        "liquid": 0.85
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "oaked",
          "spirituous"
        ],
        "secondary": [
          "dried fruit",
          "vanilla"
        ],
        "notes": "Flambéing burns off high alcohol while concentrating barrel-aged esters."
      },
      "cookingMethods": [
        "flambe",
        "deglaze",
        "infuse",
        "macerate"
      ],
      "cuisineAffinity": [
        "French",
        "European",
        "American"
      ],
      "preparationTips": [
        "Remove pan from heat source before adding brandy to flambé safely.",
        "Simmer until alcohol aroma softens into rounded caramel warmth."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "butter",
        "heavy cream",
        "apples",
        "peaches",
        "dark chocolate",
        "beef",
        "peppercorns"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store upright in a cool, dark liquor cabinet indefinitely.",
      "notes": "High proof prevents spoilage indefinitely."
    }
  },

  grand_marnier: {
    "name": "grand marnier",
    "aliases": [
      "grand marnier",
      "orange liqueur",
      "triple sec",
      "curacao"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "France"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/grand_marnier.png",
    "description": "A premium French liqueur crafted from Cognac brandy blended with distilled essence of bitter Caribbean oranges (Citrus bigaradia) and sugar. It contributes sophisticated citrus perfume and Cognac depth to crêpes Suzette, soufflés, and fruit glazes.",
    "elementalProperties": {
      "Fire": 0.45,
      "Air": 0.25,
      "Water": 0.2,
      "Earth": 0.1
    },
    "qualities": [
      "citrusy",
      "sweet",
      "warming",
      "luxurious"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Venus"
      ],
      "favorableZodiac": [
        "leo",
        "taurus",
        "libra"
      ],
      "seasonalAffinity": [
        "winter",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 fl oz (30ml)",
      "calories": 100,
      "macros": {
        "protein": 0,
        "carbs": 6.5,
        "fat": 0,
        "fiber": 0,
        "sugar": 6.5,
        "sodium": 1
      },
      "source": "USDA approximate"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.7,
        "salty": 0,
        "sour": 0.1,
        "bitter": 0.1,
        "umami": 0,
        "spicy": 0.1
      },
      "aroma": {
        "citrus": 0.9,
        "orange": 0.9,
        "warm": 0.7,
        "cognac": 0.6
      },
      "texture": {
        "syrupy": 0.6,
        "liquid": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "bitter orange",
          "sweet"
        ],
        "secondary": [
          "cognac",
          "vanilla"
        ],
        "notes": "Combines bright orange zest brightness with the amber depth of aged Cognac."
      },
      "cookingMethods": [
        "flambe",
        "macerate",
        "glaze",
        "bake"
      ],
      "cuisineAffinity": [
        "French",
        "Continental"
      ],
      "preparationTips": [
        "The quintessential flambé liqueur for crêpes Suzette.",
        "Add a splash to macerating berries or custard bases for fragrant citrus lift."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "orange",
        "chocolate",
        "berries",
        "butter",
        "crepes",
        "duck"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store sealed in a cool, dark cabinet indefinitely.",
      "notes": "Wipe bottle neck after pouring to prevent sugar crystallization."
    }
  },

  madeira_wine: {
    "name": "madeira wine",
    "aliases": [
      "madeira",
      "madeira wine"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Madeira Islands, Portugal"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/madeira_wine.png",
    "description": "A fortified Portuguese wine subjected to estufagem heating and oxidation. Its indestructible flavor profile features roasted nuts, caramel, dried figs, and searing acidity, creating legendary demi-glace and mushroom pan sauces.",
    "elementalProperties": {
      "Fire": 0.35,
      "Water": 0.35,
      "Earth": 0.2,
      "Air": 0.1
    },
    "qualities": [
      "caramelized",
      "rich",
      "tangy",
      "nutty"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Saturn"
      ],
      "favorableZodiac": [
        "capricorn",
        "scorpio"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 fl oz (60ml)",
      "calories": 85,
      "macros": {
        "protein": 0.2,
        "carbs": 4.5,
        "fat": 0,
        "fiber": 0,
        "sugar": 3.8,
        "sodium": 5
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.35,
        "salty": 0.05,
        "sour": 0.25,
        "bitter": 0.05,
        "umami": 0.2,
        "spicy": 0
      },
      "aroma": {
        "caramel": 0.8,
        "roasted": 0.7,
        "fig": 0.6,
        "nutty": 0.7
      },
      "texture": {
        "liquid": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "toffee",
          "roasted nut"
        ],
        "secondary": [
          "tart fruit",
          "molasses"
        ],
        "notes": "Delivers deep amber color and complex sweet-savory acidity when reduced."
      },
      "cookingMethods": [
        "deglaze",
        "reduce",
        "braise"
      ],
      "cuisineAffinity": [
        "Portuguese",
        "French",
        "British"
      ],
      "preparationTips": [
        "Reduce by half before whisking into butter or stock for sauce Madère.",
        "Practically immune to spoilage due to historical heated maturation."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "veal",
        "mushrooms",
        "shallots",
        "truffles",
        "liver pâté"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in pantry indefinitely, even after opening.",
      "notes": "Already fully oxidized; will not spoil after opening."
    }
  },

  rum: {
    "name": "rum",
    "aliases": [
      "rum",
      "dark rum",
      "light rum",
      "white rum",
      "spiced rum"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Caribbean"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/rum.png",
    "description": "A spirit distilled from fermented sugarcane juice or molasses and often aged in charred oak. It provides deep notes of brown sugar, molasses, tropical spice, and wood that elevate baking, glazes, and desserts.",
    "elementalProperties": {
      "Fire": 0.5,
      "Air": 0.25,
      "Water": 0.15,
      "Earth": 0.1
    },
    "qualities": [
      "warming",
      "sweet",
      "caramelized",
      "aromatic"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Mars"
      ],
      "favorableZodiac": [
        "leo",
        "sagittarius"
      ],
      "seasonalAffinity": [
        "summer",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 fl oz (30ml)",
      "calories": 65,
      "macros": {
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 0
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.15,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0,
        "spicy": 0.15
      },
      "aroma": {
        "molasses": 0.8,
        "vanilla": 0.6,
        "boozy": 0.7,
        "oaked": 0.6
      },
      "texture": {
        "liquid": 0.85
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "molasses",
          "toffee"
        ],
        "secondary": [
          "spice",
          "oak"
        ],
        "notes": "Imparts a rich confectionery warmth to cakes, puddings, and sticky buns."
      },
      "cookingMethods": [
        "soak",
        "flambe",
        "glaze",
        "bake"
      ],
      "cuisineAffinity": [
        "Caribbean",
        "American",
        "British"
      ],
      "preparationTips": [
        "Soak dried fruits in rum before folding into holiday cakes.",
        "Add to hot syrups to infuse warm sugarcane aroma into pastries."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "coconuts",
        "limes",
        "bananas",
        "raisins",
        "pecans",
        "cinnamon"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store indefinitely in a cool, dry pantry.",
      "notes": "Keep tightly capped."
    }
  },

  kahlua: {
    "name": "kahlua",
    "aliases": [
      "kahlua",
      "coffee liqueur"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Veracruz, Mexico"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/kahlua.png",
    "description": "A rich Mexican liqueur made from 100% Arabica coffee beans, sugarcane spirit, and vanilla. It infuses dark roasted coffee bitterness, sweet vanilla, and chocolatey richness into granitas, tiramisù, and gelatos.",
    "elementalProperties": {
      "Earth": 0.35,
      "Fire": 0.3,
      "Water": 0.25,
      "Air": 0.1
    },
    "qualities": [
      "roasted",
      "sweet",
      "dark",
      "comforting"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Venus"
      ],
      "favorableZodiac": [
        "capricorn",
        "taurus"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 fl oz (30ml)",
      "calories": 100,
      "macros": {
        "protein": 0.1,
        "carbs": 14.5,
        "fat": 0,
        "fiber": 0,
        "sugar": 14,
        "sodium": 3
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.8,
        "salty": 0,
        "sour": 0,
        "bitter": 0.3,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "coffee": 0.9,
        "vanilla": 0.7,
        "roasted": 0.8,
        "caramel": 0.6
      },
      "texture": {
        "syrupy": 0.7,
        "liquid": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "coffee",
          "sweet"
        ],
        "secondary": [
          "vanilla",
          "caramel"
        ],
        "notes": "Balances sharp coffee roastiness with smooth molasses sweetness."
      },
      "cookingMethods": [
        "soak",
        "churn",
        "drizzle",
        "blend"
      ],
      "cuisineAffinity": [
        "Mexican",
        "Italian",
        "Modern Western"
      ],
      "preparationTips": [
        "Drizzle over shaved ice for quick coffee granita.",
        "Incorporate into chocolate mousses to amplify cacao depth."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "chocolate",
        "heavy cream",
        "mascarpone",
        "espresso",
        "vanilla"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in a cool, dry pantry for up to 2 years.",
      "notes": "Wipe neck after pouring."
    }
  },

  campari: {
    "name": "campari",
    "aliases": [
      "campari",
      "red bitter"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Novara, Italy"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/campari.png",
    "description": "An iconic crimson Italian bitter apéritif infused with herbs, aromatic plants, and bitter orange peel (chinotto). Its bracing herbal bitterness and ruby hue create sophisticated balance in grapefruit granitas and sorbets.",
    "elementalProperties": {
      "Fire": 0.4,
      "Air": 0.3,
      "Water": 0.2,
      "Earth": 0.1
    },
    "qualities": [
      "bitter",
      "botanical",
      "refreshing",
      "vibrant"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Mercury"
      ],
      "favorableZodiac": [
        "aries",
        "scorpio"
      ],
      "seasonalAffinity": [
        "summer",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 fl oz (30ml)",
      "calories": 72,
      "macros": {
        "protein": 0,
        "carbs": 7.2,
        "fat": 0,
        "fiber": 0,
        "sugar": 7,
        "sodium": 0
      },
      "source": "USDA approximate"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.3,
        "salty": 0,
        "sour": 0.1,
        "bitter": 0.9,
        "umami": 0,
        "spicy": 0.1
      },
      "aroma": {
        "herbal": 0.9,
        "citrus": 0.8,
        "bitter": 0.8,
        "floral": 0.5
      },
      "texture": {
        "liquid": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "bitter",
          "herbal"
        ],
        "secondary": [
          "citrus peel",
          "sweet"
        ],
        "notes": "Intense botanical bitterness cleanses the palate and tempers sweet fruit purées."
      },
      "cookingMethods": [
        "freeze",
        "infuse",
        "macerate"
      ],
      "cuisineAffinity": [
        "Italian",
        "Mediterranean"
      ],
      "preparationTips": [
        "Pairs exceptionally with pink grapefruit juice in shaved ice granitas.",
        "Use sparingly to introduce sophisticated herbal complexity."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "grapefruit",
        "orange",
        "gin",
        "rosemary",
        "dark chocolate"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in a cool, dark cabinet indefinitely.",
      "notes": "High alcohol and bitter botanicals preserve it indefinitely."
    }
  },

  mirepoix: {
    "name": "mirepoix",
    "aliases": [
      "mirepoix",
      "soffritto"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "France"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/mirepoix.png",
    "description": "The classic French culinary aromatic trinity of diced onions, carrots, and celery gently sweated in fat (traditional 2:1:1 ratio). It establishes the foundational aromatic and flavor matrix for braises, stocks, and sauces.",
    "elementalProperties": {
      "Earth": 0.4,
      "Air": 0.25,
      "Water": 0.25,
      "Fire": 0.1
    },
    "qualities": [
      "aromatic",
      "foundational",
      "earthy",
      "sweet"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mercury",
        "Moon",
        "Saturn"
      ],
      "favorableZodiac": [
        "virgo",
        "taurus",
        "cancer"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup chopped (150g)",
      "calories": 55,
      "macros": {
        "protein": 1.5,
        "carbs": 12,
        "fat": 0.3,
        "fiber": 3,
        "sugar": 6,
        "sodium": 75
      },
      "vitamins": {
        "A": 1.2,
        "C": 0.15,
        "K": 0.3
      },
      "minerals": {
        "potassium": 0.1,
        "calcium": 0.05
      },
      "source": "USDA composite"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.4,
        "salty": 0.05,
        "sour": 0.05,
        "bitter": 0.1,
        "umami": 0.2,
        "spicy": 0.05
      },
      "aroma": {
        "allium": 0.7,
        "vegetal": 0.8,
        "sweet": 0.6,
        "earthy": 0.5
      },
      "texture": {
        "crisp": 0.6,
        "tender": 0.5
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "aromatic",
          "sweet-vegetal"
        ],
        "secondary": [
          "savory",
          "earthy"
        ],
        "notes": "Slowly sweated vegetables release natural sugars and aromatic compounds."
      },
      "cookingMethods": [
        "sweat",
        "saute",
        "simmer",
        "roast"
      ],
      "cuisineAffinity": [
        "French",
        "European",
        "American"
      ],
      "preparationTips": [
        "Cut vegetables into uniform dice to ensure even cooking rate.",
        "Sweat gently over low heat in butter or oil without browning."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "beef stock",
        "chicken stock",
        "bay leaf",
        "thyme",
        "parsley"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Pre-chopped mirepoix keeps in airtight container in fridge up to 4 days.",
      "notes": "Can be frozen for stock usage."
    }
  },

  polenta: {
    "name": "polenta",
    "aliases": [
      "polenta",
      "coarse cornmeal",
      "recipe polenta",
      "corn grits"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "Northern Italy"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/polenta.png",
    "description": "Coarsely ground yellow cornmeal cooked slowly with water, milk, or stock into a thick, velvety porridge, or cooled into firm cakes for broiling, grilling, and frying. It delivers golden sweetness and hearty rustic satisfaction.",
    "elementalProperties": {
      "Earth": 0.55,
      "Air": 0.2,
      "Water": 0.15,
      "Fire": 0.1
    },
    "qualities": [
      "comforting",
      "golden",
      "sustaining",
      "versatile"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Saturn"
      ],
      "favorableZodiac": [
        "leo",
        "taurus",
        "capricorn"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/4 cup dry (40g)",
      "calories": 140,
      "macros": {
        "protein": 3,
        "carbs": 31,
        "fat": 1,
        "fiber": 2,
        "sugar": 0.5,
        "sodium": 0
      },
      "vitamins": {
        "A": 0.05,
        "thiamin": 0.1
      },
      "minerals": {
        "iron": 0.06,
        "magnesium": 0.05
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.3,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "toasty": 0.6,
        "corn-like": 0.8,
        "buttery": 0.5
      },
      "texture": {
        "creamy": 0.8,
        "granular": 0.5,
        "dense": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "corn-sweet",
          "earthy"
        ],
        "secondary": [
          "buttery",
          "toasted"
        ],
        "notes": "Hydrates into a luxurious porridge that sets firm upon cooling."
      },
      "cookingMethods": [
        "simmer",
        "bake",
        "grill",
        "fry",
        "broil"
      ],
      "cuisineAffinity": [
        "Italian",
        "Northern Italian",
        "Mediterranean"
      ],
      "preparationTips": [
        "Whisk slowly into simmering salted liquid in a steady stream to prevent lumps.",
        "Stir frequently over low heat for 30-40 minutes until grain is tender."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "parmesan",
        "butter",
        "mushrooms",
        "braised short ribs",
        "gorgonzola",
        "rosemary"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dry cornmeal in an airtight container in a cool pantry up to 1 year.",
      "notes": "Cooked firm polenta keeps in the refrigerator for up to 5 days."
    }
  },

  pectin_powder: {
    "name": "pectin powder",
    "aliases": [
      "pectin powder",
      "pectin",
      "fruit pectin"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Worldwide"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/pectin_powder.png",
    "description": "A naturally occurring structural heteropolysaccharide extracted from citrus peel and apple pomace. In cooking and molecular gastronomy, it sets jams, jellies, fruit pastes, and vegan cheese medallions with clean, thermo-reversible gelation.",
    "elementalProperties": {
      "Earth": 0.4,
      "Air": 0.3,
      "Water": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "gelling",
      "stabilizing",
      "clean",
      "plant-based"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mercury",
        "Moon"
      ],
      "favorableZodiac": [
        "virgo",
        "cancer"
      ],
      "seasonalAffinity": [
        "summer",
        "fall"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 tsp (3g)",
      "calories": 10,
      "macros": {
        "protein": 0.1,
        "carbs": 2.7,
        "fat": 0,
        "fiber": 2.5,
        "sodium": 10
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0,
        "sour": 0.1,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "neutral": 0.9
      },
      "texture": {
        "dry": 0.9,
        "gel": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "neutral"
        ],
        "secondary": [
          "faintly tart"
        ],
        "notes": "Gels cleanly without masking delicate fruit aromas or flavors."
      },
      "cookingMethods": [
        "dissolve",
        "boil",
        "set"
      ],
      "cuisineAffinity": [
        "Global",
        "Pastry",
        "Molecular"
      ],
      "preparationTips": [
        "Mix with dry sugar or starch before whisking into liquids to prevent clumping.",
        "High-methoxyl pectin requires acid and sugar; low-methoxyl gels with calcium."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "berries",
        "citrus juice",
        "sugar",
        "calcium",
        "fruit purees"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in a dry, airtight jar in the pantry for up to 2 years.",
      "notes": "Keep completely dry to prevent hardening."
    }
  },

  phyllo: {
    "name": "phyllo",
    "aliases": [
      "phyllo",
      "filo",
      "phyllo dough",
      "whole wheat phyllo",
      "pound whole wheat phyllo"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "Greece",
      "Middle East",
      "Ottoman Empire"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/phyllo.png",
    "description": "Tissue-paper thin unleavened flour dough sheets layered with clarified butter or oil and baked to shattering, golden crispness. The architectural star of baklava, spanakopita, strudels, and delicate savory pastry cups.",
    "elementalProperties": {
      "Earth": 0.45,
      "Air": 0.35,
      "Fire": 0.1,
      "Water": 0.1
    },
    "qualities": [
      "crisp",
      "flaky",
      "delicate",
      "golden"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Jupiter",
        "Mercury"
      ],
      "favorableZodiac": [
        "gemini",
        "libra",
        "aquarius"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "2 sheets (50g)",
      "calories": 145,
      "macros": {
        "protein": 3.8,
        "carbs": 27,
        "fat": 1.5,
        "fiber": 1.2,
        "sodium": 230
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0.1,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "bready": 0.5,
        "buttery": 0.5,
        "toasted": 0.6
      },
      "texture": {
        "flaky": 0.9,
        "crisp": 0.9,
        "light": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "neutral-wheat"
        ],
        "secondary": [
          "toasted"
        ],
        "notes": "A vehicle for fats and fillings; develops explosive shatter when baked."
      },
      "cookingMethods": [
        "bake",
        "layer",
        "brush",
        "wrap"
      ],
      "cuisineAffinity": [
        "Greek",
        "Middle Eastern",
        "Turkish",
        "Balkan"
      ],
      "preparationTips": [
        "Thaw overnight in the refrigerator; never thaw at room temperature to avoid condensation.",
        "Keep unworked sheets covered with a damp towel while assembling to prevent drying out."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "feta",
        "spinach",
        "butter",
        "walnuts",
        "honey",
        "apples",
        "cinnamon"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Keep frozen at 0°F up to 1 year.",
      "refrigerated": "Unopened thawed package keeps in fridge up to 4 weeks.",
      "notes": "Once opened, wrap tightly in plastic and use within 10 days."
    }
  },

  millet: {
    "name": "millet",
    "aliases": [
      "millet",
      "hulled millet",
      "millet grain"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "West Africa",
      "East Asia"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/millet.png",
    "description": "An ancient, highly nutritious gluten-free cereal grain with small round yellow seeds. When toasted and simmered, it yields a delightfully fluffy, mildly nutty grain, or cooks into a soothing, creamy porridge that binds croquettes and patties.",
    "elementalProperties": {
      "Earth": 0.6,
      "Air": 0.2,
      "Water": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "nutty",
      "sustaining",
      "light",
      "gluten-free",
      "comforting"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Mercury"
      ],
      "favorableZodiac": [
        "virgo",
        "leo",
        "taurus"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/4 cup dry (50g)",
      "calories": 189,
      "macros": {
        "protein": 5.5,
        "carbs": 36,
        "fat": 2.1,
        "fiber": 4.2,
        "sugar": 0.5,
        "sodium": 2
      },
      "vitamins": {
        "B6": 0.2,
        "thiamin": 0.15,
        "niacin": 0.15
      },
      "minerals": {
        "magnesium": 0.18,
        "phosphorus": 0.15,
        "iron": 0.1
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.15,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "nutty": 0.7,
        "grassy": 0.4,
        "toasty": 0.6
      },
      "texture": {
        "fluffy": 0.7,
        "tender": 0.6,
        "granular": 0.5
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "nutty",
          "mild"
        ],
        "secondary": [
          "toasted-corn"
        ],
        "notes": "Toasting raw millet in a dry skillet before simmering amplifies its hazelnut aroma."
      },
      "cookingMethods": [
        "toast",
        "simmer",
        "bake",
        "croquette"
      ],
      "cuisineAffinity": [
        "African",
        "Asian",
        "Macrobiotic",
        "Modern Health"
      ],
      "preparationTips": [
        "Toast in dry pan for 3-4 minutes until fragrant and golden.",
        "Simmer 1 part millet with 2 parts liquid for 20 minutes, then steam 10 minutes off heat."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "squash",
        "toasted walnuts",
        "tamari",
        "scallions",
        "cumin",
        "tahini"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in airtight jar in cool pantry for up to 1-2 years.",
      "notes": "High mineral content gives it excellent shelf stability."
    }
  },

  applesauce: {
    "name": "applesauce",
    "aliases": [
      "applesauce",
      "apple sauce",
      "unsweetened applesauce"
    ],
    "category": "fruit",
    "provenance": "manual",
    "origin": [
      "Central and Western Europe"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/applesauce.png",
    "description": "A smooth or chunky purée of cooked apples seasoned with lemon and optional spices. In plant-based baking, its natural pectin, fiber, and moisture act as an effective egg and oil replacer while imparting gentle fruit sweetness.",
    "elementalProperties": {
      "Water": 0.5,
      "Earth": 0.3,
      "Air": 0.15,
      "Fire": 0.05
    },
    "qualities": [
      "moist",
      "sweet",
      "soothing",
      "pectin-rich"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Moon"
      ],
      "favorableZodiac": [
        "taurus",
        "cancer",
        "libra"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/2 cup (122g)",
      "calories": 51,
      "macros": {
        "protein": 0.2,
        "carbs": 13.7,
        "fat": 0.1,
        "fiber": 1.5,
        "sugar": 11.5,
        "sodium": 2
      },
      "vitamins": {
        "C": 0.05
      },
      "minerals": {
        "potassium": 0.03
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.6,
        "salty": 0,
        "sour": 0.25,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "apple": 0.9,
        "fruity": 0.8,
        "floral": 0.3
      },
      "texture": {
        "smooth": 0.8,
        "purée": 0.9,
        "moist": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "apple-sweet"
        ],
        "secondary": [
          "gentle tart"
        ],
        "notes": "Provides clean apple flavor with balanced natural malic acidity."
      },
      "cookingMethods": [
        "bake",
        "puree",
        "simmer",
        "bind"
      ],
      "cuisineAffinity": [
        "German",
        "American",
        "European"
      ],
      "preparationTips": [
        "Use 1/4 cup unsweetened applesauce to replace 1 egg in moist baked goods.",
        "Cook tart cooking apples with a strip of lemon zest for bright flavor balance."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "cinnamon",
        "nutmeg",
        "pork",
        "oatmeal",
        "vanilla",
        "potato latkes"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Unopened jars store in pantry up to 18 months.",
      "refrigerated": "Opened jar keeps refrigerated for up to 10-14 days.",
      "notes": "Freezes well in portioned containers."
    }
  },

  soymilk: {
    "name": "soymilk",
    "aliases": [
      "soymilk",
      "soy milk",
      "plain soymilk",
      "unsweetened soymilk"
    ],
    "category": "dairy",
    "provenance": "manual",
    "origin": [
      "China"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/soymilk.png",
    "description": "A creamy, plant-based emulsion produced by soaking, grinding, and boiling yellow soybeans with water. Rich in complete plant proteins, it froths and cooks identically to dairy milk in savory dressings, curries, and vegan baking.",
    "elementalProperties": {
      "Water": 0.45,
      "Earth": 0.35,
      "Air": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "creamy",
      "protein-rich",
      "nourishing",
      "versatile"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Venus"
      ],
      "favorableZodiac": [
        "cancer",
        "virgo",
        "taurus"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup (240ml)",
      "calories": 80,
      "macros": {
        "protein": 7,
        "carbs": 4,
        "fat": 4,
        "fiber": 1,
        "sugar": 1,
        "sodium": 95
      },
      "vitamins": {
        "B12": 0.5,
        "D": 0.15,
        "A": 0.1
      },
      "minerals": {
        "calcium": 0.25,
        "iron": 0.06,
        "potassium": 0.07
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.15,
        "salty": 0.05,
        "sour": 0,
        "bitter": 0,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "creamy": 0.6,
        "beany": 0.4,
        "neutral": 0.7
      },
      "texture": {
        "liquid": 0.85,
        "creamy": 0.6
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "mild",
          "creamy"
        ],
        "secondary": [
          "subtle bean"
        ],
        "notes": "High protein content allows it to curdle with acid like dairy buttermilk."
      },
      "cookingMethods": [
        "simmer",
        "whip",
        "bake",
        "emulsify"
      ],
      "cuisineAffinity": [
        "East Asian",
        "Global Vegan",
        "Modern Western"
      ],
      "preparationTips": [
        "Use unsweetened, plain varieties in savory dressings and sauces.",
        "Add 1 tsp apple cider vinegar per cup to make dairy-free buttermilk."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "horseradish",
        "garlic",
        "nutritional yeast",
        "mustard",
        "vanilla",
        "matcha"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Aseptic shelf-stable cartons store in pantry up to 1 year.",
      "refrigerated": "Refrigerate after opening and consume within 7-10 days.",
      "notes": "Shake well before each pour."
    }
  },

  bonito_flakes: {
    "name": "bonito flakes",
    "aliases": [
      "bonito flakes",
      "katsuobushi",
      "shaved bonito"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Japan"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/bonito_flakes.png",
    "description": "Wood-hard blocks of skipjack tuna (Katsuwonus pelamis) that have been simmered, smoked over oak for weeks, sun-dried, and inoculated with Aspergillus molds, then micro-planed into translucent, smoky, umami-saturated ribbons.",
    "elementalProperties": {
      "Air": 0.35,
      "Fire": 0.3,
      "Earth": 0.2,
      "Water": 0.15
    },
    "qualities": [
      "smoky",
      "umami-rich",
      "intense",
      "ethereal"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Neptune"
      ],
      "favorableZodiac": [
        "scorpio",
        "pisces",
        "aries"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 packet (5g)",
      "calories": 18,
      "macros": {
        "protein": 4,
        "carbs": 0.1,
        "fat": 0.3,
        "fiber": 0,
        "sodium": 25
      },
      "vitamins": {
        "B12": 0.2,
        "niacin": 0.1
      },
      "minerals": {
        "phosphorus": 0.04,
        "selenium": 0.15
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0.1,
        "sour": 0.05,
        "bitter": 0,
        "umami": 0.95,
        "spicy": 0
      },
      "aroma": {
        "smoky": 0.9,
        "fishy": 0.6,
        "savory": 0.9,
        "oaked": 0.7
      },
      "texture": {
        "flaky": 0.9,
        "delicate": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "intense umami",
          "smoky"
        ],
        "secondary": [
          "savory fish"
        ],
        "notes": "Inosinate content combines synergistically with glutamates in kombu for exponential savoriness."
      },
      "cookingMethods": [
        "steep",
        "garnish",
        "infuse"
      ],
      "cuisineAffinity": [
        "Japanese"
      ],
      "preparationTips": [
        "Steep in near-boiling kombu broth for 1-2 minutes without stirring, then strain immediately.",
        "Sprinkle over hot okonomiyaki or tofu; rising steam causes flakes to dance."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "kombu",
        "soy sauce",
        "mirin",
        "tofu",
        "scallions",
        "eggs"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store unopened packets in a cool, dark pantry.",
      "refrigerated": "Reseal tightly and refrigerate opened bags to prevent oxidation of delicate aromatics.",
      "notes": "Protect from humidity and light."
    }
  },

  wakame: {
    "name": "wakame",
    "aliases": [
      "wakame",
      "wakame seaweed",
      "dried wakame",
      "loosely packed wakame"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Japan",
      "Korea"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/wakame.png",
    "description": "An emerald-green edible kelp (Undaria pinnatifida) with a delicate, silky texture and mild, oceanic sweetness. It hydrates in minutes to lend mineral depth to miso soup, cucumber sunomono salads, and hearty grain casseroles.",
    "elementalProperties": {
      "Water": 0.45,
      "Earth": 0.3,
      "Air": 0.15,
      "Fire": 0.1
    },
    "qualities": [
      "mineral-rich",
      "silky",
      "oceanic",
      "nourishing"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Neptune"
      ],
      "favorableZodiac": [
        "pisces",
        "cancer"
      ],
      "seasonalAffinity": [
        "spring",
        "summer"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 tbsp dried (10g)",
      "calories": 45,
      "macros": {
        "protein": 3,
        "carbs": 9,
        "fat": 0.6,
        "fiber": 4,
        "sodium": 870
      },
      "vitamins": {
        "folate": 0.2,
        "A": 0.1,
        "K": 0.1
      },
      "minerals": {
        "iodine": 2.5,
        "magnesium": 0.25,
        "calcium": 0.15,
        "iron": 0.1
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0.3,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.7,
        "spicy": 0
      },
      "aroma": {
        "sea-like": 0.8,
        "mineral": 0.7,
        "vegetal": 0.5
      },
      "texture": {
        "silky": 0.8,
        "tender": 0.7,
        "slippery": 0.6
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "saline",
          "umami"
        ],
        "secondary": [
          "sweet vegetal"
        ],
        "notes": "Expands roughly fourfold when soaked in cold water for 5 minutes."
      },
      "cookingMethods": [
        "soak",
        "simmer",
        "toss",
        "casserole"
      ],
      "cuisineAffinity": [
        "Japanese",
        "Korean",
        "Macrobiotic"
      ],
      "preparationTips": [
        "Soak in cold water for 5 minutes, drain, and squeeze out excess moisture.",
        "Add to soups at the very end to preserve vibrant emerald green color and tender bite."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "cucumbers",
        "rice vinegar",
        "toasted sesame oil",
        "tofu",
        "miso",
        "scallions"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dried wakame in an airtight jar in a dark pantry up to 2 years.",
      "notes": "Keep dry and away from humidity."
    }
  },

  hiziki: {
    "name": "hiziki",
    "aliases": [
      "hiziki",
      "hijiki",
      "dried hiziki",
      "loosely packed hiziki",
      "hijiki seaweed"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Japan",
      "East Asia"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/hiziki.png",
    "description": "A wild brown sea vegetable (Sargassum fusiforme) with jet-black needle-like fronds and a firm, pleasant toothsome bite. Rich in dietary fiber and essential minerals, it is traditionally braised with carrots, lotus root, and agé fried tofu.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.35,
      "Air": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "earthy",
      "toothsome",
      "mineral-rich",
      "dark",
      "nourishing"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Pluto"
      ],
      "favorableZodiac": [
        "capricorn",
        "scorpio"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 tbsp dried (10g)",
      "calories": 30,
      "macros": {
        "protein": 1,
        "carbs": 6,
        "fat": 0.1,
        "fiber": 5,
        "sodium": 140
      },
      "vitamins": {
        "K": 0.1
      },
      "minerals": {
        "calcium": 0.14,
        "iron": 0.15,
        "magnesium": 0.1
      },
      "source": "USDA / Japan Food Composition"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0.2,
        "sour": 0,
        "bitter": 0.1,
        "umami": 0.5,
        "spicy": 0
      },
      "aroma": {
        "earthy": 0.8,
        "oceanic": 0.7,
        "mineral": 0.6
      },
      "texture": {
        "toothsome": 0.8,
        "crunchy": 0.5,
        "firm": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "earthy",
          "oceanic"
        ],
        "secondary": [
          "savory-sweet"
        ],
        "notes": "Holds its structural integrity through long braises without turning mushy."
      },
      "cookingMethods": [
        "soak",
        "braise",
        "saute",
        "casserole"
      ],
      "cuisineAffinity": [
        "Japanese",
        "Macrobiotic"
      ],
      "preparationTips": [
        "Soak in warm water for 20-30 minutes, then rinse thoroughly and drain before cooking.",
        "Sauté in sesame oil with carrots and simmer in dashi, soy sauce, and mirin."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "carrots",
        "tofu",
        "sesame oil",
        "mirin",
        "soy sauce",
        "lemon"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dried hiziki in a sealed container in a cool pantry up to 2 years.",
      "notes": "Ensure container is airtight."
    }
  },

  xanthan_gum: {
    "name": "xanthan gum",
    "aliases": [
      "xanthan gum",
      "xanthan"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "United States"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/xanthan_gum.png",
    "description": "A plant-based food polysaccharide produced by fermentation of glucose by Xanthomonas campestris. In gluten-free doughs, dressings, and sauces, microscopic amounts provide powerful elasticity, viscosity, and emulsion stability.",
    "elementalProperties": {
      "Earth": 0.4,
      "Air": 0.4,
      "Water": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "stabilizing",
      "elastic",
      "neutral",
      "binding"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mercury"
      ],
      "favorableZodiac": [
        "virgo",
        "gemini"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1/4 tsp (1g)",
      "calories": 3,
      "macros": {
        "protein": 0.1,
        "carbs": 0.8,
        "fat": 0,
        "fiber": 0.8,
        "sodium": 25
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "neutral": 1
      },
      "texture": {
        "powder": 0.9,
        "viscous": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "neutral"
        ],
        "secondary": [],
        "notes": "Zero flavor contribution; works across cold and hot temperatures without heating."
      },
      "cookingMethods": [
        "blend",
        "whisk",
        "bake"
      ],
      "cuisineAffinity": [
        "Modernist",
        "Gluten-Free Baking",
        "Global"
      ],
      "preparationTips": [
        "Disperse in oil or dry ingredients before adding to liquids to avoid clumping.",
        "A typical dosage is 0.1% to 0.5% of total formula weight."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "gluten-free flours",
        "vinaigrettes",
        "smoothies",
        "sauces"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in a tightly closed jar in a cool pantry up to 3 years.",
      "notes": "Keep dry."
    }
  },

  celeriac: {
    "name": "celeriac",
    "aliases": [
      "celeriac",
      "celery root",
      "knob celery"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Mediterranean",
      "Northern Europe"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/celeriac.png",
    "description": "A knobby, rustic root vegetable (Apium graveolens var. rapaceum) cultivated for its dense, ivory bulb. It offers an earthy, nutty celery fragrance that shines when shredded raw into remoulade or pureed into silky mashes.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.3,
      "Air": 0.2,
      "Fire": 0.05
    },
    "qualities": [
      "earthy",
      "nutty",
      "dense",
      "aromatic",
      "nourishing"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Mercury"
      ],
      "favorableZodiac": [
        "capricorn",
        "virgo"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup chopped (156g)",
      "calories": 66,
      "macros": {
        "protein": 2.3,
        "carbs": 14.4,
        "fat": 0.5,
        "fiber": 2.8,
        "sugar": 2.5,
        "sodium": 156
      },
      "vitamins": {
        "C": 0.2,
        "K": 0.8,
        "B6": 0.15
      },
      "minerals": {
        "phosphorus": 0.18,
        "potassium": 0.13,
        "manganese": 0.12
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.25,
        "salty": 0.1,
        "sour": 0.05,
        "bitter": 0.1,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "herbal": 0.8,
        "celery": 0.9,
        "earthy": 0.7
      },
      "texture": {
        "crisp": 0.7,
        "dense": 0.8,
        "creamy": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "celery",
          "nutty"
        ],
        "secondary": [
          "earthy",
          "mild sweet"
        ],
        "notes": "Becomes mellow and buttery when roasted or simmered into purées."
      },
      "cookingMethods": [
        "roast",
        "puree",
        "shave",
        "remoulade",
        "braise"
      ],
      "cuisineAffinity": [
        "French",
        "German",
        "Central European"
      ],
      "preparationTips": [
        "Use a sharp chef's knife to slice off tough outer skin and root crevices.",
        "Drop cut pieces into acidulated water to prevent browning."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "dijon mustard",
        "apples",
        "butter",
        "thyme",
        "truffle oil",
        "potatoes",
        "asparagus"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep unpeeled root in crisper drawer for up to 3 weeks.",
      "notes": "Wrap loosely in a perforated plastic bag."
    }
  },

  edamame: {
    "name": "edamame",
    "aliases": [
      "shelled edamame",
      "edamame",
      "green soybeans",
      "mukimame"
    ],
    "category": "protein",
    "provenance": "manual",
    "origin": [
      "East Asia"
    ],
    "season": [
      "summer",
      "fall"
    ],
    "image_url": "ingredients/edamame.png",
    "description": "Immature, bright green soybeans (Glycine max) harvested before hardening. They feature a plump, tender-crisp texture, sweet nutty flavor, and a complete amino acid profile ideal for dumplings, salads, and grain bowls.",
    "elementalProperties": {
      "Earth": 0.4,
      "Water": 0.25,
      "Fire": 0.2,
      "Air": 0.15
    },
    "qualities": [
      "nutritious",
      "fresh",
      "sweet",
      "complete-protein"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Jupiter",
        "Venus"
      ],
      "favorableZodiac": [
        "virgo",
        "taurus",
        "libra"
      ],
      "seasonalAffinity": [
        "summer",
        "fall"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/2 cup shelled (78g)",
      "calories": 94,
      "macros": {
        "protein": 9.2,
        "carbs": 6.9,
        "fat": 4,
        "fiber": 4,
        "sugar": 1.7,
        "sodium": 5
      },
      "vitamins": {
        "folate": 0.6,
        "K": 0.3,
        "C": 0.08,
        "thiamin": 0.1
      },
      "minerals": {
        "iron": 0.12,
        "magnesium": 0.12,
        "potassium": 0.08,
        "phosphorus": 0.13
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.3,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.3,
        "spicy": 0
      },
      "aroma": {
        "grassy": 0.6,
        "nutty": 0.6,
        "fresh": 0.7
      },
      "texture": {
        "tender-crisp": 0.8,
        "plump": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "sweet-nutty",
          "vegetal"
        ],
        "secondary": [
          "buttery"
        ],
        "notes": "Retains bright green color and toothsome bite when blanched briefly."
      },
      "cookingMethods": [
        "blanch",
        "steam",
        "puree",
        "stir-fry",
        "dumpling"
      ],
      "cuisineAffinity": [
        "Japanese",
        "East Asian",
        "Modern Healthy"
      ],
      "preparationTips": [
        "Blanch in well-salted boiling water for 3-4 minutes, then shock in ice water.",
        "Pulse into dumpling fillings with ginger and scallions."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "sesame oil",
        "scallions",
        "ginger",
        "soy sauce",
        "sea salt",
        "leeks"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store frozen shelled edamame at 0°F up to 12 months.",
      "refrigerated": "Blanched edamame keeps refrigerated up to 4 days.",
      "notes": "Keep frozen until ready to use."
    }
  },

  kabocha_squash: {
    "name": "kabocha squash",
    "aliases": [
      "kabocha",
      "kabocha squash",
      "japanese pumpkin",
      "2 pounds kabocha squash"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Japan",
      "Mesoamerica"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/kabocha_squash.png",
    "description": "A Japanese winter squash (Cucurbita maxima) characterized by dark green knobby skin and dense, vibrant orange flesh. When baked, its velvety, chestnut-sweet interior is remarkably rich, making exquisite pies, curries, and salads.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "sweet",
      "dense",
      "comforting",
      "golden",
      "nutritious"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Venus"
      ],
      "favorableZodiac": [
        "leo",
        "taurus",
        "cancer"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup cubed (116g)",
      "calories": 40,
      "macros": {
        "protein": 1,
        "carbs": 10,
        "fat": 0.2,
        "fiber": 2,
        "sugar": 4,
        "sodium": 1
      },
      "vitamins": {
        "A": 0.7,
        "C": 0.25,
        "B6": 0.1
      },
      "minerals": {
        "potassium": 0.1,
        "iron": 0.05
      },
      "source": "USDA approximate"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.6,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "sweet": 0.7,
        "nutty": 0.6,
        "earthy": 0.5
      },
      "texture": {
        "dense": 0.8,
        "velvety": 0.8,
        "creamy": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "chestnut-sweet",
          "pumpkin"
        ],
        "secondary": [
          "buttery"
        ],
        "notes": "Drier and sweeter than butternut squash; the thin skin is completely edible."
      },
      "cookingMethods": [
        "roast",
        "simmer",
        "tempura",
        "bake",
        "pie"
      ],
      "cuisineAffinity": [
        "Japanese",
        "Asian",
        "Modern Western"
      ],
      "preparationTips": [
        "Microwave whole squash for 2 minutes to make slicing through the tough rind easier.",
        "Roast with skin on; it turns tender and nutty in the oven."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "miso",
        "soy sauce",
        "ginger",
        "cinnamon",
        "nutmeg",
        "maple syrup",
        "pecans"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Whole uncut kabocha stores in a cool, dry pantry for 2-3 months.",
      "refrigerated": "Wrap cut pieces tightly and refrigerate up to 5-7 days.",
      "notes": "Sweetness increases with storage as starches convert to sugars."
    }
  },

  haricots_verts: {
    "name": "haricots verts",
    "aliases": [
      "haricots verts",
      "french green beans",
      "slender green beans"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "France"
    ],
    "season": [
      "summer",
      "fall"
    ],
    "image_url": "ingredients/haricots_verts.png",
    "description": "Slender, delicate French green beans (Phaseolus vulgaris) harvested young. Thinner, longer, and more tender than standard green beans, they cook rapidly to deliver a sweet, tender-crisp snap in Niçoise salads and sautéed sides.",
    "elementalProperties": {
      "Earth": 0.35,
      "Water": 0.35,
      "Air": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "crisp",
      "tender",
      "fresh",
      "vibrant"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Mercury"
      ],
      "favorableZodiac": [
        "virgo",
        "libra",
        "gemini"
      ],
      "seasonalAffinity": [
        "summer",
        "fall"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup (100g)",
      "calories": 31,
      "macros": {
        "protein": 1.8,
        "carbs": 7,
        "fat": 0.2,
        "fiber": 2.7,
        "sugar": 3.3,
        "sodium": 6
      },
      "vitamins": {
        "C": 0.14,
        "K": 0.18,
        "folate": 0.08,
        "A": 0.07
      },
      "minerals": {
        "potassium": 0.06,
        "manganese": 0.1
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.25,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.05,
        "spicy": 0
      },
      "aroma": {
        "grassy": 0.7,
        "fresh": 0.8,
        "sweet": 0.4
      },
      "texture": {
        "crisp": 0.85,
        "tender": 0.8,
        "juicy": 0.6
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "fresh vegetal",
          "sweet"
        ],
        "secondary": [
          "herbal"
        ],
        "notes": "Cooks in under 3 minutes; retains snappy texture and bright green color."
      },
      "cookingMethods": [
        "blanch",
        "saute",
        "steam",
        "salad"
      ],
      "cuisineAffinity": [
        "French",
        "Mediterranean"
      ],
      "preparationTips": [
        "Blanch in salted boiling water for 2 minutes, then shock in ice bath to fix chlorophyll.",
        "Toss with warm vinaigrette, shallots, and tarragon for classic French salad."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "shallots",
        "butter",
        "dijon mustard",
        "tarragon",
        "toasted almonds",
        "tuna",
        "olives"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Store in produce bag in crisper drawer for up to 5-7 days.",
      "notes": "Do not wash until ready to cook."
    }
  },

  monkfish: {
    "name": "monkfish",
    "aliases": [
      "monkfish",
      "monkfish filets",
      "anglerfish"
    ],
    "category": "protein",
    "provenance": "manual",
    "origin": [
      "North Atlantic"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/monkfish.png",
    "description": "A dense, lean deep-sea whitefish (Lophius) prized for its tail meat. Often called 'poor man's lobster' due to its firm, sweet, scallop-like meat that holds together wonderfully in rich braises, stews, and roasted preparations.",
    "elementalProperties": {
      "Water": 0.45,
      "Earth": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "firm",
      "succulent",
      "sweet",
      "dense",
      "protein-rich"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Neptune",
        "Pluto"
      ],
      "favorableZodiac": [
        "scorpio",
        "pisces"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "100g",
      "calories": 76,
      "macros": {
        "protein": 14.5,
        "carbs": 0,
        "fat": 1.5,
        "fiber": 0,
        "sodium": 180
      },
      "vitamins": {
        "B12": 0.4,
        "B6": 0.2,
        "niacin": 0.15
      },
      "minerals": {
        "selenium": 0.5,
        "phosphorus": 0.2,
        "potassium": 0.08
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.3,
        "salty": 0.15,
        "sour": 0,
        "bitter": 0,
        "umami": 0.4,
        "spicy": 0
      },
      "aroma": {
        "clean": 0.8,
        "oceanic": 0.7,
        "buttery": 0.4
      },
      "texture": {
        "firm": 0.9,
        "meaty": 0.9,
        "succulent": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "sweet whitefish",
          "scallop-like"
        ],
        "secondary": [
          "mild oceanic"
        ],
        "notes": "Does not flake like standard whitefish; slices cleanly like medallions."
      },
      "cookingMethods": [
        "pan-sear",
        "roast",
        "poach",
        "braise"
      ],
      "cuisineAffinity": [
        "French",
        "Mediterranean",
        "Spanish"
      ],
      "preparationTips": [
        "Peel away any bluish-gray outer membrane before cooking to prevent curling.",
        "Sear in hot butter until caramelized, then baste with lemon and capers."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "butter",
        "lemon",
        "capers",
        "garlic",
        "white wine",
        "prosciutto",
        "rosemary"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep fresh monkfish on ice in the refrigerator and cook within 1-2 days.",
      "notes": "Freezes well up to 3 months."
    }
  },

  flounder: {
    "name": "flounder",
    "aliases": [
      "flounder",
      "flounder filets",
      "sole",
      "filet of sole",
      "10 flounder filets"
    ],
    "category": "protein",
    "provenance": "manual",
    "origin": [
      "Atlantic and Pacific Coasts"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/flounder.png",
    "description": "A delicate, lean flatfish (Paralichthys / Platichthys) with pearlescent white flesh and a fine, tender flake. It cooks in minutes and readily absorbs aromatic crusts, hazelnut breadings, and parchment-baked herbal aromatics.",
    "elementalProperties": {
      "Water": 0.5,
      "Earth": 0.25,
      "Air": 0.15,
      "Fire": 0.1
    },
    "qualities": [
      "delicate",
      "tender",
      "light",
      "sweet",
      "lean"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Neptune"
      ],
      "favorableZodiac": [
        "pisces",
        "cancer"
      ],
      "seasonalAffinity": [
        "spring",
        "summer"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "100g",
      "calories": 86,
      "macros": {
        "protein": 12.5,
        "carbs": 0,
        "fat": 1.2,
        "fiber": 0,
        "sodium": 80
      },
      "vitamins": {
        "B12": 0.3,
        "B6": 0.15
      },
      "minerals": {
        "selenium": 0.4,
        "phosphorus": 0.18,
        "potassium": 0.08
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0.1,
        "sour": 0,
        "bitter": 0,
        "umami": 0.3,
        "spicy": 0
      },
      "aroma": {
        "mild": 0.9,
        "fresh": 0.8,
        "clean": 0.8
      },
      "texture": {
        "delicate": 0.9,
        "flaky": 0.8,
        "tender": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "mild sweet",
          "clean"
        ],
        "secondary": [
          "delicate"
        ],
        "notes": "Very fragile flesh; excels when rolled into roulades or protected in en papillote pouches."
      },
      "cookingMethods": [
        "en papillote",
        "pan-fry",
        "bake",
        "roulade"
      ],
      "cuisineAffinity": [
        "French",
        "American",
        "Mediterranean"
      ],
      "preparationTips": [
        "Handle gently with a fish spatula to prevent tearing tender fillets.",
        "Bake in parchment with herbs, white wine, and butter for foolproof moisture."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "hazelnuts",
        "brown butter",
        "lemon",
        "parsley",
        "white wine",
        "breadcrumbs"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Store wrapped over crushed ice in the refrigerator for 1-2 days.",
      "notes": "Use promptly after purchase."
    }
  },

  bass: {
    "name": "bass",
    "aliases": [
      "bass",
      "bass filets",
      "whole bass",
      "sea bass",
      "striped bass"
    ],
    "category": "protein",
    "provenance": "manual",
    "origin": [
      "Coastal Oceans and Rivers"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/bass.png",
    "description": "A premier coastal finfish featuring medium-firm white flesh with a clean, buttery flavor and rich natural moisture. Its sturdy structure renders it magnificent for whole salt-crusting, potato-crust searing, or herb-roasted fillets.",
    "elementalProperties": {
      "Water": 0.45,
      "Earth": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "succulent",
      "buttery",
      "clean",
      "versatile"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Jupiter",
        "Neptune"
      ],
      "favorableZodiac": [
        "sagittarius",
        "pisces"
      ],
      "seasonalAffinity": [
        "summer",
        "fall"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "100g",
      "calories": 97,
      "macros": {
        "protein": 18,
        "carbs": 0,
        "fat": 2,
        "fiber": 0,
        "sodium": 70
      },
      "vitamins": {
        "B12": 0.5,
        "B6": 0.2,
        "D": 0.2
      },
      "minerals": {
        "selenium": 0.55,
        "phosphorus": 0.2,
        "potassium": 0.1
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0.1,
        "sour": 0,
        "bitter": 0,
        "umami": 0.4,
        "spicy": 0
      },
      "aroma": {
        "clean": 0.8,
        "oceanic": 0.7,
        "savory": 0.5
      },
      "texture": {
        "firm": 0.7,
        "flaky": 0.8,
        "succulent": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "buttery",
          "mild sweet"
        ],
        "secondary": [
          "clean marine"
        ],
        "notes": "Rich natural oil content keeps flesh exceptionally moist under high heat."
      },
      "cookingMethods": [
        "pan-sear",
        "roast",
        "salt-crust",
        "grill"
      ],
      "cuisineAffinity": [
        "Mediterranean",
        "French",
        "American"
      ],
      "preparationTips": [
        "Score skin lightly with knife to keep fillet flat during pan-searing.",
        "Bake whole fish encased in egg-white sea salt crust for tender, juicy steam."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "potatoes",
        "olive oil",
        "lemon",
        "rosemary",
        "thyme",
        "garlic",
        "tomatoes"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep refrigerated on ice and prepare within 2 days.",
      "notes": "Store whole gutted fish patted dry."
    }
  },

  adzuki_beans: {
    "name": "adzuki beans",
    "aliases": [
      "aduki beans",
      "adzuki beans",
      "adzuki",
      "red adzuki beans",
      "azuki beans"
    ],
    "category": "protein",
    "provenance": "manual",
    "origin": [
      "East Asia"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/adzuki_beans.png",
    "description": "Compact, garnet-red legumes (Vigna angularis) with a distinctive white ridge and a naturally sweet, nutty flavor profile. Highly prized in East Asian cuisine and macrobiotic cooking for warming stews and sweet red bean paste.",
    "elementalProperties": {
      "Earth": 0.5,
      "Water": 0.25,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "sweet",
      "warming",
      "nourishing",
      "digestible",
      "earthy"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Saturn"
      ],
      "favorableZodiac": [
        "scorpio",
        "capricorn",
        "aries"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/2 cup cooked (115g)",
      "calories": 147,
      "macros": {
        "protein": 8.7,
        "carbs": 28.5,
        "fat": 0.1,
        "fiber": 8.4,
        "sugar": 0.3,
        "sodium": 9
      },
      "vitamins": {
        "folate": 0.35,
        "thiamin": 0.1
      },
      "minerals": {
        "potassium": 0.13,
        "iron": 0.13,
        "magnesium": 0.15,
        "phosphorus": 0.2
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.3,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.2,
        "spicy": 0
      },
      "aroma": {
        "earthy": 0.7,
        "nutty": 0.6,
        "sweet": 0.5
      },
      "texture": {
        "creamy": 0.8,
        "tender": 0.7,
        "dense": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "sweet-earthy",
          "nutty"
        ],
        "secondary": [
          "chestnut"
        ],
        "notes": "Cooks faster and is more digestible than larger kidney or pinto beans."
      },
      "cookingMethods": [
        "simmer",
        "stew",
        "puree",
        "sweeten"
      ],
      "cuisineAffinity": [
        "Japanese",
        "Chinese",
        "Korean",
        "Macrobiotic"
      ],
      "preparationTips": [
        "Simmer with a strip of kombu to enhance tenderness and mineral assimilation.",
        "Combine with kabocha squash in warming winter stews."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "kombu",
        "kabocha squash",
        "tamari",
        "ginger",
        "chestnuts",
        "brown rice"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dry beans in airtight jar in cool pantry up to 2 years.",
      "notes": "Cooked beans keep in fridge up to 5 days or freeze."
    }
  },

  great_northern_beans: {
    "name": "great northern beans",
    "aliases": [
      "great northern beans",
      "large white beans",
      "cannellini"
    ],
    "category": "protein",
    "provenance": "manual",
    "origin": [
      "North America"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/great_northern_beans.png",
    "description": "Medium-large oval white beans (Phaseolus vulgaris) with a delicate thin skin and a tender, creamy interior. They effortlessly absorb garlic, olive oil, and herbs, making luxurious purées, cassoulets, and minestrone soups.",
    "elementalProperties": {
      "Earth": 0.5,
      "Water": 0.25,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "creamy",
      "mild",
      "comforting",
      "protein-rich"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Saturn"
      ],
      "favorableZodiac": [
        "cancer",
        "taurus"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/2 cup cooked (90g)",
      "calories": 104,
      "macros": {
        "protein": 7.4,
        "carbs": 18.7,
        "fat": 0.4,
        "fiber": 6.2,
        "sugar": 0.4,
        "sodium": 2
      },
      "vitamins": {
        "folate": 0.22,
        "thiamin": 0.1
      },
      "minerals": {
        "iron": 0.1,
        "magnesium": 0.1,
        "potassium": 0.1,
        "calcium": 0.06
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "earthy": 0.5,
        "mild": 0.8
      },
      "texture": {
        "creamy": 0.9,
        "smooth": 0.85,
        "tender": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "mild",
          "creamy"
        ],
        "secondary": [
          "subtle earthy"
        ],
        "notes": "A culinary blank canvas that purées into a silky substitute for dairy cream."
      },
      "cookingMethods": [
        "simmer",
        "puree",
        "bake",
        "mash"
      ],
      "cuisineAffinity": [
        "American",
        "French",
        "Italian"
      ],
      "preparationTips": [
        "Soak overnight in salted water to ensure even cooking and intact skins.",
        "Purée with roasted garlic and olive oil for a silky dip."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "roasted garlic",
        "rosemary",
        "extra virgin olive oil",
        "lemon",
        "pita",
        "sage"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Dry beans store in pantry up to 2 years.",
      "notes": "Cooked beans freeze exceptionally well."
    }
  },

  cacao_nibs: {
    "name": "cacao nibs",
    "aliases": [
      "cacao nibs",
      "cocoa nibs",
      "raw cacao nibs"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Central and South America"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/cacao_nibs.png",
    "description": "Crushed pieces of roasted or raw fermented cacao beans (Theobroma cacao). They deliver intense, unsweetened dark chocolate flavor, complex bitter tannins, and a satisfying nutty crunch to bark, granolas, and baked goods.",
    "elementalProperties": {
      "Earth": 0.4,
      "Fire": 0.35,
      "Air": 0.15,
      "Water": 0.1
    },
    "qualities": [
      "crunchy",
      "bitter",
      "intense",
      "antioxidant-rich",
      "roasted"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Pluto",
        "Mars"
      ],
      "favorableZodiac": [
        "scorpio",
        "aries"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp (10g)",
      "calories": 60,
      "macros": {
        "protein": 1.4,
        "carbs": 3,
        "fat": 5,
        "fiber": 2,
        "sugar": 0,
        "sodium": 0
      },
      "minerals": {
        "magnesium": 0.15,
        "iron": 0.08,
        "copper": 0.15
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0,
        "sour": 0.1,
        "bitter": 0.8,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "roasted": 0.9,
        "chocolate": 0.95,
        "earthy": 0.7
      },
      "texture": {
        "crunchy": 0.9,
        "crisp": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "dark chocolate",
          "roasted bitter"
        ],
        "secondary": [
          "fruity",
          "nutty"
        ],
        "notes": "Adds structural crunch and rich chocolate aroma without sweetness."
      },
      "cookingMethods": [
        "toast",
        "blend",
        "garnish",
        "infuse"
      ],
      "cuisineAffinity": [
        "Modernist",
        "Mexican",
        "Pastry"
      ],
      "preparationTips": [
        "Sprinkle over tempered chocolate bark before setting for dramatic texture.",
        "Infuse into warm cream or spirits for pure, unsweetened cocoa aromatics."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "sea salt",
        "dark chocolate",
        "coffee",
        "chili",
        "caramel",
        "almonds"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in an airtight container in a cool, dark pantry up to 2 years.",
      "notes": "Keep dry and away from heat."
    }
  },

  teriyaki_sauce: {
    "name": "teriyaki sauce",
    "aliases": [
      "teriyaki sauce",
      "teriyaki",
      "tare sauce"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Japan"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/teriyaki_sauce.png",
    "description": "A lustrous Japanese glaze simmered from soy sauce, mirin, sake, and sweetener. Brushed over grilling proteins, its sugars caramelize into a glossy, sweet-savory crust rich in umami and appetizing sheen.",
    "elementalProperties": {
      "Water": 0.35,
      "Earth": 0.35,
      "Fire": 0.2,
      "Air": 0.1
    },
    "qualities": [
      "glossy",
      "sweet-savory",
      "umami-rich",
      "caramelized"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Sun"
      ],
      "favorableZodiac": [
        "taurus",
        "leo"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp (16g)",
      "calories": 16,
      "macros": {
        "protein": 0.9,
        "carbs": 2.8,
        "fat": 0,
        "fiber": 0,
        "sugar": 2.3,
        "sodium": 690
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.7,
        "salty": 0.7,
        "sour": 0.05,
        "bitter": 0,
        "umami": 0.8,
        "spicy": 0
      },
      "aroma": {
        "soy": 0.8,
        "sweet": 0.7,
        "savory": 0.8,
        "caramelized": 0.6
      },
      "texture": {
        "syrupy": 0.7,
        "glossy": 0.8,
        "liquid": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "umami",
          "sweet"
        ],
        "secondary": [
          "caramelized soy"
        ],
        "notes": "Simmers down into a thick, clinging glaze that shines ('teri') when broiled ('yaki')."
      },
      "cookingMethods": [
        "glaze",
        "brush",
        "marinate",
        "stir-fry"
      ],
      "cuisineAffinity": [
        "Japanese",
        "Hawaiian",
        "Asian Fusion"
      ],
      "preparationTips": [
        "Brush onto proteins during the last few minutes of cooking so sugars do not burn.",
        "Simmer gently to reduce to desired coat-the-spoon consistency."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "tofu",
        "salmon",
        "chicken",
        "steamed rice",
        "sesame seeds",
        "scallions",
        "ginger"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep refrigerated in airtight jar for up to 6 months.",
      "notes": "High sugar and salt content prevent bacterial growth."
    }
  },

  brown_roux: {
    "name": "brown roux",
    "aliases": [
      "brown roux",
      "dark roux"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "France",
      "Louisiana Creole/Cajun"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/brown_roux.png",
    "description": "An equal-weight mixture of wheat flour and culinary fat cooked slowly over moderate heat until starch grains caramelize into deep copper or chocolate brown. It yields nutty, toasted flavor and earthy body in gumbos and sauce Espagnole.",
    "elementalProperties": {
      "Earth": 0.5,
      "Fire": 0.3,
      "Air": 0.1,
      "Water": 0.1
    },
    "qualities": [
      "toasted",
      "nutty",
      "thickening",
      "rich",
      "roasted"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Mars"
      ],
      "favorableZodiac": [
        "capricorn",
        "scorpio"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 tbsp (30g)",
      "calories": 140,
      "macros": {
        "protein": 1.5,
        "carbs": 12,
        "fat": 10,
        "fiber": 0.4,
        "sodium": 0
      },
      "source": "Calculated"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0,
        "bitter": 0.15,
        "umami": 0.2,
        "spicy": 0
      },
      "aroma": {
        "roasted": 0.9,
        "nutty": 0.9,
        "toasty": 0.8
      },
      "texture": {
        "paste": 0.8,
        "smooth": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "nutty",
          "roasted"
        ],
        "secondary": [
          "caramelized"
        ],
        "notes": "Long cooking reduces thickening power by 50% compared to white roux, but delivers massive depth."
      },
      "cookingMethods": [
        "whisk",
        "slow-cook",
        "thicken"
      ],
      "cuisineAffinity": [
        "Creole",
        "Cajun",
        "French"
      ],
      "preparationTips": [
        "Stir continuously with a flat wooden spoon over medium-low heat to avoid scorching.",
        "Whisk cool liquid into hot roux (or hot liquid into cool roux) to prevent lumps."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "beef stock",
        "mirepoix",
        "onions",
        "mushrooms",
        "thyme"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Prepared roux keeps refrigerated in a sealed container up to 1 month.",
      "notes": "Can be frozen in ice cube trays for instant sauce thickening."
    }
  },

  blond_roux: {
    "name": "blond roux",
    "aliases": [
      "blond roux",
      "blonde roux",
      "white roux"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "France"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/blond_roux.png",
    "description": "Equal parts flour and butter or oil cooked gently until the raw flour aroma disappears and turns a pale golden straw color with a pleasant hazelnut scent. The classic foundation for velouté, béchamel, and roasted garlic sauces.",
    "elementalProperties": {
      "Earth": 0.5,
      "Fire": 0.2,
      "Air": 0.15,
      "Water": 0.15
    },
    "qualities": [
      "golden",
      "smooth",
      "thickening",
      "buttery"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Venus"
      ],
      "favorableZodiac": [
        "taurus",
        "leo"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "2 tbsp (30g)",
      "calories": 140,
      "macros": {
        "protein": 1.5,
        "carbs": 12,
        "fat": 10,
        "fiber": 0.4,
        "sodium": 0
      },
      "source": "Calculated"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0.05,
        "spicy": 0
      },
      "aroma": {
        "buttery": 0.8,
        "toasted flour": 0.7
      },
      "texture": {
        "smooth": 0.9,
        "paste": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "buttery",
          "toasted flour"
        ],
        "secondary": [],
        "notes": "Cooks for 3-5 minutes until pale golden without browning; retains maximum thickening power."
      },
      "cookingMethods": [
        "whisk",
        "thicken",
        "simmer"
      ],
      "cuisineAffinity": [
        "French",
        "European",
        "American"
      ],
      "preparationTips": [
        "Melt butter and whisk in flour over moderate heat until bubbling and fragrant.",
        "Gradually whisk in warm broth or milk for lump-free velvety sauces."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "chicken broth",
        "milk",
        "nutmeg",
        "white pepper",
        "shallots",
        "garlic"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Store in airtight jar in refrigerator up to 2 weeks.",
      "notes": "Cool before storing."
    }
  },

  cocktail_sauce: {
    "name": "cocktail sauce",
    "aliases": [
      "cocktail sauce",
      "seafood cocktail sauce"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "United States",
      "United Kingdom"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/cocktail_sauce.png",
    "description": "A pungent, tangy chilled seafood condiment blended from tomato ketchup or chili sauce, freshly grated horseradish, lemon juice, and Worcestershire. Its sharp pungency cuts through the richness of poached shrimp, oysters, and crab.",
    "elementalProperties": {
      "Fire": 0.35,
      "Water": 0.3,
      "Earth": 0.25,
      "Air": 0.1
    },
    "qualities": [
      "pungent",
      "tangy",
      "piquant",
      "invigorating"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Sun"
      ],
      "favorableZodiac": [
        "aries",
        "scorpio"
      ],
      "seasonalAffinity": [
        "summer",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 tbsp (34g)",
      "calories": 35,
      "macros": {
        "protein": 0.5,
        "carbs": 8.5,
        "fat": 0.1,
        "fiber": 0.5,
        "sugar": 6.5,
        "sodium": 380
      },
      "vitamins": {
        "C": 0.08
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.5,
        "salty": 0.4,
        "sour": 0.4,
        "bitter": 0,
        "umami": 0.3,
        "spicy": 0.6
      },
      "aroma": {
        "horseradish": 0.8,
        "tomato": 0.7,
        "citrus": 0.6,
        "spicy": 0.7
      },
      "texture": {
        "thick": 0.7,
        "condiment": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "piquant",
          "tangy"
        ],
        "secondary": [
          "horseradish heat",
          "sweet tomato"
        ],
        "notes": "Delivers an immediate nasal clearing sensation that refreshes chilled shellfish."
      },
      "cookingMethods": [
        "mix",
        "chill",
        "dip"
      ],
      "cuisineAffinity": [
        "American",
        "British"
      ],
      "preparationTips": [
        "Mix freshly grated prepared horseradish with ketchup and fresh lemon juice.",
        "Chill for at least 30 minutes before serving to marry pungent flavors."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "poached shrimp",
        "oysters",
        "crab cakes",
        "lemon wedges",
        "tabasco"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep refrigerated in airtight jar for up to 3 weeks.",
      "notes": "Horseradish potency mellows gradually over time."
    }
  },

  dandelion_greens: {
    "name": "dandelion greens",
    "aliases": [
      "dandelion greens",
      "dandelion",
      "dandelion leaves"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Eurasia"
    ],
    "season": [
      "spring",
      "summer"
    ],
    "image_url": "ingredients/dandelion_greens.png",
    "description": "The serrated, deeply green leaves of Taraxacum officinale. Bracingly bitter and mineral-dense, they stimulate digestion and awaken the palate when tossed in warm bacon vinaigrettes or sautéed with garlic and olive oil.",
    "elementalProperties": {
      "Earth": 0.35,
      "Air": 0.35,
      "Water": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "bitter",
      "cleansing",
      "invigorating",
      "mineral-rich"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Jupiter",
        "Mars"
      ],
      "favorableZodiac": [
        "aries",
        "sagittarius"
      ],
      "seasonalAffinity": [
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup chopped (55g)",
      "calories": 25,
      "macros": {
        "protein": 1.5,
        "carbs": 5,
        "fat": 0.4,
        "fiber": 1.9,
        "sugar": 0.4,
        "sodium": 42
      },
      "vitamins": {
        "A": 1.1,
        "K": 4.8,
        "C": 0.2,
        "folate": 0.07
      },
      "minerals": {
        "calcium": 0.1,
        "iron": 0.09,
        "potassium": 0.06
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0.05,
        "sour": 0.05,
        "bitter": 0.85,
        "umami": 0.05,
        "spicy": 0
      },
      "aroma": {
        "grassy": 0.8,
        "herbal": 0.7,
        "earthy": 0.5
      },
      "texture": {
        "crisp": 0.7,
        "tender": 0.6
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "bitter",
          "herbaceous"
        ],
        "secondary": [
          "peppery",
          "earthy"
        ],
        "notes": "Intense bitter glucoside compounds stimulate liver activity and digestive enzymes."
      },
      "cookingMethods": [
        "saute",
        "raw",
        "braise",
        "salad"
      ],
      "cuisineAffinity": [
        "Mediterranean",
        "Italian",
        "Greek",
        "Southern US"
      ],
      "preparationTips": [
        "Harvest or select young spring leaves for milder bitterness.",
        "Balance with rich fats, acids, or a brief blanching in salted water."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "garlic",
        "olive oil",
        "lemon",
        "bacon",
        "baby artichokes",
        "parmesan",
        "watercress"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Wrap in damp paper towel inside produce bag in crisper drawer up to 5 days.",
      "notes": "Wash thoroughly before eating."
    }
  },

  mesclun: {
    "name": "mesclun",
    "aliases": [
      "mesclun",
      "mesclun greens",
      "spring mix",
      "baby greens"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Provence, France"
    ],
    "season": [
      "spring",
      "summer",
      "fall"
    ],
    "image_url": "ingredients/mesclun.png",
    "description": "A traditional Provençal salad assortment of tender baby greens, including chervil, arugula, leafy lettuces, endive, and mizuna. It delivers a harmonious interplay of peppery, bitter, crisp, and sweet sensations.",
    "elementalProperties": {
      "Air": 0.4,
      "Water": 0.3,
      "Earth": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "crisp",
      "tender",
      "refreshing",
      "peppery",
      "light"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mercury",
        "Venus"
      ],
      "favorableZodiac": [
        "gemini",
        "libra"
      ],
      "seasonalAffinity": [
        "spring",
        "summer"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "2 cups (60g)",
      "calories": 12,
      "macros": {
        "protein": 1,
        "carbs": 2,
        "fat": 0.2,
        "fiber": 1.2,
        "sugar": 0.6,
        "sodium": 20
      },
      "vitamins": {
        "A": 0.6,
        "K": 1.2,
        "C": 0.15,
        "folate": 0.12
      },
      "minerals": {
        "potassium": 0.05,
        "iron": 0.05
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.15,
        "salty": 0,
        "sour": 0.05,
        "bitter": 0.3,
        "umami": 0,
        "spicy": 0.2
      },
      "aroma": {
        "fresh": 0.9,
        "herbal": 0.7,
        "grassy": 0.7
      },
      "texture": {
        "tender": 0.9,
        "crisp": 0.8,
        "light": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "fresh",
          "peppery"
        ],
        "secondary": [
          "subtle bitter",
          "sweet"
        ],
        "notes": "Delicate baby leaves should be dressed very lightly immediately prior to serving."
      },
      "cookingMethods": [
        "raw",
        "toss",
        "salad"
      ],
      "cuisineAffinity": [
        "French",
        "Mediterranean",
        "Modern American"
      ],
      "preparationTips": [
        "Spin thoroughly dry in a salad spinner to prevent vinaigrette dilution.",
        "Dress with light lemon vinaigrette right before placing on the table."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "poached chicken",
        "roasted asparagus",
        "goat cheese",
        "walnuts",
        "shallot vinaigrette"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Store in plastic container lined with a dry paper towel in crisper drawer up to 5 days.",
      "notes": "Extremely delicate; avoid crushing."
    }
  },

  treviso: {
    "name": "treviso",
    "aliases": [
      "treviso",
      "radicchio di treviso",
      "treviso chicory"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Veneto, Italy"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/treviso.png",
    "description": "An elongated, sword-shaped variety of Italian red chicory (Cichorium intybus) from Treviso. Featuring deep burgundy leaves with striking white ribs, it offers a milder, sweeter, and more delicate bitterness than round radicchio.",
    "elementalProperties": {
      "Earth": 0.35,
      "Air": 0.35,
      "Water": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "crisp",
      "bittersweet",
      "vibrant",
      "elegant"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Saturn"
      ],
      "favorableZodiac": [
        "scorpio",
        "capricorn"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup shredded (40g)",
      "calories": 10,
      "macros": {
        "protein": 0.6,
        "carbs": 1.8,
        "fat": 0.1,
        "fiber": 0.4,
        "sugar": 0.3,
        "sodium": 9
      },
      "vitamins": {
        "K": 1,
        "C": 0.05,
        "folate": 0.06
      },
      "minerals": {
        "potassium": 0.03
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.15,
        "salty": 0,
        "sour": 0,
        "bitter": 0.6,
        "umami": 0,
        "spicy": 0.05
      },
      "aroma": {
        "vegetal": 0.6,
        "earthy": 0.5,
        "fresh": 0.7
      },
      "texture": {
        "crisp": 0.85,
        "crunchy": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "bittersweet",
          "earthy"
        ],
        "secondary": [
          "nutty",
          "caramelized"
        ],
        "notes": "Grilling or pan-searing tames its bitterness and unlocks rich caramelized sugars."
      },
      "cookingMethods": [
        "grill",
        "raw",
        "roast",
        "braise"
      ],
      "cuisineAffinity": [
        "Italian",
        "Venetian"
      ],
      "preparationTips": [
        "Slice heads lengthwise into quarters, brush with olive oil, and grill over high heat.",
        "Use whole raw leaves as elegant edible boats for nut ricottas and dips."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "pine nuts",
        "ricotta",
        "balsamic reduction",
        "gorgonzola",
        "pancetta",
        "olive oil"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Store unwashed in produce drawer for up to 1-2 weeks.",
      "notes": "Holds freshness better than standard loose leafy greens."
    }
  },

  endive: {
    "name": "endive",
    "aliases": [
      "endive",
      "belgian endive",
      "red endive",
      "red belgian endive"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Belgium",
      "France"
    ],
    "season": [
      "fall",
      "winter",
      "spring"
    ],
    "image_url": "ingredients/endive.png",
    "description": "Tightly wrapped torpedo-shaped heads of chicory forced in dark underground cellars to prevent chlorophyll development. They yield crisp, succulent leaves with a delicate, clean, and mildly bitter flavor profile.",
    "elementalProperties": {
      "Air": 0.35,
      "Earth": 0.35,
      "Water": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "crisp",
      "succulent",
      "mild-bitter",
      "refined"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Mercury"
      ],
      "favorableZodiac": [
        "virgo",
        "cancer"
      ],
      "seasonalAffinity": [
        "winter",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 head (50g)",
      "calories": 9,
      "macros": {
        "protein": 0.5,
        "carbs": 2,
        "fat": 0.1,
        "fiber": 1.5,
        "sugar": 0.2,
        "sodium": 11
      },
      "vitamins": {
        "K": 0.7,
        "folate": 0.18,
        "A": 0.05
      },
      "minerals": {
        "potassium": 0.04
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0,
        "bitter": 0.5,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "clean": 0.9,
        "fresh": 0.8,
        "nutty": 0.4
      },
      "texture": {
        "crisp": 0.9,
        "juicy": 0.8,
        "crunchy": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "crisp",
          "clean bitter"
        ],
        "secondary": [
          "mild sweet",
          "nutty"
        ],
        "notes": "Cut away small cone at the base of the core if you prefer reduced bitterness."
      },
      "cookingMethods": [
        "raw",
        "braise",
        "grill",
        "gratin"
      ],
      "cuisineAffinity": [
        "Belgian",
        "French",
        "European"
      ],
      "preparationTips": [
        "Separate individual leaves to use as crisp scoops for goat cheese and beet salads.",
        "Braise whole in butter, lemon juice, and brown sugar for a decadent classic gratin."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "goat cheese",
        "beets",
        "walnuts",
        "blue cheese",
        "apples",
        "mustard vinaigrette"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep wrapped in paper towel in a dark crisper drawer up to 10 days.",
      "notes": "Keep shielded from light to prevent leaves from turning green and extra bitter."
    }
  },

  radish: {
    "name": "radish",
    "aliases": [
      "radish",
      "radishes",
      "red radish"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Southeast Asia",
      "Mediterranean"
    ],
    "season": [
      "spring",
      "summer",
      "fall"
    ],
    "image_url": "ingredients/radish.png",
    "description": "Crisp, peppery globes of Raphanus sativus with vibrant red skin and snow-white interior. Their glucosinolate bite delivers an invigorating burst of freshness and color to slaws, salads, and grain bowls.",
    "elementalProperties": {
      "Water": 0.45,
      "Air": 0.3,
      "Fire": 0.15,
      "Earth": 0.1
    },
    "qualities": [
      "crisp",
      "peppery",
      "refreshing",
      "piquant"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars"
      ],
      "favorableZodiac": [
        "aries",
        "scorpio"
      ],
      "seasonalAffinity": [
        "spring",
        "summer"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1/2 cup sliced (58g)",
      "calories": 9,
      "macros": {
        "protein": 0.4,
        "carbs": 2,
        "fat": 0.1,
        "fiber": 1,
        "sugar": 1.1,
        "sodium": 23
      },
      "vitamins": {
        "C": 0.14,
        "folate": 0.04
      },
      "minerals": {
        "potassium": 0.04
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0.05,
        "bitter": 0.1,
        "umami": 0,
        "spicy": 0.4
      },
      "aroma": {
        "fresh": 0.8,
        "peppery": 0.8,
        "earthy": 0.4
      },
      "texture": {
        "crisp": 0.95,
        "crunchy": 0.9,
        "juicy": 0.85
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "peppery",
          "pungent"
        ],
        "secondary": [
          "sweet vegetal",
          "refreshing"
        ],
        "notes": "Soaking sliced radishes in ice water increases their crunchiness exponentially."
      },
      "cookingMethods": [
        "raw",
        "pickle",
        "roast",
        "shave"
      ],
      "cuisineAffinity": [
        "French",
        "Mexican",
        "Asian",
        "Global"
      ],
      "preparationTips": [
        "Slice paper-thin on a mandoline for delicate salad garnishes.",
        "Serve whole with sweet butter and flaky sea salt in the French bistro fashion."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "butter",
        "sea salt",
        "cucumbers",
        "wild rice",
        "avocado dressing",
        "chives"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Remove leafy greens and store radishes in a sealed container with a splash of water up to 2 weeks.",
      "notes": "Greens draw moisture from roots if left attached."
    }
  },

  horseradish: {
    "name": "horseradish",
    "aliases": [
      "horseradish",
      "fresh horseradish",
      "freshly grated horseradish",
      "prepared horseradish"
    ],
    "category": "spice",
    "provenance": "manual",
    "origin": [
      "Southeastern Europe",
      "Western Asia"
    ],
    "season": [
      "fall",
      "winter",
      "spring"
    ],
    "image_url": "ingredients/horseradish.png",
    "description": "The rugged, fibrous taproot of Armoracia rusticana. Grating ruptures cell walls, releasing sinigrin and allyl isothiocyanate—a volatile, sinus-clearing vapor that infuses piquant heat into sauces and condiments.",
    "elementalProperties": {
      "Fire": 0.5,
      "Air": 0.3,
      "Earth": 0.15,
      "Water": 0.05
    },
    "qualities": [
      "pungent",
      "piquant",
      "warming",
      "sinus-clearing",
      "invigorating"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars"
      ],
      "favorableZodiac": [
        "aries",
        "scorpio"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp prepared (15g)",
      "calories": 7,
      "macros": {
        "protein": 0.2,
        "carbs": 1.7,
        "fat": 0.1,
        "fiber": 0.5,
        "sugar": 1.2,
        "sodium": 60
      },
      "vitamins": {
        "C": 0.06
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0.15,
        "bitter": 0.1,
        "umami": 0,
        "spicy": 0.9
      },
      "aroma": {
        "pungent": 0.95,
        "sharp": 0.9,
        "sinus": 0.9
      },
      "texture": {
        "grated": 0.8,
        "fibrous": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "intense pungency",
          "sharp heat"
        ],
        "secondary": [
          "mustard-like",
          "earthy"
        ],
        "notes": "Heat is nasal and ephemeral, subsiding quickly without burning the tongue."
      },
      "cookingMethods": [
        "grate",
        "infuse",
        "blend",
        "crust"
      ],
      "cuisineAffinity": [
        "Eastern European",
        "British",
        "American",
        "German"
      ],
      "preparationTips": [
        "Add vinegar immediately after grating to lock in heat; waiting creates harsher bitterness.",
        "Mix with breadcrumbs and herbs to form a piquant crust for roasted salmon."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "salmon",
        "prime rib",
        "sour cream",
        "lemon",
        "beets",
        "cocktail sauce"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Unpeeled root keeps wrapped in damp paper towel in fridge up to 1 month.",
      "notes": "Prepared horseradish keeps refrigerated up to 3 months."
    }
  },

  rapini: {
    "name": "rapini",
    "aliases": [
      "rapini",
      "bunch rapini",
      "broccoli rabe",
      "broccoletti"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Mediterranean",
      "Southern Italy"
    ],
    "season": [
      "fall",
      "winter",
      "spring"
    ],
    "image_url": "ingredients/rapini.png",
    "description": "A cherished Italian green (Brassica rapa subsp. rapa) featuring spiked leaves, tender stems, and small broccoli-like buds. Its assertive, nutty bitterness pairs perfectly with rich sausage, garlic, and chilis.",
    "elementalProperties": {
      "Earth": 0.35,
      "Air": 0.35,
      "Water": 0.2,
      "Fire": 0.1
    },
    "qualities": [
      "bitter",
      "nutty",
      "assertive",
      "nutrient-dense"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Saturn"
      ],
      "favorableZodiac": [
        "aries",
        "capricorn"
      ],
      "seasonalAffinity": [
        "winter",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup chopped (40g)",
      "calories": 9,
      "macros": {
        "protein": 1.3,
        "carbs": 1.1,
        "fat": 0.2,
        "fiber": 1.1,
        "sugar": 0.2,
        "sodium": 22
      },
      "vitamins": {
        "A": 0.4,
        "K": 1.1,
        "C": 0.35,
        "folate": 0.08
      },
      "minerals": {
        "calcium": 0.05,
        "iron": 0.05,
        "potassium": 0.03
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0,
        "sour": 0,
        "bitter": 0.75,
        "umami": 0.1,
        "spicy": 0.1
      },
      "aroma": {
        "vegetal": 0.8,
        "nutty": 0.6,
        "herbal": 0.6
      },
      "texture": {
        "tender": 0.7,
        "crisp": 0.6,
        "toothsome": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "nutty bitter",
          "peppery"
        ],
        "secondary": [
          "earthy green"
        ],
        "notes": "Quick blanching softens bitterness while preserving bright verdant hue."
      },
      "cookingMethods": [
        "blanch",
        "saute",
        "braise",
        "grill"
      ],
      "cuisineAffinity": [
        "Italian",
        "Southern Italian",
        "Mediterranean"
      ],
      "preparationTips": [
        "Blanch in boiling salted water for 1-2 minutes, then sauté in olive oil with garlic and chili flakes.",
        "Toss with black quinoa, arctic char, and capers for balanced alchemical harmony."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "garlic",
        "chili flakes",
        "olive oil",
        "capers",
        "quinoa",
        "arctic char",
        "parmesan"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep loosely wrapped in plastic bag in crisper drawer up to 5 days.",
      "notes": "Trim thick bottom stem ends before cooking."
    }
  },

  stilton_cheese: {
    "name": "stilton cheese",
    "aliases": [
      "stilton",
      "stilton cheese",
      "crumbled stilton cheese",
      "blue stilton"
    ],
    "category": "dairy",
    "provenance": "manual",
    "origin": [
      "Derbyshire / Nottinghamshire, England"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/stilton_cheese.png",
    "description": "An English blue cheese made from pasteurized cow's milk and pierced with stainless steel needles to cultivate veins of Penicillium roqueforti. It boasts a rich, creamy, crumbly texture with mellow, savory blue piquancy.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "pungent",
      "rich",
      "crumbly",
      "savory",
      "penned"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Moon"
      ],
      "favorableZodiac": [
        "taurus",
        "capricorn"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 oz (28g)",
      "calories": 116,
      "macros": {
        "protein": 6.8,
        "carbs": 0.6,
        "fat": 9.8,
        "fiber": 0,
        "sodium": 230
      },
      "vitamins": {
        "A": 0.08,
        "B12": 0.15
      },
      "minerals": {
        "calcium": 0.18,
        "phosphorus": 0.12
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0.6,
        "sour": 0.2,
        "bitter": 0.1,
        "umami": 0.7,
        "spicy": 0.15
      },
      "aroma": {
        "pungent": 0.8,
        "blue": 0.8,
        "buttery": 0.7,
        "earthy": 0.6
      },
      "texture": {
        "crumbly": 0.8,
        "creamy": 0.8,
        "rich": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "blue-pungent",
          "buttery"
        ],
        "secondary": [
          "savory",
          "earthy"
        ],
        "notes": "Mellows into yogurt dressings and melts gloriously over roasted meats."
      },
      "cookingMethods": [
        "crumble",
        "melt",
        "dressing",
        "board"
      ],
      "cuisineAffinity": [
        "British",
        "American"
      ],
      "preparationTips": [
        "Whisk crumbled stilton with Greek yogurt and lemon for hot wings dip.",
        "Serve at room temperature with port wine or dark onion soup."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "hot sauce",
        "yogurt",
        "port wine",
        "walnuts",
        "pears",
        "beef"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Wrap in parchment paper followed by loose plastic wrap in the fridge up to 3 weeks.",
      "notes": "Do not wrap tightly in plastic to allow mold to breathe."
    }
  },

  burdock: {
    "name": "burdock",
    "aliases": [
      "burdock",
      "burdock root",
      "gobo"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Eurasia",
      "Japan"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/burdock.png",
    "description": "The slender, bark-brown taproot of Arctium lappa (gobo). Revered in Japanese cooking and Macrobiotics for its deep earthy aroma, crispy-fibrous bite, and prebiotic inulin content, essential in kinpira and hearty seitan stews.",
    "elementalProperties": {
      "Earth": 0.6,
      "Water": 0.2,
      "Air": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "earthy",
      "strengthening",
      "fibrous",
      "grounding",
      "nourishing"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Venus"
      ],
      "favorableZodiac": [
        "capricorn",
        "taurus",
        "virgo"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup slices (118g)",
      "calories": 85,
      "macros": {
        "protein": 1.8,
        "carbs": 20.5,
        "fat": 0.2,
        "fiber": 3.9,
        "sugar": 3.4,
        "sodium": 6
      },
      "vitamins": {
        "B6": 0.15,
        "folate": 0.08
      },
      "minerals": {
        "potassium": 0.1,
        "manganese": 0.12,
        "magnesium": 0.1
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0,
        "sour": 0,
        "bitter": 0.15,
        "umami": 0.2,
        "spicy": 0
      },
      "aroma": {
        "earthy": 0.9,
        "woody": 0.8,
        "rooty": 0.8
      },
      "texture": {
        "crunchy": 0.9,
        "fibrous": 0.8,
        "toothsome": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "deep earthy",
          "woody"
        ],
        "secondary": [
          "mild sweet"
        ],
        "notes": "Gives broths and stews an unmistakable deep forest-floor foundation."
      },
      "cookingMethods": [
        "braise",
        "saute",
        "stew",
        "kinpira"
      ],
      "cuisineAffinity": [
        "Japanese",
        "East Asian",
        "Macrobiotic"
      ],
      "preparationTips": [
        "Scrape outer skin lightly with back of knife rather than peeling deeply.",
        "Shave with knife (sasagaki) and soak in acidulated water to prevent discoloration."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "sesame oil",
        "soy sauce",
        "carrots",
        "seitan",
        "ginger",
        "mirin"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Wrap in damp paper towel inside plastic bag in crisper drawer up to 2 weeks.",
      "notes": "Keep moist so roots do not dry out."
    }
  },

  poppy_seeds: {
    "name": "poppy seeds",
    "aliases": [
      "poppy seeds",
      "poppy seed",
      "lightly toasted poppy seeds",
      "toppings poppy seeds"
    ],
    "category": "spice",
    "provenance": "manual",
    "origin": [
      "Mediterranean",
      "Central Europe"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/poppy_seeds.png",
    "description": "Tiny slate-blue, kidney-shaped oilseeds harvested from Papaver somniferum. Toasting releases a distinct pleasant nutty aroma and pleasant pop that elevates breads, crackers, lemon pastries, and braised cabbage.",
    "elementalProperties": {
      "Earth": 0.45,
      "Air": 0.3,
      "Fire": 0.15,
      "Water": 0.1
    },
    "qualities": [
      "nutty",
      "crunchy",
      "aromatic",
      "delicate"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Neptune"
      ],
      "favorableZodiac": [
        "pisces",
        "cancer"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp (9g)",
      "calories": 47,
      "macros": {
        "protein": 1.6,
        "carbs": 2.5,
        "fat": 3.7,
        "fiber": 1.7,
        "sugar": 0.3,
        "sodium": 2
      },
      "minerals": {
        "calcium": 0.13,
        "manganese": 0.25,
        "magnesium": 0.08,
        "phosphorus": 0.08
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "nutty": 0.8,
        "toasty": 0.7,
        "floral": 0.3
      },
      "texture": {
        "crunchy": 0.9,
        "tiny": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "nutty",
          "toasty"
        ],
        "secondary": [
          "mild sweet"
        ],
        "notes": "Provides subtle crunch and visual elegance to baked doughs."
      },
      "cookingMethods": [
        "toast",
        "bake",
        "sprinkle",
        "grind"
      ],
      "cuisineAffinity": [
        "Central European",
        "Jewish",
        "Middle Eastern",
        "American"
      ],
      "preparationTips": [
        "Toast in dry skillet over low heat for 1-2 minutes until fragrant.",
        "Grind in coffee mill before making traditional Eastern European pastry fillings."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "lemon",
        "butter",
        "brussels sprouts",
        "carrots",
        "honey",
        "rye"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in airtight jar in cool pantry up to 6 months.",
      "refrigerated": "Keep in refrigerator or freezer up to 1 year to prevent oil rancidity.",
      "notes": "High polyunsaturated fat content requires cool storage."
    }
  },

  carob_powder: {
    "name": "carob powder",
    "aliases": [
      "carob powder",
      "carob",
      "carob flour"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Mediterranean"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/carob_powder.png",
    "description": "A naturally sweet, caffeine-free powder milled from the roasted ripe pods of the carob tree (Ceratonia siliqua). It delivers a gentle, toasty cocoa-adjacent flavor with notes of caramel and malt without stimulant compounds.",
    "elementalProperties": {
      "Earth": 0.5,
      "Air": 0.25,
      "Water": 0.15,
      "Fire": 0.1
    },
    "qualities": [
      "sweet",
      "roasted",
      "soothing",
      "caffeine-free",
      "nutritious"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Saturn"
      ],
      "favorableZodiac": [
        "taurus",
        "capricorn"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "2 tbsp (16g)",
      "calories": 36,
      "macros": {
        "protein": 0.7,
        "carbs": 14.2,
        "fat": 0.1,
        "fiber": 6.4,
        "sugar": 7.9,
        "sodium": 5
      },
      "minerals": {
        "calcium": 0.05,
        "potassium": 0.04
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.6,
        "salty": 0,
        "sour": 0,
        "bitter": 0.1,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "roasted": 0.7,
        "caramel": 0.7,
        "chocolatey": 0.5,
        "malty": 0.6
      },
      "texture": {
        "powder": 0.9,
        "smooth": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "caramel-sweet",
          "malty"
        ],
        "secondary": [
          "cocoa-like"
        ],
        "notes": "Naturally sweet; require less added sugar in recipes than bitter cocoa."
      },
      "cookingMethods": [
        "bake",
        "blend",
        "whisk"
      ],
      "cuisineAffinity": [
        "Mediterranean",
        "Macrobiotic",
        "Health Food"
      ],
      "preparationTips": [
        "Sift before mixing into dry ingredients to prevent clumping.",
        "Pair with walnuts and cinnamon in rustic Mediterranean cakes."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "walnuts",
        "cinnamon",
        "vanilla",
        "oats",
        "almond milk",
        "bananas"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in an airtight jar in a cool pantry up to 2 years.",
      "notes": "Keep dry."
    }
  },

  tapioca: {
    "name": "tapioca",
    "aliases": [
      "large pearl tapioca",
      "tapioca",
      "tapioca pearls",
      "boba tapioca"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "South America",
      "Southeast Asia"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/tapioca.png",
    "description": "Translucent starch pearls extracted from the storage roots of the cassava plant (Manihot esculenta). When simmered in milk or coconut water, they hydrate into delightfully chewy, plump spheres for comforting puddings and fruit parfaits.",
    "elementalProperties": {
      "Earth": 0.6,
      "Water": 0.2,
      "Air": 0.15,
      "Fire": 0.05
    },
    "qualities": [
      "chewy",
      "soothing",
      "translucent",
      "gentle"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon"
      ],
      "favorableZodiac": [
        "cancer",
        "taurus"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1/4 cup dry (38g)",
      "calories": 136,
      "macros": {
        "protein": 0.1,
        "carbs": 33.5,
        "fat": 0,
        "fiber": 0.4,
        "sugar": 1.3,
        "sodium": 1
      },
      "minerals": {
        "iron": 0.06
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "neutral": 0.9
      },
      "texture": {
        "chewy": 0.9,
        "gelatinous": 0.8,
        "smooth": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "neutral"
        ],
        "secondary": [
          "subtle starch"
        ],
        "notes": "Acts as a textural marvel that absorbs milk, coconut, and vanilla flavors."
      },
      "cookingMethods": [
        "soak",
        "simmer",
        "pudding"
      ],
      "cuisineAffinity": [
        "American",
        "Southeast Asian",
        "Brazilian"
      ],
      "preparationTips": [
        "Soak large pearl tapioca in cold liquid for at least 2 hours before cooking.",
        "Simmer gently over low heat while stirring constantly until pearls turn translucent."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "coconut milk",
        "vanilla",
        "mango",
        "cinnamon",
        "heavy cream"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Keep dry pearls in airtight container in pantry up to 2 years.",
      "notes": "Cooked pudding keeps in fridge up to 4 days."
    }
  },

  mam_ruoc: {
    "name": "mam ruoc",
    "aliases": [
      "mam ruoc",
      "fermented shrimp paste",
      "shrimp paste"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Central Vietnam"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/mam_ruoc.png",
    "description": "A dark purple-brown fermented paste made from finely crushed krill (Acetes). Subtler and sweeter than northern mắm tôm, it provides the indispensable, deeply savory and aromatic soul of central Vietnamese Bún Bò Huế.",
    "elementalProperties": {
      "Water": 0.4,
      "Earth": 0.35,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "pungent",
      "umami-rich",
      "fermented",
      "savory"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Neptune",
        "Pluto"
      ],
      "favorableZodiac": [
        "scorpio",
        "pisces"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp (18g)",
      "calories": 22,
      "macros": {
        "protein": 3.5,
        "carbs": 1,
        "fat": 0.3,
        "fiber": 0,
        "sodium": 1800
      },
      "minerals": {
        "calcium": 0.08,
        "iron": 0.05
      },
      "source": "Calculated / Vietnam Food Comp"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0.9,
        "sour": 0,
        "bitter": 0,
        "umami": 0.95,
        "spicy": 0
      },
      "aroma": {
        "pungent": 0.95,
        "fermented": 0.9,
        "seafood": 0.8
      },
      "texture": {
        "paste": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "concentrated umami",
          "pungent fermented"
        ],
        "secondary": [
          "shrimp savor"
        ],
        "notes": "Dissolves into boiling broths to yield deep, fragrant richness without raw fishiness."
      },
      "cookingMethods": [
        "dissolve",
        "saute",
        "broth",
        "dip"
      ],
      "cuisineAffinity": [
        "Vietnamese",
        "Central Vietnamese"
      ],
      "preparationTips": [
        "Dissolve paste in warm water, let grit settle, and pour the clear liquid into the stockpot.",
        "Fry with aromatics (lemongrass, chili, shallots) before adding to soup bases."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "lemongrass",
        "chili oil",
        "beef broth",
        "lime",
        "pork hock",
        "rice vermicelli"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Unopened jars store in pantry up to 2 years.",
      "refrigerated": "Refrigerate tightly sealed after opening.",
      "notes": "Keep sealed to contain aroma."
    }
  },

  udon_noodles: {
    "name": "udon noodles",
    "aliases": [
      "udon",
      "udon noodles",
      "fresh or frozen udon noodles"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "Japan (Sanuki region)"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/udon_noodles.png",
    "description": "Thick, chewy Japanese wheat noodles kneaded with saltwater and aged to develop a springy, toothsome elasticity ('koshi'). They excel in steaming dashi broth, cold dipping sauces, and vigorous stir-fries.",
    "elementalProperties": {
      "Earth": 0.5,
      "Water": 0.3,
      "Air": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "chewy",
      "comforting",
      "springy",
      "satisfying"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Jupiter"
      ],
      "favorableZodiac": [
        "taurus",
        "cancer"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 package cooked (200g)",
      "calories": 210,
      "macros": {
        "protein": 6,
        "carbs": 44,
        "fat": 0.8,
        "fiber": 1.8,
        "sodium": 120
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0.05,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "wheat": 0.7,
        "clean": 0.8
      },
      "texture": {
        "chewy": 0.95,
        "springy": 0.9,
        "smooth": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "clean wheat"
        ],
        "secondary": [
          "mild savory"
        ],
        "notes": "Remarkable capacity to hold broth and slurp smoothly."
      },
      "cookingMethods": [
        "boil",
        "simmer",
        "stir-fry",
        "chill"
      ],
      "cuisineAffinity": [
        "Japanese"
      ],
      "preparationTips": [
        "Frozen Sanuki udon noodles provide superior chew and texture compared to dry shelf-stable varieties.",
        "Rinse thoroughly in cold running water after boiling to wash away surface starch."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "dashi stock",
        "soy sauce",
        "mirin",
        "scallions",
        "tempura",
        "shichimi togarashi"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dry noodles in pantry up to 1 year.",
      "notes": "Frozen noodles keep at 0°F up to 9 months."
    }
  },

  kefalotyri: {
    "name": "kefalotyri",
    "aliases": [
      "kefalotyri",
      "mizithra",
      "kefalotyri or mizithra cheese",
      "kefalograviera"
    ],
    "category": "dairy",
    "provenance": "manual",
    "origin": [
      "Greece",
      "Cyprus"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/kefalotyri.png",
    "description": "A hard, salty yellow Greek cheese made from unpasteurized sheep or goat's milk and aged for at least three months. It delivers sharp, spicy, and tangy notes that make it the supreme cheese for Saganaki and grating over Youvetsi.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "sharp",
      "salty",
      "hard",
      "savory",
      "tangy"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Saturn"
      ],
      "favorableZodiac": [
        "aries",
        "capricorn"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 oz (28g)",
      "calories": 110,
      "macros": {
        "protein": 7.5,
        "carbs": 0.5,
        "fat": 8.8,
        "fiber": 0,
        "sodium": 340
      },
      "minerals": {
        "calcium": 0.22,
        "phosphorus": 0.15
      },
      "source": "USDA / Greek Dairy Standards"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0.8,
        "sour": 0.2,
        "bitter": 0.05,
        "umami": 0.7,
        "spicy": 0.15
      },
      "aroma": {
        "sharp": 0.8,
        "sheep-milk": 0.7,
        "savory": 0.8
      },
      "texture": {
        "hard": 0.85,
        "crumbly": 0.6,
        "grating": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "sharp salty",
          "tangy sheep milk"
        ],
        "secondary": [
          "piquant",
          "nutty"
        ],
        "notes": "High melting point allows it to brown crisply without turning liquid."
      },
      "cookingMethods": [
        "grate",
        "pan-sear",
        "bake",
        "saganaki"
      ],
      "cuisineAffinity": [
        "Greek",
        "Cypriot",
        "Mediterranean"
      ],
      "preparationTips": [
        "Dredge in flour and sear in olive oil for classic flambéed Saganaki.",
        "Grate generously over baked pasta and braised lamb dishes."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "lamb",
        "orzo",
        "cinnamon",
        "tomato sauce",
        "lemon",
        "ouzo"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Wrap in wax paper in the refrigerator up to 2 months.",
      "notes": "Wipe off any surface condensation."
    }
  },

  peppermint_extract: {
    "name": "peppermint extract",
    "aliases": [
      "peppermint extract",
      "mint extract"
    ],
    "category": "spice",
    "provenance": "manual",
    "origin": [
      "Worldwide"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/peppermint_extract.png",
    "description": "A potent culinary flavoring distilled from the essential oils of pure peppermint leaves (Mentha piperita) in alcohol. Rich in cooling menthol, mere drops provide crisp, arctic freshness to chocolate truffles and frostings.",
    "elementalProperties": {
      "Air": 0.4,
      "Fire": 0.35,
      "Water": 0.15,
      "Earth": 0.1
    },
    "qualities": [
      "cooling",
      "refreshing",
      "aromatic",
      "invigorating"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mercury"
      ],
      "favorableZodiac": [
        "gemini",
        "virgo"
      ],
      "seasonalAffinity": [
        "winter",
        "summer"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 tsp (5ml)",
      "calories": 12,
      "macros": {
        "protein": 0,
        "carbs": 0,
        "fat": 0,
        "fiber": 0,
        "sodium": 0
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0.2
      },
      "aroma": {
        "minty": 0.95,
        "fresh": 0.9,
        "menthol": 0.95
      },
      "texture": {
        "liquid": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "menthol cooling",
          "minty"
        ],
        "secondary": [
          "clean"
        ],
        "notes": "Powerful intensity; measure carefully in drops rather than spoonfuls."
      },
      "cookingMethods": [
        "infuse",
        "blend",
        "bake",
        "ganache"
      ],
      "cuisineAffinity": [
        "Pastry",
        "Confectionery",
        "American"
      ],
      "preparationTips": [
        "Add 1/4 teaspoon to dark chocolate ganache for crisp after-dinner mint truffles.",
        "Fold into meringues or ice cream bases off heat to retain volatile aromatics."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "dark chocolate",
        "cocoa",
        "vanilla",
        "heavy cream",
        "strawberries"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in amber glass bottle in cool, dark pantry up to 3 years.",
      "notes": "Keep tightly capped to prevent alcohol evaporation."
    }
  },

  bowtie_pasta: {
    "name": "bowtie pasta",
    "aliases": [
      "bowtie pasta",
      "farfalle",
      "bow tie pasta",
      "gluten free or whole wheat fusilli",
      "whole wheat elbow pasta"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "Lombardy / Emilia-Romagna, Italy"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/bowtie_pasta.png",
    "description": "Charming butterfly-shaped Italian pasta (farfalle) with fluted edges and a pinched center. The thicker center maintains a toothsome al dente resistance while the delicate wings capture light sauces, kasha, and vegetables.",
    "elementalProperties": {
      "Earth": 0.55,
      "Air": 0.25,
      "Water": 0.1,
      "Fire": 0.1
    },
    "qualities": [
      "satisfying",
      "toothsome",
      "versatile",
      "cheerful"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Mercury"
      ],
      "favorableZodiac": [
        "libra",
        "gemini"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "2 oz dry (56g)",
      "calories": 200,
      "macros": {
        "protein": 7,
        "carbs": 42,
        "fat": 1,
        "fiber": 2,
        "sugar": 1,
        "sodium": 0
      },
      "vitamins": {
        "thiamin": 0.2,
        "folate": 0.25
      },
      "minerals": {
        "iron": 0.1
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "wheat": 0.7,
        "clean": 0.8
      },
      "texture": {
        "al dente": 0.9,
        "firm": 0.8,
        "toothsome": 0.85
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "clean semolina"
        ],
        "secondary": [
          "subtle grain"
        ],
        "notes": "Contrasting thickness between center pinch and wings provides delightful textural mouthfeel."
      },
      "cookingMethods": [
        "boil",
        "bake",
        "toss",
        "salad"
      ],
      "cuisineAffinity": [
        "Italian",
        "Jewish American",
        "Mediterranean"
      ],
      "preparationTips": [
        "Cook in plenty of well-salted boiling water until the central pinch is just tender.",
        "Toss with toasted kasha, caramelized onions, and butter for classic Kasha Varnishkes."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "kasha",
        "butter",
        "caramelized onions",
        "peas",
        "cream sauces",
        "parmesan"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dry pasta in airtight container in pantry up to 2 years.",
      "notes": "Keep dry."
    }
  },

  hibiscus_tea: {
    "name": "hibiscus tea",
    "aliases": [
      "hibiscus tea leaves",
      "hibiscus",
      "hibiscus tea",
      "jamaica",
      "flor de jamaica",
      "loose lapsang souchong tea"
    ],
    "category": "beverage",
    "provenance": "manual",
    "origin": [
      "North Africa",
      "Mesoamerica"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/hibiscus_tea.png",
    "description": "The dried calyces of the Hibiscus sabdariffa flower. When steeped, they yield a dazzling ruby-red herbal infusion with a tart, cranberry-like tang, rich in vitamin C and antioxidants for refreshing coolers and syrups.",
    "elementalProperties": {
      "Fire": 0.35,
      "Water": 0.35,
      "Air": 0.2,
      "Earth": 0.1
    },
    "qualities": [
      "tart",
      "vibrant",
      "refreshing",
      "cooling",
      "ruby-red"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Mars"
      ],
      "favorableZodiac": [
        "libra",
        "aries"
      ],
      "seasonalAffinity": [
        "summer",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup brewed (240ml)",
      "calories": 5,
      "macros": {
        "protein": 0.1,
        "carbs": 1,
        "fat": 0,
        "fiber": 0,
        "sugar": 0,
        "sodium": 8
      },
      "vitamins": {
        "C": 0.3
      },
      "minerals": {
        "iron": 0.05,
        "calcium": 0.02
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0,
        "sour": 0.8,
        "bitter": 0.1,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "floral": 0.8,
        "fruity": 0.8,
        "tart": 0.7
      },
      "texture": {
        "liquid": 0.95
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "tart cranberry",
          "floral"
        ],
        "secondary": [
          "citrus"
        ],
        "notes": "Natural citric and malic acids provide sharp, clean refreshment."
      },
      "cookingMethods": [
        "steep",
        "boil",
        "chill",
        "syrup"
      ],
      "cuisineAffinity": [
        "Mexican",
        "African",
        "Caribbean"
      ],
      "preparationTips": [
        "Steep in boiling water for 10-15 minutes with mint leaves and sweeten with agave or sugar.",
        "Serve poured over ice with fresh lime wheels for a vibrant summer cooler."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "fresh mint",
        "lime",
        "agave syrup",
        "ginger",
        "cinnamon",
        "berries"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dried calyces in airtight container away from sunlight up to 2 years.",
      "notes": "Protect from light to maintain bright crimson color."
    }
  },
  bok_choy: {
    "name": "bok choy",
    "aliases": [
      "bok choy",
      "baby bok choy",
      "small heads baby bok choy",
      "leaves bok choy",
      "bok choy stems and leaves",
      "pak choi",
      "pak choi cabbage"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "China"
    ],
    "season": [
      "fall",
      "winter",
      "spring"
    ],
    "image_url": "ingredients/bok_choy.png",
    "description": "A staple variety of Chinese cabbage (Brassica rapa subsp. chinensis) with crisp, juicy white stems and tender dark green leaves. The leaves wilt in seconds while the stems retain a refreshing, mild mustard crunch in broths and stir-fries.",
    "elementalProperties": {
      "Water": 0.45,
      "Earth": 0.3,
      "Air": 0.15,
      "Fire": 0.1
    },
    "qualities": [
      "crisp",
      "refreshing",
      "succulent",
      "nourishing",
      "versatile"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Mercury"
      ],
      "favorableZodiac": [
        "cancer",
        "virgo",
        "pisces"
      ],
      "seasonalAffinity": [
        "fall",
        "winter",
        "spring"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup shredded (70g)",
      "calories": 9,
      "macros": {
        "protein": 1,
        "carbs": 1.5,
        "fat": 0.1,
        "fiber": 0.7,
        "sugar": 0.8,
        "sodium": 45
      },
      "vitamins": {
        "A": 0.6,
        "C": 0.5,
        "K": 0.4,
        "folate": 0.1
      },
      "minerals": {
        "calcium": 0.08,
        "potassium": 0.05,
        "iron": 0.04
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0.05,
        "sour": 0,
        "bitter": 0.1,
        "umami": 0.05,
        "spicy": 0.05
      },
      "aroma": {
        "fresh": 0.8,
        "vegetal": 0.8,
        "grassy": 0.5
      },
      "texture": {
        "crisp": 0.85,
        "juicy": 0.85,
        "tender": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "fresh vegetal",
          "crisp sweet"
        ],
        "secondary": [
          "mild mustard"
        ],
        "notes": "Cook stems first for 1-2 minutes before adding tender leafy tops."
      },
      "cookingMethods": [
        "stir-fry",
        "steam",
        "simmer",
        "slaw"
      ],
      "cuisineAffinity": [
        "Chinese",
        "East Asian",
        "Southeast Asian"
      ],
      "preparationTips": [
        "Slice baby bok choy lengthwise in half to show beautiful internal structure.",
        "Add to hot shiitake broths just before taking off heat to preserve crunch."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "garlic",
        "ginger",
        "sesame oil",
        "shiitake mushrooms",
        "soba",
        "shrimp",
        "soy sauce"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Store unwashed in perforated produce bag in crisper drawer up to 1 week.",
      "notes": "Wash thoroughly between stem crevices before cooking."
    }
  },

  miso: {
    "name": "miso",
    "aliases": [
      "miso",
      "red miso",
      "white miso",
      "shiro miso",
      "aka miso",
      "plus 1 teaspoon red miso",
      "yellow miso"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Japan"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/miso.png",
    "description": "A traditional Japanese seasoning paste created by fermenting cooked soybeans and grains with Aspergillus oryzae koji mold and salt. Aged from months to years, it delivers savory, deeply complex umami and living probiotic depth to broths and marinades.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "umami-rich",
      "fermented",
      "savory",
      "comforting",
      "salty"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Saturn",
        "Moon"
      ],
      "favorableZodiac": [
        "capricorn",
        "virgo",
        "cancer"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp (17g)",
      "calories": 34,
      "macros": {
        "protein": 2.2,
        "carbs": 4.3,
        "fat": 1,
        "fiber": 0.9,
        "sugar": 1.1,
        "sodium": 630
      },
      "vitamins": {
        "K": 0.06,
        "B12": 0.05
      },
      "minerals": {
        "manganese": 0.1,
        "copper": 0.08,
        "zinc": 0.05
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0.8,
        "sour": 0.1,
        "bitter": 0.05,
        "umami": 0.95,
        "spicy": 0
      },
      "aroma": {
        "fermented": 0.9,
        "savory": 0.9,
        "earthy": 0.7,
        "nutty": 0.6
      },
      "texture": {
        "paste": 0.9,
        "smooth": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "intense umami",
          "savory salt"
        ],
        "secondary": [
          "fermented grain",
          "subtle sweet"
        ],
        "notes": "Never boil miso directly; dissolve in warm broth off the heat to preserve live aromas and enzymes."
      },
      "cookingMethods": [
        "dissolve",
        "glaze",
        "marinate",
        "dress"
      ],
      "cuisineAffinity": [
        "Japanese",
        "East Asian",
        "Macrobiotic",
        "Modern Fusion"
      ],
      "preparationTips": [
        "Whisk into dashi broth using a ladle and chopsticks or small whisk.",
        "Combine with mirin and ginger for rich tofu or salmon marinades."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "dashi",
        "tofu",
        "scallions",
        "ginger",
        "mirin",
        "sesame",
        "eggplant",
        "mushrooms"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Keep tightly sealed in refrigerator up to 1 year.",
      "notes": "Surface may darken over time due to slow natural oxidation; does not spoil."
    }
  },

  daikon: {
    "name": "daikon",
    "aliases": [
      "daikon",
      "daikon radish",
      "white radish",
      "japanese radish",
      "chinese radish"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "East Asia"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/daikon.png",
    "description": "A large, cylindrical white winter radish (Raphanus sativus var. longipinnatus) with crisp, juicy flesh. Milder and sweeter than red globe radishes, it becomes meltingly tender and deeply savory when simmered in stews and oden.",
    "elementalProperties": {
      "Water": 0.5,
      "Earth": 0.25,
      "Air": 0.15,
      "Fire": 0.1
    },
    "qualities": [
      "juicy",
      "cleansing",
      "digestible",
      "sweet-peppery",
      "succulent"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Moon",
        "Mars"
      ],
      "favorableZodiac": [
        "cancer",
        "scorpio",
        "pisces"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup diced (100g)",
      "calories": 18,
      "macros": {
        "protein": 0.6,
        "carbs": 4.1,
        "fat": 0.1,
        "fiber": 1.6,
        "sugar": 2.5,
        "sodium": 21
      },
      "vitamins": {
        "C": 0.25,
        "folate": 0.07
      },
      "minerals": {
        "potassium": 0.06,
        "copper": 0.08
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.3,
        "salty": 0,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.1,
        "spicy": 0.2
      },
      "aroma": {
        "fresh": 0.8,
        "clean": 0.8,
        "peppery": 0.4
      },
      "texture": {
        "juicy": 0.9,
        "crisp": 0.85,
        "tender": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "mild sweet",
          "water-crisp"
        ],
        "secondary": [
          "gentle peppery"
        ],
        "notes": "Top near the greens is sweet for salads; bottom root is peppery for cooking."
      },
      "cookingMethods": [
        "simmer",
        "grate",
        "pickle",
        "braise",
        "stew"
      ],
      "cuisineAffinity": [
        "Japanese",
        "Chinese",
        "Korean"
      ],
      "preparationTips": [
        "Peel thick outer skin and round off edges (mentori) before simmering so pieces do not break apart.",
        "Grate raw into daikon oroshi to accompany tempura and grilled fish."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "dashi",
        "soy sauce",
        "seitan",
        "pork",
        "shiitake",
        "kombu",
        "ginger"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "refrigerated": "Wrap unwashed root in plastic in crisper drawer up to 2-3 weeks.",
      "notes": "Slice off green tops before storing."
    }
  },

  chipotle: {
    "name": "chipotle",
    "aliases": [
      "chipotle",
      "dried chipotle",
      "chipotle pepper",
      "chipotle chilies",
      "chipotles in adobo",
      "morita"
    ],
    "category": "spice",
    "provenance": "manual",
    "origin": [
      "Mexico"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/chipotle.png",
    "description": "Smoke-dried ripe red jalapeño chili peppers (Capsicum annuum). The wood-smoking process imparts a deep, smoldering barbecue aroma and balanced, lingering heat that underpins authentic Mexican adobos, bean stews, and salsas.",
    "elementalProperties": {
      "Fire": 0.45,
      "Earth": 0.3,
      "Air": 0.15,
      "Water": 0.1
    },
    "qualities": [
      "smoky",
      "warming",
      "piquant",
      "deep",
      "earthy"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Sun"
      ],
      "favorableZodiac": [
        "aries",
        "scorpio",
        "leo"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 pepper (10g)",
      "calories": 25,
      "macros": {
        "protein": 1,
        "carbs": 4.5,
        "fat": 0.5,
        "fiber": 2,
        "sugar": 1.5,
        "sodium": 5
      },
      "vitamins": {
        "A": 0.45,
        "C": 0.1
      },
      "minerals": {
        "potassium": 0.05,
        "iron": 0.05
      },
      "source": "USDA approximate"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.2,
        "salty": 0,
        "sour": 0.1,
        "bitter": 0.1,
        "umami": 0.3,
        "spicy": 0.7
      },
      "aroma": {
        "smoky": 0.95,
        "roasted": 0.9,
        "peppery": 0.8,
        "earthy": 0.7
      },
      "texture": {
        "leathery": 0.8,
        "chewy": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "smoky heat",
          "earthy chili"
        ],
        "secondary": [
          "tobacco",
          "dried fruit"
        ],
        "notes": "Delivers balanced Scoville heat (2,500–8,000 SHU) coated in rich mesquite smoke."
      },
      "cookingMethods": [
        "rehydrate",
        "simmer",
        "blend",
        "adobo"
      ],
      "cuisineAffinity": [
        "Mexican",
        "Southwestern",
        "Tex-Mex"
      ],
      "preparationTips": [
        "Toast briefly in dry skillet and soak in hot water for 20 minutes before puréeing.",
        "Simmer in pinto bean and black bean stews for hearty Southwestern depth."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "pinto beans",
        "garlic",
        "cumin",
        "oregano",
        "lime",
        "tomatoes",
        "cilantro"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store dried chipotles in airtight glass jar in cool pantry up to 2 years.",
      "notes": "Keep dry."
    }
  },

  papadam: {
    "name": "papadam",
    "aliases": [
      "mini papadam",
      "papadam",
      "papadum",
      "papad",
      "poppadom"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "India"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/papadam.png",
    "description": "A seasoned, disc-shaped Indian flatbread rolled from black gram flour (urad dal), cumin, and spices. When flash-fried or roasted over open flame, it puffs up in seconds into a bubbly, shatteringly crisp cracker.",
    "elementalProperties": {
      "Earth": 0.45,
      "Air": 0.35,
      "Fire": 0.15,
      "Water": 0.05
    },
    "qualities": [
      "crisp",
      "spiced",
      "shattering",
      "appetizing"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mercury",
        "Mars"
      ],
      "favorableZodiac": [
        "gemini",
        "aries"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "2 pieces (25g)",
      "calories": 85,
      "macros": {
        "protein": 6,
        "carbs": 14,
        "fat": 0.5,
        "fiber": 3.5,
        "sodium": 320
      },
      "source": "USDA / Indian Food Composition"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0.4,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.2,
        "spicy": 0.3
      },
      "aroma": {
        "toasty": 0.8,
        "spiced": 0.7,
        "cumin": 0.6
      },
      "texture": {
        "crisp": 0.95,
        "crunchy": 0.95,
        "light": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "toasted lentil",
          "cumin-spiced"
        ],
        "secondary": [
          "savory crunch"
        ],
        "notes": "The ultimate crunchy vessel for curried chicken salads, chutneys, and raitas."
      },
      "cookingMethods": [
        "fry",
        "roast",
        "microwave",
        "canapé"
      ],
      "cuisineAffinity": [
        "Indian",
        "South Asian"
      ],
      "preparationTips": [
        "Fry in 1 inch of hot oil for 2-3 seconds until expanded and crisp; drain vertically on paper towels.",
        "Microwave for 45-60 seconds for an oil-free crispy alternative."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "curried chicken salad",
        "yogurt raita",
        "mango chutney",
        "mint chutney",
        "pickles"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store uncooked dry discs in a sealed plastic bag in the pantry up to 1 year.",
      "notes": "Keep dry."
    }
  },

  cajun_seasoning: {
    "name": "cajun seasoning",
    "aliases": [
      "blackening spice mix",
      "blackened seasoning",
      "cajun seasoning",
      "creole seasoning",
      "blackening seasoning"
    ],
    "category": "spice",
    "provenance": "manual",
    "origin": [
      "Louisiana, United States"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/cajun_seasoning.png",
    "description": "An assertive Louisiana spice blend composed of paprika, cayenne, garlic powder, onion powder, black pepper, white pepper, oregano, and thyme. In blackening, its spices char in butter over cast iron to create a legendary savory crust.",
    "elementalProperties": {
      "Fire": 0.55,
      "Air": 0.25,
      "Earth": 0.15,
      "Water": 0.05
    },
    "qualities": [
      "spicy",
      "smoky",
      "peppery",
      "pungent",
      "warming"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Mars",
        "Sun"
      ],
      "favorableZodiac": [
        "aries",
        "leo",
        "sagittarius"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tsp (3g)",
      "calories": 8,
      "macros": {
        "protein": 0.3,
        "carbs": 1.5,
        "fat": 0.2,
        "fiber": 0.6,
        "sodium": 120
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.1,
        "salty": 0.3,
        "sour": 0,
        "bitter": 0.05,
        "umami": 0.1,
        "spicy": 0.8
      },
      "aroma": {
        "spicy": 0.9,
        "garlic": 0.8,
        "herbal": 0.7,
        "smoky": 0.7
      },
      "texture": {
        "powder": 0.9
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "peppery heat",
          "paprika-garlic"
        ],
        "secondary": [
          "herbal",
          "smoky"
        ],
        "notes": "Forms a deeply aromatic, dark caramelized crust when seared in smoking cast iron with clarified butter."
      },
      "cookingMethods": [
        "blacken",
        "rub",
        "sear",
        "season"
      ],
      "cuisineAffinity": [
        "Cajun",
        "Creole",
        "Southern US"
      ],
      "preparationTips": [
        "Dredge shrimp or fish fillets in melted butter, coat liberally in seasoning, and sear in white-hot skillet.",
        "Ensure high kitchen ventilation during indoor blackening."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "shrimp",
        "catfish",
        "chicken",
        "butter",
        "lemon",
        "corn",
        "rice"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in airtight spice jar in cool, dark pantry up to 1 year.",
      "notes": "Keep dry."
    }
  },

  cocoa_powder: {
    "name": "cocoa powder",
    "aliases": [
      "cocoa",
      "cocoa powder",
      "unsweetened cocoa powder",
      "dutch process cocoa",
      "2 tablespoons cocoa powder",
      "sifted cocoa powder",
      "cocoa powder plus 2 teaspoons for dusting pan"
    ],
    "category": "seasoning",
    "provenance": "manual",
    "origin": [
      "Central and South America"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/cocoa_powder.png",
    "description": "The solid defatted remains of fermented, roasted cacao beans milled into a fine, concentrated powder. It provides deep, intensely rich dark chocolate flavor, complex bitter tannins, and velvety color to soufflés, cakes, and biscotti.",
    "elementalProperties": {
      "Earth": 0.45,
      "Fire": 0.35,
      "Air": 0.15,
      "Water": 0.05
    },
    "qualities": [
      "bitter",
      "rich",
      "intense",
      "deep",
      "roasted"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Pluto",
        "Saturn"
      ],
      "favorableZodiac": [
        "scorpio",
        "capricorn"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 tbsp (5.4g)",
      "calories": 12,
      "macros": {
        "protein": 1,
        "carbs": 3,
        "fat": 0.7,
        "fiber": 1.8,
        "sugar": 0.1,
        "sodium": 1
      },
      "minerals": {
        "magnesium": 0.08,
        "iron": 0.06,
        "copper": 0.1
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0,
        "salty": 0,
        "sour": 0.1,
        "bitter": 0.85,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "chocolate": 0.95,
        "roasted": 0.9,
        "earthy": 0.7
      },
      "texture": {
        "powder": 0.9,
        "velvety": 0.8
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "pure dark chocolate",
          "roasted bitter"
        ],
        "secondary": [
          "earthy",
          "fruity"
        ],
        "notes": "Bloom in hot water or melted butter to unlock fat-soluble and water-soluble chocolate aromatics."
      },
      "cookingMethods": [
        "bloom",
        "bake",
        "sift",
        "dust"
      ],
      "cuisineAffinity": [
        "Pastry",
        "Baking",
        "Global"
      ],
      "preparationTips": [
        "Always sift through a fine mesh strainer before incorporating into batters.",
        "Dust buttered cake pans with cocoa powder instead of flour for seamless dark chocolate cakes."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "vanilla",
        "espresso",
        "butter",
        "sea salt",
        "raspberries",
        "orange",
        "peppermint"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in an airtight container in a cool, dark pantry up to 2 years.",
      "notes": "Do not refrigerate, as condensation causes clumping."
    }
  },

  pita: {
    "name": "pita",
    "aliases": [
      "pita",
      "pita bread",
      "pita breads",
      "pocket bread",
      "greek pita"
    ],
    "category": "grain",
    "provenance": "manual",
    "origin": [
      "Middle East",
      "Eastern Mediterranean"
    ],
    "season": ["spring", "summer", "fall", "winter"],
    "image_url": "ingredients/pita.png",
    "description": "A round, yeast-leavened wheat flatbread native to the Middle East. Baked at blistering heat (>450°F), rapid steam expansion inflates the dough into an internal pocket, creating the iconic vessel for hummus, purées, and shawarma.",
    "elementalProperties": {
      "Earth": 0.5,
      "Air": 0.3,
      "Fire": 0.1,
      "Water": 0.1
    },
    "qualities": [
      "pocketed",
      "tender",
      "bready",
      "versatile"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Venus",
        "Mercury"
      ],
      "favorableZodiac": [
        "taurus",
        "libra"
      ],
      "seasonalAffinity": ["spring", "summer", "fall", "winter"]
    },
    "nutritionalProfile": {
      "serving_size": "1 pita (60g)",
      "calories": 165,
      "macros": {
        "protein": 5.5,
        "carbs": 33,
        "fat": 1,
        "fiber": 1.5,
        "sugar": 1,
        "sodium": 320
      },
      "source": "USDA"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.05,
        "salty": 0.2,
        "sour": 0.05,
        "bitter": 0,
        "umami": 0,
        "spicy": 0
      },
      "aroma": {
        "bready": 0.8,
        "toasted": 0.7,
        "yeast": 0.6
      },
      "texture": {
        "soft": 0.8,
        "pliable": 0.85,
        "chewy": 0.7
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "clean wheat",
          "yeasty"
        ],
        "secondary": [
          "toasted"
        ],
        "notes": "Toast lightly over an open flame to restore pillowy softness and blistered char."
      },
      "cookingMethods": [
        "bake",
        "toast",
        "pocket",
        "dip"
      ],
      "cuisineAffinity": [
        "Middle Eastern",
        "Greek",
        "Mediterranean"
      ],
      "preparationTips": [
        "Warm in skillet or toaster oven for 1 minute before stuffing to prevent tearing.",
        "Cut into wedges, brush with olive oil and za'atar, and bake into crispy pita chips."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "hummus",
        "roasted red pepper purée",
        "chickpeas",
        "tahini",
        "cucumber",
        "za'atar"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Store in tightly sealed bag at room temperature up to 5 days.",
      "notes": "Freezes exceptionally well; toast directly from frozen."
    }
  },

  winter_squash: {
    "name": "winter squash",
    "aliases": [
      "winter squash",
      "butternut squash",
      "acorn squash",
      "pumpkin"
    ],
    "category": "vegetable",
    "provenance": "manual",
    "origin": [
      "Americas"
    ],
    "season": [
      "fall",
      "winter"
    ],
    "image_url": "ingredients/winter_squash.png",
    "description": "Hard-skinned, mature squash varieties (Cucurbita) with dense, sweet golden-orange flesh. Slow roasting caramelizes natural sugars into velvety purées for ravioli fillings, soups, and gratins.",
    "elementalProperties": {
      "Earth": 0.45,
      "Water": 0.3,
      "Fire": 0.15,
      "Air": 0.1
    },
    "qualities": [
      "sweet",
      "dense",
      "comforting",
      "golden",
      "nutritious"
    ],
    "astrologicalProfile": {
      "rulingPlanets": [
        "Sun",
        "Venus"
      ],
      "favorableZodiac": [
        "leo",
        "taurus"
      ],
      "seasonalAffinity": [
        "fall",
        "winter"
      ]
    },
    "nutritionalProfile": {
      "serving_size": "1 cup cubed (116g)",
      "calories": 45,
      "macros": {
        "protein": 1,
        "carbs": 12,
        "fat": 0.2,
        "fiber": 2.8,
        "sugar": 3,
        "sodium": 4
      },
      "vitamins": {
        "A": 0.85,
        "C": 0.2
      },
      "minerals": {
        "potassium": 0.1,
        "magnesium": 0.05
      },
      "source": "USDA FoodData Central"
    },
    "sensoryProfile": {
      "taste": {
        "sweet": 0.5,
        "salty": 0,
        "sour": 0,
        "bitter": 0,
        "umami": 0.1,
        "spicy": 0
      },
      "aroma": {
        "sweet": 0.7,
        "earthy": 0.6,
        "buttery": 0.5
      },
      "texture": {
        "dense": 0.8,
        "velvety": 0.8,
        "smooth": 0.85
      }
    },
    "culinaryProfile": {
      "flavorProfile": {
        "primary": [
          "caramel-sweet",
          "earthy"
        ],
        "secondary": [
          "buttery"
        ],
        "notes": "Blends with sage, brown butter, and pecans into exquisite pasta fillings."
      },
      "cookingMethods": [
        "roast",
        "puree",
        "bake",
        "ravioli"
      ],
      "cuisineAffinity": [
        "Italian",
        "American",
        "Autumnal"
      ],
      "preparationTips": [
        "Roast cut-side down with butter and sage until fork-tender.",
        "Pass through a food mill or ricer for lump-free ravioli filling."
      ]
    },
    "pairingRecommendations": {
      "complementary": [
        "fresh sage",
        "brown butter",
        "pecans",
        "nutmeg",
        "parmesan",
        "ricotta"
      ],
      "contrasting": [],
      "toAvoid": []
    },
    "storage": {
      "pantry": "Whole squash stores in cool pantry for 2-4 months.",
      "notes": "Do not refrigerate whole uncut squash."
    }
  },
};