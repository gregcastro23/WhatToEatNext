import { baking } from './baking';
import { roasting } from './roasting';
import { frying } from './frying';
import { stirFrying } from './stir-frying';
import { grilling } from './grilling';
import { broiling } from './broiling';
// Import other dry cooking methods as they are added
// import { broiling } from './broiling';

/**
 * Collection of dry cooking methods
 * 
 * Dry cooking methods use hot air, radiation, or hot oil (not water-based liquids)
 * to transfer heat to food
 */
export const dryCookingMethods = {
  baking,
  roasting,
  frying,
  stir_frying: stirFrying,
  grilling,
  broiling,
  // Add other cooking methods as they are implemented
  // broiling,
};

// Export individual methods
export {
  baking,
  roasting,
  frying,
  stirFrying,
  grilling,
  broiling,
  // broiling,
}; 