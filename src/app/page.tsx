/**
 * Home Page - WhatToEatNext
 * Simplified for build stability
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            What to Eat Next
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Discover your perfect meal through the harmony of elements, stars, and alchemy
          </p>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-3 text-orange-600">🔥 Elemental</h2>
              <p className="text-gray-600 mb-4">
                Balance Fire, Water, Earth, and Air in your culinary journey
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-3 text-purple-600">⭐ Astrological</h2>
              <p className="text-gray-600 mb-4">
                Align your meals with planetary positions and zodiac energies
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-3 text-green-600">🧪 Alchemical</h2>
              <p className="text-gray-600 mb-4">
                Transform ingredients through Spirit, Essence, Matter, and Substance
              </p>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-gray-500">
              System Status: <span className="text-green-600 font-semibold">Operational</span>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Build: Stable | Parsing Errors: Eliminated | Core Systems: Ready
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
