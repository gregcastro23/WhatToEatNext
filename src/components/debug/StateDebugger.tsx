'use client'

import { useEffect, useState } from 'react'
import { useAlchemical } from '@/contexts/AlchemicalContext'
import { logger } from '@/utils/logger'

export function StateDebugger() {
  const { state } = useAlchemical()
  const [mounted, setMounted] = useState(false)
  const [renderCount, setRenderCount] = useState(0)

  useEffect(() => {
    setMounted(true)
    logger.info('StateDebugger mounted')
  }, [])

  useEffect(() => {
    setRenderCount(prev => prev + 1)
    logger.info('State updated:', {
      loading: state.loading,
      recipesCount: state.recipes?.length,
      filteredCount: state.filteredRecipes?.length,
      error: state.error,
      renderCount: renderCount + 1
    })
  }, [state])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-sm overflow-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>
        <p>Mounted: {String(mounted)}</p>
        <p>Renders: {renderCount}</p>
        <p>Loading: {String(state.loading)}</p>
        <p>Recipes: {state.recipes?.length || 0}</p>
        <p>Filtered: {state.filteredRecipes?.length || 0}</p>
        <p>Error: {state.error || 'none'}</p>
      </div>
    </div>
  )
} 