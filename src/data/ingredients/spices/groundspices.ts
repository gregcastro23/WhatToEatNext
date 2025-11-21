import { CUISINE_TYPES } from "@/constants/cuisineTypes";
import type { IngredientMapping } from "@/data/ingredients/types";
import { fixIngredientMappings } from "@/utils/elementalUtils";

const rawGroundSpices: Record<string, Partial<IngredientMapping>> = {
  ground_cinnamon: {
    name: "Ground Cinnamon",
    elementalProperties: { Fire: 0.4, Earth: 0.3, Air: 0.2, Water: 0.1 },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius"],
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Sun" },
          second: { element: "Air", planet: "Jupiter" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
    },
    qualities: ["warming", "sweet", "pungent"],
    origin: ["Sri Lanka", "Indonesia", "China"],
    category: "spices",
    subCategory: "ground",
    varieties: {
      Ceylon: "true cinnamon, more delicate",
      Cassia: "stronger, more common",
      Saigon: "most intense flavor",
    },
    conversionRatio: {
      stick_to_ground: "1 stick = 1/2 tsp ground",
      fresh_to_dried: "not applicable",
    },
    affinities: ["baked goods", "coffee", "curry", "fruit", "chocolate"],
    cookingMethods: ["baking", "brewing", "spice blends"],
    storage: {
      temperature: "cool, dark place",
      duration: "6 months",
      container: "airtight, dark",
      notes: "Loses potency quickly when ground",
    },
    medicinalProperties: {
      actions: ["blood sugar regulation", "anti-inflammatory"],
      energetics: "warming",
      cautions: ["blood thinning in large amounts"],
    },
    culinary_traditions: {
      [CUISINE_TYPES.INDIAN]: {
        name: "dalchini",
        usage: ["garam masala", "chai", "biryanis", "desserts"],
        preparation: "ground or whole sticks",
        cultural_notes: "Essential in both sweet and savory dishes",
      },
    },
    sensoryProfile: {
      taste: ["sweet", "warm"],
      aroma: ["spicy", "woody"],
      texture: ["fine powder"],
      notes: "Characteristic cinnamon profile",
    },
    culinaryProfile: {
      flavorProfile: {
        primary: ["sweet", "warm"],
        secondary: ["spicy", "woody"],
        notes: "Warm, comforting spice",
      },
      cookingMethods: ["baking", "brewing", "spice blends"],
      cuisineAffinity: ["Global", "Middle-Eastern", "Indian"],
      preparationTips: [
        "Use in moderation",
        "Add early in cooking for baked goods",
      ],
    },
    season: ["year-round"],
    preparation: {
      methods: ["ground"],
      timing: "as needed",
      notes: "Store in cool, dark place",
    },
  },
};

// Fix the ingredient mappings to ensure they have all required properties
export const _groundSpices: Record<string, IngredientMapping> =
  fixIngredientMappings(rawGroundSpices);

// Export without underscore for compatibility
export const groundSpices = _groundSpices;
