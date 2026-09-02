import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Fruits ingredients extracted from cuisine files
const rawFruits: Record<string, Partial<IngredientMapping>> = {
  avocado: {
      image_url: "ingredients/avocado.png",
    description: "A unique fruit (*Persea americana*) characterized by its extraordinarily high fat content (mostly monounsaturated oleic acid) and creamy, buttery texture. Its mild, slightly nutty flavor acts as a perfect canvas for acids and salts, making it a staple in both savory dishes and vegan baking.",
    name: "avocado",
    origin: ["Cultivated worldwide"],
    season: ["varies by variety"],
    elementalProperties: { Fire: 0.2, Water: 0.4, Earth: 0.15, Air: 0.25 },
    qualities: ["creamy", "rich", "nutritious", "versatile"],
    category: "fruit",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Sun"],
      favorableZodiac: ["taurus", "leo", "libra"],
      seasonalAffinity: ["summer"],
    },
    nutritionalProfile: {
      serving_size: "1/2 fruit (100g)",
      calories: 160,
      macros: {
        protein: 2,
        carbs: 9,
        fat: 15,
        fiber: 7,
        saturatedFat: 2.1,
        sugar: 0.7,
        potassium: 485,
        sodium: 7,
      },
      vitamins: { K: 0.26, C: 0.17, B6: 0.13, E: 0.14, folate: 0.2 },
      minerals: {
        potassium: 0.14,
        magnesium: 0.07,
        copper: 0.1,
        manganese: 0.07,
      },
    },
      sensoryProfile: { taste: { sweet: 0.7, salty: 0.0, sour: 0.3, bitter: 0.05, umami: 0.0, spicy: 0.0 }, aroma: { fruity: 0.9, floral: 0.3, fresh: 0.7 }, texture: { juicy: 0.7, tender: 0.6, soft: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["sweet"], secondary: ["acidic", "aromatic"], notes: "Ripeness drives use: firm/underripe for savory, ripe for desserts, overripe for purees." }, cookingMethods: ["raw", "roast", "poach", "jam", "dehydrate"], cuisineAffinity: ["Mediterranean", "tropical", "European", "Asian"], preparationTips: ["Taste for ripeness before committing to a technique.", "Acid balances sweetness; salt amplifies both."] },
      pairingRecommendations: { complementary: ["citrus", "honey", "vanilla", "dairy", "mint"], contrasting: ["chili", "salt", "vinegar"], toAvoid: [] },
      storage: { countertop: "Until ripe, then refrigerate.", notes: "Ethylene-producers (apple, banana) ripen neighbors faster — separate if delaying ripening." }
},
  banana: {
      image_url: "ingredients/banana.png",
    description: "A tropical, starch-rich berry (*Musa spp.*) that converts its starches to easily digestible sugars as it ripens, indicated by its skin turning from green to yellow to spotted brown. This enzymatic transformation drastically alters its culinary use, moving from a firm snack to a sweet, mushy base for baking.",
    name: "banana",
    origin: ["Southeast Asia", "Papua New Guinea"],
    season: ["all"],
    elementalProperties: { Fire: 0.15, Water: 0.45, Earth: 0.25, Air: 0.15 },
    qualities: ["sweet", "creamy", "nutritious", "energizing"],
    category: "fruit",
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer", "libra"],
      seasonalAffinity: ["fall"],
    },
    nutritionalProfile: {
      serving_size: "1 medium (118g)",
      calories: 105,
      macros: {
        protein: 1.3,
        carbs: 27,
        fat: 0.4,
        fiber: 3.1,
        saturatedFat: 0.1,
        sugar: 14,
        potassium: 422,
        sodium: 1,
      },
      vitamins: { B6: 0.25, C: 0.17, manganese: 0.13 },
      minerals: { potassium: 0.12, magnesium: 0.08, copper: 0.05 },
    },
      sensoryProfile: { taste: { sweet: 0.7, salty: 0.0, sour: 0.3, bitter: 0.05, umami: 0.0, spicy: 0.0 }, aroma: { fruity: 0.9, floral: 0.3, fresh: 0.7 }, texture: { juicy: 0.7, tender: 0.6, soft: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["sweet"], secondary: ["acidic", "aromatic"], notes: "Ripeness drives use: firm/underripe for savory, ripe for desserts, overripe for purees." }, cookingMethods: ["raw", "roast", "poach", "jam", "dehydrate"], cuisineAffinity: ["Mediterranean", "tropical", "European", "Asian"], preparationTips: ["Taste for ripeness before committing to a technique.", "Acid balances sweetness; salt amplifies both."] },
      pairingRecommendations: { complementary: ["citrus", "honey", "vanilla", "dairy", "mint"], contrasting: ["chili", "salt", "vinegar"], toAvoid: [] },
      storage: { countertop: "Until ripe, then refrigerate.", notes: "Ethylene-producers (apple, banana) ripen neighbors faster — separate if delaying ripening." }
},
  lemon: {
      image_url: "ingredients/lemon.png",
    description: "An intensely sour, acidic citrus fruit (*Citrus limon*) that serves as a fundamental culinary brightener. Its juice provides citric acid to balance rich fats and tenderize proteins, while its zest (the yellow outer skin) contains essential oils that deliver pure floral-citrus aroma without the tartness.",
    name: "lemon",
    origin: ["South Asia", "Mediterranean (cultivated)"],
    season: ["winter", "spring"],
    elementalProperties: { Fire: 0.25, Water: 0.45, Earth: 0.05, Air: 0.25 },
    qualities: ["sour", "bright", "refreshing", "cleansing"],
    category: "fruit",
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mercury"],
      favorableZodiac: ["leo", "gemini", "virgo"],
      seasonalAffinity: ["fall"],
    },
    nutritionalProfile: {
      serving_size: "1 medium (58g)",
      calories: 17,
      macros: {
        protein: 0.6,
        carbs: 5.4,
        fat: 0.2,
        fiber: 1.6,
        saturatedFat: 0,
        sugar: 1.5,
        potassium: 80,
        sodium: 1,
      },
      vitamins: { C: 0.51, B6: 0.02 },
      minerals: { potassium: 0.02 },
    },
      sensoryProfile: { taste: { spicy: 0, sweet: 0.1, sour: 0.9, bitter: 0.3, salty: 0, umami: 0 }, aroma: { fruity: 0.9, floral: 0.3, fresh: 0.7 }, texture: { juicy: 0.7, tender: 0.6, soft: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["sweet"], secondary: ["acidic", "aromatic"], notes: "Ripeness drives use: firm/underripe for savory, ripe for desserts, overripe for purees." }, cookingMethods: ["raw", "roast", "poach", "jam", "dehydrate"], cuisineAffinity: ["Mediterranean", "tropical", "European", "Asian"], preparationTips: ["Taste for ripeness before committing to a technique.", "Acid balances sweetness; salt amplifies both."] },
      pairingRecommendations: { complementary: ["citrus", "honey", "vanilla", "dairy", "mint"], contrasting: ["chili", "salt", "vinegar"], toAvoid: [] },
      storage: { countertop: "Until ripe, then refrigerate.", notes: "Ethylene-producers (apple, banana) ripen neighbors faster — separate if delaying ripening." }
},
  // lemons removed — duplicate of lemon above
  // Removed: preparations, derivatives and non-fruits that leaked in from the
  // cuisine files (juices, zests, olive oil, lemongrass, coconut milk, grape
  // leaves, banana flower, preserves) plus `apples`, a duplicate of the richer
  // `apple` card. Every one was matched by the recipe index only via a base
  // fruit that survives, so no recipe lost a link.
  lime: {
      image_url: "ingredients/lime.png",
    description: "A highly acidic, tropical citrus fruit (*Citrus × aurantiifolia*) whose juice provides a sharper, more floral acidity than lemon. It is essential in cuisines around the equator (Latin American, Southeast Asian) as its bright acidity 'cooks' raw fish in ceviche and balances intense chili heat.",
    name: "lime",
    origin: ["Southeast Asia", "India"],
    season: ["summer", "fall"],
    elementalProperties: { Fire: 0.25, Water: 0.45, Earth: 0.05, Air: 0.25 },
    qualities: ["sour", "bright", "refreshing", "tropical"],
    category: "fruit",
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mercury"],
      favorableZodiac: ["leo", "gemini", "aries"],
      seasonalAffinity: ["fall"],
    },
    nutritionalProfile: {
      serving_size: "1 medium (67g)",
      calories: 20,
      macros: {
        protein: 0.5,
        carbs: 7,
        fat: 0.1,
        fiber: 1.9,
        saturatedFat: 0,
        sugar: 1.1,
        potassium: 68,
        sodium: 1,
      },
      vitamins: { C: 0.32 },
      minerals: { potassium: 0.02 },
    },
      sensoryProfile: { taste: { sweet: 0.7, salty: 0.0, sour: 0.3, bitter: 0.05, umami: 0.0, spicy: 0.0 }, aroma: { fruity: 0.9, floral: 0.3, fresh: 0.7 }, texture: { juicy: 0.7, tender: 0.6, soft: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["sweet"], secondary: ["acidic", "aromatic"], notes: "Ripeness drives use: firm/underripe for savory, ripe for desserts, overripe for purees." }, cookingMethods: ["raw", "roast", "poach", "jam", "dehydrate"], cuisineAffinity: ["Mediterranean", "tropical", "European", "Asian"], preparationTips: ["Taste for ripeness before committing to a technique.", "Acid balances sweetness; salt amplifies both."] },
      pairingRecommendations: { complementary: ["citrus", "honey", "vanilla", "dairy", "mint"], contrasting: ["chili", "salt", "vinegar"], toAvoid: [] },
      storage: { countertop: "Until ripe, then refrigerate.", notes: "Ethylene-producers (apple, banana) ripen neighbors faster — separate if delaying ripening." }
},
};

// Export processed ingredients
export const fruitsIngredients = fixIngredientMappings(rawFruits);
