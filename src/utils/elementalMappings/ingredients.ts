import type { IngredientMapping } from "@/data/ingredients/types";
import type { ElementalProperties } from "@/types/alchemy";
import { calculateElementalCompatibility } from "@/utils/elemental/core";

// Helper function to standardize ingredient mappings
function createIngredientMapping(
  id: string,
  properties: Partial<IngredientMapping>,
): IngredientMapping {
  return {
    name: id, // Add the required name property
    elementalProperties: properties.elementalProperties || {
      Earth: 0.25,
      Water: 0.25,
      Fire: 0.25,
      Air: 0.25,
    },
    ...properties,
  } as IngredientMapping;
}

export const ingredientMappings = {
  // Aromatics,
  ginger: createIngredientMapping("ginger", {
    elementalProperties: {
      Fire: 0.7,
      Earth: 0.2,
      Air: 0.1,
      Water: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Sun"],
      favorableZodiac: ["aries", "leo", "sagittarius"], // Convert to lowercase
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Air", planet: "Sun" },
          third: { element: "Earth", planet: "Saturn" },
        },
      },
    },
    season: ["all"],
  }),

  garlic: createIngredientMapping("garlic", {
    elementalProperties: {
      Fire: 0.6,
      Earth: 0.3,
      Air: 0.1,
      Water: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Pluto"],
      favorableZodiac: ["scorpio", "capricorn"], // Convert to lowercase
      elementalAffinity: {
        base: "Fire",
        decanModifiers: {
          first: { element: "Fire", planet: "Mars" },
          second: { element: "Earth", planet: "Pluto" },
          third: { element: "Air", planet: "Uranus" },
        },
      },
    },
    season: ["all"],
  }),

  // Spices,
  cinnamon: createIngredientMapping("cinnamon", {
    elementalProperties: {
      Fire: 0.8,
      Air: 0.2,
      Earth: 0,
      Water: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Sun", "Jupiter"],
      favorableZodiac: ["leo", "sagittarius"], // Convert to lowercase
      elementalAffinity: "Fire",
    },
    season: ["fall", "winter"],
  }),

  cardamom: createIngredientMapping("cardamom", {
    elementalProperties: {
      Air: 0.6,
      Fire: 0.3,
      Earth: 0.1,
      Water: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["gemini", "libra"], // Convert to lowercase
      elementalAffinity: "Air",
    },
    season: ["fall", "winter"],
  }),

  clove: createIngredientMapping("clove", {
    // Add name
    elementalProperties: {
      Fire: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Water: 0,
    },
    season: ["fall", "winter"],
  }),

  // Cooling Ingredients,
  mint: createIngredientMapping("mint", {
    elementalProperties: {
      Water: 0.6,
      Air: 0.4,
      Fire: 0,
      Earth: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Neptune"],
      favorableZodiac: ["cancer", "pisces"], // Convert to lowercase
      elementalAffinity: "Water",
    },
    season: ["spring", "summer"],
  }),

  cucumber: createIngredientMapping("cucumber", {
    // Add name
    elementalProperties: {
      Water: 0.8,
      Air: 0.2,
      Fire: 0,
      Earth: 0,
    },
    season: ["summer"],
  }),

  // Earthy Ingredients,
  mushroom: createIngredientMapping("mushroom", {
    elementalProperties: {
      Earth: 0.7,
      Water: 0.3,
      Fire: 0,
      Air: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Saturn", "Pluto"],
      favorableZodiac: ["capricorn", "scorpio"], // Convert to lowercase
      elementalAffinity: "Earth",
    },
    season: ["fall", "spring"],
  }),

  seaweed: createIngredientMapping("seaweed", {
    // Add name
    elementalProperties: {
      Water: 0.6,
      Earth: 0.4,
      Fire: 0,
      Air: 0,
    },
    season: ["all"],
  }),

  // Proteins,
  fish: createIngredientMapping("fish", {
    // Add name
    elementalProperties: {
      Water: 0.7,
      Air: 0.2,
      Earth: 0.1,
      Fire: 0,
    },
    season: ["all"],
  }),

  beef: createIngredientMapping("beef", {
    elementalProperties: {
      Earth: 0.5,
      Fire: 0.5,
      Water: 0,
      Air: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mars", "Saturn"],
      favorableZodiac: ["capricorn", "taurus"], // Convert to lowercase
      elementalAffinity: "Earth",
    },
    season: ["all"],
  }),

  chicken: createIngredientMapping("chicken", {
    elementalProperties: {
      Air: 0.4,
      Fire: 0.3,
      Earth: 0.3,
      Water: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Mercury", "Venus"],
      favorableZodiac: ["virgo", "taurus"], // Convert to lowercase
      elementalAffinity: "Air",
    },
    season: ["all"],
  }),

  // Dairy,
  dairy: createIngredientMapping("dairy", {
    elementalProperties: {
      Water: 0.5,
      Earth: 0.5,
      Fire: 0,
      Air: 0,
    },
    season: ["all"],
  }),

  // Vegetables
  "bitter greens": createIngredientMapping("bitter greens", {
    elementalProperties: {
      Earth: 0.4,
      Air: 0.4,
      Water: 0.2,
      Fire: 0,
    },
    season: ["spring", "fall"],
  }),

  turmeric: createIngredientMapping("turmeric", {
    elementalProperties: {
      Fire: 0.6,
      Earth: 0.4,
      Water: 0,
      Air: 0,
    },
    season: ["all"],
  }),

  chili: createIngredientMapping("chili", {
    elementalProperties: {
      Fire: 0.9,
      Air: 0.1,
      Water: 0,
      Earth: 0,
    },
    season: ["summer", "fall"],
  }),

  basil: createIngredientMapping("basil", {
    elementalProperties: {
      Air: 0.5,
      Fire: 0.3,
      Earth: 0.2,
      Water: 0,
    },
    season: ["summer"],
  }),

  sage: createIngredientMapping("sage", {
    elementalProperties: {
      Air: 0.4,
      Earth: 0.4,
      Fire: 0.2,
      Water: 0,
    },
    season: ["autumn", "winter"],
  }),

  rosemary: createIngredientMapping("rosemary", {
    elementalProperties: {
      Fire: 0.4,
      Air: 0.3,
      Earth: 0.3,
      Water: 0,
    },
    season: ["all"],
  }),

  thyme: createIngredientMapping("thyme", {
    elementalProperties: {
      Air: 0.5,
      Earth: 0.3,
      Fire: 0.2,
      Water: 0,
    },
    season: ["all"],
  }),

  // Grains,
  rice: createIngredientMapping("rice", {
    elementalProperties: {
      Earth: 0.6,
      Water: 0.3,
      Air: 0.1,
      Fire: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "virgo"], // Changed to lowercase
      elementalAffinity: "Earth",
    },
    season: ["all"],
  }),

  // Fruits,
  apple: createIngredientMapping("apple", {
    elementalProperties: {
      Earth: 0.5,
      Water: 0.3,
      Air: 0.2,
      Fire: 0,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Saturn"],
      favorableZodiac: ["taurus", "capricorn"], // Changed to lowercase
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Venus" },
          second: { element: "Water", planet: "Saturn" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
    },
    season: ["fall"],
  }),

  banana: createIngredientMapping("banana", {
    elementalProperties: {
      Earth: 0.4,
      Water: 0.3,
      Fire: 0.2,
      Air: 0.1,
    },
    astrologicalProfile: {
      rulingPlanets: ["Venus", "Moon"],
      favorableZodiac: ["taurus", "cancer"], // Changed to lowercase
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Venus" },
          second: { element: "Water", planet: "Moon" },
          third: { element: "Fire", planet: "Sun" },
        },
      },
    },
    season: ["year-round"],
  }),

  // Example ingredient with lunar phase modifiers,
  brown_rice: createIngredientMapping("brown_rice", {
    elementalProperties: {
      Earth: 0.5,
      Water: 0.3,
      Air: 0.2,
      Fire: 0, // Add missing required property
    },
    astrologicalProfile: {
      rulingPlanets: ["Moon", "Saturn"],
      favorableZodiac: ["cancer", "capricorn"], // Convert to lowercase
      elementalAffinity: {
        base: "Earth",
        decanModifiers: {
          first: { element: "Earth", planet: "Moon" },
          second: { element: "Water", planet: "Saturn" },
          third: { element: "Air", planet: "Mercury" },
        },
      },
      _lunarPhaseModifiers: {
        newMoon: {
          elementalBoost: { Earth: 0.1, Water: 0.1 },
          preparationTips: ["Best for soaking and sprouting"],
        },
        _fullMoon: {
          elementalBoost: { Water: 0.2 },
          preparationTips: ["Ideal for creamy rice dishes"],
        },
      },
    } as any,
    season: ["all"],
  }),
} as const;

// Helper function to get ingredients by dominant element
export const _getIngredientsByElement = (element: keyof ElementalProperties) =>
  Object.entries(ingredientMappings)
    .filter(([_, mapping]) => {
      const elements = Object.entries(mapping.elementalProperties);
      const dominantElement = elements.reduce((max, curr) =>
        curr[1] > max[1] ? curr : max,
      );
      return dominantElement[0] === element;
    })
    .map(([name]) => name);

// Helper function to get seasonal ingredients
export const _getSeasonalIngredients = (season: string) =>
  Object.entries(ingredientMappings)
    .filter(([_, mapping]) => (mapping.season as string[]).includes(season))
    .map(([name]) => name);

// Helper function to get complementary ingredients
export const _getComplementaryIngredients = (
  ingredient: keyof typeof ingredientMappings,
) => {
  const baseElement = Object.entries(
    ingredientMappings[ingredient].elementalProperties,
  ).reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];

  return Object.entries(ingredientMappings)
    .filter(([name, mapping]) => {
      if (name === ingredient) return false;
      const complementaryElement = Object.entries(
        mapping.elementalProperties,
      ).reduce((max, curr) =>
        curr[1] > max[1] ? curr : max,
      )[0] as keyof ElementalProperties;
      // Use project-approved compatibility principle (no true opposites)
      const score = calculateElementalCompatibility(
        baseElement as "Fire" | "Water" | "Earth" | "Air",
        complementaryElement as "Fire" | "Water" | "Earth" | "Air",
      );
      return score >= 0.7;
    })
    .map(([name]) => name);
};

// Helper function to determine if elements are complementary
// Deprecated: Oppositional/complementary logic is replaced by compatibility model per workspace rules
