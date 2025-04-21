/**
 * This file provides backward compatibility for code that relies on worldCuisines
 * by re-exporting the culinaryTraditions data.
 */

import { culinaryTraditions } from './culinaryTraditions';

// Re-export culinaryTraditions as worldCuisines for backward compatibility
export const worldCuisines = culinaryTraditions;

export default worldCuisines; 