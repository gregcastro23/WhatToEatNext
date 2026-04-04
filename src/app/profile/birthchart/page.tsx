'use client';

import React from 'react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { NatalTransitChart } from '@/components/dashboard/NatalTransitChart';

export default function BirthChartPage() {
  const { profileData, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Drawing your charts...</p>
        </div>
      </div>
    );
  }

  if (!profileData?.natalChart) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/profile" className="text-purple-600 hover:text-purple-800 transition-colors font-medium mb-6 inline-flex items-center gap-1">
          <span className="text-xl">&larr;</span> Back to Dashboard
        </Link>
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-red-100 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Birth Data Found</h2>
          <p className="text-gray-600">Please complete your onboarding to view your birth chart.</p>
        </div>
      </div>
    );
  }

  const natalChart = profileData.natalChart;
  const sunSign = natalChart.planetaryPositions?.Sun;
  const moonSign = natalChart.planetaryPositions?.Moon;
  const rising = natalChart.ascendant;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <Link href="/profile" className="text-purple-600 hover:text-purple-800 transition-colors font-medium mb-6 inline-flex items-center gap-1 group">
        <span className="text-xl group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
      </Link>

      <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-3xl shadow-xl border border-indigo-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl pointer-events-none">
          <div className="w-64 h-64 bg-white rounded-full" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Your Celestial Blueprint</h1>
        <p className="text-purple-200 max-w-2xl text-lg leading-relaxed mb-6">
          Explore your natal alignments and how the current astrological weather interacts with your foundational energies.
        </p>

        <div className="flex flex-wrap gap-4">
          {sunSign && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
              <span className="text-amber-400 text-2xl">&#x2609;</span>
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">Sun (Core)</div>
                <div className="font-bold capitalize">{sunSign}</div>
              </div>
            </div>
          )}
          {moonSign && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
              <span className="text-blue-300 text-2xl">&#x263D;</span>
              <div>
                <div className="text-[10px] uppercase font-bold text-blue-200/80 tracking-wider">Moon (Needs)</div>
                <div className="font-bold capitalize">{moonSign}</div>
              </div>
            </div>
          )}
          {rising && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
              <span className="text-purple-300 font-black text-xl">AC</span>
              <div>
                <div className="text-[10px] uppercase font-bold text-purple-200/80 tracking-wider">Rising (Approach)</div>
                <div className="font-bold capitalize">{rising}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Natal & Transit Chart</h2>
              <div className="hidden sm:flex items-center gap-3 text-xs font-semibold bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500"/> Natal</span>
                <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400"/> Transit</span>
              </div>
            </div>
            <div className="aspect-square max-w-2xl mx-auto relative">
              <NatalTransitChart natalChart={natalChart} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">Planetary Placements</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const).map((planet) => {
                const sign = natalChart.planetaryPositions?.[planet];
                if (!sign) return null;
                const signStr = typeof sign === 'string' ? sign : '';
                return (
                  <div key={planet} className="p-3 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-100 transition-colors group cursor-default">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-purple-400">{planet}</div>
                    <div className="text-sm font-bold text-gray-700 capitalize mt-0.5">{signStr}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
