import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawLegumes: Record<string, Partial<IngredientMapping>> = {
  chickpeas: {
      description: "Also known as garbanzo beans (*Cicer arietinum*), these versatile legumes maintain a firm, meaty texture even after long cooking. Their mild, nutty flavor and high starch-to-protein ratio make them ideal for blending into creamy hummus, roasting until crispy, or bulking up stews.",
    name: "chickpeas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.12,
      Essence: 0.20,
      Matter: 0.36,
      Substance: 0.32,
    },
    qualities: ["hearty", "protein-rich", "versatile"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["all"],
    },
    nutritionalProfile: {
      serving_size: "1 cup cooked (164g)",
      calories: 269,
      macros: {
        protein: 15,
        carbs: 45,
        fat: 4.2,
        fiber: 12.5,
        saturatedFat: 0.4,
        sugar: 8,
        potassium: 477,
        sodium: 11,
      },
      vitamins: { folate: 0.71, B6: 0.11, thiamin: 0.12, C: 0.04 },
      minerals: {
        manganese: 0.84,
        copper: 0.29,
        phosphorus: 0.28,
        iron: 0.26,
        zinc: 0.17,
        magnesium: 0.19,
      },
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  dried_chickpeas: {
      description: "Also known as garbanzo beans (*Cicer arietinum*), these versatile legumes maintain a firm, meaty texture even after long cooking. Their mild, nutty flavor and high starch-to-protein ratio make them ideal for blending into creamy hummus, roasting until crispy, or bulking up stews.\n\n**Selection & Storage:** Dried chickpeas should be uniform in color and unbroken. Store dried beans in an airtight container in a dark pantry; canned chickpeas should be stored at room temperature until opened.",
    name: "dried chickpeas",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.10,
      Essence: 0.18,
      Matter: 0.38,
      Substance: 0.34,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  peanuts: {
      description: "Botanically a legume but culinary treated as a nut (*Arachis hypogaea*), peanuts grow underground. They boast a high fat and protein content that, when roasted, develops complex pyrazines—yielding a deeply savory, universally appealing flavor ideal for both sweet baked goods and savory Asian sauces.\n\n**Selection & Storage:** If buying in the shell, look for clean, unblemished pods that feel heavy. Because of their high oil content, shelled peanuts should be stored in an airtight container in the refrigerator to prevent rancidity.",
    name: "peanuts",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.20,
      Matter: 0.34,
      Substance: 0.32,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
  crushed_peanuts: {
      description: "Botanically a legume but culinary treated as a nut (*Arachis hypogaea*), peanuts grow underground. They boast a high fat and protein content that, when roasted, develops complex pyrazines—yielding a deeply savory, universally appealing flavor ideal for both sweet baked goods and savory Asian sauces.\n\n**Selection & Storage:** If buying in the shell, look for clean, unblemished pods that feel heavy. Because of their high oil content, shelled peanuts should be stored in an airtight container in the refrigerator to prevent rancidity.",
    name: "crushed peanuts",
    elementalProperties: { Fire: 0.15, Water: 0.35, Earth: 0.35, Air: 0.15 },
    alchemicalProperties: {
      Spirit: 0.14,
      Essence: 0.20,
      Matter: 0.34,
      Substance: 0.32,
    },
    qualities: ["nutritious", "versatile", "fresh"],
    category: "vegetables",
    subcategory: "legumes",
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["Cancer", "Taurus", "Capricorn"],
      seasonalAffinity: ["summer", "fall"],
    },
      sensoryProfile: { taste: { sweet: 0.2, salty: 0.0, sour: 0.05, bitter: 0.2, umami: 0.1, spicy: 0.0 }, aroma: { vegetal: 0.7, earthy: 0.3, grassy: 0.3 }, texture: { crisp: 0.5, juicy: 0.3, tender: 0.4 } },
      nutritionalProfile: { serving_size: "1 cup", calories: 40, macros: { protein: 2, carbs: 8, fat: 0.3, fiber: 3 }, vitamins: { C: 0.3, A: 0.2, K: 0.2, folate: 0.15 }, minerals: { potassium: 0.2, manganese: 0.1, iron: 0.05 }, source: "category default" },
      culinaryProfile: { flavorProfile: { primary: ["vegetal"], secondary: ["sweet", "earthy"], notes: "Flavor intensifies with dry-heat methods; brightens with acid." }, cookingMethods: ["saute", "roast", "steam", "grill", "raw"], cuisineAffinity: ["Mediterranean", "Asian", "American", "European"], preparationTips: ["Salt 10-15 min before cooking to draw moisture.", "Finish with acid or fat to balance."] },
      pairingRecommendations: { complementary: ["olive oil", "garlic", "salt", "lemon", "herbs"], contrasting: ["vinegar", "chili", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Crisper drawer, 1-2 weeks.", notes: "Store unwashed; wash just before use to extend freshness." }
},
};

export const legumes: Record<string, IngredientMapping> = fixIngredientMappings(rawLegumes);
