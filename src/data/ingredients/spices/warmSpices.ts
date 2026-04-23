import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawWarmSpices = {
  cinnamon: {
      description: "A warm, sweet spice derived from the inner bark of trees (*Cinnamomum*). Cassia cinnamon is strong, spicy, and common in baking, while true \"Ceylon\" cinnamon is softer, more floral, and delicate; both provide a deep, aromatic warmth that enhances both sweet pastries and savory curries.",
    name: "Cinnamon",
    elementalProperties: { Fire: 0.7, Water: 0.0, Earth: 0.2, Air: 0.1 }, // ← Pattern GG-5: Added missing Water property
    astrologicalProfile: {
      planetaryRuler: "Sun",
      zodiacRuler: "leo",
      element: "Fire",
      energyType: "Restorative",
      seasonalPeak: {
        northern: [910, 1112, 12],
        southern: [34, 56, 78],
      },
    } as unknown,
    qualities: [
      "warming",
      "sweet",
      "pungent",
      "aromatic",
      "drying",
      "carminative",
    ],
    origin: ["Sri Lanka", "India", "Southeast Asia"],
    category: "spices",
    subcategory: "warm spice",
    affinities: [
      "apple",
      "pear",
      "citrus",
      "chocolate",
      "coffee",
      "honey",
      "nuts",
      "cardamom",
      "ginger",
    ],
    season: "winter",
    nutritionalProfile: {
      serving_size: "1 tsp ground",
      calories: 6,
      macros: {
        protein: 0.1,
        carbs: 2.1,
        fat: 0.1,
        fiber: 1.4,
        sugar: 0.1,
        sodium: 1,
      },
      vitamins: {
        K: 0.01,
        B6: 0.01,
        E: 0.01,
      },
      minerals: {
        calcium: 0.26,
        manganese: 0.22,
        iron: 0.08,
        potassium: 0.01,
        magnesium: 0.02,
      },
      antioxidants: {
        cinnamaldehyde: 0.65,
        eugenol: 0.42,
        cinnamyl_acetate: 0.38,
        coumarin: 0.15,
      },
      benefits: [
        "blood sugar regulation",
        "anti-inflammatory",
        "antimicrobial",
      ],
      source: "USDA FoodData Central",
    },
    // ... rest of cinnamon properties
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.3, umami: 0.0, spicy: 0.4 }, aroma: { warm: 0.8, earthy: 0.5, spicy: 0.7 }, texture: { powdery: 0.6, dry: 0.8 } },
      culinaryProfile: { flavorProfile: { primary: ["warm"], secondary: ["earthy", "aromatic"], notes: "Bloom in fat or dry-toast briefly to activate aromatics; avoid scorching." }, cookingMethods: ["bloom", "toast", "grind", "infuse"], cuisineAffinity: ["Indian", "Middle-Eastern", "North-African", "Mexican"], preparationTips: ["Grind whole spice as close to use as possible.", "Store away from heat and light."] },
      pairingRecommendations: { complementary: ["onion", "garlic", "oil", "salt", "complementary spices"], contrasting: ["acid", "dairy"], toAvoid: [] },
      storage: { pantry: "Airtight, dark container, 6-12 months whole; 3-6 months ground.", notes: "Test potency by smelling — if faint, replace." }
},
  // ... other warm spices
};

// Fix the ingredient mappings to ensure they have all required properties
export const warmSpices: Record<string, IngredientMapping> =
  fixIngredientMappings(rawWarmSpices as any);

// Create a collection of all warm spices
export const _allWarmSpices = Object.values(warmSpices);

export default warmSpices;
