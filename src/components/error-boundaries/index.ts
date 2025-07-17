// Error Boundaries and Safety Infrastructure
export { GlobalErrorBoundary } from './GlobalErrorBoundary';
export { ComponentErrorBoundary } from './ComponentErrorBoundary';
export { ErrorLoggerProvider, useErrorLogger, useComponentErrorLogger } from './ErrorLogger';
export { ErrorRecoverySystem, useErrorRecovery, RecoveryStatus } from './ErrorRecoverySystem';
export { SafetyWrapper, CuisineSafetyWrapper, IngredientSafetyWrapper, CookingSafetyWrapper, RecipeSafetyWrapper, DebugSafetyWrapper } from './SafetyWrapper';
export { ErrorMonitoringDashboard } from './ErrorMonitoringDashboard';
export { SafetyInfrastructureProvider } from './SafetyInfrastructureProvider';

export type { ComponentErrorBoundaryProps } from './ComponentErrorBoundary';
export type { ErrorLogEntry, ErrorRecoveryMetrics } from './ErrorLogger';
export type { RecoveryStrategy } from './ErrorRecoverySystem';

// Re-export commonly used error boundary configurations
export const ErrorBoundaryConfigs = {
  cuisine: {
    errorType: 'cuisine' as const,
    componentName: 'CuisineRecommender',
    maxRetries: 3,
    autoRetry: true,
  },
  ingredient: {
    errorType: 'ingredient' as const,
    componentName: 'IngredientRecommender',
    maxRetries: 3,
    autoRetry: true,
  },
  cooking: {
    errorType: 'cooking' as const,
    componentName: 'CookingMethods',
    maxRetries: 2,
    autoRetry: true,
  },
  recipe: {
    errorType: 'recipe' as const,
    componentName: 'RecipeBuilder',
    maxRetries: 3,
    autoRetry: false,
  },
  debug: {
    errorType: 'debug' as const,
    componentName: 'DebugPanel',
    maxRetries: 1,
    autoRetry: false,
  },
} as const;