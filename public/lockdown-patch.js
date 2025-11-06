/**
 * lockdown-patch.js
 *
 * This script safely intercepts and neutralizes lockdown.js errors
 * that occur in the application.
 */

(function () {
  try {
    // Mark that we've handled lockdown
    window.__lockdownHandled = true;

    // Create safe stubs for lockdown methods
    window.lockdown =
      window.lockdown ||
      function () {
        console.log("[LockdownPatch] Safely intercepted lockdown() call");
        return true;
      };

    // Create a safe harden function
    window.harden =
      window.harden ||
      function (obj) {
        console.log("[LockdownPatch] Safely intercepted harden() call");
        return obj; // Just return the original object
      };

    // Store original Error constructor
    const OriginalError = window.Error;

    // Add a special handler for lockdown error messages
    window.addEventListener(
      "error",
      function (event) {
        if (
          event.message &&
          (event.message.includes("lockdown") ||
            event.message.includes("Removing unpermitted intrinsics") ||
            event.message.includes("harden") ||
            event.filename?.includes("lockdown"))
        ) {
          console.warn(
            "[LockdownPatch] Suppressed lockdown error:",
            event.message,
          );
          event.preventDefault();
          return true;
        }
        return false;
      },
      true,
    );

    console.log("[LockdownPatch] Successfully applied lockdown patches");
  } catch (error) {
    console.warn(
      "[LockdownPatch] Error during patching (safely handled):",
      error,
    );
  }
})();
