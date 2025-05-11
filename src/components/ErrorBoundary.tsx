'use client';
import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  retryCount: number;
}

class ErrorBoundaryComponent extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error);
    }
    // console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState((prevState) => ({
      hasError: false,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;

    if (this.state.hasError) {
      if (this.state.retryCount < maxRetries) {
        // Auto-retry with delay
        setTimeout(() => this.retry(), retryDelay);
        return <div>Recovering from error...</div>;
      }

      return (
        this.props.fallback || (
          <div className="error-boundary-fallback">
            <h2>Something went wrong</h2>
            <button onClick={this.retry}>Try again</button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Export both as default and named export
export default ErrorBoundaryComponent;
export { ErrorBoundaryComponent as ErrorBoundary };
