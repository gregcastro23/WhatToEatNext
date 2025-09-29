/**
 * Astrological Recommendations Page
 * Phase 5: Frontend Integration - Astrological Cooking Guide
 */

import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Lazy load the astrological component for better performance
const AstrologicalRecommendations = dynamic(
  () => import('@/components/astrological/AstrologicalRecommendations'),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Consulting the stars...</p>
        </div>
      </div>
    ),
    ssr: false // Disable SSR for this component to avoid hydration issues
  }
);

export const metadata: Metadata = {
  title: 'Astrological Cooking Guide | alchm.kitchen',
  description: 'Discover recipes aligned with your zodiac energy and seasonal harmony. Personalized culinary recommendations based on planetary influences.'
};

export default function AstrologicalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <AstrologicalRecommendations />
    </div>
  );
}
