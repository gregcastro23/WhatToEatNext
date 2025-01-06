'use client'

import { ErrorBoundary } from '@/components/errors/ErrorBoundary'
import { ErrorFallback } from '@/components/errors/ErrorFallback'
import { StateDebugger } from '@/components/debug/StateDebugger'
import { RecoveryProvider } from '@/providers/RecoveryProvider'
import { AlchemicalProvider } from '@/contexts/AlchemicalContext'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface ClientProvidersProps {
  children: React.ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <RecoveryProvider>
          <AlchemicalProvider>
            {children}
            {process.env.NODE_ENV === 'development' && <StateDebugger />}
          </AlchemicalProvider>
        </RecoveryProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
} 