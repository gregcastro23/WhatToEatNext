'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import @/services  from 'errorHandler ';
import @/constants  from 'defaults ';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * A global error boundary component that catches runtime errors,
 * particularly focusing on undefined variable access
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Increase error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Log to our error handler
    ErrorHandler.log(error, {
      context: this.props.context || 'GlobalErrorBoundary',
      data: {
        componentStack: errorInfo.componentStack,
        errorCount: this.state.errorCount,
      },
      isFatal: this.state.errorCount >= 3
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Analyzes the error to determine if it's related to undefined variable access
   */
  isUndefinedVariableError(): boolean {
    const error = this.state.error;
    if (!error) return false;
    
    return (
      error.message.includes("undefined") ||
      error.message.includes("null") ||
      error.message.includes("Cannot read property") ||
      error.message.includes("is not defined") ||
      error.message.includes("Cannot read properties of undefined") ||
      error.message.includes("Cannot read properties of null")
    );
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;
    
    if (hasError && error) {
      // Check for undefined variable errors
      const isUndefinedError = this.isUndefinedVariableError();
      
      // If a custom fallback is provided as a function, use it
      if (typeof fallback === 'function') {
        return fallback(error, this.reset);
      }
      
      // If a custom fallback is provided as a component, use it
      if (fallback) {
        return fallback;
      }
      
      // Default fallback UI
      return (
        <div className="error-boundary p-4 border border-red-500 rounded bg-red-50">
          <h2 className="text-lg font-bold text-red-700 mb-2">Something went wrong</h2>
          <details className="whitespace-pre-wrap mb-4">
            <summary className="cursor-pointer text-sm font-medium text-red-600 mb-1">
              {isUndefinedError 
                ? "A data value was missing or undefined" 
                : error.message}
            </summary>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
              {error.stack}
              {errorInfo && errorInfo.componentStack}
            </pre>
          </details>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={this.reset}
          >
            Try again
          </button>
        </div>
      );
    }
    
    return children;
  }
}

export default GlobalErrorBoundary; 