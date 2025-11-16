"use client";

import React from "react";
import EnhancedCookingMethodRecommender from "@/components/recommendations/EnhancedCookingMethodRecommender";

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
