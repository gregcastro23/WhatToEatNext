import { ElementalAffinity, _Element } from '@/types/alchemy';

// Convert alchemicalEngine format to standardized format
export function toStandardElementalAffinity(engineAffinity: unknown): ElementalAffinity {
  if (!engineAffinity) return { base: 'Fire' } as ElementalAffinity;

  // Apply safe type casting for unknown type property access
  const engineData = engineAffinity as any;

  return {
    base: engineData?.element || 'Fire',
    strength: engineData?.strength,
    source: engineData?.source,
    // Preserve other properties
    ...(engineData as Record<string, unknown>)
  };
}

// Convert standardized format to alchemicalEngine format
export function toEngineElementalAffinity(standardAffinity: ElementalAffinity): unknown {
  // Apply safe type casting for ElementalAffinity property access
  const affinityData = standardAffinity as any;
  
  return {
    element: affinityData?.base,
    strength: affinityData?.strength || 1,
    source: affinityData?.source || 'default',
    // Preserve other properties
    ...standardAffinity
  };
} 