import { log } from '@/services/LoggingService';
/**
 * Global patch for element_rank_dict and other assignment errors
 * related to element_rank_dict and other problematic variables.
 */

(function () {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  log.info('[ElementRankingPatch] Installing global protection for element_rank_dict');

  // The most important function to patch
  window.getElementRanking = function (element_object, _rank) {
    try {
      // Create a completely new result object, never try to modify an existing one
      const result = {
        1: '',
        2: '',
        3: '',
        4: '',
      };

      // Convert to array of [element, value] pairs for sorting
      const elementPairs = Object.entries(element_object || {});

      // Sort by value in descending order
      elementPairs.sort((a, b) => b[1] - a[1]);

      // Assign to result object by rank
      elementPairs.forEach((pair, index) => {
        if (index < 4) {
          result[index + 1] = pair[0];
        }
      });

      return result;
    } catch (error) {
      console.error('[ElementRankingPatch] Safely handled error in getElementRanking:', error);
      return { 1: 'Fire', 2: 'Water', 3: 'Earth', 4: 'Air' };
    }
  };

  // Also patch the original problematic function in case it's directly called
  const originalAlchemize = window.alchemize;
  window.alchemize = function (birth_info, horoscope_dict) {
    try {
      // If the original exists, try to use it with error handling
      if (typeof originalAlchemize === 'function') {
        return originalAlchemize(birth_info, horoscope_dict);
      }

      // Otherwise provide a minimal safe fallback
      console.warn('[ElementRankingPatch] Using fallback alchemize function');
      return {
        'Dominant Element': 'Fire',
        'Total Effect Value': { Fire: 0, Water: 0, Earth: 0, Air: 0 },
        'Alchemy Effects': {
          'Total Spirit': 0,
          'Total Essence': 0,
          'Total Matter': 0,
          'Total Substance': 0,
        },
      };
    } catch (error) {
      console.error('[ElementRankingPatch] Safely handled error in alchemize:', error);
      return {
        'Dominant Element': 'Fire',
        'Total Effect Value': { Fire: 0, Water: 0, Earth: 0, Air: 0 },
      };
    }
  };

  // Other potential functions that might need patching
  const functionsToProtect = [
    'combineElementObjects',
    'createElementObject',
    'getAbsoluteElementValue',
  ];

  functionsToProtect.forEach(functionName => {
    const original = window[functionName];
    if (typeof original === 'function') {
      window[functionName] = function (...args) {
        try {
          return original.apply(this, args);
        } catch (error) {
          console.error(`[ElementRankingPatch] Safely handled error in ${functionName}:`, error);
          if (functionName === 'createElementObject') {
            return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
          }
          if (functionName === 'getAbsoluteElementValue') {
            return 0;
          }
          if (functionName === 'combineElementObjects') {
            return { Fire: 0, Water: 0, Earth: 0, Air: 0 };
          }
          return null;
        }
      };
    }
  });

  // Add a global error listener to catch and handle any assignment errors
  window.addEventListener(
    'error',
    function (event) {
      if (event.message && event.message.includes('Assignment to constant variable')) {
        console.warn('[ElementRankingPatch] Intercepted assignment error:', event.message);
        event.preventDefault();
        return true;
      }
    },
    true,
  );

  log.info('[ElementRankingPatch] Successfully installed global protection for element_rank_dict');
})();

export default {
  fixElementRanking: true,
};
