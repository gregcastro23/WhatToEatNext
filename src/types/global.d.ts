/**
 * Global type declarations for Chrome API mocking and popup fixes
 */

declare global {
  interface Window {
    // Chrome extension API mock - use any for maximum flexibility
    chrome?: any;
    
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

// ---------------------------------------------------------------------------
// Legacy global constant aliases (temporary shim for ongoing migration)
// Placed inside `declare global` to ensure they are visible in all modules.

declare global {
  const season: import('@/types/alchemy').Season;
  const _season: string;

  const isDaytime: boolean;
  const _isDaytime: boolean;

  const lunarPhase: string;
  const _currentPhase: string;

  const zodiacSign: string;

  // Generic filter / options placeholder (to be removed once fully typed)
  const _options: any;

  // Additional globals surfaced during alias sweep
  let currentDate: Date | string;

  // Dummy placeholder for UI state enum used in legacy components
  type ExpandedState = 'expanded' | 'collapsed' | string;
  const ExpandedState: Record<string, ExpandedState>;

  function calculateLunarPhase(date?: Date | string): string;
}

export {}; 