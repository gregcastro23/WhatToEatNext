'use client'

import { useEffect } from 'react'
import { logger } from '@/utils/logger';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Route error:', error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Page Error
        </h2>
        <p className="mb-4 text-text/80">
          There was a problem loading this page.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 