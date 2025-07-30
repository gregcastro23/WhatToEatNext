/**
 * Global type declarations for Chrome API mocking and popup fixes
 */

declare global {
  interface Window {
    // Chrome extension API mock
    chrome?: {
      tabs?: {
        create?: (options: Partial<T>) => Promise<{id: number}>;
        query?: (queryInfo: unknown, callback?: Function) => boolean;
        update?: (tabId: number, properties: unknown, callback?: Function) => boolean;
        sendMessage?: (tabId: number, message: unknown, options?: Record<string, unknown>, callback?: Function) => boolean;
      };
      runtime?: {
        lastError?: Error | null;
        getURL?: (path: string) => string;
        sendMessage?: (message: unknown) => void;
        onMessage?: {
          addListener: (callback: (message: unknown) => void) => void;
          removeListener: (callback: (message: unknown) => void) => void;
        };
      };
      storage?: {
        local?: {
          get?: (keys: unknown, callback?: Function) => boolean;
          set?: (items: unknown, callback?: Function) => boolean;
        };
        sync?: {
          get?: (keys: unknown, callback?: Function) => boolean;
          set?: (items: unknown, callback?: Function) => boolean;
        };
      };
      i18n?: {
        getMessage?: (messageName: string, substitutions?: string[] | Record<string, string>) => string;
      };
      extension?: {
        getURL?: (path: string) => string;
      };
    };
    
    // Popup.js mock replacement
    popup?: {
      create: (options?: Record<string, unknown>) => {
        show: () => any;
        hide: () => any;
        update: () => any;
        on: (event: string, callback?: (...args: unknown[]) => void) => { off: () => void };
        trigger: (event: string) => any;
      };
      show: () => any;
      hide: () => any;
      update: () => any;
      on: (event: string, callback?: (...args: unknown[]) => void) => { off: () => void };
      trigger: (event: string) => any;
    };
    
    // Tracking flags for our script replacer
    __scriptReplacerInitialized?: boolean;
    __reloadedDummyPopup?: boolean;
    __foodRecommenderFixApplied?: boolean;
    
    // Storage for Chrome message listeners
    _chromeMessageListeners?: Function[];
    
    // Alchemical functions used by FoodRecommender
    getElementRanking?: (element_object: Element, rank?: number) => { [key: number]: string };
    createElementObject?: () => { Fire: number; Water: number; Air: number; Earth: number };
    combineElementObjects?: (obj1: unknown, obj2: unknown) => { Fire: number; Water: number; Air: number; Earth: number };
    getAbsoluteElementValue?: (obj: unknown) => number;
    calculateElementalScore?: (obj: unknown) => number;
    getDominantElement?: (obj: unknown) => string;
    alchemize?: (birth_info: unknown, horoscope_dict: unknown) => any;
    capitalize?: (str: string) => string;
    
    // Service objects
    ingredientFilterService?: Record<string, unknown>;
    ElementalCalculator?: Record<string, unknown>;
    
    // Utility functions
    fixAssignmentErrors?: <T>(obj: T) => T;
    safelyAccess?: <T = any>(obj: unknown, path: string, defaultValue?: T) => T;
    
    // Initialization flags
    __popupInitialized?: boolean;
    __chromeInitialized?: boolean;
  }
}

export {}; 