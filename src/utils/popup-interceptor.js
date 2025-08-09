import { log } from '@/services/LoggingService';
/**
 * popup-interceptor.js
 * This file intercepts requests to popup.js and ensures the popup object
 * is properly defined before any external scripts can use it.
 */

// Execute immediately
(function () {
  if (typeof window === 'undefined') return;

  log.info('[PopupInterceptor] Installing popup.js interceptor');

  // Create a failsafe popup object that will survive lockdown
  const failsafePopup = {
    create: () => ({
      show: () => ({}),
      hide: () => ({}),
      update: () => ({}),
      on: () => ({ off: () => {} }),
    }),
    show: () => ({}),
    hide: () => ({}),
    update: () => ({}),
  };

  // Directly assign to window.popup to override any potential issues
  window.popup = window.popup || failsafePopup;

  // Ensure create method exists
  if (!window.popup.create) {
    window.popup.create = failsafePopup.create;
  }

  // Store a reference that can't be deleted
  Object.defineProperty(window, '__popup_backup', {
    value: { ...failsafePopup },
    writable: false,
    configurable: false,
  });

  // Monitor for popup integrity issues
  const checkPopupIntegrity = () => {
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
  const originalCreateElement = document.createElement;

  document.createElement = function (tagName) {
    const element = originalCreateElement.call(document, tagName);

    if (tagName.toLowerCase() === 'script') {
      // Monitor script src attribute
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function (name, value) {
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
              configurable: false,
            });
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
    }

    return element;
  };

  log.info('[PopupInterceptor] Script interception active');
})();

export default {};
