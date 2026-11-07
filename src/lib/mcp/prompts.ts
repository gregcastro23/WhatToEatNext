/**
 * @file src/lib/mcp/prompts.ts
 *
 * Server-defined prompt blueprints for the Model Context Protocol (MCP).
 * Provides actionable workflows for Meta Muse, Claude Desktop, Cursor, and
 * autonomous customer agents.
 */

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptDefinition {
  name: string;
  description: string;
  arguments?: PromptArgument[];
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: {
    type: "text";
    text: string;
  };
}

export interface GetPromptResult {
  [key: string]: unknown;
  description?: string;
  messages: PromptMessage[];
}

export const PROMPT_DEFINITIONS: PromptDefinition[] = [
  {
    name: "cosmic_meal_planning",
    description:
      "Plan an alchemical meal aligned with live planetary transits, elemental balances, user culinary profile, and dietary preferences.",
    arguments: [
      {
        name: "cuisine",
        description: "Desired cuisine tradition (e.g. 'italian', 'thai', 'mediterranean')",
        required: false,
      },
      {
        name: "dietary",
        description: "Dietary restrictions, comma-separated (e.g. 'vegan, gluten-free')",
        required: false,
      },
      {
        name: "availableIngredients",
        description: "Comma-separated list of ingredients available in the pantry or fridge",
        required: false,
      },
      {
        name: "maxActiveMinutes",
        description: "Maximum active prep/cook time in minutes (e.g. '30')",
        required: false,
      },
      {
        name: "latitude",
        description: "Observer latitude (default: 40.7498 NYC)",
        required: false,
      },
      {
        name: "longitude",
        description: "Observer longitude (default: -73.7976 NYC)",
        required: false,
      },
    ],
  },
  {
    name: "fast_pantry_dinner",
    description:
      "Single-round-trip dinner recommendation using on-hand pantry ingredients, preparation time caps, and celestial transits.",
    arguments: [
      {
        name: "availableIngredients",
        description: "Comma-separated list of ingredients currently on hand",
        required: true,
      },
      {
        name: "maxActiveMinutes",
        description: "Maximum active prep/cook time in minutes (e.g. '30')",
        required: false,
      },
      {
        name: "moodOrCraving",
        description: "Desired flavor vibe or mood (e.g. 'comforting', 'spicy and crisp')",
        required: false,
      },
    ],
  },
  {
    name: "pantry_alchemical_balance",
    description:
      "Analyze a list of ingredients from a pantry, evaluate their elemental and ESMS balance, and recommend harmony adjustments or substitutions.",
    arguments: [
      {
        name: "ingredients",
        description: "Comma-separated list of ingredients available in the pantry",
        required: true,
      },
      {
        name: "targetDiet",
        description: "Optional dietary goal for substitutions (e.g. 'vegan', 'dairy-free')",
        required: false,
      },
    ],
  },
  {
    name: "historical_culinary_council",
    description:
      "Consult one of the 71 canonical historical alchemical masters (e.g. Leonardo da Vinci, Hildegard von Bingen, Socrates, Paracelsus) on a dish or culinary philosophy.",
    arguments: [
      {
        name: "historicalAgent",
        description:
          "Slug of historical master (e.g. 'leonardo-da-vinci', 'hildegard-von-bingen', 'socrates', 'carl-jung', 'paracelsus')",
        required: true,
      },
      {
        name: "dishOrTopic",
        description: "The recipe name, ingredient, or culinary question to deliberate",
        required: true,
      },
    ],
  },
];

function buildCosmicMealPlanningPrompt(args?: Record<string, string>): GetPromptResult {
  const cuisine = args?.cuisine ? ` (${args.cuisine} cuisine)` : "";
  const dietary = args?.dietary ? ` with dietary restrictions: ${args.dietary}` : "";
  const coords =
    args?.latitude && args.longitude
      ? ` at coordinates (${args.latitude}, ${args.longitude})`
      : "";
  const pantry = args?.availableIngredients
    ? ` using available ingredients: ${args.availableIngredients}`
    : "";
  const timeCap = args?.maxActiveMinutes ? ` in under ${args.maxActiveMinutes} minutes` : "";

  return {
    description: "Workflow prompt for cosmic meal discovery and alchemical alignment",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please plan an alchemically aligned meal${cuisine}${dietary}${coords}${pantry}${timeCap}. Follow this structured workflow:
1. Profile & Balance Inspection:
   - Call 'get_user_allowance' to verify current ESMS token balance and rate limits.
   - Read resource 'alchm://account/culinary-profile' to inspect saved hard allergens, dietary frameworks, and available kitchen equipment at zero token cost.
2. Sky Transits:
   - Call 'get_live_sky_transits' to determine the current dominant astrological element (Fire, Water, Earth, or Air) and active planetary transits.
3. Recipe Discovery & Recommendation:
   - For fast recommendations matching pantry ingredients and time limits, call 'what_to_cook_now' for a single-call composite recommendation with flavor star, finishing touch, and sensory checkpoints.
   - Or call 'generate_cosmic_recipe' to search the full 579-recipe catalog by cuisine, dietary needs, or keywords.
4. Deep Recipe & Ingredient Inspection:
   - Read resource 'alchm://recipes/{id}' to inspect complete structured recipe instructions, timings, and pairings at zero token cost.
   - Read resource 'alchm://ingredients/{slug}' for deep nutritional and seasonal pairing data for any ingredient.
5. Consolidated Grocery & Substitutions:
   - Call 'build_consolidated_grocery_list' with desired servings multiplier and pantry inventory to generate an aisle-organized shopping list.
   - If an ingredient swap is required (e.g. for an allergy or vegan adaptation), call 'substitute_ingredient'.`,
        },
      },
    ],
  };
}

function buildFastPantryDinnerPrompt(args?: Record<string, string>): GetPromptResult {
  const ings = args?.availableIngredients ?? "cabbage, tahini, chicken";
  const time = args?.maxActiveMinutes ? ` in under ${args.maxActiveMinutes} minutes` : "";
  const vibe = args?.moodOrCraving ? ` with a ${args.moodOrCraving} flavor profile` : "";

  return {
    description: "Workflow prompt for rapid pantry-matched dinner recommendations",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Recommend a dinner using these on-hand ingredients: ${ings}${time}${vibe}.
1. Safety Check: Read 'alchm://account/culinary-profile' to verify allergens and available kitchen equipment.
2. Single-Call Recommendation: Call 'what_to_cook_now' with availableIngredients, maxActiveMinutes, and moodOrCraving.
3. Review Chef Guidance: Surface the recommended dish's match score, missing ingredients, flavor star distribution, finishing touch, and sensory checkpoints.
4. Grocery Consolidation: If ingredients are missing, call 'build_consolidated_grocery_list' for the recipe ID with pantryHave to build a targeted aisle-grouped shopping list.
5. Adaptations: If needed, call 'substitute_ingredient' to swap any unavailable or restricted items.`,
        },
      },
    ],
  };
}

function buildPantryAlchemicalBalancePrompt(args?: Record<string, string>): GetPromptResult {
  const rawIngredients = args?.ingredients ?? "olive oil, garlic, tomato, basil";
  const list = rawIngredients
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    description: "Workflow prompt for pantry ingredient analysis and elemental balancing",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Analyze the following pantry ingredients for alchemical balance: ${list.join(", ")}.
1. Call 'alchemize_ingredients' with these ingredients to retrieve their Spirit, Essence, Matter, and Substance (ESMS) scores and thermodynamic indices.
2. Inspect individual ingredient properties via 'alchm://ingredients/{slug}' for deep flavor profiles and seasonal pairings.
3. If an ingredient needs to be replaced for dietary preferences or pantry shortages, call 'substitute_ingredient' with context.
4. Call 'what_to_cook_now' with these available ingredients to recommend harmonious recipes matching current celestial transits.
5. Suggest complementary culinary techniques from 'alchm://techniques/{slug}' (e.g. sear, braise, ferment, confit) to achieve complete culinary harmony.`,
        },
      },
    ],
  };
}

function buildHistoricalCulinaryCouncilPrompt(args?: Record<string, string>): GetPromptResult {
  const agent = args?.historicalAgent ?? "leonardo-da-vinci";
  const topic = args?.dishOrTopic ?? "roasted root vegetables and rosemary";

  return {
    description: "Workflow prompt for historical persona consultation",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Adopt the authentic culinary and philosophical persona of historical master '${agent}'.
Topic to evaluate: "${topic}".
1. Inquire into the energetic, philosophical, and dietary nature of this dish according to your historical writings and planetary alignments.
2. If the dish conflicts with your authentic dietary principles (e.g. Leonardo's vegetarianism), propose a strict alchemical adaptation.
3. Offer an authentic historical culinary reflection suitable for submission via 'submit_recipe_reflection'.`,
        },
      },
    ],
  };
}

const PROMPT_BUILDERS: Record<string, (args?: Record<string, string>) => GetPromptResult> = {
  cosmic_meal_planning: buildCosmicMealPlanningPrompt,
  fast_pantry_dinner: buildFastPantryDinnerPrompt,
  pantry_alchemical_balance: buildPantryAlchemicalBalancePrompt,
  historical_culinary_council: buildHistoricalCulinaryCouncilPrompt,
};

export function getPrompt(
  name: string,
  args?: Record<string, string>,
): GetPromptResult | null {
  const builder = PROMPT_BUILDERS[name];
  return builder ? builder(args) : null;
}
