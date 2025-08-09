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

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='mb-4 rounded-lg border border-amber-700 bg-amber-900 bg-opacity-90 p-4 text-amber-100 shadow-lg'>
          <div className='flex items-center'>
            <AlertTriangle className='mr-2 h-5 w-5 text-amber-300' />
            <div>
              <p className='font-semibold'>Astrological calculation error</p>
              <p className='text-sm'>
                {this.state.error?.message || 'Something went wrong with astronomical calculations'}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className='mt-2 rounded bg-amber-700 px-3 py-1 text-sm hover:bg-amber-600'
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
