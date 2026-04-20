import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawAromatics = {
  onion: {
      description: "A foundational aromatic (*Allium cepa*) that builds savory depth in nearly every global cuisine. Its concentric layers contain sulfur compounds that, when exposed to heat, undergo the Maillard reaction to create deep, sweet, and complex flavors ranging from sharp when raw to caramel-like when slow-cooked.",
    name: "Onion",
    elementalProperties: { Fire: 0.4, Earth: 0.3, Water: 0.2, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.55, Essence: 0.50, Matter: 0.55, Substance: 0.45 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["aries", "capricorn"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Earth", planet: "Saturn" },
          third: { element: "Water", planet: "Neptune" },
        },
      },
    },
    qualities: ["pungent", "savory", "sweet when cooked"],
    nutritionalProfile: {
      serving_size: "1 medium (110g)",
      calories: 44,
      macros: {
        protein: 1.2,
        carbs: 10,
        fat: 0.1,
        fiber: 1.7,
        saturatedFat: 0,
        sugar: 4.7,
        potassium: 161,
        sodium: 4,
      },
      vitamins: { B6: 0.12, folate: 0.05, thiamin: 0.03 },
      minerals: { manganese: 0.06, phosphorus: 0.04, potassium: 0.05 },
    },
    origin: ["Global"],
    category: "seasonings",
    subCategory: "allium",
    varieties: {},
    culinaryApplications: {
      base_flavor: {
        name: "Base Flavor",
        method: "sauté until translucent",
        timing: "5-7 minutes",
        applications: {
          mirepoix: "with carrots and celery",
          sofrito: "with peppers and tomatoes",
          holy_trinity: "with celery and bell peppers",
        },
      },
    },
    storage: {
      temperature: "cool, dry place",
      humidity: "low",
      container: "ventilated",
      duration: "1-2 months",
      notes: "Keep away from potatoes",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  garlic: {
      description: "A pungent bulb (*Allium sativum*) belonging to the onion genus, prized globally for its intense, savory flavor and aroma. When its cells are crushed or chopped, an enzyme reaction produces allicin, the compound responsible for its signature bite and potent antimicrobial properties. This sharpness mellows into a deep, sweet nuttiness when roasted or sautéed.\\n\\n",
    name: "Garlic",
    elementalProperties: { Fire: 0.6, Earth: 0.3, Air: 0.1, Water: 0 },
    alchemicalProperties: { Spirit: 0.82, Essence: 0.55, Matter: 0.45, Substance: 0.38 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Pluto"],
      favorableZodiac: ["aries", "scorpio"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Earth", planet: "Pluto" },
          third: { element: "Air", planet: "Uranus" },
        },
      },
    },
    qualities: ["pungent", "spicy", "medicinal"],
    nutritionalProfile: {
      serving_size: "3 cloves (9g)",
      calories: 13,
      macros: {
        protein: 0.6,
        carbs: 3,
        fat: 0,
        fiber: 0.2,
        saturatedFat: 0,
        sugar: 0.1,
        potassium: 36,
        sodium: 2,
      },
      vitamins: { B6: 0.06, manganese: 0.08 },
      minerals: { manganese: 0.08, selenium: 0.01 },
    },
    origin: ["Central Asia"],
    category: "seasonings",
    subCategory: "allium",
    varieties: {},
    culinaryApplications: {
      sautéed: {
        name: "Sautéed",
        method: "minced and cooked in oil",
        timing: "30-60 seconds until fragrant",
        applications: {
          base_flavor: "start of many dishes",
          infused_oils: "for finishing dishes",
          pasta_sauces: "essential foundation",
        },
      },
    },
    storage: {
      temperature: "cool, dry place",
      humidity: "moderate",
      container: "ventilated",
      duration: "3-6 months",
      notes: "Do not refrigerate whole heads",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  ginger: {
      description: "A knobby, fibrous rhizome (*Zingiber officinale*) prized for its warm, spicy, and slightly citrusy bite. The active compound gingerol provides its signature sharp heat, which mellows and deepens into a warming aromatic when cooked.",
    name: "Ginger",
    elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0 },
    alchemicalProperties: { Spirit: 0.85, Essence: 0.58, Matter: 0.40, Substance: 0.35 },
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
    },
    qualities: ["warming", "pungent", "aromatic"],
    nutritionalProfile: {
      serving_size: "1 tbsp fresh (6g)",
      calories: 5,
      macros: {
        protein: 0.1,
        carbs: 1.1,
        fat: 0,
        fiber: 0.1,
        saturatedFat: 0,
        sugar: 0.1,
        potassium: 25,
        sodium: 1,
      },
      vitamins: { B6: 0.01 },
      minerals: { manganese: 0.01, copper: 0.01, magnesium: 0.01 },
    },
    origin: ["Southeast Asia"],
    category: "spices",
    subCategory: "rhizome",
    varieties: {
      Young: {
        name: "Young",
        appearance: "thin skin, juicy flesh",
        flavor: "mild, less fibrous",
        uses: "fresh applications, pickling",
      },
      Mature: {
        name: "Mature",
        appearance: "thick skin, fibrous",
        flavor: "strong, spicy",
        uses: "cooking, powdering",
      },
      Galangal: {
        name: "Galangal",
        appearance: "harder, white flesh",
        flavor: "citrusy, pine-like",
        uses: "Thai cuisine, spice blends",
      },
    },
    culinaryApplications: {
      fresh: {
        name: "Fresh",
        method: "peeled and grated or minced",
        timing: "add early for mild flavor, late for punch",
        applications: {
          stir_fry: "aromatic base",
          marinades: "tenderizing properties",
          teas: "medicinal and flavorful",
        },
      },
    },
    storage: {
      temperature: "room temperature or refrigerated",
      humidity: "moderate",
      container: "paper bag or wrapped in paper towel",
      duration: "fresh: 3 weeks, frozen: 6 months",
      notes: "Can be frozen whole or grated",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  lemongrass: {
      description: "A tall, fibrous tropical grass (*Cymbopogon citratus*) with a tough outer stalk and a tender, highly aromatic inner core. It provides a complex, bright, and floral citrus flavor without the sharp acidity of lemon juice, making it indispensable in Southeast Asian curries and soups.",
    name: "Lemongrass",
    elementalProperties: { Air: 0.5, Water: 0.3, Fire: 0.2, Earth: 0 },
    alchemicalProperties: { Spirit: 0.78, Essence: 0.65, Matter: 0.15, Substance: 0.18 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra"],
      elementalAffinity: {
        base: "Air",
      },
    },
    qualities: ["citrusy", "aromatic", "bright"],
    nutritionalProfile: {
      serving_size: "1 stalk (67g)",
      calories: 66,
      macros: {
        protein: 1.2,
        carbs: 17,
        fat: 0.3,
        fiber: 0,
        saturatedFat: 0.1,
        sugar: 0,
        potassium: 484,
        sodium: 4,
      },
      vitamins: { folate: 0.19, B6: 0.04, riboflavin: 0.04 },
      minerals: { manganese: 0.28, iron: 0.23, zinc: 0.1, potassium: 0.1 },
    },
    origin: ["Southeast Asia"],
    category: "seasonings",
    subCategory: "herb",
    culinaryApplications: {
      infusing: {
        name: "Infusing",
        method: "bruised and simmered",
        timing: "add early in cooking",
        applications: {
          soups: "thai tom yum",
          curries: "southeast asian",
          teas: "medicinal brewing",
        },
      },
      paste: {
        name: "Paste",
        method: "finely minced inner core",
        timing: "typically with other aromatics",
        applications: {
          curry_pastes: "with chilies and galangal",
          marinades: "with lime and garlic",
          rubs: "for grilled proteins",
        },
      },
    },
    storage: {
      temperature: "refrigerated",
      humidity: "moderate",
      container: "wrapped in damp paper towel",
      duration: "2-3 weeks fresh6 months frozen",
      notes: "Can be frozen whole or chopped",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  shallot: {
      description: "A small, teardrop-shaped allium (*Allium cepa var. aggregatum*) that grows in clusters similar to garlic. It offers a more delicate, sweeter, and less pungent flavor profile than standard onions, making it the classic choice for refined sauces, vinaigrettes, and raw applications.",
    name: "Shallot",
    elementalProperties: { Earth: 0.4, Fire: 0.3, Water: 0.2, Air: 0.1 },
    alchemicalProperties: { Spirit: 0.48, Essence: 0.52, Matter: 0.48, Substance: 0.40 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["virgo", "taurus"],
      elementalAffinity: {
        base: "Earth",
      },
    },
    qualities: ["delicate", "sweet", "aromatic"],
    nutritionalProfile: {
      serving_size: "1 tbsp chopped (10g)",
      calories: 7,
      macros: {
        protein: 0.3,
        carbs: 1.7,
        fat: 0,
        fiber: 0.3,
        saturatedFat: 0,
        sugar: 0.8,
        potassium: 33,
        sodium: 1,
      },
      vitamins: { B6: 0.03, folate: 0.01 },
      minerals: { manganese: 0.02, iron: 0.01 },
    },
    origin: ["Southeast Asia"],
    category: "seasonings",
    subCategory: "allium",
    culinaryApplications: {
      diced: {
        name: "Diced",
        method: "finely diced",
        timing: "brief cooking",
        applications: {
          vinaigrettes: "classic french",
          pan_sauces: "for proteins",
          garnishes: "raw or fried",
        },
      },
    },
    storage: {
      temperature: "cool, dry place",
      humidity: "low",
      container: "ventilated",
      duration: "1 month",
      notes: "Similar to onions",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  scallion: {
      description: "Also known as green onions (*Allium fistulosum*), these alliums are harvested before a bulb forms. They offer a dual flavor profile: the white bases provide a sharp, pungent onion bite, while the hollow green tops deliver a fresh, herbaceous flavor ideal for garnishing.",
    name: "Scallion",
    elementalProperties: { Air: 0.4, Water: 0.3, Earth: 0.2, Fire: 0.1 },
    alchemicalProperties: { Spirit: 0.38, Essence: 0.62, Matter: 0.22, Substance: 0.25 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Moon"],
      favorableZodiac: ["gemini", "cancer"],
      elementalAffinity: {
        base: "Air",
      },
    },
    qualities: ["fresh", "mild", "grassy"],
    nutritionalProfile: {
      serving_size: "1 medium (15g)",
      calories: 5,
      macros: {
        protein: 0.3,
        carbs: 1.1,
        fat: 0,
        fiber: 0.4,
        saturatedFat: 0,
        sugar: 0.4,
        potassium: 41,
        sodium: 2,
      },
      vitamins: { K: 0.26, folate: 0.02 },
      minerals: { iron: 0.01, manganese: 0.01 },
    },
    origin: ["Asia"],
    category: "seasonings",
    subCategory: "allium",
    culinaryApplications: {
      cooked: {
        name: "Cooked",
        method: "chopped or whole",
        timing: "brief cooking only",
        applications: {
          stir_fry: "added toward end",
          scallion_oil: "chinese condiment",
          pancakes: "chinese scallion pancakes",
        },
      },
    },
    storage: {
      temperature: "refrigerated",
      humidity: "high",
      container: "wrapped in damp paper towel",
      duration: "1-2 weeks",
      notes: "Can be regrown in water from roots",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},

  saffron: {
      description: "The world's most expensive spice, consisting of the dried crimson stigmas of the *Crocus sativus* flower. It imparts a brilliant golden-yellow hue and a highly complex, honey-like, floral, and slightly metallic or earthy flavor, making it the defining characteristic of classic dishes like paella and risotto alla milanese.",
    name: "Saffron",
    elementalProperties: { Fire: 0.7, Earth: 0.2, Air: 0.1, Water: 0 },
    alchemicalProperties: { Spirit: 0.90, Essence: 0.70, Matter: 0.08, Substance: 0.10 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Mars"],
      favorableZodiac: ["gemini", "libra"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Earth", planet: "Mars" },
          third: { element: "Air", planet: "Venus" },
        },
      },
    },
    qualities: ["aromatic", "warm", "floral"],
    nutritionalProfile: {
      serving_size: "1 tsp (0.7g)",
      calories: 2,
      macros: {
        protein: 0.1,
        carbs: 0.5,
        fat: 0,
        fiber: 0,
        saturatedFat: 0,
        sugar: 0,
        potassium: 12,
        sodium: 1,
      },
      vitamins: { B6: 0.01, riboflavin: 0.01 },
      minerals: { manganese: 0.14, iron: 0.04 },
    },
    origin: ["Iran"],
    category: "seasonings",
    subCategory: "spices",
    culinaryApplications: {
      infusing: {
        name: "Infusing",
        method: "crushed and simmered",
        timing: "add early in cooking",
        applications: {
          curries: "Indian and Middle Eastern",
          rice: "Persian and Indian",
          tea: "Turkish and Middle Eastern",
        },
      },
      paste: {
        name: "Paste",
        method: "finely ground",
        timing: "typically with other spices",
        applications: {
          curries: "Indian and Middle Eastern",
          rice: "Persian and Indian",
          tea: "Turkish and Middle Eastern",
        },
      },
    },
    storage: {
      temperature: "cool, dry place",
      humidity: "low",
      container: "airtight container",
      duration: "2-3 years",
      notes: "Keep away from light and heat",
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.4, sour: 0.1, bitter: 0.1, umami: 0.3, spicy: 0.1 }, aroma: { savory: 0.6, aromatic: 0.4 }, texture: { varied: 0.5 } },
      culinaryProfile: { flavorProfile: { primary: ["savory"], secondary: ["umami", "aromatic"], notes: "Balance salt, acid, and umami progressively throughout cooking." }, cookingMethods: ["season", "finish", "marinate"], cuisineAffinity: ["global"], preparationTips: ["Season in layers rather than all at once.", "Taste between additions."] },
      pairingRecommendations: { complementary: ["oil", "acid", "alliums", "herbs"], contrasting: ["sweeteners", "dairy"], toAvoid: [] }
},
};

// Fix the ingredient mappings to ensure they have all required properties
// ✅ Pattern MM-1: Type assertion for ZodiacSignType[] compatibility
export const aromatics: Record<string, IngredientMapping> =
  fixIngredientMappings(
    rawAromatics as Record<string, Partial<IngredientMapping>>,
  );
