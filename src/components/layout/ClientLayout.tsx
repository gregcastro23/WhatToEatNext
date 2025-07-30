'use client'

import React from 'react'

import { StateDebugger } from '@/components/debug/StateDebugger'
import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorFallback } from '@/components/errors/ErrorFallback'
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider'
import { RecoveryProvider } from '@/providers/RecoveryProvider'

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
          {process.env.NODE_ENV === 'development&apos; &amp;&amp; <StateDebugger />}
        </AlchemicalProvider>
      </RecoveryProvider>
    </ErrorBoundary>
  )
} 