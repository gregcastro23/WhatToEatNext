import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawWholeSpices = {
  star_anise: {
      description: "The star-shaped pericarp of a small evergreen tree (*Illicium verum*) native to Vietnam and southwest China. It is highly concentrated with anethole, providing an intensely sweet, pungent, licorice-like flavor that is crucial to Chinese five-spice powder and Vietnamese pho broth.",
    name: "Star Anise",
    elementalProperties: { Fire: 0.49, Water: 0.13, Earth: 0.13, Air: 0.25 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      favorableZodiac: ["virgo", "taurus", "capricorn", "aries"],
      seasonalAffinity: ["fall"],
    },
    qualities: ["sweet", "licorice-like", "warming"],
    origin: ["China", "Vietnam"],
    category: "spices",
    subCategory: "whole",
    varieties: {
      Chinese: "traditional variety",
      Japanese: "more delicate",
      Vietnamese: "more robust",
    },
    preparation: {
      toasting: {
        method: "dry toast until fragrant",
        duration: "2-3 minutes",
        notes: "Watch carefully to prevent burning",
      },
      grinding: "grind as needed",
      infusing: {
        method: "add whole to liquids",
        duration: "10-20 minutes",
        removal: "required before serving",
      },
    },
    culinaryApplications: {
      broths: {
        name: "Broths",
        method: "add whole to simmering liquid",
        timing: "early in cooking",
        pairings: ["cinnamon", "ginger", "onions"],
        ratios: "1-2 pods per 2 cups liquid",
      },
      tea_blends: {
        name: "Tea Blends",
        method: "combine with other spices",
        pairings: ["black tea", "cinnamon", "orange"],
        ratios: "1 pod per 2 cups water",
      },
    },
    storage: {
      temperature: "cool, dark place",
      duration: "2 years",
      container: "airtight",
      notes: "Maintains potency well when whole",
    },
    nutritionalProfile: {
      serving_size: "1 whole star (1g)",
      calories: 3,
      macros: {
        protein: 0.04,
        carbs: 0.5,
        fat: 0.02,
        fiber: 0.1,
        sugar: 0,
        sodium: 0,
      },
      vitamins: { C: 0.01 },
      minerals: { iron: 0.01, calcium: 0.01 },
      source: "USDA FoodData Central",
    },
      sensoryProfile: { taste: { spicy: 0.3, sweet: 0.5, sour: 0, bitter: 0.3, salty: 0, umami: 0 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  cardamom_pods: {
      description: "A highly aromatic, resinous spice (*Elettaria cardamomum*) enclosed in small green or black pods. Green cardamom offers a complex, cooling, eucalyptus-and-citrus sweetness essential for Scandinavian baking and Indian sweets, while black cardamom is heavily smoked and deeply savory.",
    name: "Cardamom Pods",
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra"],
      elementalAffinity: {
        base: "Air",
        decanModifiers: {
          first: { element: "Air", planet: "Mercury" },
          second: { element: "Fire", planet: "Venus" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
    },
    qualities: ["aromatic", "complex", "intense"],
    origin: ["India", "Guatemala", "Sri Lanka"],
    category: "spices",
    subCategory: "whole",
    varieties: {},
    preparation: {
      toasting: {
        method: "light dry toast",
        duration: "1-2 minutes",
        notes: "Just until fragrant",
      },
      grinding: {
        method: "remove seeds from pods",
        notes: "Discard pods or use for infusing",
      },
      crushing: {
        method: "lightly crush to release oils",
        notes: "For infusing liquids",
      },
    },
    culinaryApplications: {
      rice_dishes: {
        name: "Rice Dishes",
        method: "add whole pods during cooking",
        timing: "with rice and water",
        pairings: ["basmati rice", "saffron", "cinnamon"],
        ratios: "4-5 pods per cup of rice",
      },
      curries: {
        name: "Curries",
        method: "add whole pods during cooking",
        timing: "with meat and vegetables",
        pairings: ["chicken", "lamb", "onions"],
        ratios: "2-3 pods per pound of meat",
      },
      tea_blends: {
        name: "Tea Blends",
        method: "combine with other spices",
        pairings: ["black tea", "cinnamon", "orange"],
        ratios: "1 pod per 2 cups water",
      },
    },
    storage: {
      temperature: "cool, dark place",
      duration: "2 years",
      container: "airtight",
      notes: "Maintains potency well when whole",
    },
    nutritionalProfile: {
      serving_size: "1 tsp pods (2g)",
      calories: 6,
      macros: {
        protein: 0.2,
        carbs: 1.4,
        fat: 0.1,
        fiber: 0.6,
        sugar: 0,
        sodium: 1,
      },
      vitamins: { C: 0.01, B6: 0.01 },
      minerals: { manganese: 0.04, iron: 0.02, magnesium: 0.01 },
      source: "USDA FoodData Central",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  mustard_seeds: {
      description: "Tiny, round seeds of various mustard plants (*Brassica* and *Sinapis*) available in yellow, brown, and black varieties. The seeds themselves have no heat until crushed and mixed with a cold liquid, which triggers an enzyme reaction creating the sharp, pungent compound allyl isothiocyanate.\n\n**Selection & Storage:** Yellow seeds are the mildest, while black and brown are much sharper and more pungent. Store whole seeds in an airtight container in a dark pantry, as they keep indefinitely.",
    name: "Mustard Seeds",
    elementalProperties: { Fire: 0.4, Air: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ["pungent", "hot", "nutty"],
    origin: ["India", "Canada", "Nepal"],
    category: "spices",
    subCategory: "whole",
    varieties: {
      Brown: {
        name: "Brown",
        appearance: "smaller, dark brown",
        flavor: "more pungent",
        uses: "Indian cuisine, oil blooming",
      },
    },
    culinaryApplications: {
      tempering: {
        name: "Tempering",
        method: "heat oil until seeds pop",
        timing: "start of cooking",
        pairings: ["curry leaves", "cumin seeds", "asafoetida"],
        ratios: "1 tsp per cup of oil",
        techniques: {
          tadka: "bloom in hot oil and pour over dish",
          base: "start dish with bloomed seeds",
          layering: "add at multiple cooking stages",
        },
      },
      marinades: {
        name: "Marinades",
        method: "crush or grind",
        timing: "4-24 hours before cooking",
        pairings: ["garlic", "herbs", "vinegar"],
        ratios: "1 tbsp per cup of liquid",
        techniques: {
          paste: "grind with liquids",
          rustic: "roughly crush",
          infusion: "heat in oil first",
        },
      },
      sauces: {
        name: "Sauces",
        method: "toast and grind or leave whole",
        pairings: ["cream", "wine", "vinegar"],
        ratios: "1 tsp per cup of liquid",
        techniques: {
          cream_sauce: "infuse in warm cream",
          vinaigrette: "crush and mix",
          grainy_mustard: "soak in vinegar",
        },
      },
    },
    storage: {
      temperature: "cool, dark place",
      duration: "whole: 1 year",
      container: "airtight",
      notes: "Seeds can be sprouted if fresh",
    },
    nutritionalProfile: {
      serving_size: "1 tsp (3.3g)",
      calories: 15,
      macros: {
        protein: 0.8,
        carbs: 0.8,
        fat: 1.0,
        fiber: 0.4,
        sugar: 0.2,
        sodium: 1,
      },
      vitamins: { B1: 0.02 },
      minerals: {
        selenium: 0.06,
        manganese: 0.03,
        iron: 0.02,
        magnesium: 0.02,
      },
      source: "USDA FoodData Central",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] }
},

  fennel_seeds: {
      description: "The dried seeds of the fennel plant (*Foeniculum vulgare*), providing a highly aromatic, sweet, and warm licorice flavor. They are a crucial component of Chinese Five Spice, Indian Panch Phoron, and traditional sweet Italian sausages.",
    name: "Fennel Seeds",
    elementalProperties: { Air: 0.4, Fire: 0.3, Earth: 0.2, Water: 0.1 },
    qualities: ["sweet", "anise-like", "warming"],
    origin: ["India", "Mediterranean", "China"],
    category: "spices",
    subCategory: "whole",
    varieties: {
      Indian: {
        name: "Indian",
        appearance: "greener, thinner",
        flavor: "more aromatic",
        uses: "curries, digestive",
      },
      Mediterranean: {
        name: "Mediterranean",
        appearance: "plumper, pale green",
        flavor: "sweeter",
        uses: "sausages, bread",
      },
    },
    culinaryApplications: {
      bread_baking: {
        name: "Bread Baking",
        method: "add whole to dough",
        timing: "during mixing",
        pairings: ["rye flour", "caraway", "salt"],
        ratios: "1-2 tbsp per loaf",
        techniques: {
          topping: "sprinkle on crust",
          incorporated: "mix into dough",
          flavored_oil: "infuse in oil first",
        },
      },
      seafood_seasoning: {
        name: "Seafood Seasoning",
        method: "crush or leave whole",
        timing: "before cooking",
        pairings: ["citrus", "garlic", "white wine"],
        ratios: "1 tsp per pound",
        techniques: {
          crust: "grind with salt",
          court_bouillon: "add to poaching liquid",
          steam_aromatic: "add to steaming water",
        },
      },
      sausage_making: {
        name: "Sausage Making",
        method: "lightly crush",
        pairings: ["black pepper", "garlic", "salt"],
        ratios: "1 tbsp per pound",
        techniques: {
          italian_style: "whole seeds",
          chinese_style: "ground with star anise",
          merguez: "combined with cumin",
        },
      },
    },
    nutritionalProfile: {
      serving_size: "1 tsp (2g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.1,
        fat: 0.3,
        fiber: 0.8,
        sugar: 0,
        sodium: 2,
      },
      vitamins: { C: 0.01 },
      minerals: { manganese: 0.03, calcium: 0.02, iron: 0.02 },
      source: "USDA FoodData Central",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  coriander_seeds: {
      description: "The dried seeds of the cilantro plant (*Coriandrum sativum*), yielding a completely different flavor profile than its leaves. The seeds provide a warm, floral, and slightly citrusy sweetness that is a crucial balancing component in heavy, spicy curry blends and pickling brines.",
    name: "Coriander Seeds",
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ["citrusy", "nutty", "floral"],
    origin: ["India", "Morocco", "Eastern Europe"],
    category: "spices",
    subCategory: "whole",
    varieties: {
      Indian: {
        name: "Indian",
        appearance: "larger, more round",
        flavor: "more aromatic",
        uses: "curries, spice blends",
      },
      Mediterranean: {
        name: "Mediterranean",
        appearance: "smaller, more oval",
        flavor: "more citrusy",
        uses: "marinades, pickling",
      },
    },
    culinaryApplications: {
      curry_base: {
        name: "Curry Base",
        method: "toast and grind",
        timing: "beginning of cooking",
        pairings: ["cumin", "fennel", "peppercorns"],
        ratios: "2:1:1 (coriander:cumin:other spices)",
        techniques: {
          dry_toasting: "until fragrant and color changes",
          wet_grinding: "with aromatics for paste",
          whole_tempering: "crack and bloom in oil",
        },
      },
      pickling_spice: {
        name: "Pickling Spice",
        method: "use whole",
        timing: "add to brine",
        pairings: ["dill", "mustard seed", "bay leaf"],
        ratios: "2 tbsp per quart",
        techniques: {
          hot_brine: "add to heating liquid",
          fermentation: "add at start",
          quick_pickle: "lightly crush first",
        },
      },
    },
    nutritionalProfile: {
      serving_size: "1 tsp (1.8g)",
      calories: 5,
      macros: {
        protein: 0.2,
        carbs: 1.0,
        fat: 0.2,
        fiber: 0.7,
        sugar: 0,
        sodium: 1,
      },
      vitamins: { C: 0.01 },
      minerals: { iron: 0.02, manganese: 0.01 },
      source: "USDA FoodData Central",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  cumin_seeds: {
      description: "A potent, earthy spice derived from the seeds of a parsley relative (*Cuminum cyminum*). When toasted, it releases powerful, warm, and slightly musky pyrazines that form the backbone of savory flavor profiles in Mexican, Indian, and Middle Eastern cuisines.",
    name: "Cumin Seeds",
    elementalProperties: { Earth: 0.4, Fire: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Saturn"],
      favorableZodiac: ["virgo", "capricorn"],
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Mercury" },
          second: { element: "Fire", planet: "Saturn" },
          third: { element: "Air", planet: "Uranus" },
        },
      },
    },
    qualities: ["earthy", "warm", "pungent"],
    origin: ["India", "Iran", "Turkey"],
    category: "spices",
    subCategory: "whole",
    varieties: {
      Indian: {
        name: "Indian",
        appearance: "small, dark",
        flavor: "intense, earthy",
        uses: "curries, tempering",
      },
      Iranian: {
        name: "Iranian",
        appearance: "longer seeds",
        flavor: "more delicate",
        uses: "rice dishes, kebabs",
      },
    },
    culinaryApplications: {
      tempering: {
        name: "Tempering",
        method: "bloom in hot oil",
        timing: "start of cooking",
        pairings: ["mustard seeds", "curry leaves"],
        ratios: "1-2 tsp per dish",
        techniques: {
          tadka: "bloom and pour over",
          pilaf_base: "start rice dishes",
          oil_infusion: "longer steep for oil",
        },
      },
      meat_rubs: {
        name: "Meat Rubs",
        method: "toast and grind",
        timing: "before cooking",
        pairings: ["coriander", "black pepper", "chili"],
        ratios: "1 tbsp per pound",
        techniques: {
          dry_rub: "grind with other spices",
          paste: "grind with wet ingredients",
          marinade_base: "infuse in oil first",
        },
      },
    },
    nutritionalProfile: {
      serving_size: "1 tsp (2.1g)",
      calories: 8,
      macros: {
        protein: 0.4,
        carbs: 0.9,
        fat: 0.5,
        fiber: 0.2,
        sugar: 0,
        sodium: 4,
      },
      vitamins: { E: 0.01 },
      minerals: { iron: 0.07, manganese: 0.02, magnesium: 0.02 },
      source: "USDA FoodData Central",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},

  caraway_seeds: {
      description: "The dried, crescent-shaped fruit of a biennial plant (*Carum carvi*) in the parsley family. They provide a highly pungent, slightly sweet, and distinctively anise/licorice flavor profile that cuts through rich, fatty dishes, acting as the essential defining flavor of rye bread and sauerkraut.",
    name: "Caraway Seeds",
    elementalProperties: { Air: 0.4, Earth: 0.3, Fire: 0.2, Water: 0.1 },
    qualities: ["warming", "sharp", "slightly sweet"],
    origin: ["Netherlands", "Eastern Europe", "Finland"],
    category: "spices",
    subCategory: "whole",
    varieties: {
      Dutch: {
        name: "Dutch",
        appearance: "curved, dark",
        flavor: "traditional strength",
        uses: "bread, cheese",
      },
      Finnish: {
        name: "Finnish",
        appearance: "slightly larger",
        flavor: "more intense",
        uses: "rye bread, aquavit",
      },
    },
    culinaryApplications: {
      bread_baking: {
        name: "Bread Baking",
        method: "whole seeds in dough",
        timing: "during mixing",
        pairings: ["rye flour", "fennel", "salt"],
        ratios: "1-2 tbsp per loaf",
        techniques: {
          traditional_rye: "heavy seeding",
          light_rye: "sparse seeding",
          crust_topping: "press into top",
        },
      },
      sauerkraut: {
        name: "Sauerkraut",
        method: "add whole to cabbage",
        timing: "during fermentation setup",
        pairings: ["juniper", "bay leaf", "black pepper"],
        ratios: "1 tbsp per quart",
        techniques: {
          traditional: "whole seeds throughout",
          spice_packet: "contained in muslin",
          layered: "between cabbage layers",
        },
      },
    },
    nutritionalProfile: {
      serving_size: "1 tsp (2.1g)",
      calories: 7,
      macros: {
        protein: 0.4,
        carbs: 1.0,
        fat: 0.3,
        fiber: 0.8,
        sugar: 0.01,
        sodium: 1,
      },
      vitamins: { C: 0.01 },
      minerals: { iron: 0.03, calcium: 0.01, manganese: 0.01 },
      source: "USDA FoodData Central",
    },
      astrologicalProfile: { rulingPlanets: ["Sun", "Moon"], favorableZodiac: ["cancer", "taurus"] },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},
};

// Fix the ingredient mappings to ensure they have all required properties
export const _wholeSpices: Record<string, IngredientMapping> =
  fixIngredientMappings(
    rawWholeSpices as Record<string, Partial<IngredientMapping>>,
  );

// Export without underscore for compatibility
export const wholeSpices = _wholeSpices;
