import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Herbs ingredients extracted from cuisine files
// NOTE: pork_sausage was removed — it was incorrectly placed here (it's a meat, not an herb)
const rawHerbs: Record<string, Partial<IngredientMapping>> = {
  thyme: {
      description: "A resilient, woody-stemmed herb (*Thymus vulgaris*) featuring tiny leaves packed with the essential oil thymol. Its earthy, slightly floral, and sharp flavor holds up exceptionally well to long, slow cooking, making it a foundational aromatic for stocks, stews, and roasted meats.",
    name: "thyme",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "earthy", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 tsp dried (1g)",
      calories: 3,
      macros: {
        protein: 0.1,
        carbs: 0.6,
        fat: 0.1,
        fiber: 0.4,
        saturatedFat: 0,
        sugar: 0,
        potassium: 11,
        sodium: 1,
      },
      vitamins: { K: 0.05, C: 0.01 },
      minerals: { iron: 0.1, manganese: 0.04 },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_thyme: {
      description: "A resilient, woody-stemmed herb (*Thymus vulgaris*) featuring tiny leaves packed with the essential oil thymol. Its earthy, slightly floral, and sharp flavor holds up exceptionally well to long, slow cooking, making it a foundational aromatic for stocks, stews, and roasted meats.\n\n**Selection & Storage:** Look for bright green, fragrant sprigs without woody or dried-out tips. Store fresh thyme wrapped loosely in a damp paper towel inside a plastic bag in the refrigerator's crisper drawer.",
    name: "fresh thyme",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp fresh (2.4g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.6,
        fat: 0,
        fiber: 0.3,
        sugar: 0,
        sodium: 0,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  sage: {
      description: "A hardy herb (*Salvia officinalis*) with velvety, grey-green leaves and a highly assertive, pine-like, and slightly astringent aroma. Because its flavor is so robust and somewhat resinous, it pairs perfectly with fatty meats like pork and sausage, or browned butter sauces.",
    name: "sage",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 tsp dried (0.7g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.4,
        fat: 0.1,
        fiber: 0.3,
        sugar: 0,
        sodium: 0,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_mint: {
      description: "A rapidly spreading, aromatic herb (*Mentha*) characterized by the cooling compound menthol. It provides a sharp, refreshing contrast to rich or spicy dishes, and is utilized globally in everything from Middle Eastern lamb marinades to Southeast Asian salads and sweet desserts.\n\n**Selection & Storage:** Look for perky, bright green leaves without dark spots or wilting. Store unwashed mint wrapped in a lightly damp paper towel inside a plastic bag in the crisper drawer.",
    name: "fresh mint",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "2 tbsp fresh (3.2g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.5,
        fat: 0,
        fiber: 0.3,
        sugar: 0,
        sodium: 1,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  fresh_sage: {
      description: "A hardy herb (*Salvia officinalis*) with velvety, grey-green leaves and a highly assertive, pine-like, and slightly astringent aroma. Because its flavor is so robust and somewhat resinous, it pairs perfectly with fatty meats like pork and sausage, or browned butter sauces.\n\n**Selection & Storage:** Look for fresh, pliable leaves that are fuzzy and aromatic; avoid dried-out or black-spotted leaves. Store wrapped in a slightly damp paper towel in a plastic bag in the refrigerator.",
    name: "fresh sage",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp fresh (2g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.4,
        fat: 0.1,
        fiber: 0.3,
        sugar: 0,
        sodium: 0,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  bay_leaf: {
      description: "The aromatic leaf of the sweet bay tree (*Laurus nobilis*), typically used dried. When simmered in liquid for an extended period, it releases complex, woodsy, floral, and slightly menthol notes that add essential savory depth to soups, stews, and braises.",
    name: "bay leaf",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 leaf (0.6g)",
      calories: 2,
      macros: {
        protein: 0,
        carbs: 0.5,
        fat: 0,
        fiber: 0.2,
        sugar: 0,
        sodium: 0,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  flat_leaf_parsley: {
      description: "A mild, grassy, and slightly bitter herb (*Petroselinum crispum*) available in curly (best for garnishing) and flat-leaf (best for cooking) varieties. Its clean, mineral-rich flavor acts as a culinary palate cleanser, cutting through heavy fats and brightening rich stews and sauces.\n\n**Selection & Storage:** Choose bunches with vibrant, dark green leaves and firm stems. Store it by trimming the ends and placing the stems in a jar of water in the refrigerator, covered loosely with a plastic bag.",
    name: "flat-leaf parsley",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup chopped (15g)",
      calories: 5,
      macros: {
        protein: 0.4,
        carbs: 0.9,
        fat: 0.1,
        fiber: 0.5,
        sugar: 0.1,
        sodium: 8,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  oregano: {
      description: "A robust, highly aromatic herb (*Origanum vulgare*) essential to Mediterranean and Mexican cuisines. Unlike delicate herbs, its pungent, slightly bitter, and peppery flavor actually deepens and improves when dried, making it a powerful seasoning for tomato sauces and grilled meats.",
    name: "oregano",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "peppery", "Mediterranean"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 tsp dried (1g)",
      calories: 3,
      macros: {
        protein: 0.1,
        carbs: 0.7,
        fat: 0,
        fiber: 0.4,
        saturatedFat: 0,
        sugar: 0,
        potassium: 13,
        sodium: 0,
      },
      vitamins: { K: 0.09 },
      minerals: { iron: 0.04, manganese: 0.03, calcium: 0.02 },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  parsley: {
      description: "A mild, grassy, and slightly bitter herb (*Petroselinum crispum*) available in curly (best for garnishing) and flat-leaf (best for cooking) varieties. Its clean, mineral-rich flavor acts as a culinary palate cleanser, cutting through heavy fats and brightening rich stews and sauces.",
    name: "parsley",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["fresh", "bright", "versatile"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup chopped (15g)",
      calories: 5,
      macros: {
        protein: 0.4,
        carbs: 0.9,
        fat: 0.1,
        fiber: 0.5,
        saturatedFat: 0,
        sugar: 0.1,
        potassium: 83,
        sodium: 8,
      },
      vitamins: { K: 2.05, C: 0.33, A: 0.13 },
      minerals: { iron: 0.06, potassium: 0.02 },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  mint: {
      description: "A rapidly spreading, aromatic herb (*Mentha*) characterized by the cooling compound menthol. It provides a sharp, refreshing contrast to rich or spicy dishes, and is utilized globally in everything from Middle Eastern lamb marinades to Southeast Asian salads and sweet desserts.",
    name: "mint",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "2 tbsp fresh (3.2g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.5,
        fat: 0,
        fiber: 0.3,
        sugar: 0,
        sodium: 1,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  dill: {
      description: "A feathery, delicate herb (*Anethum graveolens*) with a distinctively clean, grassy flavor featuring notes of anise and celery. It pairs classicly with mild, sweet ingredients like seafood, cucumbers, and yogurt, and its seeds are essential for pickling.",
    name: "dill",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "fresh", "culinary", "medicinal"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 cup (4g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.3,
        fat: 0,
        fiber: 0.1,
        sugar: 0,
        sodium: 2,
      },
        vitamins: {},
        minerals: {}
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  // bay_leaves removed — duplicate of bay_leaf above
  rosemary: {
      description: "A fragrant, evergreen shrub (*Salvia rosmarinus*) of the mint family known for its needle-like leaves and robust, pine-and-citrus aroma. Its essential oils contain rosmarinic acid, a powerful antioxidant that helps preserve the flavor and freshness of the foods it's cooked with, making it a classic pairing for roasted meats and root vegetables.\\n\\n",
    name: "rosemary",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "piney", "robust"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1 tsp dried (1.2g)",
      calories: 4,
      macros: {
        protein: 0.1,
        carbs: 0.8,
        fat: 0.2,
        fiber: 0.5,
        saturatedFat: 0.1,
        sugar: 0,
        potassium: 11,
        sodium: 1,
      },
      vitamins: { A: 0.01, C: 0.01 },
      minerals: { iron: 0.04, calcium: 0.02, manganese: 0.02 },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  // mint_leaves removed — duplicate of mint and fresh_mint above
  fresh_basil: {
      description: "A tender, aromatic herb (*Ocimum basilicum*) of the mint family, defined by its bright green, delicate leaves. Its complex flavor profile includes notes of anise, clove, and sweet citrus; because its volatile oils evaporate quickly, it should be added at the very end of cooking or used raw.\n\n**Selection & Storage:** Choose vibrant, unblemished leaves; avoid any with black spots. Store fresh basil like a bouquet of flowers: stems in a glass of water at room temperature, loosely covered with a plastic bag.",
    name: "fresh basil",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "sweet", "Italian"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["summer"],
    },
    nutritionalProfile: {
      serving_size: "2 tbsp chopped (5g)",
      calories: 1,
      macros: {
        protein: 0.2,
        carbs: 0.1,
        fat: 0,
        fiber: 0.1,
        saturatedFat: 0,
        sugar: 0,
        potassium: 15,
        sodium: 0,
      },
      vitamins: { K: 0.22, A: 0.03, C: 0.02 },
      minerals: { manganese: 0.02 },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  cilantro: {
      description: "A delicate, leafy green herb (*Coriandrum sativum*) known for its bright, citrusy, and slightly peppery flavor (though a genetic trait makes it taste like soap to some). It loses its flavor entirely when cooked, so it is used exclusively as a fresh garnish or pounded into raw salsas and chutneys.",
    name: "cilantro",
    elementalProperties: { Fire: 0.15, Water: 0.25, Earth: 0.15, Air: 0.45 },
    qualities: ["aromatic", "citrusy", "fresh"],
    category: "herbs",
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["Gemini", "Virgo", "Libra"],
      seasonalAffinity: ["spring", "summer"],
    },
    nutritionalProfile: {
      serving_size: "1/4 cup (4g)",
      calories: 1,
      macros: {
        protein: 0.1,
        carbs: 0.1,
        fat: 0,
        fiber: 0.1,
        saturatedFat: 0,
        sugar: 0,
        potassium: 21,
        sodium: 2,
      },
      vitamins: { K: 0.12, A: 0.03, C: 0.02 },
      minerals: {},
    },
      sensoryProfile: { taste: { spicy: 0.1, sweet: 0.1, sour: 0.1, bitter: 0.3, salty: 0, umami: 0.1 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
};

// Export processed ingredients
export const herbsIngredients = fixIngredientMappings(rawHerbs);
