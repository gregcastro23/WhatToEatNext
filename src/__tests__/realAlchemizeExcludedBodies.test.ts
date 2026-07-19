import { alchemize, alchemizeDetailed } from '../services/RealAlchemizeService';

/**
 * The aspect-participating body exclusion list (nodes, Chiron, Lilith,
 * Vertex, Pars Fortune, MC) was a literal `===` list that spelled "South
 * Node" with a space but "North Node" without one ("NorthNode"). The Swiss-
 * Ephemeris backend emits both node keys WITH a space ("North Node", "South
 * Node" — verified live 2026-07-19), so "South Node" was excluded correctly
 * while "North Node" silently participated in Layer-3 aspects whenever
 * backend positions were live. These tests pin the fix: every spelling of
 * every excluded body must be a no-op, symmetrically.
 */

const REAL_PLANETS: Record<string, { sign: string; degree: number; minute: number }> = {
  Sun: { sign: 'cancer', degree: 26, minute: 58 },
  Moon: { sign: 'libra', degree: 5, minute: 30 },
  Mercury: { sign: 'cancer', degree: 17, minute: 8 },
  Venus: { sign: 'virgo', degree: 10, minute: 54 },
  Mars: { sign: 'gemini', degree: 14, minute: 37 },
  Jupiter: { sign: 'leo', degree: 4, minute: 13 },
  Saturn: { sign: 'aries', degree: 14, minute: 42 },
  Uranus: { sign: 'gemini', degree: 4, minute: 33 },
  Neptune: { sign: 'aries', degree: 4, minute: 22 },
  Pluto: { sign: 'aquarius', degree: 4, minute: 27 },
};

// A node placement chosen to actually form an aspect with something above
// (conjunct Moon at 5°30' Libra), so an unexcluded node would visibly perturb
// the totals rather than coincidentally landing somewhere aspect-free.
const NODE_SPELLINGS: Record<string, { sign: string; degree: number; minute: number }> = {
  'North Node': { sign: 'libra', degree: 6, minute: 0 },
  NorthNode: { sign: 'libra', degree: 6, minute: 0 },
  'South Node': { sign: 'aries', degree: 6, minute: 0 },
  SouthNode: { sign: 'aries', degree: 6, minute: 0 },
  'True Node': { sign: 'libra', degree: 6, minute: 0 },
  'Mean Node': { sign: 'libra', degree: 6, minute: 0 },
  Chiron: { sign: 'libra', degree: 6, minute: 0 },
  Lilith: { sign: 'libra', degree: 6, minute: 0 },
  Vertex: { sign: 'libra', degree: 6, minute: 0 },
  'Pars Fortune': { sign: 'libra', degree: 6, minute: 0 },
  MC: { sign: 'libra', degree: 6, minute: 0 },
};

describe('excluded aspect bodies', () => {
  const baseline = alchemize(REAL_PLANETS, null, new Date('2026-07-19T19:22:00Z'));

  // Scope note: `esms` and `kalchm` are driven entirely by `signMap` +
  // aspects, both of which route through the exclusion check this PR fixes
  // — so they are the correct signal for "does this body participate in
  // Layer 3". `thermodynamicProperties`/`monica` additionally depend on
  // elemental totals (Fire/Water/Earth/Air), which are accumulated in a
  // SEPARATE loop that has never been gated by the exclusion check for ANY
  // body (not even the correctly-spelled "South Node"/"MC") — a real,
  // broader, pre-existing gap, but a different one from what this PR fixes.
  // Asserting elemental equality here would therefore fail even after this
  // fix, for a reason unrelated to the bug under test.
  test.each(Object.entries(NODE_SPELLINGS))(
    'adding %s does not change ESMS or kalchm',
    (name, position) => {
      const withBody = alchemize(
        { ...REAL_PLANETS, [name]: position },
        null,
        new Date('2026-07-19T19:22:00Z'),
      );
      expect(withBody.esms).toEqual(baseline.esms);
      expect(withBody.kalchm).toBe(baseline.kalchm);
    },
  );

  test('the specific bug: "North Node" and "South Node" are symmetric', () => {
    // Before the fix, "South Node" (excluded) was a no-op but "North Node"
    // (not excluded) perturbed ESMS via the aspect it forms with the Moon —
    // this asserts both are now no-ops.
    const withNorth = alchemize(
      { ...REAL_PLANETS, 'North Node': NODE_SPELLINGS['North Node'] },
      null,
      new Date('2026-07-19T19:22:00Z'),
    );
    const withSouth = alchemize(
      { ...REAL_PLANETS, 'South Node': NODE_SPELLINGS['South Node'] },
      null,
      new Date('2026-07-19T19:22:00Z'),
    );
    expect(withNorth.esms).toEqual(baseline.esms);
    expect(withSouth.esms).toEqual(baseline.esms);
  });

  test('alchemizeDetailed: North Node contributes zero ESMS, symmetric with South Node', () => {
    // perPlanet still gets AN ENTRY for excluded bodies (that part of the
    // per-body loop is the separate, pre-existing gap noted above), but its
    // esms must be all-zero — the aspect/ESMS-relevant half of the fix.
    const detailed = alchemizeDetailed(
      { ...REAL_PLANETS, 'North Node': NODE_SPELLINGS['North Node'] },
      null,
      new Date('2026-07-19T19:22:00Z'),
    );
    expect(detailed.perPlanet['North Node'].esms).toEqual({
      Spirit: 0,
      Essence: 0,
      Matter: 0,
      Substance: 0,
    });
    expect(detailed.esms).toEqual(baseline.esms);
  });

  test('real planets still participate (the exclusion is not over-broad)', () => {
    const withoutMars = alchemize(
      Object.fromEntries(
        Object.entries(REAL_PLANETS).filter(([name]) => name !== 'Mars'),
      ),
      null,
      new Date('2026-07-19T19:22:00Z'),
    );
    expect(withoutMars.esms).not.toEqual(baseline.esms);
  });
});
