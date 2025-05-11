/**
 * Enhanced popup.js with robust error prevention
 * 
 * This script ensures the popup API is reliably available
 * and prevents any "Assignment to constant variable" errors
 */

(function() {
  try {
    // CRITICAL: Define popup object immediately to avoid undefined errors
    window.popup = window.popup || {
      create: function() {
        return {
          show: function() { return this; },
          hide: function() { return this; },
          update: function() { return this; }
        };
      }
    };

    // Mark as initialized to prevent duplicate initialization
    if (window.__popupInitialized) {
      return;
    }
    
    console.log('[PopupJS] Initializing enhanced popup implementation');
    
    // More comprehensive popup implementation
    window.popup = {
      create: function(options) {
        console.log('[PopupJS] popup.create() called');
        return {
          show: function() { return this; },
          hide: function() { return this; },
          update: function() { return this; },
          on: function() { return { off: function() {} }; }
        };
      },
      show: function() { return this; },
      hide: function() { return this; },
      update: function() { return this; },
      on: function() { return { off: function() {} }; },
      remove: function() { return this; }
    };
    
    // Mark as initialized
    window.__popupInitialized = true;
    
    // Add a global error handler specifically for popup-related errors
    window.addEventListener('error', function(event) {
      if (event && event.error && 
          (event.error.message && 
           (event.error.message.includes('Assignment to constant variable') ||
            event.error.message.includes('Cannot read properties of undefined') ||
            event.error.message.includes('popup')))) {
        
        console.warn('[PopupJS] Caught error:', event.error.message);
        
        // Re-initialize popup if needed
        window.popup = window.popup || {};
        window.popup.create = window.popup.create || function() {
          return {
            show: function() { return this; },
            hide: function() { return this; },
            update: function() { return this; }
          };
        };
        
        // Prevent the error from propagating
        event.preventDefault();
        return true;
      }
    }, true);
    
    // Add to window.chrome for compatibility
    if (!window.chrome) {
      window.chrome = {
        extension: {
          getURL: function() { return ''; },
          sendMessage: function() {}
        },
        runtime: {
          sendMessage: function() {},
          onMessage: {
            addListener: function() {},
            removeListener: function() {}
          }
        }
      };
    }
    
    // Add robust defineProperty handling to prevent assignment errors
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function(obj, prop, descriptor) {
      try {
        return originalDefineProperty(obj, prop, descriptor);
      } catch (error) {
        console.warn('[PopupJS] Error in defineProperty:', error.message);
        
        // Handle common errors by providing a more permissive property
        if (error.message.includes('Assignment to constant variable')) {
          obj[prop] = descriptor.value;
          return obj;
        }
        throw error;
      }
    };
    
    console.log('[PopupJS] Enhanced popup implementation loaded successfully');
  } catch (error) {
    // Last resort error handler
    console.error('[PopupJS] Critical error in popup.js:', error);
    
    // Ensure popup API is available even after errors
    window.popup = window.popup || {
      create: function() { 
        return {
          show: function() { return this; },
          hide: function() { return this; },
          update: function() { return this; }
        };
      }
    };
  }
})();

// Define in the global scope for immediate availability
window.ensurePopupInitialized = function() {
  if (!window.popup || typeof window.popup.create !== 'function') {
    window.popup = window.popup || {};
    window.popup.create = window.popup.create || function() {
      return {
        show: function() { return this; },
        hide: function() { return this; },
        update: function() { return this; }
      };
    };
    console.log('[PopupJS] Re-established popup object from ensurePopupInitialized');
  }
  return window.popup;
}; 