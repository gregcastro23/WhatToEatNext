/**
 * Ingredient lookup for the alchm cauldron: free-text names → elemental
 * profiles, and the quantity-weighted blend of one stage.
 *
 * Split from `cauldronVesselCore.ts` (which re-exports all of it) so each file
 * stays inside the audited size limits.
 *
 * @file src/utils/cauldronIngredients.ts
 */

import type { ElementalProperties } from "@/types/alchemy";
import { calculateQuantityFactor } from "./quantityScaling";

const EPS = 1e-9;

export const NEUTRAL_ELEMENTAL: ElementalProperties = {
  Fire: 0.25,
  Water: 0.25,
  Earth: 0.25,
  Air: 0.25,
};

export type IngredientElementalCatalog = Record<string, ElementalProperties>;

export interface BatchIngredient {
  name: string;
  amount: number;
  unit: string;
  /** Resolved elemental profile; when omitted it is resolved from the ingredient catalog. */
  elementalProperties?: ElementalProperties;
}

export interface BatchStageInput {
  name?: string;
  ingredients: BatchIngredient[];
  durationMinutes?: number;
}

export interface IngredientMatch {
  /** The catalog key that answered. */
  key: string;
  elemental: ElementalProperties;
  /** True for an exact key or name; false for a substring match either way. */
  exact: boolean;
}

/**
 * Look a free-text ingredient name up in a compact
 * `{ [normalizedKeyOrName]: ElementalProperties }` catalog: exact key, exact
 * name, then a substring match either way (the tilt-skillet planner's rule,
 * kept). `null` when nothing matches. A substring match is reported as such —
 * it can be wrong ("egg" → eggplant), so it must never pass as a lookup.
 */
export function matchIngredient(
  name: string,
  catalog?: IngredientElementalCatalog,
): IngredientMatch | null {
  const norm = name.trim().toLowerCase();
  if (!norm || !catalog) return null;

  for (const key of [norm.replace(/\s+/g, "_"), norm]) {
    const direct = catalog[key];
    if (direct) return { key, elemental: direct, exact: true };
  }
  for (const [entryKey, elemental] of Object.entries(catalog)) {
    const entryNorm = entryKey.replace(/_/g, " ");
    if (entryNorm === norm) return { key: entryKey, elemental, exact: true };
    if (entryNorm.includes(norm) || norm.includes(entryNorm)) {
      return { key: entryKey, elemental, exact: false };
    }
  }
  return null;
}

/** The elemental profile a name resolves to, exact or partial; `null` when none. */
export function findIngredientElemental(
  name: string,
  catalog?: IngredientElementalCatalog,
): ElementalProperties | null {
  return matchIngredient(name, catalog)?.elemental ?? null;
}

/**
 * Resolve a name, falling back to the neutral profile so an unknown name never
 * breaks the math. Callers that show results should also surface
 * {@link ingredientMatchReport}, so a neutral or a partial match is never
 * mistaken for a looked-up one.
 */
export function resolveIngredientElementalFromCatalog(
  name: string,
  catalog?: IngredientElementalCatalog,
): ElementalProperties {
  return findIngredientElemental(name, catalog) ?? { ...NEUTRAL_ELEMENTAL };
}

export interface IngredientMatchReport {
  /** Not in the catalog at all: blended as neutral. */
  unresolved: string[];
  /** Matched only by substring: typed name → catalog key. */
  partial: Array<{ name: string; key: string }>;
}

/** How every named ingredient in the stages resolved (blank rows excluded, names deduplicated). */
export function ingredientMatchReport(
  stages: readonly BatchStageInput[],
  catalog?: IngredientElementalCatalog,
): IngredientMatchReport {
  const names = [...new Set(stages.flatMap((s) => s.ingredients.map((i) => i.name.trim())))];
  const report: IngredientMatchReport = { unresolved: [], partial: [] };
  for (const name of names.filter((n) => n !== "")) {
    const match = matchIngredient(name, catalog);
    if (match === null) report.unresolved.push(name);
    else if (!match.exact) report.partial.push({ name, key: match.key });
  }
  return report;
}

/** Names the catalog cannot resolve at all. */
export function unresolvedIngredientNames(
  stages: readonly BatchStageInput[],
  catalog?: IngredientElementalCatalog,
): string[] {
  return ingredientMatchReport(stages, catalog).unresolved;
}

/**
 * The stages that hold at least one named ingredient, with blank rows dropped.
 * An empty stage would blend to the neutral 25 % profile and add a made-up
 * circuit to every series total, so it is not wired at all.
 */
export function namedStages(stages: readonly BatchStageInput[]): BatchStageInput[] {
  return stages
    .map((s) => ({ ...s, ingredients: s.ingredients.filter((i) => i.name.trim() !== "") }))
    .filter((s) => s.ingredients.length > 0);
}

/**
 * Quantity-weighted blend of a stage's ingredients into one elemental profile.
 */
export function blendStageElementalWithCatalog(
  ingredients: BatchIngredient[],
  catalog?: IngredientElementalCatalog,
): ElementalProperties {
  const acc: ElementalProperties = { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  let totalWeight = 0;

  for (const ing of ingredients) {
    const elemental =
      ing.elementalProperties ??
      resolveIngredientElementalFromCatalog(ing.name, catalog);
    const weight = calculateQuantityFactor(ing.amount, ing.unit, "g", ing.name);
    if (!(weight > 0)) continue;
    acc.Fire += elemental.Fire * weight;
    acc.Water += elemental.Water * weight;
    acc.Earth += elemental.Earth * weight;
    acc.Air += elemental.Air * weight;
    totalWeight += weight;
  }

  const sum = acc.Fire + acc.Water + acc.Earth + acc.Air;
  if (sum <= EPS || totalWeight <= EPS) return { ...NEUTRAL_ELEMENTAL };
  return {
    Fire: acc.Fire / sum,
    Water: acc.Water / sum,
    Earth: acc.Earth / sum,
    Air: acc.Air / sum,
  };
}
