import { z } from "zod";
import type { Recipe } from "@/types/recipe";
import { adaptRecipe } from "@/utils/dietaryAdaptation";
import { classifyIngredientDiet } from "@/utils/ingredientDietaryClassification";
import {
  AdaptationUnavailable,
  contentHash,
  type AdaptationAgentBasis,
} from "./adaptationAgentBasis";
import { checkBoundedInstructions, supportedChickenSwap } from "./adaptationInstructions";
import {
  AdaptationIngredientSchema,
  AdaptationRecipeSchema,
  type AdaptationRecipe,
  type SavedAdaptation,
} from "./savedAdaptationSchemas";

type IngredientChange =
  SavedAdaptation["receipt"]["changes"]["ingredients"][number];
export interface PreparedAdaptationSource {
  original: AdaptationRecipe;
  candidateSwaps: IngredientChange[];
  originalHash: string;
}
export interface AppliedAdaptation {
  recipe: AdaptationRecipe;
  changes: SavedAdaptation["receipt"]["changes"];
  usedPlacementIndices: number[];
  usedPreferenceKeys: string[];
  explanation: string;
}

export function prepareAdaptationSource(
  recipe: Recipe,
): PreparedAdaptationSource {
  const original = AdaptationRecipeSchema.parse(recipe);
  const candidateSwaps = adaptRecipe(recipe, "vegetarian")
    .swaps.map((swap) => ({
      index: swap.index,
      from: AdaptationIngredientSchema.parse(swap.from),
      // Whitelisting discards old ingredient IDs, ASINs and preparation metadata.
      to: AdaptationIngredientSchema.parse(swap.to),
    }))
    .filter((swap) => supportedChickenSwap(swap) && classifyIngredientDiet(swap.from).isVegetarian === "non-compliant");
  if (candidateSwaps.length === 0)
    throw new AdaptationUnavailable(
      "No supported vegetarian ingredient change is available for this recipe. The current recipe remains a preview.",
    );
  return { original, candidateSwaps, originalHash: contentHash(original) };
}

const ProposalSchema = z.object({
  selectedSwapIndices: z.array(z.number().int().nonnegative()).min(1),
  instructions: z.array(z.string().trim().min(1).max(4000)).min(1).max(100),
  usedPlacementIndices: z.array(z.number().int().nonnegative()).min(1),
  usedPreferenceKeys: z.array(z.string().min(1)).min(1),
  explanation: z.string().trim().min(1).max(2000),
});

function readProposal(
  content: string,
  source: PreparedAdaptationSource,
): z.infer<typeof ProposalSchema> {
  let raw: unknown;
  try {
    raw = JSON.parse(content);
  } catch {
    throw new AdaptationUnavailable(
      "The agent returned an unreadable adaptation proposal. No version was saved.",
    );
  }
  const proposal = ProposalSchema.parse(raw);
  if (
    new Set(proposal.selectedSwapIndices).size !==
      proposal.selectedSwapIndices.length ||
    proposal.instructions.length !== source.original.instructions.length
  ) {
    throw new AdaptationUnavailable(
      "The agent returned an unsupported adaptation shape. No version was saved.",
    );
  }
  return proposal;
}

function checkEvidence(
  proposal: z.infer<typeof ProposalSchema>,
  basis: AdaptationAgentBasis,
): void {
  const meaningfulPreferenceKeys = Object.entries(basis.preferences.values)
    .filter(
      ([, value]) =>
        typeof value === "string" || (Array.isArray(value) && value.length > 0),
    )
    .map(([key]) => key);
  if (
    proposal.usedPlacementIndices.some(
      (i) => basis.chart.placements[i] === undefined,
    ) ||
    proposal.usedPreferenceKeys.some(
      (key) => !meaningfulPreferenceKeys.includes(key),
    )
  ) {
    throw new AdaptationUnavailable(
      "The proposal cited unavailable chart or preference evidence. No version was saved.",
    );
  }
}

export function applyAdaptationProposal(
  content: string,
  source: PreparedAdaptationSource,
  basis: AdaptationAgentBasis,
): AppliedAdaptation {
  const proposal = readProposal(content, source);
  checkEvidence(proposal, basis);
  const changes = proposal.selectedSwapIndices.map((index) => {
    const swap = source.candidateSwaps[index];
    if (!swap)
      throw new AdaptationUnavailable(
        "The proposal selected an unavailable ingredient change.",
      );
    return swap;
  });
  const ingredients = source.original.ingredients.map(
    (ingredient, index) =>
      changes.find((c) => c.index === index)?.to ?? ingredient,
  );
  const instructions = source.original.instructions.flatMap((from, index) => {
    const to = proposal.instructions[index];
    return to !== undefined && from !== to ? [{ index, from, to }] : [];
  });
  if (instructions.length === 0)
    throw new AdaptationUnavailable(
      "The proposal did not edit the preparation instructions. No version was saved.",
    );
  checkBoundedInstructions(source.original.instructions, proposal.instructions, changes);
  return {
    recipe: {
      ...source.original,
      ingredients,
      instructions: proposal.instructions,
    },
    changes: { ingredients: changes, instructions },
    usedPlacementIndices: proposal.usedPlacementIndices,
    usedPreferenceKeys: proposal.usedPreferenceKeys,
    explanation: proposal.explanation,
  };
}
