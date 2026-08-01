/**
 * Canonical cooking-method key space.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * `[MEASURED 2026-07-31]` an audit found at least 27 registries and alias maps
 * keying cooking methods, four distinct types named `CookingMethod`, and five
 * different normalization rules. Under the two live rules, 6 of the 27 real
 * methods fail to resolve a pillar.
 *
 * The fix is deliberately NOT a rename. Method keys are persisted in three
 * Postgres surfaces read by exact string equality — most sharply
 * `user_profiles.taste_corrections.methods`, where a stored `{"stir-frying":
 * "block"}` is a user saying *never this*. Renaming the key silently revokes
 * that, and there is no backfill hook anywhere in `database/init/`.
 *
 * So: registries keep their existing keys, and every reader normalizes instead.
 * Both `fermenting` and `fermentation` resolve, forever.
 *
 * ── Two normalizers, tethered ───────────────────────────────────────────────
 *
 * `normalizeCookingMethodKey` — the data-layer rule. Collapses separators to
 *   underscores so `"Pressure Cooking"`, `"pressure-cooking"` and
 *   `"pressure_cooking"` are one key.
 *
 * `normalizeSlug` — the URL rule. Strips to bare alphanumerics so a route can
 *   accept `/techniques/pressurecooking`.
 *
 * They do genuinely different jobs, but the slug is DERIVED from the key form
 * rather than maintained beside it. That is the whole point: a hand-written
 * parallel list of slugs drifts the moment a method is added, and the route's
 * alias table had already drifted into storing slug spellings as its values.
 *
 * @file src/constants/cookingMethodKeys.ts
 */

/**
 * Every cooking method with a data file, i.e. the keys of `allCookingMethods`.
 *
 * `[MEASURED 2026-08-01]` these 27 are the ids the /cooking-methods routes and
 * /api/techniques actually serve. Registry totality is asserted against THIS
 * list, because a method the app cannot serve cannot be missing a profile.
 */
export const SERVABLE_COOKING_METHOD_KEYS = [
  "boiling",
  "braising",
  "broiling",
  "cryo_cooking",
  "curing",
  "dehydrating",
  "distilling",
  "emulsification",
  "fermentation",
  "frying",
  "gelification",
  "grilling",
  "infusing",
  "marinating",
  "pickling",
  "poaching",
  "pressure_cooking",
  "raw",
  "roasting",
  "simmering",
  "smoking",
  "sous_vide",
  "spherification",
  "steaming",
  "stewing",
  "stir_frying",
  "tilt_skillet",
] as const;

export type ServableCookingMethodKey = (typeof SERVABLE_COOKING_METHOD_KEYS)[number];

/**
 * Keys that appear in a registry but have no data file, so nothing can be
 * served for them.
 *
 * `[MEASURED 2026-08-01]` `baking` carries both a pillar entry and a kinetic
 * profile yet has no method data — a real catalog gap, not a naming artifact.
 * `sauteing`, `foam` and `ceviche` are pillar-only. They are named here rather
 * than quietly dropped so the difference between "we have no profile" and "we
 * have no method" stays visible.
 */
export const REGISTRY_ONLY_COOKING_METHOD_KEYS = [
  "baking",
  "ceviche",
  "foam",
  "sauteing",
] as const;

/**
 * Every method key the system names, servable or not.
 *
 * This is the vocabulary a schema should validate against; totality checks over
 * the registries use {@link SERVABLE_COOKING_METHOD_KEYS} instead.
 */
export type CanonicalCookingMethodKey =
  | ServableCookingMethodKey
  | (typeof REGISTRY_ONLY_COOKING_METHOD_KEYS)[number];

export const CANONICAL_COOKING_METHOD_KEYS: readonly CanonicalCookingMethodKey[] =
  [...SERVABLE_COOKING_METHOD_KEYS, ...REGISTRY_ONLY_COOKING_METHOD_KEYS].sort();

const CANONICAL_SET: ReadonlySet<string> = new Set<string>([
  ...SERVABLE_COOKING_METHOD_KEYS,
  ...REGISTRY_ONLY_COOKING_METHOD_KEYS,
]);

/**
 * Data-layer key normalization.
 *
 * lowercase → fold accents → collapse runs of whitespace and hyphens to a
 * single underscore.
 *
 * Accent folding matters and is not decorative: `"Sautéing"` appears in a
 * persisted picker option (`FoodLabBook.tsx`), a type union, and several cuisine
 * files, and without folding it never meets the registry key `sauteing`.
 *
 * This function is total and never throws — an unrecognised string normalizes
 * to something that simply will not be found, which callers handle as absence.
 */
export function normalizeCookingMethodKey(input: string): string {
  return input
    .normalize("NFD")
    // Strip combining diacritical marks (U+0300–U+036F).
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");
}

/**
 * URL-slug normalization, derived from the key form.
 *
 * Composition is the contract: `normalizeSlug = stripNonAlphanumeric ∘
 * normalizeCookingMethodKey`. A change to the key rule propagates here
 * automatically, so the two can never disagree about what a method is called.
 *
 * `normalizeSlug("Pressure Cooking") === normalizeSlug("pressure_cooking")
 *  === normalizeSlug("pressurecooking") === "pressurecooking"`
 */
export function normalizeSlug(input: string): string {
  return normalizeCookingMethodKey(input).replace(/[^a-z0-9]/g, "");
}

/** Narrow an arbitrary string to a canonical key, or null if it is not one. */
export function toCanonicalCookingMethodKey(
  input: string,
): CanonicalCookingMethodKey | null {
  const normalized = normalizeCookingMethodKey(input);
  return CANONICAL_SET.has(normalized)
    ? (normalized as CanonicalCookingMethodKey)
    : null;
}

/**
 * Resolve an arbitrary user- or data-supplied string against a registry's own
 * keys, tolerating any spelling on either side.
 *
 * This is how a reader consults a registry without that registry being
 * renamed: the registry keeps `drying` and `fermenting`, and a caller asking for
 * `dehydrating` or `fermentation` still has to miss — normalization alone cannot
 * bridge two genuinely different words. Those cases are fixed by ADDING the
 * second spelling to the registry, not by renaming the first.
 *
 * @returns the registry's own key, so the caller indexes it directly.
 */
export function resolveRegistryKey(
  input: string,
  registryKeys: readonly string[],
): string | null {
  const target = normalizeCookingMethodKey(input);
  return registryKeys.find((key) => normalizeCookingMethodKey(key) === target) ?? null;
}
