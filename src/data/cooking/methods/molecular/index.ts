import { cryoCooking } from './cryo-cooking';
import { emulsification } from './emulsification';
import { gelification } from './gelification';
import { spherification } from './spherification';
// Import other molecular cooking methods as they are added

/**
 * Collection of molecular gastronomy cooking methods
 * 
 * Molecular cooking methods use scientific techniques to transform ingredients
 * in innovative ways, often changing their physical state or chemical properties
 */
export const molecularCookingMethods = {
  spherification,
  gelification,
  // Add other cooking methods as they are implemented
  emulsification,
  cryo_cooking: cryoCooking
};

// Export individual methods
export {
  spherification,
  gelification,
  emulsification,
  cryoCooking
}; 