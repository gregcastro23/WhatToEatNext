/**
 * Global type declarations for Chrome API mocking and popup fixes
 */

declare global {
  interface Window {
    // Chrome extension API mock
    chrome?: {
      tabs?: {
        create?: (options: Partial<unknown>) => Promise<{ id: number }>;
        query?: (queryInfo: unknown, callback?: (tabs: chrome.tabs.Tab[]) => void) => void;
        update?: (
          tabId: number,
          properties: chrome.tabs.UpdateProperties,
          callback?: () => void,
        ) => void;
        sendMessage?: (
          tabId: number,
          message: unknown,
          options?: chrome.tabs.SendMessageOptions,
          callback?: (response: unknown) => void,
        ) => void;
      };
      runtime?: {
        lastError?: chrome.runtime.LastError | null;
        getURL?: (path: string) => string;
        sendMessage?: (message: unknown, responseCallback?: (response: unknown) => void) => void;
        onMessage?: {
          addListener: (
            callback: (
              message: unknown,
              sender: chrome.runtime.MessageSender,
              sendResponse: (response?: unknown) => void,
            ) => boolean | void | Promise<unknown>,
          ) => void;
          removeListener: (
            callback: (
              message: unknown,
              sender: chrome.runtime.MessageSender,
              sendResponse: (response?: unknown) => void,
            ) => boolean | void | Promise<unknown>,
          ) => void;
        };
      };
      storage?: {
        local?: {
          get?: (
            keys: string | string[] | Record<string, unknown> | null,
            callback: (items: Record<string, unknown>) => void,
          ) => void;
          set?: (items: Record<string, unknown>, callback?: () => void) => void;
        };
        sync?: {
          get?: (
            keys: string | string[] | Record<string, unknown> | null,
            callback: (items: Record<string, unknown>) => void,
          ) => void;
          set?: (items: Record<string, unknown>, callback?: () => void) => void;
        };
      };
      i18n?: {
        getMessage?: (messageName: string, substitutions?: string | string[]) => string;
      };
      extension?: {
        getURL?: (path: string) => string
      };
    };

    // Popup.js mock replacement
    popup?: {
      create: (options?: Record<string, unknown>) => {
        show: () => void,
        hide: () => void,
        update: () => void,
        on: (event: string, callback: (...args: unknown[]) => void) => { off: () => void };
        trigger: (event: string) => void
      };
      show: () => void,
      hide: () => void,
      update: () => void,
      on: (event: string, callback: (...args: unknown[]) => void) => { off: () => void };
      trigger: (event: string) => void
    };

    // Tracking flags for our script replacer
    __scriptReplacerInitialized?: boolean;
    __reloadedDummyPopup?: boolean;
    __foodRecommenderFixApplied?: boolean;

    // Storage for Chrome message listeners
    _chromeMessageListeners?: ((
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => void)[];

    // Alchemical functions used by FoodRecommender
    getElementRanking?: (element_object: Element, rank?: number) => Record<number, string>;
    createElementObject?: () => ElementalProperties;
    combineElementObjects?: (
      obj1: ElementalProperties,
      obj2: ElementalProperties,
    ) => ElementalProperties;
    getAbsoluteElementValue?: (obj: ElementalProperties) => number;
    calculateElementalScore?: (obj: ElementalProperties) => number;
    getDominantElement?: (obj: ElementalProperties) => Element;
    alchemize?: (
      birth_info: Record<string, unknown>,
      horoscope_dict: Record<string, unknown>,
    ) => ThermodynamicMetrics;
    capitalize?: (str: string) => string;

    // Service objects
    ingredientFilterService?: Record<string, unknown>;
    ElementalCalculator?: Record<string, unknown>;

    // Utility functions
    fixAssignmentErrors?: <T>(obj: T) => T;
    safelyAccess?: <T = unknown>(obj: unknown, path: string, defaultValue?: T) => T;

    // Initialization flags
    __popupInitialized?: boolean;
    __chromeInitialized?: boolean;
  }
}

export {};
