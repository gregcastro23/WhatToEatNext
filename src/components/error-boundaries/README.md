# Error Boundaries and Safety Infrastructure

This directory contains a comprehensive error handling system for the "What To Eat Next" application. The system provides multiple layers of error protection, logging, and recovery mechanisms.

## Overview

The error boundary system consists of several key components:

1. **Global Error Boundary** - Catches unhandled errors at the application level
2. **Component Error Boundaries** - Provides error isolation for individual components
3. **Error Logger** - Centralized error logging and tracking
4. **Error Recovery System** - Automatic and manual error recovery mechanisms
5. **Safety Wrappers** - Convenient pre-configured error boundaries
6. **Monitoring Dashboard** - Real-time error monitoring and metrics

## Components

### GlobalErrorBoundary

The top-level error boundary that catches all unhandled errors in the application.

```tsx
import { GlobalErrorBoundary } from '@/components/error-boundaries';

function App() {
  return (
    <GlobalErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error('Global error:', error);
      }}
      onRecovery={() => {
        // Called when error is recovered
        console.log('Error recovered');
      }}
    >
      <YourApp />
    </GlobalErrorBoundary>
  );
}
```

### ComponentErrorBoundary

Provides error isolation for individual components with themed fallbacks.

```tsx
import { ComponentErrorBoundary } from '@/components/error-boundaries';

function MyComponent() {
  return (
    <ComponentErrorBoundary
      componentName="CuisineRecommender"
      errorType="cuisine"
      maxRetries={3}
      autoRetry={true}
      showDetails={true}
    >
      <CuisineRecommender />
    </ComponentErrorBoundary>
  );
}
```

### SafetyWrapper

Convenient wrapper that combines error boundary with error logging.

```tsx
import { SafetyWrapper, CuisineSafetyWrapper } from '@/components/error-boundaries';

// Generic wrapper
<SafetyWrapper
  componentName="MyComponent"
  level="component"
  fallbackMessage="Component failed to load"
>
  <MyComponent />
</SafetyWrapper>

// Pre-configured wrapper
<CuisineSafetyWrapper componentName="CuisineRecommender">
  <CuisineRecommender />
</CuisineSafetyWrapper>
```

### SafetyInfrastructureProvider

Comprehensive provider that sets up the entire error handling system.

```tsx
import { SafetyInfrastructureProvider } from '@/components/error-boundaries';

function App() {
  return (
    <SafetyInfrastructureProvider
      enableMonitoring={true}
      enableAutoRecovery={true}
      showMonitoringDashboard={process.env.NODE_ENV === 'development'}
    >
      <YourApp />
    </SafetyInfrastructureProvider>
  );
}
```

## Error Types and Themes

The system supports different error types with themed fallbacks:

- `cuisine` - Orange theme for cuisine-related components
- `ingredient` - Green theme for ingredient components
- `cooking` - Purple theme for cooking method components
- `recipe` - Blue theme for recipe components
- `debug` - Yellow theme for debug components
- `default` - Gray theme for generic components

## Error Logging

### useErrorLogger Hook

```tsx
import { useErrorLogger } from '@/components/error-boundaries';

function MyComponent() {
  const { logError, getMetrics, clearErrorLog } = useErrorLogger();

  const handleError = () => {
    const error = new Error('Something went wrong');
    logError(error, 'MyComponent', 'MyComponent', 'medium');
  };

  const metrics = getMetrics();
  // metrics.totalErrors, metrics.resolvedErrors, etc.
}
```

### useComponentErrorLogger Hook

```tsx
import { useComponentErrorLogger } from '@/components/error-boundaries';

function MyComponent() {
  const { logError, handleAsyncError, handleSyncError } = useComponentErrorLogger('MyComponent');

  // Log errors manually
  const handleManualError = () => {
    const error = new Error('Manual error');
    logError(error, 'button click', 'high');
  };

  // Handle async operations safely
  const fetchData = async () => {
    const result = await handleAsyncError(
      async () => {
        const response = await fetch('/api/data');
        return response.json();
      },
      'data fetching',
      { fallback: 'data' } // fallback value
    );
    return result;
  };

  // Handle sync operations safely
  const processData = (data: any) => {
    return handleSyncError(
      () => {
        return data.someProperty.nestedProperty;
      },
      'data processing',
      null // fallback value
    );
  };
}
```

## Error Recovery

The system includes automatic error recovery strategies:

1. **Network Retry** - Retries failed network requests
2. **State Reset** - Resets component state for state-related errors
3. **Data Refresh** - Refreshes data when data-related errors occur
4. **Component Remount** - Forces component remount for render errors
5. **Fallback Data** - Uses fallback data when primary data source fails

### Custom Recovery Strategies

```tsx
import { ErrorRecoverySystem, RecoveryStrategy } from '@/components/error-boundaries';

const customStrategy: RecoveryStrategy = {
  id: 'custom-recovery',
  name: 'Custom Recovery',
  description: 'Custom recovery for specific errors',
  canRecover: (error: Error) => error.message.includes('custom'),
  recover: async (error: Error, context: string) => {
    // Custom recovery logic
    console.log('Recovering from custom error');
    return true; // Return true if recovery was successful
  },
  priority: 10, // Higher priority strategies are tried first
};

<ErrorRecoverySystem strategies={[customStrategy]}>
  <YourApp />
</ErrorRecoverySystem>
```

## Monitoring Dashboard

The monitoring dashboard provides real-time error tracking and metrics:

- Total errors and resolved errors
- Error rate (errors per minute)
- Critical error alerts
- Recovery status
- Error details and stack traces
- Manual recovery options

### Dashboard Usage

```tsx
import { ErrorMonitoringDashboard } from '@/components/error-boundaries';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div>
      <YourApp />
      <ErrorMonitoringDashboard
        isVisible={showDashboard}
        onToggleVisibility={() => setShowDashboard(!showDashboard)}
        compact={false}
      />
    </div>
  );
}
```

## Best Practices

### 1. Layer Your Error Boundaries

```tsx
// Global level
<GlobalErrorBoundary>
  {/* Section level */}
  <ComponentErrorBoundary componentName="MainSection" errorType="default">
    {/* Component level */}
    <CuisineSafetyWrapper componentName="CuisineRecommender">
      <CuisineRecommender />
    </CuisineSafetyWrapper>
  </ComponentErrorBoundary>
</GlobalErrorBoundary>
```

### 2. Use Appropriate Error Types

Match error types to component functionality for better user experience:

```tsx
<CuisineSafetyWrapper componentName="CuisineRecommender">
  <CuisineRecommender />
</CuisineSafetyWrapper>

<IngredientSafetyWrapper componentName="IngredientRecommender">
  <IngredientRecommender />
</IngredientSafetyWrapper>
```

### 3. Configure Retry Behavior

```tsx
<ComponentErrorBoundary
  componentName="CriticalComponent"
  maxRetries={5}
  autoRetry={true}
  retryDelay={2000}
>
  <CriticalComponent />
</ComponentErrorBoundary>
```

### 4. Handle Async Operations Safely

```tsx
const { handleAsyncError } = useComponentErrorLogger('MyComponent');

const fetchData = async () => {
  return await handleAsyncError(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    'API call',
    [] // fallback value
  );
};
```

### 5. Monitor Error Metrics

```tsx
const { getMetrics } = useErrorLogger();

useEffect(() => {
  const metrics = getMetrics();
  if (metrics.errorRate > 5) {
    // Alert if error rate is too high
    console.warn('High error rate detected:', metrics.errorRate);
  }
}, []);
```

## Configuration

### Error Boundary Configs

Pre-defined configurations for common components:

```tsx
import { ErrorBoundaryConfigs } from '@/components/error-boundaries';

// Use pre-defined config
<ComponentErrorBoundary
  {...ErrorBoundaryConfigs.cuisine}
  componentName="MyCuisineComponent"
>
  <MyCuisineComponent />
</ComponentErrorBoundary>
```

Available configs:
- `ErrorBoundaryConfigs.cuisine`
- `ErrorBoundaryConfigs.ingredient`
- `ErrorBoundaryConfigs.cooking`
- `ErrorBoundaryConfigs.recipe`
- `ErrorBoundaryConfigs.debug`

## Testing

The error boundary system includes comprehensive tests:

```bash
npm test src/components/error-boundaries
```

### Testing Error Boundaries

```tsx
import { render, screen } from '@testing-library/react';
import { ComponentErrorBoundary } from '@/components/error-boundaries';

function ErrorThrowingComponent() {
  throw new Error('Test error');
}

test('should catch and display errors', () => {
  render(
    <ComponentErrorBoundary componentName="TestComponent">
      <ErrorThrowingComponent />
    </ComponentErrorBoundary>
  );

  expect(screen.getByText(/TestComponent Error/i)).toBeInTheDocument();
});
```

## Integration with Main Page Restoration

This error boundary system is specifically designed to support the main page restoration requirements:

1. **Requirement 1.3** - Error boundaries prevent entire page crashes
2. **Requirement 7.5** - Component-level error boundaries provide isolation
3. **Requirement 8.5** - User-friendly error messages and recovery options

The system ensures that if any component on the main page fails, other components continue to function normally, and users have clear recovery options.