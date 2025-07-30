'use client';

import React, { ReactNode } from 'react';

import { ComponentErrorBoundary, ComponentErrorBoundaryProps } from './ComponentErrorBoundary';
import { useComponentErrorLogger } from './ErrorLogger';

interface SafetyWrapperProps extends Omit<ComponentErrorBoundaryProps, 'children'> {
  children: ReactNode;
  componentName: string;
  level?: 'section' | 'component' | 'feature';
  fallbackMessage?: string;
}

/**
 * Safety Wrapper Component
 * A convenient wrapper that combines error boundary with error logging
 * for easy use throughout the application
 */
export function SafetyWrapper({
  children,
  componentName,
  level = 'component',
  fallbackMessage,
  errorType = 'default',
  maxRetries = 3,
  autoRetry = true,
  showDetails = process.env.NODE_ENV === 'development',
  ...props
}: SafetyWrapperProps) {
  const { logError } = useComponentErrorLogger(componentName);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error with appropriate severity based on level
    const severity = level === 'feature&apos; ? 'high&apos; : level === 'section&apos; ? 'medium&apos; : 'low&apos;;
    logError(error, `${componentName} error boundary`, severity);

    // Call any additional error handler
    if (props.onError) {
      props.onError(error, errorInfo);
    }
  };

  const customFallback = fallbackMessage ? (error: Error, reset: () => void) => (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-center">
        <p className="text-gray-700 mb-3">{fallbackMessage}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  ) : undefined;

  return (
    <ComponentErrorBoundary
      {...props}
      componentName={componentName}
      errorType={errorType}
      maxRetries={maxRetries}
      autoRetry={autoRetry}
      showDetails={showDetails}
      onError={handleError}
      fallback={customFallback || props.fallback}
    >
      {children}
    </ComponentErrorBoundary>
  );
}

/**
 * Pre-configured safety wrappers for common component types
 */
export const CuisineSafetyWrapper = ({ children, ...props }: Omit<SafetyWrapperProps, 'errorType'>) => (
  <SafetyWrapper
    {...props}
    errorType="cuisine"
    fallbackMessage="Unable to load cuisine recommendations. Please try again."
  >
    {children}
  </SafetyWrapper>
);

export const IngredientSafetyWrapper = ({ children, ...props }: Omit<SafetyWrapperProps, 'errorType'>) => (
  <SafetyWrapper
    {...props}
    errorType="ingredient"
    fallbackMessage="Unable to load ingredient recommendations. Please try again."
  >
    {children}
  </SafetyWrapper>
);

export const CookingSafetyWrapper = ({ children, ...props }: Omit<SafetyWrapperProps, 'errorType'>) => (
  <SafetyWrapper
    {...props}
    errorType="cooking"
    fallbackMessage="Unable to load cooking methods. Please try again."
  >
    {children}
  </SafetyWrapper>
);

export const RecipeSafetyWrapper = ({ children, ...props }: Omit<SafetyWrapperProps, 'errorType'>) => (
  <SafetyWrapper
    {...props}
    errorType="recipe"
    fallbackMessage="Unable to load recipe builder. Please try again."
  >
    {children}
  </SafetyWrapper>
);

export const DebugSafetyWrapper = ({ children, ...props }: Omit<SafetyWrapperProps, 'errorType'>) => (
  <SafetyWrapper
    {...props}
    errorType="debug"
    fallbackMessage="Debug panel encountered an error."
    autoRetry={false}
    maxRetries={1}
  >
    {children}
  </SafetyWrapper>
);

export default SafetyWrapper;