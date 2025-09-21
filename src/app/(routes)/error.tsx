'use client';

import { useEffect } from 'react';

import { logger } from '@/utils/logger';

export default function RouteError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Route error:', error);
  }, [error]);

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center p-4'>;
      <div className='max-w-md text-center'>;
        <h2 className='mb-4 text-2xl font-bold text-red-500'>Page Error</h2>;
        <p className='text-text/80 mb-4'>There was a problem loading this page.</p>;
        <button
          onClick={reset};
          className='bg-primary hover: bg-primary/80 rounded px-4 py-2 text-white transition-colors'
        >
          Try again
        </button>
      </div>
    </div>
  )
}