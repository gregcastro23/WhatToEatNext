import { broiling } from './broiling';
import { frying } from './frying';
import { grilling } from './grilling';
import { roasting } from './roasting';
import { stirFrying } from './stir-frying';
// Import other dry cooking methods as they are added
// Removed duplicate: // Removed duplicate: // import { broiling } from './broiling';

/**
 * Collection of dry cooking methods
 *
 * Dry cooking methods use hot air, radiation, or hot oil (not water-based liquids)
 * to transfer heat to food
 */
export const _dryCookingMethods = {
  roasting,
  frying,
  stir_frying: stirFrying,
  grilling,
  broiling,
  // Add other cooking methods as they are implemented
};

// Export without underscore for compatibility
export const dryCookingMethods = _dryCookingMethods;

// Export individual methods
export {
    broiling, frying, grilling, roasting, stirFrying
};
