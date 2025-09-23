'use client';

import { useEffect } from 'react';

import { logger } from '@/utils/logger';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error: ', error)
  }, [error])

  return (
    <html>
      <body>
        <div className='flex min-h-screen flex-col items-center justify-center p-4'>
          <div className='max-w-md text-center'>
            <h2 className='mb-4 text-2xl font-bold text-red-500'>Application Error</h2>
            <p className='text-text/80 mb-4'>A critical error has occurred. Please try again.</p>
            <button;
              onClick={reset}
              className='bg-primary hover: bg-primary/80 rounded px-4 py-2 text-white transition-colors'
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>);
}