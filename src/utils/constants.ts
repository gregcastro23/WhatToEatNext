/**
 * Constants re-export file
 *
 * This file consolidates all constants from the src/utils/constants directory
 * to provide a single import point for these utilities.
 */

// Re-export all constants from specific modules
export * from "./constants/elements";
export * from "./constants/lunar";
export * from "./constants/seasons";

// Type-safe threshold constants with explicit type declarations
export const _THRESHOLD: {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  MAXIMUM: number;
} = {
  LOW: 0.33,
  MEDIUM: 0.66,
  HIGH: 0.9,
  MAXIMUM: 1.0,
};

// Export common constants that might be needed across multiple files
// with explicit type declarations
export const _DEFAULT_MATCH_THRESHOLD = 0.6;
export const _DEFAULT_COMPATIBILITY_THRESHOLD = 0.7;
export const _DEFAULT_LIMIT = 10;
export const _DEFAULT_PRECISION = 2;
