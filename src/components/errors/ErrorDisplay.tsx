import React from 'react';

interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  showDetails?: boolean;
}

export function ErrorDisplay({ 
  error, 
  title = 'An error occurred', 
  showDetails = false 
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className="error-display">
      <h3>{title}</h3>
      <p>{errorMessage}</p>
      {showDetails && typeof error === 'object' && (
        <details>
          <summary>Error Details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}
    </div>
  );
}

export default ErrorDisplay;
