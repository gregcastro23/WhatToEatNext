'use client';

import React from 'react';
import { PREMIUM_FEATURES_DISPLAY } from '@/lib/tiers';

export const TierUpgradePrompt: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-orange-50 p-6">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-200/40 to-transparent rounded-bl-full" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">&#x2728;</span>
          <h3 className="text-base font-bold text-gray-800">Unlock Premium</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Elevate your cosmic culinary journey with advanced features.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
          {PREMIUM_FEATURES_DISPLAY.map((feat) => (
            <div key={feat.feature} className="flex items-start gap-2 p-2">
              <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <span className="text-sm font-medium text-gray-800">{feat.label}</span>
                <p className="text-xs text-gray-500 mt-0.5">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
          onClick={() => {
            // TODO: integrate with Stripe checkout
          }}
        >
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
};
