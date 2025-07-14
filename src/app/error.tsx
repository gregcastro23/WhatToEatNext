'use client';

import { useEffect } from 'react';
import { errorHandler } from '@/services/errorHandler';
import { logger } from '@/utils/logger';

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorHandler.handleError(
      { message: error.message, digest: error.digest, stack: error.stack },
      {
        source: 'RootErrorBoundary',
      }
    );
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-8">
          {error.message || 'An unexpected error occurred'}
        </p>
        <div className="space-y-4">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Refresh page
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-8 text-left text-xs bg-gray-100 p-4 rounded overflow-auto max-h-40">
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  );
}