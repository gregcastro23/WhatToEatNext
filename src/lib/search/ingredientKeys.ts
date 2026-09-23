/**
 * Free text → catalog ingredient key.
 *
 * Order: the text itself names a catalog ingredient exactly (folded or
 * stemmed, by name or key); else the ingredient-index resolver cleans it
 * ("fresh baby spinach leaves" → spinach) and its slug is mapped onto the
 * catalog; else a synonym term.
 */
import { INGREDIENT_SYNONYMS } from "./synonyms";
import { normalizeText } from "./text";
import type { IngredientKeyResolver } from "./recipeIngredientIndex";
import type { IngredientRecord } from "./types";

/** The ingredient-index resolver's signature: text → index slug (not always a catalog key). */
export type IndexSlugResolver = (text: string) => string | null;

function addForms(map: Map<string, string>, text: string, key: string): void {
  const { folded, stemmed } = normalizeText(text);
  for (const form of [folded, stemmed]) {
    if (form && !map.has(form)) map.set(form, key);
  }
}

function exactFormMap(ingredients: readonly IngredientRecord[]): Map<string, string> {
  const map = new Map<string, string>();
  // Names first so a name wins over another ingredient's key spelling.
  for (const { key, name } of ingredients) addForms(map, name, key);
  for (const { key } of ingredients) addForms(map, key.replace(/_/g, " "), key);
  for (const { term, canonical } of INGREDIENT_SYNONYMS) addForms(map, term, canonical);
  return map;
}

function lookup(forms: Map<string, string>, text: string): string | null {
  const { folded, stemmed } = normalizeText(text);
  return forms.get(folded) ?? forms.get(stemmed) ?? null;
}

export function buildIngredientKeyResolver(
  ingredients: readonly IngredientRecord[],
  resolveIndexSlug: IndexSlugResolver,
): IngredientKeyResolver {
  const forms = exactFormMap(ingredients);
  const memo = new Map<string, string | null>();
  return (text) => {
    const cached = memo.get(text);
    if (cached !== undefined) return cached;
    const direct = lookup(forms, text);
    const slug = direct === null ? resolveIndexSlug(text) : null;
    const key = direct ?? (slug === null ? null : lookup(forms, slug.replace(/_/g, " ")));
    memo.set(text, key);
    return key;
  };
}
