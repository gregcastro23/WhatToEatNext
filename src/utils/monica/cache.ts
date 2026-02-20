// src/utils/monica/cache.ts

import { ALCHEMICAL_PILLARS, AlchemicalPillar } from '@/constants/alchemicalPillars';
import { calculateMonicaMetrics } from './calculations';
import { AlchemicalState, MonicaMetrics } from './types';

/**
 * A cache to store pre-computed MonicaMetrics for each alchemical pillar.
 * The key is the pillar ID.
 */
const monicaMetricsCache = new Map<number, MonicaMetrics>();

/**
 * Pre-computes the MonicaMetrics for all defined alchemical pillars
 * and populates the cache. This function is executed once when the module is loaded.
 */
function precomputeMonicaMetrics() {
  for (const pillar of ALCHEMICAL_PILLARS) {
    if (!monicaMetricsCache.has(pillar.id)) {
      // The `effects` object in AlchemicalPillar gives us values for Spirit, Essence, Matter, and Substance.
      // However, the AlchemicalState for Monica calculations also requires elemental values (fire, water, air, earth).
      // The pillar itself has elemental associations, but the calculation requires numeric inputs.
      // Based on the previous implementation, we used a simple 1 or 0 if the primary element matched.
      // We will replicate that logic here for consistency.
      const state: AlchemicalState = {
        spirit: pillar.effects.Spirit,
        essence: pillar.effects.Essence,
        matter: pillar.effects.Matter,
        substance: pillar.effects.Substance,
        fire: pillar.elementalAssociations?.primary === 'Fire' ? 1 : 0,
        water: pillar.elementalAssociations?.primary === 'Water' ? 1 : 0,
        air: pillar.elementalAssociations?.primary === 'Air' ? 1 : 0,
        earth: pillar.elementalAssociations?.primary === 'Earth' ? 1 : 0,
      };

      const metrics = calculateMonicaMetrics(state);
      monicaMetricsCache.set(pillar.id, metrics);
    }
  }
}

/**
 * Retrieves the pre-computed MonicaMetrics for a given alchemical pillar ID.
 *
 * @param pillarId The ID of the alchemical pillar.
 * @returns The cached MonicaMetrics, or undefined if the pillar ID is not found.
 */
export function getMonicaMetricsForPillar(pillarId: number): MonicaMetrics | undefined {
  return monicaMetricsCache.get(pillarId);
}

// Immediately run the pre-computation when the module is initialized.
precomputeMonicaMetrics();

console.log('MonicaMetrics have been pre-computed and cached for all alchemical pillars.');
