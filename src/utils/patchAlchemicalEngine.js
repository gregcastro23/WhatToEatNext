import { log } from '@/services/LoggingService';
/**
 * patchAlchemicalEngine.js
 * 
 * This script patches the global alchemize function to avoid common issues:
 * - "Assignment to constant variable" errors in getElementRanking
 * - Chrome API dependencies
 * - Undefined variable errors
 */

(function() {
  try {
    // Don't re-apply patches
    if (window.__alchemicalEnginePatchApplied) {
      log.info('[PatchAlchemicalEngine] Patches already applied');
      return;
    }

    log.info('[PatchAlchemicalEngine] Applying patches...');

    // PATCH 1: Fix the getElementRanking function
    // This function has an issue where it tries to reassign const variables
    window.getElementRanking = function(element_object, _rank) {
      try {
        // Use let instead of const for variables that will be reassigned
        const element_rank_dict = {1: '', 2: '', 3: '', 4: ''};
        let largest_element_value = 0;
        
        // First, find the element with the largest value (rank 1)
        for (const element in element_object) {
          if (element_object[element] > largest_element_value) {
            largest_element_value = element_object[element];
            element_rank_dict[1] = element;
          }
        }

        return element_rank_dict;
      } catch (error) {
        console.warn('[PatchAlchemicalEngine] Error in getElementRanking:', error);
        // Provide a safe fallback
        return {1: 'Fire', 2: '', 3: '', 4: ''};
      }
    };

    // PATCH 2: Ensure createElementObject is available
    window.createElementObject = window.createElementObject || function() {
      return {Fire: 0, Water: 0, Air: 0, Earth: 0};
    };

    // PATCH 3: Ensure combineElementObjects is available
    window.combineElementObjects = window.combineElementObjects || function(element_object_1, element_object_2) {
      const combined_object = window.createElementObject();
      combined_object.Fire = (element_object_1?.Fire || 0) + (element_object_2?.Fire || 0);
      combined_object.Water = (element_object_1?.Water || 0) + (element_object_2?.Water || 0);
      combined_object.Air = (element_object_1?.Air || 0) + (element_object_2?.Air || 0);
      combined_object.Earth = (element_object_1?.Earth || 0) + (element_object_2?.Earth || 0);
      return combined_object;
    };

    // PATCH 4: Ensure getAbsoluteElementValue is available
    window.getAbsoluteElementValue = window.getAbsoluteElementValue || function(element_object) {
      if (!element_object) return 0;
      return (element_object.Fire || 0) + 
             (element_object.Water || 0) + 
             (element_object.Air || 0) + 
             (element_object.Earth || 0);
    };

    // PATCH 5: Ensure capitalize function is available
    window.capitalize = window.capitalize || function(string) {
      if (!string) return '';
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Mark that patches have been applied
    window.__alchemicalEnginePatchApplied = true;
    
    log.info('[PatchAlchemicalEngine] Successfully applied all patches');
  } catch (error) {
    console.error('[PatchAlchemicalEngine] Failed to apply patches:', error);
  }
})(); 