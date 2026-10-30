import { planetaryAgentsGateway } from "@/lib/agents/planetaryAgentsGateway";
import { verifyRecipeContent } from "@/lib/cooking/recipeVerificationGate";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import {
  AdaptationUnavailable,
  contentHash,
  loadAdaptationAgent,
  type AdaptationAgentBasis,
} from "./adaptationAgentBasis";
import {
  applyAdaptationProposal,
  prepareAdaptationSource,
  type AppliedAdaptation,
  type PreparedAdaptationSource,
} from "./adaptationCandidates";
import { editedChickenInstructions } from "./adaptationInstructions";
import {
  adaptationPublication,
  adaptationVersionId,
  checkAdaptationReplay,
  loadSavedAdaptation,
  publishSavedAdaptation,
  saveAdaptation,
} from "./savedAdaptationPersistence";
import {
  SavedAdaptationSchema,
  type AdaptationRequestSchema,
  type AdaptationSuccessSchema,
  type SavedAdaptation,
} from "./savedAdaptationSchemas";
import type { z } from "zod";

interface AdaptationContext {
  id: string;
  recipeId: string;
  requesterId: string;
  requestFingerprint: string;
  source: PreparedAdaptationSource;
  basis: AdaptationAgentBasis;
}

async function reasonAboutAdaptation(
  context: AdaptationContext,
): Promise<AppliedAdaptation> {
  const { source, basis, requesterId, recipeId } = context;
  const gateway = await planetaryAgentsGateway.chatWithAgent({
    agentId: basis.actor.slug,
    userId: requesterId,
    userMessage: `Assess one vegetarian version using the supplied saved chart and preferences. This narrow action allows only the supplied chicken-to-tofu swap with the exact supportedInstructions. Do not change methods, add ingredients or invent amounts, chart placements, ratings, nutrition or scores. If supported by those actual inputs, return JSON only: {"selectedSwapIndices":[0],"instructions":["copy supportedInstructions exactly"],"usedPlacementIndices":[0],"usedPreferenceKeys":["dietaryPhilosophy"],"explanation":"how those actual inputs support the supplied edit"}. Indices refer to the supplied arrays. Data:\n${JSON.stringify({ recipe: source.original, candidateSwaps: source.candidateSwaps, supportedInstructions: editedChickenInstructions(source.original.instructions, source.candidateSwaps), chart: basis.chart.placements, preferences: basis.preferences.values })}`,
    culinaryContext: {
      selectedRecipeId: recipeId,
      ingredients: source.original.ingredients.map((i) => i.name),
      dietPreference: "vegetarian",
      ...(source.original.cuisine ? { cuisine: source.original.cuisine } : {}),
    },
  });
  if (gateway.status !== "live" || gateway.metadata.aiGenerated !== true || gateway.isDormant || gateway.providerAgentId !== basis.actor.slug)
    throw new AdaptationUnavailable(
      "Live adaptation reasoning is unavailable. A fallback reflection is not a saved version.",
    );
  return applyAdaptationProposal(gateway.content, source, basis);
}

function verifyEditedRecipe(
  edited: AppliedAdaptation,
  basis: AdaptationAgentBasis,
): ReturnType<typeof verifyRecipeContent> {
  const gate = verifyRecipeContent(
    {
      ingredients: edited.recipe.ingredients.map((i) => ({
        name: i.name,
        quantity: String(i.amount),
        unit: i.unit,
        ...(i.optional !== undefined ? { optional: i.optional } : {}),
      })),
      steps: edited.recipe.instructions.map((instruction) => ({ instruction })),
    },
    {
      requestedDiet: "vegetarian",
      ...(basis.preferences.values.avoidedFoods
        ? { disallowedIngredients: basis.preferences.values.avoidedFoods }
        : {}),
    },
  );
  if (!gate.valid)
    throw new AdaptationUnavailable(
      `The edited recipe did not pass text screening: ${gate.blockingFindings.map((f) => f.message).join(" ")}`,
    );
  return gate;
}

function buildReceipt(
  context: AdaptationContext,
  edited: AppliedAdaptation,
  gate: ReturnType<typeof verifyRecipeContent>,
  recipe: SavedAdaptation["recipe"],
): SavedAdaptation["receipt"] {
  const { basis, source, recipeId } = context;
  return {
    mode: "vegetarian",
    original: {
      id: recipeId,
      name: source.original.name,
      contentHash: source.originalHash,
    },
    actor: basis.actor,
    basis: {
      chart: basis.chart,
      preferences: basis.preferences,
      usedPlacementIndices: edited.usedPlacementIndices,
      usedPreferenceKeys: edited.usedPreferenceKeys,
    },
    changes: edited.changes,
    contentHash: contentHash(recipe),
    explanation: edited.explanation,
    verification: {
      valid: true,
      verified: gate.verified,
      ...gate.audit,
      notChecked: gate.notChecked,
      advisoryFindings: gate.advisoryFindings,
    },
    readingsUnavailable: ["nutrition", "elemental", "esms", "planetary"],
  };
}

async function generateVersion(
  context: AdaptationContext,
): Promise<SavedAdaptation> {
  const edited = await reasonAboutAdaptation(context);
  const gate = verifyEditedRecipe(edited, context.basis);
  const recipe = {
    ...edited.recipe,
    name: `${context.source.original.name} — ${context.basis.actor.name}'s vegetarian version`,
  };
  return SavedAdaptationSchema.parse({
    kind: "saved-adaptation",
    schemaVersion: 1,
    id: context.id,
    requestFingerprint: context.requestFingerprint,
    recipe,
    receipt: buildReceipt(context, edited, gate, recipe),
  });
}

export async function createSavedAdaptation(
  requesterId: string,
  recipeId: string,
  request: z.infer<typeof AdaptationRequestSchema>,
): Promise<z.infer<typeof AdaptationSuccessSchema>> {
  const id = adaptationVersionId(requesterId, request.clientRequestId);
  const requestFingerprint = contentHash({
    recipeId,
    agentSlug: request.agentSlug,
    mode: request.mode,
  });
  const replay = await loadSavedAdaptation(id);
  if (replay)
    return {
      success: true,
      version: checkAdaptationReplay(replay, requestFingerprint),
      publication: await adaptationPublication(id),
    };
  const recipe = await LocalRecipeService.getRecipeById(recipeId);
  if (!recipe || LocalRecipeService.isCatalogDegraded())
    throw new AdaptationUnavailable(
      "The authoritative source recipe is unavailable. No version was saved.",
    );
  const basis = await loadAdaptationAgent(request.agentSlug);
  const source = prepareAdaptationSource(recipe);
  const version = await generateVersion({
    id,
    recipeId,
    requesterId,
    requestFingerprint,
    source,
    basis,
  });
  const saved = await saveAdaptation(version);
  const publication = saved.inserted
    ? await publishSavedAdaptation(saved.version)
    : await adaptationPublication(saved.version.id);
  return { success: true, version: saved.version, publication };
}
