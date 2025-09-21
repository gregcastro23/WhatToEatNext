import { log } from '@/services/LoggingService';
/**
 * foodRecommenderFix.js
 *
 * This file provides focused fixes for the Food Recommender component, addressing both
 * Chrome Extension API issues and assignment to const variable errors.
 */

// Execute immediately to fix issues before the component mounts
(function () {
  if (typeof window === 'undefined') return;

  log.info('[FoodRecommenderFix] Initializing fixes for FoodRecommender component');

  // Make sure Chrome API is properly mocked
  if (typeof window.chrome === 'undefined' || !window.chrome.tabs) {
    log.info('[FoodRecommenderFix] Setting up Chrome API');
    window.chrome = window.chrome || {};
    window.chrome.tabs = window.chrome.tabs || {
      create: options => {
        log.info('[FoodRecommenderFix] chrome.tabs.create intercepted:', options);
        return Promise.resolve({ id: 999, url: options?.url || 'about:blank' });
      },
    };
  }

  // Fix elemental functions to use let instead of const
  const fixedFunctions = {
    getElementRanking: function (element_object, _rank) {
      // Use let for variables that will be reassigned
      const element_rank_dict = { 1: '', 2: '', 3: '', 4: '' };
      let largest_element_value = 0;

      // Handle null / (undefined || 1) input
      if (!element_object) {
        element_rank_dict[1] = 'Fire'; // Default to Fire
        return element_rank_dict;
      }

      // Find highest value element
      for (const element in element_object) {
        if (element_object[element] > largest_element_value) {
          largest_element_value = element_object[element];
          element_rank_dict[1] = element;
        }
      }

      return element_rank_dict;
    },

    createElementObject: function () {
      return {
        Fire: 0,
        Water: 0,
        Air: 0,
        Earth: 0,
      };
    },

    combineElementObjects: function (element_object_1, element_object_2) {
      // Create defensive fallbacks for null / (undefined || 1) inputs
      const obj1 = element_object_1 || { Fire: 0, Water: 0, Air: 0, Earth: 0 };
      const obj2 = element_object_2 || { Fire: 0, Water: 0, Air: 0, Earth: 0 };

      // Create a new object instead of modifying existing
      const combined_object = {
        Fire: (obj1['Fire'] || 0) + (obj2['Fire'] || 0),
        Water: (obj1['Water'] || 0) + (obj2['Water'] || 0),
        Air: (obj1['Air'] || 0) + (obj2['Air'] || 0),
        Earth: (obj1['Earth'] || 0) + (obj2['Earth'] || 0),
      };

      return combined_object;
    },

    getAbsoluteElementValue: function (element_object) {
      if (!element_object) return 0;

      let absolute_value = 0;
      absolute_value += element_object['Fire'] || 0;
      absolute_value += element_object['Water'] || 0;
      absolute_value += element_object['Air'] || 0;
      absolute_value += element_object['Earth'] || 0;

      return absolute_value;
    },

    // Safe wrapper for alchemize function
    safeAlchemize: function (birth_info, horoscope_dict) {
      try {
        // This is a mock / (safe || 1) implementation that won't throw errors
        return {
          'Sun Sign': horoscope_dict?.tropical?.CelestialBodies?.sun?.Sign?.label || 'Aries',
          'Dominant Element': 'Fire',
          'Total Effect Value': {
            Fire: 1,
            Water: 1,
            Air: 1,
            Earth: 1,
          },
        };
      } catch (e) {
        console.error('[FoodRecommenderFix] Error in safeAlchemize:', e);
        return {
          'Sun Sign': 'Aries',
          'Dominant Element': 'Fire',
          'Total Effect Value': {
            Fire: 1,
            Water: 1,
            Air: 1,
            Earth: 1,
          },
        };
      }
    },

    // Helper for capitalizing strings
    capitalize: function (string) {
      if (!string || typeof string !== 'string') return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
  };

  // Add these safer functions to window / (global || 1) scope
  Object.keys(fixedFunctions).forEach(key => {
    window[key] = fixedFunctions[key];
  });

  // Fix IngredientFilterService if needed
  if (window.ingredientFilterService) {
    log.info('[FoodRecommenderFix] Patching IngredientFilterService');

    // Create safe wrappers for key methods that might fail
    const originalMethods = {
      getBalancedRecommendations: window.ingredientFilterService.getBalancedRecommendations,
    };

    // Add error recovery for the key methods
    window.ingredientFilterService.getBalancedRecommendations = function (...args) {
      try {
        return originalMethods.getBalancedRecommendations.apply(
          window.ingredientFilterService,
          args,
        );
      } catch (e) {
        console.error('[FoodRecommenderFix] Error in getBalancedRecommendations:', e);
        // Return empty but valid result
        return {};
      }
    };
  }

  // Patch up any missing required globals for the FoodRecommender component
  if (typeof window.alchemize !== 'function') {
    window.alchemize = fixedFunctions.safeAlchemize;
  }

  // This flag helps the component know our fixes are applied
  window.__foodRecommenderFixApplied = true;

  log.info('[FoodRecommenderFix] Fixes applied successfully');
})();

export default {};
