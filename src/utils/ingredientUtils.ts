// Create or update a utility function to calculate proper alchemical properties

import type { AlchemicalProperties, ThermodynamicProperties, Modality } from '@/data/ingredients/types';
import type { Ingredient } from '@/types/ingredient';
import type { ElementalProperties } from '@/types/alchemy';
import { FlavorProfile } from '@/types/alchemy';

/**
 * Calculate alchemical properties based on elemental properties
 * Following the core alchemizer engine formula patterns
 */
export function calculateAlchemicalProperties(ingredient: Ingredient): AlchemicalProperties {
  // Extract elemental properties
  const elementals = ingredient.elementalProperties || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Base values derived from planetary influences in the alchemizer
  // Sun (Spirit), Moon/Venus (Essence), Saturn/Mars (Matter), Mercury/Neptune (Substance)
  // The ratios below approximate the original alchemizer calculations
  const spirit = (elementals.Fire * 0.7) + (elementals.Air * 0.3);
  const essence = (elementals.Water * 0.6) + (elementals.Fire * 0.2) + (elementals.Air * 0.2);
  const matter = (elementals.Earth * 0.7) + (elementals.Water * 0.3);
  const substance = (elementals.Earth * 0.5) + (elementals.Water * 0.3) + (elementals.Air * 0.2);
  
  return {
    spirit,
    essence,
    matter,
    substance
  };
}

/**
 * Calculate thermodynamic properties based on alchemical and elemental properties
 * Using the exact formulas from the alchemizer engine
 */
export function calculateThermodynamicProperties(
  alchemicalProps: AlchemicalProperties,
  elementalProps?: ElementalProperties
): ThermodynamicProperties {
  const { spirit, essence, matter, substance } = alchemicalProps;
  
  // Use provided elemental props or create defaults
  const elements = elementalProps || {
    Fire: 0.25,
    Water: 0.25,
    Earth: 0.25,
    Air: 0.25
  };
  
  // Extract elemental values
  const fire = elements.Fire;
  const water = elements.Water;
  const air = elements.Air;
  const earth = elements.Earth;
  
  // Using the exact formulas from the alchemizer engine
  const heat = (spirit**2 + fire**2) / 
    ((substance + essence + matter + water + air + earth)**2 || 1);
    
  const entropy = (spirit**2 + substance**2 + fire**2 + air**2) / 
    ((essence + matter + earth + water)**2 || 1);
    
  const reactivity = (spirit**2 + substance**2 + essence**2 + fire**2 + air**2 + water**2) / 
    ((matter + earth)**2 || 1);
  
  const energy = heat - (reactivity * entropy);
  
  return {
    heat,
    entropy,
    reactivity,
    energy
  };
}

// Helper functions to calculate individual properties
function calculateSpiritValue(flavorProfile: FlavorProfile): number {
  // Implement logic based on flavor profile attributes
  // Example: spirit might be higher for aromatic, fragrant ingredients
  return flavorProfile.intensity || 0.5; // Default to 0.5 if intensity not provided
}

// Implement similar helper functions for essence, matter, and substance 

/**
 * Determines the modality of an ingredient based on its elemental properties
 * and other characteristics
 */
export function determineIngredientModality(
  elementalProps: ElementalProperties,
  qualities: string[] = []
): Modality {
  // Safety check for undefined inputs
  if (!elementalProps) {
    console.warn("Missing elemental properties for modality calculation");
    return 'Mutable'; // Default fallback
  }
  
  // Extract elemental values with defaults
  const Fire = elementalProps.Fire || 0;
  const Water = elementalProps.Water || 0;
  const Earth = elementalProps.Earth || 0;
  const Air = elementalProps.Air || 0;
  
  // Log the elemental properties for debugging
  console.log(`Determining modality for element values: Fire=${Fire}, Water=${Water}, Earth=${Earth}, Air=${Air}`);
  
  // Create normalized arrays of qualities for easier matching
  const normalizedQualities = qualities.map(q => q.toLowerCase());
  
  // Look for explicit quality indicators in the ingredients
  const cardinalKeywords = ['initiating', 'spicy', 'pungent', 'stimulating', 'invigorating', 'activating'];
  const fixedKeywords = ['grounding', 'stabilizing', 'nourishing', 'sustaining', 'foundational'];
  const mutableKeywords = ['adaptable', 'flexible', 'versatile', 'balancing', 'harmonizing'];
  
  const hasCardinalQuality = normalizedQualities.some(q => cardinalKeywords.includes(q));
  const hasFixedQuality = normalizedQualities.some(q => fixedKeywords.includes(q));
  const hasMutableQuality = normalizedQualities.some(q => mutableKeywords.includes(q));
  
  // If there's a clear quality indicator, use that
  if (hasCardinalQuality && !hasFixedQuality && !hasMutableQuality) {
    return 'Cardinal';
  }
  if (hasFixedQuality && !hasCardinalQuality && !hasMutableQuality) {
    return 'Fixed';
  }
  if (hasMutableQuality && !hasCardinalQuality && !hasFixedQuality) {
    return 'Mutable';
  }
  
  // Cardinal ingredients tend to have strong Fire or Air elements
  // and initiate action or transformation
  if (
    ((Fire > 0.4 && Air > 0.3) || Fire > 0.6 || Air > 0.6)
  ) {
    return 'Cardinal';
  }
  
  // Fixed ingredients tend to have strong Earth or Water elements
  // and provide stability and grounding
  if (
    ((Earth > 0.4 && Water > 0.3) || Earth > 0.6 || Water > 0.6)
  ) {
    return 'Fixed';
  }
  
  // Mutable ingredients tend to have balanced elements
  // and are adaptable, taking on the qualities of other ingredients
  if (
    (Math.abs(Fire - Water) < 0.3 && Math.abs(Earth - Air) < 0.3)
  ) {
    return 'Mutable';
  }
  
  // Default assignment based on dominant element if no clear modality is found
  const maxElement = Math.max(Fire, Water, Earth, Air);
  if (maxElement === Fire) return Fire > Water ? 'Cardinal' : 'Mutable';
  if (maxElement === Air) return Air > Earth ? 'Cardinal' : 'Mutable';
  if (maxElement === Earth) return Earth > Air ? 'Fixed' : 'Mutable';
  if (maxElement === Water) return Water > Fire ? 'Fixed' : 'Mutable';
  
  // Fallback
  return 'Mutable';
} 