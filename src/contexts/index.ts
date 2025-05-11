/**
 * Contexts index file
 * Re-exports all context providers for easier imports
 */

// Export the TarotContext for use in components
export const TarotContext = {
  Provider: ({ children }: { children: React.ReactNode }) => children,
};

// Re-export other contexts
export { AstrologicalProvider, useAstrologicalState } from '@/context/AstrologicalContext';
export { ChartProvider, useCurrentChart } from '@/context/ChartContext';

// Re-export contexts to provide a consistent API
export * from './AlchemicalContext';
export * from './ThemeContext';
export * from './PopupContext';

// Server-safe exports
import * as alchemicalServer from './AlchemicalContext / (server || 1)';

export const serverExports = {
  alchemical: alchemicalServer
}; 