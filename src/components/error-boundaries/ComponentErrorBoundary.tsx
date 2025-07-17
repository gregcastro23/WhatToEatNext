'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHandler } from '@/services/errorHandler';
import { createLogger } from '@/utils/logger';
import { AlertTriangle, RefreshCw, X, ChevronDown, ChevronUp, Utensils, Zap, Compass } from 'lucide-react';

const logger = createLogger('ComponentErrorBoundary');

export interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName: string;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  maxRetries?: number;
  retryDelay?: number;
  autoRetry?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: () => void;
  errorType?: 'cuisine' | 'ingredient' | 'cooking' | 'recipe' | 'debug' | 'default';
  showDetails?: boolean;
  context?: string;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  showDetails: boolean;
  errorId: string;
}

/**
 * Component-Level Error Boundary
 * Provides error isolation for individual components with themed fallbacks
 */
export class ComponentErrorBoundary extends Component<ComponentErrorBoundaryProps, ComponentErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  static defaultProps = {
    maxRetries: 3,
    retryDelay: 1000,
    autoRetry: false,
    errorType: 'default',
    showDetails: false,
  };

  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      showDetails: props.showDetails || false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ComponentErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `component-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName, onError, context } = this.props;
    
    this.setState({ errorInfo });

    // Log the error with component context
    ErrorHandler.log(error, {
      context: context || `ComponentErrorBoundary:${componentName}`,
      data: {
        componentStack: errorInfo.componentStack,
        componentName,
        errorBoundary: 'Component',
        retryCount: this.state.retryCount,
        timestamp: new Date().toISOString(),
      },
      isFatal: false,
    });

    logger.error('Component error caught', {
      component: componentName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-retry if enabled and within limits
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRetry();
    }
  }

  private scheduleRetry = (): void => {
    const { retryDelay = 1000 } = this.props;
    
    this.setState({ isRetrying: true });
    
    this.retryTimeoutId = setTimeout(() => {
      this.resetError();
    }, retryDelay);
  };

  private resetError = (): void => {
    const { onRecovery } = this.props;
    
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
    }));

    logger.info('Component error boundary reset', {
      component: this.props.componentName,
      retryCount: this.state.retryCount + 1,
    });

    if (onRecovery) {
      onRecovery();
    }
  };

  private toggleDetails = (): void => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  private getErrorIcon = () => {
    const { errorType } = this.props;
    switch (errorType) {
      case 'cuisine':
        return <Utensils className="h-6 w-6 text-orange-500" />;
      case 'ingredient':
        return <Compass className="h-6 w-6 text-green-500" />;
      case 'cooking':
        return <Zap className="h-6 w-6 text-purple-500" />;
      case 'recipe':
        return <Utensils className="h-6 w-6 text-blue-500" />;
      case 'debug':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
    }
  };

  private getThemeClasses = () => {
    const { errorType } = this.props;
    switch (errorType) {
      case 'cuisine':
        return {
          container: 'bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200',
          title: 'text-orange-800',
          message: 'text-orange-700',
          button: 'bg-orange-500 hover:bg-orange-600',
          details: 'bg-orange-100',
        };
      case 'ingredient':
        return {
          container: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
          title: 'text-green-800',
          message: 'text-green-700',
          button: 'bg-green-500 hover:bg-green-600',
          details: 'bg-green-100',
        };
      case 'cooking':
        return {
          container: 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200',
          title: 'text-purple-800',
          message: 'text-purple-700',
          button: 'bg-purple-500 hover:bg-purple-600',
          details: 'bg-purple-100',
        };
      case 'recipe':
        return {
          container: 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-700',
          button: 'bg-blue-500 hover:bg-blue-600',
          details: 'bg-blue-100',
        };
      case 'debug':
        return {
          container: 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          button: 'bg-yellow-500 hover:bg-yellow-600',
          details: 'bg-yellow-100',
        };
      default:
        return {
          container: 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200',
          title: 'text-gray-800',
          message: 'text-gray-700',
          button: 'bg-gray-500 hover:bg-gray-600',
          details: 'bg-gray-100',
        };
    }
  };

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render(): ReactNode {
    const { hasError, error, isRetrying, retryCount, showDetails } = this.state;
    const { children, componentName, fallback, maxRetries = 3 } = this.props;

    if (hasError && error) {
      // Custom fallback function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      // Custom fallback component
      if (fallback) {
        return fallback;
      }

      const theme = this.getThemeClasses();
      const hasExceededRetries = retryCount >= maxRetries;

      // Default component error fallback
      return (
        <div className={`rounded-lg border p-4 ${theme.container}`} role="alert">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {this.getErrorIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <h3 className={`text-lg font-semibold ${theme.title}`}>
                  {componentName} Error
                </h3>
                
                <p className={`text-sm ${theme.message}`}>
                  This component encountered an error and couldn't load properly.
                </p>

                <div className={`text-sm ${theme.message} ${theme.details} rounded p-3`}>
                  {error.message}
                </div>

                {retryCount > 0 && (
                  <p className={`text-xs ${theme.message}`}>
                    Recovery attempted {retryCount} time{retryCount !== 1 ? 's' : ''}
                    {hasExceededRetries && ' (max retries reached)'}
                  </p>
                )}

                {process.env.NODE_ENV === 'development' && (
                  <div className="space-y-2">
                    <button
                      onClick={this.toggleDetails}
                      className={`flex items-center text-sm ${theme.message} hover:opacity-80`}
                    >
                      {showDetails ? (
                        <ChevronUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 mr-1" />
                      )}
                      {showDetails ? 'Hide Details' : 'Show Details'}
                    </button>
                    
                    {showDetails && (
                      <pre className={`text-xs ${theme.details} p-3 rounded overflow-auto max-h-40`}>
                        {error.stack}
                      </pre>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={this.resetError}
                    disabled={isRetrying}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors ${theme.button} disabled:opacity-50`}
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
                  
                  <button
                    onClick={() => this.setState({ hasError: false, error: null })}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${theme.message} bg-white border border-current rounded-lg hover:bg-gray-50 transition-colors`}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hide Error
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ComponentErrorBoundary;