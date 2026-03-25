/**
 * Tier system for user subscriptions.
 * Gates premium features behind subscription.
 */

export type UserTier = 'free' | 'premium';

export const TIER_FEATURES = {
  free: [
    'alchemicalConstitution',
    'elementalBalance',
    'basicBirthChart',
    'addManualCompanions',
    'labBook',
  ] as const,
  premium: [
    'alchemicalConstitution',
    'elementalBalance',
    'basicBirthChart',
    'addManualCompanions',
    'labBook',
    'instacartSync',
    'groupMenuPlanning',
    'advancedTransits',
    'unlimitedCompanions',
    'planetaryRemedies',
  ] as const,
};

export type PremiumFeature = (typeof TIER_FEATURES.premium)[number];

const FREE_SET = new Set<string>(TIER_FEATURES.free);

export function canAccess(tier: UserTier, feature: PremiumFeature): boolean {
  if (tier === 'premium') return true;
  return FREE_SET.has(feature);
}

export const PREMIUM_FEATURES_DISPLAY: Array<{ feature: PremiumFeature; label: string; description: string }> = [
  { feature: 'instacartSync', label: 'Instacart Sync', description: 'Auto-add recipe ingredients to your Instacart cart' },
  { feature: 'groupMenuPlanning', label: 'Group Menu Planning', description: 'Plan meals for your entire dining group with cosmic harmony' },
  { feature: 'advancedTransits', label: 'Advanced Transits', description: '7-day transit forecasts with dietary impact analysis' },
  { feature: 'unlimitedCompanions', label: 'Unlimited Companions', description: 'Add unlimited dining companions (free tier: 3)' },
  { feature: 'planetaryRemedies', label: 'Planetary Remedies', description: 'Personalized food remedies based on challenging transits' },
];
