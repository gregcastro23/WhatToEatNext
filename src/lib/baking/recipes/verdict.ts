/**
 * Whether a converted recipe can be baked honestly by the 1D simulator — and
 * if not, every reason, so the lab shows why instead of producing numbers.
 *
 * The unread-mass threshold is the repo's own ruled nutrition gate
 * (src/utils/nutritionCompleteness.ts, owner ruling 2026-09-26): at most 10 %
 * of a recipe's known mass may be unresolved, and no unresolved line may be
 * of unknown mass.
 *
 * @file src/lib/baking/recipes/verdict.ts
 */
import { bakingIngredient } from "@/data/baking";
import { MAX_UNRESOLVED_MASS_SHARE } from "@/utils/nutritionCompleteness";
import type { ReadLines } from "./readLines";
import type { GoodCategory, Verdict } from "./sourceTypes";

const REFUSED_CATEGORY: Readonly<Partial<Record<GoodCategory, string>>> = {
  pastry: "a pastry: its laminated, layered or filled dough is several materials, and the simulator bakes one homogeneous batter",
  "pie-tart": "a pie or tart: a crust and its filling are two materials, and the simulator bakes one homogeneous batter",
};

function lineName(line: { amount: number; unit: string; name: string }): string {
  return `${line.amount} ${line.unit} ${line.name}`.replace(/\s+/g, " ").trim();
}

/** Unread mass ÷ (read + unread); null when any unread line's mass is unknown. */
export function unreadMassShare(read: ReadLines): number | null {
  if (read.unmatched.some((u) => u.grams === null)) return null;
  const unread = read.unmatched.reduce((sum, u) => sum + (u.grams ?? 0), 0);
  const known = read.matched.reduce((sum, m) => sum + m.grams, 0) + unread;
  return known > 0 ? unread / known : null;
}

/** A matched line that can set a crumb: a flour or starch whose starch gelatinizes, or a gluten former. */
export function setsStructure(vectorId: string): boolean {
  const i = bakingIngredient(vectorId);
  return i.category === "flour_grain" && ((i.starchPct > 5 && i.gelatinizationTempC !== null) || i.glutenPotency > 0);
}

function massReasons(read: ReadLines, share: number | null): string[] {
  const unknown = read.unmatched.filter((u) => u.grams === null && !u.structural);
  if (unknown.length > 0) return [`the mass of ${unknown.map((u) => `"${lineName(u.source)}"`).join(", ")} is unknown, so how much of the recipe is unread cannot be bounded`];
  if (share !== null && share > MAX_UNRESOLVED_MASS_SHARE) {
    const pct = (share * 100).toFixed(0);
    return [`${pct} % of the recipe's mass has no vector (${read.unmatched.map((u) => u.source.name).join(", ")}): over the ${MAX_UNRESOLVED_MASS_SHARE * 100} % the lab accepts`];
  }
  return [];
}

/** A name joining two dishes ("con", "with", "e", "and")… */
const JOINER = /\s(con|with|e|and|&)\s/i;
/** …one of which is not baked into the other: the recipe lists both in one ingredient list. */
const COMPANION = /\b(granita|gelato|ice cream|panna|whipped cream|marmellata|marmalade|jam|cappuccino|coffee|compote|sauce|salad|soup|dressing)\b/i;

const CRUST_ONLY = "a crust made to hold a filling: it is pressed or rolled against a pan's walls and baked blind, which a 1D slab does not model";

/** Every reason the good cannot be simulated; an empty list means it can. */
export function verdictFor(category: GoodCategory, read: ReadLines, share: number | null, shapeRefusal: string | null, name = ""): Verdict {
  const reasons: string[] = [];
  const crustOnly = category === "pie-tart" && /\bcrusts?\b/i.test(name) && !/\b(pies?|tarts?|quiche)\b/i.test(name);
  const refused = crustOnly ? CRUST_ONLY : REFUSED_CATEGORY[category];
  if (refused !== undefined) reasons.push(refused);
  const companion = JOINER.test(name) ? COMPANION.exec(name) : null;
  if (companion !== null) reasons.push(`served with ${companion[0].toLowerCase()}: the recipe lists both in one ingredient list without marking which lines are the baked good`);
  for (const u of read.unmatched.filter((x) => x.structural)) reasons.push(`its structure, "${lineName(u.source)}", cannot be read: ${u.reason}`);
  if (!read.matched.some((m) => setsStructure(m.vectorId))) reasons.push("no flour or starch that sets a crumb was matched");
  reasons.push(...massReasons(read, share));
  if (shapeRefusal !== null) reasons.push(shapeRefusal);
  return reasons.length === 0 ? { simulable: true } : { simulable: false, reasons };
}
