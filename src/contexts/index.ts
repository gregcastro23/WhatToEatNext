// Re-export contexts to provide a consistent API
export * from './AlchemicalContext';
export * from './TarotContext';
export * from './ChartContext';
export * from './ThemeContext';
export * from './PopupContext';

// Re-export commonly used hooks from contexts
export { useAstrologicalState } from '../hooks/useAstrologicalState';

// Server-safe exports
import * as alchemicalServer from './AlchemicalContext/server';

export const serverExports = {
  alchemical: alchemicalServer,
};
