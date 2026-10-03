/**
 * The /sauces deep link for one sauce (omnibar Phase 4, #870). Search results
 * and Smart Enter open a sauce here; the page shows it above the recommender.
 */

export function sauceHref(key: string): string {
  return `/sauces?focus=${encodeURIComponent(key)}`;
}

function folded(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * `?focus=` → a sauce key. Exact key first, then ignoring case and
 * separators, so a hand-typed `thai-green-curry` finds `thaiGreenCurry`.
 * Anything else is no focus: the page renders as it always has.
 */
export function resolveSauceFocus(param: string | string[] | undefined, keys: readonly string[]): string | null {
  const value = Array.isArray(param) ? param[0] : param;
  if (value === undefined || value === "") return null;
  if (keys.includes(value)) return value;
  const wanted = folded(value);
  return keys.find((key) => folded(key) === wanted) ?? null;
}
