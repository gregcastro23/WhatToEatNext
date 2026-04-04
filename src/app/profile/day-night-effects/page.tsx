'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/contexts/ThemeContext';
import { PLANETARY_SECTARIAN_ELEMENTS, PLANETARY_SECTARIAN_ESMS, isSectDiurnal, calculateEnhancedAlchemicalFromPlanets } from '@/utils/planetaryAlchemyMapping';

export default function DayNightEffectsPage() {
  const { profileData, isLoading } = useProfile();
  const { theme, isDiurnal: appIsDiurnal, setThemeBase } = useTheme();
  
  // Local state to toggle views independent of the global theme, though we can sync them
  const [viewDiurnal, setViewDiurnal] = useState(appIsDiurnal);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Analyzing sectarian thermodynamics...</p>
        </div>
      </div>
    );
  }

  if (!profileData?.natalChart) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/profile" className="text-slate-600 hover:text-slate-800 transition-colors font-medium mb-6 inline-flex items-center gap-1">
          <span className="text-xl">&larr;</span> Back to Dashboard
        </Link>
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-red-100 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Birth Data Found</h2>
          <p className="text-gray-600">Please complete your onboarding to view sectarian calculations.</p>
        </div>
      </div>
    );
  }

  const natalChart = profileData.natalChart;
  
  // Calculate user's natal sect using the birth time if available
  const birthDate = natalChart.birthData?.dateTime ? new Date(natalChart.birthData.dateTime) : new Date();
  const isNatalDiurnal = isSectDiurnal(birthDate);

  // Get alchemical properties for current view
  const currentAlchemical = calculateEnhancedAlchemicalFromPlanets(
    natalChart.planetaryPositions || {}, 
    viewDiurnal
  );

  const toggleView = () => {
    setViewDiurnal(!viewDiurnal);
    // Sync with app theme to show visual change across app if desired
    setThemeBase(!viewDiurnal);
  };

  const getHighestESMS = (esms: any) => {
    const keys = ['Spirit', 'Essence', 'Matter', 'Substance'];
    return keys.reduce((a, b) => esms[a] > esms[b] ? a : b);
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ${viewDiurnal ? 'bg-slate-50' : 'bg-slate-900'} py-8`}>
      <div className="max-w-6xl mx-auto px-4 animate-fade-in">
        <Link href="/profile" className={`${viewDiurnal ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'} transition-colors font-medium mb-6 inline-flex items-center gap-1 group`}>
          <span className="text-xl group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
        </Link>

        {/* Hero Section */}
        <div className={`mb-8 p-8 md:p-10 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-700 ${
          viewDiurnal 
            ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-sky-100 border-amber-200/50 text-slate-800' 
            : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-indigo-500/30 text-white'
        }`}>
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 p-12 opacity-30 blur-3xl pointer-events-none transition-all duration-1000">
            <div className={`w-64 h-64 rounded-full ${viewDiurnal ? 'bg-amber-300' : 'bg-blue-600'}`} />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border ${
                viewDiurnal ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-indigo-900/50 border-indigo-500/30 text-indigo-300'
              }`}>
                {viewDiurnal ? '&#x2600;&#xFE0F; Diurnal Sect (Day)' : '&#x263E;&#xFE0F; Nocturnal Sect (Night)'}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Sectarian Resonance</h1>
              <p className={`text-lg leading-relaxed ${viewDiurnal ? 'text-slate-600' : 'text-slate-300'}`}>
                Planets express entirely different alchemical properties based on the sect of the chart. Observe how your elemental composition shifts between day and night logic.
              </p>
            </div>
            
            <button 
              onClick={toggleView}
              className={`shrink-0 px-6 py-4 rounded-2xl font-bold shadow-lg flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
                viewDiurnal 
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20' 
                  : 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10'
              }`}
            >
              <span className="text-2xl">{viewDiurnal ? '&#x1F319;' : '&#x2600;&#xFE0F;'}</span>
              <span>Switch to {viewDiurnal ? 'Night' : 'Day'} Mode</span>
            </button>
          </div>
        </div>

        {/* Global Alchemical Shift Summary */}
        <div className={`mb-8 p-6 rounded-3xl transition-all duration-700 ${
          viewDiurnal ? 'bg-white shadow-sm border border-slate-200' : 'bg-slate-800/50 border border-slate-700 backdrop-blur-sm'
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${viewDiurnal ? 'text-slate-800' : 'text-white'}`}>Aggregate Alchemical Shift</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(currentAlchemical).map(([key, rawValue]) => {
              // Extract numeric value from the proxy/getter if needed
              const value = typeof rawValue === 'number' ? rawValue : 0;
              return (
              <div key={key} className={`p-4 rounded-2xl ${
                viewDiurnal ? 'bg-slate-50 border border-slate-100' : 'bg-slate-900/50 border border-slate-800'
              }`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  viewDiurnal ? 'text-slate-400' : 'text-slate-500'
                }`}>{key}</div>
                <div className={`text-3xl font-black ${
                  viewDiurnal ? 'text-slate-800' : 'text-white'
                }`}>
                  {value.toFixed(1)}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Planetary Breakdown Grid */}
        <h2 className={`text-2xl font-black mb-6 mt-12 ${viewDiurnal ? 'text-slate-800' : 'text-white'}`}>Planetary State Details</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const).map((planet) => {
            const sectEl = PLANETARY_SECTARIAN_ELEMENTS[planet];
            const sectEsms = PLANETARY_SECTARIAN_ESMS[planet];
            const currentEl = viewDiurnal ? sectEl.diurnal : sectEl.nocturnal;
            const currentEsms = viewDiurnal ? sectEsms.diurnal : sectEsms.nocturnal;
            
            const dominantESMS = getHighestESMS(currentEsms);
            
            // Generate visual highlight if the current state is different from the opposite sect
            const oppositeEl = viewDiurnal ? sectEl.nocturnal : sectEl.diurnal;
            const elementShifted = currentEl !== oppositeEl;

            return (
              <div key={planet} className={`p-5 rounded-2xl transition-all duration-700 flex flex-col justify-between ${
                viewDiurnal ? 'bg-white shadow-sm border border-slate-200' : 'bg-slate-800/80 border border-slate-700'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-bold ${viewDiurnal ? 'text-slate-800' : 'text-white'}`}>{planet}</h3>
                  {elementShifted && (
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                      viewDiurnal ? 'bg-amber-100 text-amber-700' : 'bg-indigo-900 text-indigo-300'
                    }`}>Shifts State</span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${viewDiurnal ? 'text-slate-500' : 'text-slate-400'}`}>Element</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg ${
                      currentEl === 'Fire' ? 'bg-red-100 text-red-700' : 
                      currentEl === 'Water' ? 'bg-blue-100 text-blue-700' : 
                      currentEl === 'Air' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-green-100 text-green-700'
                    }`}>{currentEl}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${viewDiurnal ? 'text-slate-500' : 'text-slate-400'}`}>Alchemical Focus</span>
                    <span className={`text-sm font-bold ${viewDiurnal ? 'text-slate-700' : 'text-slate-200'}`}>{dominantESMS}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
