/**
 * The homepage recipe bar's AI request: POST /api/generate-cosmic-recipe. The
 * route reads every field; equipment reaches the model through the prompt
 * (lib/cooking/cosmicEquipment).
 */
export const PANTRY_DIET_CHOICES = [
  { value: "no-restrictions", label: "Any diet" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "dairy-free", label: "Dairy-free" },
] as const;

export type PantryDiet = (typeof PANTRY_DIET_CHOICES)[number]["value"];

export function pantryDietOf(value: string): PantryDiet {
  return PANTRY_DIET_CHOICES.find((choice) => choice.value === value)?.value ?? "no-restrictions";
}

export interface PantryRecipeInput {
  ingredients: readonly string[];
  equipment: readonly string[];
  diet: PantryDiet;
  /** The signed-in profile's restrictions, kept alongside the choice. */
  profileDiet: readonly string[];
  /** Allergies from the recipe builder: never to be used. */
  excluded: readonly string[];
}

export interface PantryRecipeRequest {
  prompt: string;
  diet: string;
  ingredients_main: string[];
  equipment: string[];
  disallowed_ingredients: string[];
}

const PROMPT_LIMIT = 2000;
const FIELD_LIMIT = 80;
const LIST_LIMIT = 40;

function clipped(values: readonly string[], limit: number): string[] {
  return values.map((value) => value.trim().slice(0, FIELD_LIMIT)).filter((value) => value !== "").slice(0, limit);
}

export function dietText(choice: PantryDiet, profile: readonly string[]): string {
  const chosen = choice === "no-restrictions" ? [] : [choice];
  const all = [...new Set([...chosen, ...profile.map((entry) => entry.trim().toLowerCase()).filter(Boolean)])];
  return all.length > 0 ? all.join(", ").slice(0, 200) : "no-restrictions";
}

export function pantryRecipeRequest(input: PantryRecipeInput): PantryRecipeRequest {
  const ingredients = clipped(input.ingredients, LIST_LIMIT);
  const prompt = `Create a complete, measured recipe that cooks with these ingredients: ${ingredients.join(", ")}. Use common pantry staples only where the dish needs them.`;
  return {
    prompt: prompt.slice(0, PROMPT_LIMIT),
    diet: dietText(input.diet, input.profileDiet),
    ingredients_main: ingredients,
    equipment: clipped(input.equipment, 20).map((entry) => entry.slice(0, 60)),
    disallowed_ingredients: clipped(input.excluded, LIST_LIMIT),
  };
}

/** One key per distinct request, so a retry after an uncertain failure is not charged twice. */
export function requestSignature(request: PantryRecipeRequest): string {
  return JSON.stringify([request.prompt, request.diet, request.ingredients_main, request.equipment, request.disallowed_ingredients]);
}
