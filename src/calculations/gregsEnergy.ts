import { ElementalCharacter, AlchemicalProperty } from '../constants/planetaryElements';
import { calculatePlanetaryPositions } from '../utils/astrologyUtils';
import { calculateSignEnergyStates } from '@/constants/signEnergyStates';

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

type ThermodynamicMetrics = {
    heat: number;          // Thermal energy from celestial friction (0-1)
    entropy: number;       // Disorder in planetary system (0-1) 
    reactivity: number;    // Chemical potential for transformation (0-1)
    gregsEnergy: number;   // Free energy metric (0-1)
};

interface ElementalState {
    fire: number;    // Combustive/transformative energy
    water: number;   // Fluid/adaptive capacity
    air: number;     // Gaseous/diffusive quality
    earth: number;   // Solid/stabilizing force
    spirit: number;  // Ethereal/creative essence (non-material)
    essence: number; // Vital/animating principle
    matter: number;  // Physical manifestation
    substance: number;// Structural integrity
}

const planetaryHours = {
    Sunday: ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'],
    Monday: ['Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury'],
    Tuesday: ['Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter'],
    Wednesday: ['Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus'],
    Thursday: ['Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon', 'Saturn'],
    Friday: ['Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars', 'Sun'],
    Saturday: ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon']
};

const planetaryModifiers = {
    Sun: { Fire: 0.3, Water: -0.1, Air: 0.1, Earth: -0.1, Spirit: 0.2, Essence: 0, Matter: -0.1, Substance: 0 },
    Moon: { Fire: -0.1, Water: 0.3, Air: 0, Earth: 0.1, Spirit: 0, Essence: 0.2, Matter: 0.1, Substance: 0 },
    Mars: { Fire: 0.4, Water: -0.2, Air: -0.1, Earth: 0, Spirit: 0.3, Essence: -0.1, Matter: 0.2, Substance: -0.1 },
    Mercury: { Fire: 0.1, Water: 0.1, Air: 0.3, Earth: -0.1, Spirit: 0.1, Essence: 0.2, Matter: 0, Substance: 0.1 },
    Jupiter: { Fire: 0.2, Water: 0.2, Air: 0.1, Earth: 0.3, Spirit: 0.2, Essence: 0.1, Matter: 0.1, Substance: 0.2 },
    Venus: { Fire: -0.1, Water: 0.2, Air: 0.2, Earth: 0.1, Spirit: 0.1, Essence: 0.3, Matter: -0.1, Substance: 0.1 },
    Saturn: { Fire: -0.2, Water: -0.1, Air: -0.2, Earth: 0.4, Spirit: -0.1, Essence: -0.1, Matter: 0.3, Substance: 0.2 }
};

class ThermodynamicCalculator {
    private readonly MINIMUM_VALUE = 0.1;
    private currentPlanetaryInfluence: keyof typeof planetaryModifiers = 'Sun';

    setPlanetaryInfluence(planet: keyof typeof planetaryModifiers) {
        this.currentPlanetaryInfluence = planet;
    }

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

        console.log(`Applied ${this.currentPlanetaryInfluence} modifiers to state`);
        return result;
    }

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
        console.log(`Greg's Energy calculation:`);
        console.log(`  Inputs: heat=${safeHeat.toFixed(2)}, entropy=${safeEntropy.toFixed(2)}, reactivity=${safeReactivity.toFixed(2)}`);
        console.log(`  Raw: ${rawValue.toFixed(2)}, Scaled: ${scaledValue.toFixed(2)}, Final: ${finalValue.toFixed(2)}`);
        
        return finalValue;
    }

    private validateState(state: ElementalState): void {
        const properties = Object.values(state);
        if (properties.some(val => isNaN(val) || !isFinite(val))) {
            throw new Error('Elemental state values must be valid numbers');
        }
        if (properties.some(val => val < 0)) {
            throw new Error('Elemental state values cannot be negative');
        }
    }

    private validateResult(metrics: ThermodynamicMetrics): void {
        const { heat, entropy, reactivity, gregsEnergy } = metrics;
        const values = [heat, entropy, reactivity, gregsEnergy];
        if (values.some(val => isNaN(val) || !isFinite(val))) {
            throw new Error('All thermodynamic metrics must be valid numbers');
        }
    }

    generateMetrics(state: ElementalState): ThermodynamicMetrics {
        this.validateState(state);
        
        console.log("Initial state for thermodynamic calculations:", state);
        
        // Apply minimum values to prevent division by zero
        const safeState = {
            spirit: Math.max(state.spirit, 0.1),
            essence: Math.max(state.essence, 0.1),
            matter: Math.max(state.matter, 0.1),
            substance: Math.max(state.substance, 0.1),
            fire: Math.max(state.fire, 0.1),
            water: Math.max(state.water, 0.1),
            air: Math.max(state.air, 0.1),
            earth: Math.max(state.earth, 0.1)
        };

        console.log("Safe state after minimum values:", safeState);

        // Apply planetary influences
        const modifiedState = this.applyPlanetaryModifiers(safeState);
        console.log("Modified state after planetary influences:", modifiedState, 
                    "Current planetary influence:", this.currentPlanetaryInfluence);

        const heat = this.calculateHeat(modifiedState);
        const entropy = this.calculateEntropy(modifiedState);
        const reactivity = this.calculateReactivity(modifiedState);
        const gregsEnergy = this.calculateGregsEnergy(heat, entropy, reactivity);

        console.log("Raw calculated values:", { heat, entropy, reactivity, gregsEnergy });

        const metrics = { 
            heat: heat,
            entropy: entropy,
            reactivity: reactivity,
            gregsEnergy: gregsEnergy
        };
        
        // Ensure no NaN values in final output
        for (const key in metrics) {
            if (isNaN(metrics[key as keyof ThermodynamicMetrics]) || 
                !isFinite(metrics[key as keyof ThermodynamicMetrics])) {
                console.warn(`Fixed invalid value for ${key}`);
                metrics[key as keyof ThermodynamicMetrics] = 0.5; // Default to middle value
            }
        }
        
        console.log("Final metrics:", metrics);
        return metrics;
    }

    private normalizeValue(value: number): number {
        if (isNaN(value) || !isFinite(value)) return 0;
        return Math.max(0, Math.min(1, Number(value.toFixed(2))));
    }
}

// Utility function to convert legacy format to new ElementalState
export function convertToElementalState(counts: {
    Spirit: number;
    Essence: number;
    Matter: number;
    Substance: number;
    Fire: number;
    Water: number;
    Air: number;
    Earth: number;
}): ElementalState {
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

export const thermodynamicCalculator = new ThermodynamicCalculator();

/**
 * Calculate heat based on normalized values
 */
export function calculateHeat(
  elementalCounts: Record<ElementalCharacter, number>,
  alchemicalCounts: Record<AlchemicalProperty, number>
): number {
  const spirit = alchemicalCounts.Spirit;
  const fire = elementalCounts.Fire;
  
  const totalElements = Object.values(elementalCounts).reduce((sum, val) => sum + val, 0);
  const totalAlchemical = Object.values(alchemicalCounts).reduce((sum, val) => sum + val, 0);
  
  // Follow the formula from the working ElementalEnergyDisplay component
  // This is critical - if total is 0, default to 0.5 instead of 0
  if (totalElements <= 0 || totalAlchemical <= 0) return 0.5; 
  
  // Use the original alchemizer formula from corefunctionality.mdc
  // heat = (spirit^2 + fire^2) / (substance + essence + matter + water + air + earth)^2
  const numerator = Math.pow(spirit * 2.5, 2) + Math.pow(fire * 2.0, 2);
  const denominator = Math.pow(
    alchemicalCounts.Substance + 
    alchemicalCounts.Essence + 
    alchemicalCounts.Matter + 
    elementalCounts.Water + 
    elementalCounts.Air + 
    elementalCounts.Earth, 
    2
  );
  
  // Add deterministic boosting instead of random variation
  // This ensures consistency across calculations
  let calculatedHeat = numerator / denominator;
  
  // Apply a non-linear scaling to make differences more pronounced
  // More dramatic curve where middle values are enhanced
  calculatedHeat = Math.pow(calculatedHeat, 0.7); // Power less than 1 creates upward curve
  
  // Constrain to valid range
  calculatedHeat = Math.max(0.2, Math.min(1.0, calculatedHeat));
  
  // Log the calculation clearly
  console.log(`Heat calculation: spirit=${spirit.toFixed(2)}, fire=${fire.toFixed(2)}`);
  console.log(`Numerator: ${numerator.toFixed(2)}, Denominator: ${denominator.toFixed(2)}`);
  console.log(`Final heat: ${calculatedHeat.toFixed(2)}`);
  
  return calculatedHeat;
}

/**
 * Calculate entropy based on normalized values
 */
export function calculateEntropy(
  elementalCounts: Record<ElementalCharacter, number>,
  alchemicalCounts: Record<AlchemicalProperty, number>
): number {
  const spirit = alchemicalCounts.Spirit;
  const substance = alchemicalCounts.Substance;
  const fire = elementalCounts.Fire;
  const air = elementalCounts.Air;
  
  const totalElements = Object.values(elementalCounts).reduce((sum, val) => sum + val, 0);
  const totalAlchemical = Object.values(alchemicalCounts).reduce((sum, val) => sum + val, 0);
  
  // If we have no values, default to 0.5
  if (totalElements <= 0 || totalAlchemical <= 0) return 0.5;
  
  // Use the original alchemizer formula
  // entropy = (spirit^2 + substance^2 + fire^2 + air^2) / (essence + matter + earth + water)^2
  const numerator = Math.pow(spirit * 1.8, 2) + 
                   Math.pow(substance * 1.5, 2) + 
                   Math.pow(fire * 1.5, 2) + 
                   Math.pow(air * 1.5, 2);
                   
  const denominator = Math.pow(
    alchemicalCounts.Essence + 
    alchemicalCounts.Matter + 
    elementalCounts.Earth + 
    elementalCounts.Water,
    2
  );
  
  // Calculate and apply a similar non-linear scaling
  let calculatedEntropy = numerator / denominator;
  calculatedEntropy = Math.pow(calculatedEntropy, 0.7);
  
  // Constrain to valid range
  calculatedEntropy = Math.max(0.2, Math.min(1.0, calculatedEntropy));
  
  // Log the calculation
  console.log(`Entropy calculation: spirit=${spirit.toFixed(2)}, substance=${substance.toFixed(2)}, fire=${fire.toFixed(2)}, air=${air.toFixed(2)}`);
  console.log(`Entropy numerator: ${numerator.toFixed(2)}, denominator: ${denominator.toFixed(2)}`);
  console.log(`Final entropy: ${calculatedEntropy.toFixed(2)}`);
  
  return calculatedEntropy;
}

/**
 * Calculate reactivity based on normalized values
 */
export function calculateReactivity(
  elementalCounts: Record<ElementalCharacter, number>,
  alchemicalCounts: Record<AlchemicalProperty, number>
): number {
  const spirit = alchemicalCounts.Spirit;
  const substance = alchemicalCounts.Substance;
  const essence = alchemicalCounts.Essence;
  const fire = elementalCounts.Fire;
  const air = elementalCounts.Air;
  const water = elementalCounts.Water;
  const earth = elementalCounts.Earth;
  const matter = alchemicalCounts.Matter;
  
  // If earth and matter are both 0, we'd have division by zero
  if (earth <= 0 && matter <= 0) return 0.6; // Default to slightly above medium
  
  // Use the original alchemizer formula 
  // reactivity = (spirit^2 + substance^2 + essence^2 + fire^2 + air^2 + water^2) / (matter + earth)^2
  const numerator = Math.pow(spirit * 1.5, 2) + 
                   Math.pow(substance * 1.5, 2) + 
                   Math.pow(essence * 1.5, 2) + 
                   Math.pow(fire * 1.5, 2) + 
                   Math.pow(air * 1.5, 2) + 
                   Math.pow(water * 1.5, 2);
                   
  const denominator = Math.pow(matter + earth, 2);
  
  // Calculate and apply non-linear scaling
  let calculatedReactivity = numerator / denominator;
  calculatedReactivity = Math.pow(calculatedReactivity, 0.7);
  
  // Constrain to valid range
  calculatedReactivity = Math.max(0.2, Math.min(1.0, calculatedReactivity));
  
  // Log the calculation
  console.log(`Reactivity calculation: active elements total=${(spirit+substance+essence+fire+air+water).toFixed(2)}, passive elements total=${(matter+earth).toFixed(2)}`);
  console.log(`Reactivity numerator: ${numerator.toFixed(2)}, denominator: ${denominator.toFixed(2)}`);
  console.log(`Final reactivity: ${calculatedReactivity.toFixed(2)}`);
  
  return calculatedReactivity;
}

/**
 * Utility function to count elemental and alchemical properties from arrays
 * @param elements Array of elemental characters
 * @param alchemicalProps Array of alchemical properties
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
const ensureMinimumValues = (counts: ElementalAlchemicalCounts): ElementalAlchemicalCounts => ({
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

const clampValue = (value: number, min: number, max: number) => 
  Math.min(Math.max(value, min), max); 