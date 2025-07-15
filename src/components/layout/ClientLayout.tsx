'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorFallback } from '@/components/errors/ErrorFallback'
import { StateDebugger } from '@/components/debug/StateDebugger'
import { RecoveryProvider } from '@/providers/RecoveryProvider'
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider'

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: string;
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <RecoveryProvider>
        <AlchemicalProvider>
          {children}
          {process.env.NODE_ENV === 'development' && <StateDebugger />}
        </AlchemicalProvider>
      </RecoveryProvider>
    </ErrorBoundary>
  )
} 