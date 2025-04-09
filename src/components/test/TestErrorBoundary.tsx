'use client';

import React from 'react';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';

export function TestErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorDisplay
          error={error}
          context="Test Environment"
          retry={resetErrorBoundary}
        />
      )}
      onError={(error) => {
        console.error('Test error boundary caught error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
} 