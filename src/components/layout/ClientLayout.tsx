'use client'

import @/components  from 'errors '
import @/components  from 'errors '
import @/components  from 'debug '
import @/providers  from 'RecoveryProvider '
import @/contexts  from 'AlchemicalContext '

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