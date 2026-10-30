/**
 * Ingredient Resolver Normalization — explicit staple synonyms, depluralization,
 * preparation prefix stripping, and meat cut simplification.
 *
 * @file src/lib/cooking/recipeGateResolver.ts
 */

import {
  resolveCatalogIngredient,
  type CatalogIngredient,
} from "@/lib/ingredients/ingredientCatalog";

export const EXPLICIT_INGREDIENT_SYNONYMS: Readonly<Record<string, string>> = {
  egg: "chicken_egg",
  eggs: "chicken_egg",
  shoyu: "soy_sauce",
  "dijon mustard": "mustard",
  dijon: "mustard",
  "rice syrup": "brown_rice_syrup",
  "parmigiano-reggiano": "parmesan",
  "parmigiano reggiano": "parmesan",
};

export const PREPARATION_PREFIXES = new RegExp(
  "\\b(" +
    "extra[\\s-]virgin|virgin|" +
    "freshly[\\s-](?:ground|cracked|grated|squeezed)|freshly|" +
    "pinch(?:\\s+of)?|" +
    "warm|lukewarm|boiling|chilled|ice[\\s-]cold|cold|hot|" +
    "finely[\\s-](?:chopped|minced|diced)|coarsely[\\s-]chopped|thinly[\\s-]sliced|" +
    "fresh|dried|chopped|minced|diced|sliced|crushed|ground|toasted|cooked|large|medium|small|" +
    "raw|organic|pure|unrefined|roasted|peeled|grated|shredded|shaved|melted|softened|" +
    "filtered|fine|blanched|smoked" +
    ")\\b",
  "gi",
);

export const CUT_TERMS =
  /\b(breast|thigh|thighs|wing|wings|drumstick|drumsticks|fillet|filet|cutlet|steak|chops?|roast|tenderloin)\b/gi;

export function depluralizeIngredientName(term: string): string[] {
  const candidates: string[] = [];
  const trimmed = term.trim();
  if (!trimmed) return candidates;
  const words = trimmed.split(/\s+/);
  const lastWord = words[words.length - 1] ?? "";
  const prefix = words.slice(0, -1).join(" ");
  const p = prefix ? `${prefix} ` : "";

  if (lastWord.endsWith("ies") && lastWord.length > 4) {
    candidates.push(`${p}${lastWord.slice(0, -3)}y`);
  } else if (lastWord.endsWith("es") && lastWord.length > 3) {
    candidates.push(`${p}${lastWord.slice(0, -2)}`);
    candidates.push(`${p}${lastWord.slice(0, -1)}`);
  } else if (
    lastWord.endsWith("s") &&
    !lastWord.endsWith("ss") &&
    lastWord.length > 2
  ) {
    candidates.push(`${p}${lastWord.slice(0, -1)}`);
  }
  return candidates;
}

function resolveSynonymOrCandidates(name: string): CatalogIngredient | null {
  const mappedKey = EXPLICIT_INGREDIENT_SYNONYMS[name];
  if (mappedKey !== undefined) {
    const mapped = resolveCatalogIngredient(mappedKey);
    if (mapped) return mapped.entry;
  }
  for (const cand of depluralizeIngredientName(name)) {
    const hit = resolveCatalogIngredient(cand);
    if (hit) return hit.entry;
  }
  return null;
}

function resolveStrippedPrefixes(name: string): CatalogIngredient | null {
  if (name.includes("gluten-free") || name.includes("gluten free")) return null;
  const stripped = name
    .replace(PREPARATION_PREFIXES, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped || stripped === name) return null;

  const direct = resolveCatalogIngredient(stripped);
  if (direct) return direct.entry;

  return resolveSynonymOrCandidates(stripped);
}

function resolveCutTerms(name: string): CatalogIngredient | null {
  const target =
    name.replace(PREPARATION_PREFIXES, " ").replace(/\s+/g, " ").trim() || name;
  const cutStripped = target
    .replace(CUT_TERMS, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cutStripped || cutStripped === target) return null;

  const cutDirect = resolveCatalogIngredient(cutStripped);
  if (cutDirect) return cutDirect.entry;

  for (const cand of depluralizeIngredientName(cutStripped)) {
    const hit = resolveCatalogIngredient(cand);
    if (hit) return hit.entry;
  }
  return null;
}

export function tryResolveFromCatalog(
  rawName: string,
): CatalogIngredient | null {
  const clean = rawName.trim().toLowerCase();
  if (!clean) return null;

  const direct = resolveCatalogIngredient(clean);
  if (direct) return direct.entry;

  const fromSynonymOrPlural = resolveSynonymOrCandidates(clean);
  if (fromSynonymOrPlural) return fromSynonymOrPlural;

  const fromPrefix = resolveStrippedPrefixes(clean);
  if (fromPrefix) return fromPrefix;

  return resolveCutTerms(clean);
}
