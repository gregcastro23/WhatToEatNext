"use client";

/**
 * Home Page - WhatToEatNext
 * Main landing page with preview components for cuisine, ingredient, and cooking method recommendations
 */

import Link from "next/link";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import CookingMethodPreview from "@/components/home/CookingMethodPreview";
import CuisinePreview from "@/components/home/CuisinePreview";
import IngredientPreview from "@/components/home/IngredientPreview";

// Import full recommendation components for expanded sections
const CurrentMomentCuisineRecommendations = dynamic(
  () => import("@/components/cuisines/CurrentMomentCuisineRecommendations"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mb-4" />
        <p className="text-lg font-medium text-gray-700 ml-4">
          Loading full recommendations...
        </p>
      </div>
    ),
  }
);

const EnhancedIngredientRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedIngredientRecommender").then(mod => ({ default: mod.EnhancedIngredientRecommender })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4" />
        <p className="text-lg font-medium text-gray-700 ml-4">
          Loading ingredient recommendations...
        </p>
      </div>
    ),
  }
);

const EnhancedCookingMethodRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedCookingMethodRecommender"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-4" />
        <p className="text-lg font-medium text-gray-700 ml-4">
          Loading cooking methods...
        </p>
      </div>
    ),
  }
);

export default function HomePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [useFullComponents, setUseFullComponents] = useState<{ [key: string]: boolean }>({
    cuisines: false,
    ingredients: false,
    methods: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const toggleFullComponent = (section: string) => {
    setUseFullComponents(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section with Mission Statement */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-3xl text-gray-800 mb-4 font-bold max-w-4xl mx-auto leading-relaxed">
            Everyone deserves to eat the best possible food, perfectly aligned
            with the present moment
          </p>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            We bridge ancient astrological wisdom with cutting-edge AI, helping
            you discover not just what to eat, but why you should eat it.
          </p>

          {/* The Infinite Yoga of Cooking */}
          <div className="alchm-card rounded-2xl shadow-xl p-8 max-w-4xl mx-auto mb-12 alchm-shimmer">
            <h2 className="text-3xl font-bold text-purple-600 mb-4 text-center">
              The Infinite Yoga of Cooking
            </h2>
            <p className="text-gray-700 mb-6 text-center text-lg">
              Every meal is an opportunity for growth, connection, and self-discovery.
              Cooking transcends routine—it&apos;s a lifelong practice uniting body, mind, and spirit.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-1">
                  Universal Invitation
                </h3>
                <p className="text-sm text-gray-600">
                  Explore endless possibilities, regardless of experience
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-1">
                  Continuous Learning
                </h3>
                <p className="text-sm text-gray-600">
                  Deepen understanding through curiosity and experimentation
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-1">
                  Mindful Practice
                </h3>
                <p className="text-sm text-gray-600">
                  Transform your kitchen into sacred creative space
                </p>
              </div>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-16">
            <Link href="/ingredients" className="block">
              <div className="alchm-card p-8 rounded-2xl shadow-lg text-center group hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🔥</div>
                <h2 className="text-2xl font-bold mb-4 text-orange-600">
                  Elemental
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Balance Fire, Water, Earth, and Air in your culinary journey
                </p>
                <p className="text-sm text-orange-600 font-semibold">
                  Explore Elemental Properties →
                </p>
              </div>
            </Link>

            <Link href="/_live-planetary-demo" className="block">
              <div className="alchm-card p-8 rounded-2xl shadow-lg text-center group hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">⭐</div>
                <h2 className="text-2xl font-bold mb-4 text-purple-600">
                  Astrological
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Align your meals with planetary positions and zodiac energies
                </p>
                <p className="text-sm text-purple-600 font-semibold">
                  View Current Planetary Chart →
                </p>
              </div>
            </Link>

            <Link href="/_alchemize-demo" className="block">
              <div className="alchm-card p-8 rounded-2xl shadow-lg text-center group hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🧪</div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">
                  Alchemical
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Transform ingredients through Spirit, Essence, Matter, and
                  Substance
                </p>
                <p className="text-sm text-green-600 font-semibold">
                  Explore Alchemical Kinetics →
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Preview Components */}
        <div className="space-y-10">
          {/* Cuisine Recommender Preview */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
            <div
              className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white p-8 cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
              onClick={() => toggleSection("cuisines")}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-3">
                    🍽️ Cuisine Recommendations
                  </h2>
                  <p className="text-purple-100 text-lg">
                    Discover cuisines aligned with current celestial energies,
                    with nested recipes and sauces
                  </p>
                </div>
                <div className="text-5xl font-light">
                  {expandedSection === "cuisines" ? "−" : "+"}
                </div>
              </div>
            </div>
            {expandedSection === "cuisines" && (
              <div className="p-6">
                {/* Toggle between preview and full component */}
                <div className="mb-4 flex justify-center gap-2">
                  <button
                    onClick={() => toggleFullComponent('cuisines')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      !useFullComponents.cuisines
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Preview Mode
                  </button>
                  <button
                    onClick={() => toggleFullComponent('cuisines')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      useFullComponents.cuisines
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Full Recommendations
                  </button>
                </div>

                {useFullComponents.cuisines ? (
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <CurrentMomentCuisineRecommendations />
                  </div>
                ) : (
                  <CuisinePreview />
                )}

                <div className="mt-6 text-center">
                  <Link
                    href="/cuisines"
                    className="inline-block bg-purple-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  >
                    View Full Cuisine Explorer →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Ingredient Recommender Preview */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200">
            <div
              className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white p-8 cursor-pointer hover:from-green-700 hover:to-teal-700 transition-all duration-300"
              onClick={() => toggleSection("ingredients")}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-3">
                    🥬 Ingredient Recommendations
                  </h2>
                  <p className="text-green-100 text-lg">
                    Explore ingredients with full profiles including sensory, alchemical, and astrological properties
                  </p>
                </div>
                <div className="text-5xl font-light">
                  {expandedSection === "ingredients" ? "−" : "+"}
                </div>
              </div>
            </div>
            {expandedSection === "ingredients" && (
              <div className="p-6">
                {/* Toggle between preview and full component */}
                <div className="mb-4 flex justify-center gap-2">
                  <button
                    onClick={() => toggleFullComponent('ingredients')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      !useFullComponents.ingredients
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Preview Mode
                  </button>
                  <button
                    onClick={() => toggleFullComponent('ingredients')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      useFullComponents.ingredients
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Full Recommendations
                  </button>
                </div>

                {useFullComponents.ingredients ? (
                  <div className="bg-white rounded-xl shadow-lg">
                    <EnhancedIngredientRecommender isFullPageVersion={true} />
                  </div>
                ) : (
                  <IngredientPreview />
                )}

                <div className="mt-6 text-center">
                  <Link
                    href="/ingredients"
                    className="inline-block bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  >
                    View Full Ingredient Browser →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Cooking Methods Recommender Preview */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200">
            <div
              className="bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 text-white p-8 cursor-pointer hover:from-orange-700 hover:to-red-700 transition-all duration-300"
              onClick={() => toggleSection("methods")}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-bold mb-3">
                    🔥 Cooking Method Recommendations
                  </h2>
                  <p className="text-orange-100 text-lg">
                    Discover the 14 Alchemical Pillars, thermodynamics, and kinetic properties of cooking methods
                  </p>
                </div>
                <div className="text-5xl font-light">
                  {expandedSection === "methods" ? "−" : "+"}
                </div>
              </div>
            </div>
            {expandedSection === "methods" && (
              <div className="p-6">
                {/* Toggle between preview and full component */}
                <div className="mb-4 flex justify-center gap-2">
                  <button
                    onClick={() => toggleFullComponent('methods')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      !useFullComponents.methods
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Preview Mode
                  </button>
                  <button
                    onClick={() => toggleFullComponent('methods')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      useFullComponents.methods
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Full Alchemical View
                  </button>
                </div>

                {useFullComponents.methods ? (
                  <div className="bg-white rounded-xl shadow-lg">
                    <EnhancedCookingMethodRecommender />
                  </div>
                ) : (
                  <CookingMethodPreview />
                )}

                <div className="mt-6 text-center">
                  <Link
                    href="/cooking-methods"
                    className="inline-block bg-orange-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-orange-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                  >
                    View Full Cooking Methods →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-16 text-center">
          <div className="inline-block alchm-card px-8 py-4 rounded-xl shadow-lg">
            <p className="text-gray-600 text-lg mb-2">
              System Status:{" "}
              <span className="text-green-600 font-bold">● Operational</span>
            </p>
            <p className="text-sm text-gray-500">
              Build: Stable | PostgreSQL: Running | Next.js: Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
