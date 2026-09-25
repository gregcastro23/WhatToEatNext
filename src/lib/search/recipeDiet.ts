/**
 * A recipe's vegan and vegetarian verdicts, derived from its ingredients with
 * the canonical classifier (utils/ingredientDietaryClassification; plan §1
 * row 9: recipe flags are unusable, so don't write a fourth derivation).
 *
 * Rule, shown to the user as the basis: every ingredient line, and every
 * catalog card the line names, must be compliant; the worst verdict wins
 * (non-compliant, then unknown). Both are read because each catches what the
 * other misses: the line "salt cod" resolves to Salt, and the card Pecorino
 * Romano is dairy though its name has no dairy word. Each side of an "X or Y"
 * line counts, so "butter or olive oil" keeps a recipe out of vegan.
 */
import { classifyIngredientDiet, type DietaryVerdict } from "@/utils/ingredientDietaryClassification";
import { keysForLine, type IngredientKeyResolver } from "./recipeIngredientIndex";
import type { DietVerdicts } from "./types";

const SEVERITY: Record<DietaryVerdict, number> = { compliant: 0, unknown: 1, "non-compliant": 2 };

function worse(a: DietaryVerdict, b: DietaryVerdict): DietaryVerdict {
  return SEVERITY[b] > SEVERITY[a] ? b : a;
}

function combine(a: DietVerdicts, b: DietVerdicts): DietVerdicts {
  return { vegan: worse(a.vegan, b.vegan), vegetarian: worse(a.vegetarian, b.vegetarian) };
}

const COMPLIANT: DietVerdicts = { vegan: "compliant", vegetarian: "compliant" };
const NO_EVIDENCE: DietVerdicts = { vegan: "unknown", vegetarian: "unknown" };

export type RecipeDietDeriver = (lines: readonly string[]) => DietVerdicts;

/** One deriver per index build; line verdicts are memoized, since lines repeat across recipes. */
export function createRecipeDietDeriver(keyOf: IngredientKeyResolver, cardDiet: (key: string) => DietVerdicts | undefined): RecipeDietDeriver {
  const lineMemo = new Map<string, DietVerdicts>();
  const lineDiet = (line: string): DietVerdicts => {
    const cached = lineMemo.get(line);
    if (cached) return cached;
    const own = classifyIngredientDiet({ name: line });
    let verdicts: DietVerdicts = { vegan: own.isVegan, vegetarian: own.isVegetarian };
    for (const key of keysForLine(line, keyOf).keys) verdicts = combine(verdicts, cardDiet(key) ?? NO_EVIDENCE);
    lineMemo.set(line, verdicts);
    return verdicts;
  };
  // A recipe with no lines has no evidence either way.
  return (lines) => (lines.length === 0 ? NO_EVIDENCE : lines.map(lineDiet).reduce(combine, COMPLIANT));
}
