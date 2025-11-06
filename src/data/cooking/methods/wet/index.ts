import { boiling } from "./boiling";
import { braising } from "./braising";
// Import other wet cooking methods as they are added
import { poaching } from "./poaching";
import { pressureCooking } from "./pressure-cooking";
import { simmering } from "./simmering";
import { sousVide } from "./sous-vide";
import { steaming } from "./steaming";

/**
 * Collection of wet cooking methods
 *
 * Wet cooking methods use water, steam, or other liquids as the primary
 * heat transfer medium for cooking food
 */
export const _wetCookingMethods = {
  sous_vide: sousVide,
  boiling,
  steaming,
  braising,
  // Add other cooking methods as they are implemented
  poaching,
  simmering,
  pressure_cooking: pressureCooking,
};

export const wetCookingMethods = _wetCookingMethods;

// Export individual methods
export { sousVide, boiling, steaming, braising, poaching, simmering };
