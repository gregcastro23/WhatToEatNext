import { fixIngredientMappings } from "@/utils/elementalUtils";

// Define vinegars directly in this file rather than importing from seasonings
const rawVinegars = {
  rice_vinegar: {
    name: "Rice Vinegar",
    category: "vinegar",
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
      calories: 5,
      carbs_g: 1.5,
      sugar_g: 0.5,
      acidity: "4-5%",
      notes: "Milder and less acidic than other vinegars",
    },
  },
  balsamic_vinegar: {
    name: "Balsamic Vinegar",
    category: "vinegar",
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
      calories: 14,
      carbs_g: 2.7,
      sugar_g: 2.4,
      acidity: "6%",
      vitamins: ["k"],
      minerals: ["calcium", "iron", "magnesium", "phosphorus", "potassium"],
      notes: "Aged in wooden barrels, rich in antioxidants",
    },
  },
  apple_cider_vinegar: {
    name: "Apple Cider Vinegar",
    category: "vinegar",
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
      calories: 3,
      carbs_g: 0.9,
      sugar_g: 0.4,
      acidity: "5-6%",
      vitamins: ["b1", "b2", "b6"],
      minerals: ["potassium", "calcium", "magnesium"],
      notes: "Contains beneficial enzymes and trace minerals",
    },
  },
  red_wine_vinegar: {
    name: "Red Wine Vinegar",
    category: "vinegar",
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
      calories: 2,
      carbs_g: 0.4,
      sugar_g: 0.1,
      acidity: "6-7%",
      vitamins: ["c"],
      minerals: ["iron", "potassium", "magnesium"],
      notes: "Contains antioxidants from red wine",
    },
  },
  sherry_vinegar: {
    name: "Sherry Vinegar",
    category: "vinegar",
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
      calories: 2,
      carbs_g: 0.5,
      sugar_g: 0.1,
      acidity: "7-8%",
      notes: "Aged in oak barrels, rich flavor",
    },
  },
  white_wine_vinegar: {
    name: "White Wine Vinegar",
    category: "vinegar",
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
      calories: 2,
      carbs_g: 0.1,
      sugar_g: 0.1,
      acidity: "5-7%",
      vitamins: ["c"],
      minerals: ["calcium", "potassium"],
      notes: "Light and versatile for dressings",
    },
  },
  champagne_vinegar: {
    name: "Champagne Vinegar",
    category: "vinegar",
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
      calories: 2,
      carbs_g: 0.1,
      sugar_g: 0.1,
      acidity: "5-6%",
      notes: "Made from champagne, delicate flavor",
    },
  },
  malt_vinegar: {
    name: "Malt Vinegar",
    category: "vinegar",
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
      calories: 5,
      carbs_g: 1.0,
      sugar_g: 0.4,
      acidity: "5-6%",
      notes: "Made from malted barley, popular for fish and chips",
    },
  },
  coconut_vinegar: {
    name: "Coconut Vinegar",
    category: "vinegar",
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
      calories: 3,
      carbs_g: 0.4,
      sugar_g: 0.3,
      acidity: "4-5%",
      minerals: ["potassium", "phosphorus"],
      notes: "Rich in probiotics and enzymes",
    },
  },
  black_vinegar: {
    name: "Black Vinegar",
    category: "vinegar",
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
      calories: 5,
      carbs_g: 1.3,
      sugar_g: 0.6,
      acidity: "4-5%",
      notes: "Aged Chinese vinegar made from rice and other grains",
    },
  },
  date_vinegar: {
    name: "Date Vinegar",
    category: "vinegar",
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
      calories: 10,
      carbs_g: 2.5,
      sugar_g: 2.0,
      acidity: "5-6%",
      minerals: ["potassium", "magnesium", "iron"],
      notes: "Rich in antioxidants and minerals",
    },
  },
};

// Export fixed vinegars
export const vinegars = fixIngredientMappings(rawVinegars);

// Define artisanal vinegars (premium / (specialty || 1) vinegars)
const rawArtisanalVinegars = {
  aged_balsamic: {
    name: "Aged Balsamic Vinegar",
    category: "vinegar",
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
      calories: 16,
      carbs_g: 3.5,
      sugar_g: 3.0,
      acidity: "4-6%",
      notes: "Aged for 12+ years in wooden barrels",
    },
  },
  fig_vinegar: {
    name: "Fig Vinegar",
    category: "vinegar",
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
      calories: 12,
      carbs_g: 2.8,
      sugar_g: 2.3,
      acidity: "5-6%",
      notes: "Made from fermented figs, rich and complex",
    },
  },
  champagne_rose_vinegar: {
    name: "Champagne Rose Vinegar",
    category: "vinegar",
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
      calories: 5,
      carbs_g: 1.0,
      sugar_g: 0.5,
      acidity: "5-6%",
      notes: "Infused with rose petals, elegant flavor profile",
    },
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
