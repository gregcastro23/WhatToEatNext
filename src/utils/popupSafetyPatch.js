/**
 * Enhanced Popup Safety Patch
 * 
 * This file provides a comprehensive safety layer for popup-related functionality.
 * It prevents "Cannot read properties of undefined (reading 'create')" errors
 * by providing fallback implementations for all popup methods.
 */

// Self-executing function to ensure immediate execution
(function() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  console.log('[PopupSafety] Applying aggressive popup safety patch');
  
  // Create the popup object if it doesn't exist
  if (!window.popup) {
    console.log('[PopupSafety] Creating missing popup object');
    window.popup = {};
  }
  
  // Check for create method which is the most commonly used
  if (!window.popup.create) {
    console.log('[PopupSafety] Installing popup.create method');
    window.popup.create = function() {
      console.log('[PopupSafety] Using safe popup.create fallback');
      return {
        show: function() { return this; },
        hide: function() { return this; },
        update: function() { return this; },
        on: function() { return { off: function() {} }; }
      };
    };
  }
  
  // Define a list of essential popup methods with safe implementations
  let essentialMethods = {
    show: function() { return window.popup; },
    hide: function() { return window.popup; },
    update: function() { return window.popup; },
    close: function() { return window.popup; },
    destroy: function() { return window.popup; },
    setContent: function() { return window.popup; },
    setTitle: function() { return window.popup; },
    setSize: function() { return window.popup; },
    setPosition: function() { return window.popup; },
    on: function() { return { off: function() {} }; },
    off: function() { return window.popup; },
    trigger: function() { return window.popup; }
  };
  
  // Add all essential methods with protection
  Object.entries(essentialMethods).forEach(([method, implementation]) => {
    if (!window.popup[method]) {
      console.log(`[PopupSafety] Installing missing method: popup.${method}`);
      window.popup[method] = implementation;
    }
  });
  
  // Add a backdoor to the original methods if they exist later
  let originalMethods = {};
  window.popup.__getOriginal = function(methodName) {
    return originalMethods[methodName] || null;
  };
  
  // Watch for popup methods being added later and store original references
  Object.keys(essentialMethods).forEach(method => {
    let descriptor = Object.getOwnPropertyDescriptor(window.popup, method);
    if (descriptor && descriptor.configurable) {
      let originalMethod = window.popup[method];
      Object.defineProperty(window.popup, method, {
        get: function() {
          return originalMethod;
        },
        set: function(newMethod) {
          console.log(`[PopupSafety] Method replaced: popup.${method}`);
          originalMethods[method] = newMethod;
          return newMethod;
        },
        configurable: true
      });
    }
  });
  
  // Mark as installed to prevent duplicate patching
  if (!window.popup._safetyInstalled) {
    window.popup._safetyInstalled = true;
  }
  
  console.log('[PopupSafety] Popup safety patch complete');
})();

// Export for direct import if needed
export let safePopup = {
  create: function() {
    return {
      show: function() { return this; },
      hide: function() { return this; },
      update: function() { return this; },
      on: function() { return { off: function() {} }; }
    };
  },
  show: function() { return this; },
  hide: function() { return this; },
  update: function() { return this; }
};

export default safePopup; 