// Type imports
import type { ElementalProperties } from '@/types/unified';

// Internal imports
import { createLogger } from '@/utils/logger';

// Logger
const logger = createLogger('GregsEnergy');

/**
 * Interface representing the count of each elemental and alchemical property
 */
export interface ElementalAlchemicalCounts {
  // Alchemical properties
  Spirit: number,
  Essence: number,
  Matter: number,
  Substance: number;

  // Elemental characters
  Fire: number,
  Water: number,
  Air: number,
  Earth: number;
}

/**
 * Thermodynamic metrics for energy calculations
 */
export interface ThermodynamicMetrics {
  heat: number; // Thermal energy from celestial friction (0-1)
  entropy: number; // Disorder in planetary system (0-1)
  reactivity: number; // Chemical potential for transformation (0-1)
  gregsEnergy: number; // Free energy metric (0-1)
}

/**
 * Represents the state of elemental and alchemical properties in a system
 */
export interface ElementalState {
  fire: number; // Combustive/transformative energy
  water: number; // Fluid/adaptive capacity
  air: number; // Gaseous/diffusive quality
  earth: number; // Solid/stabilizing force
  spirit: number; // Ethereal/creative essence (non-material)
  essence: number; // Vital/animating principle
  matter: number; // Physical manifestation
  substance: number; // Structural integrity
}

/**
 * Planetary modifiers for elemental and alchemical properties
 */
const planetaryModifiers: Record<string, Record<string, number>> = {
  Sun: {
    Fire: 0.3,
    Water: -0.1,
    Air: 0.1,
    Earth: -0.1,
    Spirit: 0.2,
    Essence: 0,
    Matter: -0.1,
    Substance: 0,
  },
  Moon: {Fire: -0.1,
    Water: 0.3,
    Air: 0,
    Earth: 0.1,
    Spirit: 0,
    Essence: 0.2,
    Matter: 0.1,
    Substance: 0},
  Mars: {Fire: 0.4,
    Water: -0.2,
    Air: -0.1,
    Earth: 0,
    Spirit: 0.3,
    Essence: -0.1,
    Matter: 0.2,
    Substance: -0.1},
  Mercury: {Air: 0.3,
    Earth: 0.1,
    Fire: 0,
    Water: -0.1,
    Spirit: 0.1,
    Essence: 0,
    Matter: 0.1,
    Substance: 0.2},
  Jupiter: {Air: 0.2,
    Fire: 0.1,
    Water: 0.1,
    Earth: -0.1,
    Spirit: 0.2,
    Essence: 0.1,
    Matter: 0,
    Substance: 0},
  Venus: {Water: 0.3,
    Earth: 0.2,
    Air: -0.1,
    Fire: -0.2,
    Essence: 0.2,
    Matter: 0.1,
    Spirit: 0,
    Substance: 0},
  Saturn: {Earth: 0.4,
    Air: -0.1,
    Water: -0.1,
    Fire: -0.2,
    Matter: 0.2,
    Substance: 0.1,
    Spirit: -0.1,
    Essence: 0},
};

/**
 * Calculate Greg's Energy thermodynamic metrics
 */
export function calculateGregsEnergy(elementalCounts: ElementalAlchemicalCounts): ThermodynamicMetrics {
  try {
    const { Spirit, Essence, Matter, Substance, Fire, Water, Air, Earth } = elementalCounts;

    // Heat calculation (thermal energy from celestial friction)
    const heatNum = Math.pow(Spirit, 2) + Math.pow(Fire, 2);
    const heatDen = Math.pow(Substance + Essence + Matter + Water + Air + Earth, 2);
    const heat = heatDen > 0 ? heatNum / heatDen : 0;

    // Entropy calculation (disorder in planetary system)
    const entropyNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2);
    const entropyDen = Math.pow(Essence + Matter + Earth + Water, 2);
    const entropy = entropyDen > 0 ? entropyNum / entropyDen : 0;

    // Reactivity calculation (chemical potential for transformation)
    const reactivityNum = Math.pow(Spirit, 2) + Math.pow(Substance, 2) + Math.pow(Essence, 2) + Math.pow(Fire, 2) + Math.pow(Air, 2) + Math.pow(Water, 2);
    const reactivityDen = Math.pow(Matter + Earth, 2);
    const reactivity = reactivityDen > 0 ? reactivityNum / reactivityDen : 0;

    // Greg's Energy (free energy metric)
    const gregsEnergy = heat - (entropy * reactivity);

    return {
      heat: Math.max(0, Math.min(1, heat)),
      entropy: Math.max(0, Math.min(1, entropy)),
      reactivity: Math.max(0, Math.min(1, reactivity)),
      gregsEnergy: Math.max(0, Math.min(1, gregsEnergy)),
    };
  } catch (error) {
    logger.error('Error calculating Gregs energy:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return {heat: 0,
      entropy: 0,
      reactivity: 0,
      gregsEnergy: 0};
  }
}

/**
 * Apply planetary modifiers to elemental counts
 */
export function applyPlanetaryModifiers(baseCounts: ElementalAlchemicalCounts,
  planets: string[]): ElementalAlchemicalCounts {
  try {
    const result = { ...baseCounts };

    planets.forEach(planet => {
      const modifiers = planetaryModifiers[planet],
      if (modifiers) {
        Object.entries(modifiers).forEach(([property, modifier]) => {
          if (result[property as keyof ElementalAlchemicalCounts] !== undefined) {
            result[property as keyof ElementalAlchemicalCounts] += modifier;
          }
        });
      }
    });

    return result;
  } catch (error) {
    logger.error('Error applying planetary modifiers:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return baseCounts;
  }
}

/**
 * Create default elemental alchemical counts
 */
export function createDefaultElementalAlchemicalCounts(): ElementalAlchemicalCounts {
  return {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0,
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0};
}
