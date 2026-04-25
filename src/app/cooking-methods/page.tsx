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
    <div className="min-h-screen bg-[#08080e] text-white selection:bg-purple-500/30 selection:text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-md">
          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Cooking Methods Atlas
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-gray-300 md:text-base">
            A live, alchemical, and culinary reference surface combining ESMS, elemental balance,
            thermodynamic state, Monica/Kalchm dynamics, and P=IV kinetics with method-specific
            temperature and pressure envelopes.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700">ESMS + Elemental</span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">Thermodynamic</span>
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-cyan-700">Kinetic (P=IV)</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Method Physics</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">14 Pillars</span>
          </div>
        </section>

        <div className="rounded-2xl border border-white/10 bg-[#0c0c14] p-2 shadow-sm md:p-4">
          <EnhancedCookingMethodRecommender />
        </div>
      </div>
    </div>
  );
}
