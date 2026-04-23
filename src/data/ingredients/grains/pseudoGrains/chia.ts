import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawChia: Record<string, Partial<IngredientMapping>> = {
  chia: {
      description: "Chia Seeds is a grain-based ingredient that contributes starch, structure, and sustained body to dishes. Hydration ratio, particle size, and cooking time strongly affect final texture, from creamy and tender to chewy and crisp. Store dry in an airtight container and rotate stock to avoid stale or rancid flavors.",
    name: "Chia Seeds",
    elementalProperties: { Water: 0.4, Earth: 0.3, Air: 0.2, Fire: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Neptune", "Moon"],
      elementalAffinity: {
        base: "Water",
        secondary: "Earth",
      },
    },
    qualities: [
      "gelatinous",
      "hydrophilic",
      "versatile",
      "gluten-free",
      "omega-rich",
    ],
    category: "grains",
    origin: ["Central America", "Mexico", "Guatemala"],
    varieties: {},
    preparation: {
      fresh: {
        duration: "No cooking required, soak 10-20 minutes for gel",
        storage: "Refrigerate prepared chia for 5-7 days",
        tips: [
          "Use 1:6 chia to liquid ratio for gel",
          "Stir after adding to liquid to prevent clumping",
          "Can be used directly in baking without soaking",
        ],
      },
      methods: [
        "soaked",
        "ground",
        "raw sprinkled",
        "incorporated into batter",
      ],
    },
    storage: {
      container: "Airtight container",
      duration: "Up to 2 years (dry), 5-7 days (prepared)",
      temperature: "Cool, dark place (dry), refrigerated (prepared)",
      notes: "High oil content, but surprisingly shelf-stable when kept dry",
    },
    pairingRecommendations: {
      complementary: [
        "fruits",
        "yogurt",
        "oats",
        "honey",
        "cinnamon",
        "almond milk",
        "coconut",
      ],
      contrasting: ["citrus", "spices", "chocolate"],
      toAvoid: ["high-acid marinades that might break down the gel structure"],
    },
    nutritionalProfile: {
      serving_size: "2 tbsp (28g)",
      calories: 138,
      macros: {
        protein: 4.7,
        carbs: 12,
        fat: 8.7,
        fiber: 9.8,
        saturatedFat: 0.9,
        sugar: 0,
        potassium: 115,
        sodium: 5,
      },
      vitamins: { thiamin: 0.11, niacin: 0.16 },
      minerals: {
        manganese: 0.42,
        phosphorus: 0.27,
        calcium: 0.14,
        iron: 0.12,
        magnesium: 0.23,
        zinc: 0.09,
        copper: 0.03,
      },
    },
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] }
},
};

export const chia: Record<string, IngredientMapping> =
  fixIngredientMappings(rawChia);
