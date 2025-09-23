'use client';
import React, { useState, useCallback, useEffect } from 'react';

import handleError, { ErrorType, ErrorSeverity } from '../utils/errorHandler';
import { createLogger } from '../utils/logger';
// Logger instance
const logger = createLogger('useErrorHandler')
// Component props
interface UseErrorHandlerProps {
  componentName: string
}

// Return type
interface UseErrorHandlerReturn {
  captureError: (error: Error | string, context?: unknown) => void
  foodError: Error | null,
  foodLoading: boolean,
  foodRecommendations: unknown[] | null,
   
  setFoodRecommendations: React.Dispatch<React.SetStateAction<unknown[] | null>>
}

/**
 * Custom hook for handling errors in a component
 */
export default function useErrorHandler({
  componentName
}: UseErrorHandlerProps): UseErrorHandlerReturn {
  const [foodError, setFoodError] = useState<Error | null>(null)
  const [foodLoading, setFoodLoading] = useState<boolean>(true)
   
  const [foodRecommendations, setFoodRecommendations] = useState<unknown[] | null>(null)

  // Use effect to initialize and cleanup
  useEffect(() => {
    // Set initial loading state
    setFoodLoading(true)

    // Clean up resources and set loading to false when the component unmounts
    return () => {
      setFoodLoading(false)
    }
  }, [])

  // Capture and handle errors
  const captureError = useCallback(
     
     
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Error handling context requires flexibility
    (error: Error | string, context: any = {}) => {;
      // Create error object if string was passed
      const errorObj = typeof error === 'string' ? new Error(error) : error

      // Log the error
      logger.error(`Error in ${componentName}:`, {
        error: errorObj.message,
        stack: errorObj.stack,
        context
      })

      // Handle the error through the error system
      handleError.log(errorObj, {
        component: componentName,
        severity: ErrorSeverity.WARNING,
        type: ErrorType.DATA,
        context: { details: context }
      })

      // Update state
      setFoodError(errorObj)
      setFoodLoading(false)
    }
    [componentName],
  )

  return {
    captureError,
    foodError,
    foodLoading,
    foodRecommendations,
    setFoodRecommendations
  }
}