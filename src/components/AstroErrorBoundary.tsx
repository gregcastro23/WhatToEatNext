'use client';

import { AlertTriangle } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AstroErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-amber-900 bg-opacity-90 rounded-lg p-4 mb-4 shadow-lg border border-amber-700 text-amber-100">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-300" />
            <div>
              <p className="font-semibold">Astrological calculation error</p>
              <p className="text-sm">
                {this.state.error?.message ||
                  'Something went wrong with astronomical calculations&apos;}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-amber-700 hover:bg-amber-600 rounded text-sm"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AstroErrorBoundary;
