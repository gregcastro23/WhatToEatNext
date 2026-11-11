import { AdaptationUnavailable } from "./adaptationAgentBasis";
import type { SavedAdaptation } from "./savedAdaptationSchemas";

type IngredientChange = SavedAdaptation["receipt"]["changes"]["ingredients"][number];

interface VerifiedSubstitutionRule {
  fromLabel: RegExp;
  toName: string;
  mention: RegExp;
  ambiguous: RegExp;
}

const VERIFIED_VEGETARIAN_SUBSTITUTIONS: readonly VerifiedSubstitutionRule[] = [
  {
    fromLabel: /^(?:(?:boneless|skinless|skin-on|whole|medium|airline)\s+)*chicken(?:\s+(?:breasts?|thighs?|wings?|drumsticks?|legs?))?$/i,
    toName: "firm tofu",
    mention: /\b(?:(?:boneless|skinless|skin-on|whole|medium|airline)\s+)*chicken(?:\s+(?:breasts?|thighs?|wings?|drumsticks?|legs?))?\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+chicken\b|\bchicken\s+of\s+the\s+woods\b/i,
  },
  {
    fromLabel: /^(?:lean\s+)?ground\s+(?:beef|pork|turkey|chicken|meat)$/i,
    toName: "crumbled tempeh",
    mention: /\b(?:lean\s+)?ground\s+(?:beef|pork|turkey|chicken|meat)\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+ground\s+(?:beef|pork|turkey|chicken|meat)\b/i,
  },
  {
    fromLabel: /^(?:(?:boneless|cubed|thinly|sliced)\s+)*(?:beef(?:\s+(?:chuck|sirloin|tenderloin|strips?|shank|ribeye|flank|brisket))?|steak|brisket)$/i,
    toName: "seitan",
    mention: /\b(?:(?:boneless|cubed|thinly|sliced)\s+)*(?:beef(?:\s+(?:chuck|sirloin|tenderloin|strips?|shank|ribeye|flank|brisket))?|steak|brisket)\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+(?:beef|steak)\b|\bbeefsteak\s+(?:tomato(?:es)?|mushroom(?:s)?)\b/i,
  },
  {
    fromLabel: /^(?:(?:boneless|diced|sliced)\s+)*(?:pork(?:\s+(?:loin|chops?|tenderloin|shoulder|belly))?|bacon|ham)$/i,
    toName: "smoked tempeh",
    mention: /\b(?:(?:boneless|diced|sliced)\s+)*(?:pork(?:\s+(?:loin|chops?|tenderloin|shoulder|belly))?|bacon|ham)\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based|turkey|coconut|tempeh)\s+(?:pork|bacon|ham)\b/i,
  },
  {
    fromLabel: /^(?:(?:boneless|cubed|diced|sliced)\s+)*(?:lamb(?:\s+(?:shoulder|chops?|leg|shank))?|duck|turkey)$/i,
    toName: "jackfruit",
    mention: /\b(?:(?:boneless|cubed|diced|sliced)\s+)*(?:lamb(?:\s+(?:shoulder|chops?|leg|shank))?|duck|turkey)\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+(?:lamb|duck|turkey)\b/i,
  },
  {
    fromLabel: /^(?:(?:fresh|wild|skinless)\s+)*(?:salmon|cod|tuna|fish)(?:\s+fillets?)?$/i,
    toName: "marinated tofu",
    mention: /\b(?:(?:fresh|wild|skinless)\s+)*(?:salmon|cod|tuna|fish)(?:\s+fillets?)?\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+(?:salmon|cod|tuna|fish)\b|\bfish\s+(?:sauce|peppers?)\b/i,
  },
  {
    fromLabel: /^(?:(?:peeled|deveined|raw|large)\s+)*(?:shrimp|prawns?)$/i,
    toName: "hearts of palm",
    mention: /\b(?:(?:peeled|deveined|raw|large)\s+)*(?:shrimp|prawns?)\b/gi,
    ambiguous: /\b(?:vegan|mock|vegetarian|plant[- ]based)\s+(?:shrimp|prawns?)\b|\bshrimp\s+paste\b/i,
  },
];

function findVerifiedRule(change: IngredientChange): VerifiedSubstitutionRule | undefined {
  return VERIFIED_VEGETARIAN_SUBSTITUTIONS.find(
    (rule) => rule.fromLabel.test(change.from.name) && change.to.name === rule.toName,
  );
}

/** Checks whether an ingredient change matches a verified vegetarian substitution rule. */
export function supportedChickenSwap(change: IngredientChange): boolean {
  return findVerifiedRule(change) !== undefined;
}

export function editedChickenInstructions(
  original: string[],
  changes: IngredientChange[],
): string[] {
  if (changes.length === 0)
    throw new AdaptationUnavailable("This recipe needs an unsupported preparation edit. No version was saved.");
  const matchedRules = changes.map((change) => {
    const rule = findVerifiedRule(change);
    if (!rule)
      throw new AdaptationUnavailable("This recipe needs an unsupported preparation edit. No version was saved.");
    return rule;
  });
  for (const rule of matchedRules) {
    if (original.some((step) => rule.ambiguous.test(step)))
      throw new AdaptationUnavailable("The preparation contains an ambiguous chicken reference. No version was saved.");
  }
  return original.map((step) =>
    matchedRules.reduce((acc, rule) => acc.replace(rule.mention, rule.toName), step),
  );
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
