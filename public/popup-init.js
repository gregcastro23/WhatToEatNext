/**
 * popup-init.js
 * Early initialization script for Chrome Extension APIs - loaded directly in the head
 * 
 * This is a minimal version that initializes just the core functionality
 * needed to prevent errors, with no logging or complex features.
 */

(function() {
  try {
    // Set defaults for Chrome API
    if (typeof window.chrome === 'undefined') {
      window.chrome = {};
    }
    
    // Initialize tabs API (minimal version)
    if (!window.chrome.tabs) {
      window.chrome.tabs = {
        create: function(options) {
          try {
            if (options && options.url) {
              setTimeout(function() {
                window.open(options.url, '_blank');
              }, 0);
            }
          } catch(e) {}
          return Promise.resolve({id: 999});
        }
      };
    }
    
    // Initialize popup API
    if (typeof window.popup === 'undefined') {
      window.popup = {};
    }
    
    // Create popup.create method
    if (!window.popup.create) {
      window.popup.create = function() {
        return {
          show: function() { return this; },
          hide: function() { return this; },
          update: function() { return this; },
          on: function() { return { off: function() {} }; },
          trigger: function() { return this; }
        };
      };
    }

    // Set basic popup methods
    if (!window.popup.show) window.popup.show = function() { return this; };
    if (!window.popup.hide) window.popup.hide = function() { return this; };
    if (!window.popup.update) window.popup.update = function() { return this; };
    
    // Set initialization flag
    window.__popupApiInitialized = true;
  } catch(e) {
    // Silent catch to avoid any errors during initialization
  }
})(); 