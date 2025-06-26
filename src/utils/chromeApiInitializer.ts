/**
 * Chrome API Initializer
 * 
 * This utility helps initialize mock Chrome extension API objects safely
 * to prevent errors related to missing extension APIs in the browser.
 */

export function initializeChromeApis(): void {
  try {
    if (typeof window === 'undefined') {
      return; // Server-side rendering - exit early
    }

    // Install global error handler for extension-related errors
    window.addEventListener('error', function(e) {
      if (e.message && (
        e.message.includes('chrome') || 
        e.message.includes('extension') ||
        e.message.includes('Cannot read properties of undefined (reading')
      )) {
        // console.warn('[ChromeAPI] Safely suppressed error:', e.message);
        return true; // Prevent default error handling
      }
      return false; // Let other errors propagate normally
    }, true);

    // Initialize chrome object if it doesn't exist
    if (!window.chrome) {
      (window as unknown).chrome = {};
    }

    // Initialize tabs API with safe methods
    if (!(window as unknown).chrome.tabs) {
      (window as unknown).chrome.tabs = {
        create: function(options: { url?: string }) {
          // console.log('[ChromeAPI] Mocked chrome.tabs.create called with:', _options);
          
          // Safely handle URL opening
          if (options && options.url) {
            try {
              // Use timeout to avoid popup blockers
              setTimeout(() => {
                const newTab = window.open(options.url, '_blank');
                if (!newTab) {
                  // console.warn('[ChromeAPI] Popup may have been blocked');
                }
              }, 10);
            } catch (e) {
              // console.warn('[ChromeAPI] Error opening URL:', e);
            }
          }
          
          return Promise.resolve({ id: 999, url: options?.url || 'about:blank' });
        },
        query: function() {
          return Promise.resolve([{ id: 1, active: true, windowId: 1 }]);
        },
        update: function() {
          return Promise.resolve({});
        }
      };
    }

    // Initialize runtime API
    if (!(window as unknown).chrome.runtime) {
      (window as unknown).chrome.runtime = {
        lastError: null,
        getURL: function(path: string) {
          return window.location.origin + '/' + path;
        },
        sendMessage: function(message: Record<string, unknown>) {
          // console.log('[ChromeAPI] Mocked chrome.runtime.sendMessage called:', _message);
          return Promise.resolve({ success: true });
        },
        onMessage: {
          addListener: function() {},
          removeListener: function() {}
        }
      };
    }

    // Initialize extension API
    if (!(window as unknown).chrome.extension) {
      (window as unknown).chrome.extension = {
        getURL: function(path: string) {
          return window.location.origin + '/' + path;
        },
        getBackgroundPage: function() {
          return window;
        }
      };
    }

    // Initialize storage API
    if (!(window as unknown).chrome.storage) {
      const mockStorage: Record<string, any> = {};
      
      (window as unknown).chrome.storage = {
        local: {
          get: function(keys: string | string[] | null, callback?: (items: Record<string, any>) => void) {
            let result: Record<string, any> = {};
            
            if (!keys) {
              result = { ...mockStorage };
            } else if (Array.isArray(keys)) {
              keys.forEach(key => {
                if (mockStorage[key] !== undefined) {
                  result[key] = mockStorage[key];
                }
              });
            } else if (typeof keys === 'string') {
              if (mockStorage[keys] !== undefined) {
                result[keys] = mockStorage[keys];
              }
            }
            
            if (callback) {
              setTimeout(() => callback(result), 0);
            }
            return Promise.resolve(result);
          },
          set: function(items: Record<string, any>, callback?: () => void) {
            Object.assign(mockStorage, items);
            if (callback) {
              setTimeout(callback, 0);
            }
            return Promise.resolve();
          },
          remove: function(keys: string | string[], callback?: () => void) {
            if (Array.isArray(keys)) {
              keys.forEach(key => delete mockStorage[key]);
            } else {
              delete mockStorage[keys];
            }
            if (callback) {
              setTimeout(callback, 0);
            }
            return Promise.resolve();
          }
        },
        sync: {
          get: function(keys: Record<string, unknown>, callback?: Function) {
            if (callback) setTimeout(() => callback({}), 0);
            return Promise.resolve({});
          },
          set: function(items: Record<string, unknown>, callback?: Function) {
            if (callback) setTimeout(callback, 0);
            return Promise.resolve();
          }
        }
      };
    }

    // console.log('[ChromeAPI] Successfully initialized Chrome extension API mocks');
  } catch (error) {
    // console.warn('[ChromeAPI] Error initializing Chrome APIs:', error);
  }
}

// Define types for Window with chrome property
declare global {
  interface Window {
    chrome?: Record<string, unknown>;
  }
}

// Export default for easy importing
export default { initializeChromeApis }; 