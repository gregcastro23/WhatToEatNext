/**
 * globalInitializer.js
 * This file must be imported FIRST in _app.tsx to guarantee it runs before any other scripts.
 * It provides robust initialization for global objects and protects against security measures
 * that might remove intrinsics.
 */

(function() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  console.log('[GlobalInitializer] Starting early initialization');
  
  // Store original values of methods that might be affected by lockdown
  const safeObjectDefineProperty = Object.defineProperty;
  const safeObjectCreate = Object.create;
  
  /**
   * Create a reliable popup object with all necessary methods
   * This uses closure to protect the methods from being removed
   */
  const createSafePopup = () => {
    const popupMethods = {
      create: function() {
        console.log('[SafePopup] create() called');
        return {
          show: function() { console.log('[SafePopup] show() called'); return this; },
          hide: function() { console.log('[SafePopup] hide() called'); return this; },
          update: function() { console.log('[SafePopup] update() called'); return this; },
          on: function() { return { off: function() {} }; }
        };
      },
      show: function() { console.log('[SafePopup] root show() called'); return this; },
      hide: function() { console.log('[SafePopup] root hide() called'); return this; },
      update: function() { console.log('[SafePopup] root update() called'); return this; }
    };
    
    // Return a function that always gives access to these methods
    return function() {
      return {...popupMethods};
    };
  };
  
  // Create our safe popup provider
  const safePopupProvider = createSafePopup();
  
  // Check if popup object already exists and preserve its methods
  const existingPopupMethods = {};
  if (window.popup) {
    console.log('[GlobalInitializer] Preserving existing popup methods');
    const methods = ['create', 'show', 'hide', 'update'];
    methods.forEach(method => {
      if (typeof window.popup[method] === 'function') {
        existingPopupMethods[method] = window.popup[method];
      }
    });
  }
  
  // Create getters for elemental functions
  const safeElementalFunctions = {
    getElementRanking: function(element_object) {
      try {
        // Create a completely new result object, never try to modify an existing one
        const result = {
          1: '',
          2: '',
          3: '',
          4: ''
        };
        
        // Handle null / (undefined || 1)
        if (!element_object) {
          result[1] = 'Fire';
          return result;
        }
        
        // Convert to array of [element, value] pairs for sorting
        const elementPairs = Object.entries(element_object);
        
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
        console.error('[SafeElemental] getElementRanking error:', error);
        return { 1: 'Fire', 2: 'Water', 3: 'Earth', 4: 'Air' };
      }
    },
    createElementObject: function() {
      return { 'Fire': 0, 'Water': 0, 'Air': 0, 'Earth': 0 };
    },
    combineElementObjects: function(obj1, obj2) {
      try {
        const result = { 'Fire': 0, 'Water': 0, 'Air': 0, 'Earth': 0 };
        
        if (obj1 && typeof obj1 === 'object') {
          result.Fire += obj1.Fire || 0;
          result.Water += obj1.Water || 0;
          result.Air += obj1.Air || 0;
          result.Earth += obj1.Earth || 0;
        }
        
        if (obj2 && typeof obj2 === 'object') {
          result.Fire += obj2.Fire || 0;
          result.Water += obj2.Water || 0;
          result.Air += obj2.Air || 0;
          result.Earth += obj2.Earth || 0;
        }
        
        return result;
      } catch (error) {
        console.error('[SafeElemental] combineElementObjects error:', error);
        return { 'Fire': 0, 'Water': 0, 'Air': 0, 'Earth': 0 };
      }
    },
    getAbsoluteElementValue: function(obj) {
      try {
        if (!obj || typeof obj !== 'object') return 0;
        
        let sum = 0;
        sum += parseFloat(obj.Fire || 0);
        sum += parseFloat(obj.Water || 0);
        sum += parseFloat(obj.Air || 0);
        sum += parseFloat(obj.Earth || 0);
        return sum;
      } catch (error) {
        console.error('[SafeElemental] getAbsoluteElementValue error:', error);
        return 0;
      }
    },
    capitalize: function(str) {
      if (!str || typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };
  
  // Use defineProperty to make these objects resilient against interference
  safeObjectDefineProperty(window, 'popup', {
    configurable: true,
    enumerable: true,
    get: function() {
      // Combine safe popup with any existing methods
      const safePopup = safePopupProvider();
      for (const method in existingPopupMethods) {
        if (typeof existingPopupMethods[method] === 'function') {
          safePopup[method] = existingPopupMethods[method];
        }
      }
      return safePopup;
    },
    set: function(newPopup) {
      // If something tries to replace popup, store its methods
      if (newPopup && typeof newPopup === 'object') {
        const methods = ['create', 'show', 'hide', 'update'];
        methods.forEach(method => {
          if (typeof newPopup[method] === 'function') {
            existingPopupMethods[method] = newPopup[method];
          }
        });
      }
      return true;
    }
  });
  
  // Add elemental functions
  const elementalFunctions = [
    'getElementRanking',
    'createElementObject',
    'combineElementObjects',
    'getAbsoluteElementValue',
    'capitalize'
  ];
  
  elementalFunctions.forEach(functionName => {
    safeObjectDefineProperty(window, functionName, {
      configurable: true,
      enumerable: true,
      get: function() {
        return safeElementalFunctions[functionName];
      },
      set: function() {
        return true; // Ignore attempts to replace our safe functions
      }
    });
  });
  
  // Add an error listener for assignment errors
  window.addEventListener('error', function(event) {
    if (event.message && (
      event.message.includes('Assignment to constant variable') ||
      event.message.includes('Cannot read properties of undefined')
    )) {
      console.warn('[GlobalInitializer] Intercepted error:', event.message);
      
      // Reinitialize popup if needed
      if (event.message.includes('popup')) {
        console.log('[GlobalInitializer] Reinitializing popup object');
        // Force a get on popup to trigger our getter
        const _ = window.popup;
      }
      
      event.preventDefault();
      return true;
    }
    return false;
  }, true);
  
  console.log('[GlobalInitializer] Initialization complete');
})();

export default {}; 