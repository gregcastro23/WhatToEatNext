/** @jest-environment node */
/**
 * End-to-End Historical Persona Adaptation Catalog Validation (Objective P2).
 *
 * Runs all 12 canonical vegetarian historical personas across the top 10
 * adaptable catalog recipes (120 persona × recipe adaptations) and verifies:
 *   - non-null finite elemental balances (Fire, Water, Earth, Air)
 *   - valid per-serving macro readings (calories, protein, carbs, fat)
 *   - instruction clarity and vegetarian verification gate compliance
 */
import { getServerRecipes } from "@/actions/recipes";
import { verifyRecipeContent } from "@/lib/cooking/recipeVerificationGate";
import { prepareAdaptationSource } from "@/lib/recipes/adaptationCandidates";
import { editedChickenInstructions } from "@/lib/recipes/adaptationInstructions";
import { SUPPORTED_ADAPTATION_AGENTS } from "@/lib/recipes/savedAdaptationSchemas";
import { createSavedAdaptation } from "@/lib/recipes/savedAdaptationService";
import { recomputeSavedVersionReadings } from "@/utils/dietaryAdaptation";
import { ACTOR_ID, PLACEMENTS, PREFERENCES } from "./helpers/adaptationFixtures";
import type { Recipe } from "@/types/recipe";

const mockQuery = jest.fn();
const mockChat = jest.fn();
const mockPublish = jest.fn();
const mockGetRecipeById = jest.fn();
const mockIsCatalogDegraded = jest.fn();

jest.mock("@/lib/database/connection", () => ({
  executeQuery: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock("@/lib/agents/planetaryAgentsGateway", () => ({
  planetaryAgentsGateway: {
    chatWithAgent: (...args: unknown[]) => mockChat(...args),
  },
}));

jest.mock("@/services/feedDatabaseService", () => ({
  feedDatabase: {
    createEvent: (...args: unknown[]) => mockPublish(...args),
  },
}));

jest.mock("@/services/LocalRecipeService", () => ({
  LocalRecipeService: {
    getRecipeById: (...args: unknown[]) => mockGetRecipeById(...args),
    isCatalogDegraded: () => mockIsCatalogDegraded(),
  },
}));

function selectTopAdaptableCatalogRecipes(catalog: Recipe[], limit = 10): Recipe[] {
  const selected: Recipe[] = [];
  for (const recipe of catalog) {
    if (selected.length >= limit) break;
    try {
      const prepared = prepareAdaptationSource(recipe);
      const allSwapIndices = prepared.candidateSwaps.map((_, idx) => idx);
      const selectedSwaps = prepared.candidateSwaps;
      const rewrittenInstructions = editedChickenInstructions(
        prepared.original.instructions,
        selectedSwaps,
      );
      if (
        rewrittenInstructions.length === 0 ||
        rewrittenInstructions.every(
          (step, idx) => step === prepared.original.instructions[idx],
        )
      ) {
        continue;
      }
      const swappedIngredients = prepared.original.ingredients.map((ing, idx) => {
        const swap = selectedSwaps.find((s) => s.index === idx);
        return swap ? swap.to : ing;
      });
      const gate = verifyRecipeContent(
        {
          ingredients: swappedIngredients.map((i) => ({
            name: i.name,
            quantity: String(i.amount),
            unit: i.unit,
          })),
          steps: rewrittenInstructions.map((instruction) => ({ instruction })),
        },
        { requestedDiet: "vegetarian" },
      );
      if (!gate.valid || allSwapIndices.length === 0) continue;
      const readings = recomputeSavedVersionReadings({
        ingredients: swappedIngredients,
        numberOfServings: recipe.numberOfServings ?? recipe.servingSize ?? 4,
      });
      if (!readings.elementalProperties || !readings.nutritionPerServing) continue;
      selected.push(recipe);
    } catch {
      // Skip recipes that are already vegetarian or contain multi-protein unverified lines
    }
  }
  return selected;
}

describe("Historical Persona Adaptation Catalog Validation (12 Personas × Top 10 Recipes)", () => {
  let topCatalogRecipes: Recipe[] = [];
  const recipeById = new Map<string, Recipe>();

  beforeAll(async () => {
    const catalog = await getServerRecipes();
    topCatalogRecipes = selectTopAdaptableCatalogRecipes(catalog, 10);
    for (const r of topCatalogRecipes) {
      recipeById.set(r.id, r);
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCatalogDegraded.mockReturnValue(false);
    mockPublish.mockResolvedValue(true);
    mockGetRecipeById.mockImplementation(async (id: string) => recipeById.get(id) ?? null);
  });

  it("identifies 10 adaptable seed catalog recipes and all 12 canonical vegetarian personas", () => {
    expect(SUPPORTED_ADAPTATION_AGENTS).toHaveLength(12);
    expect(topCatalogRecipes).toHaveLength(10);
  });

  it("validates elemental balances, macro readings, and instruction clarity across all 120 persona-recipe pairs", async () => {
    let validatedPairs = 0;

    for (let agentIdx = 0; agentIdx < SUPPORTED_ADAPTATION_AGENTS.length; agentIdx += 1) {
      const agentSlug = SUPPORTED_ADAPTATION_AGENTS[agentIdx];
      if (!agentSlug) continue;

      for (let recipeIdx = 0; recipeIdx < topCatalogRecipes.length; recipeIdx += 1) {
        const recipe = topCatalogRecipes[recipeIdx];
        if (!recipe) continue;

        const prepared = prepareAdaptationSource(recipe);
        const swapIndices = prepared.candidateSwaps.map((_, idx) => idx);
        const supportedInstructions = editedChickenInstructions(
          prepared.original.instructions,
          prepared.candidateSwaps,
        );

        mockQuery.mockImplementation((sql: string, args: unknown[]) => {
          if (sql.includes("FROM users u")) {
            return Promise.resolve({
              rows: [
                {
                  id: ACTOR_ID,
                  name: agentSlug,
                  natal_positions: PLACEMENTS,
                  natal_chart: null,
                  dietary_preferences: PREFERENCES,
                },
              ],
            });
          }
          if (sql.includes("INSERT INTO user_custom_recipes")) {
            return Promise.resolve({
              rows: [
                {
                  id: args[0],
                  user_id: args[1],
                  source_recipe_id: args[5],
                  payload: JSON.parse(String(args[6])),
                },
              ],
            });
          }
          if (sql.includes("SELECT EXISTS")) {
            return Promise.resolve({ rows: [{ present: true }] });
          }
          if (sql.includes("FROM user_custom_recipes")) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        });

        mockChat.mockResolvedValueOnce({
          status: "live",
          metadata: { aiGenerated: true },
          providerAgentId: agentSlug,
          content: JSON.stringify({
            selectedSwapIndices: swapIndices,
            instructions: supportedInstructions,
            usedPlacementIndices: [0],
            usedPreferenceKeys: ["dietaryPhilosophy"],
            explanation: `Adapted ${recipe.name} for ${agentSlug} using verified plant proteins.`,
          }),
        });

        const hexAgent = (agentIdx + 1).toString(16).padStart(2, "0");
        const hexRecipe = (recipeIdx + 1).toString(16).padStart(2, "0");
        const clientRequestId = `${hexAgent}${hexRecipe}0000-1111-4111-8111-111111111111`;

        const result = await createSavedAdaptation("catalog-validator", recipe.id, {
          agentSlug,
          mode: "vegetarian",
          clientRequestId,
        });

        expect(result.success).toBe(true);
        expect(result.version.receipt.actor.slug).toBe(agentSlug);
        expect(result.version.receipt.verification.valid).toBe(true);
        expect(result.version.recipe.instructions.length).toBeGreaterThan(0);
        for (const step of result.version.recipe.instructions) {
          expect(step.trim().length).toBeGreaterThan(10);
        }

        const readings = recomputeSavedVersionReadings({
          ingredients: result.version.recipe.ingredients,
          numberOfServings:
            result.version.recipe.numberOfServings ?? recipe.servingSize ?? 4,
        });

        expect(readings.elementalProperties).not.toBeNull();
        if (readings.elementalProperties) {
          const { Fire, Water, Earth, Air } = readings.elementalProperties;
          expect(Number.isFinite(Fire)).toBe(true);
          expect(Number.isFinite(Water)).toBe(true);
          expect(Number.isFinite(Earth)).toBe(true);
          expect(Number.isFinite(Air)).toBe(true);
          expect(Fire + Water + Earth + Air).toBeGreaterThan(0);
        }

        expect(readings.nutritionPerServing).not.toBeNull();
        if (readings.nutritionPerServing) {
          expect(readings.nutritionPerServing.calories).toBeGreaterThan(0);
          expect(readings.nutritionPerServing.protein).toBeGreaterThanOrEqual(0);
          expect(readings.nutritionPerServing.carbs).toBeGreaterThanOrEqual(0);
          expect(readings.nutritionPerServing.fat).toBeGreaterThanOrEqual(0);
        }

        validatedPairs += 1;
      }
    }

    expect(validatedPairs).toBe(120);
  });
});
