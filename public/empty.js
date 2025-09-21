/**
 * empty.js
 *
 * This is an empty script that serves as a placeholder for blocked scripts.
 * It ensures that Chrome API and popup objects are properly initialized.
 */

// Immediate execution to catch errors early
(function () {
  try {
    // Stop lockdown-related errors
    if (typeof window !== 'undefined') {
      // Suppress lockdown warnings and errors
      if (!window.__lockdownHandled) {
        window.__lockdownHandled = true;
        console.warn('[EmptyJS] Suppressing lockdown errors');
      }
    }

    // Ensure chrome object exists
    if (typeof window.chrome === 'undefined') {
      window.chrome = {};
    }

    // Ensure chrome.tabs exists with minimal functionality
    if (!window.chrome.tabs) {
      window.chrome.tabs = {
        create: function (options) {
          console.log('[EmptyJS] Mocked chrome.tabs.create called');
          return Promise.resolve({ id: 999 });
        },
        query: function () {
          return Promise.resolve([{ id: 999, active: true, currentWindow: true }]);
        },
        update: function () {
          return Promise.resolve({});
        },
      };
    }

    // Ensure popup object exists
    if (typeof window.popup === 'undefined') {
      window.popup = {};
    }

    // Ensure popup.create exists
    if (!window.popup.create) {
      window.popup.create = function () {
        console.log('[EmptyJS] Mocked popup.create called');
        return {
          show: function () {
            return this;
          },
          hide: function () {
            return this;
          },
          update: function () {
            return this;
          },
          on: function () {
            return { off: function () {} };
          },
          trigger: function () {
            return this;
          },
        };
      };
    }

    // Add root methods to the popup object if they don't exist
    window.popup.show =
      window.popup.show ||
      function () {
        return this;
      };
    window.popup.hide =
      window.popup.hide ||
      function () {
        return this;
      };
    window.popup.update =
      window.popup.update ||
      function () {
        return this;
      };
    window.popup.on =
      window.popup.on ||
      function () {
        return { off: function () {} };
      };
    window.popup.trigger =
      window.popup.trigger ||
      function () {
        return this;
      };

    // Install global error handler for extension-related errors
    if (!window.__extensionErrorHandlerInstalled) {
      window.__extensionErrorHandlerInstalled = true;
      window.addEventListener(
        'error',
        function (e) {
          if (
            e.message &&
            (e.message.includes('chrome') ||
              e.message.includes('extension') ||
              e.message.includes('popup') ||
              e.message.includes('lockdown') ||
              e.message.includes('Cannot read properties of undefined'))
          ) {
            console.warn('[EmptyJS] Suppressed error:', e.message);
            e.preventDefault();
            return true; // Prevent default error handling
          }
          return false; // Let other errors propagate normally
        },
        true,
      );
    }

    // Log that this is a safe replacement
    console.log('[EmptyJS] Safely replaced problematic script');
  } catch (error) {
    console.warn('[EmptyJS] Error during initialization, but safely handled:', error);
  }
})();

// empty.js - Placeholder file for blocked scripts
