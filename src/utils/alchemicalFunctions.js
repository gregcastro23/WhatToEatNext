// Fixed alchemical functions for the food recommender component

/**
 * Calculate an elemental score based on element properties
 * @param {Object} element_object - Object containing elemental properties
 * @returns {number} - The calculated score between 0-1
 */
function calculateElementalScore(element_object) {
  if (!element_object) return 0;

  // Sum all elemental values to get a total
  const total = getAbsoluteElementValue(element_object);

  // Calculate a balanced score based on distribution
  let balance = 0;
  const count = Object.keys(element_object).length;
  const ideal = total / (count || 1); // Ideal balanced value

  // Calculate variance from ideal balance
  let variance = 0;
  for (const element in element_object) {
    variance += Math.abs(element_object[element] - ideal);
  }

  // Lower variance means better balance
  balance = 1 - variance / (total || 1);

  // Combine total and balance for final score (normalized between 0-1)
  return Math.min(1, Math.max(0, total * 0.6 + balance * 0.4));
}

/**
 * Get the ranking of elements by their values
 * @param {Object} element_object - Object containing elemental properties
 * @param {number} rank - Which rank to return (1 for highest, etc.)
 * @returns {Object} - Object with ranks as keys and element names as values
 */
function getElementRanking(element_object, rank) {
  // Use let instead of var or const to allow reassignment
  const element_rank_dict = {
    1: '',
    2: '',
    3: '',
    4: '',
  };
  let largest_element_value = 0;

  // Find the largest element
  for (const element in element_object) {
    if (element_object[element] > largest_element_value) {
      largest_element_value = element_object[element];
      element_rank_dict[1] = element;
    }
  }

  // Find 2nd largest if needed
  if (rank >= 2) {
    let second_largest = 0;
    for (const element in element_object) {
      if (
        element_object[element] > second_largest &&
        element_object[element] < largest_element_value &&
        element !== element_rank_dict[1]
      ) {
        second_largest = element_object[element];
        element_rank_dict[2] = element;
      }
    }
  }

  return element_rank_dict;
}

/**
 * Get the dominant element with the highest value
 * @param {Object} element_object - Object containing elemental properties
 * @returns {string} - Name of the dominant element
 */
function getDominantElement(element_object) {
  const ranking = getElementRanking(element_object, 1);
  return ranking[1] || 'Fire'; // Default to Fire if no dominant element
}

function createElementObject() {
  const elementObject = {
    Fire: 0,
    Water: 0,
    Air: 0,
    Earth: 0,
  };
  return elementObject;
}

function combineElementObjects(element_object_1, element_object_2) {
  const combined_object = createElementObject();
  combined_object['Fire'] = element_object_1['Fire'] + element_object_2['Fire'];
  combined_object['Water'] = element_object_1['Water'] + element_object_2['Water'];
  combined_object['Air'] = element_object_1['Air'] + element_object_2['Air'];
  combined_object['Earth'] = element_object_1['Earth'] + element_object_2['Earth'];
  return combined_object;
}

function getAbsoluteElementValue(element_object) {
  let absolute_value = 0;
  absolute_value += element_object['Fire'] || 0;
  absolute_value += element_object['Water'] || 0;
  absolute_value += element_object['Air'] || 0;
  absolute_value += element_object['Earth'] || 0;
  return absolute_value;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Export the functions
export {
  calculateElementalScore,
  getElementRanking,
  getDominantElement,
  createElementObject,
  combineElementObjects,
  getAbsoluteElementValue,
  capitalize,
};
