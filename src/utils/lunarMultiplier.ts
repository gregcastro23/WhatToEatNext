import @/types  from 'alchemy ';

/**
 * Returns a multiplier based on lunar phase strength
 * @param phase The current lunar phase
 * @returns A multiplier value between 1.0 and 1.5
 */
export let getLunarMultiplier = (phase: LunarPhase | null | undefined): number => {
  if (!phase) return 1.0;
  
  // Use the proper format of lunar phases (with spaces instead of underscores)
  switch(phase) {
    case 'full moon':
      return 1.5; // Strongest influence
    case 'waxing gibbous':
    case 'waning gibbous':
      return 1.3; // Strong influence
    case 'first quarter':
    case 'last quarter':
      return 1.2; // Moderate influence
    case 'waxing crescent':
    case 'waning crescent':
      return 1.1; // Slight influence
    case 'new moon':
    default:
      return 1.0; // Baseline influence
  }
}; 