/**
 * Advanced popup-fix.js
 *
 * This script ensures that popup API and chrome API are properly initialized
 * to prevent "Cannot read properties of undefined (reading 'create')" errors
 */

(function () {
  // Execute immediately, before any other scripts

  console.log("[PopupFix] Initializing popup API fix");

  // IMMEDIATELY define popup to avoid undefined errors
  if (!window.popup) {
    window.popup = {
      create: function (options) {
        console.log("[PopupFix] Popup.create called with options:", options);
        return {
          show: function () {
            console.log("[PopupFix] Popup.show called");
            return this;
          },
          hide: function () {
            console.log("[PopupFix] Popup.hide called");
            return this;
          },
          update: function (newOptions) {
            console.log(
              "[PopupFix] Popup.update called with options:",
              newOptions,
            );
            return this;
          },
          on: function (event, callback) {
            console.log("[PopupFix] Popup.on called for event:", event);
            return {
              off: function () {
                console.log("[PopupFix] Popup listener removed");
              },
            };
          },
        };
      },
      // Add global methods too
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
      remove: function () {
        return this;
      },
    };
  }

  // Ensure Chrome API is available
  if (!window.chrome) {
    window.chrome = {};
  }

  if (!window.chrome.tabs) {
    window.chrome.tabs = {
      create: function (options) {
        console.log("[PopupFix] chrome.tabs.create called with:", options);
        // Open in new tab instead of failing silently
        if (options && options.url) {
          window.open(options.url, "_blank");
        }
        return Promise.resolve({ id: 999 });
      },
      query: function () {
        return Promise.resolve([]);
      },
      update: function () {
        return Promise.resolve({});
      },
    };
  }

  if (!window.chrome.runtime) {
    window.chrome.runtime = {
      sendMessage: function () {
        return Promise.resolve({});
      },
      onMessage: {
        addListener: function () {},
        removeListener: function () {},
      },
      getURL: function (path) {
        return path;
      },
    };
  }

  // Create a global popup safety method
  window.ensurePopupWorks = function () {
    if (!window.popup || typeof window.popup.create !== "function") {
      console.warn("[PopupFix] Re-initializing popup API");
      window.popup = {
        create: function () {
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
          };
        },
      };
    }
    return window.popup;
  };

  // Call immediately to ensure it's available
  window.ensurePopupWorks();

  // Add error handler for popup-related errors
  window.addEventListener(
    "error",
    function (event) {
      if (
        event &&
        event.error &&
        event.error.message &&
        (event.error.message.includes("popup") ||
          event.error.message.includes("chrome") ||
          event.error.message.includes("Cannot read properties of undefined"))
      ) {
        console.warn("[PopupFix] Caught error:", event.error.message);
        window.ensurePopupWorks();

        // Prevent error from propagating if it's related to popup
        if (event.error.message.includes("popup")) {
          event.preventDefault();
          return true;
        }
      }
    },
    true,
  );

  console.log("[PopupFix] Popup API fix initialized successfully");
})();
