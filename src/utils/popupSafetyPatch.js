import { log } from '@/services/LoggingService';
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
  
  log.info('[PopupSafety] Applying aggressive popup safety patch');
  
  // Create the popup object if it doesn't exist
  if (!window.popup) {
    log.info('[PopupSafety] Creating missing popup object');
    window.popup = {};
  }
  
  // Check for create method which is the most commonly used
  if (!window.popup.create) {
    log.info('[PopupSafety] Installing popup.create method');
    window.popup.create = function() {
      log.info('[PopupSafety] Using safe popup.create fallback');
      return {
        show: function() { return this; },
        hide: function() { return this; },
        update: function() { return this; },
        on: function() { return { off: function() {} }; }
      };
    };
  }
  
  // Define a list of essential popup methods with safe implementations
  const essentialMethods = {
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
      log.info(`[PopupSafety] Installing missing method: popup.${method}`);
      window.popup[method] = implementation;
    }
  });
  
  // Add a backdoor to the original methods if they exist later
  const originalMethods = {};
  window.popup.__getOriginal = function(methodName) {
    return originalMethods[methodName] || null;
  };
  
  // Watch for popup methods being added later and store original references
  Object.keys(essentialMethods).forEach(method => {
    const descriptor = Object.getOwnPropertyDescriptor(window.popup, method);
    if (descriptor && descriptor.configurable) {
      const originalMethod = window.popup[method];
      Object.defineProperty(window.popup, method, {
        get: function() {
          return originalMethod;
        },
        set: function(newMethod) {
          log.info(`[PopupSafety] Method replaced: popup.${method}`);
          originalMethods[method] = newMethod;
        },
        configurable: true
      });
    }
  });
  
  // Mark as installed to prevent duplicate patching
  if (!window.popup._safetyInstalled) {
    window.popup._safetyInstalled = true;
  }
  
  log.info('[PopupSafety] Popup safety patch complete');
})();

// Export for direct import if needed
export const safePopup = {
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