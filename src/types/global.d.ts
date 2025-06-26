/**
 * Global type declarations for Chrome API mocking and popup fixes
 */

declare global {
  interface Window {
    // Chrome extension API mock
    chrome?: {
      tabs?: {
        create?: (options: Record<string, unknown>) => Promise<{id: number}>;
        query?: (queryInfo: Record<string, unknown>, callback?: Function) => boolean;
        update?: (tabId: number, properties: Record<string, unknown>, callback?: Function) => boolean;
        sendMessage?: (tabId: number, message: Record<string, unknown>, options?: Record<string, unknown>, callback?: Function) => boolean;
      };
      runtime?: {
        lastError?: Record<string, unknown>;
        getURL?: (path: string) => string;
        sendMessage?: (message: Record<string, unknown>) => void;
        onMessage?: {
          addListener: (callback: (message: Record<string, unknown>) => void) => void;
          removeListener: (callback: (message: Record<string, unknown>) => void) => void;
        };
      };
      storage?: {
        local?: {
          get?: (keys: Record<string, unknown>, callback?: Function) => boolean;
          set?: (items: Record<string, unknown>, callback?: Function) => boolean;
        };
        sync?: {
          get?: (keys: Record<string, unknown>, callback?: Function) => boolean;
          set?: (items: Record<string, unknown>, callback?: Function) => boolean;
        };
      };
      i18n?: {
        getMessage?: (messageName: string, substitutions?: Record<string, unknown>) => string;
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
        on: (event: string, callback?: Record<string, unknown>) => { off: () => void };
        trigger: (event: string) => any;
      };
      show: () => any;
      hide: () => any;
      update: () => any;
      on: (event: string, callback?: Record<string, unknown>) => { off: () => void };
      trigger: (event: string) => any;
    };
    
    // Tracking flags for our script replacer
    __scriptReplacerInitialized?: boolean;
    __reloadedDummyPopup?: boolean;
    __foodRecommenderFixApplied?: boolean;
    
    // Storage for Chrome message listeners
    _chromeMessageListeners?: Function[];
    
    // Alchemical functions used by FoodRecommender
    getElementRanking?: (element_object: Record<string, unknown>, rank?: number) => { [key: number]: string };
    createElementObject?: () => { Fire: number; Water: number; Air: number; Earth: number };
    combineElementObjects?: (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => { Fire: number; Water: number; Air: number; Earth: number };
    getAbsoluteElementValue?: (obj: Record<string, unknown>) => number;
    calculateElementalScore?: (obj: Record<string, unknown>) => number;
    getDominantElement?: (obj: Record<string, unknown>) => string;
    alchemize?: (birth_info: Record<string, unknown>, horoscope_dict: Record<string, unknown>) => any;
    capitalize?: (str: string) => string;
    
    // Service objects
    ingredientFilterService?: Record<string, unknown>;
    ElementalCalculator?: Record<string, unknown>;
    
    // Utility functions
    fixAssignmentErrors?: <T>(obj: T) => T;
    safelyAccess?: <T = any>(obj: Record<string, unknown>, path: string, defaultValue?: T) => T;
    
    // Initialization flags
    __popupInitialized?: boolean;
    __chromeInitialized?: boolean;
  }
}

export {}; 