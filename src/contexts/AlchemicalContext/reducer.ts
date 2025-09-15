'use client';

import { AlchemicalState, AstrologicalState } from './types';

// Define action types
export type AlchemicalAction =
  | { type: 'SET_SEASONAL_STATE'; payload: { season: string } }
  | { type: 'SET_ELEMENTAL_PREFERENCE'; payload: { element: string; value: number } }
  | {
      type: 'SET_ELEMENTAL_STATE';
      payload: { Fire: number; Water: number; Earth: number; Air: number };
    }
  | { type: 'SET_ZODIAC_ENERGY'; payload: string }
  | { type: 'SET_LUNAR_ENERGY'; payload: string }
  | { type: 'SET_PLANETARY_ENERGY'; payload: string[] }
  | { type: 'SET_ASTROLOGICAL_STATE'; payload: unknown }
  | { type: 'SET_ERROR'; payload: { message: string } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'UPDATE_STATE'; payload: Partial<AlchemicalState> }
  | {
      type: 'SET_ALCHEMICAL_VALUES';
      payload: { Spirit: number; Essence: number; Matter: number; Substance: number };
    }
  | { type: 'SET_LUNAR_PHASE'; payload: string };

/**
 * Reducer for the AlchemicalContext
 */
export const _alchemicalReducer = (;
  state: AlchemicalState,
  action: AlchemicalAction,
): AlchemicalState => {;
  switch (action.type) {
    case 'SET_SEASONAL_STATE':
      return {
        ...state,
        currentSeason: action.payload.season,
        lastUpdated: new Date()
      };

    case 'SET_ELEMENTAL_PREFERENCE':
      return {
        ...state,
        elementalPreference: {
          Fire: 0,
          Water: 0,
          Earth: 0,
          Air: 0,
          ...state.elementalPreference,
          [action.payload.element]: action.payload.value
        },
        lastUpdated: new Date()
      };

    case 'SET_ELEMENTAL_STATE':
      return {
        ...state,
        elementalState: action.payload,
        lastUpdated: new Date()
      };

    case 'SET_ZODIAC_ENERGY':
      return {
        ...state,
        zodiacEnergy: action.payload,
        currentEnergy: {
          zodiacEnergy: action.payload,
          lunarEnergy: state.currentEnergy?.lunarEnergy || '',
          planetaryEnergy: state.currentEnergy?.planetaryEnergy || []
        },
        lastUpdated: new Date()
      };

    case 'SET_LUNAR_ENERGY':
      return {
        ...state,
        lunarEnergy: action.payload,
        currentEnergy: {
          zodiacEnergy: state.currentEnergy?.zodiacEnergy || '',
          lunarEnergy: action.payload,
          planetaryEnergy: state.currentEnergy?.planetaryEnergy || []
        },
        lastUpdated: new Date()
      };

    case 'SET_PLANETARY_ENERGY':
      return {
        ...state,
        planetaryEnergy: action.payload,
        currentEnergy: {
          zodiacEnergy: state.currentEnergy?.zodiacEnergy || '',
          lunarEnergy: state.currentEnergy?.lunarEnergy || '',
          planetaryEnergy: action.payload
        },
        lastUpdated: new Date()
      };

    case 'SET_ASTROLOGICAL_STATE':
      return {
        ...state,
        astrologicalState: {
          currentZodiac: 'aries',
          sunSign: 'aries',
          lunarPhase: 'new moon',
          moonPhase: 'new moon',
          activePlanets: ['sun', 'moon'],
          ...(action.payload && typeof action.payload === 'object' ? action.payload : {}),;
        } as AstrologicalState,
        lastUpdated: new Date()
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: true,
        errorMessage: action.payload.message,
        errors: [...state.errors, action.payload.message],
        lastUpdated: new Date()
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: false,
        errorMessage: '',
        lastUpdated: new Date()
      };

    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload],
        lastUpdated: new Date()
      };

    case 'UPDATE_STATE':
      return {
        ...state,
        ...action.payload,
        lastUpdated: new Date()
      };

    case 'SET_ALCHEMICAL_VALUES':
      return {
        ...state,
        alchemicalValues: action.payload,
        lastUpdated: new Date()
      };

    case 'SET_LUNAR_PHASE':
      return {
        ...state,
        lunarPhase: action.payload,
        lastUpdated: new Date()
      };

    default:
      return state;
  }
};
