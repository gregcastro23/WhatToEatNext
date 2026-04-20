import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawFlaxseed = {
  flaxseed: {
      description: "A small, flat, teardrop-shaped seed (*Linum usitatissimum*) known for its high concentration of alpha-linolenic acid (an omega-3) and mucilaginous fiber. When ground and mixed with water, it forms a thick, gel-like paste that is heavily utilized as a vegan egg substitute in baking.",
    name: "Flaxseed",
    elementalProperties: { Water: 0.3, Earth: 0.3, Air: 0.3, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Venus"],
      elementalAffinity: {
        base: "Water",
        secondary: "Air",
      },
    },
    qualities: ["gelatinous", "omega-rich", "nutty", "gluten-free", "binding"],
    category: "grains",
    origin: ["Middle East", "Mediterranean", "widely cultivated worldwide"],
    varieties: {
      golden: {
        appearance: "Small yellow seeds",
        texture: "Similar to brown",
        flavor: "Milder, lighter flavor than brown",
        uses: "Visually appealing in lighter dishes, often more expensive",
      },
      meal: {
        appearance: "Ground powder",
        texture: "Fine to coarse depending on grind",
        flavor: "Nutty, can become rancid quickly",
        uses: "Baking, smoothies, egg substitute",
      },
    },
    preparation: {
      fresh: {
        duration: "No cooking required, ground for best nutrition",
        storage: "Refrigerate ground flaxseed for up to 2 weeks",
        tips: [
          "Grind whole seeds for best nutrition absorption",
          "Mix with water (1: 3 ratio) for egg substitute",
          "Add to dishes after cooking to preserve nutrients",
        ],
      },
      methods: [
        "ground",
        "soaked",
        "incorporated into batter",
        "sprinkled whole",
      ],
    },
    storage: {
      container: "Airtight container",
      duration: "Up to 1 year (whole seeds), 1-2 weeks (ground)",
      temperature: "Cool, dark place (whole), refrigerated or frozen (ground)",
      notes: "High oil content means ground flaxseed spoils quickly",
    },
    pairingRecommendations: {
      complementary: [
        "oats",
        "yogurt",
        "smoothies",
        "breads",
        "muffins",
        "granola",
      ],
      contrasting: ["fruits", "honey", "maple syrup"],
      toAvoid: ["dishes requiring long cooking that might damage omega oils"],
    },
    nutritionalProfile: {
      serving_size: "1 tbsp ground (7g)",
      calories: 37,
      macros: {
        protein: 1.3,
        carbs: 2,
        fat: 3,
        fiber: 1.9,
        saturatedFat: 0.3,
        sugar: 0.1,
        potassium: 57,
        sodium: 2,
      },
      vitamins: { thiamin: 0.11, B6: 0.03 },
      minerals: {
        manganese: 0.09,
        magnesium: 0.07,
        phosphorus: 0.05,
        copper: 0.04,
        selenium: 0.04,
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] }
},
};

export const flaxseed: Record<string, IngredientMapping> =
  fixIngredientMappings(rawFlaxseed);
