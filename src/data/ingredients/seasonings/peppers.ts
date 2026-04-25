import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawPeppers = {
  black_pepper: {
      description: "The world's most ubiquitous spice (*Piper nigrum*), made from the dried, unripe berries of a flowering vine. It provides a sharp, biting heat due to the alkaloid piperine, and complex, woody aromas that quickly degrade, which is why it should always be freshly ground just before use.",
    name: "Black Pepper",
    elementalProperties: { Fire: 0.7, Air: 0.2, Earth: 0.1, Water: 0 },
    alchemicalProperties: { Spirit: 0.85, Essence: 0.35, Matter: 0.15, Substance: 0.20 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["aries", "leo"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Air", planet: "Sun" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
      lunarPhaseModifiers: {
        "waxing crescent": {
          elementalBoost: { Fire: 0.1, Air: 0.1 },
          preparationTips: ["Best for marinades"],
        },
        "full moon": {
          elementalBoost: { Fire: 0.2 },
          preparationTips: ["Ideal for robust dishes"],
        },
      },
    },
    qualities: ["pungent", "sharp", "aromatic"],
    nutritionalProfile: {
      serving_size: "1 tsp ground (2.3g)",
      calories: 6,
      macros: {
        protein: 0.2,
        carbs: 1.5,
        fat: 0.1,
        fiber: 0.6,
        saturatedFat: 0,
        sugar: 0,
        potassium: 31,
        sodium: 0,
      },
      vitamins: { K: 0.02 },
      minerals: { manganese: 0.06, iron: 0.02, copper: 0.01 },
    },
    origin: ["India", "Vietnam", "Brazil"],
    category: "spice",
    subCategory: "peppercorn",
    varieties: {
      Tellicherry: {
        name: "Tellicherry",
        appearance: "large, dark berries",
        flavor: "complex, citrusy undertones",
        heat: "moderate",
        uses: "premium applications",
      },
      Malabar: {
        name: "Malabar",
        appearance: "medium-sized berries",
        flavor: "balanced, standard profile",
        heat: "moderate",
        uses: "all-purpose",
      },
      Lampong: {
        name: "Lampong",
        appearance: "small berries",
        flavor: "sharp, intense",
        heat: "high",
        uses: "hearty dishes",
      },
    },
    culinaryApplications: {
      finishing: {
        name: "Finishing",
        method: "freshly ground",
        timing: "just before serving",
        applications: {
          proteins: "after cooking",
          pasta: "finish with pepper and cheese",
          vegetables: "light dusting",
        },
        techniques: {
          cracked: {
            name: "Cracked",
            method: "coarse grind or mortar",
            applications: "crusts, rustic dishes",
          },
          fine_ground: {
            name: "Fine Ground",
            method: "fine pepper mill",
            applications: "sauces, delicate dishes",
          },
        },
      },
      cooking: {
        name: "Cooking",
        method: "add during process",
        timing: {
          early: "for infused flavor",
          middle: "for balanced heat",
          end: "for pronounced aroma",
        },
        pairings: ["cream", "lemon", "tomato", "beef", "cheese"],
      },
    },
    storage: {
      temperature: "room temperature",
      humidity: "low",
      container: "airtight, opaque",
      duration: "whole: 2-3 years, ground: 3-4 months",
      notes: "Best stored whole and ground as needed",
    },
      sensoryProfile: { taste: { spicy: 0.6, earthy: 0.4, sweet: 0, salty: 0, sour: 0, bitter: 0.2, umami: 0 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  white_pepper: {
      description: "The seed of the *Piper nigrum* vine, with its dark outer skin removed before drying. It offers a sharper, earthier, and slightly more fermented or musky flavor than black pepper, and is prized in French and Chinese cuisines where dark black specks are visually undesirable in pale sauces.",
    name: "White Pepper",
    elementalProperties: { Fire: 0.5, Earth: 0.3, Air: 0.2, Water: 0 },
    alchemicalProperties: { Spirit: 0.75, Essence: 0.30, Matter: 0.18, Substance: 0.22 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Mars"],
      favorableZodiac: ["gemini", "virgo"],
      elementalAffinity: {
        base: "Fire",
      },
    },
    qualities: ["earthy", "musty", "hot"],
    nutritionalProfile: {
      serving_size: "1 tsp ground (2.4g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.6,
        fat: 0.1,
        fiber: 0.6,
        saturatedFat: 0,
        sugar: 0,
        potassium: 2,
        sodium: 0,
      },
      vitamins: {},
      minerals: { manganese: 0.05, iron: 0.02, calcium: 0.01 },
    },
    origin: ["Indonesia", "Malaysia", "China"],
    category: "spice",
    subCategory: "peppercorn",
    varieties: {
      Muntok: {
        name: "Muntok",
        appearance: "off-white to beige",
        flavor: "earthy, complex",
        heat: "medium-high",
        uses: "light-colored sauces, Asian cuisine",
      },
      Sarawak: {
        name: "Sarawak",
        appearance: "cream colored",
        flavor: "delicate, less fermented",
        heat: "medium",
        uses: "European cuisine",
      },
    },
    culinaryApplications: {
      light_colored_dishes: {
        name: "Light Colored Dishes",
        method: "fine grind",
        timing: "during cooking",
        applications: {
          cream_sauces: "when thickening",
          mashed_potatoes: "during mashing",
          soups: "white or clear",
        },
      },
      asian_cuisine: {
        name: "Asian Cuisine",
        method: "ground or whole",
        timing: "various stages",
        applications: {
          hot_pot: "in broth",
          marinades: "ground in paste",
          stir_fry: "in sauce",
        },
      },
    },
    storage: {
      temperature: "room temperature",
      humidity: "low",
      container: "airtight, opaque",
      duration: "whole: 1-2 years, ground: 2-3 months",
      notes: "More delicate than black pepper",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  pink_peppercorn: {
      description: "The dried berries of the *Schinus molle* (Peruvian peppertree) or *Schinus terebinthifolia* (Brazilian peppertree), entirely unrelated to true black pepper. They offer a very mild, slightly sweet, and profoundly floral heat with notes of rose and citrus, providing brilliant color and delicate crunch to light cream sauces or fish.",
    name: "Pink Peppercorn",
    elementalProperties: { Air: 0.4, Fire: 0.3, Water: 0.2, Earth: 0.1 },
    alchemicalProperties: { Spirit: 0.70, Essence: 0.45, Matter: 0.10, Substance: 0.15 },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Mars"],
      favorableZodiac: ["libra", "taurus"],
      elementalAffinity: {
        base: "Air",
      },
    },
    qualities: ["sweet", "aromatic", "mild heat"],
    nutritionalProfile: {
      serving_size: "1 tsp (2g)",
      calories: 4,
      macros: {
        protein: 0.1,
        carbs: 1.0,
        fat: 0.1,
        fiber: 0.2,
        saturatedFat: 0,
        sugar: 0,
        potassium: 8,
        sodium: 0,
      },
      vitamins: {},
      minerals: { manganese: 0.02, calcium: 0.01 },
    },
    origin: ["Brazil", "Madagascar", "Reunion Island"],
    category: "spice",
    subCategory: "false peppercorn",
    botanical: {
      family: "Anacardiaceae",
      genus: "Schinus",
      notes: "Not true pepper, related to cashews",
    },
    culinaryApplications: {
      visual_accent: {
        name: "Visual Accent",
        method: "whole berries",
        applications: {
          salads: "colorful garnish",
          cheese_plates: "decorative and flavorful accent",
          desserts: "with chocolate or fruit",
        },
      },
      delicate_seasoning: {
        name: "Delicate Seasoning",
        method: "lightly crushed",
        applications: {
          fish: "with citrus",
          poultry: "light seasoning",
          vinaigrettes: "subtle heat",
        },
      },
    },
    storage: {
      temperature: "room temperature",
      humidity: "low",
      container: "airtight",
      duration: "6-12 months",
      notes: "Loses color and aroma faster than true peppercorns",
    },
    allergies: {
      warning: "May cause reaction in people with tree nut allergies",
      related_to: "cashews and mangoes",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  szechuan_peppercorn: {
      description: "The dried berry husks of the prickly ash tree (*Zanthoxylum*), completely unrelated to black pepper or chili peppers. They contain hydroxy-alpha sanshool, a compound that creates a unique vibrating, numbing, and tingling sensation (málà) on the tongue, accompanied by a bright citrus aroma.",
    name: "Szechuan Peppercorn",
    elementalProperties: { Fire: 0.56, Water: 0, Earth: 0.11, Air: 0.33 },
    alchemicalProperties: { Spirit: 0.88, Essence: 0.40, Matter: 0.12, Substance: 0.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Uranus"],
      favorableZodiac: ["gemini", "aquarius"],
      elementalAffinity: {
        base: "Fire",
      },
    },
    qualities: ["numbing", "citrusy", "aromatic"],
    nutritionalProfile: {
      serving_size: "1 tsp (2g)",
      calories: 6,
      macros: {
        protein: 0.2,
        carbs: 1.2,
        fat: 0.1,
        fiber: 0.4,
        saturatedFat: 0,
        sugar: 0,
        potassium: 22,
        sodium: 1,
      },
      vitamins: {},
      minerals: { manganese: 0.03, iron: 0.02 },
    },
    origin: ["China"],
    category: "spice",
    subCategory: "false peppercorn",
    botanical: {
      family: "Rutaceae",
      genus: "Zanthoxylum",
      notes: "Not related to black pepper",
    },
    culinaryApplications: {
      mala_flavor: {
        name: "Mala Flavor",
        method: "toasted and ground",
        applications: {
          stir_fry: "with chili for numbing-spicy effect",
          braises: "in five-spice blend",
          oil_infusion: "for numbing oil",
        },
        pairings: ["chili", "garlic", "star anise", "beef", "tofu"],
      },
    },
    storage: {
      temperature: "room temperature",
      humidity: "low",
      container: "airtight",
      duration: "whole: 1-2 years, ground: 1 month",
      notes: "Volatile oils dissipate quickly when ground",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  long_pepper: {
      description: "An exotic flowering vine (*Piper longum*) closely related to black pepper, producing tiny fruit clusters that look like slender catkins. It possesses a complex, sweet, and incredibly pungent heat that is earthier and more aromatic than black pepper, boasting notes of nutmeg, cinnamon, and cardamom.",
    name: "Long Pepper",
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0 },
    alchemicalProperties: { Spirit: 0.78, Essence: 0.35, Matter: 0.18, Substance: 0.20 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["aries", "capricorn"],
      elementalAffinity: {
        base: "Fire",
      },
    },
    qualities: ["hot", "sweet", "complex"],
    nutritionalProfile: {
      serving_size: "1 tsp (2g)",
      calories: 5,
      macros: {
        protein: 0.2,
        carbs: 1.2,
        fat: 0.1,
        fiber: 0.3,
        saturatedFat: 0,
        sugar: 0,
        potassium: 18,
        sodium: 1,
      },
      vitamins: {},
      minerals: { manganese: 0.04, iron: 0.02 },
    },
    origin: ["India", "Indonesia"],
    category: "spice",
    subCategory: "true peppercorn",
    botanical: {
      species: "Piper longum",
      notes: "Ancient pepper variety",
    },
    culinaryApplications: {
      spice_blends: {
        name: "Spice Blends",
        method: "ground",
        applications: {
          curry_powders: "traditional component",
          pickling_spice: "complex heat",
          mulling_spice: "for warming beverages",
        },
      },
      medicinal: {
        name: "Medicinal",
        method: "infusions and powders",
        applications: {
          digestive_aids: "traditional use",
          warming_teas: "with honey and ginger",
        },
      },
    },
    storage: {
      temperature: "room temperature",
      humidity: "low",
      container: "airtight",
      duration: "whole: 2 years, ground: 6 months",
      notes: "Less common but keeps well",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const _peppers: Record<string, IngredientMapping> =
  fixIngredientMappings(
    rawPeppers as Record<string, Partial<IngredientMapping>>,
  );
export const peppers = _peppers;
