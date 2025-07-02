'use client'

import { useEffect, useState } from 'react'
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks'
import { useAstrologicalState } from '@/context/AstrologicalContext'
import { logger } from '@/utils/logger'
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator'
import { calculateLunarPhase, getLunarPhaseName } from '@/utils/astrologyUtils'

export function StateDebugger() {
  // Use both contexts
  const alchemicalContext = useAlchemical()
  const astroState = useAstrologicalState()
  
  const [mounted, setMounted] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [planetaryHour, setPlanetaryHour] = useState('Unknown')
  const [lunarPhase, setLunarPhase] = useState('Unknown')
  const [contextStatus, setContextStatus] = useState({
    alchemical: false,
    astrological: false,
    errors: [] as string[]
  })

  // Add detailed debug state
  const [debugInfo, setDebugInfo] = useState({
    alchemicalStateExists: false,
    astrologicalStateExists: false,
    alchemicalValuesPath: 'none',
    elementalStatePath: 'none',
    rawState: null as unknown
  })

  useEffect(() => {
    setMounted(true)
    logger.info('StateDebugger mounted')
    
    // Check context availability and debug their structure
    const errors: string[] = []
    const status = {
      alchemical: !!alchemicalContext,
      astrological: !!astroState,
      errors
    }

    if (!alchemicalContext) {
      errors.push('AlchemicalContext not available')
    } else {
      logger.info('AlchemicalContext structure:', {
        hasState: !!alchemicalContext.state,
        stateKeys: alchemicalContext.state ? Object.keys(alchemicalContext.state) : [],
        alchemicalValues: alchemicalContext.state?.alchemicalValues,
        elementalState: alchemicalContext.state?.elementalState,
        astrologicalState: alchemicalContext.state?.astrologicalState
      })
    }
    
    if (!astroState) {
      errors.push('AstrologicalContext not available') 
    } else {
      logger.info('AstrologicalState structure:', {
        keys: Object.keys(astroState || {}),
        astroState
      })
    }

    setContextStatus(status)
    
    // Set debug info about data paths
    let alchemicalValuesPath = 'none'
    let elementalStatePath = 'none'
    
    if (alchemicalContext?.state?.alchemicalValues) {
      alchemicalValuesPath = 'alchemicalContext.state.alchemicalValues'
    } else if (alchemicalContext?.state?.astrologicalState?.alchemicalValues) {
      alchemicalValuesPath = 'alchemicalContext.state.astrologicalState.alchemicalValues'
    } else if ((astroState as Record<string, unknown>)?.alchemicalValues) {
      alchemicalValuesPath = 'astroState.alchemicalValues'
    }
    
    if (alchemicalContext?.state?.elementalState) {
      elementalStatePath = 'alchemicalContext.state.elementalState'
    } else if (alchemicalContext?.state?.elementalPreference) {
      elementalStatePath = 'alchemicalContext.state.elementalPreference'
    } else if ((astroState as Record<string, unknown>)?.elementalProperties) {
      elementalStatePath = 'astroState.elementalProperties'
    }
    
    setDebugInfo({
      alchemicalStateExists: !!alchemicalContext?.state,
      astrologicalStateExists: !!astroState,
      alchemicalValuesPath,
      elementalStatePath,
      rawState: alchemicalContext?.state
    })
    
    // Calculate current planetary hour
    try {
      const hourCalculator = new PlanetaryHourCalculator()
      
      // Check which method exists and use it
      if (typeof hourCalculator.getPlanetaryHour === 'function') {
        const currentHour = hourCalculator.getPlanetaryHour(new Date())
        setPlanetaryHour(currentHour.planet || 'Unknown')
      } else if (typeof hourCalculator.calculatePlanetaryHour === 'function') {
        const currentHour = hourCalculator.calculatePlanetaryHour(new Date())
        setPlanetaryHour(String(currentHour) || 'Unknown')
      } else {
        // Fallback to time of day if no method exists
        const hour = new Date().getHours()
        let timeBasedPlanet = 'Sun'
        
        if (hour >= 0 && hour < 3) timeBasedPlanet = 'Saturn'
        else if (hour >= 3 && hour < 6) timeBasedPlanet = 'Jupiter'
        else if (hour >= 6 && hour < 9) timeBasedPlanet = 'Mars'
        else if (hour >= 9 && hour < 12) timeBasedPlanet = 'Sun'
        else if (hour >= 12 && hour < 15) timeBasedPlanet = 'Venus'
        else if (hour >= 15 && hour < 18) timeBasedPlanet = 'Mercury'
        else if (hour >= 18 && hour < 21) timeBasedPlanet = 'Moon'
        else timeBasedPlanet = 'Saturn'
        
        setPlanetaryHour(timeBasedPlanet)
      }
    } catch (error) {
      console.error('Error calculating planetary hour:', error)
      setPlanetaryHour('Error')
      errors.push('Planetary hour calculation failed')
    }
    
    // Calculate current lunar phase
    try {
      const phaseValue = calculateLunarPhase(new Date())
      
      // Handle the value whether it's a promise or not
      if (phaseValue instanceof Promise) {
        phaseValue.then(value => {
          const phaseName = getLunarPhaseName(value)
          setLunarPhase(phaseName)
        }).catch(err => {
          console.error('Error calculating lunar phase:', err)
          setLunarPhase('Error')
          errors.push('Lunar phase calculation failed')
        })
      } else {
        const phaseName = getLunarPhaseName(phaseValue)
        setLunarPhase(phaseName)
      }
    } catch (error) {
      console.error('Error calculating lunar phase:', error)
      setLunarPhase('Error')
      errors.push('Lunar phase calculation failed')
    }

    setContextStatus({ ...status, errors })
  }, [alchemicalContext, astroState])

  useEffect(() => {
    setRenderCount(prev => prev + 1)
    logger.info('StateDebugger updated:', {
      renderCount: renderCount + 1,
      alchemicalState: alchemicalContext?.state,
      astrologicalState: astroState,
    })
  }, [alchemicalContext?.state, astroState])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Try to get alchemical values from multiple sources with better debugging
  let spiritValue = 0
  let essenceValue = 0
  let matterValue = 0
  let substanceValue = 0
  let valuesSource = 'fallback'

  // Try from alchemical context state first (most reliable)
  if (alchemicalContext?.state?.alchemicalValues) {
    const values = alchemicalContext.state.alchemicalValues as Record<string, unknown>
    spiritValue = (values?.Spirit) || 0
    essenceValue = (values?.Essence) || 0
    matterValue = (values?.Matter) || 0
    substanceValue = (values?.Substance) || 0
    valuesSource = 'alchemical-state'
  }
  // Try from nested astrological state
  else if (alchemicalContext?.state?.astrologicalState?.alchemicalValues) {
    const values = alchemicalContext.state.astrologicalState.alchemicalValues as Record<string, unknown>
    spiritValue = (values?.Spirit) || 0
    essenceValue = (values?.Essence) || 0
    matterValue = (values?.Matter) || 0
    substanceValue = (values?.Substance) || 0
    valuesSource = 'astro-nested'
  }
  // Fall back to astrological state directly
  else if ((astroState as Record<string, unknown>)?.alchemicalValues) {
    const values = (astroState as Record<string, unknown>).alchemicalValues
    spiritValue = (values?.Spirit) || 0
    essenceValue = (values?.Essence) || 0
    matterValue = (values?.Matter) || 0
    substanceValue = (values?.Substance) || 0
    valuesSource = 'astro-direct'
  }

  // Get current zodiac sign from multiple sources
  const currentSign = 
    alchemicalContext?.state?.astrologicalState?.sunSign ||
    alchemicalContext?.state?.astrologicalState?.currentZodiac ||
    (astroState as Record<string, unknown>)?.sunSign ||
    (astroState as Record<string, unknown>)?.currentZodiac ||
    'aries'

  // Get elemental preferences with better source tracking
  let elementalPreference = null
  let elementalSource = 'fallback'
  
  if (alchemicalContext?.state?.elementalState) {
    elementalPreference = alchemicalContext.state.elementalState
    elementalSource = 'elemental-state'
  } else if (alchemicalContext?.state?.elementalPreference) {
    elementalPreference = alchemicalContext.state.elementalPreference
    elementalSource = 'elemental-preference'
  } else if ((astroState as Record<string, unknown>)?.elementalProperties) {
    elementalPreference = (astroState as Record<string, unknown>).elementalProperties
    elementalSource = 'astro-elemental'
  } else {
    elementalPreference = { Fire: 0, Water: 0, Earth: 0, Air: 0 }
    elementalSource = 'no-data'
  }
  
  // Token symbol for display
  const tokenSymbol = '⦿'

  // Get status color based on context availability and data source
  const getStatusColor = () => {
    if (contextStatus.errors.length > 0) return 'bg-red-800/90'
    if (valuesSource === 'fallback' || elementalSource === 'hardcoded-fallback') return 'bg-orange-800/90'
    if (contextStatus.alchemical && contextStatus.astrological) return 'bg-green-800/90'
    if (contextStatus.alchemical || contextStatus.astrological) return 'bg-yellow-800/90'
    return 'bg-gray-800/90'
  }

  return (
    <div className={`fixed bottom-4 right-4 p-4 ${getStatusColor()} text-white rounded-lg text-xs max-w-sm overflow-auto shadow-xl border border-white/20`}>
      <h3 className="font-bold mb-2 text-blue-200">Debug Info</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Mounted:</span>
          <span className={mounted ? 'text-green-300' : 'text-red-300'}>{String(mounted)}</span>
        </div>
        <div className="flex justify-between">
          <span>Renders:</span>
          <span className="text-yellow-300">{renderCount}</span>
        </div>
        <div className="flex justify-between">
          <span>Current Sign:</span>
          <span className="text-purple-300">{currentSign}</span>
        </div>
        <div className="flex justify-between">
          <span>Planetary Hour:</span>
          <span className="text-orange-300">{planetaryHour}</span>
        </div>
        <div className="flex justify-between">
          <span>Lunar Phase:</span>
          <span className="text-blue-300">{lunarPhase}</span>
        </div>
        
        <div className="mt-3 pt-2 border-t border-white/20">
          <p className="font-bold text-yellow-200 mb-1">Alchemical Tokens:</p>
          <div className="text-xs text-gray-300 mb-1">Source: {valuesSource}</div>
          <div className="space-y-1 pl-2">
            <div className="flex justify-between">
              <span>{tokenSymbol} Spirit:</span>
              <span className="text-red-300">{spiritValue.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>{tokenSymbol} Essence:</span>
              <span className="text-blue-300">{essenceValue.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>{tokenSymbol} Matter:</span>
              <span className="text-green-300">{matterValue.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>{tokenSymbol} Substance:</span>
              <span className="text-purple-300">{substanceValue.toFixed(4)}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-white/20">
          <p className="font-bold text-yellow-200 mb-1">Elemental Balance:</p>
          <div className="text-xs text-gray-300 mb-1">Source: {elementalSource}</div>
          <div className="space-y-1 pl-2">
            {Object.entries(elementalPreference || {}).map(([element, value]) => (
              <div key={element} className="flex justify-between">
                <span>{element}:</span>
                <span className={
                  element === 'Fire' ? 'text-red-300' :
                  element === 'Water' ? 'text-blue-300' :
                  element === 'Earth' ? 'text-green-300' :
                  'text-purple-300'
                }>{((value as number) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-3 pt-2 border-t border-white/20">
          <div className="flex justify-between text-xs">
            <span>Contexts:</span>
            <span>
              <span className={contextStatus.alchemical ? 'text-green-300' : 'text-red-300'}>
                {contextStatus.alchemical ? '✓' : '✗'} Alch
              </span>
              {' '}
              <span className={contextStatus.astrological ? 'text-green-300' : 'text-red-300'}>
                {contextStatus.astrological ? '✓' : '✗'} Astro
              </span>
            </span>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-blue-400/40">
          <p className="font-bold text-blue-300 text-xs mb-1">Debug Paths:</p>
          <div className="text-xs space-y-1">
            <p className="text-blue-200">Values: {debugInfo.alchemicalValuesPath}</p>
            <p className="text-blue-200">Elements: {debugInfo.elementalStatePath}</p>
          </div>
        </div>
        
        {contextStatus.errors.length > 0 && (
          <div className="mt-2 pt-2 border-t border-red-400/40">
            <p className="font-bold text-red-300 text-xs mb-1">Errors:</p>
            {contextStatus.errors.map((error, index) => (
              <p key={index} className="text-red-200 text-xs">{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}