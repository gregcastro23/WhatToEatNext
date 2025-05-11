'use client'

import ErrorBoundary from '@/components/ErrorBoundary'
import ErrorFallback from '@/components/errors/ErrorFallback' 
import StateDebugger from '@/components/debug/StateDebugger'
import { RecoveryProvider } from '@/providers/RecoveryProvider'
import { PopupProvider } from '@/contexts/PopupContext'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <RecoveryProvider>
        <PopupProvider>
          {children}
          {process.env.NODE_ENV === 'development' && <StateDebugger />}
        </PopupProvider>
      </RecoveryProvider>
    </ErrorBoundary>
  )
} 