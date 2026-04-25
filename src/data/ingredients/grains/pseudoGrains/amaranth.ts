import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawAmaranth = {
  amaranth: {
      description: "An ancient, tiny pseudocereal seed (*Amaranthus*) that was a staple of the Aztec diet. It has a peppery, deeply earthy flavor and never entirely softens when boiled, retaining a gelatinous, caviar-like crunch that thickens porridges and soups.",
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
    category: "grain",
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
      sensoryProfile: { taste: { sweet: 0.1, salty: 0.0, sour: 0.0, bitter: 0.0, umami: 0.1, spicy: 0.0 }, aroma: { earthy: 0.6, nutty: 0.5, roasted: 0.2 }, texture: { chewy: 0.5, firm: 0.3, soft: 0.2 } },
      culinaryProfile: { flavorProfile: { primary: ["neutral"], secondary: ["starchy", "nutty"], notes: "Absorbs surrounding flavors; gains complexity via toasting." }, cookingMethods: ["boil", "steam", "bake", "pilaf", "risotto"], cuisineAffinity: ["Asian", "Mediterranean", "Middle-Eastern", "Latin"], preparationTips: ["Rinse until water runs clear to remove excess starch.", "Toast briefly in fat before adding liquid to deepen flavor."] }
},
};

export const amaranth: Record<string, IngredientMapping> =
  fixIngredientMappings(rawAmaranth);
