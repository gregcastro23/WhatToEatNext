'use client';

import { AlertTriangle, RefreshCw, X, ChevronDown, ChevronUp, Bug, Zap, Utensils } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';

import { ErrorHandler, ErrorType, ErrorSeverity } from '../../services/errorHandler';
import { createLogger } from '../../utils/logger';

const logger = createLogger('ErrorBoundary');

// Enhanced error boundary props
export interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>;
  componentName?: string;
  maxRetries?: number;
  retryDelay?: number;
  reportErrors?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: () => void;
  errorType?: 'default' | 'astro' | 'food' | 'global';
  context?: string;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  showDetails?: boolean;
  autoRetry?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  componentName: string;
  retryCount: number;
  isRetrying: boolean;
  errorType?: 'default' | 'astro' | 'food' | 'global';
  showDetails?: boolean;
  context?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  errorCount: number;
  showDetails: boolean;
}

// Error display component for inline error handling
export function ErrorDisplay({ error,
  context,
  retry,
  reset,
  className = '',
  showDetails = false }: {
  error: Error | string;
  context?: string;
  retry?: () => void;
  reset?: () => void;
  className?: string;
  showDetails?: boolean;
}) {
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [detailsVisible, setDetailsVisible] = useState(false);

  useEffect(() => {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorLogs: string[] = [];
    
    setErrorDetails(
      process.env.NODE_ENV === 'development' 
        ? `${errorMessage}\n\nRecent Logs:\n${errorLogs}`
        : errorMessage
    );

    if (error instanceof Error) {
      ErrorHandler.log(error, { context });
    }
  }, [error, context]);

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error {context ? `in ${context}` : ''}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error instanceof Error ? error.message : error}</p>
          </div>
          
          {showDetails && (
            <div className="mt-3">
              <button
                onClick={() => setDetailsVisible(!detailsVisible)}
                className="flex items-center text-xs text-red-600 hover:text-red-800"
              >
                {detailsVisible ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
                {detailsVisible ? 'Hide Details' : 'Show Details'}
              </button>
              
              {detailsVisible && (
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto max-h-40 text-red-800">
                  {errorDetails}
                </pre>
              )}
            </div>
          )}
          
          {(retry || reset) && (
            <div className="mt-4 flex gap-2">
              {retry && (
                <button
                  onClick={retry}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded hover:bg-red-200 transition-colors"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try again
                </button>
              )}
              {reset && (
                <button
                  onClick={reset}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded hover:bg-red-200 transition-colors"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading error component
export function LoadingError({ message = 'Failed to load content',
  onRetry,
  className = '' }: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Error</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Enhanced fallback component with different themes
const EnhancedFallback: React.FC<ErrorFallbackProps> = ({ error,
  resetError,
  componentName,
  retryCount,
  isRetrying,
  errorType = 'default',
  showDetails = false,
  context }) => {
  const [detailsVisible, setDetailsVisible] = useState(false);

  const getErrorIcon = () => {
    switch (errorType) {
      case 'astro':
        return <Zap className="h-8 w-8 text-purple-500" />;
      case 'food':
        return <Utensils className="h-8 w-8 text-orange-500" />;
      case 'global':
        return <Bug className="h-8 w-8 text-red-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  const getThemeClasses = () => { switch (errorType) {
      case 'astro':
        return {
          container: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200',
          title: 'text-purple-800',
          message: 'text-purple-700',
          button: 'bg-purple-500 hover:bg-purple-600' };
      case 'food':
        return { container: 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200',
          title: 'text-orange-800',
          message: 'text-orange-700',
          button: 'bg-orange-500 hover:bg-orange-600' };
      case 'global':
        return { container: 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200',
          title: 'text-red-800',
          message: 'text-red-700',
          button: 'bg-red-500 hover:bg-red-600' };
      default:
        return { container: 'bg-gray-50 border-gray-200',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'bg-blue-500 hover:bg-blue-600' };
    }
  };

  const theme = getThemeClasses();

  return (
    <div className={`rounded-lg border p-6 ${theme.container}`} role="alert">
      <div className="flex flex-col items-center text-center space-y-4">
        {getErrorIcon()}
        
        <div className="space-y-2">
          <h2 className={`text-xl font-bold ${theme.title}`}>
            Something went wrong
          </h2>
          <p className={`${theme.message}`}>
            {componentName ? `Error in ${componentName}` : 'An error occurred'}
            {context && ` (${context})`}
          </p>
        </div>

        <div className={`text-sm ${theme.message} bg-white bg-opacity-50 rounded p-3 max-w-md`}>
          {error.message}
        </div>

        {retryCount > 0 && (
          <p className={`text-sm ${theme.message}`}>
            Recovery attempted {retryCount} time{retryCount !== 1 ? 's' : ''}
          </p>
        )}

        {showDetails && (
          <div className="w-full max-w-md">
            <button
              onClick={() => setDetailsVisible(!detailsVisible)}
              className={`flex items-center text-sm ${theme.message} hover:opacity-80`}
            >
              {detailsVisible ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
              {detailsVisible ? 'Hide Details' : 'Show Details'}
            </button>
            
            {detailsVisible && (
              <pre className="mt-2 text-xs bg-white bg-opacity-70 p-3 rounded overflow-auto max-h-40 text-left">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <button 
          onClick={resetError}
          disabled={isRetrying}
          className={`inline-flex items-center px-6 py-2 text-white rounded-lg transition-colors ${theme.button} disabled:opacity-50`}
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * Comprehensive error boundary component that consolidates all error handling functionality
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> { private retryTimeoutId: NodeJS.Timeout | null = null;

  static defaultProps = {
    maxRetries: 3,
    retryDelay: 1000,
    reportErrors: true,
    componentName: 'Unknown Component',
    errorType: 'default',
    showDetails: false,
    autoRetry: false };

  constructor(props: ErrorBoundaryProps) { super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      errorCount: 0,
      showDetails: props.showDetails || false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> { return {
      hasError: true,
      error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError, reportErrors, context } = this.props;
    
    this.setState(prevState => ({ errorInfo,
      errorCount: prevState.errorCount + 1 }));
    
    // Enhanced error logging
    if (reportErrors) { ErrorHandler.log(error, {
        context: context || componentName || 'ErrorBoundary',
        data: {
          componentStack: errorInfo.componentStack,
          errorCount: this.state.errorCount,
          retryCount: this.state.retryCount },
        isFatal: this.state.errorCount >= 3,
      });
    }

    logger.error('Error caught by boundary', { error: error.message,
      component: componentName,
      stack: error.stack,
      componentStack: errorInfo.componentStack });

    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-retry if enabled and within limits
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry();
    }
  }

  scheduleRetry = (): void => {
    const { retryDelay = 1000 } = this.props;
    
    this.setState({ isRetrying: true });
    
    this.retryTimeoutId = setTimeout(() => {
      this.resetError();
    }, retryDelay);
  };

  resetError = (): void => {
    const { onRecovery } = this.props;
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState(prevState => ({ hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false }));

    if (onRecovery) {
      onRecovery();
    }

    logger.info('Error boundary reset', { component: this.props.componentName,
      retryCount: this.state.retryCount + 1 });
  };

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  isUndefinedVariableError(): boolean {
    const error = this.state.error;
    if (!error) return false;
    
    return (
      error.message.includes('undefined') ||
      error.message.includes('null') ||
      error.message.includes('Cannot read property') ||
      error.message.includes('is not defined') ||
      error.message.includes('Cannot read properties of undefined') ||
      error.message.includes('Cannot read properties of null')
    );
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, FallbackComponent, fallback, maxRetries = 3 } = this.props;
    
    if (hasError && error) { // Check if we've exceeded max retries
      if (this.state.retryCount >= maxRetries) {
        logger.error('Max retries exceeded', {
          component: this.props.componentName,
          retryCount: this.state.retryCount,
          maxRetries });
      }

      // Custom fallback function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }
      
      // Custom fallback component
      if (fallback) {
        return fallback;
      }
      
      // Custom fallback component prop
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            resetError={this.resetError}
            componentName={this.props.componentName || 'Unknown Component'}
            retryCount={this.state.retryCount}
            isRetrying={this.state.isRetrying}
            errorType={this.props.errorType}
            showDetails={this.state.showDetails}
            context={this.props.context}
          />
        );
      }
      
      // Default enhanced fallback
      return (
        <EnhancedFallback
          error={error}
          resetError={this.resetError}
          componentName={this.props.componentName || 'Unknown Component'}
          retryCount={this.state.retryCount}
          isRetrying={this.state.isRetrying}
          errorType={this.props.errorType}
          showDetails={this.state.showDetails}
          context={this.props.context}
        />
      );
    }
    
    return children;
  }
}

// Global error boundary with enhanced features
export class GlobalErrorBoundary extends ErrorBoundary { static defaultProps = {
    ...ErrorBoundary.defaultProps,
    errorType: 'global',
    componentName: 'Global Application',
    maxRetries: 5,
    reportErrors: true,
    showDetails: true };
}

export default ErrorBoundary; 