// src/__tests__/utils/elementalUtils.test.ts

import { elementalUtils } from '@/utils/elementalUtils';
import type { ElementalProperties } from '@/types/alchemy';

describe('elementalUtils', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  const validProps: ElementalProperties = {
    Fire: 0.25,
    Water: 0.25,
    Air: 0.25,
    Earth: 0.25
  };

  const invalidProps: ElementalProperties = {
    Fire: 0.5,
    Water: 0.5,
    Air: 0.5,
    Earth: 0.5  // Sum > 1
  };

  describe('validateProperties', () => {
    it('should validate correct elemental properties', () => {
      expect(elementalUtils.validateProperties(validProps)).toBe(true);
    });

    it('should reject invalid elemental properties', () => {
      expect(elementalUtils.validateProperties(invalidProps)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[WARN] Unexpected value in validateElementalProperties:",
        expect.objectContaining({
          message: 'Elemental properties do not sum to ~1 (sum=2.0000)',
          sum: 2,
        }),
      );
    });
  });

  describe('normalizeProperties', () => {
    it('should normalize properties to sum to 1', () => {
      const normalized = elementalUtils.normalizeProperties(invalidProps);
      const sum = Object.values(normalized).reduce((acc, val) => acc + (val as number), 0);
      expect(Math.abs(sum - 1)).toBeLessThan(0.000001);
    });

    it('should handle empty or zero properties', () => {
      const emptyProps = {
        Fire: 0,
        Water: 0,
        Air: 0,
        Earth: 0
      };
      const normalized = elementalUtils.normalizeProperties(emptyProps);
      expect(normalized.Fire).toBe(0.25);
      expect(normalized.Water).toBe(0.25);
      expect(normalized.Air).toBe(0.25);
      expect(normalized.Earth).toBe(0.25);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[WARN] normalizeProperties: sum is 0; returning defaults",
        "",
      );
    });
  });
});
