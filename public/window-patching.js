/**
 * window-patching.js
 *
 * This script patches the window object to ensure Chrome extension APIs
 * are available before any scripts try to use them.
 */

(function () {
  try {
    // Don't run this script more than once
    if (window.__windowPatchingApplied) return;
    window.__windowPatchingApplied = true;

    // The original window.onload function
    const originalOnload = window.onload;

    // Function to set up Chrome APIs
    function setupChromeAPIs() {
      // Define Chrome object
      if (!window.chrome) window.chrome = {};

      // Define tabs API
      if (!window.chrome.tabs) {
        window.chrome.tabs = {
          create: function (options) {
            console.log(
              "[WindowPatch] chrome.tabs.create called with:",
              options,
            );
            // Actually open the URL in a new tab if available
            if (options && options.url) {
              try {
                window.open(options.url, "_blank");
              } catch (e) {
                console.warn("[WindowPatch] Error opening URL:", e);
              }
            }
            return Promise.resolve({
              id: 999,
              url: options?.url || "about:blank",
            });
          },
          query: function () {
            return Promise.resolve([{ id: 1, active: true, windowId: 1 }]);
          },
          update: function () {
            return Promise.resolve({});
          },
          get: function () {
            return Promise.resolve({});
          },
        };
      }

      // Define Chrome runtime API
      if (!window.chrome.runtime) {
        window.chrome.runtime = {
          lastError: null,
          getURL: function (path) {
            return window.location.origin + "/" + path;
          },
          sendMessage: function () {
            return Promise.resolve({});
          },
          onMessage: {
            addListener: function () {},
            removeListener: function () {},
          },
        };
      }

      // Define popup API
      if (!window.popup) {
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
              on: function () {
                return { off: function () {} };
              },
              trigger: function () {
                return this;
              },
            };
          },
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
      }

      // Handle lockdown/harden APIs
      if (!window.lockdown) {
        window.lockdown = function () {
          return true;
        };
      }
      if (!window.harden) {
        window.harden = function (obj) {
          return obj;
        };
      }

      console.log("[WindowPatch] Chrome and popup APIs are ready");
    }

    // Install this immediately
    setupChromeAPIs();

    // Replace window.onload
    window.onload = function (event) {
      // Set up APIs again just to be sure
      setupChromeAPIs();

      // Call the original onload if it exists
      if (typeof originalOnload === "function") {
        originalOnload.call(window, event);
      }
    };

    // Capture DOMContentLoaded event
    document.addEventListener("DOMContentLoaded", function () {
      setupChromeAPIs();
    });

    // Also capture error events
    window.addEventListener(
      "error",
      function (event) {
        if (
          event.message &&
          (event.message.includes("popup") ||
            event.message.includes("chrome") ||
            event.message.includes("Cannot read properties of undefined"))
        ) {
          console.warn("[WindowPatch] Intercepted error:", event.message);

          // Re-setup APIs just in case
          setupChromeAPIs();

          // Prevent error propagation
          event.preventDefault();
          return true;
        }
        return false;
      },
      true,
    );

    console.log("[WindowPatch] Window object successfully patched");
  } catch (error) {
    console.warn("[WindowPatch] Error during window patching:", error);
  }
})();
