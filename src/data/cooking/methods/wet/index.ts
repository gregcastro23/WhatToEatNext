import { sousVide } from './sous-vide';
import { boiling } from './boiling';
import { steaming } from './steaming';
import { braising } from './braising';
// Import other wet cooking methods as they are added
import { poaching } from './poaching';
import { simmering } from './simmering';
import { pressureCooking } from './pressure-cooking';

/**
 * Collection of wet cooking methods
 * 
 * Wet cooking methods use water, steam, or other liquids as the primary
 * heat transfer medium for cooking food
 */
export const wetCookingMethods = {
  sous_vide: sousVide,
  boiling: boiling,
  steaming: steaming,
  braising: braising,
  // Add other cooking methods as they are implemented
  poaching,
  simmering,
  pressure_cooking: pressureCooking,
};

// Export individual methods
export {
  sousVide,
  boiling,
  steaming,
  braising,
  poaching,
  simmering,
}; 