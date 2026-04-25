import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

// Pattern, AA: Ingredient Interface Restructuring
// Proper type annotation for raw ingredients to ensure IngredientMapping compatibility
const rawSpiceBlends: Record<string, Partial<IngredientMapping>> = {
  garam_masala: {
      description: "A deeply warming, complex spice blend originating from the Indian subcontinent, translating roughly to 'hot spices' (referring to metabolic heat, not chili spice). It typically contains heavily aromatic, sweet spices like cardamom, cinnamon, clove, cumin, and nutmeg, and is usually added near the end of cooking to preserve its aromatics.",
    name: "Garam Masala",
    elementalProperties: { Fire: 0.5, Air: 0.2, Earth: 0.2, Water: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Air", planet: "Jupiter" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
    },

    qualities: ["warming", "aromatic", "complex"],
    origin: ["Indian Subcontinent"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      cumin: 2,
      coriander: 2,
      cardamom: 1,
      cinnamon: 1,
      cloves: 0.5,
      "black pepper": 1,
      nutmeg: 0.5,
    },

    ratios: "2:2:1:1:0.5:1:0.5",

    regionalVariations: {
      "North Indian": {
        name: "North Indian",
        cumin: 2,
        coriander: 2,
        "black cardamom": 1,
        cinnamon: 1,
        cloves: 0.5,
        "black pepper": 1,
        nutmeg: 0.5,
      },
      "South Indian": {
        name: "South Indian",
        cumin: 2,
        coriander: 2,
        cardamom: 1,
        "curry leaves": 1,
        "star anise": 0.5,
        "black pepper": 1,
        nutmeg: 0.5,
      },
    },

    affinities: ["lentils", "rice", "meat", "vegetables", "yogurt"],
    cookingMethods: ["bloomed in oil", "added to sauces", "marinades"],

    preparation: {
      toasting: "individually before grinding",
      grinding: "just before use",
      storage: "airtight, dark container",
      notes: "Blend can be adjusted for heat preference",
    },

    medicinalProperties: {
      actions: ["digestive aid", "anti-inflammatory", "warming"],
      energetics: "heating",
      tastes: ["pungent", "sweet", "bitter"],
    },

    sensoryProfile: {
      taste: ["Mild"],
      aroma: ["Fresh"],
      texture: ["Standard"],
      notes: "Characteristic garam_masala profile",
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    season: ["Year-round"],

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.2,
        fat: 0.3,
        fiber: 0.5,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Digestive aid", "Anti-inflammatory"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  ras_el_hanout: {
      description: "A highly complex, profoundly aromatic spice blend originating from North Africa (meaning 'head of the shop'). There is no set recipe, but it often contains over a dozen premium spices—including cardamom, clove, cinnamon, coriander, cumin, mace, and rose petals—providing incredible savory and sweet depth to Moroccan tagines.",
    name: "Ras El Hanout",
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },

    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mars"],
      favorableZodiac: ["taurus", "scorpio"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Venus" },
          second: { element: "Earth", planet: "Mars" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
    },

    qualities: ["warming", "complex", "aromatic"],
    origin: ["North Africa"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: [
      "cumin",
      "coriander",
      "cinnamon",
      "ginger",
      "black pepper",
      "turmeric",
      "paprika",
      "allspice",
      "rose petals",
    ],

    regionalVariations: {
      Moroccan: ["saffron", "rose buds", "grains of paradise"],
      Tunisian: ["dried mint", "dried rose petals"],
      Algerian: ["cinnamon heavy", "dried rosebuds"],
    },

    affinities: ["lamb", "chicken", "couscous", "vegetables", "tagines"],
    cookingMethods: ["marinades", "rubs", "stews"],

    proportions: {
      cumin: 2,
      coriander: 2,
      cinnamon: 1,
      ginger: 1,
      "black pepper": 1,
      turmeric: 1,
      paprika: 1,
      allspice: 0.5,
      "rose petals": 0.5,
    },

    preparation: {
      toasting: "light toasting of whole spices",
      grinding: "grind together just before use",
      storage: "airtight container away from light",
      notes: "Can contain up to 30 ingredients",
    },

    medicinalProperties: {
      actions: ["digestive aid", "anti-inflammatory"],
      energetics: "warming",
      tastes: ["complex", "floral", "pungent"],
    },

    sensoryProfile: {
      taste: ["Mild"],
      aroma: ["Fresh"],
      texture: ["Standard"],
      notes: "Characteristic ras_el_hanout profile",
    },

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    season: ["Year-round"],

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.2,
        fat: 0.3,
        fiber: 0.5,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Digestive aid", "Anti-inflammatory"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  herbes_de_provence: {
      description: "A classic French herb blend representing the flavors of the Provence region. It typically includes savory, marjoram, rosemary, thyme, and oregano, and in the North American market, culinary lavender is often added, providing a highly aromatic, floral, and woody profile perfect for roasting whole chickens.",
    name: "Herbes De Provence",
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ["aromatic", "Mediterranean", "savory"],
    origin: ["Southern France"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: [
      "thyme",
      "basil",
      "rosemary",
      "tarragon",
      "savory",
      "marjoram",
      "oregano",
      "lavender",
    ],

    regionalVariations: {
      Traditional: ["no lavender"],
      Modern: ["includes lavender"],
      Commercial: ["may include fennel"],
    },

    affinities: ["chicken", "fish", "vegetables", "tomatoes", "grilled meats"],
    cookingMethods: ["roasting", "grilling", "sauce making"],

    proportions: {
      thyme: 2,
      basil: 1,
      rosemary: 1,
      tarragon: 1,
      savory: 1,
      marjoram: 1,
      oregano: 1,
      lavender: 0.5,
    },

    preparation: {
      mixing: "individually before grinding",
      grinding: "just before use",
      storage: "airtight, dark container",
      notes: "Blend can be adjusted for heat preference",
    },

    medicinalProperties: {
      actions: ["digestive aid", "anti-inflammatory", "warming"],
      energetics: "heating",
      tastes: ["pungent", "sweet", "bitter"],
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    season: ["Year-round"],

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.2,
        fat: 0.3,
        fiber: 0.5,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Digestive aid", "Anti-inflammatory"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},

    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Jupiter"],
      favorableZodiac: ["gemini", "sagittarius", "virgo"],
      seasonalAffinity: ["fall"],
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  chinese_five_spice: {
      description: "A potent, highly aromatic spice blend encompassing all five tastes (sweet, sour, bitter, salty, and umami). The classic formulation includes star anise, cloves, Chinese cinnamon, Sichuan peppercorns, and fennel seeds, providing a complex, licorice-heavy warmth crucial for roasted meats like Char Siu.",
    name: "Chinese Five Spice",
    elementalProperties: { Fire: 0.58, Water: 0.14, Earth: 0.14, Air: 0.14 },
    astrologicalProfile: {
      rulingPlanets: ["Jupiter", "Mars"],
      favorableZodiac: ["sagittarius", "aries", "leo"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["warming", "balanced", "complex"],
    origin: ["China"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      "star anise": 2,
      "chinese cinnamon": 2,
      "fennel seeds": 2,
      cloves: 1,
      "sichuan pepper": 1,
    },

    ratios: "2:2:2:1:1",

    regionalVariations: {
      Northern: {
        name: "Northern",
        "star anise": 2,
        "chinese cinnamon": 3,
        "fennel seeds": 2,
        cloves: 1,
        "sichuan pepper": 1,
      },
      Southern: {
        name: "Southern",
        "star anise": 2,
        "chinese cinnamon": 2,
        "fennel seeds": 2,
        cloves: 1,
        "sichuan pepper": 1,
        "licorice root": 0.5,
      },
    },

    affinities: ["pork", "duck", "chicken", "seafood", "vegetables"],

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content

    culinaryProfile: {
      flavorProfile: {
        primary: ["balanced"],
      },

      cookingMethods: ["versatile"],
      cuisineAffinity: ["Global"],
    },

    season: ["Year-round"],

    preparation: {
      methods: ["Standard"],
      timing: "As needed",
      notes: "Standard prep for chinese_five_spice",
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.2,
        fat: 0.3,
        fiber: 0.5,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Digestive aid", "Anti-inflammatory"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    storage: {
      temperature: "Cool, dry place",
      duration: "6-12 months",
      container: "Airtight",
    },

    varieties: {},
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  za_atar: {
      description: "A vibrant, aromatic Middle Eastern spice blend featuring a base of dried wild thyme or oregano mixed with toasted sesame seeds, salt, and the defining tart, citrusy zing of sumac. It provides a profoundly earthy, nutty, and bright flavor profile perfect for dusting over hummus, flatbreads, or roasted chicken.",
    name: "Za Atar",
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ["earthy", "tangy", "aromatic"],
    origin: ["Levant"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      "dried thyme": 2,
      "sesame seeds": 2,
      sumac: 1,
      oregano: 1,
      marjoram: 1,
      salt: 0.5,
    },

    ratios: "2:2:1:1:1:0.5",

    regionalVariations: {
      Lebanese: {
        name: "Lebanese",
        "dried thyme": 2,
        "sesame seeds": 2,
        sumac: 2, // more sumac,
        oregano: 1,
        marjoram: 1,
        salt: 0.5,
      },
      Palestinian: {
        name: "Palestinian",
        "dried thyme": 2,
        "sesame seeds": 3, // more sesame,
        sumac: 1,
        oregano: 1,
        marjoram: 1,
        salt: 0.5,
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 10,
      macros: {
        protein: 0.4,
        carbs: 1.0,
        fat: 0.8,
        fiber: 0.6,
        sugar: 0.1,
        sodium: 150,
      },
      healthBenefits: ["Digestive support", "Antioxidant rich"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  curry_powder: {
      description: "A Western commercial spice blend designed to approximate the complex flavors of Indian cuisine. It typically features a brightly colored base of turmeric, rounded out with sweet and earthy spices like coriander, cumin, fenugreek, and varying amounts of chili pepper for heat.",
    name: "Curry Powder",
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ["warming", "complex", "pungent"],
    origin: ["British-Indian"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      turmeric: 3,
      coriander: 2,
      cumin: 2,
      ginger: 1,
      "black pepper": 1,
      cinnamon: 0.5,
      cardamom: 0.5,
      cayenne: 0.5,
      fenugreek: 0.5,
    },

    ratios: "3:2:2:1:1:0.5:0.5:0.5:0.5",

    regionalVariations: {
      Madras: {
        name: "Madras",
        turmeric: 3,
        coriander: 2,
        cumin: 2,
        ginger: 1,
        "black pepper": 1,
        cinnamon: 0.5,
        cardamom: 0.5,
        cayenne: 2, // extra hot,
        fenugreek: 0.5,
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 8,
      macros: {
        protein: 0.4,
        carbs: 1.3,
        fat: 0.4,
        fiber: 0.9,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Anti-inflammatory", "Digestive aid"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  berbere: {
      description: "A fiery, complex, and highly aromatic spice blend that forms the foundational flavor profile of Ethiopian and Eritrean cuisines. It is a deeply red, textured mix typically containing chili peppers, garlic, ginger, basil, korarima, rue, ajwain or radhuni, nigella, and fenugreek, offering immense savory depth and sustained heat.",
    name: "Berbere",
    elementalProperties: { Fire: 0.6, Air: 0.2, Earth: 0.1, Water: 0.1 },
    qualities: ["hot", "complex", "earthy"],
    origin: ["Ethiopia"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      "dried chili peppers": 4,
      garlic: 2,
      ginger: 2,
      basil: 1,
      korarima: 1,
      "white pepper": 1,
      "black pepper": 1,
      fenugreek: 1,
      cloves: 0.5,
      cinnamon: 0.5,
      nutmeg: 0.5,
    },

    ratios: "4:2:2:1:1:1:1:1:0.5:0.5:0.5",

    regionalVariations: {
      Traditional: {
        name: "Traditional",
        // includes additional fermentation process,
        rue: 0.5, // additional ingredient
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 8,
      macros: {
        protein: 0.4,
        carbs: 1.4,
        fat: 0.4,
        fiber: 0.9,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Anti-inflammatory", "Metabolic support"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  dukkah: {
      description: "A traditional Egyptian condiment consisting of a coarse mixture of roasted nuts (usually hazelnuts), sesame seeds, coriander, cumin, and salt. It provides an immediate, incredibly satisfying, crunchy, and savory-spicy burst of flavor, traditionally eaten by dipping bread in olive oil and then into the mixture.",
    name: "Dukkah",
    elementalProperties: { Earth: 0.4, Air: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ["nutty", "aromatic", "crunchy"],
    origin: ["Egypt"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      hazelnuts: 3,
      "sesame seeds": 2,
      coriander: 1,
      cumin: 1,
      "black pepper": 0.5,
      salt: 0.5,
    },

    ratios: "3:2:1:1:0.5:0.5",

    regionalVariations: {
      Alexandria: {
        name: "Alexandria",
        hazelnuts: 2,
        "pine nuts": 1,
        "sesame seeds": 3, // more sesame,
        coriander: 1,
        cumin: 1,
        "black pepper": 0.5,
        salt: 0.5,
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 15,
      macros: {
        protein: 0.6,
        carbs: 0.8,
        fat: 1.2,
        fiber: 0.5,
        sugar: 0.1,
        sodium: 100,
      },
      healthBenefits: ["Healthy fats", "Protein source"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  shichimi_togarashi: {
      description: "A traditional Japanese seven-spice blend designed to add bright, complex heat and texture to noodles and soups. While recipes vary, it almost universally includes coarsely ground red chili pepper, sansho (Japanese pepper), roasted orange peel, black and white sesame seeds, hemp seed, ginger, and nori (seaweed).",
    name: "Shichimi Togarashi",
    elementalProperties: { Fire: 0.61, Water: 0.13, Earth: 0.13, Air: 0.13 },
    qualities: ["spicy", "citrusy", "nutty"],
    origin: ["Japan"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      "dried red chili pepper": 3,
      "sansho pepper": 1,
      "orange peel": 1,
      "black sesame": 1,
      "white sesame": 1,
      "hemp seeds": 0.5,
      nori: 0.5,
      ginger: 0.5,
    },

    ratios: "3:1:1:1:1:0.5:0.5:0.5",

    regionalVariations: {
      Tokyo: {
        name: "Tokyo",
        "orange peel": 2, // more citrus
      },
      Kyoto: {
        name: "Kyoto",
        "black sesame": 2,
        "white sesame": 2, // more sesame
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 10,
      macros: {
        protein: 0.5,
        carbs: 1.0,
        fat: 0.7,
        fiber: 0.6,
        sugar: 0.1,
        sodium: 5,
      },
      healthBenefits: ["Metabolic boost", "Antioxidant rich"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  baharat: {
      description: "Baharat is a concentrated aromatic spice used in small amounts to add heat, fragrance, and depth to sauces, marinades, and dry rubs. Blooming it briefly in hot fat or toasting it gently before grinding helps release volatile oils and prevents flat flavor. Store airtight away from light and humidity, and refresh frequently to maintain potency.",
    name: "Baharat",
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ["warming", "aromatic", "complex"],
    origin: ["Middle East"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      "black pepper": 2,
      cumin: 2,
      coriander: 1,
      cinnamon: 1,
      cardamom: 1,
      paprika: 1,
      cloves: 0.5,
      nutmeg: 0.5,
    },

    ratios: "2:2:1:1:1:1:0.5:0.5",

    regionalVariations: {
      Turkish: {
        name: "Turkish",
        mint: 0.5, // additional
      },
      Gulf: {
        name: "Gulf",
        "lime powder": 1, // additional
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (2.5g)",
      calories: 8,
      macros: {
        protein: 0.3,
        carbs: 1.4,
        fat: 0.4,
        fiber: 0.9,
        sugar: 0.1,
        sodium: 1,
      },
      healthBenefits: ["Digestive aid", "Anti-inflammatory"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  jerk_seasoning: {
      description: "A highly assertive, intensely spicy, and aromatic dry rub or wet marinade originating in Jamaica. It is fundamentally defined by the fiery heat of Scotch bonnet peppers paired with the warm, sweet, and woodsy depth of allspice (pimento), thyme, and scallions, creating a deeply complex crust on grilled meats.",
    name: "Jerk Seasoning",
    elementalProperties: { Fire: 0.5, Earth: 0.2, Air: 0.2, Water: 0.1 },
    qualities: ["hot", "pungent", "aromatic"],
    origin: ["Jamaica"],
    category: "spice",
    subCategory: "blend",

    baseIngredients: {
      allspice: 3,
      "scotch bonnet": 2,
      thyme: 2,
      garlic: 2,
      ginger: 1,
      "black pepper": 1,
      "brown sugar": 1,
      cinnamon: 0.5,
      nutmeg: 0.5,
    },

    ratios: "3:2:2:2:1:1:1:0.5:0.5",

    regionalVariations: {
      Traditional: {
        name: "Traditional",
        // Wet paste version
        "green onions": 2,
        "soy sauce": 1,
      },
      Western: {
        name: "Western",
        "scotch bonnet": 1, // reduced heat
      },
    },

    nutritionalProfile: {
      serving_size: "1 tsp (3g)",
      calories: 12,
      macros: {
        protein: 0.3,
        carbs: 2.0,
        fat: 0.4,
        fiber: 0.6,
        sugar: 1.0,
        sodium: 1,
      },
      healthBenefits: ["Metabolic boost", "Anti-inflammatory"],
      source: "USDA FoodData Central estimate",
        vitamins: {},
        minerals: {}
    },

    // Removed excessive sensoryProfile nesting
    // Removed nested content
    // Removed nested content
    // Removed nested content
    // Removed nested content
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const _spiceBlends: Record<string, IngredientMapping> =
  fixIngredientMappings(rawSpiceBlends);

// Export without underscore for compatibility
export const spiceBlends = _spiceBlends;
