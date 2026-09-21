import { z } from "zod";
import { cosmicRecipeSchema } from "@/types/cosmicRecipeSchema";
import type { Recipe, RecipeIngredient } from "@/types/recipe";
import type { QuizContext, QuizReading } from "./types";

/** Exactly the fields accepted by /api/generate-cosmic-recipe. */
export const quizCosmicRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  diet: z.string().trim().max(200),
  ingredients_main: z.array(z.string().max(80)).max(40),
  disallowed_ingredients: z.array(z.string().max(80)).max(40),
  preferredCuisine: z.string().trim().max(80),
});

export type QuizCosmicRequest = z.infer<typeof quizCosmicRequestSchema>;
export type QuizCosmicRecipe = z.infer<typeof cosmicRecipeSchema>;

const EXCLUSION_TERMS: Readonly<Record<string, readonly string[]>> = {
  gluten: ["wheat", "barley", "rye", "flour", "bread", "pasta", "couscous", "seitan", "soy sauce"],
  wheat: ["wheat", "flour", "bread", "pasta", "couscous", "seitan"],
  dairy: ["milk", "butter", "cheese", "yogurt", "cream", "ghee", "whey"],
  milk: ["milk", "butter", "cheese", "yogurt", "cream", "ghee", "whey"],
  nuts: ["peanut", "almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia"],
  "tree nuts": ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "macadamia"],
  peanuts: ["peanut"],
  soy: ["soy", "tofu", "tempeh", "edamame", "miso", "tamari"],
  egg: ["egg", "mayonnaise"],
  eggs: ["egg", "mayonnaise"],
  fish: ["fish", "salmon", "tuna", "cod", "anchovy", "sardine", "trout"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "mussel", "clam", "oyster", "scallop"],
  sesame: ["sesame", "tahini"],
};

export function expandQuizExclusions(allergens: readonly string[]): string[] {
  return [...new Set(allergens.flatMap((allergen) => {
    const normalized = allergen.toLowerCase().replace(/-free$/, "").trim();
    return [normalized, ...(EXCLUSION_TERMS[normalized] ?? [])];
  }))];
}

/** A culinary draft, with real amounts and instructions; scores remain preferences. */
export function buildQuizRecipe(reading: QuizReading): Recipe {
  const { preferences } = reading;
  const requestedMethod = (preferences.cookingMethod ?? reading.meal.method).toLowerCase();
  const noHeat = /raw|no.cook|no.heat|salad/.test(requestedMethod) || preferences.equipment === "none" || (preferences.maxMinutes !== null && preferences.maxMinutes < 20);
  const roast = !noHeat && /roast|brais|oven/.test(requestedMethod) && (preferences.maxMinutes === null || preferences.maxMinutes >= 35);
  const soup = !noHeat && !roast && /steam|simmer|poach|broth|soup/.test(requestedMethod);
  const method = noHeat ? "No-cook" : roast ? "Roasted" : soup ? "Simmered" : "Skillet";
  const minutes = noHeat ? 10 : roast ? 35 : 20;
  const spiceAmount = preferences.spiceLevel === "hot" ? 0.5 : preferences.spiceLevel === "medium" ? 0.25 : 0;
  const ingredients: RecipeIngredient[] = [
    { name: "canned chickpeas", amount: 480, unit: "g", preparation: "drained and rinsed (about two cans)", category: "legumes" },
    { name: noHeat ? "cucumber" : "zucchini", amount: 300, unit: "g", preparation: "cut into 1 cm pieces", category: "vegetables" },
    { name: "tomatoes", amount: 200, unit: "g", preparation: "chopped", category: "vegetables" },
    { name: "spinach", amount: 60, unit: "g", category: "vegetables" },
    { name: "olive oil", amount: 2, unit: "tbsp", category: "oils" },
    { name: "lemon juice", amount: 2, unit: "tbsp", category: "produce" },
    { name: "parsley", amount: 15, unit: "g", preparation: "chopped", category: "herbs" },
    { name: "salt", amount: 0.25, unit: "tsp", category: "seasonings" },
    ...(!noHeat ? [{ name: "ground cumin", amount: 1, unit: "tsp", category: "spices" }] : []),
    ...(spiceAmount > 0 ? [{ name: "chili flakes", amount: spiceAmount, unit: "tsp", category: "spices" }] : []),
    ...(soup ? [{ name: "water", amount: 500, unit: "ml", category: "pantry" }] : []),
  ];
  const finishing = `Finish with the lemon juice, parsley${spiceAmount > 0 ? ", and chili flakes" : ""}. Taste and divide between two bowls.`;
  const instructions = noHeat
    ? ["Drain and rinse the canned chickpeas. Wash the cucumber, tomatoes, spinach, and parsley. Chop the cucumber and tomatoes into bite-size pieces.", "Whisk the olive oil, lemon juice, and salt in a large bowl. Add the chickpeas, cucumber, tomatoes, and spinach; toss to coat.", `Fold in the chopped parsley${spiceAmount > 0 ? " and chili flakes" : ""}. Divide between two bowls and serve immediately.`]
    : roast
      ? ["Heat the oven to 220°C / 425°F. Drain, rinse, and pat the chickpeas dry. Chop the zucchini and tomatoes.", "Toss the chickpeas and zucchini with the olive oil, cumin, and salt on a large baking tray. Spread into one layer and roast for 15 minutes.", "Add the tomatoes, stir, and roast for 10 more minutes, until the zucchini is tender and the chickpeas are lightly crisp. Fold in the spinach while everything is hot, until wilted.", finishing]
      : soup
        ? ["Drain and rinse the chickpeas. Wash and chop the zucchini, tomatoes, spinach, and parsley.", "Warm the olive oil in a saucepan over medium heat. Add the zucchini, cumin, and salt; stir for 3 minutes. Add the tomatoes and cook for 2 minutes.", "Add the chickpeas and 500 ml water. Bring to a gentle simmer and cook for 8 minutes, until the zucchini is tender. Mash a few chickpeas against the side to thicken the broth. Stir in the spinach for 1 minute.", finishing]
        : ["Drain, rinse, and pat the chickpeas dry. Wash and chop the zucchini, tomatoes, spinach, and parsley.", "Heat the olive oil in a wide skillet over medium-high heat. Add the zucchini and chickpeas; cook for 6–8 minutes, stirring occasionally, until lightly golden.", "Stir in the cumin, salt, and tomatoes. Cook for 3 minutes, then fold in the spinach until wilted, about 1 minute.", finishing];
  const name = noHeat ? "Lemon & herb chickpea crunch" : roast ? "Golden roast chickpeas & summer vegetables" : soup ? "Lemon chickpea & greens soup" : "Cumin chickpea & vegetable skillet";
  const key = JSON.stringify({ method, spiceAmount, preferences });
  let hash = 2166136261;
  for (const char of key) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return {
    id: `quiz-${(hash >>> 0).toString(36)}`,
    name,
    description: "A plant-based starting recipe shaped by your cooking method and heat preference. Your complete brief travels with it into the builder and AI forge.",
    cuisine: "Mediterranean-inspired",
    ingredients,
    instructions,
    numberOfServings: 2,
    servingSize: 2,
    totalTime: `${minutes} minutes`,
    cookingMethod: [method],
    // This is explicitly a desired palate profile, not measured recipe/sky telemetry.
    elementalProperties: { Fire: reading.pct.Fire / 100, Water: reading.pct.Water / 100, Earth: reading.pct.Earth / 100, Air: reading.pct.Air / 100 },
    mealType: ["dinner"],
    isVegan: true, isVegetarian: true, isGlutenFree: true, isDairyFree: true, isNutFree: true,
    allergens: [],
    tags: ["quiz-draft", "plant-based", "palate-profile-not-measurement"],
    notes: reading.preferences.selectedOptions.map((choice) => `${choice.questionId}: ${choice.label}`).join("; "),
  };
}

export function buildQuizCosmicRequest(reading: QuizReading, context: QuizContext, recipe: Recipe = buildQuizRecipe(reading)): QuizCosmicRequest {
  const { preferences } = reading;
  const choices = preferences.selectedOptions.map((choice) => `${choice.questionId}=${choice.label}`).join("; ");
  const contextNote = [context.timeOfDay, context.season, context.planetaryHour ? `${context.planetaryHour} hour` : "", context.lunarPhase ?? "", context.zodiacSign ?? "", context.weather ? `${context.weather.temperatureC}C ${context.weather.condition}` : ""].filter(Boolean).join(", ");
  const prompt = [
    `Craft a complete meal for ${preferences.servings} people. ${preferences.maxMinutes !== null ? `Maximum ${preferences.maxMinutes} minutes.` : ""}`,
    `Diet: ${preferences.dietaryStyle}. Exclusions: ${preferences.excludedAllergens.join(", ") || "none specified"}.`,
    `Choices: ${choices}.`,
    `Context: ${contextNote}. Desired elemental palate ${JSON.stringify(reading.pct)}. ESMS preference weights ${JSON.stringify(reading.esmsTotals)} are subjective, not planetary measurements. Ground actual sky/thermodynamics using server data.`,
    `Equipment: ${preferences.equipment ?? "unspecified"}; texture: ${preferences.texture ?? "unspecified"}; protein: ${preferences.proteinFocus ?? "unspecified"}.`,
  ].join(" ");
  // Never truncate a dietary restriction or a late answer to fit the API.
  const parsed = quizCosmicRequestSchema.safeParse({
    prompt,
    diet: preferences.dietaryStyle === "unrestricted" ? "omnivore" : preferences.dietaryStyle,
    ingredients_main: recipe.ingredients.filter((ingredient) => ingredient.name !== "water").map((ingredient) => ingredient.name),
    disallowed_ingredients: expandQuizExclusions(preferences.excludedAllergens),
    preferredCuisine: reading.meal.cuisineSlug,
  });
  if (!parsed.success) throw new Error("Your culinary brief is too long to send safely. Your answers are saved; shorten the custom context and try again.");
  return parsed.data;
}

function quantityNumber(quantity: string): number | null {
  const text = quantity.trim();
  const numeric = Number(text);
  if (text && Number.isFinite(numeric) && numeric > 0) return numeric;
  const fraction = /^(?:(\d+)\s+)?(\d+)\/(\d+)$/.exec(text);
  if (!fraction) return null;
  const denominator = Number(fraction[3]);
  const value = Number(fraction[1] ?? 0) + Number(fraction[2]) / denominator;
  return denominator > 0 && Number.isFinite(value) && value > 0 ? value : null;
}

export function cosmicRecipeToQuizRecipe(cosmic: QuizCosmicRecipe): Recipe {
  if (!Number.isInteger(cosmic.yields) || cosmic.yields <= 0 || cosmic.yields > 100 || cosmic.total_time <= 0 || !cosmic.steps.length || !cosmic.ingredients.length) {
    throw new Error("The recipe service returned an incomplete recipe. Your starting recipe is still available.");
  }
  const ingredients = cosmic.ingredients.map((ingredient): RecipeIngredient => {
    const amount = quantityNumber(ingredient.quantity);
    if (amount === null || !ingredient.unit.trim() || !ingredient.name.trim()) throw new Error("The generated recipe has an ingredient quantity we cannot safely add to your cart.");
    return { name: ingredient.name, amount, unit: ingredient.unit, optional: ingredient.optional, notes: ingredient.household_description, substitutes: ingredient.substitutions };
  });
  const total = Object.values(cosmic.elementalBalance).reduce((sum, value) => sum + value, 0);
  if (total <= 0) throw new Error("The generated recipe is missing its elemental profile.");
  return {
    id: `cosmic-${cosmic.id}`, name: cosmic.title, description: cosmic.short_description, cuisine: cosmic.cuisine,
    ingredients, instructions: [...cosmic.steps].sort((a, b) => a.step_number - b.step_number).map((step) => step.instruction),
    numberOfServings: cosmic.yields, servingSize: cosmic.yields, totalTime: `${cosmic.total_time} minutes`,
    cookingMethod: cosmic.tags.cooking_methods, tags: [...cosmic.tags.diet, ...cosmic.tags.flavor_profile],
    elementalProperties: { Fire: cosmic.elementalBalance.fire / total, Water: cosmic.elementalBalance.water / total, Earth: cosmic.elementalBalance.earth / total, Air: cosmic.elementalBalance.air / total },
    notes: cosmic.alignment_notes.join(" "),
    preparationNotes: cosmic.finishing_and_serving.garnish_and_plating,
  };
}

function recipeConflict(recipe: Recipe, request: QuizCosmicRequest): string | undefined {
  const dietTerms = request.diet === "vegan"
    ? ["beef", "chicken", "pork", "lamb", "turkey", "gelatin", "honey", ...expandQuizExclusions(["milk", "eggs", "fish", "shellfish"])]
    : request.diet === "vegetarian"
      ? ["beef", "chicken", "pork", "lamb", "turkey", "gelatin", ...expandQuizExclusions(["fish", "shellfish"])]
      : request.diet === "pescatarian" ? ["beef", "chicken", "pork", "lamb", "turkey"] : [];
  const terms = [...request.disallowed_ingredients, ...dietTerms];
  return recipe.ingredients.find((ingredient) => terms.some((term) => ingredient.name.toLowerCase().includes(term.toLowerCase())))?.name;
}

const errorSchema = z.object({ message: z.string().optional(), error: z.string().optional() });

/** Same key is reused for uncertain retries; no automatic paid retries. */
export async function forgeQuizRecipe(request: QuizCosmicRequest, idempotencyKey: string, signal: AbortSignal): Promise<Recipe> {
  const response = await fetch("/api/generate-cosmic-recipe", {
    method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", signal,
    body: JSON.stringify({ ...quizCosmicRequestSchema.parse(request), idempotencyKey }),
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const parsed = errorSchema.safeParse(body);
    const detail = parsed.success ? parsed.data.message ?? parsed.data.error : undefined;
    const fallback = response.status === 402 ? "More ESMS credits are needed. Your starting recipe is still available." : response.status === 429 ? "The recipe allowance is currently exhausted. Try again later or sign in." : response.status === 409 ? "This request was already processed. We will not send a new charge automatically." : "The cosmic kitchen could not finish. Your starting recipe is still available.";
    throw new Error(detail ?? fallback);
  }
  const parsed = cosmicRecipeSchema.safeParse(body);
  if (!parsed.success) throw new Error("The recipe service returned an invalid recipe. Your starting recipe is still available.");
  const recipe = cosmicRecipeToQuizRecipe(parsed.data);
  const conflict = recipeConflict(recipe, request);
  if (conflict) throw new Error(`The generated recipe included ${conflict}, which conflicts with your dietary brief. It has not replaced your starting recipe.`);
  return recipe;
}
