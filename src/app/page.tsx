"use client";

/**
 * Home Page - WhatToEatNext
 * Main landing page with introductions to our three core recommendation algorithms
 */

import Link from "next/link";
import React from "react";
import CookingMethodPreview from "@/components/home/CookingMethodPreview";
import CuisinePreview from "@/components/home/CuisinePreview";
import IngredientPreview from "@/components/home/IngredientPreview";

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section with Mission Statement */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-2xl md:text-3xl text-gray-800 mb-4 font-bold max-w-4xl mx-auto leading-relaxed">
            Everyone deserves to eat the best possible food, perfectly aligned
            with the present moment
          </p>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            We bridge ancient astrological wisdom with cutting-edge AI, helping
            you discover not just what to eat, but why you should eat it.
          </p>

          {/* The Infinite Yoga of Cooking */}
          <div className="alchm-card rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto mb-12 alchm-shimmer hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl md:text-3xl font-bold text-purple-600 mb-4 text-center">
              The Infinite Yoga of Cooking
            </h2>
            <p className="text-gray-700 mb-6 text-center text-base md:text-lg">
              Every meal is an opportunity for growth, connection, and self-discovery.
              Cooking transcends routine—it&apos;s a lifelong practice uniting body, mind, and spirit.
            </p>
            <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-center">
              <div className="p-4 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-80 transition-all duration-200 hover:scale-105">
                <h3 className="text-base md:text-lg font-semibold text-orange-600 mb-2">
                  Universal Invitation
                </h3>
                <p className="text-sm text-gray-600">
                  Explore endless possibilities, regardless of experience
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-80 transition-all duration-200 hover:scale-105">
                <h3 className="text-base md:text-lg font-semibold text-green-600 mb-2">
                  Continuous Learning
                </h3>
                <p className="text-sm text-gray-600">
                  Deepen understanding through curiosity and experimentation
                </p>
              </div>
              <div className="p-4 rounded-lg bg-white bg-opacity-50 hover:bg-opacity-80 transition-all duration-200 hover:scale-105">
                <h3 className="text-base md:text-lg font-semibold text-blue-600 mb-2">
                  Mindful Practice
                </h3>
                <p className="text-sm text-gray-600">
                  Transform your kitchen into sacred creative space
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Introduction Components - Always Visible */}
        <div className="space-y-8 md:space-y-10">
          {/* Cuisine Recommender Introduction */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200 hover:border-purple-300 transition-all duration-300" role="region" aria-labelledby="cuisine-heading">
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white p-6 md:p-8">
              <div className="text-center">
                <h2 id="cuisine-heading" className="text-3xl md:text-4xl font-bold mb-3">
                  🍽️ Cuisine Recommendations
                </h2>
                <p className="text-purple-100 text-base md:text-lg mb-4">
                  Discover cuisines aligned with current celestial energies,
                  with nested recipes and sauces
                </p>
                <Link
                  href="/cuisines"
                  className="inline-block bg-white text-purple-600 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base hover:bg-purple-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2"
                  aria-label="Navigate to full cuisine recommender page"
                >
                  Explore Full Cuisine Recommender →
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <CuisinePreview />
            </div>
          </div>

          {/* Ingredient Recommender Introduction */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200 hover:border-green-300 transition-all duration-300" role="region" aria-labelledby="ingredient-heading">
            <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white p-6 md:p-8">
              <div className="text-center">
                <h2 id="ingredient-heading" className="text-3xl md:text-4xl font-bold mb-3">
                  🥬 Ingredient Recommendations
                </h2>
                <p className="text-green-100 text-base md:text-lg mb-4">
                  Explore ingredients with full profiles including sensory, alchemical, and astrological properties
                </p>
                <Link
                  href="/ingredients"
                  className="inline-block bg-white text-green-600 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base hover:bg-green-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2"
                  aria-label="Navigate to full ingredient browser page"
                >
                  Explore Full Ingredient Browser →
                </Link>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-white">
              <IngredientPreview />
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
            <Link href="/ingredients" className="block group" aria-label="Explore elemental properties">
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
