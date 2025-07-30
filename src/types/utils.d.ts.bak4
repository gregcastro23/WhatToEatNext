// Type declarations to help with compatibility issues
import { LunarPhase, LunarPhaseWithSpaces } from './alchemy';

// Declare that LunarPhaseWithSpaces can be used as LunarPhase
declare global {
  interface LunarPhaseWithSpacesAsLunarPhase extends LunarPhase {}
}

// Utility function that should be usable for converting between the types
declare function convertLunarPhaseType(phase: LunarPhaseWithSpaces | null | undefined): LunarPhase | undefined; 