/**
 * Reads every ingredient line of a recipe into one of three piles — matched
 * (a vector and its grams), unmatched (a stated reason, and its mass where
 * anything measured knows it), or set aside (not part of the batter) — and
 * collects the assumptions each reading made. No line is dropped silently.
 *
 * @file src/lib/baking/recipes/readLines.ts
 */
import { bakingIngredient } from "@/data/baking";
import { basisOf } from "@/data/baking/basis";
import { matchedLineGrams, unmatchedLineGrams } from "./lineGrams";
import { matchIngredient } from "./matchIngredient";
import { readUnit } from "./units";
import { setsStructure } from "./verdict";
import type { Assumption, MatchedLine, SetAsideLine, SourceLine, UnmatchedLine } from "./sourceTypes";

export interface ReadLines {
  matched: MatchedLine[];
  unmatched: UnmatchedLine[];
  setAside: SetAsideLine[];
  assumptions: Assumption[];
}

const PURPOSE = "(brush(ing)?|tops?|topping|dust(ing)?|garnish(ing)?|serv(e|ing)|glaz(e|ing)|frosting|icing|filling|pans?|greas(e|ing)|sprinkl(e|ing)|finish(ing)?|decorat\\w*|drizzl\\w*|rolling|coating|egg wash|sauce|syrup|custard|caramel|soak(ing)?)";
/** "for brushing" in the line's NAME, or opening its NOTE: the whole line serves that purpose. */
const NAME_PURPOSE = new RegExp(`\\b(for|to)\\s+(the\\s+)?${PURPOSE}\\b`, "i");
const LEADING_PURPOSE = new RegExp(`^\\s*(for|to)\\s+(the\\s+)?${PURPOSE}\\b`, "i");
/**
 * A component other than the batter, named by a line's NAME. Not "icing" or "syrup" here:
 * "icing sugar" and "maple syrup" are batter ingredients.
 */
const NAME_COMPONENT = /\b(frostings?|glazes?|fillings?|toppings?|egg wash|garnish(es)?)\b/i;
/**
 * The same, named by a NOTE — which may also name an after-bake sauce or soak, but only as a
 * component ("for the sauce", "into the syrup"): a note saying "maple syrup preferred" names the line itself.
 */
const NOTE_COMPONENT = /\b(frostings?|icings?|glazes?|fillings?|toppings?|egg wash|garnish(es)?)\b|\b(for|in|into|of) the (sauce|syrup|custard|caramel|soak\w*)\b/i;
/** A seasoning the catalogue served as "1 piece" — the static loader's fill for a missing amount. */
const UNQUANTIFIED_SEASONING = /\b(salt|pepper|peppercorns?|spices?|herbs?|zest|nutmeg|cinnamon|cardamom|cloves|allspice|vanilla|(sesame|poppy|caraway|anise|fennel)\s+seeds?)\b/i;

function pieceAside(line: SourceLine): string | null {
  const unit = line.unit.trim();
  if (/^(jars?|pieces?)$/i.test(unit) && /\b(jam|preserves)\b/i.test(line.name)) return "a jam or preserves filling/topping, not the cookie dough";
  if (!/^pieces?$/i.test(unit)) return null;
  if (/\bvanilla beans?\b/i.test(line.name)) return "a vanilla bean pod scraped for its seeds (a trace aromatic)";
  if (line.amount !== 1) return null;
  if (/^\s*up to\b/i.test(line.name)) return "an as-needed adjustment (\"up to…\"), not a fixed batter quantity";
  if (UNQUANTIFIED_SEASONING.test(line.name)) return "a seasoning with no amount (served as \"1 piece\", the catalogue's fill for a missing amount)";
  return null;
}

/** Why a line is not part of the batter, or null when it is. */
export function setAsideReason(line: SourceLine): string | null {
  const notes = line.notes ?? "";
  if (line.optional || /^\s*optional\b/i.test(notes)) return "marked optional by the recipe";
  const named = NAME_PURPOSE.exec(line.name) ?? LEADING_PURPOSE.exec(notes);
  if (named !== null) return `used outside the batter ("${named[0].trim()}")`;
  // "Plus extra for the glaze" or "2 for the dough, 1 for the wash": most of the line is in the batter.
  const shared = /\bplus\b|\b(dough|batter)\b/i.test(notes);
  const component = NAME_COMPONENT.exec(line.name) ?? (shared ? null : NOTE_COMPONENT.exec(notes));
  if (component !== null) return `part of another component ("${component[0].toLowerCase()}"), not the batter`;
  if (readUnit(line.unit).kind === "trace" || /^\s*(a |large )?(pinch|dash)\b/i.test(line.name)) return "a trace amount (a pinch or dash names no quantity)";
  return pieceAside(line);
}

function label(line: SourceLine): string {
  return `${line.amount} ${line.unit} ${line.name}`.replace(/\s+/g, " ").trim();
}

function readOne(line: SourceLine, out: ReadLines): void {
  const aside = setAsideReason(line);
  if (aside !== null) {
    out.setAside.push({ source: line, reason: aside });
    return;
  }
  const primary = matchIngredient(line.name);
  const match = primary.normalised.length === 0 && line.notes ? matchIngredient(`${line.name} ${line.notes}`) : primary;
  if (match.setAside.length > 0) {
    out.assumptions.push({ field: label(line), value: `"${match.normalised}"`, basis: basisOf("DECLARED", "MODEL", `the recipe's first choice is read; set aside: ${match.setAside.map((a) => `"${a}"`).join(", ")}`) });
  }
  const { outcome } = match;
  if (outcome.kind === "unmatched") {
    const mass = unmatchedLineGrams(line, match.normalised);
    out.unmatched.push({ source: line, reason: outcome.reason, structural: outcome.structural, grams: mass?.grams ?? null, bound: mass?.bound ?? false });
    return;
  }
  const vector = bakingIngredient(outcome.vectorId);
  const grams = matchedLineGrams(line, outcome.vectorId);
  if (!grams.ok) {
    const mass = unmatchedLineGrams(line, match.normalised);
    out.unmatched.push({ source: line, reason: `${vector.name}: ${grams.reason}`, structural: setsStructure(outcome.vectorId), grams: mass?.grams ?? null, bound: mass?.bound ?? false });
    return;
  }
  out.matched.push({ source: line, vectorId: outcome.vectorId, grams: grams.grams, basis: grams.basis, how: grams.how });
  if (outcome.note !== null) out.assumptions.push({ field: label(line), value: vector.name, basis: basisOf("DECLARED", "MODEL", outcome.note) });
  if (grams.assumption !== null) out.assumptions.push({ field: label(line), value: `${grams.grams.toFixed(1)} g`, basis: basisOf("DECLARED", "MODEL", grams.assumption) });
  if (grams.basis.kind === "DECLARED") out.assumptions.push({ field: label(line), value: `${grams.grams.toFixed(1)} g`, basis: grams.basis });
}

/** Every line of a recipe, read. */
export function readLines(lines: readonly SourceLine[]): ReadLines {
  const out: ReadLines = { matched: [], unmatched: [], setAside: [], assumptions: [] };
  for (const line of lines) readOne(line, out);
  return out;
}
