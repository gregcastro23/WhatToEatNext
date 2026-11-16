/**
 * Reads one recipe ingredient name as a Baking Lab vector id, or says why it
 * cannot be one.
 *
 * The name is normalised before the rules see it: accents folded, the
 * parenthetical and anything after a comma dropped ("butter, softened"), and
 * only the FIRST of "a or b" alternatives kept — the recipe's own first
 * choice, reported as an assumption when an alternative was set aside.
 *
 * @file src/lib/baking/recipes/matchIngredient.ts
 */
import { INGREDIENT_RULES, NO_VECTOR, type MatchOutcome } from "./ingredientRules";

export interface IngredientMatch {
  /** The name the rules read. */
  normalised: string;
  outcome: MatchOutcome;
  /** The alternatives the recipe offered after its first choice ("or shortcrust pastry"). */
  setAside: readonly string[];
}

/** Words that describe the state of an ingredient, never which ingredient it is. */
const DESCRIPTORS =
  /\b(softened|melted|cold|chilled|room[- ]temperature|warm|lukewarm|hot|boiling|cool|cooled|sifted|un-?sifted|packed|lightly packed|firmly packed|fresh(?!\s+yeast)|freshly|pure|organic|large|extra[- ]large|medium|small|jumbo|beaten|lightly beaten|whisked|divided|plus more|for dusting|cubed|diced|grated|unsalted|salted|good quality|high quality|fine|finely|level(l)?ed|spooned|scooped|heaping|chopped|minced|sliced|shredded|crushed|toasted|mashed|halved|quartered|roughly|coarsely|thinly|peeled|pitted|seeded)\b/g;

function foldAccents(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "");
}

/** The ingredient words of a recipe line's name, lower-case, without state words or asides. */
export function normaliseName(name: string): { normalised: string; setAside: string[] } {
  const base = foldAccents(name.toLowerCase())
    .replace(/\([^)]*\)/g, " ")
    .replace(/[,;].*$/, " ")
    .replace(/[’']/g, "")
    .replace(/[*"]/g, " ");
  const [first = "", ...rest] = base.split(/\s+or\s+/);
  const clean = (s: string): string => s.replace(DESCRIPTORS, " ").replace(/\s+/g, " ").trim();
  return { normalised: clean(first), setAside: rest.map(clean).filter((s) => s.length > 0) };
}

/** The first rule that reads this name, or the stated miss. */
export function matchIngredient(name: string): IngredientMatch {
  const { normalised, setAside } = normaliseName(name);
  const rule = normalised.length === 0 ? undefined : INGREDIENT_RULES.find((r) => r.pattern.test(normalised));
  const outcome: MatchOutcome = rule === undefined ? { kind: "unmatched", reason: NO_VECTOR, structural: false } : rule.outcome;
  return { normalised, outcome, setAside };
}
