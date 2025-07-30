import type { ElementalProperties } from '../alchemy';

export interface AstrologicalBridge {
  legacyToModern<T>(legacy: unknown): T | null;
  modernToLegacy<T>(modern: T): Record<string, unknown>;
  safeAccess<T>(obj: unknown, path: string): T | undefined;
  validateElementalProperties(obj: unknown): obj is ElementalProperties;
}

export const createAstrologicalBridge = (): AstrologicalBridge => ({
  legacyToModern<T>(legacy: unknown): T | null {
    if (!legacy || typeof legacy !== 'object') return null;
    return legacy as T;
  },

  modernToLegacy<T>(modern: T): Record<string, unknown> {
    return modern as Record<string, unknown>;
  },

  safeAccess<T>(obj: unknown, path: string): T | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const keys = path.split('.');
    let current: Record<string, unknown> = obj as Record<string, unknown>;
    for (const key of keys) {
      if (current[key] === undefined) return undefined;
      current = current[key];
    }
    return current as T;
  },

  validateElementalProperties(obj: unknown): obj is ElementalProperties {
    if (!obj || typeof obj !== 'object') return false;
    const props = obj as Record<string, unknown>;
    return ['Fire', 'Water', 'Earth', 'Air'].every(
      element => typeof props[element] === 'number'
    );
  }
});