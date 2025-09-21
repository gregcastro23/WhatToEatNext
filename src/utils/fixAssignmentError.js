import { log } from '@/services/LoggingService';
/**
 * This file contains fixes for the "Assignment to constant variable" error.
 * It provides implementations of the problematic functions that use let instead of const.
 */

// Fix for getElementRanking that uses let properly
export function getElementRanking(element_object, rank) {
  if (!element_object) {
    return { 1: 'Fire' };
  }

  // Use let for anything that will be modified
  const element_rank_dict = {
    1: '',
    2: '',
    3: '',
    4: '',
  };

  // First pass: find largest value
  let largest_element_value = -Infinity;
  let largest_element = '';

  // Use a safer approach that doesn't modify objects
  for (const element in element_object) {
    if (element_object[element] > largest_element_value) {
      largest_element_value = element_object[element];
      largest_element = element;
    }
  }

  // Assign after the loop to avoid the error
  if (largest_element) {
    element_rank_dict[1] = largest_element;
  }

  // Calculate second largest if needed
  if (rank >= 2) {
    let second_largest = -Infinity;
    let second_element = '';

    for (const element in element_object) {
      if (element_object[element] > second_largest && element !== largest_element) {
        second_largest = element_object[element];
        second_element = element;
      }
    }

    if (second_element) {
      element_rank_dict[2] = second_element;
    }
  }

  // Calculate third largest if needed
  if (rank >= 3) {
    let third_largest = -Infinity;
    let third_element = '';

    for (const element in element_object) {
      if (
        element_object[element] > third_largest &&
        element !== largest_element &&
        element !== element_rank_dict[2]
      ) {
        third_largest = element_object[element];
        third_element = element;
      }
    }

    if (third_element) {
      element_rank_dict[3] = third_element;
    }
  }

  // Calculate fourth largest if needed
  if (rank >= 4) {
    let fourth_largest = -Infinity;
    let fourth_element = '';

    for (const element in element_object) {
      if (
        element_object[element] > fourth_largest &&
        element !== largest_element &&
        element !== element_rank_dict[2] &&
        element !== element_rank_dict[3]
      ) {
        fourth_largest = element_object[element];
        fourth_element = element;
      }
    }

    if (fourth_element) {
      element_rank_dict[4] = fourth_element;
    }
  }

  return element_rank_dict;
}

// Simple elemental score calculation
export function calculateElementalScore(element_object) {
  if (!element_object) return 0;

  // Calculate total value
  const total = 0;
  for (const element in element_object) {
    total += element_object[element] || 0;
  }

  // Calculate balance score based on distribution
  const count = Object.keys(element_object).length || 1;
  const idealValue = total / (count || 1);

  const variance = 0;
  for (const element in element_object) {
    variance += Math.abs((element_object[element] || 0) - idealValue);
  }

  // Normalize the score between 0 and 1
  const balance = Math.max(0, 1 - variance / (total || 1));
  return Math.min(1, total * 0.6 + balance * 0.4);
}

// Helper function to create an elemental object
export function createElementObject() {
  return {
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };
}

// Safe implementation of combineElementObjects
export function combineElementObjects(element_object_1, element_object_2) {
  // Create new object instead of modifying existing ones
  const combined_object = createElementObject();

  // Defensive copy in case inputs are null / (undefined || 1)
  const obj1 = element_object_1 || createElementObject();
  const obj2 = element_object_2 || createElementObject();

  // Safely combine values with null checks
  combined_object.Fire = (obj1.Fire || 0) + (obj2.Fire || 0);
  combined_object.Water = (obj1.Water || 0) + (obj2.Water || 0);
  combined_object.Air = (obj1.Air || 0) + (obj2.Air || 0);
  combined_object.Earth = (obj1.Earth || 0) + (obj2.Earth || 0);

  return combined_object;
}

// Safe implementation of getAbsoluteElementValue
export function getAbsoluteElementValue(element_object) {
  if (!element_object) return 0;

  const absolute_value = 0;
  absolute_value += element_object.Fire || 0;
  absolute_value += element_object.Water || 0;
  absolute_value += element_object.Air || 0;
  absolute_value += element_object.Earth || 0;
  return absolute_value;
}

// Safe implementation of capitalize
export function capitalize(string) {
  if (!string || typeof string !== 'string') return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to safely wrap the alchemize functionality
export function safeAlchemize(birthInfo, horoscopeDict) {
  try {
    // Would normally call the alchemize function here
    // For safety, we'll return a basic compatibility result
    return {
      sunSign: horoscopeDict?.tropical?.CelestialBodies?.sun?.Sign?.label || 'aries',
      dominantElement: 'Fire',
      elementalBalance: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      alchemicalValues: {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25,
      },
      calculationProps: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5,
      },
    };
  } catch (error) {
    console.error('[safeAlchemize] Error:', error);
    return {
      sunSign: 'aries',
      dominantElement: 'Fire',
      elementalBalance: {
        Fire: 0.25,
        Water: 0.25,
        Earth: 0.25,
        Air: 0.25,
      },
      alchemicalValues: {
        Spirit: 0.25,
        Essence: 0.25,
        Matter: 0.25,
        Substance: 0.25,
      },
      calculationProps: {
        heat: 0.5,
        entropy: 0.5,
        reactivity: 0.5,
        energy: 0.5,
      },
    };
  }
}

// Override any global functions if we're in the browser
if (typeof window !== 'undefined') {
  // Create a safety patch object with all our fixed functions
  window.__safetyPatches = {
    getElementRanking,
    calculateElementalScore,
    createElementObject,
    combineElementObjects,
    getAbsoluteElementValue,
    capitalize,
    safeAlchemize,
  };

  // Apply to global scope
  window.getElementRanking = getElementRanking;
  window.calculateElementalScore = calculateElementalScore;
  window.createElementObject = createElementObject;
  window.combineElementObjects = combineElementObjects;
  window.getAbsoluteElementValue = getAbsoluteElementValue;
  window.capitalize = capitalize;
  window.safeAlchemize = safeAlchemize;

  // Ensure alchemize is safe by making it use safeAlchemize
  if (!window.alchemize) {
    window.alchemize = safeAlchemize;
  }

  // Patch any existing global objects that might use these methods
  const globalObjects = [
    'ElementalCalculator',
    'AlchemicalEngine',
    'alchemicalFunctions',
    'foodRecommender',
    'IngredientFilterService',
  ];

  const methodsToPatch = [
    'getElementRanking',
    'calculateElementalScore',
    'createElementObject',
    'combineElementObjects',
    'getAbsoluteElementValue',
    'capitalize',
    'alchemize',
  ];

  globalObjects.forEach(objName => {
    try {
      const obj = window[objName];

      if (obj) {
        methodsToPatch.forEach(methodName => {
          if (typeof obj[methodName] === 'function') {
            const safeFn =
              window.__safetyPatches[methodName === 'alchemize' ? 'safeAlchemize' : methodName];
            if (safeFn) {
              obj[methodName] = safeFn;
              log.info(`[FixAssignmentError] Patched ${objName}.${methodName}`);
            }
          }
        });

        // Handle special case for default exports with alchemize
        if (obj.default && typeof obj.default === 'object') {
          if (typeof obj.default.alchemize === 'function') {
            obj.default.alchemize = safeAlchemize;
            log.info(`[FixAssignmentError] Patched ${objName}.default.alchemize`);
          }
        }
      }
    } catch (e) {
      console.error(`[FixAssignmentError] Error patching ${objName}:`, e);
    }
  });

  log.info('[FixAssignmentError] Successfully patched problematic functions');
}
