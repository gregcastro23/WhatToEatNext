import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawFlaxseed = {
  flaxseed: {
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
  },
};

export const flaxseed: Record<string, IngredientMapping> =
  fixIngredientMappings(rawFlaxseed);
