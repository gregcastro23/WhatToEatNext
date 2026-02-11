import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawBuckwheat = {
  buckwheat: {
    name: "Buckwheat",
    elementalProperties: { Earth: 0.4, Water: 0.1, Air: 0.2, Fire: 0.3 },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Mars"],
      elementalAffinity: {
        base: "Earth",
        secondary: "Fire",
      },
    },
    qualities: ["earthy", "robust", "gluten-free", "hearty", "nutty"],
    category: "grains",
    origin: ["Central Asia", "Eastern Europe", "Russia"],
    varieties: {
      flour: {
        appearance: "Gray-purple fine powder",
        texture: "Dense in baked goods",
        flavor: "Distinctive earthy flavor",
        uses: "Blinis, soba noodles, pancakes, bread",
      },
    },
    preparation: {
      fresh: {
        duration: "15-20 minutes (raw), 10-15 minutes (roasted)",
        storage: "Refrigerate in sealed container for 2-3 days",
        tips: [
          "Rinse before cooking",
          "Toast raw buckwheat for nuttier flavor",
          "Use 1: 2 buckwheat to water ratio",
        ],
      },
      methods: ["boiled", "toasted", "ground into flour", "sprouted"],
    },
    storage: {
      container: "Airtight container",
      duration: "Up to 2 months (raw), 3-4 months (roasted), 2-3 days (cooked)",
      temperature: "Cool, dark place (dry), refrigerated (cooked)",
      notes:
        "Raw buckwheat has higher oil content and can spoil faster than roasted",
    },
    pairingRecommendations: {
      complementary: [
        "mushrooms",
        "onions",
        "herbs",
        "butter",
        "eggs",
        "cabbage",
      ],
      contrasting: ["light fruits", "yogurt", "honey"],
      toAvoid: ["subtle flavors that would be overpowered"],
    },
    nutritionalProfile: {
      serving_size: "1 cup cooked (168g)",
      calories: 155,
      macros: {
        protein: 5.7,
        carbs: 34,
        fat: 1,
        fiber: 4.5,
        saturatedFat: 0.2,
        sugar: 1.5,
        potassium: 148,
        sodium: 7,
      },
      vitamins: { niacin: 0.08, B6: 0.07 },
      minerals: {
        manganese: 0.34,
        magnesium: 0.21,
        phosphorus: 0.09,
        copper: 0.13,
        iron: 0.07,
      },
    },
  },
};

export const buckwheat: Record<string, IngredientMapping> =
  fixIngredientMappings(rawBuckwheat);
