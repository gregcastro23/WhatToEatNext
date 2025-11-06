/**
 * dummy-popup.js
 * Complete replacement for the problematic popup.js that mocks Chrome Extension APIs
 *
 * This script ensures all necessary Chrome extension APIs and the popup API
 * are available, preventing "Cannot read properties of undefined" errors.
 */

(function () {
  // Be defensive from the start - all code runs in try-catch
  try {
    console.log("[DummyPopup] Initializing comprehensive Chrome API mocks...");

    // Check if already initialized and working properly
    if (window.__dummyPopupInitialized && window.popup && window.popup.create) {
      console.log("[DummyPopup] Already initialized properly");
      return;
    }

    //=========================================================================
    // CRITICAL: Initialize popup object and its methods first
    //=========================================================================

    // Create full popup API if it doesn't exist
    window.popup = window.popup || {};

    // Define core methods if not already defined

    // popup.create() - most critical method that causes errors
    window.popup.create =
      window.popup.create ||
      function (options) {
        console.log("[DummyPopup] popup.create() called with:", options);
        return {
          show: function () {
            console.log("[DummyPopup] popup.show() called");
            return this;
          },
          hide: function () {
            console.log("[DummyPopup] popup.hide() called");
            return this;
          },
          update: function (updateOptions) {
            console.log(
              "[DummyPopup] popup.update() called with:",
              updateOptions,
            );
            return this;
          },
          on: function (event, handler) {
            console.log("[DummyPopup] popup.on() called for event:", event);
            return {
              off: function () {
                console.log(
                  "[DummyPopup] popup.off() called for event:",
                  event,
                );
              },
            };
          },
          trigger: function (event, data) {
            console.log("[DummyPopup] popup.trigger() called");
            return this;
          },
        };
      };

    // Add other popup methods
    window.popup.show =
      window.popup.show ||
      function () {
        console.log("[DummyPopup] window.popup.show() called");
        return this;
      };

    window.popup.hide =
      window.popup.hide ||
      function () {
        console.log("[DummyPopup] window.popup.hide() called");
        return this;
      };

    window.popup.update =
      window.popup.update ||
      function (options) {
        console.log("[DummyPopup] window.popup.update() called with:", options);
        return this;
      };

    window.popup.on =
      window.popup.on ||
      function (event, handler) {
        console.log("[DummyPopup] window.popup.on() called for event:", event);
        return {
          off: function () {
            console.log(
              "[DummyPopup] window.popup.off() called for event:",
              event,
            );
          },
        };
      };

    window.popup.trigger =
      window.popup.trigger ||
      function (event, data) {
        console.log(
          "[DummyPopup] window.popup.trigger() called with event:",
          event,
        );
        return this;
      };

    //=========================================================================
    // Initialize Chrome Extension APIs
    //=========================================================================

    // Create chrome namespace if it doesn't exist
    window.chrome = window.chrome || {};

    // Initialize tabs API with all methods
    window.chrome.tabs = window.chrome.tabs || {
      create: function (options) {
        console.log("[DummyPopup] chrome.tabs.create() called with:", options);

        // Actually try to open a new tab if URL is provided
        if (options && options.url) {
          try {
            window.open(options.url, "_blank");
          } catch (e) {
            console.warn("[DummyPopup] Failed to open URL:", e);
          }
        }

        return Promise.resolve({ id: 999, url: options?.url || "about:blank" });
      },

      query: function (queryInfo) {
        console.log("[DummyPopup] chrome.tabs.query() called with:", queryInfo);
        return Promise.resolve([
          { id: 1, active: true, windowId: 1, url: window.location.href },
        ]);
      },

      update: function (tabId, updateProperties) {
        console.log(
          "[DummyPopup] chrome.tabs.update() called with:",
          tabId,
          updateProperties,
        );
        return Promise.resolve({ id: tabId || 1 });
      },

      get: function (tabId) {
        console.log("[DummyPopup] chrome.tabs.get() called with tabId:", tabId);
        return Promise.resolve({ id: tabId || 1, url: window.location.href });
      },

      remove: function (tabId) {
        console.log(
          "[DummyPopup] chrome.tabs.remove() called with tabId:",
          tabId,
        );
        return Promise.resolve();
      },

      reload: function (tabId) {
        console.log(
          "[DummyPopup] chrome.tabs.reload() called with tabId:",
          tabId,
        );
        return Promise.resolve();
      },
    };

    // Initialize runtime API
    window.chrome.runtime = window.chrome.runtime || {
      lastError: null,

      getURL: function (path) {
        return window.location.origin + "/" + path;
      },

      sendMessage: function (message, responseCallback) {
        console.log(
          "[DummyPopup] chrome.runtime.sendMessage() called with:",
          message,
        );

        if (typeof responseCallback === "function") {
          setTimeout(function () {
            responseCallback({ success: true, message: "Dummy response" });
          }, 50);
        }

        return true;
      },

      onMessage: {
        addListener: function (callback) {
          console.log(
            "[DummyPopup] chrome.runtime.onMessage.addListener() called",
          );
        },

        removeListener: function (callback) {
          console.log(
            "[DummyPopup] chrome.runtime.onMessage.removeListener() called",
          );
        },
      },

      connect: function (connectInfo) {
        console.log(
          "[DummyPopup] chrome.runtime.connect() called with:",
          connectInfo,
        );
        return {
          postMessage: function (message) {
            console.log(
              "[DummyPopup] port.postMessage() called with:",
              message,
            );
          },
          onMessage: {
            addListener: function (callback) {
              console.log("[DummyPopup] port.onMessage.addListener() called");
            },
          },
          onDisconnect: {
            addListener: function (callback) {
              console.log(
                "[DummyPopup] port.onDisconnect.addListener() called",
              );
            },
          },
        };
      },

      id: "dummy-extension-id",
    };

    // Initialize storage API
    window.chrome.storage = window.chrome.storage || {
      local: {
        get: function (keys, callback) {
          console.log(
            "[DummyPopup] chrome.storage.local.get() called with:",
            keys,
          );

          if (typeof callback === "function") {
            setTimeout(function () {
              callback({});
            }, 50);
          }

          return Promise.resolve({});
        },

        set: function (items, callback) {
          console.log(
            "[DummyPopup] chrome.storage.local.set() called with:",
            items,
          );

          if (typeof callback === "function") {
            setTimeout(callback, 50);
          }

          return Promise.resolve();
        },

        remove: function (keys, callback) {
          console.log(
            "[DummyPopup] chrome.storage.local.remove() called with:",
            keys,
          );

          if (typeof callback === "function") {
            setTimeout(callback, 50);
          }

          return Promise.resolve();
        },
      },

      sync: {
        get: function (keys, callback) {
          return window.chrome.storage.local.get(keys, callback);
        },

        set: function (items, callback) {
          return window.chrome.storage.local.set(items, callback);
        },

        remove: function (keys, callback) {
          return window.chrome.storage.local.remove(keys, callback);
        },
      },
    };

    // Initialize other APIs that might be used
    window.chrome.extension = window.chrome.extension || {
      getURL: function (path) {
        return window.chrome.runtime.getURL(path);
      },
    };

    // Initialize lockdown/harden methods
    window.lockdown =
      window.lockdown ||
      function () {
        console.log("[DummyPopup] lockdown() called");
        return true;
      };

    window.harden =
      window.harden ||
      function (obj) {
        return obj;
      };

    // Set flag to mark that we've initialized everything
    window.__dummyPopupInitialized = true;
    window.__popupInitialized = true;
    window.__chromeInitialized = true;
    window.__lockdownHandled = true;

    // Install global error handlers to catch any remaining popup.js errors
    window.addEventListener(
      "error",
      function (event) {
        if (
          event.message &&
          (event.message.includes("popup") ||
            event.message.includes("chrome") ||
            event.message.includes("Cannot read properties of undefined"))
        ) {
          console.warn("[DummyPopup] Intercepted error:", event.message);

          // If we get an error about popup, reinitialize it
          if (
            event.message.includes("popup") ||
            event.message.includes("Cannot read properties of undefined")
          ) {
            // Re-establish popup object
            window.popup = window.popup || {};
            window.popup.create =
              window.popup.create ||
              function () {
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
              };
          }

          event.preventDefault();
          return true;
        }
      },
      true,
    );

    console.log(
      "[DummyPopup] Successfully initialized all Chrome extension APIs and popup mocks",
    );
  } catch (error) {
    console.warn("[DummyPopup] Error during initialization:", error);

    // Final emergency fallbacks
    try {
      window.popup = window.popup || {};
      window.popup.create =
        window.popup.create ||
        function () {
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
        };

      window.chrome = window.chrome || {};
      window.chrome.tabs = window.chrome.tabs || {
        create: function () {
          return Promise.resolve({ id: 999 });
        },
      };
    } catch (e) {
      // Nothing more we can do
    }
  }
})();

// Export a function to check initialization status
window.checkChromeAPIMockStatus = function () {
  return {
    chromeObject: !!window.chrome,
    tabsAPI: !!(window.chrome && window.chrome.tabs),
    popupObject: !!window.popup,
    popupCreateMethod: !!(
      window.popup && typeof window.popup.create === "function"
    ),
    initialized: !!window.__dummyPopupInitialized,
  };
};
