import { describe, expect, it, beforeEach } from 'vitest';
import type { PlanetaryAspect, PlanetaryPosition } from '@/types/celestial';
import type { SignVectorCalculationInput } from '@/types/signVectors';
import {
  calculateSignVectors,
  cosineSimilarity,
  compareSignVectors,
  signVectorToESMS,
  blendESMS,
  getAlchemicalStateWithVectors,
  VECTOR_CONFIG
} from '../signVectors';

describe('signVectors', () => {
  let mockPlanetaryPositions: Record<string, PlanetaryPosition>;
  let mockAspects: PlanetaryAspect[];

  beforeEach(() => {
    mockPlanetaryPositions = {
      Sun: { sign: 'aries', degree: 15, isRetrograde: false },
      Moon: { sign: 'cancer', degree: 10, isRetrograde: false },
      Mercury: { sign: 'gemini', degree: 20, isRetrograde: false },
      Venus: { sign: 'taurus', degree: 5, isRetrograde: false },
      Mars: { sign: 'scorpio', degree: 25, isRetrograde: false }
    };

    mockAspects = [
      {
        planet1: 'Sun',
        planet2: 'Moon',
        type: 'square',
        orb: 5,
        isApplying: true
      },
      {
        planet1: 'Mercury',
        planet2: 'Venus',
        type: 'sextile',
        orb: 3,
        isApplying: false
      }
    ];
  });

  describe('calculateSignVectors', () => {
    it('should calculate sign vectors for all zodiac signs', () => {
      const input: SignVectorCalculationInput = {
        planetaryPositions: mockPlanetaryPositions,
        aspects: mockAspects,
        season: 'spring'
      };

      const result = calculateSignVectors(input);

      expect(result).toBeDefined();
      expect(Object.keys(result)).toHaveLength(12);
      expect(result.aries).toBeDefined();
      expect(result.aries.sign).toBe('aries');
      expect(result.aries.magnitude).toBeGreaterThanOrEqual(0);
      expect(result.aries.magnitude).toBeLessThanOrEqual(1);
      expect(['cardinal', 'fixed', 'mutable']).toContain(result.aries.direction);
    });

    it('should handle empty planetary positions', () => {
      const input: SignVectorCalculationInput = {
        planetaryPositions: {},
        aspects: []
      };

      const result = calculateSignVectors(input);

      expect(result).toBeDefined();
      Object.values(result).forEach(vector => {
        expect(vector.magnitude).toBeGreaterThanOrEqual(0);
        expect(vector.magnitude).toBeLessThanOrEqual(1);
      });
    });

    it('should handle malformed planetary data gracefully', () => {
      const input: SignVectorCalculationInput = {
        planetaryPositions: {
          Sun: { sign: null as any, degree: NaN, isRetrograde: undefined as any },
          Moon: { sign: 'invalid' as any, degree: -100, isRetrograde: false }
        },
        aspects: undefined as any
      };

      const result = calculateSignVectors(input);

      expect(result).toBeDefined();
      expect(Object.keys(result)).toHaveLength(12);
    });

    it('should apply seasonal alignment correctly', () => {
      const springInput: SignVectorCalculationInput = {
        planetaryPositions: { Sun: { sign: 'aries', degree: 15, isRetrograde: false } },
        season: 'spring'
      };

      const winterInput: SignVectorCalculationInput = {
        planetaryPositions: { Sun: { sign: 'aries', degree: 15, isRetrograde: false } },
        season: 'winter'
      };

      const springResult = calculateSignVectors(springInput);
      const winterResult = calculateSignVectors(winterInput);

      expect(springResult.aries.components.seasonal).toBeGreaterThan(winterResult.aries.components.seasonal);
    });

    it('should apply aspect modifiers correctly', () => {
      const withConjunction: SignVectorCalculationInput = {
        planetaryPositions: {
          Sun: { sign: 'aries', degree: 15, isRetrograde: false },
          Moon: { sign: 'aries', degree: 18, isRetrograde: false }
        },
        aspects: [
          {
            planet1: 'Sun',
            planet2: 'Moon',
            type: 'conjunction',
            orb: 3,
            isApplying: true
          }
        ]
      };

      const withoutAspects: SignVectorCalculationInput = {
        planetaryPositions: {
          Sun: { sign: 'aries', degree: 15, isRetrograde: false },
          Moon: { sign: 'aries', degree: 18, isRetrograde: false }
        },
        aspects: []
      };

      const resultWithAspect = calculateSignVectors(withConjunction);
      const resultWithoutAspect = calculateSignVectors(withoutAspects);

      expect(resultWithAspect.aries.magnitude).toBeGreaterThan(resultWithoutAspect.aries.magnitude);
    });

    it('should handle retrograde planets correctly', () => {
      const withRetrograde: SignVectorCalculationInput = {
        planetaryPositions: {
          Mercury: { sign: 'gemini', degree: 15, isRetrograde: true }
        }
      };

      const withoutRetrograde: SignVectorCalculationInput = {
        planetaryPositions: {
          Mercury: { sign: 'gemini', degree: 15, isRetrograde: false }
        }
      };

      const retroResult = calculateSignVectors(withRetrograde);
      const directResult = calculateSignVectors(withoutRetrograde);

      expect(retroResult.gemini.magnitude).toBeLessThan(directResult.gemini.magnitude);
    });

    it('should normalize modality and elemental vectors correctly', () => {
      const input: SignVectorCalculationInput = {
        planetaryPositions: mockPlanetaryPositions
      };

      const result = calculateSignVectors(input);

      Object.values(result).forEach(vector => {
        const modalityMagnitude = Math.sqrt(
          vector.components.cardinal ** 2 +
          vector.components.fixed ** 2 +
          vector.components.mutable ** 2
        );
        expect(modalityMagnitude).toBeCloseTo(1.5);

        const elementalMagnitude = Math.sqrt(
          vector.components.Fire ** 2 +
          vector.components.Water ** 2 +
          vector.components.Earth ** 2 +
          vector.components.Air ** 2
        );
        expect(elementalMagnitude).toBeCloseTo(1.5);
      });
    });
  })

  describe('cosineSimilarity', () => {
    it('should calculate similarity correctly for identical vectors', () => {
      const a = [1, 0, 0];
      const b = [1, 0, 0];
      expect(cosineSimilarity(a, b)).toBe(1);
    });

    it('should calculate similarity correctly for orthogonal vectors', () => {
      const a = [1, 0, 0];
      const b = [0, 1, 0];
      expect(cosineSimilarity(a, b)).toBe(0);
    });

    it('should calculate similarity correctly for opposite vectors', () => {
      const a = [1, 0, 0];
      const b = [-1, 0, 0];
      expect(cosineSimilarity(a, b)).toBe(-1);
    });

    it('should handle zero vectors', () => {
      const a = [0, 0];
      const b = [1, 1, 1];
      expect(cosineSimilarity(a, b)).toBe(0);
    });

    it('should handle vectors of different lengths', () => {
      const a = [1, 2, 3, 4, 5];
      const b = [1, 2, 3];
      const result = cosineSimilarity(a, b);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  describe('compareSignVectors', () => {
    it('should compare similar vectors correctly', () => {
      const vectorA = {
        sign: 'aries' as const,
        magnitude: 0.8,
        direction: 'cardinal' as const,
        components: {
          cardinal: 0.8,
          fixed: 0.1,
          mutable: 0.1,
          Fire: 0.9,
          Water: 0.5,
          Earth: 0.3,
          Air: 0.2,
          seasonal: 0.9
        }
      };

      const vectorB = {
        sign: 'leo' as const,
        magnitude: 0.7,
        direction: 'fixed' as const,
        components: {
          cardinal: 0.1,
          fixed: 0.8,
          mutable: 0.1,
          Fire: 0.85,
          Water: 0.08,
          Earth: 0.4,
          Air: 0.3,
          seasonal: 0.8
        }
      };

      const result = compareSignVectors(vectorA, vectorB);

      expect(result.similarity).toBeGreaterThan(0.5);
      expect(result.similarity).toBeLessThanOrEqual(1);
      expect(result.dominantSharedAxis).toBe('elemental');
    });

    it('should identify dominant shared axis correctly', () => {
      const modalityDominant1 = {
        sign: 'aries' as const,
        magnitude: 0.8,
        direction: 'cardinal' as const,
        components: {
          cardinal: 1,
          fixed: 0,
          mutable: 0,
          Fire: 0.25,
          Water: 0.25,
          Earth: 0.25,
          Air: 0.25,
          seasonal: 0.5
        }
      };

      const modalityDominant2 = {
        sign: 'cancer' as const,
        magnitude: 0.7,
        direction: 'cardinal' as const,
        components: {
          cardinal: 1,
          fixed: 0,
          mutable: 0,
          Fire: 0.2,
          Water: 0.3,
          Earth: 0.2,
          Air: 0.3,
          seasonal: 0.4
        }
      };

      const result = compareSignVectors(modalityDominant1, modalityDominant2);
      expect(result.dominantSharedAxis).toBe('modality');
    });
  });

  describe('signVectorToESMS', () => {
    it('should convert sign vector to ESMS correctly', () => {
      const vector = {
        sign: 'aries' as const,
        magnitude: 0.8,
        direction: 'cardinal' as const,
        components: {
          cardinal: 0.7,
          fixed: 0.2,
          mutable: 0.1,
          Fire: 0.8,
          Water: 0.1,
          Earth: 0.5,
          Air: 0.5,
          seasonal: 0.9
        }
      };

      const esms = signVectorToESMS(vector);

      expect(esms).toBeDefined();
      expect(esms.Spirit).toBeGreaterThanOrEqual(0);
      expect(esms.Essence).toBeGreaterThanOrEqual(0);
      expect(esms.Matter).toBeGreaterThanOrEqual(0);
      expect(esms.Substance).toBeGreaterThanOrEqual(0);
      const sum = esms.Spirit + esms.Essence + esms.Matter + esms.Substance;
      expect(sum).toBeCloseTo(1.5);
    });

    it('should apply modality boosts correctly', () => {
      const cardinalVector = {
        sign: 'aries' as const,
        magnitude: 1,
        direction: 'cardinal' as const,
        components: {
          cardinal: 1,
          fixed: 0,
          mutable: 0,
          Fire: 0.5,
          Water: 0.5,
          Earth: 0,
          Air: 0,
          seasonal: 0.5
        }
      };

      const fixedVector = {
        sign: 'taurus' as const,
        magnitude: 1,
        direction: 'fixed' as const,
        components: {
          cardinal: 0,
          fixed: 1,
          mutable: 0,
          Fire: 0.5,
          Water: 0.5,
          Earth: 0,
          Air: 0,
          seasonal: 0.5
        }
      };

      const cardinalESMS = signVectorToESMS(cardinalVector);
      const fixedESMS = signVectorToESMS(fixedVector);

      expect(cardinalESMS.Spirit).toBeGreaterThan(fixedESMS.Spirit);
      expect(fixedESMS.Substance).toBeGreaterThan(cardinalESMS.Substance);
    });
  });

  describe('blendESMS', () => {
    it('should blend ESMS properties correctly with default alpha', () => {
      const base = { Spirit: 0.4, Essence: 0.3, Matter: 0.2, Substance: 0.1 };
      const contribution = { Spirit: 0.1, Essence: 0.2, Matter: 0.3, Substance: 0.4 };
      const result = blendESMS(base, contribution);

      expect(result.Spirit).toBeLessThan(base.Spirit);
      expect(result.Substance).toBeGreaterThan(base.Substance);

      const sum = result.Spirit + result.Essence + result.Matter + result.Substance;
      expect(sum).toBeCloseTo(1.5);
    });

    it('should handle custom alpha values', () => {
      const base = { Spirit: 0.4, Essence: 0.3, Matter: 0.2, Substance: 0.1 };
      const contribution = { Spirit: 0.1, Essence: 0.2, Matter: 0.3, Substance: 0.4 };
      const result0 = blendESMS(base, contribution, 0);
      const result1 = blendESMS(base, contribution, 1);
      const result05 = blendESMS(base, contribution, 0.5);

      expect(result0.Spirit).toBeCloseTo(base.Spirit / (base.Spirit + base.Essence + base.Matter + base.Substance), 5);
      expect(result1.Spirit).toBeCloseTo(contribution.Spirit / (contribution.Spirit + contribution.Essence + contribution.Matter + contribution.Substance), 5);
      expect(result05.Spirit).toBeLessThan(result0.Spirit);
      expect(result05.Spirit).toBeGreaterThan(result1.Spirit);
    });
  });

  describe('getAlchemicalStateWithVectors', () => {
    it('should calculate complete alchemical state with sun governing', () => {
      const input = {
        planetaryPositions: mockPlanetaryPositions,
        aspects: mockAspects,
        season: 'spring' as const,
        governing: 'sun' as const
      };

      const result = getAlchemicalStateWithVectors(input);

      expect(result).toBeDefined();
      expect(result.signVectors).toBeDefined();
      expect(result.selected).toBeDefined();
      expect(result.selected.sign).toBe('aries');
      expect(result.base.alchemical).toBeDefined();
      expect(result.base.elemental).toBeDefined();
      expect(result.blendedAlchemical).toBeDefined();
      expect(result.thermodynamics).toBeDefined();
      expect(result.thermodynamics.heat).toBeTypeOf('number');
      expect(result.thermodynamics.entropy).toBeTypeOf('number');
      expect(result.thermodynamics.reactivity).toBeTypeOf('number');
      expect(result.thermodynamics.kalchm).toBeTypeOf('number');
      expect(result.thermodynamics.monica).toBeTypeOf('number');
      expect(result.config).toBe(VECTOR_CONFIG);
    });

    it('should calculate with moon governing', () => {
      const input = {
        planetaryPositions: mockPlanetaryPositions,
        governing: 'moon' as const
      };

      const result = getAlchemicalStateWithVectors(input);

      expect(result.selected.sign).toBe('cancer');
    });

    it('should calculate with dominant governing (default)', () => {
      const input = {
        planetaryPositions: mockPlanetaryPositions
      };

      const result = getAlchemicalStateWithVectors(input);

      expect(result.selected).toBeDefined();
      const magnitudes = Object.values(result.signVectors).map(v => v.magnitude);
      const maxMagnitude = Math.max(...magnitudes);
      expect(result.selected.magnitude).toBe(maxMagnitude);
    });

    it('should handle ensemble governing mode', () => {
      const input = {
        planetaryPositions: {
          ...mockPlanetaryPositions,
          Ascendant: { sign: 'libra', degree: 0, isRetrograde: false }
        },
        governing: 'ensemble' as const
      };

      const result = getAlchemicalStateWithVectors(input);

      expect(result.selected).toBeDefined();
      expect(result.selected.components).toBeDefined();
    });

    it('should handle missing planetary data gracefully', () => {
      const input = {
        planetaryPositions: {},
        governing: 'sun' as const
      };

      const result = getAlchemicalStateWithVectors(input);

      expect(result).toBeDefined();
      expect(result.selected).toBeDefined();
    });

    it('should handle invalid governing mode by falling back to dominant', () => {
      const input = {
        planetaryPositions: {
          Sun: undefined as any,
          Moon: undefined as any
        },
        governing: 'sun' as const
      };

      const result = getAlchemicalStateWithVectors(input);

      expect(result.selected).toBeDefined();
    });

    it('should produce normalized ESMS values', () => {
      const input = {
        planetaryPositions: mockPlanetaryPositions
      };

      const result = getAlchemicalStateWithVectors(input);

      const sum = result.blendedAlchemical.Spirit +
                  result.blendedAlchemical.Essence +
                  result.blendedAlchemical.Matter +
                  result.blendedAlchemical.Substance;

      expect(sum).toBeCloseTo(1.5);
    });

    it('should handle extreme edge cases', () => {
      const input = {
        planetaryPositions: {
          Sun: { sign: '' as any, degree: Infinity, isRetrograde: null as any }
        },
        aspects: [
          {
            planet1: null as any,
            planet2: undefined as any,
            type: 'invalid' as any,
            orb: NaN,
            isApplying: 'maybe' as any
          }
        ],
        season: null as any,
        governing: 'invalid' as any
      };

      expect(() => getAlchemicalStateWithVectors(input)).not.toThrow();
      const result = getAlchemicalStateWithVectors(input);
      expect(result).toBeDefined();
      expect(result.selected).toBeDefined();
    });
  });
});