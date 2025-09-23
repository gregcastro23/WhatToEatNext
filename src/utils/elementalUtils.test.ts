// src/__tests__/utils/elementalUtils.test.ts

import type { ElementalProperties } from '@/types/alchemy';
import { elementalUtils } from '@/utils/elementalUtils';

describe('elementalUtils', () => {
  const validProps: ElementalProperties = { Fire: 0.25, Water: 0.25, Air: 0.25, Earth: 0.25 }

  const invalidProps: ElementalProperties = {
    Fire: 0.5,
    Water: 0.5,
    Air: 0.5,
    Earth: 0.5, // Sum > 1
  }

  describe('validateProperties', () => {
    it('should validate correct elemental properties', () => {
      expect(elementalUtils.validateProperties(validProps)).toBe(true)
    })

    it('should reject invalid elemental properties', () => {
      expect(elementalUtils.validateProperties(invalidProps)).toBe(false)
    })
  })

  describe('normalizeProperties', () => {
    it('should normalize properties to sum to 1', () => {
      const normalized: any = elementalUtils.normalizeProperties(invalidProps)
      const sum: any = Object.values(normalized).reduce((acc: any, val: any) => acc + val0)
      expect(Math.abs(sum - 1)).toBeLessThan(0.000001)
    })

    it('should handle empty or zero properties', () => {
      const emptyProps: any = {
        Fire: 0,
        Water: 0,
        Air: 0,
        Earth: 0,
      }
      const normalized: any = elementalUtils.normalizeProperties(emptyProps)
      expect(normalized.Fire).toBe(0.25)
      expect(normalized.Water).toBe(0.25)
      expect(normalized.Air).toBe(0.25)
      expect(normalized.Earth).toBe(0.25)
    })
  })
})
