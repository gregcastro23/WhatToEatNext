'use client';

import { useEffect } from 'react';

import { errorHandler } from '@/services/errorHandler';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string },
  reset: () => void
}) {
  useEffect(() => {
    errorHandler.handleError(error, {
      context: 'RootErrorBoundary',
      digest: error.digest
    })
  }, [error])

  return (
    <div className='flex min-h-screen items-center justify-center bg-white p-4'>
      <div className='w-full max-w-md text-center'>
        <h2 className='mb-4 text-2xl font-bold text-gray-900'>Something went wrong!</h2>
        <p className='mb-8 text-gray-600'>{error.message || 'An unexpected error occurred'}</p>
        <div className='space-y-4'>
          <button
            onClick={reset}
            className='bg-primary hover:bg-primary/80 w-full rounded px-4 py-2 text-white transition-colors'
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className='w-full rounded bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300'
          >
            Refresh page
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <pre className='mt-8 max-h-40 overflow-auto rounded bg-gray-100 p-4 text-left text-xs'>
            {error.stack}
          </pre>
        )}
      </div>
    </div>
  )
}