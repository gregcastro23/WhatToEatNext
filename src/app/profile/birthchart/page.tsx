'use client';

import Link from 'next/link';
import React from 'react';
import { NatalTransitChart } from '@/components/dashboard/NatalTransitChart';
import { useProfile } from '@/hooks/useProfile';

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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in relative">
      <div className="absolute inset-0 bg-slate-950 -z-20 hidden md:block rounded-3xl mt-12 mx-2 blur-3xl opacity-20" />
      <Link href="/profile" className="text-purple-600 hover:text-purple-800 transition-colors font-bold mb-6 inline-flex items-center gap-2 group tracking-wide">
        <span className="text-xl group-hover:-translate-x-1 transition-transform">&larr;</span> Return to Dashboard
      </Link>

      <div className="mb-10 p-8 md:p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-[2.5rem] shadow-2xl border border-indigo-500/30 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl pointer-events-none group-hover:opacity-20 transition-opacity duration-1000">
          <div className="w-96 h-96 bg-white rounded-full animate-pulse-slow" />
        </div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-600 rounded-full mix-blend-overlay filter blur-[100px] opacity-40 animate-pulse-slow" />
        <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Your Celestial Blueprint</h1>
        <p className="text-purple-200 max-w-2xl text-lg leading-relaxed mb-6">
          Explore your natal alignments and how the current astrological weather interacts with your foundational energies.
        </p>

        <div className="flex flex-wrap gap-4 relative z-10 mt-8">
          {sunSign && (
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 hover:bg-black/40 hover:border-amber-400/30 transition-all duration-300">
              <span className="text-amber-400 text-3xl drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">&#x2609;</span>
              <div>
                <div className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-0.5">Core Self</div>
                <div className="font-bold capitalize text-white tracking-wide">{sunSign} Sun</div>
              </div>
            </div>
          )}
          {moonSign && (
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 hover:bg-black/40 hover:border-blue-300/30 transition-all duration-300">
              <span className="text-blue-300 text-3xl drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]">&#x263D;</span>
              <div>
                <div className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-0.5">Inner Needs</div>
                <div className="font-bold capitalize text-white tracking-wide">{moonSign} Moon</div>
              </div>
            </div>
          )}
          {rising && (
            <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 hover:bg-black/40 hover:border-purple-300/30 transition-all duration-300">
              <span className="text-purple-300 font-black text-2xl drop-shadow-[0_0_8px_rgba(216,180,254,0.5)]">AC</span>
              <div>
                <div className="text-[10px] uppercase font-black text-white/50 tracking-widest mb-0.5">Outer World</div>
                <div className="font-bold capitalize text-white tracking-wide">{rising} Rising</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0f111a] rounded-[2.5rem] shadow-xl p-6 md:p-10 border border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight">Active Sky vs Natal Blueprint</h2>
              <div className="hidden sm:flex items-center gap-4 text-xs font-bold bg-black/50 px-4 py-2 rounded-full border border-slate-800/50 backdrop-blur-md">
                <span className="flex items-center gap-2 text-purple-200"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"/> Natal Base</span>
                <span className="flex items-center gap-2 text-orange-200"><div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]"/> Live Transit</span>
              </div>
            </div>
            <div className="aspect-square max-w-2xl mx-auto relative bg-[#0a0a0f] rounded-full p-4 md:p-8 border border-white/5 shadow-inner">
              <NatalTransitChart natalChart={natalChart} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-sm p-8 border border-slate-100">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex justify-between items-end">
              <span>Planetary Constellation</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Natal</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {(['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const).map((planet) => {
                const sign = natalChart.planetaryPositions?.[planet];
                if (!sign) return null;
                const signStr = typeof sign === 'string' ? sign : '';
                return (
                  <div key={planet} className="relative p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-purple-300 transition-all duration-300 group hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-default">
                    <div className="absolute -right-4 -bottom-4 text-6xl opacity-[0.03] group-hover:opacity-10 transition-opacity font-serif group-hover:text-purple-600">
                      {planet[0]}
                    </div>
                    <div className="relative z-10">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-purple-500 transition-colors">{planet}</div>
                      <div className="text-base font-bold text-slate-800 capitalize">{signStr}</div>
                    </div>
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
