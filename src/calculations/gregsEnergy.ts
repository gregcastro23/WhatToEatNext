import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { _calculatePlanetaryPositions } from '../utils/astrologyUtils';
import { calculateSignEnergyStates } from '@/constants/signEnergyStates';

/**
 * A utility function for logging debug information
 * This is a safe replacement for console.log that can be disabled in production
 */
const debugLog = (message: string, ...args: unknown[]): void => {
  // Comment out console.log to avoid linting warnings
  // console.log(message, ...args);
};

/**
 * Interface representing the count of each elemental and alchemical property
 */
export interface ElementalAlchemicalCounts {
  // Alchemical properties
  Spirit: number;
  Essence: number;
  Matter: number;
  Substance: number;
  
  // Elemental characters
  Fire: number;
  Water: number;
  Air: number;
  Earth: number;
}

/**
 * Thermodynamic metrics for energy calculations
 */
export interface ThermodynamicMetrics {
    heat: number;          // Thermal energy from celestial friction (0-1)
    entropy: number;       // Disorder in planetary system (0-1) 
    reactivity: number;    // Chemical potential for transformation (0-1)
    gregsEnergy: number;   // Free energy metric (0-1)
}

/**
 * Represents the state of elemental and alchemical properties in a system
 */
export interface ElementalState {
    fire: number;    // Combustive/transformative energy
    water: number;   // Fluid/adaptive capacity
    air: number;     // Gaseous/diffusive quality
    earth: number;   // Solid/stabilizing force
    spirit: number;  // Ethereal/creative essence (non-material)
    essence: number; // Vital/animating principle
    matter: number;  // Physical manifestation
    substance: number;// Structural integrity
}

/**
 * Mapping of planetary hours for each day of the week
 */
const planetaryHours: Record<string, string[]> = {
    Sunday: ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
    Monday: ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'],
    Tuesday: ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'],
    Wednesday: ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'],
    Thursday: ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'],
    Friday: ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'],
    Saturday: ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
};

/**
 * Modifiers applied to elemental and alchemical properties based on planetary influence
 */
const planetaryModifiers: Record<string, Record<string, number>> = {
    Sun: { Fire: 0.3, Water: -0.1, Air: 0.1, Earth: -0.1, Spirit: 0.2, Essence: 0, Matter: -0.1, Substance: 0 },
    Moon: { Fire: -0.1, Water: 0.3, Air: 0, Earth: 0.1, Spirit: 0, Essence: 0.2, Matter: 0.1, Substance: 0 },
    Mars: { Fire: 0.4, Water: -0.2, Air: -0.1, Earth: 0, Spirit: 0.3, Essence: -0.1, Matter: 0.2, Substance: -0.1 },
    Mercury: { Fire: 0.1, Water: 0.1, Air: 0.3, Earth: -0.1, Spirit: 0.1, Essence: 0.2, Matter: 0, Substance: 0.1 },
    Jupiter: { Fire: 0.2, Water: 0.2, Air: 0.1, Earth: 0.3, Spirit: 0.2, Essence: 0.1, Matter: 0.1, Substance: 0.2 },
    Venus: { Fire: -0.1, Water: 0.2, Air: 0.2, Earth: 0.1, Spirit: 0.1, Essence: 0.3, Matter: -0.1, Substance: 0.1 },
    Saturn: { Fire: -0.2, Water: -0.1, Air: -0.2, Earth: 0.4, Spirit: -0.1, Essence: -0.1, Matter: 0.3, Substance: 0.2 }
};

/**
 * Calculator class that processes elemental states to produce thermodynamic metrics
 */
class ThermodynamicCalculator {
    private readonly MINIMUM_VALUE = 0.1;
    private currentPlanetaryInfluence: keyof typeof planetaryModifiers = 'Sun';

    /**
     * Sets the planetary influence to use when calculating modifiers
     * @param planet The planet to use as influence
     */
    setPlanetaryInfluence(planet: keyof typeof planetaryModifiers): void {
        this.currentPlanetaryInfluence = planet;
    }

    /**
     * Apply planetary modifiers to an elemental state
     * @param state The elemental state to modify
     * @returns Modified elemental state
     */
    private applyPlanetaryModifiers(state: ElementalState): ElementalState {
        const modifiers = planetaryModifiers[this.currentPlanetaryInfluence];
        
        // Apply base modifiers without relying on potentially undefined positions
        // This ensures we always have some valid calculation
        const result = {
            fire: state.fire * (1 + (modifiers.Fire || 0)),
            water: state.water * (1 + (modifiers.Water || 0)),
            air: state.air * (1 + (modifiers.Air || 0)),
            earth: state.earth * (1 + (modifiers.Earth || 0)),
            spirit: state.spirit * (1 + (modifiers.Spirit || 0)),
            essence: state.essence * (1 + (modifiers.Essence || 0)),
            matter: state.matter * (1 + (modifiers.Matter || 0)), 
            substance: state.substance * (1 + (modifiers.Substance || 0))
        };

        debugLog(`Applied ${this.currentPlanetaryInfluence} modifiers to state`);
        return result;
    }

    /**
     * Calculate heat based on elemental state
     * @param state The elemental state
     * @returns Heat value (0-1)
     */
    private calculateHeat(state: ElementalState): number {
        /* Original alchemizer formula:
           Heat = (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2 */
        const numerator = Math.pow(state.spirit, 2) + Math.pow(state.fire, 2);
        const denominator = Math.pow(state.substance + state.essence + state.matter + 
                                    state.water + state.air + state.earth, 2);
        
        // Prevent division by zero
        if (denominator === 0) return 0;
        
        return numerator / denominator;
    }

    /**
     * Calculate entropy based on elemental state
     * @param state The elemental state
     * @returns Entropy value (0-1)
     */
    private calculateEntropy(state: ElementalState): number {
        /* Original alchemizer formula:
           Entropy = (spirit^2 + substance^2 + fire^2 + air^2) / (essence + matter + earth + water)^2 */
        const numerator = Math.pow(state.spirit, 2) + Math.pow(state.substance, 2) + 
                         Math.pow(state.fire, 2) + Math.pow(state.air, 2);
        const denominator = Math.pow(state.essence + state.matter + state.earth + state.water, 2);
        
        // Prevent division by zero
        if (denominator === 0) return 0;
        
        return numerator / denominator;
    }

    /**
     * Calculate reactivity based on elemental state
     * @param state The elemental state
     * @returns Reactivity value (0-1)
     */
    private calculateReactivity(state: ElementalState): number {
        /* Original alchemizer formula:
           Reactivity = (spirit^2 + substance^2 + essence^2 + fire^2 + air^2 + water^2) / (matter + earth)^2 */
        const numerator = Math.pow(state.spirit, 2) + Math.pow(state.substance, 2) + 
                         Math.pow(state.essence, 2) + Math.pow(state.fire, 2) + 
                         Math.pow(state.air, 2) + Math.pow(state.water, 2);
        const denominator = Math.pow(state.matter + state.earth, 2);
        
        // Prevent division by zero
        if (denominator === 0) return 0;
        
        return numerator / denominator;
    }

    /**
     * Calculate Greg's Energy from heat, entropy, and reactivity
     * @param heat Heat value (0-1)
     * @param entropy Entropy value (0-1)
     * @param reactivity Reactivity value (0-1)
     * @returns Greg's Energy value (0-1)
     */
    calculateGregsEnergy(heat: number, entropy: number, reactivity: number): number {
        // First, ensure all inputs are in valid ranges
        const safeHeat = Math.max(0.1, Math.min(1.0, heat));
        const safeEntropy = Math.max(0.1, Math.min(1.0, entropy));
        const safeReactivity = Math.max(0.1, Math.min(1.0, reactivity));
        
        // Use the original formula from the alchemizer
        // gregsEnergy = heat - (entropy * reactivity)
        const rawValue = safeHeat - (safeEntropy * safeReactivity);
        
        // Apply consistently with other metrics - scale from (-1,1) to (0,1)
        const scaledValue = (rawValue + 1) / 2;
        
        // Apply the same non-linear scaling we used on other metrics
        let finalValue = Math.pow(scaledValue, 0.9); // Less aggressive curve
        
        // Ensure the value is within bounds
        finalValue = Math.max(0.2, Math.min(1.0, finalValue));
        
        // Detailed logging of the calculation
        debugLog(`Greg's Energy calculation:
          Inputs: heat=${safeHeat.toFixed(2)}, entropy=${safeEntropy.toFixed(2)}, reactivity=${safeReactivity.toFixed(2)}
          Raw: ${rawValue.toFixed(2)}, Scaled: ${scaledValue.toFixed(2)}, Final: ${finalValue.toFixed(2)}`);
        
        return finalValue;
    }

    /**
     * Validate that an elemental state contains valid values
     * @param state The elemental state to validate
     * @throws Error if state values are invalid
     */
    private validateState(state: ElementalState): void {
        const properties = Object.values(state);
        if (properties.some(val => isNaN(val) || !isFinite(val))) {
            throw new Error('Elemental state values must be valid numbers');
        }
        if (properties.some(val => val < 0)) {
            throw new Error('Elemental state values cannot be negative');
        }
    }

    /**
     * Validate thermodynamic metrics
     * @param metrics The metrics to validate
     * @throws Error if metrics are invalid
     */
    private validateResult(metrics: ThermodynamicMetrics): void {
        const { heat, entropy, reactivity, gregsEnergy } = metrics;
        const values = [heat, entropy, reactivity, gregsEnergy];
        if (values.some(val => isNaN(val) || !isFinite(val))) {
            throw new Error('All thermodynamic metrics must be valid numbers');
        }
    }

    /**
     * Generate thermodynamic metrics from an elemental state
     * @param state The elemental state
     * @returns Thermodynamic metrics
     */
    generateMetrics(state: ElementalState): ThermodynamicMetrics {
        this.validateState(state);
        
        debugLog("Initial state for thermodynamic calculations:", state);
        
        // Apply minimum values to prevent division by zero
        const safeState = {
            spirit: Math.max(state.spirit, this.MINIMUM_VALUE),
            essence: Math.max(state.essence, this.MINIMUM_VALUE),
            matter: Math.max(state.matter, this.MINIMUM_VALUE),
            substance: Math.max(state.substance, this.MINIMUM_VALUE),
            fire: Math.max(state.fire, this.MINIMUM_VALUE),
            water: Math.max(state.water, this.MINIMUM_VALUE),
            air: Math.max(state.air, this.MINIMUM_VALUE),
            earth: Math.max(state.earth, this.MINIMUM_VALUE)
        };

        debugLog("Safe state after minimum values:", safeState);

        // Apply planetary influences
        const modifiedState = this.applyPlanetaryModifiers(safeState);
        debugLog("Modified state after planetary influences:", modifiedState, 
                 "Current planetary influence:", this.currentPlanetaryInfluence);

        const heat = this.calculateHeat(modifiedState);
        const entropy = this.calculateEntropy(modifiedState);
        const reactivity = this.calculateReactivity(modifiedState);
        const gregsEnergy = this.calculateGregsEnergy(heat, entropy, reactivity);

        debugLog("Raw calculated values:", { heat, entropy, reactivity, gregsEnergy });

        const metrics: ThermodynamicMetrics = { 
            heat,
            entropy,
            reactivity,
            gregsEnergy
        };
        
        // Ensure no NaN values in final output
        for (const key in metrics) {
            if (isNaN(metrics[key as keyof ThermodynamicMetrics]) || 
                !isFinite(metrics[key as keyof ThermodynamicMetrics])) {
                debugLog(`Fixed invalid value for ${key}`);
                metrics[key as keyof ThermodynamicMetrics] = 0.5; // Default to middle value
            }
        }
        
        debugLog("Final metrics:", metrics);
        return metrics;
    }

    /**
     * Normalize a value to be between 0 and 1
     * @param value The value to normalize
     * @returns Normalized value between 0 and 1
     */
    private normalizeValue(value: number): number {
        if (isNaN(value) || !isFinite(value)) return 0;
        return Math.max(0, Math.min(1, Number(value.toFixed(2))));
    }
}

/**
 * Utility function to convert legacy format to new ElementalState
 * @param counts The elemental and alchemical property counts
 * @returns An ElementalState object
 */
export function convertToElementalState(counts: ElementalAlchemicalCounts): ElementalState {
    return {
        spirit: counts.Spirit,
        essence: counts.Essence,
        matter: counts.Matter,
        substance: counts.Substance,
        fire: counts.Fire,
        water: counts.Water,
        air: counts.Air,
        earth: counts.Earth
    };
}

// Export a singleton instance of the calculator
export const thermodynamicCalculator = new ThermodynamicCalculator();

/**
 * Calculate heat based on elemental percentages
 * @param firePercentage Fire element percentage (0-1)
 * @param earthPercentage Earth element percentage (0-1)
 * @param airPercentage Air element percentage (0-1)
 * @param waterPercentage Water element percentage (0-1)
 * @returns Heat value (0-1)
 */
export function calculateHeat(
  firePercentage: number,
  earthPercentage: number,
  airPercentage: number,
  waterPercentage: number
): number {
  // Heat formula: fire contributes positively, water negatively, others neutral
  return (firePercentage * 1.5) - (waterPercentage * 1.0) + (airPercentage * 0.3) - (earthPercentage * 0.2);
}

/**
 * Calculate entropy based on elemental percentages
 * @param firePercentage Fire element percentage (0-1)
 * @param earthPercentage Earth element percentage (0-1)
 * @param airPercentage Air element percentage (0-1)
 * @param waterPercentage Water element percentage (0-1)
 * @returns Entropy value (0-1)
 */
export function calculateEntropy(
  firePercentage: number,
  earthPercentage: number,
  airPercentage: number,
  waterPercentage: number
): number {
  // Entropy formula: air contributes positively, earth negatively, others mixed
  return (airPercentage * 1.5) - (earthPercentage * 1.2) + (firePercentage * 0.5) + (waterPercentage * 0.2);
}

/**
 * Calculate reactivity based on elemental percentages
 * @param firePercentage Fire element percentage (0-1)
 * @param earthPercentage Earth element percentage (0-1)
 * @param airPercentage Air element percentage (0-1)
 * @param waterPercentage Water element percentage (0-1)
 * @returns Reactivity value (0-1)
 */
export function calculateReactivity(
  firePercentage: number,
  earthPercentage: number,
  airPercentage: number,
  waterPercentage: number
): number {
  // Reactivity formula: fire and air increase reactivity, earth decreases it
  return (firePercentage * 1.0) + (airPercentage * 0.8) - (earthPercentage * 1.0) + (waterPercentage * 0.4);
}

/**
 * Calculate Greg's Energy from heat, entropy, and reactivity
 * @param heat Heat value (0-1)
 * @param entropy Entropy value (0-1)
 * @param reactivity Reactivity value (0-1)
 * @returns Greg's Energy value (0-1)
 */
export function calculateGregsEnergy(
  heat: number,
  entropy: number,
  reactivity: number
): number {
  const calculator = new ThermodynamicCalculator();
  return calculator.calculateGregsEnergy(heat, entropy, reactivity);
}

/**
 * Utility function to count elemental and alchemical properties from arrays of items
 * @param items Array of items with elemental and alchemical properties
 * @returns Object with counts of each property
 */
export const countElementalAlchemicalProperties = (
  items: Array<{
    elementalProperties?: Record<ElementalCharacter, number>;
    alchemicalProperties?: Record<AlchemicalProperty, number>;
  }>
): ElementalAlchemicalCounts => {
  const elementalCounts: Record<ElementalCharacter, number> = {
    Fire: 0,
    Water: 0,
    Earth: 0,
    Air: 0
  };

  const alchemicalCounts: Record<AlchemicalProperty, number> = {
    Spirit: 0,
    Essence: 0,
    Matter: 0,
    Substance: 0
  };

  items.forEach(item => {
    if (item.elementalProperties) {
      Object.entries(item.elementalProperties).forEach(([element, value]) => {
        elementalCounts[element as ElementalCharacter] += value;
      });
    }
    
    if (item.alchemicalProperties) {
      Object.entries(item.alchemicalProperties).forEach(([property, value]) => {
        alchemicalCounts[property as AlchemicalProperty] += value;
      });
    }
  });
  
  return {
    ...elementalCounts,
    ...alchemicalCounts
  };
};

// Add utility functions
/**
 * Ensure all values in ElementalAlchemicalCounts are at least the minimum threshold
 * @param counts The elemental and alchemical property counts
 * @returns ElementalAlchemicalCounts with minimum values applied
 */
export const ensureMinimumValues = (counts: ElementalAlchemicalCounts): ElementalAlchemicalCounts => ({
  ...counts,
  Spirit: Math.max(counts.Spirit, 0.1),
  Essence: Math.max(counts.Essence, 0.1),
  Matter: Math.max(counts.Matter, 0.1),
  Substance: Math.max(counts.Substance, 0.1),
  Fire: Math.max(counts.Fire, 0.1),
  Water: Math.max(counts.Water, 0.1),
  Air: Math.max(counts.Air, 0.1),
  Earth: Math.max(counts.Earth, 0.1)
});

/**
 * Clamp a value between a minimum and maximum
 * @param value Value to clamp
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Clamped value
 */
export const clampValue = (value: number, min: number, max: number): number => 
  Math.min(Math.max(value, min), max); 

export default {
  calculateHeat,
  calculateEntropy,
  calculateReactivity,
  calculateGregsEnergy,
  thermodynamicCalculator,
  convertToElementalState,
  countElementalAlchemicalProperties,
  ensureMinimumValues,
  clampValue
}; 