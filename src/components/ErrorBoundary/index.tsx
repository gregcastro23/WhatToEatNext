'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createLogger } from '@/utils/logger';
import { ErrorHandler, ErrorType, ErrorSeverity } from '@/utils/errorHandler';
import './styles.css';

const logger = createLogger('ErrorBoundary');

export interface ErrorBoundaryProps {
  /**
   * The component(s) to be wrapped by the error boundary
   */
  children: ReactNode;
  
  /**
   * Custom fallback component to render when an error occurs
   */
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  
  /**
   * Component or feature name for better error reporting
   */
  componentName?: string;
  
  /**
   * Maximum number of retries before showing the fallback UI
   */
  maxRetries?: number;
  
  /**
   * Delay between automatic retries in milliseconds
   */
  retryDelay?: number;
  
  /**
   * Whether errors should be reported to monitoring
   */
  reportErrors?: boolean;
  
  /**
   * Optional callback when an error occurs
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Optional callback after successful recovery
   */
  onRecovery?: () => void;
  
  /**
   * Error type for styling variations
   */
  errorType?: 'default' | 'astro' | 'food';
}

export interface ErrorFallbackProps {
  /**
   * The error that occurred
   */
  error: Error;
  
  /**
   * Function to try recovery
   */
  resetError: () => void;
  
  /**
   * Component that had the error
   */
  componentName: string;
  
  /**
   * Number of retries that have been attempted
   */
  retryCount: number;
  
  /**
   * Whether a retry is currently in progress
   */
  isRetrying: boolean;
  
  /**
   * Error type for styling variations
   */
  errorType?: 'default' | 'astro' | 'food';
}

interface ErrorBoundaryState {
  /**
   * Whether an error has occurred
   */
  hasError: boolean;
  
  /**
   * The error that occurred
   */
  error: Error | null;
  
  /**
   * Number of retries that have been attempted
   */
  retryCount: number;
  
  /**
   * Whether a retry is currently in progress
   */
  isRetrying: boolean;
}

/**
 * Default fallback component for the error boundary
 */
const DefaultFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  componentName,
  retryCount,
  isRetrying,
  errorType = 'default',
}) => {
  const errorClassName = errorType === 'default'
    ? "error-boundary-fallback"
    : `error-boundary-fallback ${errorType}-error`;
    
  return (
    <div className={errorClassName} role="alert">
      <div className="error-boundary-content">
        <h2 className="error-boundary-title">Something went wrong</h2>
        <p className="error-boundary-message">
          {componentName ? `Error in ${componentName}` : 'An error occurred&apos;}
        </p>
        <pre className="error-boundary-details">
          {error.message}
        </pre>
        {retryCount > 0 &amp;&amp; (
          <p className="error-boundary-retry-count">
            Recovery attempted {retryCount} time{retryCount !== 1 ? 's&apos; : ''}
          </p>
        )}
        <button 
          onClick={resetError}
          disabled={isRetrying}
          className="error-boundary-retry-button"
        >
          {isRetrying ? 'Retrying...' : 'Try Again&apos;}
        </button>
      </div>
    </div>
  );
};

/**
 * Enhanced error boundary component with retry capabilities,
 * comprehensive error reporting, and customizable fallback UI.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * Default props
   */
  static defaultProps = {
    maxRetries: 3,
    retryDelay: 1000,
    reportErrors: true,
    componentName: 'Unknown Component',
    errorType: 'default'
  };

  /**
   * State initialization
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  /**
   * React lifecycle method for handling errors
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Process the caught error
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { componentName, onError, reportErrors } = this.props;
    
    // Process error with our error handling system
    if (reportErrors) {
      ErrorHandler.log(error, {
        type: ErrorType.UI,
        severity: ErrorSeverity.ERROR,
        component: componentName,
        context: { errorInfo }
      });
    } else {
      // Just log locally if not reporting to monitoring
      logger.error(`Error in ${componentName || 'component'}:`, error, { component: 'ErrorBoundary' });
    }
    
    // Call user-provided onError handler if available
    if (onError) {
      onError(error, errorInfo);
    }
  }

  /**
   * Reset the error state to attempt recovery
   */
  resetError = (): void => {
    const { onRecovery } = this.props;
    this.setState({ isRetrying: true });
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        retryCount: this.state.retryCount + 1,
        isRetrying: false
      });
      if (onRecovery) {
        onRecovery();
      }
    }, 100);
  };

  /**
   * Handle automatic retry logic
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState): void {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    
    // Auto-retry logic
    if (this.state.hasError && !prevState.hasError && this.state.retryCount < maxRetries) {
      this.setState({ isRetrying: true });
      setTimeout(() => {
        this.resetError();
      }, retryDelay);
    }
  }

  render(): ReactNode {
    const { 
      children,
      FallbackComponent = DefaultFallback,
      componentName = 'Unknown Component',
      errorType = 'default'
    } = this.props;
    const { hasError, error, retryCount, isRetrying } = this.state;
    
    if (hasError && error) {
      return (
        <FallbackComponent
          error={error}
          resetError={this.resetError}
          componentName={componentName}
          retryCount={retryCount}
          isRetrying={isRetrying}
          errorType={errorType}
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
