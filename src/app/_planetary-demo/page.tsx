'use client';

import React from 'react';
import PlanetaryFoodRecommendations from '@/components/PlanetaryFoodRecommendations';
import PlanetaryPowerWidget from '@/components/PlanetaryPowerWidget';

export default function PlanetaryDemoPage() {
  return (<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 Planetary Agents Integration
          </h1>
          <p className="text-xl text-gray-600">
            Real-time celestial data enhancing culinary recommendations
          </p>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">
                Connected to Planetary Agents Backend
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Port 8000 • Real-time Updates Active
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Planetary Power Widgets */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Celestial Status</h2>

            {/* Full Widget */}
            <PlanetaryPowerWidget />

            {/* Compact Widget Examples */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Compact Display Options
              </h3>
              <div className="space-y-2">
                <PlanetaryPowerWidget compact />
                <div className="text-xs text-gray-500 mt-2">
                  Perfect for headers or sidebars
                </div>
              </div>
            </div>

            {/* Location Examples */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Multiple Locations
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Los Angeles</div>
                  <PlanetaryPowerWidget
                    location={{ lat: 34.0522, lon: -118.2437 }}
                    compact
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">London</div>
                  <PlanetaryPowerWidget
                    location={{ lat: 51.5074, lon: -0.1278 }}
                    compact
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Tokyo</div>
                  <PlanetaryPowerWidget
                    location={{ lat: 35.6762, lon: 139.6503 }}
                    compact
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Columns - Food Recommendations */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Planetary Food Guidance</h2>

            {/* Default Recommendations */}
            <PlanetaryFoodRecommendations className="mb-6" />

            {/* Cuisine-Specific Recommendations */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Filtered by Cuisine Preference</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-2">Italian Focus</div>
                  <PlanetaryFoodRecommendations
                    cuisinePreferences={['Italian']}
                    className="border"
                  />
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Asian Cuisines</div>
                  <PlanetaryFoodRecommendations
                    cuisinePreferences={['Japanese', 'Thai', 'Chinese']}
                    className="border"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Examples */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Integration Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Component Usage</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import PlanetaryPowerWidget from '@/components/PlanetaryPowerWidget',
import PlanetaryFoodRecommendations from '@/components/PlanetaryFoodRecommendations',

// Basic usage
<PlanetaryPowerWidget />

// With location
<PlanetaryPowerWidget
  location={{ lat: 40.7128, lon: -74.0060 }}
  compact={true}
/>

// Food recommendations
<PlanetaryFoodRecommendations
  cuisinePreferences={['Italian']}
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Hook Usage</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import { usePlanetaryKinetics } from '@/hooks/usePlanetaryKinetics',

const MyComponent = () => {
  const {
    kinetics,
    currentPowerLevel,
    dominantElement,
    refreshKinetics
  } = usePlanetaryKinetics({
    location: { lat: 40.7128, lon: -74.0060 }
  });

  return (
    <div>
      Power: {currentPowerLevel},
      Element: {dominantElement}
    </div>
  );
};`}
              </pre>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Real-time Data</h3>
            <p className="text-sm text-gray-600">
              Live planetary positions and transitions updated every 5 minutes
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Personalized</h3>
            <p className="text-sm text-gray-600">
              Location-based calculations for accurate celestial influence
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="font-semibold mb-2">Food Harmony</h3>
            <p className="text-sm text-gray-600">
              Cuisine and ingredient recommendations aligned with planetary hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}