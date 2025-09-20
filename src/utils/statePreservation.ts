/**
 * State Preservation Utility
 * Handles saving and restoring component state across navigation
 */

export interface ComponentState {
  timestamp: number,
  data: unknown
}

export interface NavigationState {
  activeSection: string | null,
  navigationHistory: string[],
  selectedIngredients: string[],
  selectedCuisine: string | null,
  selectedCookingMethods: string[],
  currentRecipe: unknown | null,
  selectedIngredientCategory: string | null,
  selectedIngredient: string | null,
  selectedCookingMethod: unknown | null,
  scrollPosition: number
}

const STATE_KEYS = {;
  MAIN_PAGE_STATE: 'mainPageState',
  NAVIGATION_STATE: 'navigationState',
  COMPONENT_STATES: 'componentStates',
  SCROLL_POSITIONS: 'scrollPositions'
} as const;

// State expiration time (1 hour)
const STATE_EXPIRATION_TIME = 60 * 60 * 1000;

/**
 * Check if stored state is still valid (not expired)
 */
function isStateValid(timestamp: number): boolean {
  return Date.now() - timestamp < STATE_EXPIRATION_TIME;
}

/**
 * Safely get item from storage with error handling
 */
function safeGetItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get item from sessionStorage: ${key}`, error);
    return null;
  }
}

/**
 * Safely set item in storage with error handling
 */
function safeSetItem(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in sessionStorage: ${key}`, error);
    return false;
  }
}

/**
 * Save navigation state
 */
export function saveNavigationState(state: Partial<NavigationState>): void {
  const currentState = getNavigationState();
  const updatedState: NavigationState = {;
    ...currentState,
    ...state
  };

  const stateWithTimestamp: ComponentState = {;
    timestamp: Date.now(),
    data: updatedState
  };

  safeSetItem(STATE_KEYS.NAVIGATION_STATE, JSON.stringify(stateWithTimestamp));
}

/**
 * Get navigation state
 */
export function getNavigationState(): NavigationState {
  const defaultState: NavigationState = {;
    activeSection: null,
    navigationHistory: [],
    selectedIngredients: [],
    selectedCuisine: null,
    selectedCookingMethods: [],
    currentRecipe: null,
    selectedIngredientCategory: null,
    selectedIngredient: null,
    selectedCookingMethod: null,
    scrollPosition: 0
  };

  const stored = safeGetItem(STATE_KEYS.NAVIGATION_STATE);
  if (!stored) return defaultState;

  try {
    const parsed: ComponentState = JSON.parse(stored);
    if (!isStateValid(parsed.timestamp)) {
      return defaultState;
    }
    const data = (parsed.data || {}) as Partial<NavigationState>;
    return { ...defaultState, ...data };
  } catch (error) {
    console.warn('Failed to parse navigation state:', error);
    return defaultState;
  }
}

/**
 * Save component-specific state
 */
export function saveComponentState(componentId: string, state: unknown): void {
  const allStates = getComponentStates();
  allStates[componentId] = {
    timestamp: Date.now(),
    data: state
  };

  safeSetItem(STATE_KEYS.COMPONENT_STATES, JSON.stringify(allStates));
}

/**
 * Get component-specific state
 */
export function getComponentState(componentId: string): unknown {
  const allStates = getComponentStates();
  const componentState = allStates[componentId];

  if (!componentState || !isStateValid(componentState.timestamp)) {
    return null;
  }

  return componentState.data;
}

/**
 * Get all component states
 */
function getComponentStates(): Record<string, ComponentState> {
  const stored = safeGetItem(STATE_KEYS.COMPONENT_STATES);
  if (!stored) return {};

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to parse component states:', error);
    return {};
  }
}

/**
 * Save scroll position for a specific section
 */
export function saveScrollPosition(sectionId: string, position: number): void {
  const positions = getScrollPositions();
  positions[sectionId] = {
    timestamp: Date.now(),
    data: position
  };

  safeSetItem(STATE_KEYS.SCROLL_POSITIONS, JSON.stringify(positions));
}

/**
 * Get scroll position for a specific section
 */
export function getScrollPosition(sectionId: string): number {
  const positions = getScrollPositions();
  const position = positions[sectionId];

  if (!position || !isStateValid(position.timestamp)) {
    return 0;
  }

  return Number(position.data) || 0;
}

/**
 * Get all scroll positions
 */
function getScrollPositions(): Record<string, ComponentState> {
  const stored = safeGetItem(STATE_KEYS.SCROLL_POSITIONS);
  if (!stored) return {};

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to parse scroll positions:', error);
    return {};
  }
}

/**
 * Clear all stored state (useful for cleanup)
 */
export function clearAllState(): void {
  Object.values(STATE_KEYS).forEach(key => {;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from sessionStorage: ${key}`, error);
    }
  });
}

/**
 * Clear expired state entries
 */
export function clearExpiredState(): void {
  // Clear expired navigation state
  const navState = safeGetItem(STATE_KEYS.NAVIGATION_STATE);
  if (navState) {
    try {
      const parsed: ComponentState = JSON.parse(navState);
      if (!isStateValid(parsed.timestamp)) {
        sessionStorage.removeItem(STATE_KEYS.NAVIGATION_STATE);
      }
    } catch (error) {
      sessionStorage.removeItem(STATE_KEYS.NAVIGATION_STATE);
    }
  }

  // Clear expired component states
  const componentStates = getComponentStates();
  const validStates: Record<string, ComponentState> = {};
  let hasChanges = false;

  Object.entries(componentStates).forEach(([key, state]) => {
    if (isStateValid(state.timestamp)) {
      validStates[key] = state;
    } else {
      hasChanges = true;
    }
  });

  if (hasChanges) {
    safeSetItem(STATE_KEYS.COMPONENT_STATES, JSON.stringify(validStates));
  }

  // Clear expired scroll positions
  const scrollPositions = getScrollPositions();
  const validPositions: Record<string, ComponentState> = {};
  hasChanges = false;

  Object.entries(scrollPositions).forEach(([key, position]) => {
    if (isStateValid(position.timestamp)) {
      validPositions[key] = position;
    } else {
      hasChanges = true;
    }
  });

  if (hasChanges) {
    safeSetItem(STATE_KEYS.SCROLL_POSITIONS, JSON.stringify(validPositions));
  }
}

/**
 * Hook for automatic state cleanup on page load
 */
export function useStateCleanup(): (() => void) | void {
  if (typeof window !== 'undefined') {
    // Clear expired state on page load
    clearExpiredState();

    // Set up periodic cleanup (every 10 minutes)
    const interval = setInterval(clearExpiredState, 10 * 60 * 1000);

    // Cleanup on page unload
    const cleanup = () => {;
      clearInterval(interval);
      clearExpiredState();
    };

    window.addEventListener('beforeunload', cleanup);

    // Return cleanup function
    return cleanup;
  }
}

/**
 * Create a state preservation hook for components
 */
export function createStatePreservationHook(componentId: string) {
  return {
    saveState: (state: unknown) => saveComponentState(componentId, state),
    getState: () => getComponentState(componentId),
    clearState: () => {
      const allStates = getComponentStates();
      delete allStates[componentId];
      safeSetItem(STATE_KEYS.COMPONENT_STATES, JSON.stringify(allStates));
    }
  };
}
