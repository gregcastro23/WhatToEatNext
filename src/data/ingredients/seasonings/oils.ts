import type { IngredientMapping } from "@/data/ingredients/types";
// import type { _ } from "@/types/seasons";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Pattern AA: Ingredient Interface Restructuring
// Proper type annotation for raw ingredients to ensure IngredientMapping compatibility
const rawOils: Record<string, Partial<IngredientMapping>> = {
  olive_oil: {
      description: "A liquid fat extracted by pressing whole olives (*Olea europaea*). Extra-virgin olive oil (EVOO) is mechanically extracted without heat or chemicals, retaining high levels of antioxidants and an intensely grassy, peppery, and fruity flavor best reserved for finishing dishes or low-heat cooking.",
    name: "Olive Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Earth: 0.3, Air: 0.2, Water: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 207, fahrenheit: 405 },
    qualities: ["healthy", "versatile", "rich"],
    nutritionalProfile: {
      calories: 119,
      fat_g: 13.5,
      saturated_fat_g: 1.9,
      monounsaturated_fat_g: 9.9,
      polyunsaturated_fat_g: 1.4,
      omega_3_g: 0.1,
      omega_6_g: 1.3,
      omega_9_g: 9.9,
      vitamins: ["e", "k"],
      antioxidants: ["oleocanthal", "oleuropein", "hydroxytyrosol"],
      notes: "Rich in monounsaturated fats and antioxidants",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "2 years",
        storage: "cool, dark place",
        tips: ["avoid direct sunlight", "keep sealed"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "keep away from heat sources",
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["taurus", "leo"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Earth", planet: "Venus" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
      lunarPhaseModifiers: {
        firstQuarter: {
          elementalBoost: { Fire: 0.1, Earth: 0.1 },
          preparationTips: ["Best for dressings"],
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Ideal for finishing dishes"],
        },
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0, sour: 0, bitter: 0.2, umami: 0, spicy: 0.1, rich: 0.8 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "coconut oil": {
      description: "Coconut Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "coconut oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 177,
      fahrenheit: 350,
    },
    qualities: ["sweet", "tropical", "solid"],
    nutritionalProfile: {
      calories: 121,
      fat_g: 13.5,
      saturated_fat_g: 11.2,
      monounsaturated_fat_g: 0.8,
      polyunsaturated_fat_g: 0.2,
      omega_3_g: 0,
      omega_6_g: 0.2,
      omega_9_g: 0.8,
      vitamins: [],
      notes: "High in medium-chain triglycerides (MCTs)",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: ["melts at 24°C / 76°F", "good for medium-heat cooking"],
      },
    },
    storage: {
      container: "glass jar",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Solidifies below room temperature",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  sesame_oil: {
      description: "An incredibly potent oil pressed from sesame seeds (*Sesamum indicum*). Toasted sesame oil (dark brown) provides a massive burst of savory, nutty pyrazines and should be used exclusively as a finishing oil, while plain sesame oil (pale yellow) is neutral and suitable for cooking.",
    name: "Sesame Oil",
    category: "oils",
    subCategory: "finishing",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    seasonality: ["fall", "winter"],
    smokePoint: { celsius: 210, fahrenheit: 410 },
    qualities: ["nutty", "aromatic", "warming"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.9,
      monounsaturated_fat_g: 5.4,
      polyunsaturated_fat_g: 5.6,
      omega_3_g: 0.4,
      omega_6_g: 5.2,
      omega_9_g: 5.4,
      vitamins: ["e", "k", "b6"],
      minerals: ["calcium", "iron", "zinc"],
      antioxidants: ["sesamol", "sesamin", "sesamolin"],
      notes: "Distinctive nutty flavor, common in Asian cuisine",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated after opening",
        tips: ["use sparingly", "toast for enhanced flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "cool, dark place",
      notes: "Refrigerate after opening",
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "cancer"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mercury" },
          second: { element: "Earth", planet: "Moon" },
          third: { element: "Air", planet: "Venus" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Fire: 0.1, Air: 0.1 },
          preparationTips: ["Best for stir-frying"],
        },
        fullMoon: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Ideal for finishing dishes"],
        },
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  ghee: {
      description: "A class of clarified butter originating in ancient India, created by simmering butter until the water evaporates and the milk solids toast and sink to the bottom. Once strained, the resulting pure butterfat boasts an intensely nutty, caramel-like flavor and a massive smoke point (482°F / 250°C), making it ideal for high-heat frying.",
    name: "Ghee",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.45, Water: 0.15, Earth: 0.25, Air: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["taurus", "libra", "leo"],
      seasonalAffinity: ["fall"],
    },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 250, fahrenheit: 482 },
    qualities: ["rich", "nutty", "clarified"],
    nutritionalProfile: {
      calories: 123,
      fat_g: 13.9,
      saturated_fat_g: 8.7,
      monounsaturated_fat_g: 3.7,
      polyunsaturated_fat_g: 0.5,
      omega_3_g: 0.1,
      omega_6_g: 0.4,
      omega_9_g: 3.7,
      vitamins: ["a", "d", "e", "k"],
      notes: "Clarified butter with high smoke point",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "room temperature",
        tips: ["strain thoroughly", "heat until golden"],
      },
    },
    storage: {
      container: "glass jar",
      duration: "12 months",
      temperature: "room temperature",
      notes: "No refrigeration needed",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  avocado_oil: {
      description: "An oil pressed from the fleshy pulp of avocados. It boasts the highest smoke point of any common culinary oil (up to 520°F / 271°C) and a very mild, buttery flavor, making it a premium choice for aggressive high-heat searing, grilling, and broiling.",
    name: "Avocado Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.3, Earth: 0.2, Air: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["taurus", "libra", "leo"],
      seasonalAffinity: ["fall"],
    },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 271, fahrenheit: 520 },
    qualities: ["buttery", "neutral", "high-heat"],
    nutritionalProfile: {
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.6,
      monounsaturated_fat_g: 9.9,
      polyunsaturated_fat_g: 1.9,
      omega_3_g: 0.1,
      omega_6_g: 1.8,
      omega_9_g: 9.9,
      vitamins: ["e"],
      antioxidants: ["lutein"],
      notes: "High smoke point and neutral flavor",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["excellent for high-heat cooking", "good for searing"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store away from direct light and heat",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "peanut oil": {
      description: "Peanut Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "peanut oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.1,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 232,
      fahrenheit: 450,
    },
    qualities: ["nutty", "neutral", "high-heat"],
    nutritionalProfile: {
      calories: 119,
      fat_g: 13.5,
      saturated_fat_g: 2.3,
      monounsaturated_fat_g: 6.2,
      polyunsaturated_fat_g: 4.3,
      omega_3_g: 0,
      omega_6_g: 4.3,
      omega_9_g: 6.2,
      vitamins: ["e"],
      notes: "High smoke point, good for frying",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for deep frying", "neutral taste"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store away from heat and light",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "mustard oil": {
      description: "Mustard Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "mustard oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.5,
      Water: 0.1,
      Earth: 0.2,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 254,
      fahrenheit: 490,
    },
    qualities: ["pungent", "spicy", "strong"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["use sparingly", "traditional in Indian cuisine"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "walnut oil": {
      description: "Walnut Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "walnut oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.2,
    },
    seasonality: ["Autumn", "Winter"],
    smokePoint: {
      celsius: 160,
      fahrenheit: 320,
    },
    qualities: ["nutty", "delicate", "rich"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.2,
      monounsaturated_fat_g: 3.1,
      polyunsaturated_fat_g: 8.7,
      omega_3_g: 1.4,
      omega_6_g: 7.3,
      omega_9_g: 3.1,
      vitamins: ["e", "k"],
      notes: "Excellent omega-3 to omega-6 ratio, rich nutty flavor",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["best unheated", "use for finishing"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6-12 months",
      temperature: "refrigerated",
      notes: "Goes rancid quickly if not refrigerated",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "rice bran oil": {
      description: "Rice Bran Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "rice bran oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 232,
      fahrenheit: 450,
    },
    qualities: ["mild", "neutral", "versatile"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["good for high-heat cooking", "neutral flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "chili oil": {
      description: "Chili Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "chili oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.6,
      Water: 0.1,
      Earth: 0.2,
      Air: 0.1,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 215,
      fahrenheit: 420,
    },
    qualities: ["spicy", "aromatic", "intense"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "room temperature",
        tips: ["use sparingly", "shake before use"],
      },
    },
    storage: {
      container: "glass jar",
      duration: "6 months",
      temperature: "room temperature",
      notes: "Keep away from direct sunlight",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "perilla oil": {
      description: "Perilla Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "perilla oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 165,
      fahrenheit: 330,
    },
    qualities: ["nutty", "grassy", "complex"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use for finishing", "common in Korean cuisine"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated to prevent rancidity",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "camellia oil": {
      description: "Camellia Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "camellia oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 245,
      fahrenheit: 473,
    },
    qualities: ["light", "clean", "delicate"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["traditional in Japanese cuisine", "good for light frying"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "grapeseed oil": {
      description: "Grapeseed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "grapeseed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 216,
      fahrenheit: 421,
    },
    qualities: ["light", "clean", "versatile"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.3,
      monounsaturated_fat_g: 2.2,
      polyunsaturated_fat_g: 9.5,
      omega_3_g: 0.1,
      omega_6_g: 9.4,
      omega_9_g: 2.2,
      vitamins: ["e"],
      antioxidants: ["proanthocyanidins"],
      notes: "Light flavor and high smoke point",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["good for vinaigrettes", "neutral flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "room temperature",
      notes: "Can go rancid quickly if not stored properly",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "macadamia oil": {
      description: "Macadamia Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "macadamia oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 210,
      fahrenheit: 410,
    },
    qualities: ["buttery", "rich", "smooth"],
    preparation: {
      fresh: {
        duration: "4 months",
        storage: "cool, dark place",
        tips: ["great for salad dressings", "light sautéing"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "palm oil": {
      description: "Palm Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "palm oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.4,
      Water: 0.1,
      Earth: 0.4,
      Air: 0.1,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 235,
      fahrenheit: 455,
    },
    qualities: ["rich", "heavy", "stable"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: ["common in African cuisine", "good for deep frying"],
      },
    },
    storage: {
      container: "opaque container",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Solid at room temperature",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "tea seed oil": {
      description: "Tea Seed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "tea seed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 252,
      fahrenheit: 485,
    },
    qualities: ["light", "clean", "subtle"],
    preparation: {
      fresh: {
        duration: "4 months",
        storage: "cool, dark place",
        tips: ["traditional in Chinese cuisine", "good for stir-frying"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "18 months",
      temperature: "room temperature",
      notes: "Keep away from direct light",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "shiso oil": {
      description: "Shiso Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "shiso oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.4,
    },
    seasonality: ["Summer", "Autumn"],
    smokePoint: {
      celsius: 170,
      fahrenheit: 338,
    },
    qualities: ["herbaceous", "aromatic", "delicate"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use as finishing oil", "infuse with fresh shiso"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "3 months",
      temperature: "refrigerated",
      notes: "Best used fresh, store cold",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "argan oil": {
      description: "Argan Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "argan oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 185,
      fahrenheit: 365,
    },
    qualities: ["nutty", "rich", "exotic"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["traditional in Moroccan cuisine", "use as finishing oil"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed in dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "hazelnut oil": {
      description: "Hazelnut Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "hazelnut oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.2,
    },
    seasonality: ["Autumn", "Winter"],
    smokePoint: {
      celsius: 221,
      fahrenheit: 430,
    },
    qualities: ["nutty", "sweet", "aromatic"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["best for finishing", "drizzle on desserts"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "8 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated to prevent rancidity",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "pistachio oil": {
      description: "Pistachio Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "pistachio oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 160,
      fahrenheit: 320,
    },
    qualities: ["nutty", "delicate", "distinctive"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use as finishing oil", "perfect for desserts"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Store in refrigerator after opening",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "hemp seed oil": {
      description: "Hemp Seed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "hemp seed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 165,
      fahrenheit: 330,
    },
    qualities: ["grassy", "nutty", "earthy"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["do not heat", "use for dressings"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Very sensitive to heat and light",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "black seed oil": {
      description: "Black Seed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "black seed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 177,
      fahrenheit: 350,
    },
    qualities: ["pungent", "bitter", "medicinal"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "cool, dark place",
        tips: ["use sparingly", "traditional in Middle Eastern cuisine"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep tightly sealed in dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "almond oil": {
      description: "Almond Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "almond oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 216,
      fahrenheit: 420,
    },
    qualities: ["sweet", "delicate", "nutty"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.1,
      monounsaturated_fat_g: 9.7,
      polyunsaturated_fat_g: 2.3,
      omega_3_g: 0,
      omega_6_g: 2.3,
      omega_9_g: 9.7,
      vitamins: ["e"],
      minerals: ["magnesium", "phosphorus"],
      notes: "Rich in vitamin E and monounsaturated fats",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 }
    },
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: ["great for baking", "use in desserts"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated after opening",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "sunflower oil": {
      description: "Sunflower Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "sunflower oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 232,
      fahrenheit: 450,
    },
    qualities: ["light", "neutral", "versatile"],
    nutritionalProfile: {
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.4,
      monounsaturated_fat_g: 2.7,
      polyunsaturated_fat_g: 9.2,
      omega_3_g: 0,
      omega_6_g: 9.2,
      omega_9_g: 2.7,
      vitamins: ["e"],
      notes: "High in vitamin E and polyunsaturated fats",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "4 months",
        storage: "cool, dark place",
        tips: ["good for frying", "neutral cooking oil"],
      },
    },
    storage: {
      container: "plastic or glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "safflower oil": {
      description: "Safflower Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "safflower oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 266,
      fahrenheit: 510,
    },
    qualities: ["neutral", "light", "high-heat"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: [
          "excellent for high-heat cooking",
          "good substitute for vegetable oil",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Store away from direct light",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "white truffle oil": {
      description: "White Truffle Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "white truffle oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.2,
      Earth: 0.4,
      Air: 0.3,
    },
    seasonality: ["Autumn", "Winter"],
    smokePoint: {
      celsius: 160,
      fahrenheit: 320,
    },
    qualities: ["intense", "earthy", "aromatic"],
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["use sparingly", "finishing oil only", "never heat"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "refrigerated",
      notes: "Use within 6 months of opening",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "flaxseed oil": {
      description: "Flaxseed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "flaxseed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.1,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 107,
      fahrenheit: 225,
    },
    qualities: ["nutty", "earthy", "delicate"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.2,
      monounsaturated_fat_g: 2.5,
      polyunsaturated_fat_g: 9.2,
      omega_3_g: 7.3,
      omega_6_g: 1.9,
      omega_9_g: 2.5,
      vitamins: ["e", "k"],
      notes: "Highest plant source of omega-3 fatty acids, never heat this oil",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "1 month",
        storage: "refrigerated",
        tips: ["never heat", "use in dressings", "shake before use"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "4-6 months",
      temperature: "refrigerated",
      notes: "Highly perishable, keep refrigerated",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "red palm oil": {
      description: "Red Palm Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "red palm oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.4,
      Water: 0.1,
      Earth: 0.4,
      Air: 0.1,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 235,
      fahrenheit: 455,
    },
    qualities: ["rich", "earthy", "robust"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: ["traditional in West African cuisine", "adds color to dishes"],
      },
    },
    storage: {
      container: "opaque container",
      duration: "24 months",
      temperature: "room temperature",
      notes: "May solidify at cooler temperatures",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "roasted pumpkin seed oil": {
      description: "Roasted Pumpkin Seed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "roasted pumpkin seed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.2,
    },
    seasonality: ["Autumn", "Winter"],
    smokePoint: {
      celsius: 160,
      fahrenheit: 320,
    },
    qualities: ["nutty", "rich", "dark"],
    preparation: {
      fresh: {
        duration: "2 months",
        storage: "refrigerated",
        tips: [
          "use as finishing oil",
          "great for salads",
          "traditional in Austrian cuisine",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "refrigerated",
      notes: "Keep refrigerated after opening",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "mustard seed oil": {
      description: "Mustard Seed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "mustard seed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.5,
      Water: 0.1,
      Earth: 0.2,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 254,
      fahrenheit: 490,
    },
    qualities: ["pungent", "sharp", "intense"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: [
          "traditional in Bengali cuisine",
          "heat before use",
          "strong flavor",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "babassu oil": {
      description: "Babassu Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "babassu oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.3,
      Air: 0.2,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 232,
      fahrenheit: 450,
    },
    qualities: ["mild", "nutty", "light"],
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "room temperature",
        tips: [
          "similar to coconut oil",
          "good for frying",
          "traditional in Brazilian cuisine",
        ],
      },
    },
    storage: {
      container: "glass jar",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Solid at room temperature",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "apricot kernel oil": {
      description: "Apricot Kernel Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "apricot kernel oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 204,
      fahrenheit: 400,
    },
    qualities: ["sweet", "nutty", "delicate"],
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: ["good for skin care", "use in desserts", "light cooking"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Keep away from direct light",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      nutritionalProfile: { serving_size: "1 tsp", calories: 10, macros: { protein: 0.5, carbs: 2, fat: 0.2, fiber: 0.2 }, vitamins: {}, minerals: { sodium: 0.5 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  "grape seed oil": {
      description: "Grape Seed Oil is a culinary fat used for heat transfer, texture, and flavor delivery. Its best use depends on smoke point and flavor intensity: neutral oils for high-heat cooking, expressive oils for finishing and emulsions. Limit exposure to heat, oxygen, and light to slow oxidation and preserve flavor integrity.",
    name: "grape seed oil",
    category: "oils",
    elementalProperties: {
      Fire: 0.3,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.3,
    },
    seasonality: ["fall"],
    smokePoint: {
      celsius: 216,
      fahrenheit: 420,
    },
    qualities: ["clean", "light", "versatile"],
    nutritionalProfile: {
      calories: 120,
      fat_g: 13.6,
      saturated_fat_g: 1.3,
      monounsaturated_fat_g: 2.2,
      polyunsaturated_fat_g: 9.5,
      omega_3_g: 0.1,
      omega_6_g: 9.4,
      omega_9_g: 2.2,
      vitamins: ["e"],
      antioxidants: ["proanthocyanidins"],
      notes: "Light flavor and high smoke point",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "3 months",
        storage: "cool, dark place",
        tips: [
          "good for high-heat cooking",
          "neutral flavor",
          "excellent for marinades",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "6 months",
      temperature: "room temperature",
      notes: "Store in a cool, dark place",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  canola_oil: {
      description: "A highly refined, neutral-tasting vegetable oil extracted from a specific, low-erucic acid variety of the rapeseed plant. Its high smoke point (400°F / 204°C) and lack of flavor make it a ubiquitous, all-purpose oil for deep-frying, baking, and emulsifying mild mayonnaises.",
    name: "Canola Oil",
    category: "oils",
    subCategory: "cooking",
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.2, Air: 0.3 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 204, fahrenheit: 400 },
    qualities: ["neutral", "versatile", "heart-healthy"],
    nutritionalProfile: {
      calories: 124,
      fat_g: 14,
      saturated_fat_g: 1.0,
      monounsaturated_fat_g: 8.8,
      polyunsaturated_fat_g: 4.2,
      omega_3_g: 1.2,
      omega_6_g: 3.0,
      omega_9_g: 8.8,
      vitamins: ["e", "k"],
      notes: "Low in saturated fats, good source of omega-3 fatty acids",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "6 months",
        storage: "cool, dark place",
        tips: ["versatile for cooking and baking", "neutral flavor"],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "12 months",
      temperature: "room temperature",
      notes: "Store away from direct light and heat",
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter"],
      favorableZodiac: ["gemini", "sagittarius"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Fire", planet: "Jupiter" },
          third: { element: "Air", planet: "Saturn" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Air: 0.1, Fire: 0.1 },
          preparationTips: ["Good for light sautéing"],
        },
        fullMoon: {
          elementalBoost: { Air: 0.15 },
          preparationTips: ["Best for baking"],
        },
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
  mct_oil: {
      description: "A highly refined supplement oil composed exclusively of Medium-Chain Triglycerides, typically extracted from coconut or palm kernel oil. Because these specific fats are metabolized rapidly by the liver rather than stored, it is extremely popular in ketogenic diets and 'bulletproof' coffee, possessing a completely neutral, flavorless profile.",
    name: "MCT Oil",
    category: "oils",
    subCategory: "specialty",
    elementalProperties: { Fire: 0.4, Water: 0.2, Earth: 0.2, Air: 0.2 },
    seasonality: ["spring", "summer", "fall", "winter"],
    smokePoint: { celsius: 160, fahrenheit: 320 },
    qualities: ["neutral", "odorless", "liquid"],
    nutritionalProfile: {
      calories: 130,
      fat_g: 14,
      saturated_fat_g: 14,
      monounsaturated_fat_g: 0,
      polyunsaturated_fat_g: 0,
      medium_chain_triglycerides_g: 14,
      notes:
        "Contains only medium-chain triglycerides, rapidly metabolized by the body",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        vitamins: {},
        minerals: {}
    },
    preparation: {
      fresh: {
        duration: "12 months",
        storage: "cool, dark place",
        tips: [
          "add to coffee or smoothies",
          "avoid high-heat cooking",
          "tasteless when mixed with foods",
        ],
      },
    },
    storage: {
      container: "dark glass bottle",
      duration: "24 months",
      temperature: "room temperature",
      notes: "Does not require refrigeration",
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["aries", "leo"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Fire", planet: "Sun" },
          third: { element: "Air", planet: "Jupiter" },
        },
      },
      lunarPhaseModifiers: {
        waxingCrescent: {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Best added to morning beverages"],
        },
        newMoon: {
          elementalBoost: { Fire: 0.15, Air: 0.1 },
          preparationTips: ["Ideal for fasting periods"],
        },
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const oils: Record<string, IngredientMapping> =
  fixIngredientMappings(rawOils);

/* Property verification checklist:
All oils must have:
1. name (string);
2. category ('oil');
3. elementalProperties (sum = 1.0);
   - Fire
   - Water
   - Earth
   - Air
4. seasonality (string[]);
5. smokePoint
   - celsius (number);
   - fahrenheit (number);
6. qualities (string[]);
7. preparation
   - fresh
     - duration (string);
     - storage (string);
     - tips (string[]);
8. storage
   - container (string);
   - duration (string);
   - temperature (string);
   - notes (string);
*/
