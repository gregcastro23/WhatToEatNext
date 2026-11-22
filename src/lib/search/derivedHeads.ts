/**
 * Curated derived-product head nouns for the reverse index (docs/plans/reverse-index-rulings.md
 * Rulings 1, 2, 4, 11, 17).
 *
 * When a recipe line names "<ingredient> <head>" and there is no dedicated card
 * for the whole product (e.g. "peanut butter", "almond flour", "shrimp stock",
 * "cashew cream"), the line is filed under <ingredient> with `derived: true`
 * instead of falling onto a generic head card ("butter", "flour", "water") or
 * dropping out. Dedicated cards ("almond butter", "chicken stock", "rice flour")
 * keep `derived: false`.
 */

export type DerivedHeadGroup = "butter" | "grain" | "liquid" | "condiment" | "stock" | "sauce";

export interface DerivedHead {
  head: string;
  group: DerivedHeadGroup;
  basis: string;
}

export const DERIVED_HEADS: readonly DerivedHead[] = [
  { head: "butter", group: "butter", basis: "Ruling 1–2: nut/plant butters without a dedicated card attribute to the base ingredient (peanut butter → peanuts)" },
  { head: "flour", group: "grain", basis: "Ruling 2: nut, legume, and grain flours without a dedicated card attribute to the base (almond/oat/garbanzo/corn flour)" },
  { head: "meal", group: "grain", basis: "Ruling 2: ground nut and grain meals without a dedicated card attribute to the base (almond meal → almonds)" },
  { head: "starch", group: "grain", basis: "Ruling 2: extracted starches without a dedicated card attribute to the base plant" },
  { head: "milk", group: "liquid", basis: "Ruling 2: plant and nut milks without a dedicated card attribute to the base" },
  { head: "cream", group: "liquid", basis: "Ruling 2: plant and nut creams without a dedicated card attribute to the base (cashew cream → cashews)" },
  { head: "water", group: "liquid", basis: "Ruling 2: infused waters and liquid extracts without a dedicated card attribute to the base (coconut water, orange blossom water)" },
  { head: "oil", group: "condiment", basis: "Ruling 2: infused and pressed oils without a dedicated card attribute to the base (lemon oil, scallion oil, oregano oil)" },
  { head: "vinegar", group: "condiment", basis: "Ruling 2: fermented vinegars without a dedicated card attribute to the base (umeboshi vinegar, rice wine vinegar)" },
  { head: "extract", group: "condiment", basis: "Ruling 2: culinary extracts without a dedicated card attribute to the base (anise extract, banana extract, lemon extract)" },
  { head: "syrup", group: "condiment", basis: "Ruling 2: reduced and malted syrups without a dedicated card attribute to the base (rice syrup, light corn syrup, barley malt syrup)" },
  { head: "stock", group: "stock", basis: "Ruling 4: stocks without a dedicated card attribute to the named protein/vegetable (shrimp stock, anchovy stock, mushroom stock)" },
  { head: "broth", group: "stock", basis: "Ruling 4: broths without a dedicated card attribute to the named protein/vegetable (dashi broth, pork broth)" },
  { head: "sauce", group: "sauce", basis: "Ruling 4: sauces without a dedicated card attribute to the named base (peanut sauce, apple sauce, garlic sauce)" },
  { head: "paste", group: "sauce", basis: "Ruling 4 & 11: pastes without a dedicated card attribute to the named base(s) (ginger paste, ginger-garlic paste, tamarind paste)" },
];

export const DERIVED_HEAD_SET: ReadonlySet<string> = new Set(DERIVED_HEADS.map((entry) => entry.head));

/**
 * Catalog cards that precede a derived head by temperature, preparation, or
 * gloss rather than as the raw substance the product is derived from:
 * - "ice water" is chilled water, not water melted/derived from ice
 * - "white bread flour" is wheat flour for bread, not flour milled from white bread
 * - "nuoc cham dipping sauce" is an English gloss appended to the nuoc cham sauce card
 */
export const NON_DERIVED_HEAD_MODIFIERS: ReadonlySet<string> = new Set([
  "ice",
  "white bread",
  "nuoc cham",
]);

/**
 * Prepositions, conjunctions, and dissolved/packed verbs that separate distinct
 * ingredients in one clause rather than forming a "<base> <modifier> <head>"
 * derived product ("anchovies in oil", "oil and butter", "kuzu dissolved in water").
 */
export const DERIVED_GAP_BLOCKERS: ReadonlySet<string> = new Set([
  "in",
  "with",
  "of",
  "from",
  "to",
  "for",
  "and",
  "or",
  "mixed",
  "dissolved",
  "diluted",
  "packed",
  "soured",
]);

function singularHead(token: string): string {
  if (token.length <= 3 || /(ss|us)$/.test(token)) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (/(oes|ches|shes|xes)$/.test(token)) return token.slice(0, -2);
  return token.endsWith("s") ? token.slice(0, -1) : token;
}

export function isDerivedHead(token: string): boolean {
  const lower = token.trim().toLowerCase();
  return DERIVED_HEAD_SET.has(lower) || DERIVED_HEAD_SET.has(singularHead(lower));
}
