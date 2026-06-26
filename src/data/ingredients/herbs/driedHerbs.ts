import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Pattern AA: Ingredient Interface Restructuring
// Proper type annotation for raw ingredients to ensure IngredientMapping compatibility
const rawDriedHerbs: Record<string, Partial<IngredientMapping>> = {
  dried_basil: {
      image_url: "ingredients/dried_basil.png",
    description: "The dehydrated leaves of the sweet basil plant (*Ocimum basilicum*). Unlike oregano or thyme, basil loses almost all of its complex, sweet, and anise-like volatile oils during the drying process, leaving behind a muted, slightly minty flavor that requires long simmering in tomato sauces to rehydrate and extract.",
    name: "Dried Basil",
    origin: ["South Asia (India)", "Southeast Asia"],
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    alchemicalProperties: { Spirit: 0.60, Essence: 0.35, Matter: 0.15, Substance: 0.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "pungent", "aromatic"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    potency: 8,
    affinities: ["tomato", "garlic", "olive oil", "mediterranean herbs"],
    cookingMethods: ["infused", "cooked"],
    conversionRatio: "1:3", // 1 part dried = 3 parts fresh;
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "a"],
      minerals: ["calcium", "iron"],
      antioxidants: ["flavonoids", "anthocyanins"],
      volatileoils: ["eugenol", "linalool"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "just before use",
      blooming: "in oil or hot liquid",
      timing: "add early in cooking",
      notes: "More concentrated than fresh",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-3 years",
      container: "airtight, dark",
      notes: "Crush to test freshness - should be aromatic",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["herbal", "mild"],
          secondary: ["sweet", "peppery"],
          notes: "Milder and hay-like compared to fresh basil; better in cooked sauces than as a finish.",
        },
        cookingMethods: ["simmer", "season", "bloom"],
        cuisineAffinity: ["Italian", "Mediterranean"],
        preparationTips: [
          "Crumble between your fingers as you add it to release the oils.",
          "Add early in cooking — dried basil needs time to rehydrate.",
          "Use about one-third the amount you would of fresh basil.",
        ],
      }
},

  dried_oregano: {
      image_url: "ingredients/dried_oregano.png",
    description: "The dehydrated leaves of *Origanum vulgare*. It is one of the few herbs that is generally considered superior when dried rather than fresh; the drying process tames its aggressive bitterness and concentrates its pungent, earthy, and peppery flavor, making it the defining herb of Mediterranean pizza and pasta sauces.",
    name: "Dried Oregano",
    origin: ["Mediterranean (Greece)"],
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.72, Essence: 0.30, Matter: 0.15, Substance: 0.20 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "pungent", "drying"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: [
      "tomato",
      "olive oil",
      "lemon",
      "garlic",
      "mediterranean herbs",
    ],
    cookingMethods: ["cooked", "infused"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "e"],
      minerals: ["iron", "manganese"],
      antioxidants: ["rosmarinic acid", "thymol"],
      volatileoils: ["carvacrol", "thymol"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "release oils before use",
      blooming: "in oil or hot liquid",
      timing: "add early in cooking",
      notes: "Often preferred dried over fresh",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "2-3 years",
      container: "airtight, dark",
      notes: "Maintains flavor well when dried",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["pungent", "earthy"],
          secondary: ["peppery", "minty"],
          notes: "Robust and slightly bitter; one of the few herbs often preferred dried over fresh.",
        },
        cookingMethods: ["simmer", "season", "bloom"],
        cuisineAffinity: ["Italian", "Greek", "Mexican"],
        preparationTips: [
          "Crumble between your fingers to release the aromatic oils.",
          "Add early — its robust flavor stands up to long cooking.",
          "Mediterranean and Mexican oregano differ; match it to the dish.",
        ],
      }
},

  dried_thyme: {
      image_url: "ingredients/dried_thyme.png",
    description: "The dehydrated leaves of *Thymus vulgaris*. Because thyme is a woody, resinous herb, it dries exceptionally well, concentrating its sharp, earthy, and distinctly floral/minty flavor. It is a workhorse pantry staple, providing the aromatic backbone for countless stocks, stews, and roasted meats.",
    name: "Dried Thyme",
    origin: ["Mediterranean"],
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.70, Essence: 0.32, Matter: 0.15, Substance: 0.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "drying", "pungent"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["lemon", "garlic", "poultry", "mushrooms", "root vegetables"],
    cookingMethods: ["cooked", "infused", "brined"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["c", "a"],
      minerals: ["iron", "manganese"],
      antioxidants: ["thymol", "carvacrol"],
      volatileoils: ["thymol", "linalool"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      removing: "from stems if whole",
      crushing: "lightly before use",
      timing: "add early in cooking",
      notes: "Retains flavor well when dried",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "2-4 years",
      container: "airtight, dark",
      notes: "Whole leaves last longer than ground",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["earthy", "herbal"],
          secondary: ["minty", "woody"],
          notes: "Holds its flavor well dried; a backbone herb for braises and stocks.",
        },
        cookingMethods: ["simmer", "braise", "season"],
        cuisineAffinity: ["French", "Mediterranean"],
        preparationTips: [
          "Rub between your palms to crumble and release the oils.",
          "Add early in cooking — thyme stands up to long simmering.",
          "Use about one-third the amount of fresh thyme.",
        ],
      }
},

  dried_rosemary: {
      image_url: "ingredients/dried_rosemary.png",
    description: "The dehydrated, needle-like leaves of *Salvia rosmarinus*. Because the leaves are tough and resinous, they retain their powerful pine, wood, and citrus flavor flawlessly when dried. Due to their sharp, brittle texture, they should be minced finely or crushed in a mortar before being added to roasted meats or breads.",
    name: "Dried Rosemary",
    origin: ["Mediterranean"],
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.75, Essence: 0.30, Matter: 0.18, Substance: 0.22 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "pungent", "drying"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["lamb", "potato", "olive oil", "garlic", "lemon"],
    cookingMethods: ["cooked", "infused", "roasted"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["calcium", "iron"],
      antioxidants: ["carnosic acid", "rosmarinic acid"],
      volatileoils: ["pinene", "camphor"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      grinding: "recommended - leaves are tough",
      infusing: "in oil or liquid",
      timing: "add early in cooking",
      notes: "Use sparingly - very potent",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-3 years",
      container: "airtight, dark",
      notes: "Whole needles last longer than ground",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["piney", "resinous"],
          secondary: ["woody", "camphorous"],
          notes: "Intensely piney; dried needles stay stiff, so crush or grind them.",
        },
        cookingMethods: ["roast", "braise", "season"],
        cuisineAffinity: ["Italian", "Mediterranean"],
        preparationTips: [
          "Crush or grind the stiff dried needles — they don't soften much.",
          "Add early so the resinous flavor mellows into the dish.",
          "Use sparingly; dried rosemary is potent.",
        ],
      }
},

  dried_sage: {
      image_url: "ingredients/dried_sage.png",
    description: "The dehydrated leaves of *Salvia officinalis*. Drying significantly amplifies its already assertive, earthy, slightly astringent, and musky flavor profile. It is incredibly potent and must be used with a light hand, acting as the foundational seasoning for Thanksgiving stuffing and heavy pork sausages.",
    name: "Dried Sage",
    origin: ["Mediterranean"],
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.65, Essence: 0.28, Matter: 0.20, Substance: 0.22 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "drying", "astringent"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["poultry", "pork", "butternut squash", "butter", "mushrooms"],
    cookingMethods: ["cooked", "infused", "rubbed"],
    conversionRatio: "1:4",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "b6"],
      minerals: ["iron", "calcium"],
      antioxidants: ["rosmarinic acid", "carnosic acid"],
      volatileoils: ["thujone", "camphor"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      rubbing: "crumble between fingers",
      timing: "add early in cooking",
      notes: "Strong flavor - use sparingly",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-3 years",
      container: "airtight, dark",
      notes: "Rubbed sage is more potent than whole dried leaves",
    },
    medicinalProperties: {
      actions: ["antimicrobial", "digestive aid"],
      preparations: ["tea", "infusion"],
      cautions: ["avoid therapeutic doses during pregnancy"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["earthy", "savory"],
          secondary: ["peppery", "minty"],
          notes: "Warm and slightly musty; a classic with poultry, pork, and stuffing.",
        },
        cookingMethods: ["season", "bloom", "braise"],
        cuisineAffinity: ["Italian", "English", "American"],
        preparationTips: [
          "Crumble between your fingers as you add it.",
          "Add early — dried sage's flavor deepens with cooking.",
          "Rubbed sage is fluffier and milder than ground sage.",
        ],
      }
},

  dried_bay_leaves: {
      image_url: "ingredients/dried_bay_leaves.png",
    description: "The dehydrated leaves of the sweet bay tree (*Laurus nobilis*). While fresh bay leaves can be overwhelmingly astringent and menthol-heavy, drying them mellows their bite and concentrates their complex, woody, and floral notes, which release slowly during long braises and stews.",
    name: "Dried Bay Leaves",
    origin: ["Cultivated worldwide"],
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.68, Essence: 0.25, Matter: 0.22, Substance: 0.25 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "bitter", "aromatic"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["soups", "stews", "rice", "beans", "meat"],
    cookingMethods: ["simmered", "infused", "brined"],
    conversionRatio: "1:2",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["iron", "manganese"],
      antioxidants: ["linalool", "eugenol"],
      volatileoils: ["cineole", "eugenol"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      whole: "use whole and remove before serving",
      crushing: "slightly to release oils",
      timing: "add at beginning of cooking",
      notes: "Remove before serving",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-3 years",
      container: "airtight, dark",
      notes: "Whole leaves maintain flavor longer",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["aromatic", "woody"],
          secondary: ["herbal", "subtle"],
          notes: "Whole dried leaves that release a slow, woody aroma into long-cooked dishes.",
        },
        cookingMethods: ["simmer", "braise", "infuse"],
        cuisineAffinity: ["Mediterranean", "European"],
        preparationTips: [
          "Add whole at the start of long-cooked dishes.",
          "Always remove the leaves before serving — they stay stiff and sharp.",
          "Lightly crack a leaf to release more aroma.",
        ],
      }
},

  dried_marjoram: {
      image_url: "ingredients/dried_marjoram.png",
    description: "The dehydrated leaves of *Origanum majorana*. It is closely related to oregano but is significantly sweeter, more floral, and less aggressive. Drying concentrates its mild, pine-and-citrus flavor, making it a staple in traditional German sausages and delicate poultry seasonings.",
    name: "Dried Marjoram",
    origin: ["Mediterranean", "Western Asia"],
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.65, Essence: 0.32, Matter: 0.14, Substance: 0.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["sweet", "delicate", "warming"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["poultry", "vegetables", "legumes", "tomato sauces", "eggs"],
    cookingMethods: ["cooked", "infused"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "c"],
      minerals: ["iron", "calcium"],
      antioxidants: ["rosmarinic acid", "ursolic acid"],
      volatileoils: ["sabinene", "terpinene"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "gently before use",
      timing: "add early in cooking",
      notes: "More delicate than oregano",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Replace when aroma fades",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["sweet", "floral"],
          secondary: ["herbal", "mild"],
          notes: "Sweeter and gentler than oregano, its close cousin; delicate, so add it late.",
        },
        cookingMethods: ["season", "finish"],
        cuisineAffinity: ["Mediterranean", "European"],
        preparationTips: [
          "Crumble between your fingers to release the oils.",
          "Add toward the end — marjoram is more delicate than oregano.",
          "Use about one-third the amount of fresh marjoram.",
        ],
      }
},

  dried_savory: {
      image_url: "ingredients/dried_savory.png",
    description: "The dehydrated leaves of the *Satureja* plant, specifically Winter Savory or Summer Savory. It offers a highly pungent, peppery, and robust flavor profile—somewhere between thyme and mint—and is historically famous for its ability to flavor and aid in the digestion of heavy bean stews.",
    name: "Dried Savory",
    origin: ["Mediterranean"],
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.60, Essence: 0.30, Matter: 0.18, Substance: 0.20 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["peppery", "robust", "aromatic"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["beans", "pork", "poultry", "sausages", "cabbage"],
    cookingMethods: ["cooked", "infused", "marinades"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["iron", "manganese"],
      antioxidants: ["rosmarinic acid", "thymol"],
      volatileoils: ["carvacrol", "thymol"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "before use",
      timing: "add during cooking",
      notes: "Strong flavor - use sparingly",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Maintains strength well when dried",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["peppery", "herbal"],
          secondary: ["thyme-like", "earthy"],
          notes: "Peppery and thyme-like; the classic herb for beans and lentils.",
        },
        cookingMethods: ["simmer", "season", "braise"],
        cuisineAffinity: ["European", "Mediterranean"],
        preparationTips: [
          "Crumble between your fingers as you add it.",
          "Add early — savory stands up to long cooking.",
          "Stir into bean and lentil dishes, where it shines.",
        ],
      }
},

  dried_chervil: {
      image_url: "ingredients/dried_chervil.png",
    description: "The dried version of the delicate spring herb (*Anthriscus cerefolium*). Because its subtle parsley-anise flavor is extremely fragile, it survives the drying process poorly; it is best used in large quantities in light, cream-based sauces where it won't be overpowered by other ingredients.",
    name: "Dried Chervil",
    origin: ["Caucasus"],
    elementalProperties: { Air: 0.5, Earth: 0.2, Water: 0.2, Fire: 0.1 },
    alchemicalProperties: { Spirit: 0.55, Essence: 0.35, Matter: 0.10, Substance: 0.14 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["delicate", "subtle", "anise-like"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["eggs", "fish", "chicken", "light sauces", "potatoes"],
    cookingMethods: ["finishing", "infused"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["c", "a"],
      minerals: ["potassium", "calcium"],
      antioxidants: ["flavonoids", "carotenoids"],
      volatileoils: ["methyl chavicol", "limonene"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "very gently",
      timing: "add at end of cooking",
      notes: "Very delicate flavor",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "6-12 months",
      container: "airtight, dark",
      notes: "Loses flavor quickly when dried",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["delicate", "anise"],
          secondary: ["parsley-like", "mild"],
          notes: "Faint anise note; loses much of its delicate flavor when dried.",
        },
        cookingMethods: ["season", "finish"],
        cuisineAffinity: ["French"],
        preparationTips: [
          "Add near the end — chervil's flavor is fragile.",
          "Crumble lightly between your fingers as you add it.",
          "Use generously; dried chervil is mild.",
        ],
      }
},

  dried_tarragon: {
      image_url: "ingredients/dried_tarragon.png",
    description: "The dehydrated leaves of *Artemisia dracunculus*. While it loses some of the bright, fresh nuance of the raw herb, it retains its distinct, sweet anise and licorice flavor reasonably well, making it a convenient pantry staple for classic French cream sauces and chicken salads.",
    name: "Dried Tarragon",
    origin: ["Eurasia"],
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.70, Essence: 0.32, Matter: 0.12, Substance: 0.16 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["anise-like", "sweet", "aromatic"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["chicken", "fish", "eggs", "mushrooms", "french cuisine"],
    cookingMethods: ["cooked", "infused", "sauces"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["calcium", "potassium"],
      antioxidants: ["quercetin", "rutin"],
      volatileoils: ["estragole", "ocimene"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "gently to release oils",
      timing: "add during cooking",
      notes: "Strong flavor - use sparingly",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Replace when aroma weakens",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["anise", "sweet"],
          secondary: ["grassy", "aromatic"],
          notes: "Distinctly anise-like; holds its character reasonably well when dried.",
        },
        cookingMethods: ["season", "sauce", "finish"],
        cuisineAffinity: ["French"],
        preparationTips: [
          "Crumble between your fingers to release the anise oils.",
          "Add midway through cooking; long simmering dulls it.",
          "Essential to béarnaise and other classic French sauces.",
        ],
      }
},

  dried_dill: {
      image_url: "ingredients/dried_dill.png",
    description: "The dehydrated, feathery fronds of *Anethum graveolens*. It retains its signature sweet, grassy, and slightly anise-like flavor reasonably well when dried, making it a reliable addition to long-simmering fish chowders, yogurt sauces, and potato salads.",
    name: "Dried Dill",
    origin: ["Mediterranean", "Russia"],
    elementalProperties: { Air: 0.5, Water: 0.2, Earth: 0.2, Fire: 0.1 },
    alchemicalProperties: { Spirit: 0.62, Essence: 0.35, Matter: 0.10, Substance: 0.14 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["fresh", "tangy", "herbaceous"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["fish", "pickles", "potatoes", "cucumber", "yogurt"],
    cookingMethods: ["cooked", "pickling", "infused"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["manganese", "iron"],
      antioxidants: ["flavonoids", "monoterpenes"],
      volatileoils: ["carvone", "limonene"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "before use",
      timing: "add late in cooking",
      notes: "More concentrated than fresh",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Protect from light to maintain color",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["grassy", "anise"],
          secondary: ["fresh", "mild"],
          notes: "Milder than fresh dill weed; convenient for dips, dressings, and pickles.",
        },
        cookingMethods: ["season", "finish"],
        cuisineAffinity: ["Scandinavian", "Eastern-European"],
        preparationTips: [
          "Crumble between your fingers as you add it.",
          "Add late — dried dill is gentle and fades with heat.",
          "Rehydrate briefly in the dish's liquid for dips and dressings.",
        ],
      }
},

  dried_mint: {
      image_url: "ingredients/dried_mint.png",
    description: "The dehydrated leaves of various *Mentha* species, most commonly spearmint. While it loses the sharp, cooling 'freshness' of raw mint, it develops a deeper, sweeter, and more earthy profile that is absolutely essential for traditional Middle Eastern lamb meatballs (kofta) and yogurt sauces.",
    name: "Dried Mint",
    origin: ["Mediterranean", "Western Asia"],
    elementalProperties: { Air: 0.5, Water: 0.2, Fire: 0.2, Earth: 0.1 },
    alchemicalProperties: { Spirit: 0.78, Essence: 0.38, Matter: 0.08, Substance: 0.12 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["cooling", "refreshing", "pungent"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["chocolate", "lamb", "peas", "tea", "fruit"],
    cookingMethods: ["tea", "cooked", "infused"],
    conversionRatio: "1:4",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["iron", "manganese"],
      antioxidants: ["rosmarinic acid", "flavonoids"],
      volatileoils: ["menthol", "menthone"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "to release oils",
      timing: "add during or after cooking",
      notes: "Good for both sweet and savory",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Maintains menthol well when dried",
    },
    medicinalProperties: {
      actions: ["digestive aid", "decongestant"],
      preparations: ["tea", "infusion"],
      cautions: ["may affect iron absorption"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["cooling", "sweet"],
          secondary: ["herbal", "bright"],
          notes: "Cooling and concentrated; common in Middle Eastern and North African cooking.",
        },
        cookingMethods: ["season", "infuse", "finish"],
        cuisineAffinity: ["Middle-Eastern", "North-African", "Greek"],
        preparationTips: [
          "Crumble between your fingers to release the menthol oils.",
          "Add toward the end, or sprinkle over the finished dish.",
          "Common in spice rubs, yogurt sauces, and teas.",
        ],
      }
},

  dried_fennel: {
      image_url: "ingredients/dried_fennel.png",
    description: "The dehydrated fronds (leaves) of the fennel plant (*Foeniculum vulgare*), not to be confused with fennel seeds. They offer a very mild, sweet licorice/anise flavor that is exceptionally delicate, typically used to lightly season fish broths or delicate pork dishes.",
    name: "Dried Fennel",
    origin: ["Mediterranean"],
    elementalProperties: { Fire: 0.3, Air: 0.3, Earth: 0.2, Water: 0.2 },
    alchemicalProperties: { Spirit: 0.65, Essence: 0.30, Matter: 0.18, Substance: 0.20 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "sweet", "aromatic"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["fish", "pork", "tomatoes", "eggs", "bread"],
    cookingMethods: ["cooked", "infused", "tea"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["c", "b6"],
      minerals: ["calcium", "iron"],
      antioxidants: ["flavonoids", "anethole"],
      volatileoils: ["anethole", "fenchone"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      grinding: "just before use if whole",
      timing: "add early in cooking",
      notes: "Licorice-like flavor",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-3 years",
      container: "airtight, dark",
      notes: "Whole seeds last longer than ground",
    },
    medicinalProperties: {
      actions: ["digestive aid", "anti-inflammatory"],
      preparations: ["tea", "powder"],
      cautions: ["may interact with estrogen"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["sweet", "anise"],
          secondary: ["aromatic", "warm"],
          notes: "Sweet, licorice-like dried fennel seed used to season dishes and spice blends.",
        },
        cookingMethods: ["bloom", "grind", "season"],
        cuisineAffinity: ["Italian", "Indian", "Mediterranean"],
        preparationTips: [
          "Toast the seeds briefly to deepen the flavor.",
          "Crush or grind just before use for the strongest aroma.",
          "Bloom whole seeds in hot oil at the start of cooking.",
        ],
      }
},

  dried_parsley: {
      image_url: "ingredients/dried_parsley.png",
    description: "The dehydrated leaves of *Petroselinum crispum*. Much like dried basil or cilantro, parsley loses almost all of its bright, fresh, and mineral-heavy flavor during the drying process, functioning primarily as a mild, slightly grassy visual garnish.",
    name: "Dried Parsley",
    origin: ["Mediterranean"],
    elementalProperties: { Air: 0.4, Earth: 0.3, Water: 0.2, Fire: 0.1 },
    alchemicalProperties: { Spirit: 0.45, Essence: 0.30, Matter: 0.15, Substance: 0.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["herbaceous", "mild", "fresh"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["potatoes", "fish", "soups", "grains", "vegetables"],
    cookingMethods: ["cooked", "garnish", "infused"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "c", "a"],
      minerals: ["iron", "calcium"],
      antioxidants: ["flavonoids", "luteolin"],
      volatileoils: ["myristicin", "apiol"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "gently before use",
      timing: "add during or end of cooking",
      notes: "Milder than fresh parsley",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Color may fade but flavor remains",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["herbal", "mild"],
          secondary: ["grassy", "green"],
          notes: "Mild and mostly for color; far less vivid than fresh parsley.",
        },
        cookingMethods: ["season", "garnish"],
        cuisineAffinity: ["European", "American"],
        preparationTips: [
          "Crumble between your fingers as you add it.",
          "Use mainly for a touch of color — the flavor is faint.",
          "Rehydrate in a little water if using it as a garnish.",
        ],
      }
},

  dried_cilantro: {
      image_url: "ingredients/dried_cilantro.png",
    description: "The dehydrated leaves of the coriander plant (*Coriandrum sativum*). The drying process almost completely destroys the bright, citrusy, and pungent volatile oils that define fresh cilantro, leaving a very subtle, grassy herb that functions mostly as a visual garnish rather than a primary flavoring agent.",
    name: "Dried Cilantro",
    origin: ["Mediterranean", "Western Asia"],
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.58, Essence: 0.28, Matter: 0.12, Substance: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["citrusy", "warm", "distinctive"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["mexican cuisine", "indian cuisine", "rice", "beans", "soups"],
    cookingMethods: ["cooked", "infused"],
    conversionRatio: "1:4",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "a"],
      minerals: ["potassium", "manganese"],
      antioxidants: ["quercetin", "kaempferol"],
      volatileoils: ["linalool", "decanal"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "before use",
      timing: "add early in cooking",
      notes: "Different flavor profile than fresh",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Best in cooked dishes",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["citrusy", "herbal"],
          secondary: ["mild", "grassy"],
          notes: "Loses most of its punch when dried; fresh cilantro is far more vivid.",
        },
        cookingMethods: ["season"],
        cuisineAffinity: ["Mexican", "Indian", "Southeast-Asian"],
        preparationTips: [
          "Crumble between your fingers as you add it.",
          "Add early; dried cilantro needs time to release what flavor it has.",
          "Where possible, prefer fresh cilantro for its bright flavor.",
        ],
      }
},

  dried_chives: {
      image_url: "ingredients/dried_chives.png",
    description: "The dehydrated hollow stalks of the smallest onion species (*Allium schoenoprasum*). Drying preserves their distinctively mild, sweet onion flavor surprisingly well, making them a convenient stir-in for sour cream dips, baked potatoes, and savory scones.",
    name: "Dried Chives",
    origin: ["Europe", "Asia"],
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    alchemicalProperties: { Spirit: 0.50, Essence: 0.32, Matter: 0.10, Substance: 0.14 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["oniony", "mild", "delicate"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["potatoes", "eggs", "soups", "dips", "sauces"],
    cookingMethods: ["garnish", "rehydrated", "cooked"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "c"],
      minerals: ["calcium", "iron"],
      antioxidants: ["allicin", "quercetin"],
      volatileoils: ["allyl sulfides"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      rehydrating: "soak in warm water briefly",
      timing: "add near end of cooking",
      notes: "Can be rehydrated for better texture",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Protect from moisture",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["mild", "oniony"],
          secondary: ["grassy", "delicate"],
          notes: "Gentle onion note; freeze-dried chives keep more color and flavor.",
        },
        cookingMethods: ["season", "garnish", "finish"],
        cuisineAffinity: ["French", "American"],
        preparationTips: [
          "Add near the end, or use as a garnish.",
          "Rehydrate briefly in the dish's moisture to plump them.",
          "Choose freeze-dried chives for the best color and flavor.",
        ],
      }
},

  dried_lemon_balm: {
      image_url: "ingredients/dried_lemon_balm.png",
    description: "The dehydrated leaves of *Melissa officinalis*, a member of the mint family. It retains a bright, distinctively sweet lemon aroma and a mild minty undertone, making it a soothing, aromatic addition to herbal teas, delicate fruit salads, and light chicken marinades.",
    name: "Dried Lemon Balm",
    origin: ["Mediterranean", "Western Asia"],
    elementalProperties: { Air: 0.4, Water: 0.3, Fire: 0.2, Earth: 0.1 },
    alchemicalProperties: { Spirit: 0.65, Essence: 0.40, Matter: 0.08, Substance: 0.12 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["lemony", "mild", "soothing"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["tea", "fish", "poultry", "salads", "fruit desserts"],
    cookingMethods: ["tea", "infused", "baking"],
    conversionRatio: "1:4",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["b", "c"],
      minerals: ["calcium", "potassium"],
      antioxidants: ["rosmarinic acid", "flavonoids"],
      volatileoils: ["citral", "citronellal"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "lightly before use",
      timing: "add near end of cooking",
      notes: "Delicate lemon flavor",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Maintains aroma well when dried",
    },
    medicinalProperties: {
      actions: ["calming", "digestive aid"],
      preparations: ["tea", "tincture"],
      cautions: ["may cause drowsiness"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["citrusy", "minty"],
          secondary: ["floral", "mild"],
          notes: "Soft lemon-mint aroma; mostly used for teas and infusions.",
        },
        cookingMethods: ["infuse", "tea"],
        cuisineAffinity: ["European"],
        preparationTips: [
          "Steep in hot water for a calming herbal tea.",
          "Crumble lightly to release the lemony oils.",
          "Strain after infusing — the dried leaves stay papery.",
        ],
      }
},

  dried_lavender: {
      image_url: "ingredients/dried_lavender.png",
    description: "The dehydrated, highly aromatic flowers of the *Lavandula* plant, most commonly *Lavandula angustifolia* (English lavender) for culinary use. It imparts a profoundly strong, perfumed, and sweet floral flavor that must be used incredibly sparingly to avoid making food taste like soap.",
    name: "Dried Lavender",
    origin: ["Mediterranean"],
    elementalProperties: { Air: 0.5, Fire: 0.2, Earth: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.80, Essence: 0.42, Matter: 0.08, Substance: 0.10 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["floral", "sweet", "aromatic"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["desserts", "honey", "lamb", "provence herbs", "tea"],
    cookingMethods: ["baking", "infused", "tea"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["a", "c"],
      minerals: ["calcium", "iron"],
      antioxidants: ["rosmarinic acid", "ursolic acid"],
      volatileoils: ["linalool", "linalyl acetate"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "gently before use",
      timing: "add early for cooking, late for tea",
      notes: "Use sparingly - can become soapy",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-3 years",
      container: "airtight, dark",
      notes: "Buds store better than flowers",
    },
    medicinalProperties: {
      actions: ["calming", "sleep aid"],
      preparations: ["tea", "sachet"],
      cautions: ["may cause drowsiness"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["floral", "sweet"],
          secondary: ["perfumed", "herbal"],
          notes: "Intensely floral; use a light hand or it turns soapy.",
        },
        cookingMethods: ["infuse", "bake", "season"],
        cuisineAffinity: ["French", "Mediterranean"],
        preparationTips: [
          "Use culinary-grade lavender, and only a pinch — too much tastes soapy.",
          "Infuse into cream, sugar, or syrup, then strain.",
          "Grind with sugar to distribute its flavor evenly in baking.",
        ],
      }
},

  dried_summer_savory: {
      image_url: "ingredients/dried_summer_savory.png",
    description: "Dried Summer Savory is an aromatic herb used to brighten savory dishes with fresh, volatile flavor compounds. Add early for mellow infusion or late for sharper aromatic lift, depending on the recipe goal. Because aroma degrades quickly with heat and air, keep it cold and dry, and chop just before use when possible.",
    name: "Dried Summer Savory",
    origin: ["Mediterranean"],
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    alchemicalProperties: { Spirit: 0.58, Essence: 0.30, Matter: 0.18, Substance: 0.20 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["peppery", "robust", "warming"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["beans", "meat", "poultry", "sausages", "vegetables"],
    cookingMethods: ["cooked", "infused", "marinades"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["k", "b6"],
      minerals: ["iron", "manganese"],
      antioxidants: ["rosmarinic acid", "carvacrol"],
      volatileoils: ["thymol", "carvacrol"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "before use",
      timing: "add early in cooking",
      notes: "Traditional bean herb",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Replace when aroma fades",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["peppery", "mild"],
          secondary: ["thyme-like", "sweet"],
          notes: "The milder, sweeter savory — gentler than winter savory.",
        },
        cookingMethods: ["season", "simmer"],
        cuisineAffinity: ["European", "Mediterranean"],
        preparationTips: [
          "Crumble between your fingers as you add it.",
          "Add early in cooking so the flavor blends in.",
          "Pairs naturally with beans, lentils, and eggs.",
        ],
      }
},

  dried_lovage: {
      image_url: "ingredients/dried_lovage.png",
    description: "The dehydrated leaves of *Levisticum officinale*, an herb that tastes like an intense, highly concentrated cross between celery and parsley. Because its flavor is so robust and meaty, it survives the drying process exceptionally well and is a powerhouse addition to beef stews and heavy broths.",
    name: "Dried Lovage",
    origin: ["Cultivated worldwide"],
    elementalProperties: { Earth: 0.4, Water: 0.3, Air: 0.2, Fire: 0.1 },
    alchemicalProperties: { Spirit: 0.11, Essence: 0.19, Matter: 0.39, Substance: 0.31 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["celery-like", "robust", "savory"],
    season: ["fall"],
    category: "culinary_herb",
    subCategory: "dried",
    affinities: ["soups", "stews", "potato", "meat", "stocks"],
    cookingMethods: ["cooked", "infused", "seasoning"],
    conversionRatio: "1:3",
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        vitamins: ["b6", "c"],
      minerals: ["iron", "magnesium"],
      antioxidants: ["quercetin", "kaempferol"],
      volatileoils: ["phthalides", "terpenes"],
        calories: 3,
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
    preparation: {
      crushing: "before use",
      timing: "add early in cooking",
      notes: "Strong celery-like flavor",
    },
    storage: {
      temperature: "cool, dark place",
      duration: "1-2 years",
      container: "airtight, dark",
      notes: "Replace when aroma weakens",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      culinaryProfile: {
        flavorProfile: {
          primary: ["celery-like", "savory"],
          secondary: ["herbal", "intense"],
          notes: "Concentrated celery-and-herb flavor; potent, so use it sparingly.",
        },
        cookingMethods: ["simmer", "stock", "season"],
        cuisineAffinity: ["European"],
        preparationTips: [
          "Use sparingly — dried lovage is very concentrated.",
          "Add early to soups and stocks for a savory, celery-like depth.",
          "Crumble between your fingers as you add it.",
        ],
      }
},

  chervil: {
      image_url: "ingredients/chervil.png",
    description: "A delicate, highly perishable spring herb (*Anthriscus cerefolium*) featuring lacy, fern-like leaves. It is a cornerstone of the classic French *fines herbes* blend, offering a subtle, refined flavor profile combining parsley and faint anise, which must be added at the absolute last second to avoid destroying its volatile oils.",
    name: "Chervil",
    origin: ["Caucasus"],
    season: ["spring", "fall"],
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1,
    },
    alchemicalProperties: { Spirit: 0.36, Essence: 0.22, Matter: 0.23, Substance: 0.19 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    category: "culinary_herb",
    qualities: ["nourishing"],
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        calories: 3,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
  bay_leaf: {
      image_url: "ingredients/bay_leaf.png",
    description: "The aromatic leaf of the sweet bay tree (*Laurus nobilis*), typically used dried. When simmered in liquid for an extended period, it releases complex, woodsy, floral, and slightly menthol notes that add essential savory depth to soups, stews, and braises.",
    name: "Bay Leaf",
    origin: ["Mediterranean (Asia Minor)"],
    season: ["all"],
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1,
    },
    alchemicalProperties: { Spirit: 0.36, Essence: 0.22, Matter: 0.23, Substance: 0.19 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    category: "culinary_herb",
    qualities: ["nourishing"],
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        calories: 3,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},

  anise: {
      image_url: "ingredients/anise.png",
    description: "The seed of the *Pimpinella anisum* plant, yielding a distinctively sweet, highly aromatic, and slightly spicy licorice flavor. It shares the volatile compound anethole with fennel and star anise, making it a foundational flavoring for classic Mediterranean spirits like Ouzo, Sambuca, and Absinthe.",
    name: "Anise",
    origin: ["Eastern Mediterranean", "Western Asia"],
    season: ["all"],
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0.1,
    },
    alchemicalProperties: { Spirit: 0.36, Essence: 0.22, Matter: 0.23, Substance: 0.19 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "virgo", "cancer"],
      seasonalAffinity: ["fall"],
    },
    category: "culinary_herb",
    qualities: ["nourishing"],
    nutritionalProfile: {
        serving_size: "1 tsp (1 g)",
        calories: 3,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      fiber_g: 0,
      vitamins: [],
      minerals: [],
        macros: { protein: 0.1, carbs: 0.6, fat: 0.06, fiber: 0.4 }
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.2, umami: 0.0, spicy: 0.0 }, aroma: { herbaceous: 0.9, grassy: 0.5, floral: 0.3 }, texture: { tender: 0.6, delicate: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["herbaceous"], secondary: ["grassy", "bright"], notes: "Add fresh herbs at the end of cooking to preserve volatile oils; dried herbs go in early." }, cookingMethods: ["raw", "infuse", "finish", "chiffonade"], cuisineAffinity: ["Mediterranean", "French", "Middle-Eastern", "Asian"], preparationTips: ["Chop with a sharp knife to avoid bruising.", "Add fresh at service, dried during simmer."] },
      pairingRecommendations: { complementary: ["olive oil", "lemon", "garlic", "butter", "tomato"], contrasting: ["chili", "vinegar", "citrus zest"], toAvoid: [] },
      storage: { refrigerated: "Wrap in damp paper towel, bag loosely — 5-7 days.", notes: "Hardy herbs (rosemary, thyme) freeze well; tender herbs (basil, cilantro) wilt fast." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const driedHerbs: Record<string, IngredientMapping> =
  fixIngredientMappings(rawDriedHerbs);

export default driedHerbs;
