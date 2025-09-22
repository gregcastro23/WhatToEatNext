/**
 * Live Planetary Tracker - Phase 26 Real-Time Feature
 *
 * Demonstrates real-time planetary hour tracking using our production WebSocket infrastructure.
 * Features live updates, beautiful visualizations, and responsive mobile design.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAlchmWebSocket } from '@/hooks/useAlchmWebSocket';
import { getPlanetaryInfluencers } from '@/calculations/elementalcalculations';
import { logger } from '@/lib/logger';

interface PlanetaryDisplayData {
  planet: string;
  influence: number;
  timeRemaining: string;
  energyType: string;
  recommendations: string[];
  color: string;
  icon: string;
}

const PLANETARY_DATA = {
  Sun: { color: 'from-orange-400 to-yellow-500', icon: '☀️', energyType: 'Vitality & Leadership' },
  Moon: { color: 'from-blue-300 to-indigo-400', icon: '🌙', energyType: 'Intuition & Emotion' },
  Mars: { color: 'from-red-500 to-orange-600', icon: '♂️', energyType: 'Action & Courage' },
  Mercury: { color: 'from-yellow-400 to-green-400', icon: '☿', energyType: 'Communication & Learning' },
  Jupiter: { color: 'from-purple-500 to-blue-600', icon: '♃', energyType: 'Expansion & Wisdom' },
  Venus: { color: 'from-pink-400 to-rose-500', icon: '♀', energyType: 'Love & Beauty' },
  Saturn: { color: 'from-gray-600 to-blue-800', icon: '♄', energyType: 'Structure & Discipline' }
};

export const LivePlanetaryTracker: React.FC = () => {
  const { isConnected, lastPlanetaryHour, lastEnergyUpdate } = useAlchmWebSocket()
  const [planetaryData, setPlanetaryData] = useState<PlanetaryDisplayData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate planetary influence and display data
  const updatePlanetaryDisplay = async () => {
    try {
      const influence = await getPlanetaryInfluence()
      const currentTime = new Date()

      // Calculate time remaining in current planetary hour (approximately 1 hour)
      const hourStart = new Date(currentTime)
      hourStart.setMinutes(0, 0, 0)
      const nextHour = new Date(hourStart.getTime() + 60 * 60 * 1000)
      const timeRemaining = Math.max(0, nextHour.getTime() - currentTime.getTime())

      const minutes = Math.floor(timeRemaining / (1000 * 60))
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000)

      const planetData = PLANETARY_DATA[influence.dominantPlanet as keyof typeof PLANETARY_DATA] ||
                        PLANETARY_DATA.Sun;

      setPlanetaryData({
        planet: influence.dominantPlanet,
        influence: influence.strength,
        timeRemaining: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        energyType: planetData.energyType,
        recommendations: generateRecommendations(influence.dominantPlanet),
        color: planetData.color,
        icon: planetData.icon
      })

      setIsLoading(false)
    } catch (error) {
      logger.error('Error updating planetary display', error)
      setIsLoading(false)
    }
  };

  // Generate contextual recommendations based on current planetary influence
  const generateRecommendations = (planet: string): string[] => {
    const recommendations: Record<string, string[]> = {
      Sun: ['Golden turmeric dishes', 'Citrus-based recipes', 'Grilled or roasted foods'],
      Moon: ['Cooling cucumber dishes', 'Dairy-based recipes', 'Silver/white colored foods'],
      Mars: ['Spicy chili dishes', 'Red meat preparations', 'High-energy protein foods'],
      Mercury: ['Light salads', 'Herb-infused dishes', 'Quick-cooking methods'],
      Jupiter: ['Rich, abundant meals', 'Purple foods', 'Celebration-worthy dishes'],
      Venus: ['Sweet desserts', 'Beautiful plated foods', 'Rose or floral ingredients'],
      Saturn: ['Slow-cooked stews', 'Root vegetables', 'Traditional comfort foods']
    };

    return recommendations[planet] || recommendations.Sun;
  };

  // Real-time updates
  useEffect(() => {
    updatePlanetaryDisplay()

    // Update every minute for accurate time remaining
    const interval = setInterval(updatePlanetaryDisplay, 60000)

    return () => clearInterval(interval)
  }, [])

  // Handle WebSocket updates
  useEffect(() => {
    if (lastPlanetaryHour) {
      logger.info('Received live planetary hour update', lastPlanetaryHour)
      updatePlanetaryDisplay()
    }
  }, [lastPlanetaryHour])

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!planetaryData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-gray-500">Unable to load planetary data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Connection Status */}
      <div className="mb-4 flex items-center justify-center">
        <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {isConnected ? 'Live Updates Active' : 'Offline Mode'}
        </div>
      </div>

      {/* Main Planetary Display */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${planetaryData.color} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl" role="img" aria-label={planetaryData.planet}>
                {planetaryData.icon}
              </span>
              <div>
                <h2 className="text-2xl font-bold">Current Planetary Hour</h2>
                <p className="text-white/90">{planetaryData.planet}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono font-bold">{planetaryData.timeRemaining}</div>
              <div className="text-white/90 text-sm">remaining</div>
            </div>
          </div>
        </div>

        {/* Planetary Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Influence Strength */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Influence Strength</h3>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className={`bg-gradient-to-r ${planetaryData.color} h-4 rounded-full transition-all duration-1000`}
                    style={{ width: `${planetaryData.influence * 100}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-2xl font-bold text-gray-800">
                  {(planetaryData.influence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Energy Type */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Energy Type</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-xl font-medium text-gray-800">
                  {planetaryData.energyType}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Optimal for {planetaryData.planet.toLowerCase()} energy activities
                </div>
              </div>
            </div>
          </div>

          {/* Culinary Recommendations */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🍳 Recommended Cooking Focus
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {planetaryData.recommendations.map((rec, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-gray-800">{rec}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Update Indicator */}
          {lastPlanetaryHour && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>Live Update:</strong> Last received at{' '}
                {new Date(lastPlanetaryHour.timestamp).toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Cooking Suggestions Call-to-Action */}
          <div className="mt-6 text-center">
            <button className={`px-6 py-3 bg-gradient-to-r ${planetaryData.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200`}>
              Get {planetaryData.planet} Recipes 🔮
            </button>
          </div>
        </div>
      </div>

      {/* Phase 26 Feature Note */}
      <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
        <div className="text-sm text-purple-800">
          <strong>Phase 26 Feature:</strong> Live planetary tracking with WebSocket integration.{' '}
          {isConnected ? 'Receiving real-time updates from backend services.' : 'Using cached data in offline mode.'}
        </div>
      </div>
    </div>
  )
};

export default LivePlanetaryTracker;