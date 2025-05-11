/**
 * This file provides safe runtime patches for the planetInfo data structure
 * to prevent "Assignment to constant variable" errors when interacting with it.
 */

// If we're in the browser
if (typeof window !== 'undefined') {
  // Wait for the DOM to be loaded
  window.addEventListener('DOMContentLoaded', function() {
    try {
      // Create safe versions of all the functions that might interact with planetInfo
      let safeFunctions = {
        // CRUCIAL FIX: Safely implement getElementRanking with no assignments to constants
        getElementRanking: function(element_object, rank) {
          if (!element_object) {
            return { 1: 'Fire' };
          }
          
          // Create a new object that won't conflict with any constants
          let result = {};
          
          // Find the largest element
          let maxValue = -Infinity;
          let maxElement = '';
          
          // Iterate without modifying anything that could be const
          Object.keys(element_object).forEach(function(element) {
            if (element_object[element] > maxValue) {
              maxValue = element_object[element];
              maxElement = element;
            }
          });
          
          // Set the result without direct assignment
          if (maxElement) {
            result[1] = maxElement;
          } else {
            result[1] = 'Fire'; // Default
          }
          
          // If rank 2 is requested, find second largest
          if (rank >= 2) {
            let secondMaxValue = -Infinity;
            let secondMaxElement = '';
            
            Object.keys(element_object).forEach(function(element) {
              let value = element_object[element];
              if (value > secondMaxValue && value < maxValue && element !== maxElement) {
                secondMaxValue = value;
                secondMaxElement = element;
              }
            });
            
            if (secondMaxElement) {
              result[2] = secondMaxElement;
            }
          }
          
          return result;
        },
        
        // Safe implementation of calculateElementalScore
        calculateElementalScore: function(element_object) {
          // Default if nothing provided
          if (!element_object) return 0;
          
          // Calculate total value
          let total = 0;
          Object.keys(element_object).forEach(function(element) {
            total += element_object[element] || 0;
          });
          
          // Return normalized score between 0-1
          return Math.min(1, Math.max(0, total * 0.5));
        }
      };
      
      // Override global functions
      window.getElementRanking = safeFunctions.getElementRanking;
      window.calculateElementalScore = safeFunctions.calculateElementalScore;
      
      // Attempt to fix any existing usages in the planetInfo object
      if (window.planetInfo) {
        console.log('[PlanetInfoPatcher] Found planetInfo object, applying fixes...');
        
        // Create a proxy around planetInfo to intercept problematic operations
        let originalPlanetInfo = window.planetInfo;
        window.planetInfo = new Proxy(originalPlanetInfo, {
          get: function(target, prop) {
            // Return the fixed getElementRanking if that's what's requested
            if (prop === 'getElementRanking') {
              return safeFunctions.getElementRanking;
            }
            return target[prop];
          }
        });
      }
      
      console.log('[PlanetInfoPatcher] Successfully applied planetInfo patches');
    } catch (e) {
      console.error('[PlanetInfoPatcher] Error applying patches:', e);
    }
  });
} 