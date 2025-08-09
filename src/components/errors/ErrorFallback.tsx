'use client';

import React from 'react';

import { ErrorHandler } from '@/services/errorHandler';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: string;
}

export function ErrorFallback({
  error,
  resetErrorBoundary,
  context = 'unknown',
}: ErrorFallbackProps) {
  // Log the error to our error handler
  React.useEffect(() => {
    ErrorHandler.log(error, {
      context: context,
      data: {
        source: 'ErrorFallback',
      },
    });
  }, [error, context]);

  // Determine if this is an undefined variable error
  const isUndefinedError =
    error.message.includes('undefined') ||
    error.message.includes('null') ||
    error.message.includes('Cannot read property') ||
    error.message.includes('is not defined') ||
    error.message.includes('Cannot read properties of undefined') ||
    error.message.includes('Cannot read properties of null');

  return (
    <div className='mx-auto my-4 max-w-2xl rounded border border-red-500 bg-red-50 p-4 shadow-lg'>
      <div className='mb-3 flex items-center gap-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='h-6 w-6 text-red-600'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
          />
        </svg>
        <h2 className='text-lg font-bold text-red-700'>An error occurred</h2>
      </div>

      <div className='mb-4'>
        <p className='mb-2 text-sm text-red-800'>
          {isUndefinedError
            ? 'The application tried to access data that is missing or undefined.'
            : error.message}
        </p>

        {isUndefinedError && (
          <div className='rounded bg-gray-100 p-2 text-xs text-gray-600'>
            <p>This might be caused by:</p>
            <ul className='ml-4 mt-1 list-disc'>
              <li>Data still loading</li>
              <li>API response with unexpected format</li>
              <li>Missing initialization of state variables</li>
            </ul>
          </div>
        )}
      </div>

      <details className='mb-4'>
        <summary className='mb-1 cursor-pointer text-sm font-medium text-gray-700'>
          Technical details
        </summary>
        <pre className='mt-1 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs'>
          {error.stack || error.message}
        </pre>
      </details>

      <div className='flex justify-between'>
        <button
          onClick={resetErrorBoundary}
          className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
        >
          Try Again
        </button>

        <button
          onClick={() => window.location.reload()}
          className='rounded bg-gray-200 px-3 py-1 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400'
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export default ErrorFallback;
