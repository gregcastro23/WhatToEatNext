/**
 * How long the live recipe catalog is trusted before it is read again, in
 * process and in Redis (LocalRecipeService). Anything that must agree with
 * the live catalog about which recipes exist, such as the set of unpublished
 * recipes (./unpublishedCopies), refreshes on this same clock, so the two
 * never disagree for longer than one refresh.
 *
 * @file src/lib/recipes/catalogTtl.ts
 */
export const CATALOG_TTL_MS = 5 * 60 * 1000;
