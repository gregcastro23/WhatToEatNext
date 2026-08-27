import { _logger } from "@/lib/logger";
import { log } from "@/services/LoggingService";

/**
 * Chrome API Initializer
 *
 * This utility helps initialize mock Chrome extension API objects safely
 * to prevent errors related to missing extension APIs in the browser.
 */

interface MockStorageArea {
  get: (
    keys: string | string[] | null,
    callback?: (items: Record<string, unknown>) => void,
  ) => Promise<Record<string, unknown>>;
  set: (
    items: Record<string, unknown>,
    callback?: () => void,
  ) => Promise<void>;
  _remove: (keys: string | string[], callback?: () => void) => Promise<void>;
}

interface MockChromeObject {
  tabs?: {
    create: (options: { url?: string }) => Promise<{ id: number; url: string }>;
    _query: () => Promise<Array<{ id: number; _active: boolean; _windowId: number }>>;
    _update: () => Promise<Record<string, unknown>>;
  };
  runtime?: {
    _lastError: unknown;
    getURL: (path: string) => string;
    sendMessage: (message: unknown) => Promise<{ _success: boolean }>;
    _onMessage: {
      addListener: () => void;
      _removeListener: () => void;
    };
  };
  extension?: {
    getURL: (path: string, _string?: unknown) => string;
    _getBackgroundPage: () => Window;
  };
  storage?: {
    _local: MockStorageArea;
    _sync: {
      get: (
        keys: string | string[] | null,
        _unused?: unknown,
        callback?: (res: Record<string, unknown>) => void,
      ) => Promise<Record<string, unknown>>;
      set: (items: unknown, callback?: () => void) => Promise<void>;
    };
  };
}

interface WindowWithChrome {
  chrome?: MockChromeObject;
}

export function initializeChromeApis(): void {
  try {
    if (typeof window === "undefined") {
      return; // Server-side rendering - exit early
    }

    // Install global error handler for extension-related errors
    window.addEventListener(
      "error",
      (e): boolean => {
        if (
          e.message &&
          (e.message.includes("chrome") ||
            e.message.includes("extension") ||
            e.message.includes("Cannot read properties of undefined (reading"))
        ) {
          _logger.warn("[ChromeAPI] Safely suppressed error: ", e.message);
          return true; // Prevent default error handling
        }
        return false; // Let other errors propagate normally
      },
      true,
    );

    const win = window as unknown as WindowWithChrome;
    win.chrome ??= {};
    const chromeObj = win.chrome;

    // Initialize tabs API with safe methods
    chromeObj.tabs ??= {
      create(options: { url?: string }): Promise<{ id: number; url: string }> {
        log.info(
          "[ChromeAPI] Mocked chrome.tabs.create called with: ",
          options,
        );

        // Safely handle URL opening
        if (options.url) {
          try {
            // Use timeout to avoid popup blockers
            setTimeout((): void => {
              const newTab = window.open(options.url, "_blank");
              if (!newTab) {
                _logger.warn("[ChromeAPI] Popup may have been blocked");
              }
            }, 10);
          } catch (e) {
            _logger.warn("[ChromeAPI] Error opening URL: ", e);
          }
        }

        return Promise.resolve({
          id: 999,
          url: options.url ?? "about:blank",
        });
      },
      _query(): Promise<Array<{ id: number; _active: boolean; _windowId: number }>> {
        return Promise.resolve([{ id: 1, _active: true, _windowId: 1 }]);
      },
      _update(): Promise<Record<string, unknown>> {
        return Promise.resolve({});
      },
    };

    // Initialize runtime API
    chromeObj.runtime ??= {
      _lastError: null,
      getURL(path: string): string {
        return `${window.location.origin}/${path}`;
      },
      sendMessage(message: unknown): Promise<{ _success: boolean }> {
        log.info(
          "[ChromeAPI] Mocked chrome.runtime.sendMessage called: ",
          message as Record<string, unknown>,
        );
        return Promise.resolve({ _success: true });
      },
      _onMessage: {
        addListener(): void {},
        _removeListener(): void {},
      },
    };

    // Initialize extension API
    chromeObj.extension ??= {
      getURL(path: string, _string?: unknown): string {
        return `${window.location.origin}/${path}`;
      },
      _getBackgroundPage(): Window {
        return window;
      },
    };

    // Initialize storage API
    if (!chromeObj.storage) {
      const mockStorage: Record<string, unknown> = {};

      chromeObj.storage = {
        _local: {
          get(
            keys: string | string[] | null,
            callback?: (items: Record<string, unknown>) => void,
          ): Promise<Record<string, unknown>> {
            let result: Record<string, unknown> = {};

            if (!keys) {
              result = { ...mockStorage };
            } else if (Array.isArray(keys)) {
              keys.forEach((key) => {
                if (key in mockStorage) {
                  result[key] = mockStorage[key];
                }
              });
            } else if (typeof keys === "string") {
              if (keys in mockStorage) {
                result[keys] = mockStorage[keys];
              }
            }

            if (callback) {
              setTimeout((): void => {
                callback(result);
              }, 0);
            }
            return Promise.resolve(result);
          },
          set(
            items: Record<string, unknown>,
            callback?: () => void,
          ): Promise<void> {
            Object.assign(mockStorage, items);
            if (callback) {
              setTimeout(callback, 0);
            }
            return Promise.resolve();
          },
          _remove(keys: string | string[], callback?: () => void): Promise<void> {
            if (Array.isArray(keys)) {
              keys.forEach((key) => {
                delete mockStorage[key];
              });
            } else {
              delete mockStorage[keys];
            }
            if (callback) {
              setTimeout(callback, 0);
            }
            return Promise.resolve();
          },
        },
        _sync: {
          get(
            _keys: string | string[] | null,
            _unused?: unknown,
            callback?: (res: Record<string, unknown>) => void,
          ): Promise<Record<string, unknown>> {
            if (callback) {
              setTimeout((): void => {
                callback({});
              }, 0);
            }
            return Promise.resolve({});
          },
          set(_items: unknown, callback?: () => void): Promise<void> {
            if (callback) {
              setTimeout((): void => {
                callback();
              }, 0);
            }
            return Promise.resolve();
          },
        },
      };
    }

    log.info("[ChromeAPI] Successfully initialized Chrome extension API mocks");
  } catch (error) {
    _logger.warn("[ChromeAPI] Error initializing Chrome APIs: ", error);
  }
}

// Export default for easy importing
export default { initializeChromeApis };
