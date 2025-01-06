// src/__tests__/utils/elementalUtils.test.ts

import { elementalUtils } from '@/utils/elementalUtils';
import { DEFAULT_ELEMENTAL_PROPERTIES } from '@/constants/elementalConstants';
import type { ElementalProperties } from '@/types/alchemy';

describe('elementalUtils', () => {
  const validProps: ElementalProperties = DEFAULT_ELEMENTAL_PROPERTIES;

  const invalidProps: ElementalProperties = {
    Fire: 0.5,
    Water: 0.5,
    Air: 0.5,
    Earth: 0.5
  };

  it('should validate correct elemental properties', () => {
    expect(elementalUtils.validateProperties(validProps)).toBe(true);
  });

  it('should normalize unbalanced properties', () => {
    const normalized = elementalUtils.normalizeProperties(invalidProps);
    const total = Object.values(normalized).reduce((sum, val) => sum + val, 0);
    expect(Math.abs(total - 1)).toBeLessThan(0.000001);
  });
});