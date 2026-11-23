/**
 * Free text → catalog ingredient key(s).
 *
 * Order: the text itself names a catalog ingredient exactly (folded, stemmed,
 * or punctuation-split); else Ruling 15 parentheses handling (outside decides,
 * gloss only when outside names no card), applying curated false-compound
 * aliases (Ruling 8), class heads (Ruling 5), hyphen compounds (Ruling 11),
 * index containment + derived heads (Rulings 1, 2, 4), meat cuts (Ruling 7),
 * plural catalog derived fallback, and synonyms.
 */
import type { ContainmentMatch } from "@/data/ingredientContainment";
import {
  DERIVED_HEAD_SET,
  isDerivedHead,
  NON_DERIVED_HEAD_MODIFIERS,
} from "./derivedHeads";
import {
  extractParentheses,
  matchClassHead,
  matchFalseCompound,
  matchMeatCut,
  stripParentheses,
} from "./lineRulings";
import { INGREDIENT_SYNONYMS } from "./synonyms";
import { normalizeText } from "./text";
import type {
  IngredientKeyResolver,
  ResolvedIngredientKey,
} from "./recipeIngredientIndex";
import type { IngredientRecord } from "./types";

/**
 * The ingredient-index resolver's signature: text → index slug (or match with
 * `derived`). Index slugs are not all catalog cards, so the resolver is told
 * which slugs to accept.
 */
export type IndexSlugResolver = (
  text: string,
  accepts: (slug: string) => boolean,
) => string | ContainmentMatch | null;

const CLAUSE_SPLIT = /[,;()/]/;
const HYPHEN_COMPOUND = /^(.*?\b)([a-zA-Z\u00C0-\u024F]+)-([a-zA-Z\u00C0-\u024F]+)(\b.*)$/;
const DERIVED_DESCRIPTOR_STOPWORDS = new Set([
  "fresh", "dried", "frozen", "raw", "cooked", "ground", "whole",
  "plain", "unsalted", "salted", "sweet", "warm", "hot", "cold",
  "small", "medium", "large", "chopped", "minced", "sliced", "diced",
]);

function singularToken(token: string): string {
  if (token.length <= 3 || /(ss|us)$/.test(token)) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (/(oes|ches|shes|xes)$/.test(token)) return token.slice(0, -2);
  return token.endsWith("s") ? token.slice(0, -1) : token;
}

function singularPhrase(folded: string): string {
  const parts = folded.split(" ");
  const last = parts[parts.length - 1];
  if (!last) return folded;
  parts[parts.length - 1] = singularToken(last);
  return parts.join(" ");
}

function addForms(map: Map<string, string>, text: string, key: string): void {
  const { folded, stemmed } = normalizeText(text);
  for (const form of [folded, stemmed]) {
    if (form && !map.has(form)) map.set(form, key);
  }
}

function addPluralForms(map: Map<string, string>, text: string, key: string): void {
  const { folded } = normalizeText(text);
  if (!folded) return;
  if (!map.has(folded)) map.set(folded, key);
  const sing = singularPhrase(folded);
  if (sing && !map.has(sing)) map.set(sing, key);
}

function buildLookupTables(ingredients: readonly IngredientRecord[]): {
  exactForms: Map<string, string>;
  pluralForms: Map<string, string>;
} {
  const exactForms = new Map<string, string>();
  const pluralForms = new Map<string, string>();
  const feed = (text: string, key: string): void => {
    addForms(exactForms, text, key);
    addPluralForms(pluralForms, text, key);
  };
  // Names first so a name wins over another ingredient's key spelling.
  for (const { key, name } of ingredients) feed(name, key);
  for (const { key } of ingredients) feed(key.replace(/_/g, " "), key);
  for (const { key, aliases } of ingredients) aliases.forEach((alias) => feed(alias.replace(/_/g, " "), key));
  for (const { term, canonical } of INGREDIENT_SYNONYMS) feed(term, canonical);
  return { exactForms, pluralForms };
}

const PUNCT_TO_SPACE = /[^a-z0-9\s]+/g;

function lookup(forms: ReadonlyMap<string, string>, text: string): string | null {
  const { folded, stemmed } = normalizeText(text);
  return forms.get(folded) ?? forms.get(stemmed) ?? null;
}

function lookupExact(forms: ReadonlyMap<string, string>, text: string): string | null {
  const direct = lookup(forms, text);
  if (direct !== null) return direct;
  const ascii = text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const punctFolded = normalizeText(ascii.replace(PUNCT_TO_SPACE, " ")).folded;
  return punctFolded ? (forms.get(punctFolded) ?? null) : null;
}

function pluralLookup(pluralForms: ReadonlyMap<string, string>, text: string): string | null {
  const { folded } = normalizeText(text);
  if (!folded) return null;
  return pluralForms.get(folded) ?? pluralForms.get(singularPhrase(folded)) ?? null;
}

function normalizeMatch(raw: string | ContainmentMatch | null): ContainmentMatch | null {
  if (raw === null) return null;
  return typeof raw === "string" ? { slug: raw, derived: false } : raw;
}

function resolveCatalogDerived(
  text: string,
  pluralForms: ReadonlyMap<string, string>,
): ResolvedIngredientKey | null {
  for (const clause of text.split(CLAUSE_SPLIT)) {
    const { tokens } = normalizeText(clause);
    for (let h = 1; h < tokens.length; h++) {
      const head = tokens[h] ?? "";
      if (!isDerivedHead(head)) continue;
      for (const len of [2, 1]) {
        if (h < len) continue;
        const span = tokens.slice(h - len, h).join(" ");
        if (NON_DERIVED_HEAD_MODIFIERS.has(span) || DERIVED_DESCRIPTOR_STOPWORDS.has(span)) continue;
        const last = tokens[h - 1] ?? "";
        if (isDerivedHead(last)) continue;
        const key = pluralLookup(pluralForms, span);
        if (key !== null && !DERIVED_HEAD_SET.has(key)) return { key, derived: true };
      }
    }
  }
  return null;
}

function deduplicateEntries(entries: readonly ResolvedIngredientKey[]): ResolvedIngredientKey[] {
  const byKey = new Map<string, boolean>();
  for (const entry of entries) {
    const prior = byKey.get(entry.key);
    byKey.set(entry.key, prior === undefined ? entry.derived : prior && entry.derived);
  }
  return [...byKey].map(([key, derived]) => ({ key, derived }));
}

function resolveHyphenCompound(
  text: string,
  pluralForms: ReadonlyMap<string, string>,
  resolveSingle: (input: string) => ResolvedIngredientKey | null,
): readonly ResolvedIngredientKey[] | null {
  const match = text.match(HYPHEN_COMPOUND);
  if (!match) return null;
  const [, , leftWord = "", rightWord = "", suffix = ""] = match;
  if (isDerivedHead(leftWord) || NON_DERIVED_HEAD_MODIFIERS.has(leftWord.toLowerCase())) return null;
  const leftKey = pluralLookup(pluralForms, leftWord);
  if (leftKey === null) return null;

  const suffixTokens = normalizeText(suffix).tokens;
  const hasDerivedTail = suffixTokens.some((token) => isDerivedHead(token));
  const rightWordKey = pluralLookup(pluralForms, rightWord);
  const rightFull = resolveSingle(`${rightWord}${suffix}`);

  if (rightWordKey !== null) {
    const suffixCard = suffixTokens.length > 0 && !hasDerivedTail ? resolveSingle(suffix) : null;
    if (suffixCard !== null) return null;
    const derived = hasDerivedTail || suffixTokens.length > 0;
    const leftFull = resolveSingle(`${leftWord}${suffix}`);
    return deduplicateEntries([
      leftFull ? { key: leftFull.key, derived: leftFull.derived || derived } : { key: leftKey, derived },
      rightFull ? { key: rightFull.key, derived: rightFull.derived || derived } : { key: rightWordKey, derived },
    ]);
  }
  if (rightFull !== null && hasDerivedTail) {
    return deduplicateEntries([{ key: leftKey, derived: true }, rightFull]);
  }
  return null;
}

interface ResolverEnv {
  exactForms: ReadonlyMap<string, string>;
  pluralForms: ReadonlyMap<string, string>;
  validKeys: ReadonlySet<string>;
  resolveSingle: (text: string) => ResolvedIngredientKey | null;
}

interface BodyResolution {
  suppressed: boolean;
  entries: readonly ResolvedIngredientKey[];
}

function resolveBody(text: string, env: ResolverEnv): BodyResolution {
  const direct = lookupExact(env.exactForms, text);
  if (direct !== null) return { suppressed: false, entries: [{ key: direct, derived: false }] };

  const fc = matchFalseCompound(text);
  if (fc !== null) {
    if (fc.target === null || !env.validKeys.has(fc.target)) {
      return { suppressed: true, entries: [] };
    }
    return { suppressed: false, entries: [{ key: fc.target, derived: false }] };
  }

  const ch = matchClassHead(text);
  if (ch !== null && env.validKeys.has(ch.winner)) {
    return { suppressed: false, entries: [{ key: ch.winner, derived: false }] };
  }

  const compound = resolveHyphenCompound(text, env.pluralForms, env.resolveSingle);
  if (compound !== null) return { suppressed: false, entries: compound };

  const single = env.resolveSingle(text);
  if (single !== null) return { suppressed: false, entries: [single] };

  const cut = matchMeatCut(text);
  if (cut !== null && env.validKeys.has(cut.target)) {
    return { suppressed: false, entries: [{ key: cut.target, derived: false }] };
  }

  return { suppressed: false, entries: [] };
}

function resolveWithParens(text: string, env: ResolverEnv): readonly ResolvedIngredientKey[] {
  const direct = lookupExact(env.exactForms, text);
  if (direct !== null) return [{ key: direct, derived: false }];
  if (!text.includes("(") && !text.includes(")")) return resolveBody(text, env).entries;

  const outside = stripParentheses(text);
  if (outside) {
    const out = resolveBody(outside, env);
    if (out.suppressed || out.entries.length > 0) return out.entries;
  }
  for (const inside of extractParentheses(text)) {
    const res = resolveBody(inside, env);
    if (res.suppressed || res.entries.length > 0) return res.entries;
  }
  return [];
}

/** Exact names only (name, key, alias, synonym; folded or stemmed): the intent parser's lookup. */
export function buildExactIngredientLookup(ingredients: readonly IngredientRecord[]): (text: string) => string | null {
  const { exactForms } = buildLookupTables(ingredients);
  return (text) => lookup(exactForms, text);
}

export function buildIngredientKeyResolver(
  ingredients: readonly IngredientRecord[],
  resolveIndexSlug: IndexSlugResolver,
): IngredientKeyResolver {
  const { exactForms, pluralForms } = buildLookupTables(ingredients);
  const validKeys = new Set(ingredients.map((entry) => entry.key));
  const cardOf = (slug: string): string | null => lookup(exactForms, slug.replace(/_/g, " "));
  // A slug with no card ("ground_beef") is skipped, so the text can reach the card it names (beef).
  const isCard = (slug: string): boolean => cardOf(slug) !== null;

  const resolveSingle = (text: string): ResolvedIngredientKey | null => {
    const direct = lookup(exactForms, text);
    if (direct !== null) return { key: direct, derived: false };
    const match = normalizeMatch(resolveIndexSlug(text, isCard));
    if (match === null) return resolveCatalogDerived(text, pluralForms);
    const key = cardOf(match.slug);
    if (key !== null && (match.derived || !DERIVED_HEAD_SET.has(key))) {
      return { key, derived: match.derived };
    }
    return resolveCatalogDerived(text, pluralForms) ?? (key === null ? null : { key, derived: false });
  };

  const env: ResolverEnv = { exactForms, pluralForms, validKeys, resolveSingle };
  const memo = new Map<string, readonly ResolvedIngredientKey[]>();
  return (text) => {
    const cached = memo.get(text);
    if (cached !== undefined) return cached;
    const result = resolveWithParens(text, env);
    memo.set(text, result);
    return result;
  };
}
