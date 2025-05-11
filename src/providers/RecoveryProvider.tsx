'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createLogger } from '@/utils/logger'

const logger = createLogger('RecoveryProvider')

interface RecoveryContextType {
  recover: (id: string) => void
  registerRecoverable: (id: string, callback: () => void) => void
  unregisterRecoverable: (id: string) => void
  isRecovering: boolean
  lastRecoveredId: string | null
}

const RecoveryContext = createContext<RecoveryContextType>({
  recover: () => {},
  registerRecoverable: () => {},
  unregisterRecoverable: () => {},
  isRecovering: false,
  lastRecoveredId: null
})

export const useRecovery = () => useContext(RecoveryContext)

interface RecoveryProviderProps {
  children: React.ReactNode
}

export function RecoveryProvider({ children }: RecoveryProviderProps) {
  const [recoverables, setRecoverables] = useState<Record<string, () => void>>({})
  const [isRecovering, setIsRecovering] = useState(false)
  const [lastRecoveredId, setLastRecoveredId] = useState<string | null>(null)

  const registerRecoverable = (id: string, callback: () => void) => {
    setRecoverables(prev => ({
      ...prev,
      [id]: callback
    }))
    logger.debug(`Registered recoverable: ${id}`)
  }

  const unregisterRecoverable = (id: string) => {
    setRecoverables(prev => {
      const newRecoverables = { ...prev }
      delete newRecoverables[id]
      return newRecoverables
    })
    logger.debug(`Unregistered recoverable: ${id}`)
  }

  const recover = (id: string) => {
    logger.info(`Attempting recovery for: ${id}`)
    const callback = recoverables[id]
    
    if (callback) {
      setIsRecovering(true)
      setLastRecoveredId(id)
      
      try {
        callback()
        logger.info(`Recovery for ${id} triggered`)
      } catch (error) {
        logger.error(`Recovery for ${id} failed`, error)
      } finally {
        // Reset recovery state after a short delay
        setTimeout(() => {
          setIsRecovering(false)
        }, 100)
      }
    } else {
      logger.warn(`No recovery callback found for: ${id}`)
    }
  }

  // Expose the context value
  const contextValue = {
    recover,
    registerRecoverable,
    unregisterRecoverable,
    isRecovering,
    lastRecoveredId
  }

  return (
    <RecoveryContext.Provider value={contextValue}>
      {children}
    </RecoveryContext.Provider>
  )
} 