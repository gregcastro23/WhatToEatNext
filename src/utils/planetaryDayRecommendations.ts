/**
 * Planetary Day Recommendations
 * Provides day-specific recommendations based on planetary rulers and astrological state
 *
 * @file src/utils/planetaryDayRecommendations.ts
 * @created 2026-01-11 (Phase 3)
 */

import type { DayOfWeek, MealType } from "@/types/menuPlanner";
import type { ElementalProperties } from "@/types/recipe";

/**
 * Element type for planetary characteristics
 */
export type PlanetaryElement = "Fire" | "Water" | "Earth" | "Air";

/**
 * Energy type for planetary characteristics
 */
export type PlanetaryEnergy = "Cardinal" | "Fixed" | "Mutable";

/**
 * Nutritional emphasis for meal planning
 */
export type NutritionalEmphasis = "protein" | "carbs" | "fats" | "balanced";

/**
 * Planetary day characteristics for meal recommendations
 */
export interface PlanetaryDayCharacteristics {
  planet: string;
  element: PlanetaryElement;
  energy: PlanetaryEnergy;
  recommendedFoods: string[];
  recommendedCuisines: string[];
  cookingMethods: string[];
  flavorProfiles: Record<string, number>;
  nutritionalEmphasis: NutritionalEmphasis;
  mealTimingAdvice: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
  };
  elementalPreferences: ElementalProperties;
}

/**
 * Planetary day ruler mapping
 * Each day of the week is ruled by a specific planet
 */
export const PLANETARY_DAY_RULERS: Record<
  DayOfWeek,
  PlanetaryDayCharacteristics
> = {
  0: {
    // Sunday - Sun
    planet: "Sun",
    element: "Fire",
    energy: "Cardinal",
    recommendedFoods: [
      "citrus fruits",
      "honey",
      "saffron",
      "turmeric",
      "gold-colored foods",
      "sunflower seeds",
      "oranges",
      "corn",
      "wheat",
    ],
    recommendedCuisines: [
      "Mediterranean",
      "Middle-Eastern",
      "Greek",
      "Spanish",
    ],
    cookingMethods: [
      "grilling",
      "roasting",
      "baking",
      "broiling",
      "solar cooking",
    ],
    flavorProfiles: {
      warm: 0.8,
      bright: 0.9,
      energizing: 0.9,
      bold: 0.7,
      golden: 0.8,
    },
    nutritionalEmphasis: "balanced",
    mealTimingAdvice: {
      breakfast:
        "Energizing, vitality-boosting - start the day with brightness",
      lunch: "Peak solar energy - main meal of the day, celebratory",
      dinner: "Lighter but still warm - maintain the sun's glow",
      snack: "Bright, uplifting - citrus or honey-based treats",
    },
    elementalPreferences: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.2,
    },
  },
  1: {
    // Monday - Moon
    planet: "Moon",
    element: "Water",
    energy: "Cardinal",
    recommendedFoods: [
      "dairy products",
      "melons",
      "cucumbers",
      "white foods",
      "rice",
      "potatoes",
      "coconut",
      "cabbage",
      "turnips",
    ],
    recommendedCuisines: [
      "Comfort food",
      "Home cooking",
      "Traditional",
      "Asian",
    ],
    cookingMethods: [
      "steaming",
      "poaching",
      "simmering",
      "slow-cooking",
      "boiling",
    ],
    flavorProfiles: {
      comforting: 0.9,
      nourishing: 0.9,
      fluid: 0.8,
      gentle: 0.8,
      soothing: 0.9,
    },
    nutritionalEmphasis: "balanced",
    mealTimingAdvice: {
      breakfast: "Gentle, nourishing - start with soft, creamy foods",
      lunch: "Comforting, familiar - home-cooked feel",
      dinner: "Soothing, emotional connection - family favorites",
      snack: "Soft, creamy - dairy or fruit-based",
    },
    elementalPreferences: {
      Fire: 0.1,
      Water: 0.5,
      Earth: 0.2,
      Air: 0.2,
    },
  },
  2: {
    // Tuesday - Mars
    planet: "Mars",
    element: "Fire",
    energy: "Cardinal",
    recommendedFoods: [
      "red meat",
      "chili peppers",
      "garlic",
      "ginger",
      "onions",
      "radishes",
      "horseradish",
      "mustard",
      "cayenne",
    ],
    recommendedCuisines: ["Mexican", "Thai", "Korean", "Indian", "Szechuan"],
    cookingMethods: [
      "grilling",
      "searing",
      "stir-frying",
      "blackening",
      "high-heat cooking",
    ],
    flavorProfiles: {
      spicy: 0.9,
      bold: 0.9,
      energizing: 0.8,
      assertive: 0.9,
      hot: 0.8,
    },
    nutritionalEmphasis: "protein",
    mealTimingAdvice: {
      breakfast: "Protein-rich, energizing - power up for action",
      lunch: "Bold flavors, high energy - fuel for productivity",
      dinner: "Spicy, satisfying - celebrate the day's conquests",
      snack: "Quick energy, stimulating - spiced nuts or jerky",
    },
    elementalPreferences: {
      Fire: 0.5,
      Water: 0.1,
      Earth: 0.2,
      Air: 0.2,
    },
  },
  3: {
    // Wednesday - Mercury
    planet: "Mercury",
    element: "Air",
    energy: "Mutable",
    recommendedFoods: [
      "nuts",
      "seeds",
      "herbs",
      "varied vegetables",
      "carrots",
      "celery",
      "fennel",
      "dill",
      "mixed greens",
    ],
    recommendedCuisines: [
      "Fusion",
      "Asian fusion",
      "Modern",
      "Eclectic",
      "Small plates",
    ],
    cookingMethods: [
      "quick-cooking",
      "varied techniques",
      "multi-method",
      "assembly",
      "raw preparations",
    ],
    flavorProfiles: {
      complex: 0.9,
      varied: 0.9,
      stimulating: 0.8,
      interesting: 0.9,
      intellectual: 0.8,
    },
    nutritionalEmphasis: "balanced",
    mealTimingAdvice: {
      breakfast: "Complex, brain-boosting - variety is key",
      lunch: "Varied, interesting - keep the mind engaged",
      dinner: "Intellectual, conversational - tapas or small plates",
      snack: "Crunchy, stimulating - nuts, seeds, or raw vegetables",
    },
    elementalPreferences: {
      Fire: 0.2,
      Water: 0.2,
      Earth: 0.2,
      Air: 0.4,
    },
  },
  4: {
    // Thursday - Jupiter
    planet: "Jupiter",
    element: "Fire",
    energy: "Mutable",
    recommendedFoods: [
      "game meats",
      "rich sauces",
      "purple foods",
      "abundant portions",
      "figs",
      "dates",
      "grapes",
      "eggplant",
      "plums",
    ],
    recommendedCuisines: [
      "French",
      "Indian",
      "Celebratory",
      "Mediterranean",
      "Thanksgiving-style",
    ],
    cookingMethods: [
      "slow-roasting",
      "braising",
      "multi-course",
      "elaborate preparations",
      "feasting",
    ],
    flavorProfiles: {
      rich: 0.9,
      abundant: 0.9,
      expansive: 0.8,
      generous: 0.9,
      luxurious: 0.8,
    },
    nutritionalEmphasis: "balanced",
    mealTimingAdvice: {
      breakfast: "Abundant, generous - don't hold back",
      lunch: "Large, celebratory - main event of the day",
      dinner: "Feast-like, social - gather friends and family",
      snack: "Indulgent, generous - rich treats",
    },
    elementalPreferences: {
      Fire: 0.4,
      Water: 0.2,
      Earth: 0.3,
      Air: 0.1,
    },
  },
  5: {
    // Friday - Venus
    planet: "Venus",
    element: "Earth",
    energy: "Fixed",
    recommendedFoods: [
      "sweets",
      "chocolate",
      "fruits",
      "beautiful presentations",
      "strawberries",
      "cherries",
      "roses",
      "vanilla",
      "cinnamon",
    ],
    recommendedCuisines: [
      "French",
      "Italian",
      "Dessert-focused",
      "Romantic",
      "Aesthetic",
    ],
    cookingMethods: [
      "baking",
      "artistic plating",
      "gentle techniques",
      "pastry work",
      "beautiful presentations",
    ],
    flavorProfiles: {
      sweet: 0.9,
      beautiful: 0.9,
      sensual: 0.9,
      romantic: 0.8,
      indulgent: 0.8,
    },
    nutritionalEmphasis: "balanced",
    mealTimingAdvice: {
      breakfast: "Beautiful, indulgent - start with something lovely",
      lunch: "Aesthetically pleasing - presentation matters",
      dinner: "Romantic, sensual - perfect for date night",
      snack: "Sweet, luxurious - chocolate or fruit desserts",
    },
    elementalPreferences: {
      Fire: 0.2,
      Water: 0.3,
      Earth: 0.4,
      Air: 0.1,
    },
  },
  6: {
    // Saturday - Saturn
    planet: "Saturn",
    element: "Earth",
    energy: "Cardinal",
    recommendedFoods: [
      "root vegetables",
      "grains",
      "traditional foods",
      "preserved items",
      "beets",
      "parsnips",
      "rutabaga",
      "barley",
      "rye",
    ],
    recommendedCuisines: [
      "Traditional",
      "Rustic",
      "Time-tested",
      "Eastern European",
      "Preservation-focused",
    ],
    cookingMethods: [
      "slow-cooking",
      "traditional methods",
      "preservation",
      "braising",
      "stewing",
    ],
    flavorProfiles: {
      grounding: 0.9,
      traditional: 0.9,
      substantial: 0.8,
      earthy: 0.9,
      structured: 0.8,
    },
    nutritionalEmphasis: "carbs",
    mealTimingAdvice: {
      breakfast: "Grounding, traditional - stick to classics",
      lunch: "Structured, substantial - build strength",
      dinner: "Comfort, time-tested - grandma's recipes",
      snack: "Wholesome, satisfying - whole grains or root vegetables",
    },
    elementalPreferences: {
      Fire: 0.1,
      Water: 0.2,
      Earth: 0.5,
      Air: 0.2,
    },
  },
};

/**
 * Get planetary day characteristics for a specific day of the week
 *
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @returns Planetary characteristics for the day
 */
export function getPlanetaryDayCharacteristics(
  dayOfWeek: DayOfWeek,
): PlanetaryDayCharacteristics {
  return PLANETARY_DAY_RULERS[dayOfWeek];
}

/**
 * Get meal type specific guidance
 *
 * @param mealType - Type of meal
 * @returns Meal-specific characteristics
 */
export function getMealTypeGuidance(mealType: MealType): {
  energyPattern: string;
  elementalFocus: string;
  portionGuidance: string;
  timingNotes: string;
} {
  const guidance = {
    breakfast: {
      energyPattern: "Cardinal (initiating) - Start fresh",
      elementalFocus: "Fire & Air (lighter, energizing elements)",
      portionGuidance: "Light to moderate - don't overload",
      timingNotes: "Within 2 hours of waking for optimal energy",
    },
    lunch: {
      energyPattern: "Fixed (sustaining) - Maintain momentum",
      elementalFocus: "Balanced elements - all four in harmony",
      portionGuidance: "Moderate to large - sustain afternoon",
      timingNotes: "Midday when digestive fire is strongest",
    },
    dinner: {
      energyPattern: "Mutable (transforming) - Wind down and digest",
      elementalFocus: "Earth & Water (heavier, grounding elements)",
      portionGuidance: "Moderate - allow time for digestion",
      timingNotes: "At least 3 hours before bed for proper digestion",
    },
    snack: {
      energyPattern: "Flexible - Fill nutritional gaps",
      elementalFocus: "Based on daily balance needs",
      portionGuidance: "Small - bridge between meals",
      timingNotes: "When energy dips or hunger strikes",
    },
  };

  return guidance[mealType];
}

/**
 * Calculate compatibility score between day characteristics and food properties
 *
 * @param dayChar - Planetary day characteristics
 * @param foodElements - Elemental properties of the food
 * @returns Compatibility score (0-1)
 */
export function calculateDayFoodCompatibility(
  dayChar: PlanetaryDayCharacteristics,
  foodElements: ElementalProperties,
): number {
  let score = 0;
  let totalWeight = 0;

  // Compare each element
  const elements: Array<keyof ElementalProperties> = [
    "Fire",
    "Water",
    "Earth",
    "Air",
  ];

  elements.forEach((element) => {
    const preferredIntensity = dayChar.elementalPreferences[element];
    const foodIntensity = foodElements[element];

    // Calculate how close the food's elemental profile matches the day's preference
    const difference = Math.abs(preferredIntensity - foodIntensity);
    const elementScore = 1 - difference;

    // Weight by the day's preference (stronger preferences matter more)
    const weight = preferredIntensity;
    score += elementScore * weight;
    totalWeight += weight;
  });

  // Normalize score
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 0.5;

  return Math.max(0, Math.min(1, normalizedScore));
}

/**
 * Get recommended flavor profiles for a day and meal combination
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @returns Array of flavor recommendations
 */
export function getRecommendedFlavors(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);
  const flavors = Object.keys(dayChar.flavorProfiles);

  // Adjust flavors based on meal type
  const mealAdjustments: Record<MealType, Record<string, number>> = {
    breakfast: {
      bright: 1.2,
      energizing: 1.3,
      gentle: 1.1,
      comforting: 1.1,
    },
    lunch: {
      bold: 1.2,
      substantial: 1.2,
      balanced: 1.3,
    },
    dinner: {
      rich: 1.1,
      comforting: 1.2,
      grounding: 1.2,
      soothing: 1.3,
    },
    snack: {
      light: 1.3,
      quick: 1.2,
      sweet: 1.1,
    },
  };

  const adjustments = mealAdjustments[mealType] || {};

  return flavors
    .map((flavor) => ({
      flavor,
      score: dayChar.flavorProfiles[flavor] * (adjustments[flavor] || 1.0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((f) => f.flavor);
}

/**
 * Get cooking method recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @returns Array of recommended cooking methods
 */
export function getRecommendedCookingMethods(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  // Filter methods appropriate for meal type
  const mealMethodPrefs: Record<MealType, string[]> = {
    breakfast: ["quick-cooking", "steaming", "poaching", "baking", "assembly"],
    lunch: ["grilling", "roasting", "stir-frying", "searing", "simmering"],
    dinner: [
      "slow-cooking",
      "braising",
      "roasting",
      "multi-course",
      "elaborate preparations",
    ],
    snack: ["assembly", "raw preparations", "quick-cooking"],
  };

  const mealMethods = mealMethodPrefs[mealType] || [];

  // Combine day recommendations with meal-appropriate methods
  return dayChar.cookingMethods.filter((method) =>
    mealMethods.some(
      (mm) =>
        mm.toLowerCase().includes(method.toLowerCase()) ||
        method.toLowerCase().includes(mm.toLowerCase()),
    ),
  );
}

/**
 * Get ingredient recommendations for a specific day
 *
 * @param dayOfWeek - Day of week
 * @param mealType - Type of meal
 * @returns Array of recommended ingredients
 */
export function getRecommendedIngredients(
  dayOfWeek: DayOfWeek,
  mealType: MealType,
): string[] {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);

  // All day recommendations are appropriate for any meal type
  return dayChar.recommendedFoods;
}

/**
 * Generate day summary for UI display
 *
 * @param dayOfWeek - Day of week
 * @returns Human-readable day summary
 */
export function generateDaySummary(dayOfWeek: DayOfWeek): string {
  const dayChar = getPlanetaryDayCharacteristics(dayOfWeek);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    `${dayNames[dayOfWeek]} is ruled by ${dayChar.planet}, a ${dayChar.energy} ${dayChar.element} planet. ` +
    `Focus on ${dayChar.flavorProfiles && Object.keys(dayChar.flavorProfiles)[0]} flavors and ` +
    `${dayChar.cookingMethods[0]} cooking methods. ` +
    `Recommended cuisines include ${dayChar.recommendedCuisines.slice(0, 2).join(" and ")}.`
  );
}
