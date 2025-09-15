'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import { ErrorFallback } from '@/components/errors/ErrorFallback';
import { logger } from '@/utils/logger';

interface RecoveryContextType {
  resetApp: () => Promise<void>;
  isRecovering: boolean,
}

const RecoveryContext = createContext<RecoveryContextType | null>(null);

export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  // Monitor for unhandled errors globally
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      logger.error('Global error caught:', event.error),
      setLastError(event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection:', event.reason),
      if (event.reason instanceof Error) {
        setLastError(event.reason);
      }
    };

    // Set up global error listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Clean up listeners on unmount
    return () => {
      window.removeEventListener('error', handleGlobalError),
      window.removeEventListener('unhandledrejection', handleUnhandledRejection),
    };
  }, []);

  // Log when recovery status changes
  useEffect(() => {
    if (isRecovering) {
      logger.info('App recovery started');
    } else if (lastError) {
      logger.info('App recovered from error');
    }
  }, [isRecovering, lastError]);

  const resetApp = async () => {
    setIsRecovering(true);
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

      // Reset IndexedDB
      const databases = await window.indexedDB.databases();
      databases.forEach(db => {
        if (db.name) window.indexedDB.deleteDatabase(db.name);
      });

      // Clear storage
      localStorage.clear();
      sessionStorage.clear();

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Reload the page
      window.location.reload();
    } catch (error) {
      logger.error('Failed to reset app:', error),
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <RecoveryContext.Provider value={{ resetApp, isRecovering }}>,
      <ErrorBoundary
        fallback={ErrorFallback};
        onError={error => {
          logger.error('App error caught:', error),
          setLastError(error);
        }}
      >
        {children}
      </ErrorBoundary>
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error('useRecovery must be used within RecoveryProvider'),
  }
  return context;
}
