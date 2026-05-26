"use client";

import React from "react";

/**
 * FutureRecipeSkeleton
 * Renders a highly visual, structurally matched mockup of tomorrow's locked recipe
 * inside a glassmorphic frame to invite upgrading.
 *
 * @file src/components/premium/FutureRecipeSkeleton.tsx
 */
export function FutureRecipeSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-pulse">
      {/* Hero Header Mock */}
      <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/8 p-8 md:p-12 space-y-6">
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-24 rounded-full bg-white/10" />
          <div className="h-6 w-16 rounded-full bg-white/10" />
          <div className="h-6 w-20 rounded-full bg-white/10" />
        </div>

        <div className="space-y-3">
          {/* Locked Title */}
          <div className="h-10 md:h-12 w-2/3 rounded-xl bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-purple-400/20" />
          {/* Locked Subtitle */}
          <div className="h-4 w-5/6 rounded bg-white/8" />
          <div className="h-4 w-4/6 rounded bg-white/8" />
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-24 rounded-full bg-white/5 border border-white/8" />
          ))}
        </div>

        {/* Mock Actions Panel */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
          <div className="h-12 w-32 rounded-xl bg-white/5 border border-white/8" />
          <div className="h-12 w-44 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/10" />
          <div className="h-12 w-36 rounded-xl bg-white/5 border border-white/8" />
        </div>
      </div>

      {/* Grid Content Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Ingredients & Instructions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mock Tuning Panels */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/8 space-y-4">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="h-3 w-5/6 rounded bg-white/8" />
            <div className="h-3 w-4/6 rounded bg-white/8" />
          </div>

          {/* Mock Ingredients List */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 rounded-lg bg-white/10" />
              <div className="h-4 w-44 rounded bg-white/8" />
            </div>
            
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-400/30" />
                  <div className="h-4 w-1/4 rounded bg-white/10" />
                  <div className="h-4 w-1/2 rounded bg-white/8" />
                </div>
              ))}
            </div>
          </div>

          {/* Mock Instructions */}
          <div className="p-8 rounded-2xl bg-white/5 border border-white/8 space-y-8">
            <div className="h-6 w-36 rounded-lg bg-white/10" />

            <div className="space-y-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/8 shrink-0 flex items-center justify-center text-sm text-white/30">
                    {step}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full rounded bg-white/8" />
                    <div className="h-4 w-5/6 rounded bg-white/8" />
                    <div className="h-4 w-4/5 rounded bg-white/8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Astro & Alchemical Mock */}
        <div className="space-y-8">
          {/* Mock Alchemical Scores */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/8 space-y-6">
            <div className="h-5 w-36 rounded bg-white/10" />

            {/* Circular Gauge Mocks */}
            <div className="flex items-center justify-around py-4">
              <div className="relative w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center">
                <div className="w-12 h-1 rounded bg-white/5 animate-spin" />
              </div>
              <div className="relative w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/5" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-3 w-16 rounded bg-white/8" />
                  <div className="h-3 w-10 rounded bg-white/10" />
                </div>
              ))}
            </div>
          </div>

          {/* Mock Planetary Transits */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/8 space-y-4">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/5" />
                  <div className="h-3 w-2/3 rounded bg-white/8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
