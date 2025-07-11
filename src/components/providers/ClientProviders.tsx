'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorFallback } from '@/components/errors/ErrorFallback'
import { RecoveryProvider } from '@/providers/RecoveryProvider'

interface ClientProvidersProps {
  children: React.ReactNode
}

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: string;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <RecoveryProvider>
        {children}
      </RecoveryProvider>
    </ErrorBoundary>
  )
} 