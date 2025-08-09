'use client';

import React from 'react';

import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { ErrorDisplay } from '@/components/errors/ErrorDisplay';

export function TestErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <ErrorDisplay error={error} title='Test Environment Error' showDetails={true} />
      )}
      onError={error => {
        console.error('Test error boundary caught error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
