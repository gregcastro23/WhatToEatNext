import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: string;
}

function ErrorFallback({ error, resetErrorBoundary, context = 'Unknown' }: ErrorFallbackProps) {
  return (
    <div role="alert" className="error-boundary">
      <h2>Something went wrong in {context}:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
  context?: string;
  fallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void; context?: string }>;
}

export function GlobalErrorBoundary({ 
  children, 
  context = 'Unknown',
  fallback 
}: GlobalErrorBoundaryProps) {
  const CustomFallback = fallback || ErrorFallback;
  
  return (
    <ErrorBoundary
      FallbackComponent={CustomFallback}
      onError={(error, errorInfo) => {
        // console.error(`Global error in ${context}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export default GlobalErrorBoundary;
