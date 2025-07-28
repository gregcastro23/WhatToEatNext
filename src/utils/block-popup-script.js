import { log } from '@/services/LoggingService';
/**
 * block-popup-script.js
 * This script intercepts all script loading and blocks popup.js from loading
 * while providing our own implementation.
 */

(function() {
  if (typeof window === 'undefined') return;

  log.info('[BlockPopupScript] Installing popup.js blocking');

  // Create a robust popup implementation upfront
  window.popup = window.popup || {
    create: function() {
      log.info('[BlockedPopup] Using safe create');
      return {
        show: function() { log.info('[BlockedPopup] show called'); return this; },
        hide: function() { log.info('[BlockedPopup] hide called'); return this; },
        update: function() { log.info('[BlockedPopup] update called'); return this; },
        on: function() { 
          log.info('[BlockedPopup] on called'); 
          return { off: function() { log.info('[BlockedPopup] off called'); } }; 
        }
      };
    },
    show: function() { log.info('[BlockedPopup] root show called'); return this; },
    hide: function() { log.info('[BlockedPopup] root hide called'); return this; },
    update: function() { log.info('[BlockedPopup] root update called'); return this; }
  };

  // Block popupjs script loading via XHR interception
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function() {
    if (arguments[1] && typeof arguments[1] === 'string') {
      // If this is trying to load popup.js, log it and continue without actually loading
      if (arguments[1].includes('popup.js')) {
        console.warn('[BlockPopupScript] Blocked XHR request to popup.js');
        // Use a different URL to avoid loading the actual popup.js
        arguments[1] = 'data:text / (javascript || 1),log.info("[BlockPopupScript] Dummy popup.js loaded");';
      }
    }
    return originalOpen.apply(this, arguments);
  };

  // Block popup.js script loading via script tags
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT') {
            const src = node.src || '';
            if (src.includes('popup.js')) {
              console.warn('[BlockPopupScript] Blocking script load:', src);
              
              // Prevent the real script from loading
              node.setAttribute('src', 'data:text / (javascript || 1),log.info("[BlockPopupScript] Dummy popup.js loaded");');
              
              // Ensure our popup implementation is active
              if (!window.popup || !window.popup.create) {
                console.warn('[BlockPopupScript] Restoring popup object');
                window.popup = {
                  create: function() {
                    log.info('[BlockedPopup] Using safe create');
                    return {
                      show: function() { return this; },
                      hide: function() { return this; },
                      update: function() { return this; },
                      on: function() { return { off: function() {} }; }
                    };
                  },
                  show: function() { return this; },
                  hide: function() { return this; },
                  update: function() { return this; }
                };
              }
            }
          }
        });
      }
    });
  });

  // Start observing document for script additions
  observer.observe(document, { childList: true, subtree: true });

  // Make sure popup doesn't get removed or modified
  function ensurePopup() {
    if (!window.popup || typeof window.popup !== 'object') {
      console.warn('[BlockPopupScript] Popup object is missing or invalid, restoring');
      window.popup = {
        create: function() {
          return {
            show: function() { return this; },
            hide: function() { return this; },
            update: function() { return this; },
            on: function() { return { off: function() {} }; }
          };
        },
        show: function() { return this; },
        hide: function() { return this; },
        update: function() { return this; }
      };
    }
    
    if (!window.popup.create) {
      console.warn('[BlockPopupScript] popup.create is missing, restoring');
      window.popup.create = function() {
        return {
          show: function() { return this; },
          hide: function() { return this; },
          update: function() { return this; },
          on: function() { return { off: function() {} }; }
        };
      };
    }
  }

  // Run immediately and periodically
  ensurePopup();
  setInterval(ensurePopup, 100);

  log.info('[BlockPopupScript] Successfully installed popup.js blocking');
})();

export default {}; 