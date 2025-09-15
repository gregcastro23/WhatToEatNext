'use strict';
// src/utils/elementalUtils.ts
Object.defineProperty(exports, '__esModule', { value: true });
exports.fixIngredientMappings =
  exports.enhanceOilProperties =
  exports.enhanceVegetableTransformations =
  exports.getStrengtheningElement =
  exports.getComplementaryElement =
  exports.normalizeElementalValues =
  exports.transformItemsWithPlanetaryPositions =
  exports.elementalUtils =
  exports.getMissingElements =
  exports.validateElementalRequirements =
  exports.standardizeRecipeElements =
  exports.normalizeProperties =
  exports.validateElementalProperties =
    void 0;
const elementalCore_1 = require('../constants/elementalCore');
const ElementalCalculator_1 = require('../services/ElementalCalculator');
const planetaryFoodAssociations_1 = require('../constants/planetaryFoodAssociations');
const errorHandler_1 = require('../services/errorHandler');
const validation_1 = require('./validation');
/**
 * Validates that elemental properties contain valid values
 * @param properties The elemental properties to validate
 * @returns True if properties are valid, false otherwise
 */
const validateElementalProperties = properties => {
  // If properties is null or undefined, return false immediately
  if (!properties) {
    (0, errorHandler_1.warnNullValue)('properties', 'validateElementalProperties');
    return false;
  }
  // Check if all required elements exist
  const requiredElements = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of requiredElements) {
    if (typeof properties[element] !== 'number') {
      (0, errorHandler_1.warnNullValue)(`properties.${element}`, 'validateElementalProperties');
      return false;
    }
    // Check if values are between 0 and 1
    if (properties[element] < 0 || properties[element] > 1) {
      (0, validation_1.logUnexpectedValue)('validateElementalProperties', {
        message: `Element value out of range: ${element} = ${properties[element]}`,
        element,
        value: properties[element],
      });
      return false;
    }
  }
  // Optionally check if properties sum to 1 (or close to it due to floating point)
  const sum = Object.values(properties).reduce((acc, val) => acc + val, 0);
  const isCloseToOne = Math.abs(sum - 1) < 0.01;
  if (!isCloseToOne) {
    (0, validation_1.logUnexpectedValue)('validateElementalProperties', {
      message: `Elemental properties do not sum to 1: ${sum}`,
      sum,
      properties,
    });
  }
  return true;
};
exports.validateElementalProperties = validateElementalProperties;
/**
 * Normalizes elemental properties to ensure they sum to 1
 * @param properties The elemental properties to normalize
 * @returns Normalized elemental properties
 */
const normalizeProperties = properties => {
  // Handle null or undefined
  if (!properties) {
    (0, errorHandler_1.warnNullValue)('properties', 'normalizeProperties');
    return { ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES };
  }
  // Fill in any missing properties with defaults
  const completeProperties = {
    Fire: properties.Fire ?? elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES.Fire,
    Water: properties.Water ?? elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES.Water,
    Earth: properties.Earth ?? elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES.Earth,
    Air: properties.Air ?? elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES.Air,
  };
  const sum = Object.values(completeProperties).reduce((acc, val) => acc + val, 0);
  if (sum === 0) {
    // If sum is 0, return balanced default
    (0, errorHandler_1.warnNullValue)('properties (sum is 0)', 'normalizeProperties');
    return { ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES };
  }
  // Normalize each value
  return Object.entries(completeProperties).reduce(
    (acc, [key, value]) => {
      if ((0, validation_1.isElementalPropertyKey)(key)) {
        acc[key] = value / sum;
      } else {
        // This shouldn't happen with the type-safety above, but just in case
        (0, errorHandler_1.warnNullValue)(`invalid key: ${key}`, 'normalizeProperties');
      }
      return acc;
    },
    { ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES },
  );
};
exports.normalizeProperties = normalizeProperties;
/**
 * Standardizes elemental properties for recipes, ensuring all recipes have
 * properly normalized elemental values
 * @param recipe The recipe to standardize
 * @returns Recipe with standardized elemental properties
 */
const standardizeRecipeElements = recipe => {
  // Handle null /undefined recipe
  if (!recipe) {
    (0, errorHandler_1.warnNullValue)('recipe', 'standardizeRecipeElements');
    return {
      elementalProperties: { ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES },
    };
  }
  // If recipe doesn't have elemental properties, use current elemental state
  if (!recipe.elementalProperties) {
    const currentState = ElementalCalculator_1.ElementalCalculator.getCurrentElementalState();
    return {
      ...recipe,
      elementalProperties: currentState,
    };
  }
  // Normalize properties to ensure they sum to 1
  return {
    ...recipe,
    elementalProperties: (0, exports.normalizeProperties)(recipe.elementalProperties),
  };
};
exports.standardizeRecipeElements = standardizeRecipeElements;
const validateElementalRequirements = properties => {
  return (0, validation_1.isElementalProperties)(properties);
};
exports.validateElementalRequirements = validateElementalRequirements;
/**
 * Gets the elements that are missing or significantly lower than ideal balance in the provided properties
 * @param properties The elemental properties to check
 * @returns Array of elements that are missing or significantly low
 */
const getMissingElements = properties => {
  const threshold = 0.15; // Elements below this are considered "missing"
  const missingElements = [];
  // Check for null /undefined
  if (!properties) {
    (0, errorHandler_1.warnNullValue)('properties', 'getMissingElements');
    return ['Fire', 'Water', 'Earth', 'Air']; // Return all elements as missing
  }
  // Check each element
  const elements = ['Fire', 'Water', 'Earth', 'Air'];
  for (const element of elements) {
    const value = properties[element];
    if (typeof value !== 'number' || value < threshold) {
      missingElements.push(element);
    }
  }
  return missingElements;
};
exports.getMissingElements = getMissingElements;
exports.elementalUtils = {
  validateProperties: exports.validateElementalRequirements,
  normalizeProperties: exports.normalizeProperties,
  standardizeRecipeElements: exports.standardizeRecipeElements,
  getMissingElements: exports.getMissingElements,
  calculateelementalState(recipe) {
    if (!recipe?.ingredients?.length) {
      return ElementalCalculator_1.ElementalCalculator.getCurrentElementalState();
    }
    // Create a safe default balance to start
    const balance = { ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES };
    // Get total amount for percentage calculations
    const totalAmount = recipe.ingredients.reduce((sum, ing) => {
      const amount = ing.amount ?? 1; // Default to 1 if amount is missing
      return sum + amount;
    }, 0);
    // Handle the special case where there are no ingredients with amount
    if (totalAmount === 0) {
      return balance;
    }
    // Initialize balance with 0 values
    Object.keys(balance).forEach(el => {
      if ((0, validation_1.isElementalPropertyKey)(el)) {
        balance[el] = 0;
      }
    });
    // Process each ingredient
    recipe.ingredients.forEach(ing => {
      const amount = ing.amount ?? 1; // Default to 1 if amount is missing
      if (ing.elementalProperties) {
        // For each element in the ingredient
        Object.entries(ing.elementalProperties).forEach(([element, value]) => {
          if ((0, validation_1.isElementalPropertyKey)(element)) {
            balance[element] += (value * amount) / totalAmount;
          }
        });
      }
    });
    // Normalize to ensure they sum to 1
    return (0, exports.normalizeProperties)(balance);
  },
  combineProperties(a, b, bWeight = 0.5) {
    // Validate inputs and weights
    const aWeight = 1 - bWeight;
    if (bWeight < 0 || bWeight > 1) {
      (0, validation_1.logUnexpectedValue)('combineProperties', {
        message: `Invalid weight: ${bWeight}. Must be between 0 and 1.`,
        bWeight,
      });
      return (0, exports.normalizeProperties)(a);
    }
    // Combine properties with weighting
    const combined = {
      Fire: a.Fire * aWeight + b.Fire * bWeight,
      Water: a.Water * aWeight + b.Water * bWeight,
      Earth: a.Earth * aWeight + b.Earth * bWeight,
      Air: a.Air * aWeight + b.Air * bWeight,
    };
    return (0, exports.normalizeProperties)(combined);
  },
  getelementalState(recipe) {
    return this.calculateelementalState(recipe);
  },
  getComplementaryElement(element) {
    // Every element complements itself best
    return element;
  },
  getElementalCharacteristics(element) {
    const characteristicsMap = {
      Fire: { flavor: 'spicy', texture: 'crisp', temperature: 'hot', effect: 'energizing' },
      Water: { flavor: 'smooth', texture: 'moist', temperature: 'cool', effect: 'calming' },
      Earth: { flavor: 'rich', texture: 'dense', temperature: 'warm', effect: 'grounding' },
      Air: { flavor: 'light', texture: 'Airy', temperature: 'neutral', effect: 'uplifting' },
    };
    return characteristicsMap[element];
  },
  getElementalProfile(properties) {
    const dominantElement = Object.entries(properties).sort(([_, a], [__, b]) => b - a)[0][0];
    const characteristics = this.getElementalCharacteristics(dominantElement);
    // Calculate balance - how evenly distributed are the elements?
    const values = Object.values(properties);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const balance = 1 - Math.sqrt(variance) * 2; // Scale to 0-1
    // Calculate intensity - how strong is the dominant element?
    const maxValue = Math.max(...values);
    const intensity = maxValue / 0.25 - 1; // 0.25 is balanced, so calculate relative to that
    return {
      dominantElement,
      characteristics,
      balance,
      intensity,
      profile: { ...properties },
    };
  },
  getSuggestedCookingTechniques(properties) {
    const suggestions = [];
    const dominantElement = Object.entries(properties).sort(([_, a], [__, b]) => b - a)[0][0];
    const fireTechniques = ['grilling', 'roasting', 'baking', 'broiling', 'sautéing'];
    const waterTechniques = ['steaming', 'poaching', 'simmering', 'braising', 'blanching'];
    const earthTechniques = ['slow cooking', 'fermenting', 'curing', 'aging', 'pressure cooking'];
    const AirTechniques = ['whipping', 'foaming', 'dehydrating', 'smoking', 'raw preparation'];
    // Add techniques based on dominant element
    switch (dominantElement) {
      case 'Fire':
        suggestions.push(...fireTechniques.slice(0, 3));
        break;
      case 'Water':
        suggestions.push(...waterTechniques.slice(0, 3));
        break;
      case 'Earth':
        suggestions.push(...earthTechniques.slice(0, 3));
        break;
      case 'Air':
        suggestions.push(...AirTechniques.slice(0, 3));
        break;
    }
    // Add balancing techniques if strongly imbalanced
    if (properties[dominantElement] > 0.4) {
      if (dominantElement === 'Fire' && properties.Water < 0.2) {
        suggestions.push(waterTechniques[0]);
      } else if (dominantElement === 'Water' && properties.Fire < 0.2) {
        suggestions.push(fireTechniques[0]);
      } else if (dominantElement === 'Earth' && properties.Air < 0.2) {
        suggestions.push(AirTechniques[0]);
      } else if (dominantElement === 'Air' && properties.Earth < 0.2) {
        suggestions.push(earthTechniques[0]);
      }
    }
    return suggestions;
  },
  getRecommendedTimeOfDay(properties) {
    const recommendations = [];
    const dominantElement = Object.entries(properties).sort(([_, a], [__, b]) => b - a)[0][0];
    const _secondaryElement = Object.entries(properties).sort(([_, a], [__, b]) => b - a)[1][0];
    // fire is strongest in the afternoon
    if (dominantElement === 'Fire' || properties.Fire > 0.3) {
      recommendations.push('afternoon');
    }
    // water is strongest in the evening
    if (dominantElement === 'Water' || properties.Water > 0.3) {
      recommendations.push('evening');
    }
    // earth is strongest in the evening and night
    if (dominantElement === 'Earth' || properties.Earth > 0.3) {
      recommendations.push('evening');
      recommendations.push('night');
    }
    // Air is strongest in the morning
    if (dominantElement === 'Air' || properties.Air > 0.3) {
      recommendations.push('morning');
    }
    // If no strong preference, use time of day corresponding to dominant element
    if (recommendations.length === 0) {
      switch (dominantElement) {
        case 'Fire':
          recommendations.push('afternoon');
          break;
        case 'Water':
          recommendations.push('evening');
          break;
        case 'Earth':
          recommendations.push('evening');
          break;
        case 'Air':
          recommendations.push('morning');
          break;
      }
    }
    // If still no recommendations (unlikely), default to "anytime"
    if (recommendations.length === 0) {
      recommendations.push('anytime');
    }
    return [...new Set(recommendations)]; // Remove duplicates
  },
  getDefaultElementalProperties() {
    return { ...elementalCore_1.DEFAULT_ELEMENTAL_PROPERTIES };
  },
};
/**
 * Calculate uniqueness score for elemental distribution
 * @param elements Elemental properties
 * @param planetaryInfluence Planetary influence factor
 * @returns Uniqueness score between 0 and 1
 */
function _calculateUniqueness(elements, planetaryInfluence) {
  // Calculate variance of elemental distribution
  const values = Object.values(elements);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  // Higher variance means more unique elemental profile
  const uniqueness = Math.min(1, Math.sqrt(variance) * 2.5);
  // Boost uniqueness with planetary influence
  return Math.min(1, uniqueness * (1 + planetaryInfluence * 0.3));
}
function transformItemsWithPlanetaryPositions(
  items,
  planetaryPositions,
  isDaytime = true,
  currentZodiac,
  lunarPhase,
  tarotElementBoosts,
  tarotPlanetaryBoosts,
) {
  // Validate inputs
  if (!items || !Array.isArray(items) || items.length === 0) {
    return [];
  }
  // Create safe default boosts if not provided
  const safeElementBoosts = tarotElementBoosts || { Fire: 0, Water: 0, Earth: 0, Air: 0 };
  const safePlanetaryBoosts = tarotPlanetaryBoosts || {};
  // Transform each item
  return items.map(item => {
    // Get a safe copy of elemental properties
    const elemProps = item.elementalProperties || {
      Fire: 0.25,
      Water: 0.25,
      Earth: 0.25,
      Air: 0.25,
    };
    // Apply planetary influences
    const transformedProps = { ...elemProps };
    let totalPlanetaryInfluence = 0;
    // Process each planetary position
    Object.entries(planetaryPositions).forEach(([planet, position]) => {
      if (typeof position === 'object' && position && 'sign' in position) {
        const planetBoost = (0, planetaryFoodAssociations_1.calculatePlanetaryBoost)(
          planet,
          position.sign,
          isDaytime,
        );
        const tarotBoost = safePlanetaryBoosts[planet] || 0;
        const totalBoost = planetBoost + tarotBoost;
        if (totalBoost > 0) {
          // Get planetary element
          let planetaryElement;
          switch (planet.toLowerCase()) {
            case 'Sun':
            case 'Mars':
              planetaryElement = 'Fire';
              break;
            case 'Moon':
            case 'Venus':
            case 'Neptune':
              planetaryElement = 'Water';
              break;
            case 'Mercury':
            case 'Jupiter':
            case 'Uranus':
              planetaryElement = 'Air';
              break;
            case 'Saturn':
            case 'Pluto':
              planetaryElement = 'Earth';
              break;
            default:
              planetaryElement = 'Fire';
          }
          // Apply elemental boost
          transformedProps[planetaryElement] += totalBoost * 0.1;
          totalPlanetaryInfluence += totalBoost;
        }
      }
    });
    // Apply tarot element boosts
    Object.entries(safeElementBoosts).forEach(([element, boost]) => {
      if ((0, validation_1.isElementalPropertyKey)(element)) {
        transformedProps[element] += boost * 0.1;
      }
    });
    // Normalize the transformed properties
    const sum = Object.values(transformedProps).reduce((acc, val) => acc + val, 0);
    if (sum > 0) {
      Object.keys(transformedProps).forEach(key => {
        if ((0, validation_1.isElementalPropertyKey)(key)) {
          transformedProps[key] = safeValue(transformedProps[key] / sum);
        }
      });
    }
    // Calculate alchemical properties
    const alchemical = {
      Spirit: safeValue(transformedProps.Fire * 0.7 + transformedProps.Air * 0.3),
      Essence: safeValue(
        transformedProps.Water * 0.6 + transformedProps.Fire * 0.2 + transformedProps.Air * 0.2,
      ),
      Matter: safeValue(transformedProps.Earth * 0.7 + transformedProps.Water * 0.3),
      Substance: safeValue(
        transformedProps.Earth * 0.5 + transformedProps.Water * 0.3 + transformedProps.Air * 0.2,
      ),
    };
    // Calculate uniqueness score
    const uniqueness = calculateUniquenessScore(item);
    // Calculate transformation score
    const transformationScore = Math.min(
      1,
      (alchemical.Spirit + alchemical.Essence + uniqueness) / 3,
    );
    return {
      ...item,
      elementalProperties: transformedProps,
      alchemicalProperties: alchemical,
      uniqueness,
      transformationScore,
      lunarPhaseEffect: lunarPhase || 'new moon',
      zodiacInfluence: currentZodiac || 'aries',
      planetaryInfluences: Object.keys(planetaryPositions),
    };
  });
  // Helper function to ensure a safe minimum value
  function safeValue(val) {
    return Math.max(val, 0.01);
  }
  // Ensure number is safe for calculations
  function _ensureSafeNumber(val) {
    if (isNaN(val) || !isFinite(val)) {
      return 0.1; // Default safe value
    }
    return Math.max(0.01, Math.min(1, val));
  }
}
exports.transformItemsWithPlanetaryPositions = transformItemsWithPlanetaryPositions;
/**
 * Apply non-linear scaling to elemental properties
 * This enhances the dominant element while preserving the overall balance
 */
const _applyNonLinearScaling = props => ({
  Fire: Math.pow(props.Fire, 0.8),
  Water: Math.pow(props.Water, 0.8),
  Earth: Math.pow(props.Earth, 0.8),
  Air: Math.pow(props.Air, 0.8),
});
const calculateUniquenessScore = item => {
  const elements = item.elementalProperties;
  if (!elements) return 0.5;
  // Calculate the variance of the elemental distribution
  const values = Object.values(elements);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  // Higher variance means more unique
  return Math.min(1, variance * 10);
};
/**
 * Normalize elemental values to ensure they sum to 1
 */
function normalizeElementalValues(values) {
  // Create a safe copy
  const safeValues = {
    Fire: values.Fire || 0.25,
    Water: values.Water || 0.25,
    Earth: values.Earth || 0.25,
    Air: values.Air || 0.25,
  };
  // Calculate sum
  const sum = Object.values(safeValues).reduce((acc, val) => acc + val, 0);
  // If sum is 0, return balanced distribution
  if (sum === 0) {
    return { Fire: 0.25, Water: 0.25, Earth: 0.25, Air: 0.25 };
  }
  // Normalize
  return {
    Fire: safeValues.Fire / sum,
    Water: safeValues.Water / sum,
    Earth: safeValues.Earth / sum,
    Air: safeValues.Air / sum,
  };
}
exports.normalizeElementalValues = normalizeElementalValues;
/**
 * Get complementary element (an element reinforces itself in our system)
 */
function getComplementaryElement(element) {
  return element; // Each element complements itself best
}
exports.getComplementaryElement = getComplementaryElement;
/**
 * Get element that strengthens the given element
 */
function getStrengtheningElement(element) {
  // In our system, elements strengthen themselves
  return element;
}
exports.getStrengtheningElement = getStrengtheningElement;
// ... rest of the file ...
// Fix the function declarations to use proper return type syntax
function enhanceVegetableTransformations(vegetables) {
  // ... implementation ...
  return vegetables;
}
exports.enhanceVegetableTransformations = enhanceVegetableTransformations;
function enhanceOilProperties(oils) {
  // ... implementation ...
  return oils;
}
exports.enhanceOilProperties = enhanceOilProperties;
function fixIngredientMappings(rawIngredients) {
  // ... implementation ...
  return rawIngredients;
}
exports.fixIngredientMappings = fixIngredientMappings;
