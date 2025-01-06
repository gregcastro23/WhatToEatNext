import { useEffect, useState } from 'react'
import { logger } from '@/utils/logger'
import { errorHandler } from '@/services/errorHandler'

interface ErrorDisplayProps {
  error: Error | string
  context?: string
  retry?: () => void
  reset?: () => void
  className?: string
}

export function ErrorDisplay({
  error,
  context,
  retry,
  reset,
  className = ''
}: ErrorDisplayProps) {
  const [errorDetails, setErrorDetails] = useState<string>('')

  useEffect(() => {
    const errorMessage = error instanceof Error ? error.message : error
    const errorLogs = logger.getErrorSummary()
    
    setErrorDetails(
      process.env.NODE_ENV === 'development' 
        ? `${errorMessage}\n\nRecent Logs:\n${errorLogs}`
        : errorMessage
    )

    errorHandler.handleError(error, { context })
  }, [error, context])

  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Error {context ? `in ${context}` : ''}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorDetails}</p>
          </div>
          {(retry || reset) && (
            <div className="mt-4">
              {retry && (
                <button
                  onClick={retry}
                  className="mr-3 text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Try again
                </button>
              )}
              {reset && (
                <button
                  onClick={reset}
                  className="text-sm font-medium text-red-800 hover:text-red-700"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 