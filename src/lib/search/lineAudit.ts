/**
 * Probe for the reverse index: the card(s) each recipe line resolves to, and
 * whether that card is the head of the line's noun phrase.
 *
 * It is an independent witness for ./ingredientKeys. It finds card names in a
 * line with its own whole-word scan of catalog names, keys, aliases and
 * synonyms, not through the resolver. Adjacency is judged inside one clause
 * (commas, parentheses and slashes end a clause).
 *
 * Flags (one line can carry several):
 *   unit-word  the card is a counting word (cloves, heads, sprigs, stalks,
 *              leaves) and another card is named next to it: "garlic cloves"
 *              resolved to cloves.
 *   generic    the card is a generic head and another card's name modifies
 *              it: "lemon juice" or "juice of 1 lemon" resolved to juice.
 *   modifier   the card's name is directly followed by another card's name,
 *              other than a portion word (or a derived head/hyphen peer when
 *              the resolver marked the key derived), so it modifies that noun:
 *              "jalapeno pepper" → jalapeno (for review, not always wrong).
 */
import { isDerivedHead } from "./derivedHeads";
import { keysForLine, type IngredientKeyResolver } from "./recipeIngredientIndex";
import { INGREDIENT_SYNONYMS } from "./synonyms";
import { normalizeText } from "./text";
import type { IngredientRecord } from "./types";

export type LineFlag = "unit-word" | "generic" | "modifier";

export interface LineAudit {
  line: string;
  keys: readonly string[];
  derived: readonly string[];
  flags: readonly LineFlag[];
}

export interface LineAuditSummary {
  lines: number;
  unresolved: number;
  derived: number;
  flagged: Record<LineFlag, number>;
}

type Role = "unit" | "generic" | "other";

interface Span {
  key: string;
  start: number;
  end: number;
}

interface Clause {
  tokens: readonly string[];
  spans: readonly Span[];
}

interface Catalog {
  forms: ReadonlyMap<string, string>;
  maxTokens: number;
  roles: ReadonlyMap<string, Role>;
}

interface FlagContext {
  role: Role;
  span: Span;
  clause: Clause;
  isDerived: boolean;
  keySet: ReadonlySet<string>;
  hyphenPairs: ReadonlySet<string>;
}

/**
 * Plural folding only ("tomatoes" → "tomato", "cloves" → "clove"). The search
 * stemmer also strips "-ed", which would read "salted butter" as "salt butter".
 */
function singular(token: string): string {
  if (token.length <= 3 || /(ss|us)$/.test(token)) return token;
  if (token.endsWith("ies")) return `${token.slice(0, -3)}y`;
  if (/(oes|ches|shes|xes)$/.test(token)) return token.slice(0, -2);
  return token.endsWith("s") ? token.slice(0, -1) : token;
}

const stem = (text: string): string => normalizeText(text.replace(/_/g, " ")).tokens.map(singular).join(" ");

const UNIT_STEMS = new Set(["cloves", "heads", "sprigs", "stalks", "leaf", "leaves"].map(stem));
/** A card name after one of these is a portion of the card before it ("lemon juice"). */
const PORTION_STEMS = new Set([...UNIT_STEMS, stem("juice")]);
/**
 * One-word cards that name a class other cards specialize (olive oil, rice
 * flour, chicken stock, oat milk, brown sugar, rice vinegar, sea salt, black
 * pepper, almond butter), plus powder, which has no card of its own.
 */
const GENERIC_STEMS = new Set(
  ["juice", "oil", "powder", "flour", "water", "stock", "broth", "milk", "sugar", "vinegar", "salt", "pepper", "butter"].map(stem),
);
const SOURCE_WORDS = new Set(["of", "from"]);
const CLAUSE_SPLIT = /[,;()/]/;
const HYPHEN_PAIR = /\b([a-z]+)-([a-z]+)\b/g;

function nameForms(ingredients: readonly IngredientRecord[]): Map<string, string> {
  const forms = new Map<string, string>();
  const add = (text: string, key: string): void => {
    const form = stem(text);
    if (form !== "" && !forms.has(form)) forms.set(form, key);
  };
  for (const { key, name } of ingredients) add(name, key);
  for (const { key } of ingredients) add(key, key);
  for (const { key, aliases } of ingredients) aliases.forEach((alias) => add(alias, key));
  for (const { term, canonical } of INGREDIENT_SYNONYMS) add(term, canonical);
  return forms;
}

function roleOf(name: string): Role {
  const form = stem(name);
  if (UNIT_STEMS.has(form)) return "unit";
  return GENERIC_STEMS.has(form) ? "generic" : "other";
}

function buildCatalog(ingredients: readonly IngredientRecord[]): Catalog {
  const forms = nameForms(ingredients);
  const roles = new Map(ingredients.map(({ key, name }): [string, Role] => [key, roleOf(name)]));
  const maxTokens = Math.max(...Array.from(forms.keys(), (form) => form.split(" ").length));
  return { forms, maxTokens, roles };
}

/** Card names in the clause as whole-token runs; a name inside a longer one drops out. */
function spansIn(tokens: readonly string[], catalog: Catalog): Span[] {
  const all: Span[] = [];
  for (let start = 0; start < tokens.length; start++) {
    const last = Math.min(tokens.length, start + catalog.maxTokens);
    for (let end = start + 1; end <= last; end++) {
      const key = catalog.forms.get(tokens.slice(start, end).join(" "));
      if (key !== undefined) all.push({ key, start, end });
    }
  }
  return all.filter((s) => !all.some((o) => o !== s && o.start <= s.start && o.end >= s.end));
}

function clausesOf(line: string, catalog: Catalog): Clause[] {
  return line.split(CLAUSE_SPLIT).map((text) => {
    const tokens = stem(text).split(" ").filter(Boolean);
    return { tokens, spans: spansIn(tokens, catalog) };
  });
}

function hyphenJoinedPairs(line: string): Set<string> {
  const folded = line.toLowerCase().normalize("NFKD").replace(/\p{M}/gu, "");
  const pairs = new Set<string>();
  for (const match of folded.matchAll(HYPHEN_PAIR)) {
    const left = singular(match[1] ?? "");
    const right = singular(match[2] ?? "");
    if (left && right) pairs.add(`${left}-${right}`);
  }
  return pairs;
}

function isDerivedHeadSpan(clause: Clause, after: Span): boolean {
  const tail = clause.tokens[after.end - 1] ?? "";
  return isDerivedHead(tail);
}

function isClearedByDerived({ span, clause, isDerived, keySet, hyphenPairs }: FlagContext, after: Span): boolean {
  if (!isDerived) return false;
  if (isDerivedHeadSpan(clause, after)) return true;
  const left = clause.tokens[span.end - 1] ?? "";
  const right = clause.tokens[after.start] ?? "";
  return keySet.has(after.key) && hyphenPairs.has(`${left}-${right}`);
}

function flagFor(ctx: FlagContext): LineFlag | null {
  const { role, span, clause } = ctx;
  const others = clause.spans.filter((s) => s.key !== span.key);
  const before = others.some((s) => s.end === span.start);
  const after = others.find((s) => s.start === span.end);
  const afterIsPortion = after !== undefined && PORTION_STEMS.has(clause.tokens.slice(after.start, after.end).join(" "));
  const source =
    SOURCE_WORDS.has(clause.tokens[span.end] ?? "") && others.some((s) => s.start > span.end && s.start <= span.end + 3);
  if (role === "unit") return before || after !== undefined || source ? "unit-word" : null;
  if (role === "generic") return before || source ? "generic" : null;
  if (after === undefined || afterIsPortion || isClearedByDerived(ctx, after)) return null;
  return "modifier";
}

/** Audits one recipe line at a time against the catalog and the resolver. */
export function createLineAuditor(
  ingredients: readonly IngredientRecord[],
  keyOf: IngredientKeyResolver,
): (line: string) => LineAudit {
  const catalog = buildCatalog(ingredients);
  return (line) => {
    const { keys, derived } = keysForLine(line, keyOf);
    const keySet = new Set(keys);
    const derivedSet = new Set(derived);
    const clauses = clausesOf(line, catalog);
    const hyphenPairs = hyphenJoinedPairs(line);
    const flags = new Set<LineFlag>();
    for (const key of keys) {
      const role = catalog.roles.get(key) ?? "other";
      const isDerived = derivedSet.has(key);
      for (const clause of clauses) {
        for (const span of clause.spans.filter((s) => s.key === key)) {
          const flag = flagFor({ role, span, clause, isDerived, keySet, hyphenPairs });
          if (flag !== null) flags.add(flag);
        }
      }
    }
    return { line, keys, derived, flags: [...flags] };
  };
}

export function summarizeLineAudits(audits: readonly LineAudit[]): LineAuditSummary {
  const flagged: Record<LineFlag, number> = { "unit-word": 0, generic: 0, modifier: 0 };
  for (const { flags } of audits) flags.forEach((flag) => (flagged[flag] += 1));
  return {
    lines: audits.length,
    unresolved: audits.filter((a) => a.keys.length === 0).length,
    derived: audits.filter((a) => a.derived.length > 0).length,
    flagged,
  };
}
