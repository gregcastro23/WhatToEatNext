'use client';

import Link from 'next/link';
import React from 'react';
import { FoodPreferences } from '@/components/profile/FoodPreferences';
import { useProfile } from '@/hooks/useProfile';

export default function PreferencesPage() {
  const { preferences, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading your culinary profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <Link href="/profile" className="text-emerald-600 hover:text-emerald-800 transition-colors font-medium mb-6 inline-flex items-center gap-1 group">
        <span className="text-xl group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
      </Link>

      <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 rounded-3xl shadow-xl border border-emerald-500/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 blur-xl pointer-events-none">
          <div className="w-64 h-64 bg-white rounded-full" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">Culinary Mechanics</h1>
        <p className="text-emerald-100 max-w-2xl text-lg leading-relaxed">
          Refine your dietary foundations and food preferences. Your alchemical recommendations will be filtered through these constraints.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-gray-100">
        <FoodPreferences
          preferences={preferences}
          onSave={(newPrefs) => {
            // In a real app we'd save to the backend here
            if (typeof window !== 'undefined') {
              localStorage.setItem('userFoodPreferences', JSON.stringify(newPrefs));
            }
          }}
        />
      </div>
    </div>
  );
}
