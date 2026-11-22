/**
 * Containment matching for the ingredient → recipe index: the index slug a
 * free-text input names when the input is not itself a slug or an alias
 * ("fresh pandan leaves", "garlic cloves", "peanut butter").
 * ./ingredientRecipeIndex builds the alias table; this module decides which of
 * the names in the input wins and whether it is a derived product.
 */
import {
  DERIVED_GAP_BLOCKERS,
  DERIVED_HEAD_SET,
  NON_DERIVED_HEAD_MODIFIERS,
} from "@/lib/search/derivedHeads";

/**
 * Which index slugs a caller can use. The omnibar accepts only slugs that map
 * onto a catalog card, because it drops any other slug.
 */
export type SlugFilter = (slug: string) => boolean;

export interface ContainmentMatch {
  slug: string;
  derived: boolean;
}

/** Input (normalized) → the slug it names by containment, or null. */
export type ContainmentMatcher = (input: string, accepts: SlugFilter) => string | null;

/** Detailed containment match carrying whether the line names a derived product. */
export type ContainmentDetailMatcher = (input: string, accepts: SlugFilter) => ContainmentMatch | null;

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

const CLAUSE_SPLIT = /[,;()/]/;

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

function tokenizeClauses(input: string): { tokens: string[]; tokenClause: number[] } {
  const tokens: string[] = [];
  const tokenClause: number[] = [];
  const clauses = input.split(CLAUSE_SPLIT);
  for (let clauseIdx = 0; clauseIdx < clauses.length; clauseIdx++) {
    const raw = clauses[clauseIdx] ?? "";
    for (const token of raw.trim().split(/\s+/)) {
      if (!token) continue;
      tokens.push(token);
      tokenClause.push(clauseIdx);
    }
  }
  return { tokens, tokenClause };
}

/** Every alias the input holds as whole words inside one clause, with its span. */
function aliasMatches(
  tokens: readonly string[],
  tokenClause: readonly number[],
  { aliases, maxTokens }: AliasTable,
): AliasMatch[] {
  const matches: AliasMatch[] = [];
  for (let start = 0; start < tokens.length; start++) {
    const last = Math.min(tokens.length, start + maxTokens);
    for (let end = start + 1; end <= last; end++) {
      if (tokenClause[end - 1] !== tokenClause[start]) break;
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

function hasDerivedHead(token: string, derivedHeads: ReadonlySet<string>): boolean {
  return derivedHeads.has(token) || derivedHeads.has(singularSpan(token));
}

function isDerivedBase(match: AliasMatch, derivedHeads: ReadonlySet<string>): boolean {
  if (NON_DERIVED_HEAD_MODIFIERS.has(match.alias)) return false;
  const parts = match.alias.split(" ");
  const tail = parts[parts.length - 1] ?? "";
  return !hasDerivedHead(tail, derivedHeads);
}

function findBaseBefore(
  pool: readonly AliasMatch[],
  tokens: readonly string[],
  tokenClause: readonly number[],
  headIndex: number,
  derivedHeads: ReadonlySet<string>,
): AliasMatch | undefined {
  const headClause = tokenClause[headIndex];
  const valid = (m: AliasMatch): boolean =>
    tokenClause[m.end - 1] === headClause && isDerivedBase(m, derivedHeads);
  const direct = pool.find((m) => m.end === headIndex && valid(m));
  if (direct) return direct;
  if (headIndex < 2) return undefined;
  const gap = tokens[headIndex - 1] ?? "";
  if (tokenClause[headIndex - 1] !== headClause || DERIVED_GAP_BLOCKERS.has(gap)) return undefined;
  return pool.find((m) => m.end === headIndex - 1 && valid(m));
}

/**
 * Attribute "<ingredient> <derived head>" (e.g. "peanut butter", "corn flour",
 * "shrimp stock") to the base ingredient with `derived: true` and suppress the
 * bare head token when it is itself a catalog match ("butter", "flour").
 */
function applyDerivedHeads(
  pool: readonly AliasMatch[],
  tokens: readonly string[],
  tokenClause: readonly number[],
  derivedHeads: ReadonlySet<string>,
): { kept: AliasMatch[]; derivedMatches: ReadonlySet<AliasMatch> } {
  const suppressedHeads = new Set<number>();
  const derivedMatches = new Set<AliasMatch>();
  for (let h = 0; h < tokens.length; h++) {
    const token = tokens[h] ?? "";
    if (!hasDerivedHead(token, derivedHeads)) continue;
    // A dedicated multi-token card ("almond butter", "chicken stock") already owns the head.
    if (pool.some((m) => m.start < h && m.end > h)) continue;
    const base = findBaseBefore(pool, tokens, tokenClause, h, derivedHeads);
    if (!base) continue;
    suppressedHeads.add(h);
    derivedMatches.add(base);
  }
  const kept = pool.filter((m) => !(m.end - m.start === 1 && suppressedHeads.has(m.start)));
  return { kept, derivedMatches };
}

/**
 * The slug an input names by containment. Rules, in order:
 *   0. Slugs the caller cannot use drop out ("ground beef" → beef for the
 *      omnibar, which has no ground-beef card).
 *   1. A name inside a longer name drops out ("fresh pandan leaves").
 *   2. Portion words yield to any other name ("garlic cloves" → garlic).
 *   3. A base ingredient directly before a derived head ("peanut butter",
 *      "corn flour", "shrimp stock") suppresses the bare head and resolves
 *      as `derived: true`; dedicated compound cards ("almond butter") win as non-derived.
 *   4. The longest remaining name wins; on equal length the rightmost, since
 *      the last noun heads the phrase ("garlic chives" → chives).
 */
function containedMatch(
  input: string,
  table: AliasTable,
  derivedHeads: ReadonlySet<string>,
  accepts: SlugFilter,
): ContainmentMatch | null {
  const { tokens, tokenClause } = tokenizeClauses(input);
  const all = aliasMatches(tokens, tokenClause, table).filter((m) => accepts(m.slug));
  const outer = all.filter((m) => !all.some((o) => isInside(m, o)));
  const named = outer.filter((m) => !PORTION_WORDS.has(m.alias));
  const pool = named.length > 0 ? named : outer;
  const { kept, derivedMatches } = applyDerivedHeads(pool, tokens, tokenClause, derivedHeads);
  const best = kept.reduce<AliasMatch | null>(
    (top, m) => (top === null || m.alias.length >= top.alias.length ? m : top),
    null,
  );
  return best ? { slug: best.slug, derived: derivedMatches.has(best) } : null;
}

/** A detailed matcher over `aliases`: normalized alias → index slug plus `derived`. */
export function containmentDetailMatcher(
  aliases: ReadonlyMap<string, string>,
  derivedHeads: ReadonlySet<string> = DERIVED_HEAD_SET,
): ContainmentDetailMatcher {
  const maxTokens = Math.max(...Array.from(aliases.keys(), (alias) => alias.split(" ").length));
  const table: AliasTable = { aliases, maxTokens };
  return (input, accepts) => containedMatch(input, table, derivedHeads, accepts);
}

/** A matcher over `aliases`: normalized alias → index slug, matched as whole tokens. */
export function containmentMatcher(aliases: ReadonlyMap<string, string>): ContainmentMatcher {
  const match = containmentDetailMatcher(aliases);
  return (input, accepts) => match(input, accepts)?.slug ?? null;
}
