/**
 * popup-interceptor.js
 * This file intercepts requests to popup.js and ensures the popup object
 * is properly defined before any external scripts can use it.
 */

// Execute immediately
(function() {
  if (typeof window === 'undefined') return;

  console.log('[PopupInterceptor] Installing popup.js interceptor');

  // Create a failsafe popup object that will survive lockdown
  let failsafePopup = {
    create: () => ({
      show: () => ({}),
      hide: () => ({}),
      update: () => ({}),
      on: () => ({ off: () => {} })
    }),
    show: () => ({}),
    hide: () => ({}),
    update: () => ({})
  };

  // Directly assign to window.popup to override any potential issues
  window.popup = window.popup || failsafePopup;

  // Ensure create method exists
  if (!window.popup.create) {
    window.popup.create = failsafePopup.create;
  }

  // Store a reference that can't be deleted
  Object.defineProperty(window, '__popup_backup', {
    value: {...failsafePopup},
    writable: false,
    configurable: false
  });

  // Monitor for popup integrity issues
  let checkPopupIntegrity = () => {
    if (!window.popup || !window.popup.create) {
      console.warn('[PopupInterceptor] Popup object is missing, restoring!');
      window.popup = window.__popup_backup;
    }
  };

  // Check immediately
  checkPopupIntegrity();

  // Then check periodically
  setInterval(checkPopupIntegrity, 500);

  // Intercept script loading to handle popup.js specifically
  let originalCreateElement = document.createElement;
  
  document.createElement = function(tagName) {
    let element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      // Monitor script src attribute
      let originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && (value.includes('popup.js') || value.includes('lockdown'))) {
          console.warn(`[PopupInterceptor] Intercepted ${value}`);
          
          // Force our popup implementation first
          checkPopupIntegrity();
          
          // For lockdown scripts, add a pre-hook
          if (value.includes('lockdown')) {
            console.warn('[PopupInterceptor] Preparing for lockdown script');
            // Strengthen popup object before lockdown runs
            Object.defineProperty(window, 'popup', {
              value: failsafePopup,
              writable: false,
              configurable: false
            });
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };

  console.log('[PopupInterceptor] Script interception active');
})();

export default {}; 