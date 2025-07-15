/**
 * Swiss Ephemeris Demo Component
 * 
 * Demonstrates the Swiss Ephemeris integration with real-time data display
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getEnhancedPlanetaryPositions, getSeasonalRecommendations, getTransitAnalysis } from '@/services/EnhancedAstrologyService';
import { swissEphemerisService } from '@/services/SwissEphemerisService';
import { getTransitForDate } from '@/data/transits/comprehensiveTransitDatabase';

interface SwissEphemerisDemoProps {
  className?: string;
}

export default function SwissEphemerisDemo({ className = '' }: SwissEphemerisDemoProps) {
  const [enhancedData, setEnhancedData] = useState<unknown>(null);
  const [seasonalRecs, setSeasonalRecs] = useState<unknown>(null);
  const [transitAnalysis, setTransitAnalysis] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load enhanced planetary positions
      const enhanced = await getEnhancedPlanetaryPositions(selectedDate);
      setEnhancedData(enhanced);

      // Load seasonal recommendations
      const seasonal = await getSeasonalRecommendations(selectedDate);
      setSeasonalRecs(seasonal);

      // Load transit analysis
      const transit = await getTransitAnalysis(selectedDate);
      setTransitAnalysis(transit);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPosition = (position: unknown) => {
    if (!position) return 'N/A';
    return `${position.sign} ${position.degree?.toFixed(1)}° (${position.exactLongitude?.toFixed(1)}°)${position.isRetrograde ? ' R' : ''}`;
  };

  const formatElementPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
        <h2 className="text-2xl font-bold mb-4">Swiss Ephemeris Integration Demo</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading astronomical data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
        <h2 className="text-2xl font-bold mb-4">Swiss Ephemeris Integration Demo</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={loadData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Swiss Ephemeris Integration Demo</h2>
      
      {/* Date Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date:
        </label>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-600 mt-1">
          Analyzing data for: {formatDate(selectedDate)}
        </p>
      </div>

      {/* Data Source Information */}
      {enhancedData && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Data Source Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Source:</span> {enhancedData.dataSource}
            </div>
            <div>
              <span className="font-medium">Confidence:</span> {(enhancedData.confidence * 100).toFixed(1)}%
            </div>
            <div>
              <span className="font-medium">Sidereal Time:</span> {enhancedData.siderealTime || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span> {enhancedData.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {/* Planetary Positions */}
      {enhancedData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Planetary Positions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(enhancedData.planetaryPositions).map(([planet, position]: [string, any]) => (
              <div key={planet} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{planet}:</span>
                <span className="text-sm">{formatPosition(position)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elemental Analysis */}
      {enhancedData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Elemental Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(enhancedData.dominantElements).map(([element, value]: [string, number]) => (
              <div key={element} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-blue-600">{formatElementPercentage(value)}</div>
                <div className="text-sm text-gray-600">{element}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seasonal Recommendations */}
      {seasonalRecs && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Seasonal Recommendations</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Seasonal Themes:</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalRecs.seasonalThemes?.map((theme: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Culinary Influences:</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalRecs.culinaryInfluences?.map((influence: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {influence}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Recommended Cuisines:</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalRecs.recommendedCuisines?.map((cuisine: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">Cooking Methods:</h4>
              <div className="flex flex-wrap gap-2">
                {seasonalRecs.recommendedCookingMethods?.map((method: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transit Analysis */}
      {transitAnalysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Transit Analysis</h3>
          <div className="space-y-4">
            {transitAnalysis.currentSeason && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Current Season:</h4>
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium">{transitAnalysis.currentSeason.name}</div>
                  <div className="text-sm text-gray-600">
                    {transitAnalysis.currentSeason.sunSign} - {transitAnalysis.currentSeason.seasonalThemes?.join(', ')}
                  </div>
                </div>
              </div>
            )}

            {transitAnalysis.retrogradePlanets && transitAnalysis.retrogradePlanets.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Retrograde Planets:</h4>
                <div className="flex flex-wrap gap-2">
                  {transitAnalysis.retrogradePlanets.map((planet: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                      {planet} R
                    </span>
                  ))}
                </div>
              </div>
            )}

            {transitAnalysis.keyAspects && transitAnalysis.keyAspects.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Key Aspects:</h4>
                <div className="space-y-2">
                  {transitAnalysis.keyAspects.slice(0, 3).map((aspect: unknown, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded text-sm">
                      <div className="font-medium">
                        {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                      </div>
                      <div className="text-gray-600">{aspect.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Special Events */}
      {enhancedData && enhancedData.specialEvents && enhancedData.specialEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Special Events</h3>
          <div className="flex flex-wrap gap-2">
            {enhancedData.specialEvents.map((event: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {event}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={loadData}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
} 