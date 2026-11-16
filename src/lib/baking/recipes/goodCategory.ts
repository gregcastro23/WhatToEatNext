/**
 * Which kind of baked good a recipe is — read from its NAME first, in an
 * order where the specific word wins ("cheesecake" is a pie or tart before it
 * is a cake, "gingerbread muffins" a muffin before a bread), then from the
 * formula when the name says nothing.
 *
 * The category picks the process profile (pan, density, done temperature),
 * and refuses the goods a 1D homogeneous-batter model cannot bake honestly:
 * pastry and pie/tart.
 *
 * @file src/lib/baking/recipes/goodCategory.ts
 */
import { bakingIngredient } from "@/data/baking";
import type { MatchedLine, GoodCategory } from "./sourceTypes";

const NAME_RULES: ReadonlyArray<[RegExp, GoodCategory]> = [
  [/\b(pies?|tarts?|tartlets?|tarte|quiche|galette|crostata|cobbler|crumble|cheesecake|crusts?)\b/, "pie-tart"],
  [/\b(croissants?|cornetto|danish|puff|profiteroles?|eclairs?|choux|strudel|baklava|phyllo|filo|bougatsa|galaktoboureko|tiropita|spanakopita|kunafa|knafeh|kanafeh|rugelach|mille[- ]feuille|pirozhki|empanadas?|samosas?|turnovers?|sochnik|vatrushka|triangles)\b/, "pastry"],
  [/\b(crackers?|rusks?|paximadia|biscotti|biscottate)\b/, "cracker"],
  [/\b(muffins?|cupcakes?)\b/, "muffin"],
  [/\b(biscuits?|scones?|shortcake)\b/, "biscuit-scone"],
  [/\b(cookies?|shortbread|amaretti|kourabiedes|pryaniki|tuiles?|macaroons?|snaps|linzer|thumbprints?|madeleines?)\b/, "cookie"],
  [/\b(brownies?|bars|blondies?|flapjacks?)\b/, "bar"],
  [/\b(pizzas?|focaccia|pitas?|naan|flatbreads?|manakish|manaeesh|fougasse|lavash|pizza dough)\b/, "flatbread"],
  [/\b(brioche|challah|panettone|kulich|vischanka|maritozzo|sticky buns?|cinnamon rolls?|babka|stollen|sweet rolls?|apple ring|spice loaf ring)\b/, "enriched-bread"],
  [/\b(cakes?|genoise|sponge|medovik|basbousa|malva pudding|gateau|torte)\b/, "cake"],
  [/\b(quick bread|soda bread|cornbread|corn bread|banana bread|zucchini bread|pumpkin bread|breakfast bread|tea loaf)\b/, "quick-bread"],
  [/\b(breads?|loaf|loaves|rolls?|bagels?|pretzels?|baguettes?|boules?|ciabatta|sourdough|buns?)\b/, "bread"],
];

/** The category a recipe's name states, or null. */
export function categoryFromName(name: string): GoodCategory | null {
  const n = name.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  return NAME_RULES.find(([pattern]) => pattern.test(n))?.[1] ?? null;
}

interface FormulaShape {
  flour: number;
  enrichment: number;
  sugar: number;
  fermented: boolean;
  chemical: boolean;
}

function shapeOf(matched: readonly MatchedLine[]): FormulaShape {
  const shape: FormulaShape = { flour: 0, enrichment: 0, sugar: 0, fermented: false, chemical: false };
  for (const line of matched) {
    const i = bakingIngredient(line.vectorId);
    shape.flour += line.grams * i.flourShare;
    if (i.category === "fat_lipid" || i.category === "egg_binder") shape.enrichment += line.grams;
    if (i.category === "sugar_sweetener") {
      shape.sugar += line.grams;
      shape.enrichment += line.grams;
    }
    if (i.leavening?.kind === "biological") shape.fermented = true;
    if (i.leavening?.kind === "bicarbonate" || i.leavening?.kind === "complete") shape.chemical = true;
  }
  return shape;
}

/**
 * DECLARED: a yeasted dough whose fat, egg and sugar reach a fifth of its
 * flour weight is read as enriched (the lab's line between lean and rich).
 */
export const ENRICHED_RATIO = 0.2;

function fromFormula(s: FormulaShape): GoodCategory | null {
  if (s.flour <= 0) return null;
  if (s.fermented) return s.enrichment / s.flour >= ENRICHED_RATIO ? "enriched-bread" : "bread";
  return s.chemical ? "quick-bread" : null;
}

/**
 * The category a recipe's name states, refined by its formula: a "bread" is
 * lean or enriched by its fat, egg and sugar, and one with no yeast but a
 * chemical leavener is a quick bread. A name that names no baked good gives
 * null — the formula alone never makes a dish a baked good (selectSources.ts).
 */
export function classifyGood(name: string, matched: readonly MatchedLine[]): GoodCategory | null {
  const named = categoryFromName(name);
  if (named === null) return null;
  if (named !== "bread" && named !== "enriched-bread") return named;
  const shape = shapeOf(matched);
  if (!shape.fermented) return shape.chemical ? "quick-bread" : named;
  return fromFormula(shape) === "enriched-bread" ? "enriched-bread" : named;
}
