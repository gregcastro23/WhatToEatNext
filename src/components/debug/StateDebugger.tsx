'use client'

import { useEffect, useState } from 'react'
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks'
import { logger } from '@/utils/logger'
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator'
import { calculateLunarPhase, getLunarPhaseName } from '@/utils/astrologyUtils'

export function StateDebugger() {
  const { state, planetaryPositions } = useAlchemical()
  const [mounted, setMounted] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [planetaryHour, setPlanetaryHour] = useState('Unknown')
  const [lunarPhase, setLunarPhase] = useState('Unknown')

  useEffect(() => {
    setMounted(true)
    logger.info('StateDebugger mounted')
    
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
      setPlanetaryHour('Unknown')
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
          setLunarPhase('Unknown')
        })
      } else {
        const phaseName = getLunarPhaseName(phaseValue)
        setLunarPhase(phaseName)
      }
    } catch (error) {
      console.error('Error calculating lunar phase:', error)
      setLunarPhase('Unknown')
    }
  }, [])

  useEffect(() => {
    setRenderCount(prev => prev + 1)
    logger.info('State updated:', {
      currentSeason: state.currentSeason,
      timeOfDay: state.timeOfDay,
      elementalBalance: state.elementalPreference,
      astrologicalState: state.astrologicalState,
      currentEnergy: state.currentEnergy,
    })
  }, [state])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Extract alchemical values if available
  let spiritValue = 0
  let essenceValue = 0
  let matterValue = 0
  let substanceValue = 0

  if (state.astrologicalState?.alchemicalValues) {
    spiritValue = state.astrologicalState.alchemicalValues.Spirit || 0
    essenceValue = state.astrologicalState.alchemicalValues.Essence || 0
    matterValue = state.astrologicalState.alchemicalValues.Matter || 0
    substanceValue = state.astrologicalState.alchemicalValues.Substance || 0
  }
  
  // Token symbol for display
  const tokenSymbol = '⦿'

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-xs max-w-sm overflow-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>
        <p>Mounted: {String(mounted)}</p>
        <p>Renders: {renderCount}</p>
        <p>Current Sign: {state.astrologicalState?.sunSign || 'unknown'}</p>
        <p>Planetary Hour: {planetaryHour}</p>
        <p>Lunar Phase: {lunarPhase}</p>
        <div>
          <p className="font-bold">Alchemical Tokens:</p>
          <ul className="pl-4">
            <li>{tokenSymbol} Spirit: {spiritValue.toFixed(4)}</li>
            <li>{tokenSymbol} Essence: {essenceValue.toFixed(4)}</li>
            <li>{tokenSymbol} Matter: {matterValue.toFixed(4)}</li>
            <li>{tokenSymbol} Substance: {substanceValue.toFixed(4)}</li>
          </ul>
        </div>
        <div>
          <p>Elemental Balance:</p>
          <ul className="pl-4">
            {Object.entries(state.elementalPreference || {}).map(([element, value]) => (
              <li key={element}>{element}: {(value * 100).toFixed(1)}%</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 