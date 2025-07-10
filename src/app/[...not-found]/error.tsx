'use client'

import { useEffect } from 'react'
import { _logger } from '@/utils/logger';

export default function NotFoundError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Not found error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Page Not Found
        </h2>
        <p className="mb-4 text-text/80">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  )
} 