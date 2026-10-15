import { AdaptationUnavailable } from "./adaptationAgentBasis";
import type { SavedAdaptation } from "./savedAdaptationSchemas";

type IngredientChange = SavedAdaptation["receipt"]["changes"]["ingredients"][number];
const chickenLabel = /^(?:(?:boneless|skinless|skin-on)\s+)*chicken(?:\s+(?:breasts?|thighs?))?$/i;
const chickenMention = /\b(?:(?:boneless|skinless|skin-on)\s+)*chicken(?:\s+(?:breasts?|thighs?))?\b/gi;

/** This first saved slice supports one known swap, never arbitrary prose edits. */
export function supportedChickenSwap(change: IngredientChange): boolean {
  return chickenLabel.test(change.from.name) && change.to.name === "firm tofu";
}

export function editedChickenInstructions(
  original: string[],
  changes: IngredientChange[],
): string[] {
  if (changes.length !== 1 || !changes[0] || !supportedChickenSwap(changes[0]))
    throw new AdaptationUnavailable("This recipe needs an unsupported preparation edit. No version was saved.");
  if (original.some(step => /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+chicken\b|\bchicken\s+of\s+the\s+woods\b/i.test(step)))
    throw new AdaptationUnavailable("The preparation contains an ambiguous chicken reference. No version was saved.");
  return original.map(step => step.replace(chickenMention, "firm tofu"));
}

export function checkBoundedInstructions(
  original: string[],
  instructions: string[],
  changes: IngredientChange[],
): void {
  const expected = editedChickenInstructions(original, changes);
  if (instructions.some((step, index) => step !== expected[index]))
    throw new AdaptationUnavailable("The proposal changed preparation beyond the supported ingredient substitution. No version was saved.");
  if (expected.every((step, index) => step === original[index]))
    throw new AdaptationUnavailable("The source has no supported ingredient references in its instructions. No version was saved.");
}
