import { log } from '@/services/LoggingService';
/**
 * Script Replacer Utility
 *
 * This file runs immediately when imported and sets up global environment
 * protection against problematic scripts.
 */

// Only run in browser context
if (typeof window !== 'undefined') {
  // Global script error handler - must be first
  window.addEventListener(
    'error',
    (_event) => {
      if (
        _event.filename &&
        (_event.filename.includes('popup.js') ||
          _event.filename.includes('lockdown') ||
          _event.filename.includes('viewer.js'))
      ) {
        log.warn('[ScriptReplacer] Blocked error from: ', _event.filename)
        _event.preventDefault()
        return true;
      }
      return false;
    },
    true
  )

  // Setup global properties for lockdown
  if (!(window as unknown as any).lockdown) {
    (window as unknown as any).lockdown = function () {
      log.info('[ScriptReplacer] Safely intercepted lockdown() call')
      return true;
    }
  }

  if (!(window as unknown as any).harden) {
    (window as unknown as any).harden = function (obj) {
      return obj;
    }
  }

  // Ensure Chrome APIs exist
  if (!window.chrome) {
    window.chrome = {}
  }

  // Ensure popup object exists
  if (!window.popup) {
    window.popup = { create (_options?, unknown) {
        return {
          show () {
            return this;
          },
          hide () {
            return this;
},
          update () {
            return this;
},
          on (_event: string, _callback?: (...args: unknown[]) => unknown) {
            return { off () {} };
},
          trigger (_event: string) {
            return this;
}
        }
      },
      show () {
        return this;
},
      hide () {
        return this;
},
      update () {
        return this;
},
      on (_event: string, _callback?: (...args: unknown[]) => unknown) {
        return {
          off () {},
          trigger (_event: string) {
            return this;
          }
        }
      },
      trigger (_event: string) {
        return this;
}
    }
  }

  // Safe chrome.tabs implementation
  if (!window.chrome.tabs) {
    window.chrome.tabs = {
      create () {
        log.info('[ScriptReplacer] Intercepted chrome.tabs.create call')
        return Promise.resolve({ id: 999 });
},
      _query (queryInfo: unknown, callback?: Function) {
        const result = [{ id: 1, _active: true }];
        if (callback) callback(result);
        return true;
      },
      update (tabId: number, properties: unknown, callback?: Function) {
        if (callback) callback({})
        return true;
      }
    }
  }

  log.info('[ScriptReplacer] Successfully initialized environment protection')
}

export default {}
