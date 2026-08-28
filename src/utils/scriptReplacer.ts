import { log } from "@/services/LoggingService";

/**
 * Script Replacer Utility
 *
 * This file runs immediately when imported and sets up global environment
 * protection against problematic scripts.
 */

interface PopupInstance {
  show: () => PopupInstance;
  hide: () => PopupInstance;
  update: () => PopupInstance;
  on: (_event: string, _callback?: (...args: unknown[]) => unknown) => { off: () => void };
  trigger: (_event: string) => PopupInstance;
}

interface PopupGlobal {
  create: (_options?: Record<string, unknown>, _unknown?: unknown) => PopupInstance;
  show: () => PopupGlobal;
  hide: () => PopupGlobal;
  update: () => PopupGlobal;
  on: (_event: string, _callback?: (...args: unknown[]) => unknown) => {
    off: () => void;
    trigger: (_event: string) => PopupGlobal;
  };
  trigger: (_event: string) => PopupGlobal;
}

interface MockChromeTabs {
  create: () => Promise<{ id: number }>;
  _query: (queryInfo: unknown, callback?: (res: unknown) => void) => boolean;
  update: (tabId: number, properties: unknown, callback?: (res: unknown) => void) => boolean;
  [key: string]: unknown;
}

interface WindowWithCustomGlobals extends Window {
  lockdown?: () => boolean;
  harden?: <T>(obj: T) => T;
  chrome?: {
    tabs?: MockChromeTabs;
    [key: string]: unknown;
  };
  popup?: PopupGlobal;
}

// Only run in browser context
if (typeof window !== "undefined") {
  // Global script error handler - must be first
  window.addEventListener(
    "error",
    (_event): boolean => {
      if (
        _event.filename &&
        (_event.filename.includes("popup.js") ||
          _event.filename.includes("lockdown") ||
          _event.filename.includes("viewer.js"))
      ) {
        log.warn(
          "[ScriptReplacer] Blocked error from: ",
          { filename: _event.filename },
        );
        _event.preventDefault();
        return true;
      }
      return false;
    },
    true,
  );

  const win = window as WindowWithCustomGlobals;

  // Setup global properties for lockdown
  win.lockdown ??= function (): boolean {
    log.info("[ScriptReplacer] Safely intercepted lockdown() call");
    return true;
  };

  win.harden ??= function <T>(obj: T): T {
    return obj;
  };

  // Ensure Chrome APIs exist
  win.chrome ??= {};

  // Ensure popup object exists
  win.popup ??= {
    create(_options?: Record<string, unknown>, _unknown?: unknown): PopupInstance {
      const instance: PopupInstance = {
        show(): PopupInstance {
          return instance;
        },
        hide(): PopupInstance {
          return instance;
        },
        update(): PopupInstance {
          return instance;
        },
        on(_event: string, _callback?: (...args: unknown[]) => unknown): { off: () => void } {
          return { off(): void {} };
        },
        trigger(_event: string): PopupInstance {
          return instance;
        },
      };
      return instance;
    },
    show(): PopupGlobal {
      return this;
    },
    hide(): PopupGlobal {
      return this;
    },
    update(): PopupGlobal {
      return this;
    },
    on(_event: string, _callback?: (...args: unknown[]) => unknown): {
      off: () => void;
      trigger: (_event: string) => PopupGlobal;
    } {
      return {
        off(): void {},
        trigger: (_event: string): PopupGlobal => this,
      };
    },
    trigger(_event: string): PopupGlobal {
      return this;
    },
  };

  // Safe chrome.tabs implementation
  win.chrome.tabs ??= {
    create(): Promise<{ id: number }> {
      log.info("[ScriptReplacer] Intercepted chrome.tabs.create call");
      return Promise.resolve({ id: 999 });
    },
    _query(_queryInfo: unknown, callback?: (res: unknown) => void): boolean {
      const result = [{ id: 1, _active: true }];
      if (callback) callback(result);
      return true;
    },
    update(_tabId: number, _properties: unknown, callback?: (res: unknown) => void): boolean {
      if (callback) callback({});
      return true;
    },
  };

  log.info("[ScriptReplacer] Successfully initialized environment protection");
}

export default {};
