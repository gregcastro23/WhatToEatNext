'use client'

import { ErrorBoundary } from '../errors/ErrorBoundary'
import { ErrorFallback } from '../errors/ErrorFallback'
import { StateDebugger } from '../debug/StateDebugger'
import { RecoveryProvider } from '../../providers/RecoveryProvider'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RecoveryProvider>
        {children}
        {process.env.NODE_ENV === 'development' && <StateDebugger />}
      </RecoveryProvider>
    </ErrorBoundary>
  )
} 