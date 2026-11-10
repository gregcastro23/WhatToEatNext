// src/utils/tiltSkilletCircuit.ts
// Tilt Skillet — large-batch "recipe as a circuit" engine.
//
// Server / full-catalog entrypoint that binds `tiltSkilletCircuitCore` to the
// canonical `ingredientsMap` catalog. Client components should import from
// `tiltSkilletCircuitCore` with a server-supplied `IngredientElementalCatalog`
// so the full ingredient dataset stays out of client bundles.

import { ingredientsMap } from "@/data/ingredients";
import type { ElementalProperties } from "@/types/alchemy";
import {
  blendStageElementalWithCatalog,
  computeBatchCircuitWithCatalog,
  computeStageCircuitWithCatalog,
  resolveIngredientElementalFromCatalog,
  type BatchCircuit,
  type BatchIngredient,
  type BatchStageInput,
  type IngredientElementalCatalog,
  type SeriesCircuit,
  type StageCircuit,
} from "./tiltSkilletCircuitCore";

export type {
  BatchCircuit,
  BatchIngredient,
  BatchStageInput,
  IngredientElementalCatalog,
  SeriesCircuit,
  StageCircuit,
};

let cachedElementalCatalog: IngredientElementalCatalog | null = null;

/**
 * Builds a compact `{ [normalizedKeyOrName]: ElementalProperties }` lookup map
 * from `ingredientsMap` (suitable for passing from a Server Component to a
 * Client Component).
 */
export function buildIngredientElementalCatalog(): IngredientElementalCatalog {
  if (cachedElementalCatalog) return cachedElementalCatalog;
  const catalog: IngredientElementalCatalog = {};
  for (const [rawKey, entry] of Object.entries(ingredientsMap)) {
    if (!entry?.elementalProperties) continue;
    const normKey = rawKey.trim().toLowerCase();
    if (normKey) {
      catalog[normKey] = entry.elementalProperties;
    }
    const normName = (entry.name ?? "").trim().toLowerCase();
    if (normName) {
      catalog[normName] = entry.elementalProperties;
      catalog[normName.replace(/\s+/g, "_")] = entry.elementalProperties;
    }
  }
  cachedElementalCatalog = catalog;
  return catalog;
}

export function resolveIngredientElemental(name: string): ElementalProperties {
  return resolveIngredientElementalFromCatalog(
    name,
    buildIngredientElementalCatalog(),
  );
}

export function blendStageElemental(
  ingredients: BatchIngredient[],
): ElementalProperties {
  return blendStageElementalWithCatalog(
    ingredients,
    buildIngredientElementalCatalog(),
  );
}

export function computeStageCircuit(
  stage: BatchStageInput,
  index = 0,
  planetaryPositions?: Record<string, unknown>,
): StageCircuit {
  return computeStageCircuitWithCatalog(
    stage,
    index,
    planetaryPositions,
    buildIngredientElementalCatalog(),
  );
}

export function computeBatchCircuit(
  stages: BatchStageInput[],
  planetaryPositions?: Record<string, unknown>,
): BatchCircuit {
  return computeBatchCircuitWithCatalog(
    stages,
    planetaryPositions,
    buildIngredientElementalCatalog(),
  );
}
