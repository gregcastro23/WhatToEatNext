'use client'

import { useEffect } from 'react'
import { logger } from '@/utils/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Application Error
            </h2>
            <p className="mb-4 text-text/80">
              A critical error has occurred. Please try again.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
} 