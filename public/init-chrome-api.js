// Chrome API and Popup API initialization
// This file provides mock implementations for browser extension APIs

(function() {
  try {
    console.log('[InitAPI] Starting API initialization');
    
    // Initialize tracking variables
    window.__popupInitialized = false;
    window.__chromeInitialized = false;
    
    // Initialize popup with all required methods immediately, making sure create exists
    window.popup = {
      create: function(options) {
        console.log('[InitAPI] popup.create called', options ? JSON.stringify(options) : 'no options');
        return {
          show: function() { console.log('[InitAPI] popup.show called'); return this; },
          hide: function() { console.log('[InitAPI] popup.hide called'); return this; },
          update: function(content) { console.log('[InitAPI] popup.update called', content); return this; },
          on: function(event, callback) { console.log('[InitAPI] popup.on called:', event); return { off: function() {} }; },
          trigger: function(event) { console.log('[InitAPI] popup.trigger called:', event); return this; }
        };
      },
      show: function() { console.log('[InitAPI] popup.show called'); return this; },
      hide: function() { console.log('[InitAPI] popup.hide called'); return this; },
      update: function(content) { console.log('[InitAPI] popup.update called'); return this; },
      on: function(event, callback) { console.log('[InitAPI] popup.on called:', event); return { off: function() {} }; },
      trigger: function(event) { console.log('[InitAPI] popup.trigger called:', event); return this; }
    };
    
    console.log('[InitAPI] Popup API initialized successfully');
    window.__popupInitialized = true;
    
    // Initialize Chrome API (only if not already defined)
    if (!window.chrome) {
      window.chrome = {};
      console.log('[InitAPI] Created chrome object');
    }
    
    // Ensure tabs API exists
    if (!window.chrome.tabs) {
      window.chrome.tabs = {
        create: function(options) {
          console.log('[InitAPI] chrome.tabs.create called', options);
          return Promise.resolve({ id: Math.floor(Math.random() * 1000) + 1 });
        },
        query: function(options) {
          console.log('[InitAPI] chrome.tabs.query called', options);
          return Promise.resolve([{ id: Math.floor(Math.random() * 1000) + 1 }]);
        },
        update: function(tabId, options) {
          console.log('[InitAPI] chrome.tabs.update called', tabId, options);
          return Promise.resolve({ id: tabId });
        }
      };
    } else {
      // Ensure create method exists
      if (typeof window.chrome.tabs.create !== 'function') {
        window.chrome.tabs.create = function(options) {
          console.log('[InitAPI] chrome.tabs.create called', options);
          return Promise.resolve({ id: Math.floor(Math.random() * 1000) + 1 });
        };
      }
    }
    
    // Ensure runtime API exists
    if (!window.chrome.runtime) {
      window.chrome.runtime = {
        sendMessage: function(message) {
          console.log('[InitAPI] chrome.runtime.sendMessage called', message);
        },
        onMessage: {
          addListener: function(callback) {
            console.log('[InitAPI] chrome.runtime.onMessage.addListener called');
          },
          removeListener: function(callback) {
            console.log('[InitAPI] chrome.runtime.onMessage.removeListener called');
          }
        }
      };
    }
    
    // Ensure extension API exists
    if (!window.chrome.extension) {
      window.chrome.extension = {
        getURL: function(path) {
          console.log('[InitAPI] chrome.extension.getURL called', path);
          return `/mock-extension/${path}`;
        }
      };
    }
    
    console.log('[InitAPI] Chrome API initialized successfully');
    window.__chromeInitialized = true;
    
    // Add fallback handling for setTimeout in case the API initialization happens after popup.js is loaded
    // This will check if popup.create is available and create it if not
    setTimeout(function() {
      if (!window.popup || typeof window.popup.create !== 'function') {
        console.warn('[InitAPI] popup.create not available in delayed check, restoring');
        if (!window.popup) window.popup = {};
        
        window.popup.create = function(options) {
          console.log('[InitAPI] Delayed fallback popup.create called', options);
          return {
            show: function() { return this; },
            hide: function() { return this; },
            update: function() { return this; },
            on: function() { return { off: function() {} }; },
            trigger: function() { return this; }
          };
        };
      }
    }, 500);
  } catch (e) {
    console.error('[InitAPI] Critical error during API initialization:', e);
    
    // Emergency recovery
    window.popup = window.popup || {};
    window.popup.create = window.popup.create || function() {
      return {
        show: function() { return this; },
        hide: function() { return this; },
        update: function() { return this; },
        on: function() { return { off: function() {} }; },
        trigger: function() { return this; }
      };
    };
    
    window.chrome = window.chrome || {};
    window.chrome.tabs = window.chrome.tabs || { create: function() { return Promise.resolve({}); } };
  }
})(); 