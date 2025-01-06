'use client';

import React, { Component, ErrorInfo } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;

  state: State = {
    hasError: false,
    error: null,
    retryCount: 0,
    isRecovering: false
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private async attemptRecovery() {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;

    if (this.state.retryCount >= maxRetries) {
      logger.error('Max retries reached, showing error UI');
      return;
    }

    this.setState({ isRecovering: true });

    try {
      // Clear local storage
      localStorage.clear();
      
      // Clear session storage
      sessionStorage.clear();
      
      // Reset any global state
      window.__NEXT_DATA__ = undefined;

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, retryDelay));

      // Increment retry count and reset error state
      this.setState(prev => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
        isRecovering: false
      }));
    } catch (recoveryError) {
      logger.error('Recovery attempt failed:', recoveryError);
      this.setState({ isRecovering: false });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    const { hasError, error, isRecovering, retryCount } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (isRecovering) {
        return (
          <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="max-w-md text-center">
              <h2 className="text-xl font-semibold mb-2">Recovering...</h2>
              <p className="text-text/60 mb-4">
                Attempt {retryCount + 1} of {this.props.maxRetries || 3}
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          </div>
        );
      }

      if (fallback) {
        return fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Something went wrong
            </h2>
            <p className="text-text/80 mb-6">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => this.attemptRecovery()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                disabled={isRecovering}
              >
                Try to recover
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors ml-4"
              >
                Refresh page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
} 