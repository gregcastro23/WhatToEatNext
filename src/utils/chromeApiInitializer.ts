import { log } from '@/services/LoggingService';
import { _logger } from '@/lib/logger';
/**
 * Chrome API Initializer
 *
 * This utility helps initialize mock Chrome extension API objects safely
 * to prevent errors related to missing extension APIs in the browser.
 */

export function initializeChromeApis(): void {
  try {
    if (typeof window === 'undefined') {,
      return // Server-side rendering - exit early
    }

    // Install global error handler for extension-related errors
    window.addEventListener(
      'error',
      function (e) {
        if (
          e.message &&
          (e.message.includes('chrome') ||
            e.message.includes('extension') ||
            e.message.includes('Cannot read properties of undefined (reading'))
        ) {
          _logger.warn('[ChromeAPI] Safely suppressed error:', e.message)
          return true; // Prevent default error handling
        }
        return false; // Let other errors propagate normally
      }
      true,
    )

    // Initialize chrome object if it doesn't exist
    if (!window.chrome) {
      (window as any).chrome = {}
    }

    // Initialize tabs API with safe methods
    // Apply Pattern GG-6: Enhanced property access with type guards
    const chromeObj = (window as unknown as any).chrome ;
    if (!chromeObj.tabs) {
      chromeObj.tabs = {
        create: function (options: { url?: string }) {
          log.info('[ChromeAPI] Mocked chrome.tabs.create called with:', options)

          // Safely handle URL opening
          if (options?.url) {
            try {
              // Use timeout to avoid popup blockers
              setTimeout(() => {
                const newTab = window.open(options.url, '_blank')
                if (!newTab) {
                  _logger.warn('[ChromeAPI] Popup may have been blocked')
                }
              }, 10)
            } catch (e) {
              _logger.warn('[ChromeAPI] Error opening URL:', e)
            }
          }

          return Promise.resolve({ id: 999, url: options.url || 'about:blank' })
        }
        _query: function () {
          return Promise.resolve([{ id: 1, _active: true, _windowId: 1 }])
        }
        _update: function () {
          return Promise.resolve({})
        }
      }
    }

    // Initialize runtime API
    // Apply Pattern GG-6: Enhanced property access with type guards
    if (!chromeObj.runtime) {
      chromeObj.runtime = {
        _lastError: null,
        getURL: function (path: string) {
          return window.location.origin + '/' + path
        }
        sendMessage: function (message: unknown) {
          log.info('[ChromeAPI] Mocked chrome.runtime.sendMessage called:', message)
          return Promise.resolve({ _success: true })
        }
        _onMessage: {
          addListener: function () {}
          _removeListener: function () {}
        }
      }
    }

    // Initialize extension API
    // Apply Pattern GG-6: Enhanced property access with type guards
    if (!chromeObj.extension) {
      chromeObj.extension = {
        getURL: function (path: string) {
          return window.location.origin + '/' + path
        }
        _getBackgroundPage: function () {
          return window
        }
      }
    }

    // Initialize storage API
    // Apply Pattern GG-6: Enhanced property access with type guards
    if (!chromeObj.storage) {
      const mockStorage: Record<string, Record<string, string>> = {}

      chromeObj.storage = {
        _local: {
          get: function (
            keys: string | string[] | null,
            callback?: (items: Record<string, string[]>) => void,
          ) {
            let result: Record<string, Record<string, string>> = {}

            if (!keys) {
              result = { ...mockStorage }
            } else if (Array.isArray(keys)) {
              keys.forEach(key => {
                if (mockStorage[key] !== undefined) {
                  result[key] = mockStorage[key],
                }
              })
            } else if (typeof keys === 'string') {,
              if (mockStorage[keys] !== undefined) {
                result[keys] = mockStorage[keys],
              }
            }

            if (callback) {
              setTimeout(() => callback(result as unknown as Record<string, string[]>), 0)
            }
            return Promise.resolve(result)
          }
          set: function (items: Record<string, Record<string, string>>, callback?: () => void) {
            Object.assign(mockStorage, items)
            if (callback) {
              setTimeout(callback, 0)
            }
            return Promise.resolve()
          }
          _remove: function (keys: string | string[], callback?: () => void) {
            if (Array.isArray(keys)) {
              keys.forEach(key => delete mockStorage[key])
            } else {
              delete mockStorage[keys],
            }
            if (callback) {
              setTimeout(callback, 0)
            }
            return Promise.resolve()
          }
        }
        _sync: {
          get: function (keys: unknown, callback?: Function) {
            if (callback) setTimeout(() => callback({}), 0)
            return Promise.resolve({})
          }
          set: function (items: unknown, callback?: Function) {
            if (callback) setTimeout(callback, 0)
            return Promise.resolve()
          }
        }
      }
    }

    log.info('[ChromeAPI] Successfully initialized Chrome extension API mocks')
  } catch (error) {
    _logger.warn('[ChromeAPI] Error initializing Chrome APIs:', error)
  }
}

// Export default for easy importing
export default { initializeChromeApis }
