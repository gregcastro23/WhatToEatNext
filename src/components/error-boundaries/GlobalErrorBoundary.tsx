'use client';

import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

import { ErrorHandler } from '@/services/errorHandler';
import { createLogger } from '@/utils/logger';

const logger = createLogger('GlobalErrorBoundary');

interface GlobalErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: () => void;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  errorId: string;
}

/**
 * Global Error Boundary Component
 * Catches all unhandled errors at the application level and provides recovery mechanisms
 */
export class GlobalErrorBoundary extends Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<GlobalErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `global-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log the error with comprehensive context
    ErrorHandler.log(error, {
      context: 'GlobalErrorBoundary',
      data: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'Global',
        retryCount: this.state.retryCount,
        timestamp: new Date().toISOString(),
      },
      isFatal: true,
    });

    logger.error('Global error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Report to external services in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }
  }

  private reportErrorToService = (error: Error, errorInfo: ErrorInfo): void => {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just log it
    logger.info('Error reported to monitoring service', {
      errorId: this.state.errorId,
      message: error.message,
      componentStack: errorInfo.componentStack,
    });
  };

  private resetError = (): void => {
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

    logger.info('Global error boundary reset', {
      retryCount: this.state.retryCount + 1,
    });

    if (this.props.onRecovery) {
      this.props.onRecovery();
    }
  };

  private reloadApplication = (): void => {
    logger.info('Reloading application due to critical error');
    window.location.reload();
  };

  componentWillUnmount(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render(): ReactNode {
    const { hasError, error, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Custom fallback function
      if (typeof fallback === 'function') {
        return fallback(error, this.resetError);
      }

      // Custom fallback component
      if (fallback) {
        return fallback;
      }

      // Default global error fallback
      return (
        <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4'>
          <div className='w-full max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-lg'>
            <div className='flex flex-col items-center space-y-4 text-center'>
              <div className='rounded-full bg-red-100 p-3'>
                <Bug className='h-8 w-8 text-red-600' />
              </div>

              <div className='space-y-2'>
                <h1 className='text-2xl font-bold text-red-800'>Application Error</h1>
                <p className='text-red-700'>
                  We're sorry, but something went wrong with the application.
                </p>
              </div>

              <div className='w-full rounded-lg bg-red-50 p-4'>
                <p className='mb-2 text-sm font-medium text-red-800'>Error Details:</p>
                <p className='break-words text-sm text-red-700'>{error.message}</p>
                {retryCount > 0 && (
                  <p className='mt-2 text-xs text-red-600'>
                    Recovery attempted {retryCount} time{retryCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <div className='flex w-full flex-col gap-3 sm:flex-row'>
                <button
                  onClick={this.resetError}
                  className='inline-flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700'
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Try Again
                </button>

                <button
                  onClick={this.reloadApplication}
                  className='inline-flex flex-1 items-center justify-center rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700'
                >
                  <Home className='mr-2 h-4 w-4' />
                  Reload App
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className='w-full'>
                  <summary className='cursor-pointer text-sm text-red-600 hover:text-red-800'>
                    Show Technical Details
                  </summary>
                  <pre className='mt-2 max-h-40 overflow-auto rounded bg-red-100 p-3 text-left text-xs text-red-800'>
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default GlobalErrorBoundary;
