'use client';

import React, { Component, ErrorInfo, ReactNode, memo } from 'react';
import { logger } from '@/utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  lastResetKeys?: Array<string | number>;
}

// Default fallback component with user-friendly error messages
const DefaultErrorFallback = memo(function DefaultErrorFallback({ 
  error, 
  errorInfo, 
  onRetry, 
  retryCount,
  maxRetries = 3 
}: {
  error: Error;
  errorInfo: ErrorInfo;
  onRetry: () => void;
  retryCount: number;
  maxRetries?: number;
}) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-800">
          Something went wrong
        </h3>
      </div>
      
      <div className="mb-4">
        <p className="text-red-700 mb-2">
          We encountered an unexpected error. This has been logged and we're working to fix it.
        </p>
        
        {isDevelopment && (
          <details className="mt-4">
            <summary className="cursor-pointer text-red-600 font-medium mb-2">
              Technical Details (Development Mode)
            </summary>
            <div className="bg-red-100 p-3 rounded border text-sm font-mono">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              <div className="mb-2">
                <strong>Stack:</strong>
                <pre className="whitespace-pre-wrap text-xs mt-1">
                  {error.stack}
                </pre>
              </div>
              {errorInfo.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap text-xs mt-1">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {retryCount < maxRetries && (
          <button
            onClick={onRetry}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again ({maxRetries - retryCount} attempts left)
          </button>
        )}
        
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Reload Page
        </button>
        
        {retryCount >= maxRetries && (
          <p className="text-red-600 text-sm">
            Maximum retry attempts reached. Please reload the page or contact support.
          </p>
        )}
      </div>
    </div>
  );
});

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      lastResetKeys: props.resetKeys
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    logger.error('ErrorBoundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      retryCount: this.state.retryCount
    });

    // Update state with error info
    this.setState({
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external error tracking service if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error, {
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      });
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError, lastResetKeys } = this.state;

    // Reset error state if resetKeys have changed
    if (hasError && resetKeys && lastResetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== lastResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error state if resetOnPropsChange is true and props have changed
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: prevState.retryCount + 1,
      lastResetKeys: this.props.resetKeys
    }));
  };

  handleRetry = () => {
    // Add a small delay before retrying to prevent rapid retry loops
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetErrorBoundary();
    }, 100);
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, isolate } = this.props;

    if (hasError && error && errorInfo) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo);
      }

      // Use default fallback
      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          retryCount={retryCount}
        />
      );
    }

    // If isolate is true, wrap children in an additional error boundary
    if (isolate) {
      return (
        <div className="error-boundary-isolation">
          {children}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for programmatic error reporting
export function useErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: Record<string, any>) => {
    logger.error('Manual error report:', {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });

    // Report to external service if available
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error, context);
    }
  }, []);

  return { reportError };
}

// Async error boundary for handling promise rejections
export class AsyncErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    };
  }

  componentDidMount() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    
    this.setState({
      hasError: true,
      error,
      errorInfo: { componentStack: 'Async Error (Promise Rejection)' } as ErrorInfo,
      errorId: `async_error_${Date.now()}`
    });

    logger.error('Unhandled promise rejection:', {
      error: error.message,
      stack: error.stack,
      reason: event.reason
    });

    // Prevent the default browser behavior
    event.preventDefault();
  };

  render() {
    // Use the same rendering logic as ErrorBoundary
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error && errorInfo) {
      if (fallback) {
        return fallback(error, errorInfo);
      }

      return (
        <DefaultErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          retryCount={this.state.retryCount}
        />
      );
    }

    return children;
  }
}