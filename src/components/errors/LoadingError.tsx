import { useEffect } from 'react'

import { ErrorHandler } from '@/services/errorHandler'

interface LoadingErrorProps {
  message?: string
  retry?: () => void
}

export function LoadingError({ message = 'Failed to load content', retry }: LoadingErrorProps) {
  useEffect(() => {
    ErrorHandler.handleError(new Error(message), {
      context: 'LoadingError',
      action: 'display'
    })
  }, [message])

  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <svg
        className="h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Try loading again
        </button>
      )}
    </div>
  )
} 