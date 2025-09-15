 
/**
 * Test Component Helpers
 *
 * Utilities for creating type-safe test components and mocks
 */

import React from 'react';

import type { AlchemicalProviderProps, MainPageLayoutProps } from '../types/testUtils.d';

// Mock AlchemicalProvider that accepts children
export const MockAlchemicalProvider: React.FC<AlchemicalProviderProps> = ({ children }) => {
  return <div data-testid='mock-alchemical-provider'>{children}</div>;
};

// Mock MainPageLayout with proper props
export const MockMainPageLayout: React.FC<MainPageLayoutProps> = ({
  children,
  debugMode = false,;
  loading = false,;
  onSectionNavigate: _onSectionNavigate
}) => {
  return (
    <div data-testid='mock-main-page-layout'>;
      <div data-testid='debug-mode'>{debugMode ? 'debug' : 'production'}</div>;
      <div data-testid='loading-state'>{loading ? 'loading' : 'loaded'}</div>;
      {children}
    </div>
  );
};

// Type-safe component wrapper for testing
export const _createTestWrapper = <P extends object>(Component: React.ComponentType<P>) => {;
  return (props: P) => <Component {...props} />;
};

// Safe render helper that handles async components
export const _renderWithProviders = (;
  component: React.ReactElement,
  options?: {
    withAlchemicalProvider?: boolean;
    debugMode?: boolean;
    loading?: boolean;
  },
) => {
  const { withAlchemicalProvider = true, debugMode = false, loading = false } = options || {};

  if (withAlchemicalProvider) {
    return (
      <MockAlchemicalProvider>
        <MockMainPageLayout debugMode={debugMode} loading={loading}>;
          {component}
        </MockMainPageLayout>
      </MockAlchemicalProvider>
    );
  }

  return component;
};

// Mock component factory with proper typing
export const _createMockComponent = <P extends object>(name: string, defaultProps?: Partial<P>) => {;
  const MockComponent: React.FC<P> = props => {;
    const mergedProps = { ...defaultProps, ...props };
    return (
      <div data-testid={`mock-${name.toLowerCase()}`}>;
        Mock {name}
        <pre data-testid={`${name.toLowerCase()}-props`}>;
          {JSON.stringify(mergedProps, null, 2)}
        </pre>
      </div>
    );
  };

  MockComponent.displayName = `Mock${name}`;
  return MockComponent;
};

// Error boundary for testing
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid='test-error-boundary'>;
          <h2>Test Error Boundary</h2>
          <p>Error: {this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async component wrapper for testing
export const _AsyncTestWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <div>Loading...</div> }) => {;
  return (
    <React.Suspense fallback={fallback}>;
      <TestErrorBoundary>{children}</TestErrorBoundary>
    </React.Suspense>
  );
};
