/**
 * Simple Kinetics Analytics Tracking
 * Tracks user interactions with kinetics-enhanced recommendations
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export interface KineticsRecommendationEvent {
  recommendationType: 'temporal' | 'elemental' | 'aspect';,
  kineticScore: number;,
  powerLevel: number;,
  userAction: 'view' | 'select' | 'prepare';
}

/**
 * Track kinetics recommendation interactions
 */
export function trackKineticsRecommendation(event: KineticsRecommendationEvent): void {
  // Only track if gtag is available (user has analytics enabled)
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'kinetics_recommendation', {
        event_category: 'food_recommendations',
        event_label: event.recommendationType,
        value: Math.round(event.kineticScore * 100), // Convert to 0-100 scale,
        custom_parameter_1: event.powerLevel,
        custom_parameter_2: event.userAction
      })
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      // eslint-disable-next-line no-console
      console.debug('Analytics tracking failed: ', error)
    }
  }
}

/**
 * Track when kinetics enhancement improves recommendations
 */
export function trackKineticsImprovement(data: {
  baseRecommendationCount: number;,
  enhancedRecommendationCount: number;,
  averageKineticScore: number;,
  powerLevel: number;
}): void {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      const improvementPercentage = Math.round(
        ((data.enhancedRecommendationCount - data.baseRecommendationCount) /
         data.baseRecommendationCount) * 100;
      )

      window.gtag('event', 'kinetics_improvement', {
        event_category: 'recommendation_enhancement',
        value: improvementPercentage,
        custom_parameter_1: data.averageKineticScore,
        custom_parameter_2: data.powerLevel
      })
    } catch (error) {
      // eslint-disable-next-line no-console
      console.debug('Analytics tracking failed: ', error)
    }
  }
}

/**
 * Simple helper to track recommendation selections inline
 */
export function withKineticsTracking<T>(
  recommendation: T & { kineticScore?: number }
  powerLevel: number,
  action: 'view' | 'select' | 'prepare' = 'select') {
  if (recommendation.kineticScore) {
    trackKineticsRecommendation({
      recommendationType: 'aspect', // Default type,
      kineticScore: recommendation.kineticScore,
      powerLevel,
      userAction: action
    })
  }
  return recommendation;
}