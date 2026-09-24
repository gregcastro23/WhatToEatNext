/**
 * Containment matching for the ingredient → recipe index: the index slug a
 * free-text input names when the input is not itself a slug or an alias
 * ("fresh pandan leaves", "garlic cloves"). ./ingredientRecipeIndex builds the
 * alias table; this module decides which of the names in the input wins.
 */

/**
 * Which index slugs a caller can use. The omnibar accepts only slugs that map
 * onto a catalog card, because it drops any other slug.
 */
export type SlugFilter = (slug: string) => boolean;

/** Input (normalized) → the slug it names by containment, or null. */
export type ContainmentMatcher = (input: string, accepts: SlugFilter) => string | null;

/**
 * Words that name a portion of another ingredient rather than an ingredient:
 * "garlic cloves", "4 cloves garlic", "juice of 1 lemon", "thyme sprigs".
 * Basis: a clove is one segment of a garlic bulb, juice is the liquid pressed
 * from the fruit named with it, and heads, sprigs, stalks and leaves are how
 * a vegetable or herb is counted. "cloves" (the spice) and "juice" are index
 * slugs, so a portion word still resolves when it is the only name in the
 * text ("ground cloves"), but it never wins against another name.
 */
const PORTION_WORDS = new Set([
  "clove", "cloves", "juice", "head", "heads", "sprig", "sprigs",
  "stalk", "stalks", "leaf", "leaves",
]);

/**
 * Heads that make "<ingredient> <head>" a product of its own: neither the
 * ingredient nor the plain head. Basis: the index carries almond, cashew and
 * sunflower-seed butter as slugs distinct from the nut and from dairy butter,
 * so "peanut butter", which has no slug, is not peanuts and not butter.
 */
const PRODUCT_HEADS = new Set(["butter"]);

interface AliasTable {
  aliases: ReadonlyMap<string, string>;
  maxTokens: number;
}

interface AliasMatch {
  alias: string;
  slug: string;
  /** Token span [start, end) in the input. */
  start: number;
  end: number;
}

/**
 * Plural → singular for the last word of an input span, so "juice of 2
 * lemons" meets the alias "lemon". Plural endings only: "salted" must not
 * become "salt", and "oranges" must meet "orange", not "orang".
 */
function singularSpan(span: string): string {
  if (span.length <= 3 || /(ss|us)$/.test(span)) return span;
  if (span.endsWith("ies")) return `${span.slice(0, -3)}y`;
  if (/(oes|ches|shes|xes)$/.test(span)) return span.slice(0, -2);
  return span.endsWith("s") ? span.slice(0, -1) : span;
}

/** Every alias the input holds as whole words, with its span. */
function aliasMatches(input: string, { aliases, maxTokens }: AliasTable): AliasMatch[] {
  const tokens = input.split(" ");
  const matches: AliasMatch[] = [];
  for (let start = 0; start < tokens.length; start++) {
    const last = Math.min(tokens.length, start + maxTokens);
    for (let end = start + 1; end <= last; end++) {
      const alias = tokens.slice(start, end).join(" ");
      const slug = aliases.get(alias) ?? aliases.get(singularSpan(alias));
      if (slug !== undefined) matches.push({ alias, slug, start, end });
    }
  }
  return matches;
}

function isInside(inner: AliasMatch, outer: AliasMatch): boolean {
  return outer !== inner && outer.start <= inner.start && outer.end >= inner.end;
}

/** Drop each product head and the name right before it ("peanut butter"). */
function withoutProducts(matches: readonly AliasMatch[]): AliasMatch[] {
  const heads = matches.filter((m) => PRODUCT_HEADS.has(m.alias) && matches.some((p) => p.end === m.start));
  return matches.filter((m) => !heads.some((head) => head === m || head.start === m.end));
}

/**
 * The slug an input names by containment. Rules, in order:
 *   0. Slugs the caller cannot use drop out ("ground beef" → beef for the
 *      omnibar, which has no ground-beef card).
 *   1. A name inside a longer name drops out ("fresh pandan leaves").
 *   2. Portion words yield to any other name ("garlic cloves" → garlic).
 *   3. A product head and the name before it drop out ("peanut butter").
 *   4. The longest remaining name wins; on equal length the rightmost, since
 *      the last noun heads the phrase ("garlic chives" → chives).
 */
function containedSlug(input: string, table: AliasTable, accepts: SlugFilter): string | null {
  const all = aliasMatches(input, table).filter((m) => accepts(m.slug));
  const outer = all.filter((m) => !all.some((o) => isInside(m, o)));
  const named = outer.filter((m) => !PORTION_WORDS.has(m.alias));
  const kept = withoutProducts(named.length > 0 ? named : outer);
  const best = kept.reduce<AliasMatch | null>(
    (top, m) => (top === null || m.alias.length >= top.alias.length ? m : top),
    null,
  );
  return best?.slug ?? null;
}

/** A matcher over `aliases`: normalized alias → index slug, matched as whole tokens. */
export function containmentMatcher(aliases: ReadonlyMap<string, string>): ContainmentMatcher {
  const maxTokens = Math.max(...Array.from(aliases.keys(), (alias) => alias.split(" ").length));
  const table: AliasTable = { aliases, maxTokens };
  return (input, accepts) => containedSlug(input, table, accepts);
}
