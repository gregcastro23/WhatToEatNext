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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
    season: ["all"],
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
};
