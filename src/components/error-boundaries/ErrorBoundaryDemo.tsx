'use client';

import React, { useState } from 'react';

import {
  SafetyWrapper,
  CuisineSafetyWrapper,
  IngredientSafetyWrapper,
  useErrorLogger,
  useComponentErrorLogger,
} from './index';

/**
 * Demo component to test error boundaries
 * This component intentionally throws errors to demonstrate error handling
 */
function ErrorThrowingComponent({ errorType }: { errorType: string }) {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    switch (errorType) {
      case 'render':
        throw new Error('Intentional render error for testing');
      case 'network':
        throw new Error('Network request failed - timeout');
      case 'data':
        throw new Error('Failed to parse JSON data');
      case 'state':
        // @ts-expect-error: Intentional error for testing
        return <div>{undefined.nonExistentProperty}</div>;
      default:
        throw new Error('Generic test error');
    }
  }

  return (
    <div className='rounded-lg border border-gray-200 p-4'>
      <h4 className='mb-2 font-medium'>Error Test Component ({errorType})</h4>
      <p className='mb-3 text-sm text-gray-600'>
        This component can throw different types of errors for testing.
      </p>
      <button
        onClick={() => setShouldThrow(true)}
        className='rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600'
      >
        Throw {errorType} Error
      </button>
    </div>
  );
}

/**
 * Component that uses error logging hooks
 */
function ErrorLoggingDemo() {
  const { logError, getMetrics } = useErrorLogger();
  const { logError: logComponentError, handleAsyncError } =
    useComponentErrorLogger('ErrorLoggingDemo');
  const [metrics, setMetrics] = useState(getMetrics());

  const handleManualError = () => {
    const error = new Error('Manually logged error for testing');
    logComponentError(error, 'manual test', 'medium');
    setMetrics(getMetrics());
  };

  const handleAsyncTest = async () => {
    await handleAsyncError(async () => {
      throw new Error('Async operation failed');
    }, 'async test');
    setMetrics(getMetrics());
  };

  return (
    <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
      <h4 className='mb-2 font-medium'>Error Logging Demo</h4>
      <div className='mb-3 space-y-2'>
        <div className='text-sm'>
          <span className='font-medium'>Total Errors:</span> {metrics.totalErrors}
        </div>
        <div className='text-sm'>
          <span className='font-medium'>Resolved:</span> {metrics.resolvedErrors}
        </div>
        <div className='text-sm'>
          <span className='font-medium'>Error Rate:</span> {metrics.errorRate.toFixed(2)}/min
        </div>
      </div>
      <div className='space-x-2'>
        <button
          onClick={handleManualError}
          className='rounded bg-blue-500 px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600'
        >
          Log Manual Error
        </button>
        <button
          onClick={handleAsyncTest}
          className='rounded bg-purple-500 px-3 py-1 text-sm text-white transition-colors hover:bg-purple-600'
        >
          Test Async Error
        </button>
      </div>
    </div>
  );
}

/**
 * Main demo component showcasing error boundary usage
 */
export function ErrorBoundaryDemo() {
  return (
    <div className='space-y-6 p-6'>
      <div>
        <h2 className='mb-4 text-2xl font-bold'>Error Boundary Demo</h2>
        <p className='mb-6 text-gray-600'>
          This demo shows how the error boundary system works with different types of errors. Each
          component is wrapped in its own error boundary for isolation.
        </p>
      </div>

      {/* Error Logging Demo */}
      <div>
        <h3 className='mb-3 text-lg font-semibold'>Error Logging System</h3>
        <ErrorLoggingDemo />
      </div>

      {/* Generic Safety Wrapper */}
      <div>
        <h3 className='mb-3 text-lg font-semibold'>Generic Safety Wrapper</h3>
        <SafetyWrapper
          componentName='GenericTestComponent'
          level='component'
          fallbackMessage='This component failed to load properly.'
        >
          <ErrorThrowingComponent errorType='render' />
        </SafetyWrapper>
      </div>

      {/* Cuisine Safety Wrapper */}
      <div>
        <h3 className='mb-3 text-lg font-semibold'>Cuisine Safety Wrapper</h3>
        <CuisineSafetyWrapper componentName='CuisineTestComponent' level='section'>
          <ErrorThrowingComponent errorType='network' />
        </CuisineSafetyWrapper>
      </div>

      {/* Ingredient Safety Wrapper */}
      <div>
        <h3 className='mb-3 text-lg font-semibold'>Ingredient Safety Wrapper</h3>
        <IngredientSafetyWrapper componentName='IngredientTestComponent' level='component'>
          <ErrorThrowingComponent errorType='data' />
        </IngredientSafetyWrapper>
      </div>

      {/* Multiple Components with Different Error Types */}
      <div>
        <h3 className='mb-3 text-lg font-semibold'>Multiple Components (Isolated)</h3>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <SafetyWrapper componentName='StateErrorTest' errorType='default' maxRetries={2}>
            <ErrorThrowingComponent errorType='state' />
          </SafetyWrapper>

          <SafetyWrapper componentName='GenericErrorTest' errorType='default' autoRetry={false}>
            <ErrorThrowingComponent errorType='generic' />
          </SafetyWrapper>
        </div>
      </div>

      {/* Working Component for Comparison */}
      <div>
        <h3 className='mb-3 text-lg font-semibold'>Working Component (No Errors)</h3>
        <SafetyWrapper componentName='WorkingComponent' level='component'>
          <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
            <h4 className='mb-2 font-medium'>Working Component</h4>
            <p className='text-sm text-green-700'>
              This component works normally and doesn't throw any errors.
            </p>
            <div className='mt-2'>
              <span className='inline-block rounded bg-green-200 px-2 py-1 text-xs text-green-800'>
                Status: Healthy
              </span>
            </div>
          </div>
        </SafetyWrapper>
      </div>
    </div>
  );
}

export default ErrorBoundaryDemo;
