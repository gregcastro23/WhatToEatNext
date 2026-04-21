import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawAromaticHerbs = {
  thyme: {
      description: "A resilient, woody-stemmed herb (*Thymus vulgaris*) featuring tiny leaves packed with the essential oil thymol. Its earthy, slightly floral, and sharp flavor holds up exceptionally well to long, slow cooking, making it a foundational aromatic for stocks, stews, and roasted meats.",
    name: "Thyme",
    category: "herbs",
    subCategory: "aromatic",
    elementalProperties: { Air: 0.5, Fire: 0.3, Earth: 0.1, Water: 0.1 },
    qualities: ["aromatic", "fresh", "culinary"],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra", "aquarius"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Fire", planet: "Sun" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Air: 0.1 },
        preparationTips: ["Best for drying and preserving"],
      },
      fullMoon: {
        elementalBoost: { Air: 0.2 },
        preparationTips: [
          "Enhanced aromatic properties",
          "Ideal for teas and infusions",
        ],
      },
      waxingCrescent: {
        elementalBoost: { Air: 0.1, Fire: 0.05 },
        preparationTips: ["Good for light cooking applications"],
      },
      waxingGibbous: {
        elementalBoost: { Air: 0.15, Fire: 0.1 },
        preparationTips: ["Perfect for stocks and broths"],
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  rosemary: {
      description: "A fragrant, evergreen shrub (*Salvia rosmarinus*) of the mint family known for its needle-like leaves and robust, pine-and-citrus aroma. Its essential oils contain rosmarinic acid, a powerful antioxidant that helps preserve the flavor and freshness of the foods it's cooked with, making it a classic pairing for roasted meats and root vegetables.\\n\\n",
    name: "Rosemary",
    category: "herbs",
    subCategory: "aromatic",
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    qualities: ["aromatic", "fresh", "culinary"],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mars"],
      favorableZodiac: ["leo", "aries", "sagittarius"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Air", planet: "Jupiter" },
          third: { element: "Earth", planet: "Pluto" },
        },
      },
    },
    lunarPhaseModifiers: {
      newMoon: {
        elementalBoost: { Fire: 0.1, Earth: 0.05 },
        preparationTips: ["Best for subtle infusions", "Good time for drying"],
      },
      waxingCrescent: {
        elementalBoost: { Fire: 0.15, Air: 0.05 },
        preparationTips: ["Good for infused oils"],
      },
      firstQuarter: {
        elementalBoost: { Fire: 0.2 },
        preparationTips: ["Ideal for grilling meats"],
      },
      waxingGibbous: {
        elementalBoost: { Fire: 0.25 },
        preparationTips: ["Perfect for roasts and hearty dishes"],
      },
      fullMoon: {
        elementalBoost: { Fire: 0.3 },
        preparationTips: ["Maximum potency", "Best for medicinal preparations"],
      },
      waningGibbous: {
        elementalBoost: { Fire: 0.2, Air: 0.1 },
        preparationTips: ["Excellent for soups and stews"],
      },
      lastQuarter: {
        elementalBoost: { Fire: 0.15, Earth: 0.1 },
        preparationTips: ["Good for marinades"],
      },
      waningCrescent: {
        elementalBoost: { Fire: 0.1, Earth: 0.15 },
        preparationTips: ["Best for subtle applications"],
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  basil: {
      description: "A tender, aromatic herb (*Ocimum basilicum*) of the mint family, defined by its bright green, delicate leaves. Its complex flavor profile includes notes of anise, clove, and sweet citrus; because its volatile oils evaporate quickly, it should be added at the very end of cooking or used raw.",
    name: "Basil",
    category: "herbs",
    subCategory: "aromatic",
    elementalProperties: { Air: 0.5, Fire: 0.3, Earth: 0.2, Water: 0 },
    qualities: ["aromatic", "fresh", "culinary"],
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "cancer"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Fire", planet: "Moon" },
          third: { element: "Earth", planet: "Venus" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Air: 0.1, Fire: 0.1 },
          preparationTips: ["Best for fresh pesto"],
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Ideal for infused oils"],
        },
      },
    },
      sensoryProfile: { taste: { spicy: 0.1, sweet: 0.3, sour: 0, bitter: 0.2, salty: 0, umami: 0.2 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  // Added herbs with culinary properties
  lovage: {
      description: "A robust, towering herb (*Levisticum officinale*) whose large, dark green leaves pack an intensely concentrated, meaty flavor that tastes like a profound amplification of celery and parsley. Because of its powerful, savory essence, it is the ultimate foundational herb for hearty beef broths and slow-cooked stews.",
    name: "Lovage",
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter"],
      favorableZodiac: ["gemini", "virgo", "sagittarius"],
      signAffinities: ["gemini", "virgo", "sagittarius"],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Mercury" },
          second: { element: "Fire", planet: "Jupiter" },
          third: { element: "Air", planet: "Saturn" },
        },
      },
    },
    qualities: ["warming", "aromatic", "digestive", "stimulating"],
    origin: ["Mediterranean", "Western Asia"],
    season: ["spring", "summer"],
    category: "herbs",
    subCategory: "culinary",
    affinities: ["potato", "chicken", "fish", "tomato", "celery"],
    cookingMethods: ["fresh", "dried", "infused"],
    sensoryProfile: {
      taste: { savory: 0.8, bitter: 0.3, sweet: 0.1 },
      aroma: { herbaceous: 0.7, celery: 0.9, citrus: 0.2 },
      texture: { leafy: 0.8 },
    },
    culinaryUses: ["soups", "stews", "broths", "pickling", "salad dressings"],
    flavor: "Intense celery-like flavor with hints of anise and parsley",
    preparation: {
      fresh: {
        storage: "stem in water, refrigerated",
        duration: "1 week",
        tips: ["use sparingly due to strong flavor"],
      },
      dried: {
        storage: "airtight container",
        duration: "6 months",
        tips: ["crush just before use"],
      },
    },
    modality: "Cardinal",
      nutritionalProfile: { serving_size: "1 tbsp fresh", calories: 1, macros: { protein: 0.1, carbs: 0.2, fat: 0, fiber: 0.1 }, vitamins: { K: 0.3, A: 0.1, C: 0.05 }, minerals: { iron: 0.05, manganese: 0.04 }, source: "category default" },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  "lemon verbena": {
      description: "An aromatic culinary herb, lemon verbena contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "Lemon Verbena",
    elementalProperties: { Air: 0.5, Fire: 0.3, Water: 0.1, Earth: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra", "aquarius"],
      signAffinities: ["gemini", "libra", "aquarius"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Venus", planet: "Venus" },
          third: { element: "Air", planet: "Uranus" },
        },
      },
    },
    qualities: ["cooling", "uplifting", "refreshing", "calming"],
    origin: ["South America"],
    season: ["summer"],
    category: "herbs",
    subCategory: "aromatic",
    affinities: ["fish", "chicken", "desserts", "tea", "fruit"],
    cookingMethods: ["infused", "dried", "fresh"],
    sensoryProfile: {
      taste: { citrus: 0.9, sweet: 0.2, bitter: 0.1 },
      aroma: { lemon: 0.9, floral: 0.5, green: 0.3 },
      texture: { leafy: 0.7 },
    },
    culinaryUses: [
      "herbal teas",
      "desserts",
      "syrups",
      "cocktails",
      "marinades",
    ],
    flavor: "Intense lemon flavor with floral notes, stronger than lemongrass",
    preparation: {
      fresh: {
        storage: "wrapped in damp paper towel, refrigerated",
        duration: "5 days",
        tips: ["bruise leaves to release aroma"],
      },
      dried: {
        storage: "dark glass container",
        duration: "8 months",
        tips: ["retains aroma well when dried"],
      },
      infusions: {
        techniques: ["steep in hot water", "infuse in cream or sugar"],
      },
    },
    modality: "Mutable",
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  savory: {
      description: "An aromatic culinary herb, savory contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "Savory",
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["aries", "scorpio", "capricorn"],
      signAffinities: ["aries", "scorpio", "capricorn"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Earth", planet: "Saturn" },
          third: { element: "Water", planet: "Pluto" },
        },
      },
    },
    qualities: ["warming", "stimulating", "digestive", "astringent"],
    origin: ["Mediterranean"],
    season: ["summer"],
    category: "herbs",
    subCategory: "culinary",
    affinities: ["beans", "lentils", "meat", "poultry", "eggs"],
    cookingMethods: ["dried", "fresh", "infused"],
    culinaryUses: [
      "bean dishes",
      "meat stews",
      "sausages",
      "herb blends",
      "vinegars",
    ],
    flavor: "Peppery, thyme-like flavor with hints of oregano and marjoram",
    varieties: {
      summer_savory: {
        flavor: "milder, with notes of thyme and mint",
        best_uses: ["fresh applications", "delicate dishes"],
      },
      winter_savory: {
        flavor: "stronger, more pungent and earthy",
        best_uses: ["hearty stews", "long cooking times"],
      },
    },
    preparation: {
      fresh: {
        storage: "wrapped in paper towel, refrigerated",
        duration: "1 week",
        tips: ["add at beginning of cooking"],
      },
      dried: {
        storage: "airtight container",
        duration: "1 year",
        tips: ["retains flavor well when dried"],
      },
    },
    modality: "Fixed",
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  "curry leaf": {
      description: "An aromatic culinary herb, curry leaf contributes volatile aromatic compounds that lift, brighten, or perfume a dish. Fresh and dried forms behave very differently — fresh is vivid and grassy, dried is concentrated and earthier.",
    name: "Curry Leaf",
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Jupiter"],
      favorableZodiac: ["aries", "scorpio", "sagittarius"],
      signAffinities: ["aries", "scorpio", "sagittarius"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Earth", planet: "Jupiter" },
          third: { element: "Water", planet: "Pluto" },
        },
      },
    },
    qualities: ["warming", "stimulating", "digestive", "aromatic"],
    origin: ["India", "Sri Lanka"],
    season: ["year-round"],
    category: "herbs",
    subCategory: "aromatic",
    affinities: ["lentils", "coconut", "fish", "vegetables", "rice"],
    cookingMethods: ["fried", "fresh", "dried"],
    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    culinaryUses: [
      "dal",
      "curries",
      "rice dishes",
      "chutneys",
      "vegetable dishes",
    ],
    flavor:
      "Complex citrus and nutty flavor that is the foundation of many Indian dishes",
    preparation: {
      fresh: {
        storage: "wrapped in paper towel, refrigerated",
        duration: "1-2 weeks",
        tips: ["can be frozen for longer storage"],
      },
      cooking: {
        techniques: [
          "tempered in hot oil",
          "fried as first ingredient",
          "whole leaves",
        ],
        tips: ["typically left in dish, though not always eaten"],
      },
    },
    traditional: {
      south_indian: {
        dishes: ["tadka dal", "sambar", "rasam", "coconut chutney"],
        techniques: ["tempered in hot ghee or oil"],
      },
    },
    modality: "Cardinal",
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  chervil: {
      description: "A delicate, highly perishable spring herb (*Anthriscus cerefolium*) featuring lacy, fern-like leaves. It is a cornerstone of the classic French *fines herbes* blend, offering a subtle, refined flavor profile combining parsley and faint anise, which must be added at the absolute last second to avoid destroying its volatile oils.",
    name: "Chervil",
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["virgo", "gemini", "cancer"],
      signAffinities: ["virgo", "gemini", "cancer"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Water", planet: "Moon" },
          third: { element: "Earth", planet: "Venus" },
        },
      },
    },
    qualities: ["cooling", "delicate", "digestive", "balancing"],
    origin: ["Caucasus", "Russia"],
    season: ["spring", "fall"],
    category: "herbs",
    subCategory: "culinary",
    affinities: ["eggs", "fish", "chicken", "potatoes", "carrots"],
    cookingMethods: ["fresh", "garnish", "light cooking"],
    culinaryUses: [
      "fine sauces",
      "egg dishes",
      "salads",
      "soups",
      "fish dishes",
    ],
    flavor: "Delicate flavor similar to parsley with subtle anise notes",
    preparation: {
      fresh: {
        storage: "stem in water, refrigerated",
        duration: "2-3 days",
        tips: ["very perishable", "add at the end of cooking"],
      },
      cooking: {
        techniques: ["add last minute", "quick sauté", "raw in dressings"],
        tips: ["heat destroys flavor quickly"],
      },
    },
    traditionalUses: {},
    modality: "Mutable",
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  dill: {
      description: "A feathery, delicate herb (*Anethum graveolens*) with a distinctively clean, grassy flavor featuring notes of anise and celery. It pairs classicly with mild, sweet ingredients like seafood, cucumbers, and yogurt, and its seeds are essential for pickling.",
    name: "Dill",
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1,
    },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    qualities: ["cooling", "digestive", "balancing"],
    origin: ["Europe", "Asia"],
    season: ["summer", "fall"],
    category: "herbs",
    subCategory: "culinary",
    affinities: ["fish", "potatoes", "eggs", "cucumbers", "yogurt"],
    cookingMethods: ["fresh", "garnish", "pickling"],
    culinaryUses: [
      "pickles",
      "fish dishes",
      "potato dishes",
      "yogurt sauces",
      "salads",
    ],
    flavor: "Fresh, tangy flavor with notes of anise and lemon",
    preparation: {
      fresh: {
        storage: "stem in water, refrigerated",
        duration: "1-2 weeks",
        tips: ["very perishable", "add at the end of cooking"],
      },
      cooking: {
        techniques: ["add last minute", "raw in dressings", "pickling spice"],
        tips: ["heat destroys flavor quickly"],
      },
    },
    traditionalUses: {},
    modality: "Mutable",
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  bay_leaf: {
      description: "The aromatic leaf of the sweet bay tree (*Laurus nobilis*), typically used dried. When simmered in liquid for an extended period, it releases complex, woodsy, floral, and slightly menthol notes that add essential savory depth to soups, stews, and braises.",
    name: "Bay Leaf",
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1,
    },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    qualities: ["warming", "digestive", "aromatic"],
    origin: ["Mediterranean", "Asia Minor"],
    season: ["year-round"],
    category: "herbs",
    subCategory: "culinary",
    affinities: ["tomatoes", "beans", "meats", "soups", "stews"],
    cookingMethods: ["whole leaf", "removed before serving", "long cooking"],
    culinaryUses: ["soups", "stews", "sauces", "braises", "pickling"],
    flavor: "Strong, aromatic flavor with notes of eucalyptus and clove",
    preparation: {
      fresh: {
        storage: "dry storage in cool place",
        duration: "indefinite",
        tips: ["use whole and remove before serving"],
      },
      cooking: {
        techniques: [
          "add early in cooking",
          "whole leaves",
          "remove before serving",
        ],
        tips: ["bitter if overcooked", "enhances long-cooked dishes"],
      },
    },
    traditionalUses: {},
    modality: "Fixed",
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  anise: {
      description: "The seed of the *Pimpinella anisum* plant, yielding a distinctively sweet, highly aromatic, and slightly spicy licorice flavor. It shares the volatile compound anethole with fennel and star anise, making it a foundational flavoring for classic Mediterranean spirits like Ouzo, Sambuca, and Absinthe.",
    name: "Anise",
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1,
    },
    nutritionalProfile: {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    qualities: ["warming", "digestive", "expectorant"],
    origin: ["Mediterranean", "Middle East"],
    season: ["year-round"],
    category: "herbs",
    subCategory: "culinary",
    affinities: ["fish", "pork", "baking", "liqueurs", "pastries"],
    cookingMethods: ["whole seeds", "ground", "infused", "baking"],
    culinaryUses: ["baking", "liqueurs", "pickling", "fish dishes", "pastries"],
    flavor: "Strong licorice-like flavor, sweet and aromatic",
    preparation: {
      fresh: {
        storage: "dry storage in cool place",
        duration: "indefinite",
        tips: ["whole seeds last longer than ground"],
      },
      cooking: {
        techniques: ["toast seeds first", "grind fresh", "infuse in liquids"],
        tips: ["strong flavor - use sparingly", "excellent for baking"],
      },
    },
    traditionalUses: {},
    modality: "Mutable",
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const _aromaticHerbs: Record<string, IngredientMapping> =
  fixIngredientMappings(
    rawAromaticHerbs as Record<string, Partial<IngredientMapping>>,
  );
