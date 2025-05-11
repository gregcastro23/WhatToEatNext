import @/types  from 'alchemy ';

// Convert alchemicalEngine format to standardized format
export function toStandardElementalAffinity(engineAffinity: unknown): ElementalAffinity {
  if (!engineAffinity) return { base: 'Fire' }; // Default value

  return {
    base: engineAffinity.element || 'Fire',
    strength: engineAffinity.strength,
    source: engineAffinity.source,
    // Preserve other properties
    ...engineAffinity
  };
}

// Convert standardized format to alchemicalEngine format
export function toEngineElementalAffinity(standardAffinity: ElementalAffinity): unknown {
  return {
    element: standardAffinity.base,
    strength: standardAffinity.strength || 1,
    source: standardAffinity.source || 'default',
    // Preserve other properties
    ...standardAffinity
  };
} 