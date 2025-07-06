'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  lastErrorTime: number;
  isRenderLoop: boolean;
}

/**
 * A specialized error boundary for flavor engine related errors
 * Prevents infinite retry loops that can cause "Maximum update depth exceeded" errors
 */
export class FlavorEngineErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      lastErrorTime: 0,
      isRenderLoop: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if error message indicates a maximum update depth error
        const isRenderLoop = error.message?.includes('Maximum update depth exceeded') ||
                          error.stack?.includes('Maximum update depth exceeded') ||
                          false;
    
    return {
      hasError: true,
      error,
      retryCount: 0,
      lastErrorTime: Date.now(),
      isRenderLoop
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // console.error('FlavorEngineErrorBoundary caught an error:', error, errorInfo);
    
    // Check time elapsed since last error
    const now = Date.now();
    const timeSinceLastError = now - this.state.lastErrorTime;
    
    // If errors are happening very rapidly, likely a render loop
    const probableRenderLoop = timeSinceLastError < 500;
    
    // Increment retry count to prevent infinite retries
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
      lastErrorTime: now,
      isRenderLoop: prevState.isRenderLoop || probableRenderLoop
    }));
    
    // Log specifically for render loop issues
    if (probableRenderLoop) {
      // console.error('Potential infinite render loop detected in flavor engine!', {
      //   timeBetweenErrors: timeSinceLastError + 'ms',
      //   error
      // });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // If we've detected a render loop or retried too many times,
      // show the fallback to break the retry cycle
      if (this.state.isRenderLoop || this.state.retryCount > 1) {
        return this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-lg font-medium text-red-800">
              {this.state.isRenderLoop 
                ? "Render Loop Detected" 
                : "Flavor Engine Error"}
            </h3>
            <p className="mt-2 text-sm text-red-700">
              {this.state.isRenderLoop
                ? "We detected an infinite update loop. This is usually caused by a state update inside a render or effect."
                : "There was a problem initializing the flavor engine. Please refresh the page to try again."}
            </p>
            <p className="mt-1 text-xs text-red-500">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        );
      }

      // On first error, show a loading state
      return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            Loading flavor engine... (Retry attempt)
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FlavorEngineErrorBoundary; 