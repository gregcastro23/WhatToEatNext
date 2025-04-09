'use client'

import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorFallback } from '@/components/errors/ErrorFallback'
import { StateDebugger } from '@/components/debug/StateDebugger'
import { RecoveryProvider } from '@/providers/RecoveryProvider'

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