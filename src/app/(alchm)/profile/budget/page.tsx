'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function BudgetPage() {
  const [budgetVal, setBudgetVal] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const val = localStorage.getItem('weeklyBudget');
    if (val) setBudgetVal(val);
  }, []);

  const handleSave = () => {
    const parsed = parseFloat(budgetVal);
    if (!isNaN(parsed) && parsed > 0) {
      localStorage.setItem('weeklyBudget', parsed.toString());
    } else {
      localStorage.removeItem('weeklyBudget');
      setBudgetVal('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentBudget = parseFloat(budgetVal);
  const perMeal = !isNaN(currentBudget) && currentBudget > 0 ? (currentBudget / 21).toFixed(2) : null;

  return (
    <div className="min-h-screen bg-[#08080e] text-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/profile" className="text-white/60 hover:text-white transition-colors font-medium mb-6 inline-flex items-center gap-1 group">
          <span className="text-xl group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Dashboard
        </Link>
        
        <div className="glass-card-premium rounded-3xl p-8 md:p-12 border border-white/8 flex flex-col items-center mt-4">
          <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
            &#x1F4B0;
          </div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Weekly Grocery Budget</h1>
          <p className="text-base text-white/60 mb-10 text-center max-w-md leading-relaxed">
            Set your weekly grocery limits to receive cost-effective recipe recommendations tailored to your astrological alignment.
          </p>

          <div className="w-full max-w-sm space-y-6">
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 font-bold text-lg">$</span>
              <input
                type="number"
                min="0"
                max="2000"
                value={budgetVal}
                onChange={(e) => setBudgetVal(e.target.value)}
                className="w-full pl-10 pr-5 py-4 glass-card-premium border border-white/8 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-white text-lg outline-none placeholder:font-medium placeholder:text-white/60"
                placeholder="e.g. 150 (Leave blank for none)"
              />
            </div>

            {perMeal && (
              <div className="text-center bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/50">
                <span className="text-xs text-emerald-700/80 font-bold block uppercase tracking-wider mb-2">Estimated Base Meal Cost</span>
                <span className="text-3xl font-black text-emerald-600">${perMeal}</span>
                <span className="text-xs font-medium text-emerald-600/70 block mt-2">Based on 21 meals per week</span>
              </div>
            )}

            <button
              onClick={handleSave}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2 ${
                saved 
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                  : 'bg-[#08080e] border border-white/10 text-white hover:bg-white/5 shadow-black/20 shadow-xl'
              }`}
            >
              {saved ? '&#x2713; Saved Successfully!' : 'Save Budget Preference'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
