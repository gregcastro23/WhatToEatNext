import { alchemize, alchemizeDetailed } from '@/services/RealAlchemizeService';

/**
 * An unrecognised sign has no element.
 *
 * RealAlchemizeService read one as "Air", so the planet's 0.6 sign weight went
 * to Air with no basis, and `metadata.chartRuler` reported "Air" for such a Sun
 * (and "Fire" when there was no Sun at all, via a default of aries). Now the
 * sign weight is dropped, `perPlanet[*].signElement` is null and chartRuler is
 * omitted. backend/alchm_kitchen/main.py mirrors this (see
 * backend/tests/test_main_sign_element.py).
 *
 * Fixture: one diurnal Mars, whose sect element is Fire (0.4); the sign element
 * carries 0.6. Elementals are divided by max(1, total), so a lone planet's
 * weights read back unscaled.
 */

const DATE = new Date(Date.UTC(2024, 5, 1, 12));

const mars = (sign: string): Parameters<typeof alchemize>[0] => ({
  Mars: { sign, degree: 10, minute: 0 },
});

const RUNNERS: Array<[string, typeof alchemize]> = [
  ['alchemize', alchemize],
  ['alchemizeDetailed', alchemizeDetailed],
];

describe.each(RUNNERS)('%s — unknown sign', (_name, run) => {
  const at = (positions: Parameters<typeof alchemize>[0]): ReturnType<typeof alchemize> =>
    run(positions, null, DATE, { diurnal: true });

  test('control: Mars in aries carries sign (0.6) and sect (0.4) weight, both fire', () => {
    expect(at(mars('aries')).elementalProperties).toEqual({ Fire: 1, Water: 0, Earth: 0, Air: 0 });
  });

  test('Mars in an unrecognised sign keeps only its sect weight — no Air', () => {
    expect(at(mars('not-a-sign')).elementalProperties).toEqual({
      Fire: 0.4,
      Water: 0,
      Earth: 0,
      Air: 0,
    });
  });

  test('control: chartRuler is the element of the Sun’s sign', () => {
    expect(at({ Sun: { sign: 'cancer', degree: 10, minute: 0 } }).metadata.chartRuler).toBe('Water');
  });

  test('chartRuler is omitted when the Sun’s sign is unrecognised', () => {
    expect(at({ Sun: { sign: 'not-a-sign', degree: 10, minute: 0 } }).metadata).not.toHaveProperty(
      'chartRuler',
    );
  });

  test('chartRuler is omitted when there is no Sun', () => {
    expect(at(mars('aries')).metadata).not.toHaveProperty('chartRuler');
  });
});

describe('alchemizeDetailed perPlanet — unknown sign', () => {
  test('signElement is null and only the sect weight is recorded', () => {
    const { perPlanet } = alchemizeDetailed(mars('not-a-sign'), null, DATE, { diurnal: true });
    expect(perPlanet.Mars).toMatchObject({
      signElement: null,
      sectElement: 'Fire',
      elements: { Fire: 0.4, Water: 0, Earth: 0, Air: 0 },
    });
  });

  test('control: a known sign reports its element', () => {
    const { perPlanet } = alchemizeDetailed(mars('libra'), null, DATE, { diurnal: true });
    expect(perPlanet.Mars).toMatchObject({ signElement: 'Air', sectElement: 'Fire' });
  });
});
