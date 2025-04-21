'use client';

import { AlchemicalState, AstrologicalState } from '../../types/alchemical';
import { AlchemicalAction, AlchemicalDispatchType } from '../../types/alchemical';

/**
 * Reducer for the AlchemicalContext
 */
export const alchemicalReducer = (state: AlchemicalState, action: AlchemicalAction): AlchemicalState => {
  switch (action.type) {
    case AlchemicalDispatchType.SET_SEASONAL_STATE:
      return {
        ...state,
        currentSeason: action.payload.season,
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_ELEMENTAL_PREFERENCE:
      return {
        ...state,
        elementalPreference: {
          ...state.elementalPreference,
          [action.payload.element]: action.payload.value
        },
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_ELEMENTAL_STATE:
      const elementalState = {
        Fire: state.elementalState.Fire,
        Water: state.elementalState.Water,
        Earth: state.elementalState.Earth,
        Air: state.elementalState.Air,
        ...action.payload,
      };
      
      return {
        ...state,
        elementalState,
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_ZODIAC_ENERGY:
      return {
        ...state,
        zodiacEnergy: action.payload,
        currentEnergy: {
          ...state.currentEnergy,
          zodiacEnergy: action.payload
        },
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_LUNAR_ENERGY:
      return {
        ...state,
        lunarEnergy: action.payload,
        currentEnergy: {
          ...state.currentEnergy,
          lunarEnergy: action.payload
        },
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_PLANETARY_ENERGY:
      const planetaryEnergy = Array.isArray(action.payload) 
        ? action.payload 
        : [action.payload];
      
      return {
        ...state,
        planetaryEnergy,
        currentEnergy: {
          ...state.currentEnergy,
          planetaryEnergy
        },
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_ASTROLOGICAL_STATE:
      return {
        ...state,
        astrologicalState: {
          currentZodiac: 'aries',
          sunSign: 'aries',
          lunarPhase: 'new moon',
          moonPhase: 'new moon',
          activePlanets: [],
          ...action.payload
        },
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_ERROR:
      return {
        ...state,
        error: true,
        errorMessage: action.payload.message,
        errors: [...state.errors, action.payload.message],
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.CLEAR_ERROR:
      return {
        ...state,
        error: false,
        errorMessage: '',
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.ADD_ERROR:
      return {
        ...state,
        errors: [...state.errors, action.payload],
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.UPDATE_STATE:
      return {
        ...state,
        ...action.payload,
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_ALCHEMICAL_VALUES:
      const alchemicalValues = {
        Spirit: state.alchemicalValues.Spirit,
        Essence: state.alchemicalValues.Essence,
        Matter: state.alchemicalValues.Matter,
        Substance: state.alchemicalValues.Substance,
        ...action.payload,
      };
      
      return {
        ...state,
        alchemicalValues,
        lastUpdated: new Date()
      };
      
    case AlchemicalDispatchType.SET_LUNAR_PHASE:
      return {
        ...state,
        lunarPhase: action.payload,
        lastUpdated: new Date()
      };
      
    default:
      return state;
  }
}; 