import {
  element,
  identifier,
  input,
  text,
  type JsonSchema,
} from "./inputSchemaHelpers";

export const CULINARY_INPUT_SCHEMAS = {
  get_user_allowance: input({}),
  substitute_ingredient: input(
    {
      ingredient: text(
        200,
        "Ingredient to replace (e.g. 'buttermilk', 'eggs', 'soy sauce', 'heavy cream').",
      ),
      dishContext: text(
        200,
        "Optional recipe or preparation context (e.g. 'pancakes', 'marinade', 'baking', 'stir fry').",
      ),
      dietaryRestriction: text(
        100,
        "Optional target dietary restriction (e.g. 'vegan', 'dairy-free', 'gluten-free', 'keto').",
      ),
    },
    ["ingredient"],
  ),
  build_consolidated_grocery_list: input(
    {
      recipeIds: {
        type: "array",
        minItems: 1,
        maxItems: 50,
        items: identifier,
        description:
          "Canonical recipe IDs or names to consolidate into a single shopping list.",
      },
      servingsMultiplier: {
        type: "number",
        minimum: 0.1,
        maximum: 20,
        description: "Scale factor for ingredient quantities (default 1).",
      },
      pantryHave: {
        type: "array",
        maxItems: 100,
        items: text(200),
        description:
          "Ingredients already on hand to subtract from the grocery list.",
      },
    },
    ["recipeIds"],
  ),
  what_to_cook_now: input({
    availableIngredients: {
      type: "array",
      maxItems: 50,
      items: text(200),
      description:
        "List of ingredients currently in pantry or fridge (e.g. ['cabbage', 'tahini', 'chicken thighs']).",
    },
    maxActiveMinutes: {
      type: "integer",
      minimum: 5,
      maximum: 240,
      description: "Maximum active cooking/preparation time in minutes.",
    },
    moodOrCraving: text(
      200,
      "Desired flavor vibe or mood (e.g. 'comforting, warm, rich', 'crispy, acidic, fast').",
    ),
    seasonOrWeather: text(
      50,
      "Current season or weather (e.g. 'autumn', 'rainy', 'hot summer evening').",
    ),
    servings: { type: "integer", minimum: 1, maximum: 20 },
    dietary: { type: "array", maxItems: 20, items: text(100) },
    cuisine: text(100),
    ignoreSavedProfile: {
      type: "boolean",
      description:
        "When true, bypasses automatic filtering based on the caller's saved dietary preferences and allergens.",
    },
    dominantElement: element,
    solarReturnYear: {
      type: "integer",
      minimum: 1800,
      maximum: 2100,
      description:
        "Optional past calendar year (1800..last year) to align recommendations with that year's Solar Return astrological moment.",
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 10,
      description: "Number of recommendations to return (defaults to 3).",
    },
  }),
  update_culinary_profile: input({
    addAllergens: {
      type: "array",
      maxItems: 30,
      items: text(100),
      description:
        "Hard allergens to add to the caller's profile (e.g. ['peanuts', 'shellfish', 'dairy']).",
    },
    removeAllergens: {
      type: "array",
      maxItems: 30,
      items: text(100),
      description: "Allergens to remove from the caller's profile.",
    },
    confirmAllergenRemoval: {
      type: "boolean",
      description:
        "Explicit safety confirmation required when removeAllergens is non-empty. Prevents accidental or prompt-injected allergen removal.",
    },
    addDislikes: {
      type: "array",
      maxItems: 50,
      items: text(100),
      description: "Ingredients to add to dislikes (e.g. ['cilantro', 'mushrooms']).",
    },
    removeDislikes: {
      type: "array",
      maxItems: 50,
      items: text(100),
      description: "Ingredients to remove from dislikes.",
    },
    dietaryFrameworks: {
      type: "array",
      maxItems: 20,
      items: text(100),
      description:
        "Dietary restrictions or patterns (e.g. ['vegan', 'pescatarian', 'halal', 'gluten-free']).",
    },
    setDiet: text(100, "Primary diet setting (e.g. 'vegetarian', 'omnivore')."),
    spiceTolerance: {
      type: "string",
      enum: ["mild", "medium", "hot", "extra-hot"],
      description: "Preferred spice level tolerance.",
    },
    householdSize: {
      type: "integer",
      minimum: 1,
      maximum: 20,
      description: "Typical household size / portions.",
    },
    kitchenEquipment: {
      type: "array",
      maxItems: 30,
      items: text(100),
      description:
        "Kitchen appliances or cookware available (e.g. ['air_fryer', 'cast_iron', 'blender', 'instant_pot']).",
    },
  }),
} satisfies Record<string, JsonSchema>;
