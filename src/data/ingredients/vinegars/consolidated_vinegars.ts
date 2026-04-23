import type { IngredientMapping } from "@/data/ingredients/types";
import type { /* _ , */} from "@/types/alchemy";
import type { Season } from "@/types/seasons";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawVinegars = {
  rice_vinegar: {
      description: "A mild, slightly sweet vinegar made by fermenting rice wine (sake). Its exceptionally low acidity (around 4%) and subtle, floral sweetness make it an unobtrusive, delicate acid essential for seasoning sushi rice and balancing sharp Asian dipping sauces.",
    name: "Rice Vinegar",
    category: "vinegars",
    subCategory: "grain",
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Earth: 0.2,
      Fire: 0.1,
    },
    qualities: ["mild", "balanced", "clean"],
    origin: ["Asian", "Japanese"],
    nutritionalProfile: {
      calories: 0,
      carbs_g: 0,
      acidity: "4-5%",
      notes: "Very mild and versatile",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        vitamins: {},
        minerals: {}
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Mercury"],
      favorableZodiac: ["cancer", "virgo", "pisces"] as any[],
      elementalAffinity: {
        base: "Water",
        secondary: "Air",
      },
    },
    season: ["fall"] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
        secondary: ["versatile"],
        notes: "Versatile rice vinegar for various uses",
      },
      uses: ["sushi", "salad dressing", "marinades", "pickling"],
      pairings: ["sesame oil", "ginger", "soy sauce"],
        cookingMethods: ["saute", "roast", "mix"]
    },
    storage: {
      temperature: "cool, dry place",
      duration: "2+ years",
      notes: "Keep tightly sealed",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] }
},
  apple_cider_vinegar: {
      description: "A fruity, moderately acidic vinegar made by fermenting apple cider, first into alcohol and then into acetic acid via an *Acetobacter* culture (the \"mother\"). Its subtle apple flavor and mild acidity make it excellent for tenderizing pork marinades, quick pickling, and deglazing pans.",
    name: "Apple Cider Vinegar",
    category: "vinegars",
    subCategory: "fruit",
    elementalProperties: {
      Water: 0.3,
      Fire: 0.3,
      Earth: 0.2,
      Air: 0.2,
    },
    qualities: ["tangy", "fruity", "complex"],
    origin: ["American", "European"],
    nutritionalProfile: {
      calories: 3,
      carbs_g: 0.1,
      acidity: "5-6%",
      notes: "Contains beneficial enzymes when unfiltered",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        vitamins: {},
        minerals: {}
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["taurus", "leo", "libra"] as any[],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      },
    },
    season: ["fall", "winter"] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ["tangy"],
        secondary: ["fruity"],
        notes: "Apple-forward with pleasant acidity",
      },
      uses: ["salad dressing", "marinades", "health tonic", "baking"],
      pairings: ["honey", "dijon mustard", "olive oil"],
        cookingMethods: ["saute", "roast", "mix"]
    },
    storage: {
      temperature: "room temperature",
      duration: "2+ years",
      notes: "Unfiltered versions may develop sediment",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] }
},
  balsamic_vinegar: {
      description: "A deeply complex, dark vinegar originating from Modena, Italy, made from the reduced must (juice) of Trebbiano grapes. Traditional balsamic is aged for decades in wooden barrels, transforming into a thick, sweet, and syrupy elixir, while commercial varieties mimic this with added caramel coloring and thickeners.",
    name: "Balsamic Vinegar",
    category: "vinegars",
    subCategory: "wine",
    elementalProperties: {
      Water: 0.3,
      Fire: 0.4,
      Earth: 0.2,
      Air: 0.1,
    },
    qualities: ["sweet", "complex", "aged"],
    origin: ["Italian", "Modena"],
    nutritionalProfile: {
      calories: 5,
      carbs_g: 1,
      acidity: "6%",
      notes: "Contains natural sugars from grape must",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        vitamins: {},
        minerals: {}
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Jupiter"],
      favorableZodiac: ["taurus", "libra", "sagittarius"] as any[],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      },
    },
    season: ["fall"] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ["sweet"],
        secondary: ["complex"],
        notes: "Rich, sweet-tart flavor from aging",
      },
      uses: ["salad dressing", "reduction sauce", "cheese pairing", "fruit"],
      pairings: ["olive oil", "strawberries", "mozzarella", "arugula"],
        cookingMethods: ["saute", "roast", "mix"]
    },
    storage: {
      temperature: "room temperature",
      duration: "indefinite when properly stored",
      notes: "Quality improves with age",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] }
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
    qualities: ["robust", "tangy", "fruity", "complex"],
    origin: ["Mediterranean", "European"],
    nutritionalProfile: {
      calories: 2,
      carbs_g: 0.4,
      acidity: "6-7%",
      notes: "Contains antioxidants from red wine",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        vitamins: {},
        minerals: {}
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Venus"],
      favorableZodiac: ["aries", "taurus", "scorpio"] as any[],
      elementalAffinity: {
        base: "Fire",
        secondary: "Water",
      },
    },
    season: ["fall"] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ["tangy"],
        secondary: ["robust"],
        notes: "Bold, wine-forward flavor",
      },
      uses: ["vinaigrettes", "marinades", "sauces", "braising"],
      pairings: ["olive oil", "shallots", "herbs", "red meat"],
        cookingMethods: ["saute", "roast", "mix"]
    },
    storage: {
      temperature: "room temperature",
      duration: "2+ years",
      notes: "May develop sediment over time",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] }
},
  white_wine_vinegar: {
      description: "A bright, moderately sharp vinegar made by fermenting white wine. It is significantly less assertive and tannic than red wine vinegar, offering a delicate, slightly floral acidity that perfectly balances lighter dishes like chicken salads, delicate fish, or hollandaise sauce.",
    name: "White Wine Vinegar",
    category: "vinegars",
    subCategory: "wine",
    elementalProperties: {
      Water: 0.4,
      Air: 0.3,
      Fire: 0.2,
      Earth: 0.1,
    },
    qualities: ["crisp", "clean", "bright"],
    origin: ["French", "European"],
    nutritionalProfile: {
      calories: 1,
      carbs_g: 0.3,
      acidity: "6%",
      notes: "Light and clean flavor",
        macros: { protein: 1, carbs: 10, fat: 1, fiber: 1 },
        vitamins: {},
        minerals: {}
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra", "aquarius"] as any[],
      elementalAffinity: {
        base: "Air",
        secondary: "Water",
      },
    },
    season: ["spring", "summer"] as Season[],
    culinaryProfile: {
      flavorProfile: {
        primary: ["crisp"],
        secondary: ["clean"],
        notes: "Light, clean acidity perfect for delicate dishes",
      },
      uses: [
        "light vinaigrettes",
        "white sauces",
        "fish marinades",
        "herb infusions",
      ],
      pairings: ["herbs", "shallots", "white wine", "light oils"],
        cookingMethods: ["saute", "roast", "mix"]
    },
    storage: {
      temperature: "room temperature",
      duration: "2+ years",
      notes: "Keep away from direct light",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.9, bitter: 0.1, umami: 0.1, spicy: 0.0 }, aroma: { sharp: 0.8, fruity: 0.4, fermented: 0.5 }, texture: { liquid: 1.0, sharp: 0.9 } },
      pairingRecommendations: { complementary: ["oil", "honey", "mustard", "shallot", "herbs"], contrasting: ["dairy", "egg"], toAvoid: [] }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const _vinegars: Record<string, IngredientMapping> =
  fixIngredientMappings(
    rawVinegars as unknown as Record<string, Partial<IngredientMapping>>,
  );
