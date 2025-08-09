import React, { Suspense } from 'react';
import { AlchemicalProvider } from './src/contexts/AlchemicalContext';
import ErrorBoundary from './src/components/error-boundaries/ErrorBoundary';
import MainPageLayout from './src/components/layout/MainPageLayout';
import { logger } from './src/utils/logger';

// Loading fallback component for the main page
const MainPageLoadingFallback: React.FC = () => (
  <div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100'>
    <div className='text-center'>
      <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600'></div>
      <h2 className='mb-2 text-xl font-semibold text-indigo-900'>Loading Astrological Data</h2>
      <p className='text-indigo-600'>Calculating current celestial energies...</p>
    </div>
  </div>
);

// Global error fallback for the entire app
const AppErrorFallback: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className='flex min-h-screen items-center justify-center bg-red-50 p-4'>
    <div className='w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg'>
      <div className='mb-4 text-red-500'>
        <svg className='mx-auto h-12 w-12' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h1 className='mb-4 text-2xl font-bold text-gray-900'>Application Error</h1>
      <p className='mb-6 text-gray-600'>
        We encountered an unexpected error while loading the application. This has been logged and
        we're working to fix it.
      </p>
      <div className='space-y-3'>
        <button
          onClick={onRetry}
          className='w-full rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700'
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className='w-full rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700'
        >
          Reload Page
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className='mt-4 text-left'>
          <summary className='cursor-pointer font-medium text-red-600'>
            Error Details (Development)
          </summary>
          <pre className='mt-2 overflow-auto rounded bg-red-100 p-2 text-xs'>
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

function App() {
  // Log app initialization
  React.useEffect(() => {
    logger.info('App initialized with MainPageLayout integration');
  }, []);

  return (
    <ErrorBoundary
      fallback={error => (
        <AppErrorFallback error={error} onRetry={() => window.location.reload()} />
      )}
      onError={(error, errorInfo) => {
        logger.error('Global app error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <AlchemicalProvider>
        <Suspense fallback={<MainPageLoadingFallback />}>
          <MainPageLayout
            debugMode={process.env.NODE_ENV === 'development'}
            loading={false}
            onSectionNavigate={sectionId => {
              logger.debug('Section navigation:', sectionId);
            }}
          />
        </Suspense>
      </AlchemicalProvider>
    </ErrorBoundary>
  );
}

export default App;
