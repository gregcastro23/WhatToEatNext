/**
 * How long the live recipe catalog is trusted before it is read again, in
 * process and in Redis (LocalRecipeService). Anything that must agree with
 * the live catalog about which recipes exist, such as the set of unpublished
 * recipes (./unpublishedCopies), is trusted for the same period. The two
 * caches start their periods independently, and the live catalog's Redis layer
 * re-stamps its in-process copy, so they can differ by up to about two periods.
 *
 * @file src/lib/recipes/catalogTtl.ts
 */
export const CATALOG_TTL_MS = 5 * 60 * 1000;
