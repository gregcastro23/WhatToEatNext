/**
 * A cosmic recipe that satisfies `cosmicRecipeSchema` in full, shared by the
 * route's tests. A fixture that fails the schema sends the route down its 502
 * schema-drift exit, which silently changes what a test is asserting on.
 *
 * @file src/app/api/generate-cosmic-recipe/__tests__/helpers/validCosmicRecipe.ts
 */

export const VALID_RECIPE = {
  id: "cosmic-test",
  title: "Test",
  short_description: "A test dish.",
  category: "Dinner",
  cuisine: "Fusion",
  difficulty: "beginner",
  yields: 2,
  total_time: 30,
  alignment_score: {
    overall: 90,
    ingredients_fit: 90,
    diet_fit: 100,
    time_fit: 90,
    astro_fit: 80,
  },
  alignment_notes: ["aligned"],
  tags: {
    diet: ["omnivore"],
    cuisine: ["Fusion"],
    meal_type: "Dinner",
    flavor_profile: ["savory"],
    cooking_methods: ["saute"],
    elements: ["fire"],
    planets: ["Mars"],
  },
  ingredients: [
    {
      name: "salt",
      quantity: "1",
      unit: "tsp",
      optional: false,
      substitutions: [],
    },
  ],
  steps: [
    {
      step_number: 1,
      instruction: "Do the thing.",
      time_minutes: 5,
      cooking_method: "mix",
      tips: [],
    },
  ],
  elementalBalance: { fire: 25, earth: 40, water: 15, air: 20 },
  nutrition: { calories: 400, protein: 20, carbohydrates: 30, fat: 12 },
  finishing_and_serving: {
    garnish_and_plating: "plate it",
    doneness_cues: "golden",
    serving_suggestions: "hot",
  },
  leftovers_and_storage: {
    can_store: true,
    storage_instructions: "fridge",
    storage_lifespan_days: 3,
  },
  astro_explanation: { summary: "Mars day.", correspondences: ["fire"] },
};
