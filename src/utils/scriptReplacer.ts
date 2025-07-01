/**
 * Script Replacer Utility
 * 
 * This file runs immediately when imported and sets up global environment
 * protection against problematic scripts.
 */

// Only run in browser context
if (typeof window !== 'undefined') {
  // Global script error handler - must be first
  window.addEventListener('error', function(_event) {
    if (event.filename && (
      event.filename.includes('popup.js') ||
      event.filename.includes('lockdown') ||
      event.filename.includes('viewer.js')
    )) {
      console.warn('[ScriptReplacer] Blocked error from:', event.filename);
      event.preventDefault();
      return true;
    }
    return false;
  }, true);

  // Setup global properties for lockdown
  if (!(window as any).lockdown) {
    (window as any).lockdown = function() {
      console.log('[ScriptReplacer] Safely intercepted lockdown() call');
      return true;
    };
  }

  if (!(window as any).harden) {
    (window as any).harden = function(obj) {
      return obj;
    };
  }

  // Ensure Chrome APIs exist
  if (!window.chrome) {
    window.chrome = {};
  }

  // Ensure popup object exists
  if (!window.popup) {
    window.popup = {
      create: function(_options?: any) {
        return {
          show: function() { return this; },
          hide: function() { return this; },
          update: function() { return this; },
          on: function(_event: string, _callback?: any) {
            return { off: function() {} };
          },
          trigger: function(_event: string) { return this; }
        };
      },
      show: function() { return this; },
      hide: function() { return this; },
      update: function() { return this; },
      on: function(event: string, _callback?: any) {
        return { 
          off: function() {},
          trigger: function(event: string) { return this; }
        };
      },
      trigger: function(event: string) { return this; }
    };
  }

  // Safe chrome.tabs implementation
  if (!window.chrome.tabs) {
    window.chrome.tabs = {
      create: function() {
        console.log('[ScriptReplacer] Intercepted chrome.tabs.create call');
        return Promise.resolve({ id: 999 });
      },
      query: function(queryInfo: any, callback?: Function) {
        const result = [{ id: 1, active: true }];
        if (callback) callback(result);
        return true;
      },
      update: function(tabId: number, properties: any, callback?: Function) {
        if (callback) callback({});
        return true;
      }
    };
  }

  console.log('[ScriptReplacer] Successfully initialized environment protection');
}

export default {}; 