import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawAmaranth = {
  amaranth: {
    name: "Amaranth",
    elementalProperties: { Earth: 0.3, Fire: 0.3, Air: 0.2, Water: 0.2 },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Venus"],
      elementalAffinity: {
        base: "Earth",
        secondary: "Fire",
      },
    },
    qualities: ["nutty", "earthy", "gelatinous", "gluten-free", "protein-rich"],
    category: "grains",
    origin: ["Central America", "Mexico", "South America"],
    varieties: {
      regular: {
        appearance: "Tiny cream-colored seeds",
        texture: "Sticky when cooked, gelatinous",
        flavor: "Earthy, nutty, slightly peppery",
        uses: "Porridges, binding agent in dishes, flour for baking",
      },
    },
    preparation: {
      fresh: {
        duration: "20-25 minutes",
        storage: "Refrigerate in sealed container for 2-3 days",
        tips: [
          "Use 1:3 amaranth to liquid ratio",
          "Simmer until liquid is absorbed",
          "Consider mixing with other grains as it can be sticky on its own",
        ],
      },
      methods: [
        "boiled",
        "simmered",
        "popped (dry in pan)",
        "ground into flour",
      ],
    },
    storage: {
      container: "Airtight container",
      duration: "Up to 6 months (dry), 2-3 days (cooked)",
      temperature: "Cool, dark place (dry), refrigerated (cooked)",
      notes: "High oil content makes it spoil faster than other grains",
    },
    pairingRecommendations: {
      complementary: [
        "cinnamon",
        "honey",
        "fruits",
        "mild cheeses",
        "vegetables",
      ],
      contrasting: ["herbs", "light citrus"],
      toAvoid: ["strong acidic ingredients that might prevent proper cooking"],
    },
    nutritionalProfile: {
      serving_size: "1 cup cooked (246g)",
      calories: 251,
      macros: {
        protein: 9.4,
        carbs: 46,
        fat: 3.9,
        fiber: 5.2,
        saturatedFat: 1,
        sugar: 0,
        potassium: 332,
        sodium: 15,
      },
      vitamins: { B6: 0.14, folate: 0.14, riboflavin: 0.02, niacin: 0.04 },
      minerals: {
        manganese: 1.05,
        iron: 0.29,
        phosphorus: 0.36,
        magnesium: 0.38,
        selenium: 0.19,
        copper: 0.18,
        zinc: 0.14,
      },
    },
  },
};

export const amaranth: Record<string, IngredientMapping> =
  fixIngredientMappings(rawAmaranth);
