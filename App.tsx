import React, { Suspense } from 'react';
import { AlchemicalProvider } from './src/contexts/AlchemicalContext';
import ErrorBoundary from './src/components/error-boundaries/ErrorBoundary';
import MainPageLayout from './src/components/layout/MainPageLayout';
import { logger } from './src/utils/logger';

// Loading fallback component for the main page
const MainPageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-indigo-900 mb-2">Loading Astrological Data</h2>
      <p className="text-indigo-600">Calculating current celestial energies...</p>
    </div>
  </div>
);

// Global error fallback for the entire app
const AppErrorFallback: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="text-red-500 mb-4">
        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h1>
      <p className="text-gray-600 mb-6">
        We encountered an unexpected error while loading the application. 
        This has been logged and we're working to fix it.
      </p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
        >
          Reload Page
        </button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-red-600 font-medium">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
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
      fallback={(error) => (
        <AppErrorFallback 
          error={error} 
          onRetry={() => window.location.reload()} 
        />
      )}
      onError={(error, errorInfo) => {
        logger.error('Global app error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack
        });
      }}
    >
      <AlchemicalProvider>
        <Suspense fallback={<MainPageLoadingFallback />}>
          <MainPageLayout 
            debugMode={process.env.NODE_ENV === 'development'}
            loading={false}
            onSectionNavigate={(sectionId) => {
              logger.debug('Section navigation:', sectionId);
            }}
          />
        </Suspense>
      </AlchemicalProvider>
    </ErrorBoundary>
  );
}

export default App; 