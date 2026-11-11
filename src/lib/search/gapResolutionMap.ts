/**
 * Pure in-memory synonym/slug resolution store for Omnibar Phase 7 search gaps.
 *
 * Kept free of database imports so `searchOmnibar` remains 100% pure and safe
 * for both server and isomorphic callers, while `searchGaps.ts` hydrates and
 * updates the store from PostgreSQL `search_zero_result_gaps`.
 */
import type { SearchIndex } from "./searchIndex";

const resolvedGapMappingsCache = new Map<string, string>();

/** Update or remove an in-memory `normalized_query -> resolved_entity_slug` mapping. */
export function setResolvedGapMappingInMemory(
  normalizedQuery: string,
  resolvedEntitySlug: string | null,
): void {
  const key = normalizedQuery.trim().toLowerCase();
  if (!key) return;
  const slug = resolvedEntitySlug?.trim() ?? "";
  if (slug.length > 0) {
    resolvedGapMappingsCache.set(key, slug);
  } else {
    resolvedGapMappingsCache.delete(key);
  }
}

export function clearResolvedGapMappingsInMemory(): void {
  resolvedGapMappingsCache.clear();
}

export function getCachedResolvedGapMappings(): ReadonlyMap<string, string> {
  return resolvedGapMappingsCache;
}

function isStringMap(
  val: ReadonlyMap<string, string> | Readonly<Record<string, string>>,
): val is ReadonlyMap<string, string> {
  return "get" in val && typeof val.get === "function";
}

export function lookupResolvedGapSlug(
  normalizedQuery: string,
  overrideMappings?: ReadonlyMap<string, string> | Readonly<Record<string, string>>,
): string | null {
  const key = normalizedQuery.trim().toLowerCase();
  if (!key) return null;
  if (overrideMappings) {
    if (isStringMap(overrideMappings)) {
      return overrideMappings.get(key) ?? resolvedGapMappingsCache.get(key) ?? null;
    }
    return overrideMappings[key] ?? resolvedGapMappingsCache.get(key) ?? null;
  }
  return resolvedGapMappingsCache.get(key) ?? null;
}

/**
 * Translate a `resolved_entity_slug` (e.g. `"chickpeas"`, `"black-pepper"`,
 * `"/ingredients/black-pepper"`, `"recipe:shakshuka"`, or a recipe ID/slug)
 * into the canonical entity name in the active `SearchIndex`.
 */
export function resolveMappedSearchTarget(
  index: SearchIndex,
  slugOrTarget: string,
): string {
  const cleaned = slugOrTarget
    .trim()
    .replace(/^\/?(?:ingredients|recipes|sauces|cuisines|cooking-methods)\//i, "")
    .replace(/^(?:ingredient|recipe|sauce|cuisine|method):/i, "")
    .trim();
  if (!cleaned) return "";

  const asKey = cleaned.toLowerCase().replace(/-/g, "_");
  const ingredientByKey = index.ingredients.get(asKey) ?? index.ingredients.get(cleaned.toLowerCase());
  if (ingredientByKey) return ingredientByKey.name;

  for (const ing of index.ingredients.values()) {
    if (ing.slug.toLowerCase() === cleaned.toLowerCase()) {
      return ing.name;
    }
  }

  const recipeById = index.recipes.get(cleaned) ?? index.recipes.get(cleaned.toLowerCase());
  if (recipeById) return recipeById.name;

  const lowerCleaned = cleaned.toLowerCase();
  for (const indexedEntity of index.entities) {
    if (
      indexedEntity.entity.key.toLowerCase() === lowerCleaned ||
      indexedEntity.entity.name.toLowerCase() === lowerCleaned ||
      indexedEntity.entity.href.toLowerCase().endsWith(`/${lowerCleaned}`)
    ) {
      return indexedEntity.entity.name;
    }
  }

  return cleaned.replace(/[-_]+/g, " ").trim();
}
