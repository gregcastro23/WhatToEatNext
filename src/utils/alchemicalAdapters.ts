import type { ElementalAffinity } from "@/types/alchemy";

// Convert alchemicalEngine format to standardized format
export function toStandardElementalAffinity(
  engineAffinity: unknown,
): ElementalAffinity {
  // Intentionally any: return shape { base, ... } does not match the declared ElementalAffinity interface (requires primary/strength/compatibility) — preserving existing behavior in this unused adapter; retyping would require fixing the shape mismatch.
  if (!engineAffinity) return { base: "Fire" } as any;

  // Apply safe type casting for unknown type property access
  // Intentionally any: engineAffinity is external/untyped and the returned object mixes base/element/source keys that don't fit ElementalAffinity — retyping would surface the shape mismatch. Preserving behavior.
  const engineData = engineAffinity as any;

  return {
    base: engineData?.element || "Fire",
    strength: engineData?.strength,
    source: engineData?.source,
    // Preserve other properties
    ...engineData,
  };
}

// Convert standardized format to alchemicalEngine format
export function toEngineElementalAffinity(
  standardAffinity: ElementalAffinity,
): unknown {
  // Apply safe type casting for ElementalAffinity property access
  // Intentionally any: reads .base/.source which are not on the ElementalAffinity type (legacy engine shape) — retyping would break compilation; preserving behavior.
  const affinityData = standardAffinity as any;

  return {
    ...standardAffinity,
    element: affinityData?.base,
    strength: affinityData?.strength || 1,
    source: affinityData?.source || "default",
  };
}
