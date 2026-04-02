import { z } from 'zod';

// Define the comprehensive hybrid schema combining HSCA culinary arts and Alchm Kitchen cosmic rules
export const cosmicRecipeSchema = z.object({
  id: z.string().describe('A unique identifier for the recipe (e.g., lowercase-kebab-case)'),
  title: z.string().describe('Short, enticing recipe name'),
  short_description: z.string().describe('1-3 sentence overview focusing on flavor, vibe, and astro alignment.'),
  category: z.enum([
    'Beverages', 'Breakfast', 'Dessert', 'Dinner', 'Lunch', 
    'Salad', 'Sauce', 'Side', 'Soup', 'Appetizer', 'Condiment'
  ]).describe('The culinary category of the recipe'),
  cuisine: z.string().describe('The primary cultural cuisine style (e.g., Japanese, Mediterranean)'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).describe('Overall cooking difficulty'),
  yields: z.number().describe('Number of servings this recipe produces'),
  total_time: z.number().describe('Total time in minutes (prep + cook)'),
  alignment_score: z.object({
    overall: z.number().min(0).max(100),
    ingredients_fit: z.number().min(0).max(100),
    diet_fit: z.number().min(0).max(100),
    time_fit: z.number().min(0).max(100),
    astro_fit: z.number().min(0).max(100)
  }),
  alignment_notes: z.array(z.string()).describe('Short bullets explaining key alignment, compromises, substitutions, or assumptions.'),
  tags: z.object({
    diet: z.array(z.string()).describe('e.g., vegan, gluten-free'),
    cuisine: z.array(z.string()).describe('e.g., Mediterranean, Italian-American'),
    meal_type: z.string().describe('A single primary meal type, e.g., Dinner, Lunch, Snack'),
    flavor_profile: z.array(z.string()),
    cooking_methods: z.array(z.string()),
    elements: z.array(z.string()).describe('e.g., fire, earth, air, water'),
    planets: z.array(z.string()).describe('e.g., Mars, Jupiter, Venus')
  }),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.string().describe('Numeric value of the quantity'),
    unit: z.string().describe('e.g., g, ml, cup, tbsp, tsp, piece'),
    household_description: z.string().optional().describe('e.g., about 1 medium onion or 2 tablespoons'),
    optional: z.boolean(),
    substitutions: z.array(z.string()).describe('Short suggestions and how they change flavor, texture, or astro alignment.')
  })),
  steps: z.array(z.object({
    step_number: z.number(),
    instruction: z.string().describe('Clear, numbered step with specific actions.'),
    time_minutes: z.number(),
    cooking_method: z.string().describe('e.g., sauté, bake, boil, roast, stir-fry, no-cook, mix, grill, steam'),
    tips: z.array(z.string()).describe('Critical details to avoid failure, including heat level, doneness cues, or safety notes.')
  })),
  elementalBalance: z.object({
    fire: z.number().min(0).max(100).describe('Fire element score (e.g., 25) - relates to metabolic heat, grilling, spicy flavors'),
    earth: z.number().min(0).max(100).describe('Earth element score (e.g., 40) - relates to structure, root veg, slow cooking'),
    water: z.number().min(0).max(100).describe('Water element score (e.g., 15) - relates to hydration, soups, boiling, juicy fruits'),
    air: z.number().min(0).max(100).describe('Air element score (e.g., 20) - relates to aeration, light textures, raw salads'),
  }).describe('The Elemental Balance distribution representing ~100 total points for this recipe'),
  nutrition: z.object({
    calories: z.number().describe('Estimated calories per serving'),
    protein: z.number().describe('Protein content in grams'),
    carbohydrates: z.number().describe('Carbohydrate content in grams'),
    fat: z.number().describe('Fat content in grams'),
  }).describe('Nutritional information per serving'),
  vitamins: z.array(z.string()).optional().describe('Notable vitamins present'),
  minerals: z.array(z.string()).optional().describe('Notable minerals present'),
  finishing_and_serving: z.object({
    garnish_and_plating: z.string(),
    doneness_cues: z.string(),
    serving_suggestions: z.string()
  }),
  leftovers_and_storage: z.object({
    can_store: z.boolean(),
    storage_instructions: z.string(),
    storage_lifespan_days: z.number()
  }),
  astro_explanation: z.object({
    summary: z.string().describe('1-3 sentences linking the dish to the current cosmic context in plain language.'),
    correspondences: z.array(z.string()).describe('Explain how key ingredients, elements, and methods reflect zodiac, planets, or elements.')
  })
});
