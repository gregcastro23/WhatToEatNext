import type { ElementalProperties } from '../alchemy';

export interface AstrologicalBridge {
  legacyToModern<T>(legacy: unknown): T | null;
  modernToLegacy<T>(modern: T): Record<string, unknown>;
  safeAccess<T>(obj: unknown, path: string): T | undefined;
  validateElementalProperties(obj: unknown): obj is ElementalProperties
}

export const _createAstrologicalBridge = (): AstrologicalBridge => ({
  legacyToModern<T>(legacy: unknown): T | null {
    if (!legacy || typeof legacy !== 'object') return null;
    return legacy as T;
  },

  modernToLegacy<T>(modern: T): Record<string, unknown> {
    return modern as any;
  },

  safeAccess<T>(obj: unknown, path: string): T | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    const keys = path.split('.');
    let current: any = obj as any;
    for (const key of keys) {
      if (current[key] === undefined) return undefined;
      current = current[key] as Record<string, unknown>;
    }
    return current as T;
  },

  validateElementalProperties(obj: unknown): obj is ElementalProperties {
    if (!obj || typeof obj !== 'object') return false;
    const props = obj as any;
    return ['Fire', 'Water', 'Earth', 'Air'].every(element => typeof props[element] === 'number');
  }
});
