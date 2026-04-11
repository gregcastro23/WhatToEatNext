"use client";

import dynamic from "next/dynamic";
import React from "react";

const EnhancedCookingMethodRecommender = dynamic(
  () => import("@/components/recommendations/EnhancedCookingMethodRecommender"),
  {
    loading: () => (
      <div className="flex min-h-[320px] items-center justify-center text-white/50">
        Loading cooking methods...
      </div>
    ),
  },
);

/**
 * Cooking Methods Page
 * Showcases the Enhanced Cooking Method Recommender with:
 * - 14 Alchemical Pillars
 * - Thermodynamic Properties (Heat, Entropy, Reactivity)
 * - Monica Constants and Classifications
 * - Kinetic Properties (Power, Force, Energy)
 * - Regional Variations and Expert Tips
 */

export default function CookingMethodsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <EnhancedCookingMethodRecommender />
      </div>
    </div>
  );
}
