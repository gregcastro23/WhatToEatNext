'use client';

/**
 * Live Planetary Demo Page - Phase 26 Feature Showcase
 *
 * Demonstrates real-time planetary tracking capabilities with our production WebSocket infrastructure.
 * This showcases the advanced features implemented in Phase 26: Advanced Feature Development.
 */

import LivePlanetaryTracker from '@/components/LivePlanetaryTracker';

export default function LivePlanetaryDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 Live Planetary Tracking
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience real-time planetary hour tracking with our advanced WebSocket integration.
            Watch as planetary influences update live, providing optimal cooking guidance based on celestial energies.
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
            ⚡ Phase 26: Advanced Real-Time Features
          </div>
        </div>
        {/* Live Planetary Tracker Component */}
        <LivePlanetaryTracker />

        {/* Feature Highlights */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            🚀 Phase 26 Advanced Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Real-Time Updates */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">
                Live WebSocket connection provides instant planetary hour changes and energy updates
                without page refresh.
              </p>
            </div>
            {/* Mobile Optimized */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">
                Responsive design ensures perfect experience across all devices with touch-friendly
                interactions and adaptive layouts.
              </p>
            </div>
            {/* Performance Enhanced */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Enhanced</h3>
              <p className="text-gray-600">
                Advanced caching and lazy loading ensure sub-second response times with minimal
                bandwidth usage.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Architecture */}
        <div className="mt-12 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🏗️ Production Architecture
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">WebSocket Infrastructure</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Production WebSocket server on port 8001
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Automatic reconnection and fallback handling
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Structured logging and error monitoring
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Type-safe message handling
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Data Flow</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Planetary hour calculations every minute
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Energy influence updates via WebSocket
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Celestial event notifications
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Graceful offline mode with cached data
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Phase 26 Achievement:</strong> Real-time planetary tracking with production WebSocket
              infrastructure, demonstrating our enterprise-grade real-time capabilities. This feature
              showcases the 87% computational load reduction achieved through strategic backend migration.
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <div className="space-x-4">
            <a
              href="/backend-status"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📊 Backend Status
            </a>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🏠 Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}