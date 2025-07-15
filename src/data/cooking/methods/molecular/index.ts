import { spherification } from './spherification';
import { gelification } from './gelification';
// Import other molecular cooking methods as they are added
import { emulsification } from './emulsification';
import { cryoCooking } from './cryo-cooking';

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