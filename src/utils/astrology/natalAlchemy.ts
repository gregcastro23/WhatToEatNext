
import { performAlchemicalAnalysis, deriveAlchemicalFromElemental } from '@/data/unified/alchemicalCalculations';
import type { ElementalProperties } from '@/types/alchemy';
import type { NatalChart, Planet } from '@/types/natalChart';
import type { AlchemicalState } from '@/utils/monica/types';

// Define weights for planets
const PLANETARY_WEIGHTS: Record<string, number> = {
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
    const weight = PLANETARY_WEIGHTS[planetName] || 0;

    if (weight > 0) {
      const sign = planet.sign;
      const properties = SIGN_PROPERTIES[sign];
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
  
  // Heuristic to map elements and modalities to alchemical properties
  const alchemicalState: AlchemicalState = {
      fire: elementalScores.Fire,
      water: elementalScores.Water,
      air: elementalScores.Air,
      earth: elementalScores.Earth,
      spirit: (elementalScores.Air + modalityScores.Cardinal) / 2,
      essence: (elementalScores.Water + modalityScores.Mutable) / 2,
      matter: (elementalScores.Earth + modalityScores.Fixed) / 2,
      substance: (elementalScores.Fire + modalityScores.Fixed) / 2,
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

    const alchemicalProps = deriveAlchemicalFromElemental(elementalProps);

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
