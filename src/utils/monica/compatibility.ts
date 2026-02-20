import { MonicaMetrics } from './types';

/**
 * Determines compatible cooking methods based on the Monica Constant.
 * This is a heuristic-based approach.
 *
 * @param metrics The calculated Monica metrics for an ingredient.
 * @returns An array of suggested cooking method names.
 */
export function getMonicaCompatibleCookingMethods(metrics: MonicaMetrics): string[] {
  const { monicaConstant } = metrics;

  if (isNaN(monicaConstant) || monicaConstant === 0) {
    // If the constant is neutral, unstable, or zero, all methods are considered viable.
    return ['Roasting', 'Grilling', 'Steaming', 'Baking', 'Braising', 'Raw', 'Stir-frying', 'Sautéing', 'Poaching', 'Broiling', 'Smoking'];
  }

  if (monicaConstant > 0) {
    // Positive constant suggests higher energy transformation is favorable.
    return ['Roasting', 'Grilling', 'Broiling', 'Stir-frying', 'Sautéing'];
  } else {
    // Negative constant suggests lower energy or preservation methods are favorable.
    return ['Steaming', 'Raw', 'Poaching', 'Braising', 'Smoking'];
  }
}
