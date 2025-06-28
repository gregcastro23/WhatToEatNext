/**
 * Global type declarations for Chrome API mocking and popup fixes
 */

declare global {
  interface Window {
    // Chrome extension API mock
    chrome?: {
      tabs?: {
        create?: (options: any) => Promise<{id: number}>;
        query?: (queryInfo: any, callback?: Function) => boolean;
        update?: (tabId: number, properties: any, callback?: Function) => boolean;
        sendMessage?: (tabId: number, message: any, options?: any, callback?: Function) => boolean;
      };
      runtime?: {
        lastError?: any;
        getURL?: (path: string) => string;
        sendMessage?: (message: any) => void;
        onMessage?: {
          addListener: (callback: (message: any) => void) => void;
          removeListener: (callback: (message: any) => void) => void;
        };
      };
      storage?: {
        local?: {
          get?: (keys: any, callback?: Function) => boolean;
          set?: (items: any, callback?: Function) => boolean;
        };
        sync?: {
          get?: (keys: any, callback?: Function) => boolean;
          set?: (items: any, callback?: Function) => boolean;
        };
      };
      i18n?: {
        getMessage?: (messageName: string, substitutions?: any) => string;
      };
      extension?: {
        getURL?: (path: string) => string;
      };
    };
    
    // Popup.js mock replacement
    popup?: {
      create: (options?: any) => {
        show: () => any;
        hide: () => any;
        update: () => any;
        on: (event: string, callback?: any) => { off: () => void };
        trigger: (event: string) => any;
      };
      show: () => any;
      hide: () => any;
      update: () => any;
      on: (event: string, callback?: any) => { off: () => void };
      trigger: (event: string) => any;
    };
    
    // Tracking flags for our script replacer
    __scriptReplacerInitialized?: boolean;
    __reloadedDummyPopup?: boolean;
    __foodRecommenderFixApplied?: boolean;
    
    // Storage for Chrome message listeners
    _chromeMessageListeners?: Function[];
    
    // Alchemical functions used by FoodRecommender
    getElementRanking?: (element_object: any, rank?: number) => { [key: number]: string };
    createElementObject?: () => { Fire: number; Water: number; Air: number; Earth: number };
    combineElementObjects?: (obj1: any, obj2: any) => { Fire: number; Water: number; Air: number; Earth: number };
    getAbsoluteElementValue?: (obj: any) => number;
    calculateElementalScore?: (obj: any) => number;
    getDominantElement?: (obj: any) => string;
    alchemize?: (birth_info: any, horoscope_dict: any) => any;
    capitalize?: (str: string) => string;
    
    // Service objects
    ingredientFilterService?: any;
    ElementalCalculator?: any;
    
    // Utility functions
    fixAssignmentErrors?: <T>(obj: T) => T;
    safelyAccess?: <T = any>(obj: any, path: string, defaultValue?: T) => T;
    
    // Initialization flags
    __popupInitialized?: boolean;
    __chromeInitialized?: boolean;
  }
}

export {}; 