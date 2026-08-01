import { performAlchemicalAnalysis } from "@/data/unified/alchemicalCalculations";
import type { ElementalProperties } from "@/types/alchemy";
import type { AlchemicalProperties } from "@/types/celestial";
import type { NatalChart } from "@/types/natalChart";
import type { AlchemicalState } from "@/utils/monica/types";
import {
  calculateAlchemicalFromPlanets,
  inertialMassWeight,
  isSectDiurnalForBirth,
} from '@/utils/planetaryAlchemyMapping';

/**
 * Astrological interpretive weights for natal chart scoring.
 * Blends traditional astrological significance with NASA mass-ratio normalization.
 * Luminaries (Sun/Moon) and Ascendant get extra astrological weight.
 */
const PLANETARY_WEIGHTS_ASTRO: Record<string, number> = {
  Sun: 1.5,
  Moon: 1.5,
  Mercury: 1,
  Venus: 1,
  Mars: 1,
  Jupiter: 1.2,
  Saturn: 1.2,
  Uranus: 0.8,
  Neptune: 0.8,
  Pluto: 0.8,
  Ascendant: 1.5,
};

/**
 * Composite weight: 60% astrological tradition + 40% physical mass.
 *
 * BASIS of the 0.6 — RULED (ADR-009), not measured. With the astro table
 * normalized below, 0.6 now means what it always claimed: astrological
 * convention carries the larger share of a NATAL INTERPRETIVE weight, physical
 * mass the smaller. That is a product judgement about what a natal chart is,
 * and it is legitimately ruled rather than derived. It is deliberately NOT
 * fitted: there is no target metric to fit it against, and inventing one would
 * launder a hand value into a false "MEASURED".
 *
 * ⚠️ This 0.6 is NOT the 0.6/0.4 sign/sect split in planetaryAlchemyMapping,
 * RealAlchemizeService or main.py. Same number, unrelated meaning. Do not
 * "unify" them.
 *
 * Two defects fixed here (ADR-009 decision 3):
 *
 * 1. `PLANETARY_WEIGHTS_ASTRO` was UNNORMALIZED (0.8–1.5), so its term ran
 *    0.48–0.90 while the mass term was capped at 0.40. The declared 60/40 was
 *    in practice ~80/20 — and for Pluto exactly 100/0, because the old
 *    Pluto-anchored mass scale returned 0 and the "physical grounding"
 *    contributed literally nothing.
 * 2. The mass term now comes from the canonical inertial scale, so no body is
 *    annihilated and the Ascendant gets its ruled 1.0 instead of the 0.5
 *    midpoint guess below.
 *
 * Normalized by MAX, deliberately, NOT min-max: min-max would map the lowest
 * astro value (0.8 — Uranus, Neptune, Pluto) to exactly 0, reintroducing on the
 * astro axis the precise annihilation this ADR removes. Divide-by-max preserves
 * ratios and caps the astro term at exactly 0.6, as declared.
 */
const _ASTRO_MAX = Math.max(...Object.values(PLANETARY_WEIGHTS_ASTRO));

const NATAL_WEIGHTS: Record<string, number> = Object.fromEntries(
  Object.entries(PLANETARY_WEIGHTS_ASTRO).map(([planet, astroWeight]) => [
    planet,
    (astroWeight / _ASTRO_MAX) * 0.6 + inertialMassWeight(planet) * 0.4,
  ])
);

// Define element and modality for each sign
const SIGN_PROPERTIES: Record<string, { element: 'Fire' | 'Earth' | 'Air' | 'Water', modality: 'Cardinal' | 'Fixed' | 'Mutable' }> = {
  Aries: { element: 'Fire', modality: 'Cardinal' },
  Taurus: { element: 'Earth', modality: 'Fixed' },
  Gemini: { element: 'Air', modality: 'Mutable' },
  Cancer: { element: 'Water', modality: 'Cardinal' },
  Leo: { element: 'Fire', modality: 'Fixed' },
  Virgo: { element: 'Earth', modality: 'Mutable' },
  Libra: { element: 'Air', modality: 'Cardinal' },
  Scorpio: { element: 'Water', modality: 'Fixed' },
  Sagittarius: { element: 'Fire', modality: 'Mutable' },
  Capricorn: { element: 'Earth', modality: 'Cardinal' },
  Aquarius: { element: 'Air', modality: 'Fixed' },
  Pisces: { element: 'Water', modality: 'Mutable' },
};

/**
 * The chart's four alchemical quantities (ESMS), as raw planetary sums.
 *
 * Quantities come from which planets the chart holds, plus sect, dignity and
 * aspects — they CANNOT be derived from the elements of the signs those planets
 * occupy (see the header of `@/utils/planetaryAlchemyMapping`). This module used
 * to synthesize them from elements and modalities, and inverted at that (Spirit
 * from Air, Substance from Fire), then persist the result via UserContext.
 *
 * `natalChartService` already stores the correct, aspect-aware values on the
 * chart, so prefer those; recompute from the chart's own planets only when an
 * older stored chart lacks them.
 */
function resolveNatalQuantities(
  chart: NatalChart,
  planets: Array<{ name: string; sign: string; position?: number }>,
): AlchemicalProperties {
  if (chart.alchemicalProperties) return chart.alchemicalProperties;

  // Derived from the same planet list the elemental scoring walks, so the two
  // readings can never disagree about which bodies the chart contains.
  const positions: Record<
    string,
    { sign: string; degree?: number; exactLongitude?: number }
  > = {};
  for (const planet of planets) {
    if (typeof planet?.sign === "string" && planet.sign) {
      const exactLongitude =
        typeof planet.position === "number" && planet.position > 0
          ? planet.position
          : undefined;
      positions[planet.name] = {
        sign: planet.sign.toLowerCase(),
        ...(exactLongitude !== undefined
          ? { degree: exactLongitude % 30, exactLongitude }
          : {}),
      };
    }
  }
  if (Object.keys(positions).length === 0) {
    return { Spirit: 0, Essence: 0, Matter: 0, Substance: 0 };
  }

  const birthDate = chart.birthData?.dateTime
    ? new Date(chart.birthData.dateTime)
    : null;
  const diurnal = birthDate ? isSectDiurnalForBirth(birthDate) : true;

  return calculateAlchemicalFromPlanets(positions, diurnal);
}

/**
 * Calculates the alchemical state from a natal chart.
 * @param chart - The user's natal chart.
 * @returns The alchemical state derived from the chart.
 */
export function calculateAlchemicalState(chart: NatalChart): AlchemicalState {
  const elementalScores: ElementalProperties = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityScores = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  const planets = [...chart.planets, { name: 'Ascendant', sign: chart.ascendant, position: 0 }];

  for (const planet of planets) {
    const planetName = planet.name;
    const weight = NATAL_WEIGHTS[planetName] || 0;

    if (weight > 0) {
      // Natal chart signs are stored lowercase (ZodiacSignType, via
      // natalChartService.normalizeSignName), but SIGN_PROPERTIES is keyed by
      // capitalized names. Normalize before lookup — without this every lookup
      // missed, so elementalScores/modalityScores stayed 0 and the entire
      // profile (elements + ESMS + thermodynamics) computed to zero.
      const sign = planet.sign;
      const normalizedSign =
        typeof sign === "string" && sign.length > 0
          ? sign.charAt(0).toUpperCase() + sign.slice(1).toLowerCase()
          : "";
      const properties = SIGN_PROPERTIES[normalizedSign];
      if (properties) {
        elementalScores[properties.element] += weight;
        modalityScores[properties.modality] += weight;
      }
    }
  }

  // Normalize scores
  const totalElementalScore = Object.values(elementalScores).reduce((sum, score) => sum + score, 0);
  if (totalElementalScore > 0) {
    for (const element in elementalScores) {
      elementalScores[element as keyof ElementalProperties] /= totalElementalScore;
    }
  }

  const totalModalityScore = Object.values(modalityScores).reduce((sum, score) => sum + score, 0);
  if (totalModalityScore > 0) {
      for (const modality in modalityScores) {
          modalityScores[modality as keyof typeof modalityScores] /= totalModalityScore;
      }
  }

  // Elements come from the signs the planets occupy (computed above).
  // Quantities come from the planets themselves — never from those elements.
  // Expressed as shares of the chart total so they stay on the same 0-1 scale
  // as the normalized elemental scores, which is what the thermodynamics
  // downstream expects.
  const quantities = resolveNatalQuantities(chart, planets);
  const quantityTotal =
    quantities.Spirit + quantities.Essence + quantities.Matter + quantities.Substance;
  const share = (value: number) => (quantityTotal > 0 ? value / quantityTotal : 0);

  const alchemicalState: AlchemicalState = {
      fire: elementalScores.Fire,
      water: elementalScores.Water,
      air: elementalScores.Air,
      earth: elementalScores.Earth,
      spirit: share(quantities.Spirit),
      essence: share(quantities.Essence),
      matter: share(quantities.Matter),
      substance: share(quantities.Substance),
  };

  return alchemicalState;
}

/**
 * Calculates the full alchemical profile from a natal chart.
 * @param chart - The user's natal chart.
 * @returns The user's alchemical profile.
 */
export function calculateAlchemicalProfile(chart: NatalChart) {
    const alchemicalState = calculateAlchemicalState(chart);

    const elementalProps: ElementalProperties = {
        Fire: alchemicalState.fire,
        Water: alchemicalState.water,
        Air: alchemicalState.air,
        Earth: alchemicalState.earth,
    };

    // The quantities are already on the state, derived from the planets. This
    // previously called deriveAlchemicalFromElemental(elementalProps), fabricating
    // them from the elements a second time — the derivation the engine forbids.
    const alchemicalProps: AlchemicalProperties = {
        Spirit: alchemicalState.spirit,
        Essence: alchemicalState.essence,
        Matter: alchemicalState.matter,
        Substance: alchemicalState.substance,
    };

    const metrics = performAlchemicalAnalysis(alchemicalProps, elementalProps);

    return {
        ...alchemicalState,
        heat: metrics.heat,
        entropy: metrics.entropy,
        reactivity: metrics.reactivity,
        gregsEnergy: metrics.gregsEnergy,
        kAlchm: metrics.kalchm,
        monicaConstant: metrics.monica,
    };
}
