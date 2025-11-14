"use client";

/**
 * Home Page - WhatToEatNext
 * Main landing page with preview components for cuisine, ingredient, and cooking method recommendations
 */

import Link from "next/link";
import React, { useState } from "react";
import CookingMethodPreview from "@/components/home/CookingMethodPreview";
import CuisinePreview from "@/components/home/CuisinePreview";
import IngredientPreview from "@/components/home/IngredientPreview";

export default function HomePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-purple-50 via-pink-50 to-blue-50">
      {/* Hero Section with Mission Statement */}
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold mb-6 alchm-gradient-text alchm-shimmer" style={{ fontSize: '5rem', letterSpacing: '0.1em' }}>
            ALCHM
          </h1>
          <p className="text-2xl text-gray-800 mb-4 font-semibold max-w-4xl mx-auto leading-relaxed">
            Everyone deserves to eat the best possible food, perfectly aligned
            with the present moment
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            We bridge ancient astrological wisdom with cutting-edge AI, helping
            you discover not just what to eat, but why you should eat it.
          </p>

          {/* The Infinite Yoga of Cooking */}
          <div className="alchm-card rounded-2xl shadow-2xl p-10 max-w-4xl mx-auto mb-16 alchm-shimmer">
            <h2 className="text-4xl font-bold text-purple-600 mb-6 text-center">
              The Infinite Yoga of Cooking
            </h2>
            <p className="text-gray-700 mb-6">
              At our heart lies the infinite yoga of cooking—where every meal
              becomes an opportunity for growth, connection, and self-discovery.
              Cooking transcends daily routine; it&apos;s a lifelong practice
              uniting body, mind, and spirit.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="text-lg font-semibold text-orange-600 mb-2">
                  Universal Invitation
                </h3>
                <p className="text-sm text-gray-600">
                  We foster a community where everyone explores cooking&apos;s
                  endless possibilities, regardless of experience
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  Continuous Learning
                </h3>
                <p className="text-sm text-gray-600">
                  Our platform encourages curiosity and experimentation,
                  deepening understanding of ingredients and techniques
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">
                  Mindful Practice
                </h3>
                <p className="text-sm text-gray-600">
                  We view the kitchen as sacred space for creativity,
                  reflection, and transformation
                </p>
              </div>
            </div>
          </div>

          {/* Three Pillars */}
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-16">
            <div className="alchm-card p-8 rounded-2xl shadow-lg text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🔥</div>
              <h2 className="text-2xl font-bold mb-4 text-orange-600">
                Elemental
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Balance Fire, Water, Earth, and Air in your culinary journey
              </p>
            </div>

            <div className="alchm-card p-8 rounded-2xl shadow-lg text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">⭐</div>
              <h2 className="text-2xl font-bold mb-4 text-purple-600">
                Astrological
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Align your meals with planetary positions and zodiac energies
              </p>
            </div>

            <div className="alchm-card p-8 rounded-2xl shadow-lg text-center group">
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🧪</div>
              <h2 className="text-2xl font-bold mb-4 text-green-600">
                Alchemical
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Transform ingredients through Spirit, Essence, Matter, and
                Substance
              </p>
            </div>
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
                <CuisinePreview />
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
                    Browse ingredients by category, aligned with your current
                    moment
                  </p>
                </div>
                <div className="text-5xl font-light">
                  {expandedSection === "ingredients" ? "−" : "+"}
                </div>
              </div>
            </div>
            {expandedSection === "ingredients" && (
              <div className="p-6">
                <IngredientPreview />
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
                    Explore cooking techniques that resonate with current
                    elemental energies
                  </p>
                </div>
                <div className="text-5xl font-light">
                  {expandedSection === "methods" ? "−" : "+"}
                </div>
              </div>
            </div>
            {expandedSection === "methods" && (
              <div className="p-6">
                <CookingMethodPreview />
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
