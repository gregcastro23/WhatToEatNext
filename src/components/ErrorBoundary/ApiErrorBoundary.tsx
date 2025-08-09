/**
 * API Error Boundary Component
 *
 * A specialized error boundary for handling API-related errors with different
 * fallback UIs depending on the error type.
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';

/**
 * Props for the ApiErrorBoundary component
 */
interface ApiErrorBoundaryProps {
  /** The content to render if no error occurs */
  children: ReactNode;

  /** Custom fallback component for network errors */
  networkErrorFallback?: ReactNode;

  /** Custom fallback component for timeout errors */
  timeoutErrorFallback?: ReactNode;

  /** Custom fallback component for API errors */
  apiFallback?: ReactNode;

  /** Custom fallback component for generic errors */
  genericFallback?: ReactNode;

  /** Optional callback to be called when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the ApiErrorBoundary component
 */
interface ApiErrorBoundaryState {
  /** Whether an error has occurred */
  hasError: boolean;

  /** The error that occurred */
  error: Error | null;

  /** The type of error that occurred */
  errorType: 'network' | 'timeout' | 'api' | 'generic';
}

/**
 * A specialized React error boundary for handling API-related errors
 */
export class ApiErrorBoundary extends Component<ApiErrorBoundaryProps, ApiErrorBoundaryState> {
  constructor(props: ApiErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorType: 'generic',
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): ApiErrorBoundaryState {
    // Categorize the error
    let errorType: ApiErrorBoundaryState['errorType'] = 'generic';

    if (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('Failed to fetch')
    ) {
      errorType = 'network';
    } else if (
      error.message.includes('timeout') ||
      error.name === 'FetchTimeoutError' ||
      error.message.includes('aborted')
    ) {
      errorType = 'timeout';
    } else if (
      error.message.includes('API') ||
      error.message.includes('api') ||
      error.message.includes('status') ||
      error.message.includes('response')
    ) {
      errorType = 'api';
    }

    // Return the new state
    return {
      hasError: true,
      error,
      errorType,
    };
  }

  /**
   * Log error information and call the onError callback if provided
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('API Error Boundary caught an error:', error, errorInfo);

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * Reset the error state
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorType: 'generic',
    });
  };

  render(): ReactNode {
    const { hasError, errorType, error } = this.state;
    const { children, networkErrorFallback, timeoutErrorFallback, apiFallback, genericFallback } =
      this.props;

    // If no error occurred, render the children
    if (!hasError) {
      return children;
    }

    // Default fallbacks for each error type
    const defaultNetworkErrorFallback = (
      <div className='error-container'>
        <h3>Network Error</h3>
        <p>
          We couldn't connect to the server. Please check your internet connection and try again.
        </p>
        <button onClick={this.resetError}>Try Again</button>
      </div>
    );

    const defaultTimeoutErrorFallback = (
      <div className='error-container'>
        <h3>Request Timeout</h3>
        <p>The server took too long to respond. Please try again later.</p>
        <button onClick={this.resetError}>Try Again</button>
      </div>
    );

    const defaultApiFallback = (
      <div className='error-container'>
        <h3>API Error</h3>
        <p>Something went wrong with the data request. Please try again later.</p>
        <p className='error-details'>{error?.message}</p>
        <button onClick={this.resetError}>Try Again</button>
      </div>
    );

    const defaultGenericFallback = (
      <div className='error-container'>
        <h3>Something Went Wrong</h3>
        <p>An unexpected error occurred. Please try again.</p>
        <button onClick={this.resetError}>Try Again</button>
      </div>
    );

    // Choose the appropriate fallback based on the error type
    switch (errorType) {
      case 'network':
        return networkErrorFallback || defaultNetworkErrorFallback;
      case 'timeout':
        return timeoutErrorFallback || defaultTimeoutErrorFallback;
      case 'api':
        return apiFallback || defaultApiFallback;
      default:
        return genericFallback || defaultGenericFallback;
    }
  }
}

/**
 * HOC to wrap a component with the ApiErrorBoundary
 *
 * @param Component - The component to wrap
 * @param options - Options for the error boundary
 * @returns The wrapped component
 */
export function withApiErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ApiErrorBoundaryProps, 'children'> = {},
): React.FC<P> {
  return (props: P) => (
    <ApiErrorBoundary {...options}>
      <Component {...props} />
    </ApiErrorBoundary>
  );
}
