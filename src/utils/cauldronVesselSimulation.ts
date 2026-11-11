/**
 * Server entrypoint for the alchm cauldron: binds `cauldronVesselCore` to the
 * canonical `ingredientsMap` and to the SI vessel, so a caller can run a whole
 * simulation from stages and a `VesselState`.
 *
 * Client components must not import this module — it pulls in the full
 * ingredient catalog. They fetch the compact elemental lookup from
 * GET /api/cauldron/elemental-catalog and call the core directly.
 *
 * @file src/utils/cauldronVesselSimulation.ts
 */

import { ingredientsMap } from "@/data/ingredients";
import { readVessel, type VesselReading } from "@/lib/cooking/thermoVessel";
import type { VesselState } from "@/lib/cooking/vesselState";
import {
  computeStageTransformation,
  type TransformationState,
} from "./cauldronTransformation";
import {
  computeCauldronCircuitWithCatalog,
  type BatchCircuit,
  type BatchStageInput,
  type IngredientElementalCatalog,
} from "./cauldronVesselCore";
import { cauldronVesselProfile, type CauldronVesselProfile } from "./cauldronVesselProfile";

let cachedElementalCatalog: IngredientElementalCatalog | null = null;

/**
 * A compact `{ [normalizedKeyOrName]: ElementalProperties }` lookup built from
 * `ingredientsMap`: the catalog key, the display name, and the display name
 * with underscores, so free-text names resolve the same way they did in the
 * tilt-skillet planner.
 */
export function buildIngredientElementalCatalog(): IngredientElementalCatalog {
  if (cachedElementalCatalog) return cachedElementalCatalog;
  const catalog: IngredientElementalCatalog = {};
  for (const [rawKey, entry] of Object.entries(ingredientsMap)) {
    const normKey = rawKey.trim().toLowerCase();
    if (normKey) catalog[normKey] = entry.elementalProperties;
    const normName = entry.name.trim().toLowerCase();
    if (normName) {
      catalog[normName] = entry.elementalProperties;
      catalog[normName.replace(/\s+/g, "_")] = entry.elementalProperties;
    }
  }
  cachedElementalCatalog = catalog;
  return catalog;
}

export interface CauldronSimulation {
  vessel: VesselState;
  reading: VesselReading;
  profile: CauldronVesselProfile;
  circuit: BatchCircuit;
  transformation: TransformationState;
}

/** Run the cauldron: SI vessel reading → ruled profile → series circuit over the stages. */
export function simulateCauldron(
  stages: BatchStageInput[],
  vessel: VesselState,
  planetaryPositions?: Record<string, unknown>,
): CauldronSimulation {
  const reading = readVessel(vessel);
  const profile = cauldronVesselProfile(vessel, reading);
  const circuit = computeCauldronCircuitWithCatalog(
    stages,
    profile.profile,
    buildIngredientElementalCatalog(),
    planetaryPositions,
  );
  const duration = vessel.durationMinutes ?? 15;
  const transformation = computeStageTransformation(vessel, reading, duration);
  circuit.transformation = transformation;
  return { vessel, reading, profile, circuit, transformation };
}
