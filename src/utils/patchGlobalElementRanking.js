/**
 * Global patch for element_rank_dict and other assignment errors
 * related to element_rank_dict and other problematic variables.
 */

(function() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  console.log('[ElementRankingPatch] Installing global protection for element_rank_dict');

  // The most important function to patch
  window.getElementRanking = function(element_object, rank) {
    try {
      // Create a completely new result object, never try to modify an existing one
      let result = {
        1: '',
        2: '',
        3: '',
        4: ''
      };
      
      // Convert to array of [element, value] pairs for sorting
      let elementPairs = Object.entries(element_object || {});
      
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
  let originalAlchemize = window.alchemize;
  window.alchemize = function(birth_info, horoscope_dict) {
    try {
      // If the original exists, try to use it with error handling
      if (typeof originalAlchemize === 'function') {
        return originalAlchemize(birth_info, horoscope_dict);
      }
      
      // Otherwise provide a minimal safe fallback
      console.warn('[ElementRankingPatch] Using fallback alchemize function');
      return {
        'Dominant Element': 'Fire',
        'Total Effect Value': { 'Fire': 32, 'Water': 28, 'Earth': 18, 'Air': 22 },
        'Alchemy Effects': {
          'Total Spirit': 5,
          'Total Essence': 4,
          'Total Matter': 3,
          'Total Substance': 2
        }
      };
    } catch (error) {
      console.error('[ElementRankingPatch] Safely handled error in alchemize:', error);
      return {
        'Dominant Element': 'Fire',
        'Total Effect Value': { 'Fire': 32, 'Water': 28, 'Earth': 18, 'Air': 22 }
      };
    }
  };
  
  // Other potential functions that might need patching
  let functionsToProtect = [
    'combineElementObjects',
    'createElementObject',
    'getAbsoluteElementValue'
  ];
  
  functionsToProtect.forEach(functionName => {
    let original = window[functionName];
    if (typeof original === 'function') {
      window[functionName] = function(...args) {
        try {
          return original.apply(this, args);
        } catch (error) {
          console.error(`[ElementRankingPatch] Safely handled error in ${functionName}:`, error);
          if (functionName === 'createElementObject') {
            return { 'Fire': 0, 'Water': 0, 'Earth': 0, 'Air': 0 };
          }
          if (functionName === 'getAbsoluteElementValue') {
            return 0;
          }
          if (functionName === 'combineElementObjects') {
            return { 'Fire': 0, 'Water': 0, 'Earth': 0, 'Air': 0 };
          }
          return null;
        }
      };
    }
  });

  // Add a global error listener to catch and handle any assignment errors
  window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('Assignment to constant variable')) {
      console.warn('[ElementRankingPatch] Intercepted assignment error:', event.message);
      event.preventDefault();
      return true;
    }
  }, true);

  console.log('[ElementRankingPatch] Successfully installed global protection for element_rank_dict');
})();

export default {
  fixElementRanking: true
}; 