import { fixIngredientMappings } from "@/utils/elementalUtils";

// Define vinegars directly in this file rather than importing from seasonings
const rawVinegars = {
  rice_vinegar: {
      description: "A mild, slightly sweet vinegar made by fermenting rice wine (sake). Its exceptionally low acidity (around 4%) and subtle, floral sweetness make it an unobtrusive, delicate acid essential for seasoning sushi rice and balancing sharp Asian dipping sauces.",
    name: "Rice Vinegar",
    category: "vinegars",
    subCategory: "grain",

    // Base elemental properties (unscaled)
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["Virgo", "Gemini", "Cancer"],
      seasonalAffinity: ["all"],
    },

    // Phase 2: Quantity scaling metadata
    quantityBase: { amount: 15, unit: "ml" }, // Standard serving: 1 tablespoon
    scaledElemental: { Water: 0.4, Air: 0.3, Earth: 0.2, Fire: 0.1 }, // Scaled for harmony (already balanced)
    alchemicalProperties: {
      Spirit: 0.2,
      Essence: 0.3,
      Matter: 0.15,
      Substance: 0.35,
    }, // Derived from scaled elemental
    kineticsImpact: { thermalDirection: -0.1, forceMagnitude: 0.9 }, // Cooling effect, gentle force
    qualities: ["mild", "sweet", "clean", "delicate", "balanced"],
    origin: ["China", "Japan", "Korea"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 5,
      macros: {
        protein: 0,
        carbs: 1.5,
        fat: 0,
        fiber: 0,
        sugar: 0.5,
        sodium: 2,
      },
      acidity: "4-5%",
      notes: "Milder and less acidic than other vinegars",
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  balsamic_vinegar: {
      description: "A deeply complex, dark vinegar originating from Modena, Italy, made from the reduced must (juice) of Trebbiano grapes. Traditional balsamic is aged for decades in wooden barrels, transforming into a thick, sweet, and syrupy elixir, while commercial varieties mimic this with added caramel coloring and thickeners.",
    name: "Balsamic Vinegar",
    category: "vinegars",
    subCategory: "grape",
    elementalProperties: {
      Water: 0.3,
      Earth: 0.4,
      Fire: 0.2,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Venus"],
      favorableZodiac: ["Capricorn", "Libra", "Taurus"],
      seasonalAffinity: ["all"],
    },
    qualities: ["sweet", "complex", "syrupy", "rich"],
    origin: ["Italy"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 14,
      macros: {
        protein: 0.1,
        carbs: 2.7,
        fat: 0,
        fiber: 0,
        sugar: 2.4,
        sodium: 4,
      },
      acidity: "6%",
      vitamins: ["k"],
      minerals: ["calcium", "iron", "magnesium", "phosphorus", "potassium"],
      notes: "Aged in wooden barrels, rich in antioxidants",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  apple_cider_vinegar: {
      description: "A fruity, moderately acidic vinegar made by fermenting apple cider, first into alcohol and then into acetic acid via an *Acetobacter* culture (the \"mother\"). Its subtle apple flavor and mild acidity make it excellent for tenderizing pork marinades, quick pickling, and deglazing pans.",
    name: "Apple Cider Vinegar",
    category: "vinegars",
    subCategory: "fruit",
    elementalProperties: {
      Water: 0.35,
      Earth: 0.25,
      Air: 0.25,
      Fire: 0.15,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["Virgo", "Gemini", "Cancer"],
      seasonalAffinity: ["all"],
    },
    qualities: ["tart", "fruity", "subtly sweet", "robust"],
    origin: ["Ancient Rome", "Colonial America"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 3,
      macros: {
        protein: 0,
        carbs: 0.9,
        fat: 0,
        fiber: 0,
        sugar: 0.4,
        sodium: 1,
      },
      acidity: "5-6%",
      vitamins: ["b1", "b2", "b6"],
      minerals: ["potassium", "calcium", "magnesium"],
      notes: "Contains beneficial enzymes and trace minerals",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  red_wine_vinegar: {
      description: "A sharp, robust vinegar created by fermenting red wine with an *Acetobacter* culture. It retains the complex fruit notes and tannins of the original wine, making it the classic, assertive acidic backbone for traditional French vinaigrettes and hearty beef marinades.",
    name: "Red Wine Vinegar",
    category: "vinegars",
    subCategory: "wine",
    elementalProperties: {
      Water: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["Aries", "Scorpio", "Capricorn"],
      seasonalAffinity: ["all"],
    },
    qualities: ["robust", "tangy", "fruity", "complex"],
    origin: ["Mediterranean", "European"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 2,
      macros: {
        protein: 0,
        carbs: 0.4,
        fat: 0,
        fiber: 0,
        sugar: 0.1,
        sodium: 1,
      },
      acidity: "6-7%",
      vitamins: ["c"],
      minerals: ["iron", "potassium", "magnesium"],
      notes: "Contains antioxidants from red wine",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  sherry_vinegar: {
      description: "A Spanish vinegar made from fermented sherry wine, aged in a complex solera system of oak barrels. It strikes a perfect balance between the sharp bite of wine vinegar and the sweet, nutty, and oxidized complexity of balsamic, making it a profound flavor enhancer for gazpacho and pan sauces.",
    name: "Sherry Vinegar",
    category: "vinegars",
    subCategory: "wine",
    elementalProperties: {
      Water: 0.5,
      Earth: 0.3,
      Fire: 0.1,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Jupiter"],
      favorableZodiac: ["Capricorn", "Sagittarius"],
      seasonalAffinity: ["all"],
    },
    qualities: ["nutty", "complex", "sharp"],
    origin: ["Spain"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 2,
      macros: {
        protein: 0,
        carbs: 0.5,
        fat: 0,
        fiber: 0,
        sugar: 0.1,
        sodium: 1,
      },
      acidity: "7-8%",
      notes: "Aged in oak barrels, rich flavor",
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  white_wine_vinegar: {
      description: "A bright, moderately sharp vinegar made by fermenting white wine. It is significantly less assertive and tannic than red wine vinegar, offering a delicate, slightly floral acidity that perfectly balances lighter dishes like chicken salads, delicate fish, or hollandaise sauce.",
    name: "White Wine Vinegar",
    category: "vinegars",
    subCategory: "wine",
    elementalProperties: {
      Water: 0.45,
      Air: 0.3,
      Earth: 0.15,
      Fire: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["Gemini", "Virgo", "Capricorn"],
      seasonalAffinity: ["all"],
    },
    qualities: ["bright", "crisp", "tangy", "light"],
    origin: ["France", "Italy", "Spain"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 2,
      macros: {
        protein: 0,
        carbs: 0.1,
        fat: 0,
        fiber: 0,
        sugar: 0.1,
        sodium: 1,
      },
      acidity: "5-7%",
      vitamins: ["c"],
      minerals: ["calcium", "potassium"],
      notes: "Light and versatile for dressings",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  champagne_vinegar: {
      description: "A pale, elegant vinegar made by fermenting wine derived from the same grape varieties used to produce Champagne (Chardonnay, Pinot Noir, and Pinot Meunier). It is significantly softer, more delicate, and more floral than standard white wine vinegar, making it the ideal acid for subtle vinaigrettes and delicate fish dishes.",
    name: "Champagne Vinegar",
    category: "vinegars",
    subCategory: "wine",
    elementalProperties: {
      Water: 0.4,
      Air: 0.35,
      Earth: 0.15,
      Fire: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mercury"],
      favorableZodiac: ["Libra", "Gemini", "Aquarius"],
      seasonalAffinity: ["all"],
    },
    qualities: ["delicate", "light", "subtle", "refined"],
    origin: ["France"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 2,
      macros: {
        protein: 0,
        carbs: 0.1,
        fat: 0,
        fiber: 0,
        sugar: 0.1,
        sodium: 1,
      },
      acidity: "5-6%",
      notes: "Made from champagne, delicate flavor",
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  malt_vinegar: {
      description: "A pungent, darkly colored vinegar made by malting barley (converting its starches to sugars), fermenting it into ale, and then into vinegar. It possesses a deeply toasty, nutty, and slightly bitter flavor profile, serving as the traditional, astringent accompaniment to British fish and chips.",
    name: "Malt Vinegar",
    category: "vinegars",
    subCategory: "grain",
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["Capricorn", "Aries"],
      seasonalAffinity: ["all"],
    },
    qualities: ["toasty", "robust", "yeasty", "strong"],
    origin: ["United Kingdom"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 5,
      macros: {
        protein: 0,
        carbs: 1.0,
        fat: 0,
        fiber: 0,
        sugar: 0.4,
        sodium: 1,
      },
      acidity: "5-6%",
      notes: "Made from malted barley, popular for fish and chips",
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  coconut_vinegar: {
      description: "A cloudy, distinctively sharp vinegar made by fermenting the sap of the coconut palm flower (not the coconut water itself). It offers a sharp, yeasty, and slightly sweet flavor profile that is significantly less harsh than white vinegar, serving as a staple acid in Filipino adobo and dipping sauces.",
    name: "Coconut Vinegar",
    category: "vinegars",
    subCategory: "fruit",
    elementalProperties: {
      Water: 0.5,
      Earth: 0.3,
      Air: 0.1,
      Fire: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Jupiter"],
      favorableZodiac: ["Cancer", "Sagittarius"],
      seasonalAffinity: ["all"],
    },
    qualities: ["cloudy", "mildly sweet", "tropical", "tart"],
    origin: ["Southeast Asia", "India"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 3,
      macros: {
        protein: 0,
        carbs: 0.4,
        fat: 0,
        fiber: 0,
        sugar: 0.3,
        sodium: 1,
      },
      acidity: "4-5%",
      minerals: ["potassium", "phosphorus"],
      notes: "Rich in probiotics and enzymes",
        vitamins: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  black_vinegar: {
      description: "Also known as Chinkiang vinegar, a deeply complex, inky-black condiment made from fermented glutinous rice, wheat, or sorghum. It is aged extensively, resulting in a profound, earthy, and slightly smoky flavor profile—resembling a savory, less-sweet balsamic—essential for soup dumplings and braises.",
    name: "Black Vinegar",
    category: "vinegars",
    subCategory: "grain",
    elementalProperties: {
      Earth: 0.5,
      Water: 0.3,
      Fire: 0.1,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Pluto"],
      favorableZodiac: ["Capricorn", "Scorpio"],
      seasonalAffinity: ["all"],
    },
    qualities: ["smoky", "complex", "umami", "aged"],
    origin: ["China"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 5,
      macros: {
        protein: 0.5,
        carbs: 1.3,
        fat: 0,
        fiber: 0,
        sugar: 0.6,
        sodium: 5,
      },
      acidity: "4-5%",
      notes: "Aged Chinese vinegar made from rice and other grains",
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  date_vinegar: {
      description: "A rich, complex, and dark vinegar traditionally made in the Middle East by fermenting dates. It offers a mellow acidity and a profound, fruity sweetness (resembling a less syrupy balsamic), making it an excellent marinade for lamb or a glaze for roasted root vegetables.",
    name: "Date Vinegar",
    category: "vinegars",
    subCategory: "fruit",
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["Leo", "Sagittarius"],
      seasonalAffinity: ["all"],
    },
    qualities: ["sweet", "caramel-like", "robust", "fruity"],
    origin: ["Middle East"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 10,
      macros: {
        protein: 0,
        carbs: 2.5,
        fat: 0,
        fiber: 0,
        sugar: 2.0,
        sodium: 1,
      },
      acidity: "5-6%",
      minerals: ["potassium", "magnesium", "iron"],
      notes: "Rich in antioxidants and minerals",
        vitamins: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
};

// Export fixed vinegars
export const vinegars = fixIngredientMappings(rawVinegars);

// Define artisanal vinegars (premium / (specialty || 1) vinegars)
const rawArtisanalVinegars = {
  aged_balsamic: {
      description: "An acidic condiment, aged balsamic delivers sharpness, brightness, and balance. Acetic acid cuts through fat and richness; specific base material (wine, rice, apple, malt) contributes a distinct secondary flavor.",
    name: "Aged Balsamic Vinegar",
    category: "vinegars",
    subCategory: "artisanal",
    elementalProperties: {
      Earth: 0.5,
      Water: 0.3,
      Fire: 0.1,
      Air: 0.1,
    },
    qualities: ["complex", "syrupy", "rich", "sweet", "premium"],
    origin: ["Modena, Italy", "Reggio Emilia, Italy"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 16,
      macros: {
        protein: 0.1,
        carbs: 3.5,
        fat: 0,
        fiber: 0,
        sugar: 3.0,
        sodium: 5,
      },
      acidity: "4-6%",
      notes: "Aged for 12+ years in wooden barrels",
        vitamins: {},
        minerals: {}
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  fig_vinegar: {
      description: "A rich, fruity vinegar made by fermenting crushed figs. It provides a sweet, jammy, and deeply complex acidity that perfectly balances bitter winter greens (like radicchio) or acts as a reduction glaze for roasted pork.",
    name: "Fig Vinegar",
    category: "vinegars",
    subCategory: "artisanal",
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    qualities: ["fruity", "sweet", "tangy", "aromatic"],
    origin: ["Mediterranean"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 12,
      macros: {
        protein: 0,
        carbs: 2.8,
        fat: 0,
        fiber: 0,
        sugar: 2.3,
        sodium: 2,
      },
      acidity: "5-6%",
      notes: "Made from fermented figs, rich and complex",
        vitamins: {},
        minerals: {}
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
  champagne_rose_vinegar: {
      description: "An acidic condiment, champagne rose vinegar delivers sharpness, brightness, and balance. Acetic acid cuts through fat and richness; specific base material (wine, rice, apple, malt) contributes a distinct secondary flavor.",
    name: "Champagne Rose Vinegar",
    category: "vinegars",
    subCategory: "artisanal",
    elementalProperties: {
      Air: 0.4,
      Water: 0.3,
      Earth: 0.2,
      Fire: 0.1,
    },
    qualities: ["floral", "delicate", "crisp", "aromatic"],
    origin: ["France"],
    nutritionalProfile: {
      serving_size: "1 tbsp (15ml)",
      calories: 5,
      macros: {
        protein: 0,
        carbs: 1.0,
        fat: 0,
        fiber: 0,
        sugar: 0.5,
        sodium: 1,
      },
      acidity: "5-6%",
      notes: "Infused with rose petals, elegant flavor profile",
        vitamins: {},
        minerals: {}
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      culinaryProfile: { flavorProfile: { primary: ["sour"], secondary: ["fruity", "fermented"], notes: "Balances rich and fatty dishes; finishes bright and clean." }, cookingMethods: ["deglaze", "reduce", "dress", "pickle", "marinate"], cuisineAffinity: ["Mediterranean", "Asian", "European"], preparationTips: ["Taste before using — acidity varies by brand.", "Reduce slowly to avoid sharpness burnout."] },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] },
      storage: { pantry: "Sealed bottle, cool dark place, indefinite shelf life.", notes: "Cloudiness or 'mother' sediment is harmless and edible." }
},
};

// Export artisanal vinegars
export const _artisanalVinegars = fixIngredientMappings(rawArtisanalVinegars);

// Add any additional vinegars specific to this directory
const additionalVinegars = {
  // Additional vinegars can be added here
};

// Merge with any additional vinegars and artisanal vinegars
export const _allVinegars = fixIngredientMappings({
  ...rawVinegars,
  ...rawArtisanalVinegars,
  ...additionalVinegars,
});

// Export default for convenience
export default vinegars;
