
/**
 * Recipe Interface
 * @typedef {Object} Recipe
 * @property {string} id - Unique identifier
 * @property {string} name - Recipe name
 * @property {string} description - Recipe description
 * @property {Array<Object>} ingredients - List of ingredient objects
 * @property {Array<string>} instructions - Step-by-step instructions
 * @property {Object} elementalProperties - Elemental properties (Fire, Water, Earth, Air)
 * @property {number} kalchm - Kalchm value
 * @property {number} monica - Monica value
 * @property {string[]} season - Applicable seasons
 */

/**
 * Generate a Monica-optimized recipe
 * @param {Object} options - Recipe generation options
 * @param {string} options.cuisine - Target cuisine
 * @param {string} options.season - Target season
 * @param {number} options.targetKalchm - Target Kalchm value
 * @param {number} options.servings - Number of servings
 * @returns {Recipe} Generated recipe
 */
export function generateMonicaOptimizedRecipe({ cuisine, season, targetKalchm, servings }) {
  // Sample recipe data
  const recipe = {
    id: `${cuisine}-${season}-${Date.now()}`,
    name: `${capitalize(season)} ${capitalize(cuisine)} Delight`,
    description: `A ${season} inspired ${cuisine} dish optimized for Monica value.`,
    ingredients: [
      {
        name: 'Base Ingredient',
        amount: 2,
        unit: 'cups',
        category: 'vegetables',
      },
      {
        name: 'Protein Component',
        amount: 1,
        unit: 'pound',
        category: 'proteins',
      },
      {
        name: 'Aromatic Element',
        amount: 0.25,
        unit: 'cup',
        category: 'herbs',
      },
    ],
    instructions: [
      'Prepare all ingredients according to their specifications.',
      'Combine ingredients using proper alchemical order.',
      'Cook using the recommended method for optimal Monica value.',
      'Serve immediately for best results.',
    ],
    elementalProperties: { Fire: 0.3, Water: 0.2, Earth: 0.3, Air: 0.2 },
    kalchm: targetKalchm || 1.05,
    monica: 1.2,
    season: [season],
    servings: servings || 4,
  };

  return recipe;
}

/**
 * Adapt an existing recipe for a different season
 * @param {Recipe} recipe - Original recipe
 * @param {string} targetSeason - Season to adapt for
 * @returns {Recipe} Adapted recipe
 */
export function adaptRecipeForSeason(recipe, targetSeason) {
  // Start with a copy of the original recipe
  const adaptedRecipe = { ...recipe };

  // Update name and description
  adaptedRecipe.id = `${recipe.id}-${targetSeason}`;
  adaptedRecipe.name = `${capitalize(targetSeason)} ${recipe.name}`;
  adaptedRecipe.description = `${recipe.description} (Adapted for ${capitalize(targetSeason)})`;

  // Update season
  adaptedRecipe.season = [targetSeason];

  // Adjust elemental properties based on season
  const seasonalElementShift = getSeasonalElementShift(targetSeason);
  adaptedRecipe.elementalProperties = {
    Fire: adjustElementValue(recipe.elementalProperties.Fire, seasonalElementShift.Fire),
    Water: adjustElementValue(recipe.elementalProperties.Water, seasonalElementShift.Water),
    Earth: adjustElementValue(recipe.elementalProperties.Earth, seasonalElementShift.Earth),
    Air: adjustElementValue(recipe.elementalProperties.Air, seasonalElementShift.Air),
  };

  // Recalculate Kalchm and Monica values
  adaptedRecipe.kalchm = calculateKalchmValue(adaptedRecipe.elementalProperties);
  adaptedRecipe.monica = calculateMonicaValue(adaptedRecipe.elementalProperties, targetSeason);

  return adaptedRecipe;
}

/**
 * Get seasonal element shift values for adapting recipes
 * @param {string} season - Target season
 * @returns {Object} Elemental shifts
 */
function getSeasonalElementShift(season) {
  const shifts = {
    spring: { Fire: 0.1, Water: 0.05, Earth: 0, Air: 0.05 },
    summer: { Fire: 0.2, Water: -0.05, Earth: -0.05, Air: 0.1 },
    autumn: { Fire: -0.05, Water: 0, Earth: 0.15, Air: 0.1 },
    winter: { Fire: -0.1, Water: 0.15, Earth: 0.1, Air: -0.05 },
  };

  return shifts[season] || { Fire: 0, Water: 0, Earth: 0, Air: 0 };
}

/**
 * Adjust element value with shift, keeping in 0-1 range
 * @param {number} value - Original element value
 * @param {number} shift - Amount to shift
 * @returns {number} Adjusted value
 */
function adjustElementValue(value, shift) {
  return Math.max(0, Math.min(1, value + shift));
}

/**
 * Calculate Kalchm value from elemental properties
 * @param {Object} elements - Elemental properties
 * @returns {number} Kalchm value
 */
function calculateKalchmValue(elements) {
  const { Fire, Water, Earth, Air } = elements;
  // Using the formula from the core alchemical calculations
  const Spirit = Fire;
  const Essence = Water;
  const Matter = Earth;
  const Substance = Air;

  const numerator = Math.pow(Spirit, Spirit) * Math.pow(Essence, Essence);
  const denominator = Math.pow(Matter, Matter) * Math.pow(Substance, Substance);

  // Avoid division by zero
  if (denominator === 0) return 1.0;

  const kalchm = numerator / denominator;

  // Normalize to a reasonable range
  return Math.max(0.5, Math.min(1.5, kalchm));
}

/**
 * Calculate Monica value
 * @param {Object} elements - Elemental properties
 * @param {string} season - Target season
 * @returns {number} Monica value
 */
function calculateMonicaValue(elements, season) {
  const { Fire, Water, Earth, Air } = elements;

  // Calculate heat
  const heat = (Fire * Fire) / Math.pow(Water + Earth + Air, 2);

  // Calculate entropy
  const entropy = (Fire * Fire + Air * Air) / Math.pow(Water + Earth, 2);

  // Calculate reactivity
  const reactivity = (Fire * Fire + Water * Water + Air * Air) / Math.pow(Earth, 2);

  // Calculate Greg's Energy
  const gregsEnergy = heat - entropy * reactivity;

  // Calculate Kalchm
  const kalchm = calculateKalchmValue(elements);

  // Calculate Monica constant
  let monica = 0;
  if (kalchm > 0) {
    const lnK = Math.log(kalchm);
    if (lnK !== 0) {
      monica = -gregsEnergy / (reactivity * lnK);
    }
  }

  // Apply seasonal modifier
  const seasonModifier = getSeasonModifier(season);
  monica *= seasonModifier;

  // Normalize to a reasonable range
  return Math.max(0.5, Math.min(1.5, monica));
}

/**
 * Get seasonal modifier for Monica calculations
 * @param {string} season - Target season
 * @returns {number} Modifier
 */
function getSeasonModifier(season) {
  const modifiers = {
    spring: 1.1,
    summer: 1.2,
    autumn: 0.9,
    winter: 0.8,
  };

  return modifiers[season] || 1.0;
}

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export module
export default {
  generateMonicaOptimizedRecipe,
  adaptRecipeForSeason,
};
