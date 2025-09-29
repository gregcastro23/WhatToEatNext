/**
 * Cuisines Recommendations Page
 * Phase 6: Complete Current Moment Cuisine Integration
 */

import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Lazy load the cuisine component for better performance
const CurrentMomentCuisineRecommendations = dynamic(
  () => import('@/components/cuisines/CurrentMomentCuisineRecommendations'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Analyzing cosmic culinary influences...</p>
          <p className="text-sm text-gray-500 mt-2">Calculating astrological cuisine compatibility</p>
        </div>
      </div>
    ),
    ssr: false // Disable SSR for this component to avoid hydration issues
  }
);

export const metadata: Metadata = {
  title: 'Current Moment Cuisine Guide | alchm.kitchen',
  description: 'Discover cuisines perfectly aligned with your current astrological moment. Get personalized recipe recommendations with nested dishes and sauce pairings based on zodiac and seasonal energies.'
};

export default function CuisinesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <CurrentMomentCuisineRecommendations />
    </div>
  );
}
