import type { ElementalProperties, PlanetaryPosition, AstrologicalState } from '@/types/alchemy';

export function isValidPlanetaryPosition(obj: unknown): obj is PlanetaryPosition {
  if (!obj || typeof obj !== 'object') return false;
  const pos = obj as Record<string, unknown>;
  return typeof pos.sign === 'string' && typeof pos.degree === 'number';
}

export function isValidElementalProperties(obj: unknown): obj is ElementalProperties {
  if (!obj || typeof obj !== 'object') return false;
  const props = obj as Record<string, unknown>;
  return ['Fire', 'Water', 'Earth', 'Air'].every(
    element => typeof props[element] === 'number' && props[element] >= 0
  );
}

export function isValidAstrologicalState(obj: unknown): obj is AstrologicalState {
  if (!obj || typeof obj !== 'object') return false;
  const state = obj as Record<string, unknown>;
  return state.currentZodiac !== undefined && state.lunarPhase !== undefined;
}

export function safelyExtractElementalProperties(obj: unknown): ElementalProperties | null {
  if (isValidElementalProperties(obj)) return obj;
  
  // Try to extract from nested structure
  if (obj && typeof obj === 'object') {
    const nested = (obj as Record<string, unknown>).elementalProperties;
    if (isValidElementalProperties(nested)) return nested;
  }
  
  return null;
}

export function safelyExtractPlanetaryPosition(obj: unknown): PlanetaryPosition | null {
  if (isValidPlanetaryPosition(obj)) return obj;
  return null;
}

export function createDefaultElementalProperties(): ElementalProperties {
  return {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
}