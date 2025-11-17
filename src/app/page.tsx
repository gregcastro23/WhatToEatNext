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

        </div>

        {/* Introduction Components - Always Visible */}
        <div className="space-y-10">
          {/* Cuisine Recommender Introduction */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-purple-200">
            <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white p-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-3">
                  🍽️ Cuisine Recommendations
                </h2>
                <p className="text-purple-100 text-lg mb-4">
                  Discover cuisines aligned with current celestial energies,
                  with nested recipes and sauces
                </p>
                <Link
                  href="/cuisines"
                  className="inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-bold text-base hover:bg-purple-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Explore Full Cuisine Recommender →
                </Link>
              </div>
            </div>
            <div className="p-6 bg-white">
              <CuisinePreview />
            </div>
          </div>

          {/* Ingredient Recommender Introduction */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-green-200">
            <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 text-white p-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-3">
                  🥬 Ingredient Recommendations
                </h2>
                <p className="text-green-100 text-lg mb-4">
                  Explore ingredients with full profiles including sensory, alchemical, and astrological properties
                </p>
                <Link
                  href="/ingredients"
                  className="inline-block bg-white text-green-600 px-6 py-3 rounded-xl font-bold text-base hover:bg-green-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Explore Full Ingredient Browser →
                </Link>
              </div>
            </div>
            <div className="p-6 bg-white">
              <IngredientPreview />
            </div>
          </div>

          {/* Cooking Methods Recommender Introduction */}
          <div className="alchm-card rounded-2xl shadow-2xl overflow-hidden border-2 border-orange-200">
            <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-red-600 text-white p-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-3">
                  🔥 Cooking Method Recommendations
                </h2>
                <p className="text-orange-100 text-lg mb-4">
                  Discover the 14 Alchemical Pillars, thermodynamics, and kinetic properties of cooking methods
                </p>
                <Link
                  href="/cooking-methods"
                  className="inline-block bg-white text-orange-600 px-6 py-3 rounded-xl font-bold text-base hover:bg-orange-50 hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Explore Full Cooking Methods →
                </Link>
              </div>
            </div>
            <div className="p-6 bg-white">
              <CookingMethodPreview />
            </div>
          </div>
        </div>

        {/* Three Pillars - Moved to Bottom */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Explore Our Culinary Data
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
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
