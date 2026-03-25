'use client';

import React from 'react';
import { canAccess, type UserTier, type PremiumFeature } from '@/lib/tiers';

interface FeatureGateProps {
  tier: UserTier;
  feature: PremiumFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultFallback({ feature }: { feature: string }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-purple-200 bg-purple-50/50 p-6 text-center">
      <svg className="w-8 h-8 text-purple-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <p className="text-sm text-purple-600 font-medium">Premium Feature</p>
      <p className="text-xs text-gray-500 mt-1">Upgrade to unlock this feature.</p>
    </div>
  );
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ tier, feature, children, fallback }) => {
  if (canAccess(tier, feature)) {
    return <>{children}</>;
  }
  return <>{fallback || <DefaultFallback feature={feature} />}</>;
};
