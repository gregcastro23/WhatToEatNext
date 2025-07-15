/**
 * block-popup.js
 * 
 * This script specifically blocks popup.js errors by intercepting
 * script load requests through a Service Worker-like approach.
 */

(function() {
  try {
    // Create internal cache for script origins we've handled
    const handledScripts = new Set();
    
    // Create a MutationObserver to watch for script tags being added to the page
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            // Check for script nodes
            if (node.tagName === 'SCRIPT') {
              const src = node.src || '';
              
              // If this is popup.js or related problematic scripts
              if (src.includes('popup.js') || 
                  src.includes('lockdown') || 
                  src.includes('viewer.js')) {
                
                if (!handledScripts.has(src)) {
                  handledScripts.add(src);
                  console.warn('[BlockPopup] Blocking problematic script:', src);
                  
                  // Prevent the script from loading by canceling the request
                  node.type = 'javascript/blocked';
                  
                  // Create a replacement script right after
                  const replacement = document.createElement('script');
                  replacement.textContent = `
                    console.log('[BlockPopup] Safely replaced ${src.split('/').pop()}');
                    // Ensure chrome APIs exist
                    window.chrome = window.chrome || {};
                    window.chrome.tabs = window.chrome.tabs || {
                      create: function() { return Promise.resolve({id: 999}); }
                    };
                    window.popup = window.popup || {
                      create: function() { 
                        return {
                          show: function() { return this; },
                          hide: function() { return this; },
                          update: function() { return this; }
                        };
                      }
                    };
                  `;
                  
                  // Add the replacement immediately after the blocked script
                  if (node.parentNode) {
                    node.parentNode.insertBefore(replacement, node.nextSibling);
                  }
                }
              }
            }
          });
        }
      });
    });
    
    // Start observing document for script additions
    observer.observe(document, { 
      childList: true, 
      subtree: true 
    });
    
    // Install a global error handler for popup.js errors
    window.addEventListener('error', function popupErrorHandler(event) {
      // Check if error comes from popup.js
      if (event.filename && event.filename.includes('popup.js')) {
        console.warn('[BlockPopup] Caught popup.js error:', event.message);
        event.preventDefault();
        return true;
      }
      
      // Also catch Chrome extension API errors
      if (event.message && (
        event.message.includes('chrome.') || 
        event.message.includes('Cannot read properties of undefined (reading')
      )) {
        console.warn('[BlockPopup] Caught Chrome API error:', event.message);
        event.preventDefault();
        return true;
      }
      
      return false;
    }, true);
    
    // Make sure popup is defined early
    if (!window.popup) {
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
        hide: function() { return this; }
      };
    }
    
    console.log('[BlockPopup] Successfully initialized popup script blocker');
  } catch (error) {
    console.warn('[BlockPopup] Error in initialization (safely caught):', error);
  }
})(); 