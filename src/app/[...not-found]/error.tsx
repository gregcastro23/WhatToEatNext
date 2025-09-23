'use client';

import { useEffect } from 'react';

import { logger } from '@/utils/logger';

export default function NotFoundError({
  error,
  reset: _reset
}: {
  error: Error & { digest?: string },
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Not found error: ', error)
  }, [error])

  return (<div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='max-w-md text-center'>
        <h2 className='mb-4 text-2xl font-bold text-red-500'>Page Not Found</h2>
        <p className='text-text/80 mb-4'>
          The page you&apos;re looking for doesn&apos,t exist or has been moved.
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className='bg-primary hover:bg-primary/80 rounded px-4 py-2 text-white transition-colors'
        >
          Go Home
        </button>
      </div>
    </div>);
}