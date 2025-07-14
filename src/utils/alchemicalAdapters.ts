// import { ElementalAffinity, _Element } from '@/types/alchemy';

// Convert alchemicalEngine format to standardized format
export function toStandardElementalAffinity(engineAffinity: unknown): ElementalAffinity {
  if (!engineAffinity) return { base: 'Fire' as _Element } as ElementalAffinity;

  // Apply safe type casting for unknown type property access
  const engineData = engineAffinity as Record<string, unknown>;

  return {
    base: (engineData?.element as _Element) || 'Fire',
    strength: engineData?.strength as number,
    source: engineData?.source as string,
    // Preserve other properties
    ...engineData
  } as ElementalAffinity;
}

// Convert standardized format to alchemicalEngine format
export function toEngineElementalAffinity(standardAffinity: ElementalAffinity): Record<string, unknown> {
  // Apply safe type casting for ElementalAffinity property access
  const affinityData = standardAffinity as Record<string, unknown>;
  
  return {
    element: affinityData?.base,
    strength: (affinityData?.strength as number) || 1,
    source: (affinityData?.source as string) || 'default',
    // Preserve other properties
    ...standardAffinity
  };
} 