// Final validation of popup/chrome APIs
(function () {
  try {
    // Check if popup.create is available
    if (!window.popup || typeof window.popup.create !== 'function') {
      console.warn('[ErrorHandlers] popup.create not available in final check, restoring');
      window.popup = window.popup || {};
      window.popup.create = function (options) {
        console.log('[ErrorHandlers] Final fallback popup.create called');
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

    // Handle "Assignment to constant variable" errors
    const originalDefineProperty = Object.defineProperty;
    Object.defineProperty = function (obj, prop, descriptor) {
      try {
        return originalDefineProperty(obj, prop, descriptor);
      } catch (error) {
        if (error && error.message && error.message.includes('Assignment to constant variable')) {
          console.warn('[ErrorHandlers] Caught assignment error in defineProperty for', prop);
          // Just assign the value directly instead
          obj[prop] = descriptor.value;
          return obj;
        }
        throw error; // Re-throw other errors
      }
    };

    console.log('[ErrorHandlers] Error handlers and safety checks initialized');
  } catch (e) {
    console.error('[ErrorHandlers] Error in initialization:', e);
  }
})();
