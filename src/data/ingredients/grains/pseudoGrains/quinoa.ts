import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawQuinoa = {
  quinoa: {
    name: "Quinoa",
    elementalProperties: { Earth: 0.3, Water: 0.2, Air: 0.3, Fire: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["Mercury"],
      elementalAffinity: {
        base: "Earth",
        secondary: "Air",
      },
    },
    qualities: [
      "nutty",
      "fluffy",
      "versatile",
      "complete protein",
      "gluten-free",
    ],
    category: "grains",
    origin: ["South America", "Andean region", "Peru", "Bolivia", "Ecuador"],
    varieties: {
      rainbow: {
        appearance: "Mix of white, red, and black",
        texture: "Varied",
        flavor: "Balanced mix",
        characteristics: "Mix of all three types",
        uses: "Colorful presentations, all-purpose cooking",
      },
    },
    preparation: {
      fresh: {
        duration: "15-20 minutes",
        storage: "Refrigerate in sealed container for 3-5 days",
        tips: [
          "Rinse well to remove saponins (bitter coating)",
          "Toast before cooking for nuttier flavor",
          "Add salt after cooking to prevent toughening",
        ],
      },
      methods: [
        "boiled",
        "steamed",
        "toasted",
        "sprouted",
        "pressure cooked",
        "baked",
      ],
    },
    storage: {
      container: "Airtight container",
      duration: "Up to 2 years (dry), 3-5 days (cooked)",
      temperature: "Cool, dark place (dry), refrigerated (cooked)",
      notes: "Can be frozen for up to 8 months when completely cooled",
    },
    pairingRecommendations: {
      complementary: [
        "lemon",
        "lime",
        "herbs",
        "nuts",
        "dried fruits",
        "avocado",
        "cucumber",
        "bell pepper",
      ],
      contrasting: ["strong cheeses", "spicy chiles", "fermented foods"],
      toAvoid: [
        "overpowering sauces",
        "very wet preparations that might make it soggy",
      ],
    },
    nutritionalProfile: {
      serving_size: "1 cup cooked (185g)",
      calories: 222,
      macros: { protein: 8, carbs: 39, fat: 3.6, fiber: 5, saturatedFat: 0.4, sugar: 2, potassium: 318, sodium: 13 },
      vitamins: { folate: 0.19, B6: 0.11, thiamin: 0.13, riboflavin: 0.12, E: 0.08 },
      minerals: { manganese: 0.58, phosphorus: 0.28, magnesium: 0.28, iron: 0.15, zinc: 0.13, copper: 0.18 },
    },
  },
};

export const quinoa: Record<string, IngredientMapping> =
  fixIngredientMappings(rawQuinoa);
