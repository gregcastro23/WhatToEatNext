import { _cache } from './cache';
import { logger } from './logger';
import { themeManager } from './theme';
import { celestialCalculator } from '@/services/celestialCalculations';
import type { Recipe } from '@/types/recipe';
import type { ElementalProperties } from '@/types/alchemy';

// Add the missing type definitions
interface ScoredRecipe extends Recipe {
  score: number;
  matches: {
    elemental: number;
    seasonal: number;
    astrological: number;
  };
}

type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'low-carb'
  | 'keto'
  | 'paleo';

export type CuisineType = 
  | 'italian'
  | 'chinese'
  | 'mexican'
  | 'indian'
  | 'japanese'
  | 'thai'
  | 'french'
  | 'mediterranean'
  | 'american'
  | 'middle-eastern';

interface UserPreferences {
  theme: {
    mode: 'light' | 'dark' | 'system';
    colorScheme: string;
    fontSize: number;
    animations: boolean;
  };
  dietary: {
    restrictions: DietaryRestriction[];
    favorites: string[];
    excluded: string[];
    spiciness: 'mild' | 'medium' | 'hot';
  };
  cooking: {
    preferredMethods: string[];
    maxPrepTime: number;
    servingSize: number;
    complexity: 'simple' | 'moderate' | 'complex';
  };
  cuisines: {
    preferred: CuisineType[];
    excluded: CuisineType[];
  };
}

interface AppState {
  recipes: {
    all: Recipe[];
    filtered: ScoredRecipe[];
    favorites: string[];
    recent: string[];
    loading: boolean;
    error: string | null;
  };
  celestial: {
    elementalState: ElementalProperties;
    season: string;
    moonPhase: string;
    lastUpdated: number;
  };
  user: {
    preferences: UserPreferences;
    history: {
      viewed: string[];
      cooked: string[];
      rated: Record<string, number>;
    };
  };
  ui: {
    activeFilters: Set<string>;
    searchQuery: string;
    selectedRecipe: string | null;
    modalOpen: boolean;
    sidebarOpen: boolean;
    notifications: Array<{
      id: string;
      type: 'success' | 'error' | 'info';
      message: string;
      timestamp: number;
    }>;
  };
}

class StateManager {
  private static instance: StateManager;
  private state: AppState;
  private listeners: Map<string, Set<(state: AppState) => void>>;
  private readonly STORAGE_KEY = 'app_state';
  private readonly UPDATE_INTERVAL = 1000 * 60 * 5; // 5 minutes

  private constructor() {
    this.listeners = new Map();
    this.state = this.loadInitialState();
    this.initializeState();
  }

  public static async getInstance(): Promise<StateManager> {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
      await StateManager.instance.initializeState();
    }
    return StateManager.instance;
  }

  private loadInitialState(): AppState {
    try {
      // Fix: Remove type parameter since cache.get doesn't accept it
      const cached = cache.get(this.STORAGE_KEY);
      // Add type guard to ensure cached data has the right shape
      if (cached && this.isValidAppState(cached)) return cached as AppState;

      const stored = typeof window !== 'undefined' 
        ? localStorage.getItem(this.STORAGE_KEY)
        : null;

      return stored ? JSON.parse(stored) : this.getDefaultState();
    } catch (error) {
      logger.error('Error loading state:', error);
      return this.getDefaultState();
    }
  }

  // Add helper to validate the state structure
  private isValidAppState(obj: unknown): obj is AppState {
    // Fix TS2339: Property does not exist on type 'object'
    const data = obj as unknown as Record<string, unknown>;
    return obj 
      && typeof obj === 'object'
      && data?.recipes 
      && data?.celestial 
      && data?.user 
      && data?.ui;
  }

  private getDefaultState(): AppState {
    return {
      recipes: {
        all: [],
        filtered: [],
        favorites: [],
        recent: [],
        loading: false,
        error: null
      },
      celestial: {
        elementalState: {
          Fire: 0.25,
          Earth: 0.25,
          Air: 0.25,
          Water: 0.25
        },
        season: 'spring',
        moonPhase: 'new',
        lastUpdated: Date.now()
      },
      user: {
        preferences: {
          theme: {
            mode: 'system',
            colorScheme: 'default',
            fontSize: 16,
            animations: true
          },
          dietary: {
            restrictions: [],
            favorites: [],
            excluded: [],
            spiciness: 'medium'
          },
          cooking: {
            preferredMethods: [],
            maxPrepTime: 60,
            servingSize: 2,
            complexity: 'moderate'
          },
          cuisines: {
            preferred: [],
            excluded: []
          }
        },
        history: {
          viewed: [],
          cooked: [],
          rated: {}
        }
      },
      ui: {
        activeFilters: new Set(),
        searchQuery: '',
        selectedRecipe: null,
        modalOpen: false,
        sidebarOpen: false,
        notifications: []
      }
    };
  }

  private async initializeState() {
    try {
      // Fix: Extract theme mode as string instead of passing the whole object
      if (this.state?.user?.preferences?.theme) {
        themeManager.updateTheme(this.state.user.preferences.theme.mode);
      } else {
        themeManager.updateTheme('light');
      }

      this.startUpdateCycle();
      
      await this.updateCelestialData();

      this.saveState();
    } catch (error) {
      // console.error('Error initializing state:', error);
    }
  }

  private startUpdateCycle(): void {
    setInterval(() => {
      this.updateCelestialData();
    }, this.UPDATE_INTERVAL);
  }

  private async updateCelestialData(): Promise<void> {
    try {
      const influences = celestialCalculator.calculateCurrentInfluences();
      // Convert influences to proper ElementalProperties
      const elementalState: ElementalProperties = {
        Fire: influences.elementalBalance?.Fire || 0,
        Water: influences.elementalBalance?.Water || 0, 
        Earth: influences.elementalBalance?.Earth || 0,
        Air: influences.elementalBalance?.Air || 0
      };
      
      this.setState({
        celestial: {
          ...this.state.celestial,
          elementalState,
          lastUpdated: Date.now()
        }
      });
    } catch (error) {
      logger.error('Error updating celestial data:', error);
    }
  }

  private saveState(): void {
    try {
      const serializable = {
        ...this.state,
        ui: {
          ...this.state.ui,
          activeFilters: Array.from(this.state.ui.activeFilters)
        }
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializable));
      cache.set(this.STORAGE_KEY, this.state);
    } catch (error) {
      logger.error('Error saving state:', error);
    }
  }

  // Public API
  getState(): AppState {
    return { ...this.state };
  }

  setState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
    this.saveState();
  }

  subscribe(key: string, listener: (state: AppState) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    const listenerSet = this.listeners.get(key);
    if (listenerSet) {
      listenerSet.add(listener);
    }

    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listeners => {
      listeners.forEach(listener => listener(this.state));
    });
  }

  // Enhanced functionality
  addToHistory(type: 'viewed' | 'cooked', recipeId: string): void {
    const history = [...this.state.user.history[type]];
    const index = history.indexOf(recipeId);
    
    if (index > -1) {
      history.splice(index, 1);
    }
    history.unshift(recipeId);
    
    if (history.length > 50) history.pop();

    this.setState({
      user: {
        ...this.state.user,
        history: {
          ...this.state.user.history,
          [type]: history
        }
      }
    });
  }

  rateRecipe(recipeId: string, rating: number): void {
    this.setState({
      user: {
        ...this.state.user,
        history: {
          ...this.state.user.history,
          rated: {
            ...this.state.user.history.rated,
            [recipeId]: rating
          }
        }
      }
    });
  }

  toggleFavorite(recipeId: string): void {
    const favorites = [...this.state.recipes.favorites];
    const index = favorites.indexOf(recipeId);

    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(recipeId);
    }

    this.setState({
      recipes: {
        ...this.state.recipes,
        favorites
      }
    });
  }

  addNotification(type: 'success' | 'error' | 'info', message: string): void {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };

    const notifications = [
      notification,
      ...this.state.ui.notifications
    ].slice(0, 5);

    this.setState({
      ui: {
        ...this.state.ui,
        notifications
      }
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      this.setState({
        ui: {
          ...this.state.ui,
          notifications: this.state.ui.notifications.filter(
            n => n.id !== notification.id
          )
        }
      });
    }, 5000);
  }
}

export const stateManager = StateManager.getInstance(); 