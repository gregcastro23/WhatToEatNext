/**
 * Entitlement & Access Model
 *
 * All Alchm.kitchen features are available to registered account holders
 * using ESMS Token Pay-As-You-Go.
 *
 * @file src/lib/tiers.ts
 */

export type UserTier = 'visitor' | 'holder' | 'free' | 'premium';

export const TIER_FEATURES = {
  visitor: [
    'alchemicalConstitution',
    'elementalBalance',
    'basicBirthChart',
  ] as const,
  holder: [
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
    'dailyInsights',
  ] as const,
  // Backward-compatibility maps
  free: [
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
    'dailyInsights',
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
    'dailyInsights',
  ] as const,
};

export type PremiumFeature = (typeof TIER_FEATURES.holder)[number];

const VISITOR_SET = new Set<string>(TIER_FEATURES.visitor);

/**
 * Checks if a user has access to a feature.
 * In the ESMS Token Economy, all registered account holders have access to all features.
 */
export function canAccess(tier: UserTier | string | null | undefined, feature: PremiumFeature): boolean {
  if (!tier || tier === 'visitor') {
    return VISITOR_SET.has(feature);
  }
  return true;
}

export const PREMIUM_FEATURES_DISPLAY: Array<{ feature: PremiumFeature; label: string; description: string }> = [
  { feature: 'instacartSync', label: 'Instacart Sync', description: 'Auto-add recipe ingredients to your Instacart cart' },
  { feature: 'groupMenuPlanning', label: 'Group Menu Planning', description: 'Plan meals for your entire dining group with cosmic harmony' },
  { feature: 'advancedTransits', label: 'Advanced Transits', description: '7-day transit forecasts with dietary impact analysis' },
  { feature: 'unlimitedCompanions', label: 'Unlimited Companions', description: 'Add unlimited dining companions for dinner party synastry' },
  { feature: 'planetaryRemedies', label: 'Planetary Remedies', description: 'Personalized food remedies based on current sky transits' },
  { feature: 'dailyInsights', label: 'Daily Cosmic Insights', description: 'Personalized daily insight comparing your birth chart to current transits' },
];
