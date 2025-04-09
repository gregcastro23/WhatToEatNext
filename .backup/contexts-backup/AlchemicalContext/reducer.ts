import { AlchemicalState } from './context';

// Define the action type
type AlchemicalAction = 
  | { type: 'SET_ELEMENTAL_PREFERENCE'; payload: any }
  | { type: 'UPDATE_ELEMENTAL_BALANCE'; payload: { elementalPreference: any } }
  | { type: 'UPDATE_ELEMENTAL_STATE'; payload: { elementalState: any } }
  | { type: 'UPDATE_TIME'; payload: { season: string; timeOfDay: string; elementalState: any } }
  | { type: 'INITIALIZE_STATE'; payload: { astrologicalState: any; currentEnergy: any } }
  | { type: 'UPDATE_LUNAR_PHASE'; payload: { lunarPhase: string } }
  | { type: 'UPDATE_ALCHEMICAL_VALUES'; payload: { alchemicalValues: any } }
  | { type: 'INITIALIZE_ERROR_STATE'; payload: { error: boolean; errorMessage: string } }
  | { type: 'ADD_ERROR'; payload: { error: any } }
  | { type: 'UPDATE_ACTIVE_PLANETS'; payload: { activePlanets: string[] } }
  | { type: 'UPDATE_ZODIAC'; payload: { zodiacSign: string } }
  | { type: 'SET_ERROR'; payload: { error: boolean; errorMessage: string } }
  | { type: 'UPDATE_ASPECTS'; payload: { aspects: any[] } }
  | { type: 'UPDATE_DIGNITIES'; payload: { planetaryDignities: Record<string, any> } }
  | { type: 'UPDATE_THERMODYNAMIC_PROPERTIES'; payload: { heat: number; entropy: number; reactivity: number } };

export function alchemicalReducer(state: AlchemicalState, action: AlchemicalAction) {
  switch (action.type) {
    case 'SET_ELEMENTAL_PREFERENCE':
      return {
        ...state,
        elementalPreference: action.payload
      };
    case 'UPDATE_ELEMENTAL_BALANCE':
      return {
        ...state,
        elementalPreference: action.payload.elementalPreference
      };
    case 'UPDATE_ELEMENTAL_STATE':
      return {
        ...state,
        elementalState: action.payload.elementalState,
        // For backward compatibility, also update elementalPreference
        elementalPreference: action.payload.elementalState
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        currentSeason: action.payload.season,
        timeOfDay: action.payload.timeOfDay,
        elementalState: action.payload.elementalState
      };
    case 'INITIALIZE_STATE':
      return {
        ...state,
        astrologicalState: action.payload.astrologicalState,
        currentEnergy: action.payload.currentEnergy
      };
    case 'UPDATE_LUNAR_PHASE':
      return {
        ...state,
        lunarPhase: action.payload.lunarPhase
      };
    case 'UPDATE_ALCHEMICAL_VALUES':
      const newAlchemicalValues = {
        Spirit: action.payload.alchemicalValues?.Spirit || 0.25,
        Essence: action.payload.alchemicalValues?.Essence || 0.25,
        Matter: action.payload.alchemicalValues?.Matter || 0.25,
        Substance: action.payload.alchemicalValues?.Substance || 0.25
      };
      
      return {
        ...state,
        alchemicalValues: newAlchemicalValues,
        astrologicalState: state.astrologicalState ? {
          ...state.astrologicalState,
          alchemicalValues: newAlchemicalValues
        } : null
      };
    case 'INITIALIZE_ERROR_STATE':
      return {
        ...state,
        error: action.payload.error,
        errorMessage: action.payload.errorMessage
      };
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, action.payload.error]
      };
    case 'UPDATE_ACTIVE_PLANETS':
      console.log('Updating active planets:', action.payload.activePlanets);
      return {
        ...state,
        activePlanets: action.payload.activePlanets,
        astrologicalState: state.astrologicalState ? {
          ...state.astrologicalState,
          activePlanets: action.payload.activePlanets
        } : null
      };
    case 'UPDATE_ZODIAC':
      console.log('Updating zodiac sign:', action.payload.zodiacSign);
      return {
        ...state,
        currentZodiac: action.payload.zodiacSign.toLowerCase(),
        zodiacSign: action.payload.zodiacSign.toLowerCase(),
        astrologicalState: state.astrologicalState ? {
          ...state.astrologicalState,
          currentZodiac: action.payload.zodiacSign.toLowerCase(),
          zodiacSign: action.payload.zodiacSign.toLowerCase()
        } : null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        errorMessage: action.payload.errorMessage
      };
    case 'UPDATE_ASPECTS':
      return {
        ...state,
        astrologicalState: state.astrologicalState ? {
          ...state.astrologicalState,
          aspects: action.payload.aspects
        } : null
      };
    case 'UPDATE_DIGNITIES':
      return {
        ...state,
        astrologicalState: state.astrologicalState ? {
          ...state.astrologicalState,
          planetaryDignities: action.payload.planetaryDignities
        } : null
      };
    case 'UPDATE_THERMODYNAMIC_PROPERTIES':
      return {
        ...state,
        thermodynamicProperties: {
          heat: action.payload.heat,
          entropy: action.payload.entropy,
          reactivity: action.payload.reactivity
        }
      };
    default:
      return state;
  }
} 