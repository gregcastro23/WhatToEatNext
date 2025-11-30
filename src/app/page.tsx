"use client";

/**
 * Home Page - Alchm.kitchen
 * Main landing page introducing the Alchm elemental system and recommendation engine
 */

import Link from "next/link";
import React from "react";
import CookingMethodPreview from "@/components/home/CookingMethodPreview";
import CuisinePreview from "@/components/home/CuisinePreview";
import EnhancedIngredientRecommender from "@/components/recommendations/EnhancedIngredientRecommender";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section - Alchm.kitchen Introduction */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="text-center mb-12 animate-fade-in">
          {/* Brand Header */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Alchm.kitchen
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2 italic">
            Where the elements meet the cosmos
          </p>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-10">
            Discover food perfectly aligned with the present moment through ancient elemental wisdom and real-time planetary calculations.
          </p>

          {/* The Four Elements - Primary Focus */}
          <div className="alchm-card rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto mb-8 alchm-shimmer hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
              The Four Elements
            </h2>
            <p className="text-gray-600 mb-6 text-center text-base md:text-lg">
              Every ingredient carries an elemental signature — raw energetic properties that define its culinary nature
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-3xl md:text-4xl mb-2">🔥</div>
                <h3 className="text-lg md:text-xl font-bold text-orange-600 mb-1">
                  Fire
                </h3>
                <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">
                  Transformation & Vitality
                </p>
                <p className="text-xs text-gray-500">
                  Spices, peppers, heat-driven cooking
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-3xl md:text-4xl mb-2">💧</div>
                <h3 className="text-lg md:text-xl font-bold text-blue-600 mb-1">
                  Water
                </h3>
                <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">
                  Flow & Nourishment
                </p>
                <p className="text-xs text-gray-500">
                  Leafy greens, dairy, steaming
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-3xl md:text-4xl mb-2">🌍</div>
                <h3 className="text-lg md:text-xl font-bold text-amber-700 mb-1">
                  Earth
                </h3>
                <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">
                  Stability & Grounding
                </p>
                <p className="text-xs text-gray-500">
                  Root vegetables, grains, slow cooking
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 border-2 border-sky-200 hover:border-sky-400 hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="text-3xl md:text-4xl mb-2">💨</div>
                <h3 className="text-lg md:text-xl font-bold text-sky-600 mb-1">
                  Air
                </h3>
                <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">
                  Movement & Clarity
                </p>
                <p className="text-xs text-gray-500">
                  Herbs, aromatics, fresh preparations
                </p>
              </div>
            </div>
          </div>

          {/* Alchemical Quantities (ESMS) */}
          <div className="alchm-card rounded-2xl shadow-xl p-6 md:p-8 max-w-5xl mx-auto mb-8 hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-2 text-center">
              The Alchemical Quantities
            </h2>
            <p className="text-gray-600 mb-6 text-center text-base md:text-lg">
              Calculated from real-time planetary positions, these quantities emerge from the cosmos
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
              <div className="p-4 rounded-lg bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200">
                <div className="text-2xl mb-1">✨</div>
                <h3 className="text-base md:text-lg font-semibold text-purple-600 mb-1">
                  Spirit
                </h3>
                <p className="text-xs text-gray-600">
                  The vital force driving transformation
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200">
                <div className="text-2xl mb-1">💧</div>
                <h3 className="text-base md:text-lg font-semibold text-blue-600 mb-1">
                  Essence
                </h3>
                <p className="text-xs text-gray-600">
                  The fundamental nature and soul
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200">
                <div className="text-2xl mb-1">🪨</div>
                <h3 className="text-base md:text-lg font-semibold text-amber-700 mb-1">
                  Matter
                </h3>
                <p className="text-xs text-gray-600">
                  Structure, texture, and grounding
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white bg-opacity-70 hover:bg-opacity-100 transition-all duration-200">
                <div className="text-2xl mb-1">🌿</div>
                <h3 className="text-base md:text-lg font-semibold text-green-600 mb-1">
                  Substance
                </h3>
                <p className="text-xs text-gray-600">
                  Depth and lasting nourishment
                </p>
              </div>
            </div>
          </div>

          {/* How Alchm Works */}
          <div className="max-w-4xl mx-auto mb-12 p-6 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-50 to-orange-100 border border-purple-200">
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
              How Alchm Works
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center">
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                <span className="font-semibold text-orange-600">Ingredients</span>
                <span className="text-gray-500 text-sm block">Elemental Properties</span>
              </div>
              <span className="text-2xl text-purple-400">+</span>
              <div className="px-4 py-2 bg-white rounded-lg shadow-sm">
                <span className="font-semibold text-purple-600">Planetary Positions</span>
                <span className="text-gray-500 text-sm block">ESMS Quantities</span>
              </div>
              <span className="text-2xl text-purple-400">=</span>
              <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-500 text-white rounded-lg shadow-md">
                <span className="font-semibold">Recommendations</span>
                <span className="text-purple-100 text-sm block">Aligned with NOW</span>
              </div>
            </div>
            <p className="text-center mt-4 text-gray-600 italic">
              Discover what the cosmos recommends for you today
            </p>
          </div>

        </div>

        {/* Introduction Components - Always Visible */}
        <div className="space-y-8 md:space-y-10">
          {/* Cuisine Recommender Introduction */}
          <div id="cuisines" className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all duration-300" role="region" aria-labelledby="cuisine-heading">
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white p-6 md:p-8">
              <div className="text-center">
                <h2 id="cuisine-heading" className="text-3xl md:text-4xl font-bold mb-3">
                  🍽️ Cuisine Recommendations
                </h2>
                <p className="text-purple-100 text-base md:text-lg">
                  Discover cuisines aligned with current celestial energies,
                  with nested recipes and sauces
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <CuisinePreview />
            </div>
          </div>

          {/* Ingredient Recommender Introduction */}
          <div id="ingredients" className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200 hover:border-green-300 transition-all duration-300" role="region" aria-labelledby="ingredient-heading">
            <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white p-6 md:p-8">
              <div className="text-center">
                <h2 id="ingredient-heading" className="text-3xl md:text-4xl font-bold mb-3">
                  🥬 Ingredient Recommendations
                </h2>
                <p className="text-green-100 text-base md:text-lg">
                  Explore ingredients with full profiles including sensory, alchemical, and astrological properties
                </p>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <EnhancedIngredientRecommender />
            </div>
          </div>

          {/* Cooking Methods Recommender Introduction */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200 hover:border-orange-300 transition-all duration-300" role="region" aria-labelledby="cooking-method-heading">
            <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 text-white p-6 md:p-8">
              <div className="text-center">
                <h2 id="cooking-method-heading" className="text-3xl md:text-4xl font-bold mb-3">
                  🔥 Cooking Method Recommendations
                </h2>
                <p className="text-orange-100 text-base md:text-lg mb-4">
                  Discover the 14 Alchemical Pillars, thermodynamics, and kinetic properties of cooking methods
                </p>
                <Link
                  href="/cooking-methods"
                  className="inline-block bg-white text-orange-600 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base hover:bg-orange-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
                  aria-label="Navigate to full cooking methods page"
                >
                  Explore Full Cooking Methods →
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <CookingMethodPreview />
            </div>
          </div>
        </div>

        {/* Three Pillars - Moved to Bottom */}
        <div className="mt-12 md:mt-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 md:mb-8">
            Explore Our Culinary Data
          </h2>
          <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Link href="/cooking-methods" className="block group" aria-label="Explore elemental properties">
              <div className="alchm-card p-6 md:p-8 rounded-2xl shadow-lg text-center group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-orange-300 focus-within:ring-offset-2" tabIndex={0}>
                <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🔥</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-orange-600">
                  Elemental
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                  Balance Fire, Water, Earth, and Air in your culinary journey
                </p>
                <p className="text-xs md:text-sm text-orange-600 font-semibold">
                  Explore Elemental Properties →
                </p>
              </div>
            </Link>

            <Link href="/test-planetary" className="block group" aria-label="View current planetary chart">
              <div className="alchm-card p-6 md:p-8 rounded-2xl shadow-lg text-center group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-purple-300 focus-within:ring-offset-2" tabIndex={0}>
                <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">⭐</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-purple-600">
                  Astrological
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                  Align your meals with planetary positions and zodiac energies
                </p>
                <p className="text-xs md:text-sm text-purple-600 font-semibold">
                  View Current Planetary Chart →
                </p>
              </div>
            </Link>

            <Link href="/_alchemize-demo" className="block group" aria-label="Explore alchemical transformations">
              <div className="alchm-card p-6 md:p-8 rounded-2xl shadow-lg text-center group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-green-300 focus-within:ring-offset-2" tabIndex={0}>
                <div className="text-4xl md:text-5xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🧪</div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-green-600">
                  Alchemical
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3">
                  Transform ingredients through Spirit, Essence, Matter, and
                  Substance
                </p>
                <p className="text-xs md:text-sm text-green-600 font-semibold">
                  Explore Alchemical Kinetics →
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
