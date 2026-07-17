import { deriveLiveSkyQuantities } from '../utils/liveSkyQuantities';
import { elementalToAlchemicalApproximation } from '../utils/monicaKalchmCalculations';

/**
 * The exact shape AlchemicalContext's provider builds (see provider.tsx
 * extractPositions): Title-case planet keys, lowercase sign, degree, minute,
 * exactLongitude, isRetrograde. If this drifts, deriveLiveSkyQuantities returns
 * null and callers silently fall back to the disclaimed elemental
 * approximation — the very bug this replaced — so pin the contract here.
 */
const CONTEXT_POSITIONS: Record<string, unknown> = {
  Sun: { sign: 'leo', degree: 22, minute: 14, exactLongitude: 142.23, isRetrograde: false },
  Moon: { sign: 'pisces', degree: 3, minute: 2, exactLongitude: 333.03, isRetrograde: false },
  Mercury: { sign: 'virgo', degree: 8, minute: 40, exactLongitude: 158.67, isRetrograde: false },
  Venus: { sign: 'cancer', degree: 17, minute: 30, exactLongitude: 107.5, isRetrograde: false },
  Mars: { sign: 'aries', degree: 1, minute: 12, exactLongitude: 1.2, isRetrograde: false },
  Jupiter: { sign: 'sagittarius', degree: 25, minute: 0, exactLongitude: 265.0, isRetrograde: false },
  Saturn: { sign: 'capricorn', degree: 11, minute: 6, exactLongitude: 281.1, isRetrograde: true },
  Uranus: { sign: 'aquarius', degree: 6, minute: 30, exactLongitude: 306.5, isRetrograde: false },
  Neptune: { sign: 'capricorn', degree: 14, minute: 48, exactLongitude: 284.8, isRetrograde: false },
  Pluto: { sign: 'scorpio', degree: 19, minute: 54, exactLongitude: 229.9, isRetrograde: false },
  Ascendant: { sign: 'gemini', degree: 4, minute: 24, exactLongitude: 64.4, isRetrograde: false },
};

const isFiniteEsms = (v: Record<string, number>) =>
  ['Spirit', 'Essence', 'Matter', 'Substance'].every(
    (k) => typeof v[k] === 'number' && Number.isFinite(v[k]),
  );

describe('deriveLiveSkyQuantities', () => {
  test('derives real quantities from the shape AlchemicalContext actually provides', () => {
    const esms = deriveLiveSkyQuantities(CONTEXT_POSITIONS, true);
    expect(esms).not.toBeNull();
    expect(isFiniteEsms(esms as unknown as Record<string, number>)).toBe(true);
    // A real sky is never all-zero, and Essence draws on the most planets.
    const total = esms!.Spirit + esms!.Essence + esms!.Matter + esms!.Substance;
    expect(total).toBeGreaterThan(0);
  });

  test('does NOT reproduce the elemental approximation it replaced', () => {
    // The approximation reads Fire/Water/Earth/Air; the engine reads the planets.
    // If these ever coincide, the fix is not doing anything.
    const esms = deriveLiveSkyQuantities(CONTEXT_POSITIONS, true)!;
    const approximated = elementalToAlchemicalApproximation({
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    });
    expect(esms.Spirit).not.toBeCloseTo(approximated.Spirit, 3);
  });

  test('sect changes the result, so isDaytime is actually honoured', () => {
    const day = deriveLiveSkyQuantities(CONTEXT_POSITIONS, true)!;
    const night = deriveLiveSkyQuantities(CONTEXT_POSITIONS, false)!;
    expect(day.Matter).not.toBeCloseTo(night.Matter, 3);
  });

  test('aspects are applied (Layer 3), not just sect and dignity', () => {
    // Same signs, but longitudes stripped -> no aspects can be formed. If the
    // results match, aspects are not reaching the engine.
    const noLongitudes: Record<string, unknown> = {};
    for (const [planet, pos] of Object.entries(CONTEXT_POSITIONS)) {
      noLongitudes[planet] = { sign: (pos as { sign: string }).sign };
    }
    const withAspects = deriveLiveSkyQuantities(CONTEXT_POSITIONS, true)!;
    const withoutAspects = deriveLiveSkyQuantities(noLongitudes, true)!;
    expect(withAspects.Matter).not.toBeCloseTo(withoutAspects.Matter, 3);
  });

  test('accepts capitalized signs, since position sources disagree on casing', () => {
    const capitalized: Record<string, unknown> = {};
    for (const [planet, pos] of Object.entries(CONTEXT_POSITIONS)) {
      const p = pos as { sign: string; degree: number; exactLongitude: number };
      capitalized[planet] = {
        ...p,
        sign: p.sign.charAt(0).toUpperCase() + p.sign.slice(1),
      };
    }
    const lower = deriveLiveSkyQuantities(CONTEXT_POSITIONS, true)!;
    const upper = deriveLiveSkyQuantities(capitalized, true)!;
    expect(upper.Spirit).toBeCloseTo(lower.Spirit, 6);
  });

  test('returns null (never a wrong number) when positions are unusable', () => {
    expect(deriveLiveSkyQuantities(undefined, true)).toBeNull();
    expect(deriveLiveSkyQuantities(null, true)).toBeNull();
    expect(deriveLiveSkyQuantities({}, true)).toBeNull();
    expect(deriveLiveSkyQuantities({ Sun: null, Moon: { degree: 4 } }, true)).toBeNull();
  });
});
