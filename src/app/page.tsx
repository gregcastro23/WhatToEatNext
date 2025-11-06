'use client';

/**
 * Home Page - WhatToEatNext
 * Main landing page with preview components for cuisine, ingredient, and cooking method recommendations
 */

import Link from 'next/link';
import React, { useState } from 'react';
import CookingMethodPreview from '@/components/home/CookingMethodPreview';
import CuisinePreview from '@/components/home/CuisinePreview';
import IngredientPreview from '@/components/home/IngredientPreview';

export default function HomePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-purple-50 to-white">
      {/* Hero Section with Mission Statement */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Alchm
          </h1>
          <p className="text-2xl text-gray-700 mb-4 font-semibold">
            Everyone deserves to eat the best possible food, perfectly aligned with the present moment
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            We bridge ancient astrological wisdom with cutting-edge AI, helping you discover not just what to eat, but why you should eat it.
          </p>

          {/* The Infinite Yoga of Cooking */}
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-purple-600 mb-4">The Infinite Yoga of Cooking</h2>
            <p className="text-gray-700 mb-6">
              At our heart lies the infinite yoga of cooking—where every meal becomes an opportunity for growth, connection, and self-discovery. Cooking transcends daily routine; it&apos;s a lifelong practice uniting body, mind, and spirit.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-2">Universal Invitation</h3>
                <p className="text-sm text-gray-600">
                  We foster a community where everyone explores cooking&apos;s endless possibilities, regardless of experience
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Continuous Learning</h3>
                <p className="text-sm text-gray-600">
                  Our platform encourages curiosity and experimentation, deepening understanding of ingredients and techniques
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Mindful Practice</h3>
                <p className="text-sm text-gray-600">
                  We view the kitchen as sacred space for creativity, reflection, and transformation
                </p>
              </div>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-3 text-orange-600">🔥 Elemental</h2>
              <p className="text-gray-600 mb-4">
                Balance Fire, Water, Earth, and Air in your culinary journey
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-3 text-purple-600">⭐ Astrological</h2>
              <p className="text-gray-600 mb-4">
                Align your meals with planetary positions and zodiac energies
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <h2 className="text-2xl font-semibold mb-3 text-green-600">🧪 Alchemical</h2>
              <p className="text-gray-600 mb-4">
                Transform ingredients through Spirit, Essence, Matter, and Substance
              </p>
            </div>
          </div>
        </div>

        {/* Preview Components */}
        <div className="space-y-8">
          {/* Cuisine Recommender Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-colors"
              onClick={() => toggleSection('cuisines')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">🍽️ Cuisine Recommendations</h2>
                  <p className="text-purple-100">
                    Discover cuisines aligned with current celestial energies, with nested recipes and sauces
                  </p>
                </div>
                <div className="text-4xl">
                  {expandedSection === 'cuisines' ? '−' : '+'}
                </div>
              </div>
            </div>
            {expandedSection === 'cuisines' && (
              <div className="p-6">
                <CuisinePreview />
                <div className="mt-6 text-center">
                  <Link
                    href="/cuisines"
                    className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    View Full Cuisine Explorer →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ingredient Recommender Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 cursor-pointer hover:from-green-700 hover:to-emerald-700 transition-colors"
              onClick={() => toggleSection('ingredients')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">🥬 Ingredient Recommendations</h2>
                  <p className="text-green-100">
                    Browse ingredients by category, aligned with your current moment
                  </p>
                </div>
                <div className="text-4xl">
                  {expandedSection === 'ingredients' ? '−' : '+'}
                </div>
              </div>
            </div>
            {expandedSection === 'ingredients' && (
              <div className="p-6">
                <IngredientPreview />
                <div className="mt-6 text-center">
                  <Link
                    href="/ingredients"
                    className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    View Full Ingredient Browser →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cooking Methods Recommender Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 cursor-pointer hover:from-orange-700 hover:to-red-700 transition-colors"
              onClick={() => toggleSection('methods')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-2">🔥 Cooking Method Recommendations</h2>
                  <p className="text-orange-100">
                    Explore cooking techniques that resonate with current elemental energies
                  </p>
                </div>
                <div className="text-4xl">
                  {expandedSection === 'methods' ? '−' : '+'}
                </div>
              </div>
            </div>
            {expandedSection === 'methods' && (
              <div className="p-6">
                <CookingMethodPreview />
                <div className="mt-6 text-center">
                  <Link
                    href="/cooking-methods"
                    className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                  >
                    View Full Cooking Methods →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            System Status: <span className="text-green-600 font-semibold">Operational</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Build: Stable | PostgreSQL: Running | Next.js: Active
          </p>
        </div>
      </div>
    </div>
  );
}
