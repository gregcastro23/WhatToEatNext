/**
 * Recipe extraction via OpenAI GPT-4o.
 *
 * The web-feature counterpart of scripts/extract_recipes_llm.py — turns pasted
 * text or photo(s) of a recipe into structured recipe objects. Same model
 * (gpt-4o) and field shape as the script; the multi-page-PDF chunking logic is
 * dropped here since the feature ingests one paste / a few photos at a time.
 *
 * Uses a strict json_schema response_format (via zodResponseFormat) and then
 * validates the returned content with the same Zod schema, so callers get a
 * typed, validated result without depending on the SDK's auto-parse surface.
 */
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { ChatCompletionContentPart } from "openai/resources/chat/completions";

// Strict structured-output requires every field present; optional fields are
// modeled as nullable (mirrors the Optional[...] fields in the python script).
export const ExtractedRecipeSchema = z.object({
  title: z.string().describe("The exact title of the recipe"),
  description: z
    .string()
    .nullable()
    .describe("A brief description/subtitle, or null if none"),
  yield_amount: z
    .string()
    .nullable()
    .describe("Yield or quantity produced (e.g. '1/2 cup', '4 servings'), or null"),
  ingredients: z
    .array(z.string())
    .describe("Ingredients, formatted with fractions + units (e.g. '1/2 cup sugar')"),
  instructions: z.array(z.string()).describe("Step-by-step instructions"),
  categories: z
    .array(z.string())
    .describe("1–3 relevant categories (e.g. 'Sauce', 'Dessert', 'Vegetarian')"),
});

export type ExtractedRecipe = z.infer<typeof ExtractedRecipeSchema>;

const RecipeExtractionResultSchema = z.object({
  recipes: z.array(ExtractedRecipeSchema),
});

const SYSTEM_PROMPT = `You are an expert culinary data-extraction AI. You are given either the text of a recipe or photo(s) of recipe page(s). Extract every COMPLETE recipe present into the strict JSON schema.

Rules:
1. Extract all complete recipes you can see. If the input contains no recipe, return an empty list.
2. Clean up OCR/formatting noise (e.g. turn '¥' into '1/2', a stray '' into '°' when obvious from context).
3. Format each ingredient with its quantity, fraction, and unit (e.g. '1/2 cup sugar', '2 tbsp olive oil').
4. Ignore page furniture: headers, footers, page numbers, and unrelated lesson/marketing text.
5. Give each recipe 1–3 concise categories.
6. Output MUST strictly follow the requested JSON schema.`;

const MODEL = "gpt-4o";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set — recipe extraction is unavailable");
  }
  _client ??= new OpenAI({ apiKey, timeout: 55_000, maxRetries: 1 });
  return _client;
}

async function runExtraction(
  userContent: string | ChatCompletionContentPart[],
): Promise<ExtractedRecipe[]> {
  const completion = await getClient().chat.completions.create({
    model: MODEL,
    temperature: 0.1,
    response_format: zodResponseFormat(
      RecipeExtractionResultSchema,
      "recipe_extraction",
    ),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? '{"recipes":[]}';
  const parsed = RecipeExtractionResultSchema.parse(JSON.parse(raw));
  return parsed.recipes;
}

/** Extract recipe(s) from a block of pasted/typed text. */
export async function extractRecipesFromText(
  text: string,
): Promise<ExtractedRecipe[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return runExtraction(
    `Extract all complete recipes from the following text:\n\n${trimmed}`,
  );
}

/**
 * Extract recipe(s) from one or more images.
 * @param imageDataUrls fully-formed data URLs, e.g. `data:image/png;base64,iVBORw0...`
 */
export async function extractRecipesFromImages(
  imageDataUrls: string[],
): Promise<ExtractedRecipe[]> {
  if (imageDataUrls.length === 0) return [];
  const content: ChatCompletionContentPart[] = [
    {
      type: "text",
      text: "Extract all complete recipes from the following image(s).",
    },
    ...imageDataUrls.map(
      (url): ChatCompletionContentPart => ({
        type: "image_url",
        image_url: { url },
      }),
    ),
  ];
  return runExtraction(content);
}
