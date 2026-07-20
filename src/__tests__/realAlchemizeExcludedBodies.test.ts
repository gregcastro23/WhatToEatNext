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

  // An excluded body must be a COMPLETE no-op: it may not touch ESMS (the
  // aspect/signMap loop) nor the elemental totals (the per-body loop). Both
  // loops are now gated. Elemental equality is the stronger assertion — it
  // catches the pollution path where getPlanetarySectElement() silently
  // returns "Air" for a body it does not recognize, so an unrecognized key
  // pushed 0.4 of phantom Air into every chart that carried one.
  test.each(Object.entries(NODE_SPELLINGS))(
    'adding %s changes nothing at all',
    (name, position) => {
      const withBody = alchemize(
        { ...REAL_PLANETS, [name]: position },
        null,
        new Date('2026-07-19T19:22:00Z'),
      );
      expect(withBody.esms).toEqual(baseline.esms);
      expect(withBody.kalchm).toBe(baseline.kalchm);
      expect(withBody.elementalProperties).toEqual(baseline.elementalProperties);
      expect(withBody.thermodynamicProperties).toEqual(
        baseline.thermodynamicProperties,
      );
      expect(withBody.monica).toBe(baseline.monica);
      // Not a planet, so it earns no momentum entry — its alchmWeight would
      // otherwise fall back to 1.0, i.e. Pluto's mass.
      expect(withBody.planetaryMomentum).not.toHaveProperty(name);
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

  test('alchemizeDetailed gives excluded bodies no perPlanet entry at all', () => {
    // perPlanet keys are consumed as "the real planets in this chart" (the
    // free-body-diagram builder reconciles against them), so an MC or node
    // entry — populated `elements` beside all-zero `esms` — was misleading.
    const detailed = alchemizeDetailed(
      {
        ...REAL_PLANETS,
        'North Node': NODE_SPELLINGS['North Node'],
        MC: NODE_SPELLINGS.MC,
      },
      null,
      new Date('2026-07-19T19:22:00Z'),
    );
    expect(detailed.perPlanet['North Node']).toBeUndefined();
    expect(detailed.perPlanet.MC).toBeUndefined();
    expect(Object.keys(detailed.perPlanet).sort()).toEqual(
      Object.keys(REAL_PLANETS).sort(),
    );
    expect(detailed.esms).toEqual(baseline.esms);
    expect(detailed.elementalProperties).toEqual(baseline.elementalProperties);
  });

  test('several excluded bodies at once are still a complete no-op', () => {
    // The live sky carries MC and BOTH nodes simultaneously — the real-world
    // shape of this bug, where three phantom bodies each pushed 0.4 Air.
    const liveSkyShape = alchemize(
      {
        ...REAL_PLANETS,
        'North Node': NODE_SPELLINGS['North Node'],
        'South Node': NODE_SPELLINGS['South Node'],
        MC: NODE_SPELLINGS.MC,
      },
      null,
      new Date('2026-07-19T19:22:00Z'),
    );
    expect(liveSkyShape.elementalProperties).toEqual(baseline.elementalProperties);
    expect(liveSkyShape.thermodynamicProperties).toEqual(
      baseline.thermodynamicProperties,
    );
    expect(liveSkyShape.monica).toBe(baseline.monica);
    expect(liveSkyShape.esms).toEqual(baseline.esms);
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
