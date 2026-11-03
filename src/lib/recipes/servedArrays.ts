/**
 * The arrays `getServerRecipes` has handed out.
 *
 * Callers tell "the live catalog fell back to the static list" by whether the
 * live array IS the static one (LocalRecipeService's fallback returns what
 * `getServerRecipes` gave it). The array handed out is replaced when the set
 * of hidden (unpublished) recipes changes, so a fallback taken before that
 * change still holds an array `getServerRecipes` gave out, though no longer the
 * current one: it counts as the static list too.
 *
 * @file src/lib/recipes/servedArrays.ts
 */
const handedOut = new WeakSet<readonly object[]>();

export function markServed(recipes: readonly object[]): void {
  handedOut.add(recipes);
}

export function wasServed(recipes: readonly object[]): boolean {
  return handedOut.has(recipes);
}
