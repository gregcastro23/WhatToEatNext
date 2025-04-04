'use client'

import { ThemeProvider } from '@/contexts/ThemeContext'
import { AlchemicalProvider } from '@/contexts/AlchemicalContext/provider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AlchemicalProvider>
          {children}
        </AlchemicalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}