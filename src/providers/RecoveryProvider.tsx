'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { logger } from '@/utils/logger'

interface RecoveryContextType {
  resetApp: () => Promise<void>
  isRecovering: boolean
}

const RecoveryContext = createContext<RecoveryContextType | null>(null)

export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const [isRecovering, setIsRecovering] = useState(false)

  const resetApp = async () => {
    setIsRecovering(true)
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheKeys = await caches.keys()
        await Promise.all(cacheKeys.map(key => caches.delete(key)))
      }

      // Reset IndexedDB
      const databases = await window.indexedDB.databases()
      databases.forEach(db => {
        if (db.name) window.indexedDB.deleteDatabase(db.name)
      })

      // Clear storage
      localStorage.clear()
      sessionStorage.clear()

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reload the page
      window.location.reload()
    } catch (error) {
      logger.error('Failed to reset app:', error)
    } finally {
      setIsRecovering(false)
    }
  }

  return (
    <RecoveryContext.Provider value={{ resetApp, isRecovering }}>
      <ErrorBoundary
        maxRetries={3}
        retryDelay={1500}
        onError={(error) => {
          logger.error('App error caught:', error)
        }}
      >
        {children}
      </ErrorBoundary>
    </RecoveryContext.Provider>
  )
}

export function useRecovery() {
  const context = useContext(RecoveryContext)
  if (!context) {
    throw new Error('useRecovery must be used within RecoveryProvider')
  }
  return context
} 