'use client'

import { useEffect, useState } from 'react'
import { useAlchemical } from '@/contexts/AlchemicalContext/hooks'
import { logger } from '@/utils/logger';
import { PlanetaryHourCalculator } from '@/lib/PlanetaryHourCalculator'
import { getCurrentSeason, getTimeOfDay } from '@/utils/dateUtils';

export function StateDebugger() {
  const { state, planetaryPositions } = useAlchemical()
  const [mounted, setMounted] = useState(false)
  const [renderCount, setRenderCount] = useState(0)
  const [planetaryHour, setPlanetaryHour] = useState('Unknown')
  const [lunarPhase, setLunarPhase] = useState('Unknown')
  const [currentSeason, setCurrentSeason] = useState('Unknown')
  const [timeOfDay, setTimeOfDay] = useState('Unknown')
  const [currentZodiac, setCurrentZodiac] = useState('Unknown')

  useEffect(() => {
    setMounted(true)
    logger.info('StateDebugger mounted')
    
    // Calculate current season and time of day
    try {
      const season = getCurrentSeason();
      const time = getTimeOfDay();
      setCurrentSeason(season.charAt(0).toUpperCase() + season.slice(1));
      setTimeOfDay(time.charAt(0).toUpperCase() + time.slice(1));
    } catch (error) {
      console.error('Error calculating season/time:', error);
      setCurrentSeason('Unknown');
      setTimeOfDay('Unknown');
    }
    
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
    
    // Calculate current lunar phase and zodiac using astrologize API
    const fetchAstrologicalData = async () => {
      try {
        const response = await fetch('/api/astrologize')
        if (response.ok) {
          const data = await response.json()
          
          // Extract current zodiac sign from Sun position
          if (data?._celestialBodies?.sun || data?.sun) {
            const sunData = data._celestialBodies?.sun || data.sun
            const sunDegree = sunData?.ChartPosition?.Ecliptic?.DecimalDegrees || 
                            sunData?.eclipticPosition?.longitude || 
                            sunData?.longitude || 0
            
            // Calculate zodiac sign based on sun position
            const zodiacSigns = [
              'Aries', 'Taurus', 'Gemini', 'Cancer', 
              'Leo', 'Virgo', 'Libra', 'Scorpio',
              'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
            ]
            const signIndex = Math.floor(sunDegree / 30) % 12
            const zodiacSign = zodiacSigns[signIndex] || 'Unknown'
            setCurrentZodiac(zodiacSign)
          } else {
            // Fallback: use current date to determine zodiac
            const now = new Date()
            const month = now.getMonth() + 1 // 1-12
            const day = now.getDate()
            
            let zodiacSign = 'Unknown'
            if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) zodiacSign = 'Aries'
            else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) zodiacSign = 'Taurus'
            else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) zodiacSign = 'Gemini'
            else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) zodiacSign = 'Cancer'
            else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) zodiacSign = 'Leo'
            else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) zodiacSign = 'Virgo'
            else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) zodiacSign = 'Libra'
            else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) zodiacSign = 'Scorpio'
            else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) zodiacSign = 'Sagittarius'
            else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) zodiacSign = 'Capricorn'
            else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) zodiacSign = 'Aquarius'
            else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) zodiacSign = 'Pisces'
            
            setCurrentZodiac(zodiacSign)
          }
          
          // Extract lunar phase from API response
          if (data?._celestialBodies?.moon || data?.moon) {
            const moonData = data._celestialBodies?.moon || data.moon
            const moonDegree = moonData?.ChartPosition?.Ecliptic?.DecimalDegrees || 
                             moonData?.eclipticPosition?.longitude || 
                             moonData?.longitude || 0
            
            // Calculate lunar phase based on moon-sun angular separation
            const sunDegree = (data._celestialBodies?.sun || data.sun)?.ChartPosition?.Ecliptic?.DecimalDegrees || 0
            const angularSeparation = Math.abs(moonDegree - sunDegree) % 360
            
            let phaseName = 'new moon'
            if (angularSeparation < 22.5) phaseName = 'new moon'
            else if (angularSeparation < 67.5) phaseName = 'waxing crescent'
            else if (angularSeparation < 112.5) phaseName = 'first quarter'
            else if (angularSeparation < 157.5) phaseName = 'waxing gibbous'
            else if (angularSeparation < 202.5) phaseName = 'full moon'
            else if (angularSeparation < 247.5) phaseName = 'waning gibbous'
            else if (angularSeparation < 292.5) phaseName = 'last quarter'
            else if (angularSeparation < 337.5) phaseName = 'waning crescent'
            else phaseName = 'new moon'
            
            setLunarPhase(phaseName)
          } else {
            // Fallback: calculate lunar phase from current date
            const now = new Date()
            const lunationLength = 29.53058867 // Average lunar month in days
            const referenceNewMoon = new Date('2024-01-11T11:57:00Z') // Known new moon
            const daysSinceReference = (now.getTime() - referenceNewMoon.getTime()) / (1000 * 60 * 60 * 24)
            const lunarCycle = (daysSinceReference % lunationLength) / lunationLength
            
            let phaseName = 'new moon'
            if (lunarCycle < 0.0625) phaseName = 'new moon'
            else if (lunarCycle < 0.1875) phaseName = 'waxing crescent'
            else if (lunarCycle < 0.3125) phaseName = 'first quarter'
            else if (lunarCycle < 0.4375) phaseName = 'waxing gibbous'
            else if (lunarCycle < 0.5625) phaseName = 'full moon'
            else if (lunarCycle < 0.6875) phaseName = 'waning gibbous'
            else if (lunarCycle < 0.8125) phaseName = 'last quarter'
            else if (lunarCycle < 0.9375) phaseName = 'waning crescent'
            else phaseName = 'new moon'
            
            setLunarPhase(phaseName)
          }
        } else {
          setLunarPhase('API error')
          setCurrentZodiac('API error')
        }
      } catch (error) {
        console.error('Error fetching astrological data from API:', error)
        setLunarPhase('API unavailable')
        setCurrentZodiac('API unavailable')
      }
    }
    
    fetchAstrologicalData()
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
    spiritValue = (state.astrologicalState.alchemicalValues as any)?.Spirit || 0
    essenceValue = (state.astrologicalState.alchemicalValues as any)?.Essence || 0
    matterValue = (state.astrologicalState.alchemicalValues as any)?.Matter || 0
    substanceValue = (state.astrologicalState.alchemicalValues as any)?.Substance || 0
  }
  
  // Token symbol for display
  const tokenSymbol = '⦿'

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/85 text-white rounded-lg text-xs max-w-sm max-h-96 overflow-auto shadow-lg border border-gray-600">
      <h3 className="font-bold mb-2 text-indigo-300">🔮 Debug Info</h3>
      <div className="space-y-3">
        {/* System Status */}
        <div>
          <p className="text-gray-300"><span className="text-green-400">✓</span> Mounted: {String(mounted)}</p>
          <p className="text-gray-300">🔄 Renders: {renderCount}</p>
        </div>
        
        {/* Time & Environment */}
        <div>
          <p className="font-semibold text-yellow-300 mb-1">⏰ Time & Environment</p>
          <p className="text-gray-300">🌍 Season: {currentSeason}</p>
          <p className="text-gray-300">🕐 Time: {timeOfDay}</p>
          <p className="text-gray-300">⭐ Sign: {currentZodiac}</p>
          <p className="text-gray-300">🪐 Hour: {planetaryHour}</p>
          <p className="text-gray-300">🌙 Phase: {lunarPhase}</p>
        </div>
        
        {/* Alchemical Properties */}
        <div>
          <p className="font-semibold text-purple-300 mb-1">⚗️ Alchemical Tokens</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>{tokenSymbol} Spirit: <span className="text-red-300">{spiritValue.toFixed(3)}</span></div>
            <div>{tokenSymbol} Essence: <span className="text-blue-300">{essenceValue.toFixed(3)}</span></div>
            <div>{tokenSymbol} Matter: <span className="text-green-300">{matterValue.toFixed(3)}</span></div>
            <div>{tokenSymbol} Substance: <span className="text-yellow-300">{substanceValue.toFixed(3)}</span></div>
          </div>
        </div>
        
        {/* Elemental Balance */}
        <div>
          <p className="font-semibold text-orange-300 mb-1">🔥 Elemental Balance</p>
          <div className="space-y-1">
            {Object.entries(state.elementalPreference || {}).map(([element, value]) => {
              const percentage = (value * 100).toFixed(1);
              const color = {
                Fire: 'text-red-400',
                Water: 'text-blue-400', 
                Earth: 'text-green-400',
                Air: 'text-purple-400'
              }[element] || 'text-gray-400';
              
              const icon = {
                Fire: '🔥',
                Water: '💧',
                Earth: '🌍',
                Air: '💨'
              }[element] || '⚪';
              
              return (
                <div key={element} className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>{icon}</span>
                    <span className={color}>{element}:</span>
                  </span>
                  <span className={`${color} font-mono`}>{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Additional Info */}
        {state.currentEnergy && (
          <div>
            <p className="font-semibold text-cyan-300 mb-1">⚡ Energy State</p>
            <p className="text-gray-300">Current: {typeof state.currentEnergy === 'number' ? (state.currentEnergy as number).toFixed(2) : 'Unknown'}</p>
          </div>
        )}
      </div>
    </div>
  )
} 