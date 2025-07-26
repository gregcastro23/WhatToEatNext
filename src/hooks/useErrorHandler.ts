'use client';
import React, { useState, useCallback, useEffect } from 'react';

import { ApiError } from "../types/errors";
import handleError, { ErrorType, ErrorSeverity } from "../utils/errorHandler";
import { createLogger } from "../utils/logger";
// Logger instance
const logger = createLogger('useErrorHandler');
// Component props
interface UseErrorHandlerProps {
  componentName: string;
}

// Return type
interface UseErrorHandlerReturn {
  captureError: (error: Error | string, context?: any) => void;
  foodError: Error | null;
  foodLoading: boolean;
  foodRecommendations: any[] | null;
  setFoodRecommendations: React.Dispatch<React.SetStateAction<any[] | null>>;
}

/**
 * Custom hook for handling errors in a component
 */
export default function useErrorHandler({ componentName }: UseErrorHandlerProps): UseErrorHandlerReturn {
  const [foodError, setFoodError] = useState<Error | null>(null);
  const [foodLoading, setFoodLoading] = useState<boolean>(true);
  const [foodRecommendations, setFoodRecommendations] = useState<any[] | null>(null);

  // Use effect to initialize and cleanup
  useEffect(() => {
    // Set initial loading state
    setFoodLoading(true);
    
    // Clean up resources and set loading to false when the component unmounts
    return () => {
      setFoodLoading(false);
    };
  }, []);

  // Capture and handle errors
  const captureError = useCallback((error: Error | string, context: any = {}) => {
    // Create error object if string was passed
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    // Log the error
    logger.error(`Error in ${componentName}:`, {
      error: errorObj.message,
      stack: errorObj.stack,
      context
    });

    // Handle the error through the error system
    handleError(errorObj, {
      source: componentName,
      severity: ErrorSeverity.WARNING,
      type: ((ErrorType as Record<string, unknown>).FOOD_RECOMMENDATION as string) || 'General',
      context
    });

    // Update state
    setFoodError(errorObj);
    setFoodLoading(false);
  }, [componentName]);

  return {
    captureError,
    foodError,
    foodLoading,
    foodRecommendations,
    setFoodRecommendations
  };
}


