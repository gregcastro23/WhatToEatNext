'use client'

import { ErrorBoundary } from '../errors/ErrorBoundary'
import { ErrorFallback } from '../errors/ErrorFallback'
import { StateDebugger } from '../debug/StateDebugger'
import { RecoveryProvider } from '../../providers/RecoveryProvider'
import { AlchemicalProvider } from '../../contexts/AlchemicalContext/provider'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RecoveryProvider>
        <AlchemicalProvider>
          {children}
          {process.env.NODE_ENV === 'development' && <StateDebugger />}
        </AlchemicalProvider>
      </RecoveryProvider>
    </ErrorBoundary>
  )
} 